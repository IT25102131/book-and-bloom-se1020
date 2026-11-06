"""One-time scaffold helper. Generated Java sources are the maintained deliverables."""
from pathlib import Path

root = Path('src/main/java/lk/bookbloom/model')
root.mkdir(parents=True, exist_ok=True)

def model(name, fields, extra='', parent='', abstract=False, annotations='', imports=''):
    code = 'package lk.bookbloom.model;\n\nimport java.util.*;\nimport java.math.BigDecimal;\n' + imports + '\n'
    code += annotations + '\npublic ' + ('abstract ' if abstract else '') + 'class ' + name + (' extends ' + parent if parent else '') + ' {\n'
    for typ, field, default in fields:
        code += f'    private {typ} {field}' + (' = ' + default if default else '') + ';\n'
    code += '\n'
    for typ, field, _ in fields:
        cap = field[0].upper() + field[1:]
        code += f'    public {typ} get{cap}() {{ return {field}; }}\n'
        code += f'    public void set{cap}({typ} {field}) {{ this.{field} = {field}; }}\n'
    code += extra + '\n}\n'
    (root / (name + '.java')).write_text(code, encoding='utf-8')

poly = 'import com.fasterxml.jackson.annotation.*;\n'
model('Book', [('String','id',''),('String','title',''),('String','authorId',''),('String','categoryId',''),('String','isbn',''),('BigDecimal','price',''),('int','stock',''),('String','description',''),('String','coverColor',''),('boolean','featured','false')],
    '    public abstract String fulfillment();\n    public abstract boolean requiresShipping();', abstract=True, imports=poly,
    annotations='@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")\n@JsonSubTypes({@JsonSubTypes.Type(value=PrintedBook.class,name="PRINTED"),@JsonSubTypes.Type(value=EBook.class,name="EBOOK")})')
model('PrintedBook', [('int','pages','240')], '    @Override public String fulfillment() { return "Delivered to your address"; }\n    @Override public boolean requiresShipping() { return true; }', parent='Book')
model('EBook', [('String','fileFormat','"PDF"')], '    @Override public String fulfillment() { return "Digital edition; demo order only"; }\n    @Override public boolean requiresShipping() { return false; }', parent='Book')
model('User', [('String','id',''),('String','name',''),('String','email',''),('String','passwordHash',''),('String','address','""'),('String','createdAt','')],
    '    public abstract boolean canManageCatalog();\n    public abstract String role();\n    public Map<String,Object> publicProfile() {\n        return Map.of("id",id,"name",name,"email",email,"address",address,"role",role(),"createdAt",createdAt);\n    }', abstract=True, imports=poly,
    annotations='@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "kind")\n@JsonSubTypes({@JsonSubTypes.Type(value=AdminUser.class,name="ADMIN"),@JsonSubTypes.Type(value=Customer.class,name="CUSTOMER")})')
model('AdminUser', [], '    @Override public boolean canManageCatalog() { return true; }\n    @Override public String role() { return "ADMIN"; }', parent='User')
model('Customer', [], '    @Override public boolean canManageCatalog() { return false; }\n    @Override public String role() { return "CUSTOMER"; }', parent='User')
model('Author', [('String','id',''),('String','name',''),('String','bio','')])
model('Category', [('String','id',''),('String','name',''),('String','description','')])
model('Review', [('String','id',''),('String','userId',''),('String','bookId',''),('int','rating',''),('String','comment',''),('String','createdAt','')])
model('OrderLine', [('String','bookId',''),('String','title',''),('BigDecimal','unitPrice',''),('int','quantity',''),('boolean','shipping','')])
model('Order', [('String','id',''),('String','userId',''),('List<OrderLine>','lines','new ArrayList<>()'),('BigDecimal','subtotal',''),('BigDecimal','deliveryFee',''),('BigDecimal','total',''),('String','status','"PLACED"'),('String','address',''),('String','createdAt','')])
model('StoreState', [('int','schemaVersion','1'),('List<Book>','books','new ArrayList<>()'),('List<User>','users','new ArrayList<>()'),('List<Author>','authors','new ArrayList<>()'),('List<Category>','categories','new ArrayList<>()'),('List<Order>','orders','new ArrayList<>()'),('List<Review>','reviews','new ArrayList<>()')])
