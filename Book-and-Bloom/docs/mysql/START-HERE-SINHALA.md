# Book & Bloom — MySQL Workbench මුල සිට

මෙම guide එක අලුත් laptop එකක MySQL install කර database එක සකස් කිරීමටයි. 14 October 2026 වන විට Java MySQL repository සහ data migration ක්‍රියාත්මක කර පරීක්ෂා කර ඇත. මේ computer එකේ `book_bloom` database එක දැනටමත් සකස් කර ඇත; create/seed scripts නැවත run කිරීම අවශ්‍ය නැහැ. දැනට connect කර ඇති project එකේ Run instructions සඳහා `CONNECTED-STATUS.md` බලන්න.

## 1. Download කරන්න

- MySQL Server 8.4 LTS: https://dev.mysql.com/downloads/mysql/8.4.html
- MySQL Workbench: https://dev.mysql.com/downloads/workbench/

දෙකේම Operating System එක Microsoft Windows තෝරලා **Windows (x86, 64-bit), MSI Installer** download කරන්න. Version patch අංක වෙනස් විය හැකියි. Server එකට 8.4 LTS තෝරන්න. ZIP archive අවශ්‍ය නැහැ. Oracle login page එකක් ආවොත් **No thanks, just start my download** link එක තිබේ නම් ඒක භාවිත කරන්න.

Server එක database engine එකයි. Workbench එක database එක බලන්න සහ SQL run කරන්න භාවිත කරන interface එකයි. කලින් install කරපු SQL Server/SSMS වෙනම products; MySQL සඳහා ඒවා භාවිත වෙන්නේ නැහැ.

## 2. MySQL Server install / configure කරන්න

1. Server `.msi` file එක double-click කරන්න. Windows administrator prompt එක approve කරන්න.
2. License එක accept කර default/Typical setup එකෙන් install කරන්න.
3. අවසානයේ **MySQL Configurator** launch කරන්න. Configurator නොපෙන්වුණොත් Windows Start menu එකෙන් open කරන්න. Install කිරීම පමණක් server එක configure කිරීමක් නොවේ.
4. Type and Networking වල **Development** හෝ **Development Computer** තෝරන්න.
5. TCP/IP enabled තබා **Port 3306** තබන්න. Local project එකට network firewall port-open option එක තිබේ නම් untick කරන්න; Java සහ Workbench එකම laptop එකෙන් connect වෙනවා.
6. Authentication option එකක් පෙන්වුවොත් default recommended authentication තබන්න.
7. Accounts and Roles වල `root` සඳහා ඔබටම අයත් password එකක් set කර confirm කරන්න. එය මතක තබාගන්න; Workbench එකේදී අවශ්‍යයි. Website demo-account password එක සහ MySQL root password එක වෙනස් දේවල්.
8. Windows Service configure කරන්න. Service Name එක `MySQL84` වැනි default නමක් විය හැකියි; පෙන්වන නම සටහන් කරගන්න. **Start at system startup** enabled තබන්න. Default service account එක තබන්න.
9. අනෙක් default options review කර **Execute / Apply Configuration** කරන්න. සියල්ල success වූ පසු Finish කරන්න.

Visual C++ prerequisite error එකක් ආවොත් installer පෙන්වන Microsoft official prerequisite එක install කර නැවත උත්සාහ කරන්න. Existing service upgrade option එකක් පෙන්වුවොත් මේ guide එකෙන් අනුමාන කර upgrade කරන්න එපා; connection/install details පරීක්ෂා කරන්න.

## 3. Workbench install කරන්න

Workbench `.msi` file එක open කර **Next → Complete → Install → Finish** කරන්න. Version අනුව button labels ටිකක් වෙනස් විය හැකියි. Workbench launch කරන්න.

## 4. Local connection එක හදන්න

1. Home screen එකේ **MySQL Connections** ළඟ **+** click කරන්න.
2. පහත values දෙන්න:

| Field | Value |
|---|---|
| Connection Name | Book Bloom Local |
| Connection Method | Standard (TCP/IP) |
| Hostname | 127.0.0.1 |
| Port | 3306 |
| Username | root |
| Default Schema | දැනට හිස්ව තබන්න |

