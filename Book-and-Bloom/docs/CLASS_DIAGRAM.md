# Class diagram

The companion `class-diagram.svg` is a standalone diagram for the report. The Mermaid source below is also editable and renders on GitHub.

```mermaid
classDiagram
    class Book {
        <<abstract>>
        -String id
        -String title
        -String authorId
        -String categoryId
        -BigDecimal price
        -int stock
        +getTitle() String
        +setTitle(String)
        +fulfillment() String
        +requiresShipping() boolean
    }
    class PrintedBook {
        -int pages
        +fulfillment() String
        +requiresShipping() boolean
    }
    class EBook {
        -String fileFormat
        +fulfillment() String
        +requiresShipping() boolean
    }
    Book <|-- PrintedBook
    Book <|-- EBook
    class User {
        <<abstract>>
        -String id
        -String name
        -String email
        -String passwordHash
        -String address
        +canManageCatalog() boolean
        +role() String
        +publicProfile() Map
    }
    class Customer {
        +canManageCatalog() boolean
        +role() String
    }
    class AdminUser {
        +canManageCatalog() boolean
        +role() String
    }
    User <|-- Customer
    User <|-- AdminUser
    class Author {
        -String id
        -String name
        -String bio
    }
    class Category {
        -String id
        -String name
        -String description
    }
    class Order {
        -String id
        -String userId
        -List~OrderLine~ lines
        -BigDecimal subtotal
        -BigDecimal deliveryFee
        -BigDecimal total
        -String status
    }
    class OrderLine {
        -String bookId
        -String title
        -BigDecimal unitPrice
        -int quantity
        -boolean shipping
    }
    class Review {
        -String id
        -String userId
        -String bookId
        -int rating
        -String comment
    }
    Author "1" <-- "0..*" Book : authorId
    Category "1" <-- "0..*" Book : categoryId
    User "1" <-- "0..*" Order : userId
    Order "1" *-- "1..*" OrderLine
    Book "0..1" <-- "0..*" OrderLine : historical bookId
    Book "1" <-- "0..*" Review : bookId
    User "1" <-- "0..*" Review : userId
    class StoreRepository {
        <<interface>>
        +snapshot() StoreState
        +transaction(Function) T
    }
    class FileStoreRepository {
        -Path file
        -FileLock processLock
        -StoreState state
        +snapshot() StoreState
        +transaction(Function) T
        +close()
    }
    StoreRepository <|.. FileStoreRepository
    FileStoreRepository --> StoreState
    class ApiServlet {
        +service(request,response)
    }
    ApiServlet --> UserService
    ApiServlet --> BookService
    ApiServlet --> AuthorService
    ApiServlet --> CategoryService
    ApiServlet --> OrderService
    ApiServlet --> ReviewService
    UserService --> StoreRepository
    BookService --> StoreRepository
    AuthorService --> StoreRepository
    CategoryService --> StoreRepository
    OrderService --> StoreRepository
    ReviewService --> StoreRepository
```

Relationships use IDs rather than serialized object graphs. Historical order lines keep the purchased title and price, so later catalog changes do not rewrite old receipts. `0..1` permits a completed/cancelled order's original book to be removed. The diagram omits routine accessors for readability; every persisted domain field is private with public accessors.
