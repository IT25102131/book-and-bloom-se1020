from pathlib import Path
from html import escape

parts=['''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1120" viewBox="0 0 1200 1120"><defs><marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto"><path d="M1 1L11 6 1 11Z" fill="#fbfaf6" stroke="#526953"/></marker></defs><rect width="1200" height="1120" fill="#fbfaf6"/><style>text{font-family:Arial,sans-serif;fill:#293f34}.title{font-size:28px;font-weight:600}.subtitle{font-size:13px;fill:#71816a}.name{font-size:17px;font-weight:600}.field{font-size:12px}.label{font-size:11px;fill:#667c5d}</style><text x="50" y="48" class="title">Book &amp; Bloom · Class architecture</text><text x="50" y="74" class="subtitle">SE1020 | inheritance, associations, composition and repository abstraction</text>''']
def box(x,y,w,name,lines,kind=''):
    h=65+len(lines)*20
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="white" stroke="#bcc8b0"/><path d="M{x} {y+48}h{w}" stroke="#bcc8b0"/><text x="{x+15}" y="{y+21}" class="label">{escape(kind)}</text><text x="{x+15}" y="{y+40}" class="name">{escape(name)}</text>')
    for i,line in enumerate(lines):parts.append(f'<text x="{x+15}" y="{y+70+i*20}" class="field">{escape(line)}</text>')
def line(x1,y1,x2,y2,label='',arrow=False,dashed=False):
    parts.append(f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="#718569" stroke-width="1.5"'+(' marker-end="url(#arrow)"' if arrow else '')+(' stroke-dasharray="5 4"' if dashed else '')+'/>')
    if label:parts.append(f'<text x="{(x1+x2)/2+8}" y="{(y1+y2)/2-7}" class="label">{escape(label)}</text>')
box(65,115,275,'Book',['- id, title, authorId, categoryId','- price: BigDecimal, stock: int','+ requiresShipping(): boolean','+ fulfillment(): String'],'abstract')
box(65,325,130,'PrintedBook',['- pages: int','+ requiresShipping()'],'extends Book')
box(215,325,125,'EBook',['- fileFormat','+ requiresShipping()'],'extends Book')
line(130,325,170,260,arrow=True);line(275,325,230,260,arrow=True)
box(425,115,220,'Author',['- id, name, bio'],'entity')
box(425,265,220,'Category',['- id, name, description'],'entity')
line(340,165,425,165,'0..* : 1');line(340,235,425,303,'0..* : 1')
box(760,115,350,'User',['- id, name, email, passwordHash, address','+ canManageCatalog(): boolean','+ role(): String','+ publicProfile(): Map'],'abstract')
box(760,325,160,'Customer',['+ canManageCatalog()','  returns false'],'extends User')
box(950,325,160,'AdminUser',['+ canManageCatalog()','  returns true'],'extends User')
line(840,325,890,260,arrow=True);line(1025,325,985,260,arrow=True)
box(65,500,275,'Order',['- id, userId, status, address','- subtotal, deliveryFee, total','- lines: List<OrderLine>'],'entity')
box(425,500,260,'OrderLine',['- bookId, title, unitPrice','- quantity, shipping'],'value snapshot')
line(340,548,425,548,'1 : 1..*')
box(760,500,350,'Review',['- id, userId, bookId','- rating: int, comment: String'],'entity')
parts.append('<text x="65" y="675" class="subtitle">User 1 → many Orders / Reviews · Book 1 → many Reviews · Order owns its OrderLines (composition).</text>')
box(65,735,275,'ApiServlet',['+ service(request, response)','Session, CSRF and JSON boundary'],'extends HttpServlet')
box(425,735,310,'Six CRUD services',['UserService · BookService','AuthorService · CategoryService','OrderService · ReviewService'],'business rules')
line(340,792,425,792,'delegates')
box(830,735,280,'StoreRepository',['+ snapshot(): StoreState','+ transaction(Function): T'],'interface')
line(735,792,830,792,'uses')
box(830,930,280,'FileStoreRepository',['- file, processLock, state','Atomic UTF-8 text persistence'],'implements StoreRepository')
line(970,930,970,840,arrow=True,dashed=True)
box(425,930,310,'StoreState',['Six collections + schemaVersion','Stored in data/bookstore.txt'],'aggregate snapshot')
line(830,990,735,990,'stores')
parts.append('<text x="65" y="1078" class="subtitle">All persisted fields are private. Routine accessors omitted. ID-based associations avoid cyclic serialization.</text></svg>')
Path('docs/class-diagram.svg').write_text(''.join(parts),encoding='utf-8')
