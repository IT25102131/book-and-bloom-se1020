# HTTP API

Base path: `/api`. All responses are JSON. Mutations use JSON request bodies. Obtain `/session` first and send its `csrf` value as `X-CSRF-Token` for every POST, PUT and DELETE. Keep the session cookie. Login rotates both session ID and CSRF token; use the newly returned token.

| Route | Method | Permission | Purpose |
|---|---|---|---|
| `/session` | GET | Public | CSRF token and optional safe current-user profile |
| `/register` | POST | Public, CSRF | Create customer; role input is ignored |
| `/login` | POST | Public, CSRF | Authenticate and rotate session |
| `/logout` | POST | Session, CSRF | Invalidate session |
| `/books` | GET / POST | Public / admin | List / create |
| `/books/{id}` | GET / PUT / DELETE | Public / admin / admin | Detail / update / delete |
| `/authors` | GET / POST | Public / admin | List / create |
| `/authors/{id}` | PUT / DELETE | Admin | Update / delete unreferenced author |
| `/categories` | GET / POST | Public / admin | List / create |
| `/categories/{id}` | PUT / DELETE | Admin | Update / delete unreferenced category |
| `/users` | GET | Admin | List safe profiles |
| `/users/{id}` | GET / PUT / DELETE | Owner for GET; owner/admin for writes | Read own / edit / eligible delete |
| `/orders` | GET / POST | Signed-in user | Own orders (all for admin) / checkout |
| `/orders/{id}` | PUT / DELETE | Owner/admin | Valid status transition / delete cancelled |
| `/reviews` | GET / POST | Public / signed-in user | List / create |
| `/reviews/{id}` | PUT / DELETE | Owner / owner or admin | Edit review / delete |

Registration: `name`, `email`, `password`, optional `address`.

Book: `type` (`PRINTED` or `EBOOK`), `title`, `authorId`, `categoryId`, `isbn`, `price`, integer `stock`, `description`, hex `coverColor`, boolean `featured`, plus integer `pages` for printed books or `fileFormat` (`PDF`/`EPUB`) for e-books.

Author: `name`, `bio`. Category: `name`, `description`.

Order: `items: [{bookId, quantity}]`, `address`. Prices/totals from the client are not trusted. `quantity` must be an integer 1–20. Duplicate lines and insufficient stock are rejected.

Order update: `status`. Transition graph: `PLACED → PROCESSING → COMPLETED`, with `PLACED/PROCESSING → CANCELLED`. Customers may only cancel their own `PLACED` order. Administrators manage processing/completion. Terminal states cannot be changed again.

Review: `bookId` on creation, integer `rating` 1–5, `comment` 5–1000 characters. One review per user/book. Administrator moderation can delete but cannot rewrite another person's review.

Successful creation: 201. Other successful requests: 200. Errors: 400 validation, 401 sign-in needed/invalid credentials, 403 authorization/CSRF, 404 missing item, 405 method, 413 oversized body, 500 unexpected persistence/server failure. Error shape: `{ "error": "A human-readable message." }`.

No password hash is returned by a profile API. Browser text is escaped before rendering. Public pages use local assets and no third-party scripts.
