"""End-to-end HTTP tests against a private temporary store; no third-party libraries."""
import http.cookiejar, json, os, socket, subprocess, tempfile, time, urllib.request, urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
java=Path(os.environ['JAVA_HOME'])/'bin'/('java.exe' if os.name=='nt' else 'java') if os.environ.get('JAVA_HOME') else 'java'
with socket.socket() as sock:
    sock.bind(('127.0.0.1',0)); port=sock.getsockname()[1]
base=f'http://127.0.0.1:{port}'
checks=[]
def check(condition,name):
    assert condition,name
    checks.append(name)
    print('PASS',name,flush=True)

class Client:
    def __init__(self):
        self.jar=http.cookiejar.CookieJar(); self.http=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar)); self.csrf=''
    def request(self,path,method='GET',body=None,status=200,csrf=True):
        headers={'Content-Type':'application/json'}
        if csrf: headers['X-CSRF-Token']=self.csrf
        req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else (b'{}' if method!='GET' else None),headers=headers,method=method)
        try: response=self.http.open(req,timeout=30)
        except urllib.error.HTTPError as e: response=e
        raw=response.read().decode('utf-8')
        assert response.status==status,(path,method,response.status,status,raw[:300])
        return json.loads(raw) if 'application/json' in response.headers.get('Content-Type','') else raw
    def session(self): self.csrf=self.request('/api/session')['csrf']
    def login(self,email,password):
        self.session(); result=self.request('/api/login','POST',{'email':email,'password':password}); self.csrf=result['csrf']; return result

with tempfile.TemporaryDirectory(prefix='bookbloom-http-') as temp:
    logfile=Path(temp)/'server.log'
    def start():
        output=logfile.open('a',encoding='utf-8')
        proc=subprocess.Popen([str(java),'-jar',str(ROOT/'target/book-and-bloom.war'),f'--server.port={port}',f'--bookbloom.data-dir={temp}/data'],cwd=ROOT,stdout=output,stderr=subprocess.STDOUT)
        for _ in range(120):
            try:
                with urllib.request.urlopen(base+'/api/books',timeout=2) as r:
                    if len(json.load(r))==12:return proc,output
            except Exception: pass
            if proc.poll() is not None: raise RuntimeError(logfile.read_text())
            time.sleep(.5)
        proc.terminate();proc.wait();output.close();raise RuntimeError('Startup timed out: '+logfile.read_text())
    proc,output=start()
    try:
        public=Client();public.session()
        for path in ['/','/catalog','/book?id=BK-001','/cart','/login','/register','/account','/orders','/admin']:
            html=public.request(path);check('data-page=' in html and 'Â©' not in html,'JSP renders UTF-8: '+path)
        check('function' in public.request('/js/app.js'),'JavaScript asset served')
        public.request('/api/books/BK-001','DELETE',status=403,csrf=False);check(True,'CSRF blocks missing token')
        public.request('/api/users',status=401);check(True,'Anonymous user list denied')
        public.request('/api/login','POST',{'email':'reader@bookbloom.lk','password':'wrong'},status=401);check(True,'Invalid credentials rejected')
        reader=Client();login=reader.login('reader@bookbloom.lk','BloomReader!2026');check('passwordHash' not in login['user'],'Login returns safe profile')
        reader.request('/api/books/BK-001','DELETE',status=403);check(True,'Customer cannot delete books')
        order=reader.request('/api/orders','POST',{'items':[{'bookId':'BK-001','quantity':2}],'address':'24 Flower Road, Colombo','total':1},status=201)
        check(float(order['total'])==4050,'Checkout ignores client total')
        check(public.request('/api/books/BK-001')['stock']==10,'Checkout reserves stock')
        other=Client();other.session();other.request('/api/register','POST',{'name':'Smoke Reader','email':'smoke@example.com','password':'SmokePass123'},status=201);other.login('smoke@example.com','SmokePass123')
        other.request('/api/orders/'+order['id'],'PUT',{'status':'CANCELLED'},status=403);check(True,'Order ownership enforced')
        review=reader.request('/api/reviews','POST',{'bookId':'BK-001','rating':5,'comment':'A thoughtful little book.'},status=201)
        reader.request('/api/reviews/'+review['id'],'PUT',{'rating':4,'comment':'An updated thoughtful review.'});check(True,'Review create and update')
        admin=Client();admin.login('admin@bookbloom.lk','BloomAdmin!2026')
        cat=admin.request('/api/categories','POST',{'name':'Smoke Poetry','description':'A test shelf for poems.'},status=201)
        admin.request('/api/categories/'+cat['id'],'PUT',{'name':'Updated Poetry','description':'An updated shelf of poems.'});admin.request('/api/categories/'+cat['id'],'DELETE');check(True,'Category HTTP CRUD')
        author=admin.request('/api/authors','POST',{'name':'Smoke Author','bio':'A fictional author for testing.'},status=201)
        admin.request('/api/authors/'+author['id'],'PUT',{'name':'Updated Author','bio':'An updated fictional biography.'});admin.request('/api/authors/'+author['id'],'DELETE');check(True,'Author HTTP CRUD')
        book=public.request('/api/books/BK-001');book['isbn']='SMOKE-ISBN';book['title']='Smoke Book'
        created=admin.request('/api/books','POST',book,status=201);created['title']='Updated Smoke Book';admin.request('/api/books/'+created['id'],'PUT',created);admin.request('/api/books/'+created['id'],'DELETE');check(True,'Book HTTP CRUD')
        reader.request('/api/orders/'+order['id'],'PUT',{'status':'CANCELLED'});check(public.request('/api/books/BK-001')['stock']==12,'Cancellation restores stock')
        reader.request('/api/orders/'+order['id'],'PUT',{'status':'CANCELLED'},status=400);check(True,'Repeated cancellation rejected')
        reader.request('/api/orders/'+order['id'],'DELETE');admin.request('/api/reviews/'+review['id'],'DELETE');check(True,'Cancelled-order deletion and review moderation')
        profile=other.request('/api/session')['user'];profile['name']='Updated Smoke Reader';other.request('/api/users/'+profile['id'],'PUT',profile);other.request('/api/users/'+profile['id'],'DELETE');check(True,'Customer profile update and delete')
        persistent=reader.request('/api/orders','POST',{'items':[{'bookId':'BK-005','quantity':1}],'address':''},status=201)
        admin.request('/api/orders/'+persistent['id'],'PUT',{'status':'PROCESSING'});admin.request('/api/orders/'+persistent['id'],'PUT',{'status':'COMPLETED'});check(True,'Admin processing and completion')
        reader.request('/api/logout','POST');reader.request('/api/orders',status=401);check(True,'Logout invalidates authorization')
        proc.terminate();proc.wait(timeout=30);output.close();proc,output=start()
        again=Client();again.login('reader@bookbloom.lk','BloomReader!2026');check(any(o['id']==persistent['id'] and o['status']=='COMPLETED' for o in again.request('/api/orders')),'Completed order survives real server restart')
        check(again.request('/api/books/BK-005')['stock']==23,'Stock survives real server restart')
        print(f'\n{len(checks)} HTTP checks passed.',flush=True)
    finally:
        if proc.poll() is None:proc.terminate();proc.wait(timeout=30)
        output.close()
