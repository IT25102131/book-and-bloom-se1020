# Viva guide - Sinhala / English

## Start the demo

1. `start-bookstore.cmd` run කරන්න. Browser එකේ `http://127.0.0.1:8080` open කරන්න.
2. Home → Browse books → search/filter → book details පෙන්වන්න.
3. Reader demo account එකෙන් login වෙලා book එක bag එකට දාලා order එකක් place කරන්න.
4. Orders page එකෙන් cancel කරන්න. Stock එක නැවත එකතු වෙනවා පෙන්වන්න.
5. Admin account එකෙන් login වෙලා තමන්ගේ assigned module එකේ Create → Read → Update → Delete පෙන්වන්න.
6. `data/bookstore.txt` Notepad එකෙන් කියවලා data save වී ඇති බව පෙන්වන්න. Running server එකේ file manually edit කරන්න එපා.
7. Server stop/restart කරලා data නැවත load වෙනවා පෙන්වන්න.
8. තමන්ගේ genuine GitHub commits / PR history පෙන්වන්න.

## හැම member කෙනෙක්ම explain කරන්න ඕන flow එක

**UI event → fetch request → ApiServlet / assigned \*Controller → assigned service → StoreRepository → FileStoreRepository → bookstore.txt → JSON response → UI.**

## Common questions

**Why Spring Boot and Servlet both?**  
Spring Boot එක server startup, configuration සහ dependency injection පහසු කරනවා. `ApiServlet` කියන්නේ abstract `HttpServlet` base class එකක් වන අතර `UserController`, `BookController`, `OrderController`, `AuthorController`, `CategoryController`, `ReviewController` එය extend කරනවා. `WebConfiguration` එකෙන් `/api/...` routes 6 ම register කරනවා. JSP pages `PageController` එකෙන් resolve වෙනවා.

**Why WAR, not JAR?**  
මේ project එක JSP භාවිතා කරන නිසා executable WAR packaging තෝරාගෙන තියෙනවා. `java -jar ...war` කියන command එකෙන්ම run කරන්න පුළුවන්.

**Where is encapsulation?**  
`Book`, `User`, `Order` වගේ model classes වල fields private. Getters/setters හරහා access කරනවා. Validation service layer එකේ තියෙනවා. Private fields තියෙනවා කියලා පමණක් data automatically valid වෙන්නේ නැහැ; ඒකයි service validation වැදගත්.

**Where is inheritance?**  
`PrintedBook extends Book`, `EBook extends Book`; `AdminUser extends User`, `Customer extends User`.

**Show real polymorphism.**  
`OrderService.create()` ඇතුළේ `Book b` reference එකෙන් `b.requiresShipping()` call කරනවා. PrintedBook නම් true, EBook නම් false. Delivery fee calculation එක runtime object type එක අනුව වෙනස් වෙනවා.

**What is abstraction here?**  
`StoreRepository` interface එක services වලට snapshot/transaction operations දෙක පෙන්වනවා. File path, JSON serializer සහ file lock වගේ details service එක දැනගන්න අවශ්‍ය නැහැ.

**What is information hiding?**  
Repository එකේ internal state සහ file handling private. `publicProfile()` method එක password hash එක response එකට දාන්නේ නැහැ. Encapsulation එක structure එක; information hiding එක implementation details පිටතට expose නොකරන design decision එක.

**Is JSON a database?**  
නැහැ. මෙතැන JSON කියන්නේ `.txt` file එකේ data format එක. `Files`, `FileChannel` සහ Jackson හරහා Java read/write කරනවා. Database server, SQL queries හෝ JDBC connection එකක් නැහැ.

**Why one text file?**  
Order create වීම සහ stock අඩුවීම දෙකම එකම snapshot එකේ තියෙනවා. File දෙකකට වෙන වෙනම save කළොත් එකක් save වෙලා අනෙක fail වෙන්න පුළුවන්. එක atomic replace එකෙන් ඒ inconsistency එක වළක්වනවා.

**What if two people buy the last copy?**  
`transaction()` synchronized. එක් transaction එකක් අවසන් වෙනකම් අනෙක wait කරනවා. දෙවැනි එක updated stock එකට validate වෙන නිසා oversell වෙන්නේ නැහැ. වෙන process දෙකක් එකම folder use කිරීම FileLock එකෙන් block කරනවා.

**Why BigDecimal?**  
Money වල decimal precision වැදගත්. `double` binary rounding errors වලට ඉඩ තියෙනවා. Backend prices/totals `BigDecimal` වලින් calculate කරනවා.

**Can a customer send a cheaper total?**  
Client total එක භාවිතා කරන්නේ නැහැ. Server book prices read කරලා quantity එක්ක total calculate කරනවා.

**How does cancellation work?**  
Allowed state transition එක validate කරනවා. Stock restore කිරීම සහ status change කිරීම එකම transaction එකේ. Cancelled order එක නැවත cancel කරන්න බැරි නිසා stock දෙවරක් එකතු වෙන්නේ නැහැ.

**Can an admin change a customer's review text?**  
නැහැ. Ownerට edit කරන්න පුළුවන්; adminට inappropriate review එක delete කරන්න පුළුවන්. Service එක ownership validate කරනවා.

**How are passwords protected?**  
Random salt + PBKDF2WithHmacSHA256. Plaintext save කරන්නේ නැහැ. Login එකේ password එක derive කරලා stored hash එකත් එක්ක compare කරනවා. මේක hashing, encryption නෙවෙයි.

**What is CSRF protection?**  
Session එකේ token එක browser එකට දෙනවා. Every mutation request එකේ `X-CSRF-Token` header එක validate කරනවා. Login එකේ session ID/token rotate කරනවා.

**What is not implemented?**  
Real payments, real delivery, e-book file delivery, email verification සහ password reset මේ academic scope එකේ නැහැ. ඒවා තියෙනවා කියලා claim කරන්න එපා.

## Assigned preparation

| Student ID | Focus for explanation | Demonstrate one rejected action |
|---|---|---|
| IT25102131 | Register, normalize/unique email, password hashing, safe profile, account deletion | Duplicate email or account deletion with order history |
| IT25102114 | Book subclasses, stock/price validation, reference checks | Negative price or deleting a book in an active order |
| IT25102130 | BigDecimal, atomic checkout, order state machine, polymorphic shipping | Overselling, foreign order or repeat cancellation |
| IT25101966 | Author CRUD, unique names, relationship restrictions | Deleting an author who still has books |
| IT25102132 | Category CRUD, unique names, catalog filtering | Deleting a category that still contains books |
| IT25102519 | Rating validation, unique review, ownership, moderation | Duplicate review or editing another user's review |

## Before submission

- Names, actual repository link and genuine commit evidence පුරවන්න.
- Every member තමන්ගේ code එක read කරලා meaningful improvement/test එකක් කරලා own account එකෙන් commit කරන්න.
- Class diagram එක actual classes එක්ක compare කරන්න.
- Demo එකට කලින් test run කරන්න; Internet නැතිවත් packaged app එක run කරලා බලන්න.
- Demo credentials සහ startup commands තමන්ටම හුරු කරගන්න.
- “100% marks guaranteed” හෝ “production ready” කියලා claim කරන්න එපා. Marks depend on working code, real contributions and viva understanding.