3. Password prompt එකේ Server setup කරන විට දුන් root password එක දෙන්න. **Store in Vault** option එක තිබේ නම් ඔබගේ laptop එකේ save කළ හැකියි.
4. **Test Connection** click කරන්න. Success message එක ආවොත් **OK** කරන්න.
5. Home screen එකේ **Book Bloom Local** connection එක double-click කරන්න. SQL Editor එක open වෙනවා.

Website address එකේ port එක 8080යි; MySQL connection port එක 3306යි.

## 5. Database සහ tables හදන්න

මේ folder එකේ **01-create-database.sql** file එක භාවිත කරන්න. පැරණි `docs/sqlserver/` scripts MySQL එකේ run කරන්න එපා; ඒවා SQL Server සඳහායි.

1. Workbench SQL Editor එකේ **File → Open SQL Script** (හෝ toolbar Open Script icon) click කරන්න.
2. `01-create-database.sql` තෝරන්න.
3. SQL text එක click කර **Ctrl+A** කරන්න.
4. **Execute selected script** lightning button එක click කරන්න. “Execute current statement” button එක සමඟ පටලවාගන්න එපා.
5. **Action Output** panel එකේ errors නැතිද බලන්න. Error එකක් ආවොත් ඒක විසඳන තුරු ඊළඟ file එක run කරන්න එපා.
6. වම් පැත්තේ **Schemas → Refresh** කරන්න. `book_bloom → Tables` expand කරන්න.

Tables 7ක් පෙනිය යුතුයි:

| Table | Module / අරමුණ |
|---|---|
| users | IT25102131 — admin/customer accounts |
| books | IT25102114 — printed books සහ e-books |
| orders | IT25102130 — order headers/totals/status |
| order_lines | IT25102130 — order එකක book lines, quantities, saved prices |
| authors | IT25101966 — authors |
| categories | IT25102132 — categories |
| reviews | IT25102519 — customer book reviews |

Create script එක existing tables overwrite/delete කරන්නේ නැහැ. නමුත් එය fresh schema එකකට එක් වරක් run කිරීමට සකස් කර ඇත. දෙවැනි වරට run කළොත් table-already-exists error ලැබිය හැකියි. MySQL DDL එක transaction එකකින් සියල්ල rollback වෙන බව assume කරන්න එපා.

## 6. Sample data ඇතුළත් කරන්න

1. **File → Open SQL Script** මගින් **02-sample-data.sql** open කරන්න.
2. **Ctrl+A → Execute selected script** කරන්න.
3. Errors නැති බව බලන්න. මේක fresh tables වලට එක් වරක් run කරන්න.

දැන් තිබිය යුතු counts: users **2**, authors **6**, categories **4**, books **12**. Orders, order_lines, reviews මුලින් **0**. මේවා fictional sample records; website එකේ දැනට තිබෙන actual runtime records මෙහි import කරලා නැහැ. Users table එකේ password hashes තියෙන්නේ Java එකේ PBKDF2 format එකෙන්; plaintext passwords නොවේ.

Seed file එකේ public academic demo emails: admin@bookbloom.lk සහ reader@bookbloom.lk. මේවා MySQL server login accounts නොවේ.

Seed script එක error වුණොත් නැවත නැවත run කරන්න එපා. ඒ connection එකේ `ROLLBACK;` run කර Action Output error එක බලන්න. Existing records delete කිරීම solution එකක් ලෙස assume කරන්න එපා.

## 7. Verify / data බලන්න

**03-inspect-database.sql** open කර සම්පූර්ණයෙන් execute කරන්න. Result Grid එකේ tables, counts, books with author/category names, සහ foreign-key relationships පෙන්වනවා.

නැත්නම් New Query Tab එකක:

```sql
USE book_bloom;
SHOW TABLES;
SELECT book_id, title, price, stock FROM books;
SELECT user_id, name, email, user_role FROM users;
```

Schemas tree එකේ table එක right-click → **Select Rows - Limit 1000** තිබේ නම් එයත් භාවිත කරන්න පුළුවන්. Presentation එකේ password_hash column එක ප්‍රදර්ශනය කිරීම අවශ්‍ය නැහැ.

## 8. SQL CRUD practice

**04-practice-crud.sql** open කරන්න. සම්පූර්ණ script එක එකවර run කිරීමෙන් row එක create/update/delete සියල්ල ඉක්මනින් සිදු වෙනවා. ඒ වෙනුවට numbered block එක බැගින් highlight කර execute කරන්න.

