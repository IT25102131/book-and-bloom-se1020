# Workload distribution and honest contribution evidence

Project: Book & Bloom / Online Bookstore Management System. Six supplied student IDs are assigned below in the order supplied. Names remain to be entered by the team. Allocation is a plan; it is not evidence of past contribution.

| Student ID | Name | Module | Create | Read | Update | Delete | Three or more UI states |
|---|---|---|---|---|---|---|---|
| IT25102131 | To be supplied | User management | Register customer | Profile / admin search list | Name, email, address, password | Eligible customer account | Registration; profile editor; customer list; customer editor |
| IT25102114 | To be supplied | Book management | Add printed/e-book | Catalog search / detail / admin list | Details, price, stock, format | Book without active orders | Catalog; detail; add form; edit form; inventory list |
| IT25102130 | To be supplied | Order management | Checkout | Own order history / admin list | Cancel/process/complete | Cancelled order | Bag/checkout; customer history; admin order management |
| IT25101966 | To be supplied | Author management | Add author | Search author list | Biography/name | Author with no linked books | Author list; add modal; edit modal |
| IT25102132 | To be supplied | Category management | Add category | Category list / storefront filters | Name/description | Category with no linked books | Category list; add modal; edit modal; browse by category |
| IT25102519 | To be supplied | Review management | Submit rating/comment | Book review list / moderation | Own rating/comment | Own review / admin moderation | Book reviews; create form; edit form; admin moderation |

Add/edit modals are separate UI states on a common page. The brief says “minimum 3 UIs” without specifying separate URLs per person. The application has nine JSP pages overall and at least three UI states per module. If the lecturer requires three separate URL pages per member, confirm that interpretation and adapt the modal-based modules before submission.

## Shared code

- `model/`: Java domain classes, private fields, accessors and inheritance.
- `repository/`: repository abstraction and atomic file persistence.
- `web/ApiServlet.java`: request parsing, session/CSRF checks and routing.
- `web/PageController.java`: nine JSP route mappings.
- `web/WebConfiguration.java`: servlet registration and HTTP security headers.
- `static/js/app.js`, `static/css/style.css`, `WEB-INF/views/`: shared UI.

Each student should trace their complete flow: UI event → API request → servlet → service → repository → text file → response → UI. Shared files require team coordination, not six conflicting copies.

## Genuine GitHub workflow

1. One member creates the intended GitHub repository and invites the others. No repository was created or published by this task.
2. Each member configures **their own** Git name/email on their own machine.
3. Import this scaffold once with an honest description of the starting implementation and any assistance used, according to the institution's policy.
4. Create a personal branch such as `feature/IT25102131-user-validation`.
5. Each member understands, improves and tests their assigned module, then commits meaningful changes with clear messages.
6. Open and review pull requests. Merge after tests pass.
7. Export actual evidence before submission:

```sh
git log --all --date=short --pretty=format:"%h | %ad | %an | %s" > docs/actual-commit-history.txt
git shortlog -sn --all > docs/actual-contribution-summary.txt
```

Do not fabricate author identities, backdate commits, split generated work into misleading student commits, or claim the allocation table proves contribution.

## Evidence to complete

| Student ID | Actual name | GitHub username | Actual commit hashes / PR links | Independently tested features |
|---|---|---|---|---|
| IT25102131 | Pending | Pending | Pending | Pending |
| IT25102114 | Pending | Pending | Pending | Pending |
| IT25102130 | Pending | Pending | Pending | Pending |
| IT25101966 | Pending | Pending | Pending | Pending |
| IT25102132 | Pending | Pending | Pending | Pending |
| IT25102519 | Pending | Pending | Pending | Pending |

Repository URL: **not supplied**. Add screenshots of the genuine GitHub commit history to the submitted report. This is the only way to substantiate the individual-contribution marking criterion.
