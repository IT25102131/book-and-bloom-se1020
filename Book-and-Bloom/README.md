# Book & Bloom

A complete SE1020 **Online Bookstore Management System** built with Java, Spring Boot, JSP and an explicit Jakarta Servlet. Books, users, authors, categories, orders and reviews support atomic text-file storage or relational MySQL storage behind the same `StoreRepository` interface.

MySQL integration was verified on 14 October 2026. This computer's IntelliJ project is configured for `book_bloom` using ignored local configuration. Shared source defaults to file mode until the recipient configures their own database. See [current MySQL status and run steps](docs/mysql/CONNECTED-STATUS.md).

## Start in IntelliJ IDEA

1. Open this folder as a Maven project (`pom.xml`). Let Maven import dependencies.
2. Select JDK **17 or 21** in Project Structure and Maven Runner. The project targets Java 17; this machine's available JDK 26 was also used during verification.
3. Run `mvnw.cmd clean package` in the IntelliJ terminal (Windows), or `./mvnw clean package` on macOS/Linux.
4. Run `java -jar target/book-and-bloom.war` from this folder.
5. Open **http://127.0.0.1:8080**.

To run Java directly in IntelliJ, open the **inner `Book-and-Bloom/pom.xml` as a project**, then select the included **Book and Bloom - Website** Run configuration. It sets the working directory to the Maven project root, includes provided dependencies, and opens the default browser after the server and demo data are ready. `IntelliJLaunchSupport` also resolves JSP files when IntelliJ opens a parent folder and detects ordinary IntelliJ launches for automatic browser opening. See [the IntelliJ guide](docs/INTELLIJ_RUN.md).

On this Windows machine, `start-bookstore.cmd` finds an installed JDK automatically and launches the packaged app. It builds the WAR first if it is missing. Stop the server with Ctrl+C. The terminal must stay open while using the app.

An executable **WAR** is intentional: Spring Boot supports JSPs in executable WARs; executable JAR packaging does not support this JSP layout. The application is also a `SpringBootServletInitializer` for compatible external Tomcat deployment. Paths respect the application context.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@bookbloom.lk` | `BloomAdmin!2026` |
| Reader | `reader@bookbloom.lk` | `BloomReader!2026` |

These are deliberately public **local academic demo** credentials. The server binds to `127.0.0.1`. This is not an Internet production deployment. Books, covers, biographies and accounts are fictional sample content. Checkout records a demo order; no payment is charged, physical shipment arranged, or e-book delivered.

## What works

- Responsive storefront with original local cover artwork, search, categories, formats, price/title sorting and pagination.
- Book details, stock availability, customer reviews and persistent browser cart.
- Registration, sign-in/out, profile changes, password changes and eligible account deletion.
- Server-calculated checkout using `BigDecimal`, delivery rules and stock validation.
- Order history, cancellation with exactly-once restocking, administrator processing and completion, cancelled-order deletion.
- Administrator dashboard and full book, author, category and customer management; review moderation.
- Backend validation, role and ownership checks, CSRF tokens, session rotation and salted PBKDF2 password hashes.
- Atomic UTF-8 text-file persistence, restart survival, a single-writer file lock and transactional rollback.

## Six-member module allocation

This is a **proposed workload allocation**, not a claim that these students have already implemented or committed the work. Names were not supplied.

| Student ID | Primary CRUD module | Main service |
|---|---|---|
| IT25102131 | Users / customer accounts | `UserService.java` |
| IT25102114 | Books / inventory | `BookService.java` |
| IT25102130 | Orders / checkout | `OrderService.java` |
| IT25101966 | Authors | `AuthorService.java` |
| IT25102132 | Categories | `CategoryService.java` |
| IT25102519 | Reviews / moderation | `ReviewService.java` |

Every module implements Create, Read, Update and Delete, with appropriate business restrictions. Each member must understand, test and make their own genuine changes and commits. Shared infrastructure is documented separately.

## Data

The first launch creates `data/bookstore.txt` from `src/main/resources/sample-data/bookstore.txt` and adds the two demo accounts with newly salted hashes. The runtime file is readable JSON **inside a `.txt` file**, editable in Notepad while the server is stopped. It contains six collections in one snapshot so a stock update and order update can commit together.

- Runtime data and lock files are ignored by Git.
- Stop the app before copying the data file for a backup.
- To start a separate fresh demo without deleting data: `java -jar target/book-and-bloom.war --bookbloom.data-dir=./data-fresh --server.port=8081`.
- Do not edit or reset an active store. Malformed files fail startup rather than being silently overwritten.
- `store.lock` may remain after shutdown; the operating-system lock, not the existence of that file, determines ownership.

## Verify

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

JUnit tests use temporary directories and do not alter demo data. `tools/http_smoke.py` is an additional repeatable end-to-end test; it starts a separate temporary store and tests the packaged WAR, real HTTP endpoints and JSP compilation. Run it with Python and a valid `JAVA_HOME` after packaging:

```powershell
python tools/http_smoke.py
```

## Project guide

- `docs/FINAL_REPORT.md`: architecture, requirements traceability, data design and implementation report.
- `docs/CLASS_DIAGRAM.md` and `docs/class-diagram.svg`: class relationships and original diagram.
- `docs/WORKLOAD_AND_GITHUB.md`: six member allocation, UI states, genuine contribution evidence template.
- `docs/VIVA_GUIDE.md`: demonstration sequence and Sinhala-English backend explanations.
- `docs/TEST_REPORT.md`: verification evidence and manual checklist.
- `docs/API.md`: HTTP endpoints, permissions and errors.

No student names, GitHub repository URL or individual commit evidence have been fabricated. Complete those fields with actual work before submission.

## Troubleshooting

- **Port in use:** stop the older instance, or add `--server.port=8081` and open port 8081.
- **Data directory already in use:** another instance is using the same store. Stop it or specify a different data directory.
- **Maven cannot download:** connect to the Internet for the first dependency import. The application itself needs no external fonts, image hosts or CDN after packaging.
- **JSP error in IDE:** use the packaged WAR command above; do not change packaging to JAR. Run from the project root.
- **Stale UI after an edit:** rebuild the WAR, restart the server and refresh the browser.

Technical reference: [Spring Boot servlet/JSP support](https://docs.spring.io/spring-boot/3.3/reference/web/servlet.html), [traditional WAR deployment](https://docs.spring.io/spring-boot/3.4/how-to/deployment/traditional-deployment.html).