- CREATE: `INSERT` මගින් temporary category එකක් හදනවා.
- READ: `SELECT` මගින් ඒ row එක බලනවා.
- UPDATE: primary-key `WHERE` එක සමඟ description එක වෙනස් කරනවා.
- DELETE: ඒ temporary row එක පමණක් ඉවත් කරනවා.

මෙය Workbench SQL practice එකයි. MySQL mode එක configure කළ website එකේ CRUD වෙනස්කම් මේ tables වල save වෙනවා. File mode එක තෝරා තිබේ නම් එම වෙනස්කම් text file එකේ save වෙනවා.

## 9. ER diagram (menu තිබේ නම්)

Workbench එකේ **Database → Reverse Engineer** තෝරන්න. Local connection එකෙන් connect වී **book_bloom** schema එක තෝරා **Next** කරන්න. Tables 7ම තෝරා process එක complete කර EER diagram එකේ arrange කරන්න. `.mwb` model එක save කරන්න. Version එකේ මේ menu එක නැත්නම් වෙනම instructions අවශ්‍ය විය හැකියි; SQL tables හදා තිබීම ඒ නිසා අසාර්ථක වෙන්නේ නැහැ.

Relationships: Author 1→many Books; Category 1→many Books; User 1→many Orders; Order 1→many OrderLines; User 1→many Reviews; Book 1→many Reviews.

`order_lines.book_id` historical reference එකක්; එහි physical FK එකක් books වෙත නොමැත. Current Java design එක completed/cancelled orders තිබියදී catalog book එක delete කිරීමට ඉඩ දෙන නිසා saved title/price/order history රැකෙනවා. Active-order deletion restrictions JDBC implementation එකේත් enforce කළ යුතුයි.

## 10. Website connection එකේ තත්ත්වය

MySQL JDBC driver සහ `MysqlStoreRepository` implementation එක ඇතුළත් කර ඇත. Repository selection, UTC timestamp mapping, transaction rollback, one-time file-data migration සහ CRUD/restart tests පරීක්ෂා කර ඇත. `.local/application-local.properties` මගින් MySQL mode සහ connection details සකස් කරනවා. අලුත් laptop එකක credentials configure නොකළොත් shared source එක file mode භාවිත කරනවා.

Root password source code/GitHub එකේ ලියන්න අවශ්‍ය නැහැ. App integration සඳහා වෙනම local application DB account එකක් සහ environment-variable credentials භාවිත කළ හැකියි.

## Common errors

| Error | බලන්න ඕන දෙය |
|---|---|
| Cannot connect / 2003 | Windows Services එකේ install කළ MySQL service එක Running ද, host/port නිවැරදිද |
| Access denied / 1045 | Username/root password නිවැරදිද; website login එක MySQL login එක නොවේ |
| No database selected / 1046 | `USE book_bloom;` run කරන්න |
| Table already exists / 1050 | 01 script එක නැවත run කළාද; existing table inspect කරන්න |
| Duplicate entry / 1062 | Sample script/CRUD INSERT එක නැවත run කළාද; records inspect කරන්න |
| Foreign key error / 1452 | Parent author/category/user row එක තිබේද; files 01→02 පිළිවෙළට run කළාද |
| Syntax error / 1064 | SQL Server script එකක් භාවිත කළාද; correct MySQL file එක සහ server version බලන්න |

## Verification record

MySQL 8.0.46 මත schema create කර Java integration පරීක්ෂා කර ඇත. File-storage tests 18ක්, live MySQL tests 7ක් සහ storage mode දෙකේම HTTP checks 32 බැගින් pass විය. වත්මන් data migration සහ Run විස්තර `CONNECTED-STATUS.md` තුළ ඇත.

## Official references

- Downloads: https://dev.mysql.com/downloads/mysql/8.4.html සහ https://dev.mysql.com/downloads/workbench/
- Server MSI installation: https://dev.mysql.com/doc/refman/8.4/en/windows-installation.html
- Configurator options: https://dev.mysql.com/doc/refman/8.4/en/mysql-configurator-workflow-server.html
- Workbench connection: https://dev.mysql.com/doc/workbench/en/wb-getting-started-tutorial-create-connection.html
- Execute SQL toolbar: https://dev.mysql.com/doc/workbench/en/wb-sql-editor-toolbar.html
- Reverse engineering: https://dev.mysql.com/doc/workbench/en/wb-reverse-engineer-live.html
