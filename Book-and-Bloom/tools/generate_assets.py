from pathlib import Path
import json, html

resources=Path('src/main/resources')
static=resources/'static'
(static/'images').mkdir(parents=True,exist_ok=True)
authors=[('AUT-1','Maya Senanayake','A Colombo-based storyteller exploring belonging, family and the everyday magic of island life.'),('AUT-2','Elliot Reed','An essayist writing about attention, creativity and a gentler approach to meaningful work.'),('AUT-3','Arun Fernando','A naturalist and writer documenting the landscapes and quiet corners of Sri Lanka.'),('AUT-4','Clara Bennett','A novelist fascinated by old houses, hidden histories and unexpected friendships.'),('AUT-5','Samira Khan','A designer and educator who makes technology and creative practice approachable.'),('AUT-6','Oliver Hayes','A travel writer following slow journeys, good food and the stories between destinations.')]
categories=[('CAT-1','Fiction','Lose yourself in a different world.'),('CAT-2','Personal Growth','Small steps. Fresh perspectives.'),('CAT-3','Nature & Travel','Stories for the curious explorer.'),('CAT-4','Design & Technology','Ideas to make something wonderful.')]
books=[
('BK-001','The Art of Slowing Down','AUT-2','CAT-2','1850.00','#e7b471',True,'PRINTED','A thoughtful companion for finding room to breathe. Through small rituals and considered reflections, discover how a slower pace can make life feel richer.',224),
('BK-002','Where the Light Falls','AUT-1','CAT-1','2400.00','#2e514e',True,'PRINTED','When a letter arrives at an old Colombo house, three generations revisit a story they thought was finished. A warm novel of home, memory and second chances.',312),
('BK-003','Wild Ceylon','AUT-3','CAT-3','3200.00','#9fa878',True,'PRINTED','From misty highlands to sunlit coastlines, explore the island through the eyes of a naturalist. An illustrated journey into remarkable places and the life they hold.',280),
('BK-004','A Little More Wonder','AUT-4','CAT-1','1950.00','#b77966',True,'PRINTED','A bookseller inherits a box of unfinished letters and begins a journey across her city. A charming story about curiosity, kindness and finding your people.',256),
('BK-005','Make Room for Ideas','AUT-5','CAT-4','1650.00','#587e98',False,'EBOOK','A practical guide to creative work, from the first untidy thought to the finished thing. Friendly exercises help you build a sustainable creative practice.',180),
('BK-006','The Long Way Home','AUT-6','CAT-3','2750.00','#ba934e',False,'PRINTED','Choose the scenic route. Follow unhurried train rides and winding coastal roads in this collection of travel essays about the joy of paying attention.',296),
('BK-007','The Quiet Garden','AUT-4','CAT-1','2100.00','#8c9b7a',False,'PRINTED','Behind a locked gate, a forgotten garden brings unlikely neighbours together. A gentle novel about new beginnings and the things we choose to grow.',304),
('BK-008','Everyday Courage','AUT-2','CAT-2','1450.00','#c88870',False,'EBOOK','Courage is often a collection of small choices. These grounded reflections invite you to begin before you feel ready and make space for a more intentional life.',192),
('BK-009','Designing with Purpose','AUT-5','CAT-4','3600.00','#363f56',False,'PRINTED','A clear introduction to thoughtful design. Learn to ask better questions, understand people and turn complex problems into useful, approachable experiences.',340),
('BK-010','Letters from Galle','AUT-1','CAT-1','2250.00','#d6aa72',False,'PRINTED','Two strangers exchange letters from opposite sides of an old fort. A lyrical story of friendship, discovery and the places that stay with us.',288),
('BK-011','Beyond the Tea Hills','AUT-3','CAT-3','2900.00','#608c82',False,'PRINTED','Walk the paths beyond the familiar viewpoints and meet the people who call the hills home. Nature writing and travel notes come together in this island journey.',268),
('BK-012','Begin Again','AUT-2','CAT-2','1750.00','#a59bb3',False,'PRINTED','A fresh start can be smaller than you think. Thoughtful prompts and short essays help you reconnect with what matters and build habits that leave room for living.',208)]
state={'schemaVersion':1,'users':[],'authors':[dict(zip(['id','name','bio'],a)) for a in authors],'categories':[dict(zip(['id','name','description'],c)) for c in categories],'orders':[],'reviews':[],'books':[]}
for i,b in enumerate(books):
 id,title,aid,cid,price,color,featured,typ,desc,pages=b
 book=dict(id=id,title=title,authorId=aid,categoryId=cid,isbn=f'978-955-100-{i+1:03d}',price=price,stock=12+i*3,description=desc,coverColor=color,featured=featured,type=typ)
 book['pages' if typ=='PRINTED' else 'fileFormat']=pages if typ=='PRINTED' else 'EPUB'
 state['books'].append(book)
(resources/'sample-data').mkdir(parents=True,exist_ok=True)
(resources/'sample-data/bookstore.txt').write_text(json.dumps(state,indent=2),encoding='utf-8')
# Original vector artwork, entirely local and usable without a network connection.
(static/'images/botanical.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380"><g fill="none" stroke="#64816f" stroke-width="2"><path d="M151 360 Q115 220 178 34 M150 300Q76 261 69 203 M146 237Q227 202 242 133 M151 174Q97 138 101 93"/><path d="M70 207Q17 167 39 134Q84 151 70 207M91 239Q36 220 39 183Q79 186 91 239M151 300Q215 285 212 247Q167 251 151 300M148 239Q186 178 213 182Q217 225 148 239M102 95Q67 54 91 33Q122 58 102 95M161 131Q219 116 218 76Q173 83 161 131M174 58Q147 26 170 7Q192 24 174 58M241 135Q265 93 282 108Q286 136 241 135" fill="#7c9375" fill-opacity=".25"/></g></svg>''',encoding='utf-8')
views=Path('src/main/webapp/WEB-INF/views'); views.mkdir(parents=True,exist_ok=True)
for page in ['home','catalog','book','cart','login','register','account','orders','admin']:
 (views/(page+'.jsp')).write_text('<%@ page contentType="text/html;charset=UTF-8" %>\n<% request.setAttribute("pageName", "'+page+'"); %>\n<%@ include file="shell.jspf" %>\n',encoding='utf-8')
