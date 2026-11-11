# Class diagram (UML 2.5)

Print-ready A3 Landscape vector diagrams and documentation assets:
- **A3 Print PDF**: [`Book-and-Bloom-SE1020-Class-Diagram-A3.pdf`](Book-and-Bloom-SE1020-Class-Diagram-A3.pdf) (High-resolution ISO A3 420mm × 297mm vector PDF for viva presentation)
- **A3 High-Res PNG**: [`Book-and-Bloom-SE1020-Class-Diagram-A3.png`](Book-and-Bloom-SE1020-Class-Diagram-A3.png)
- **Vector SVG**: [`class-diagram-A3.svg`](class-diagram-A3.svg)

The editable Mermaid source below renders directly in GitHub previews and markdown viewers.

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
        -String nationality
        -String primaryGenre
        -String accolades
        -String bornYear
        -String photoUrl
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
    class MysqlStoreRepository {
        -DataSource dataSource
        -StoreState cachedState
        +snapshot() StoreState
        +transaction(Function) T
        +close()
    }
    StoreRepository <|.. FileStoreRepository
    StoreRepository <|.. MysqlStoreRepository
    FileStoreRepository --> StoreState
    MysqlStoreRepository --> StoreState
    class DeliveryFeePolicy {
        +calculateFee(lines, deliveryMethod) BigDecimal
    }
    class ApiServlet {
        +service(request,response)
    }
    class PageController {
        +doGet(request,response)
    }
    ApiServlet --> UserService
    ApiServlet --> BookService
    ApiServlet --> AuthorService
    ApiServlet --> CategoryService
    ApiServlet --> OrderService
    ApiServlet --> ReviewService
    OrderService --> DeliveryFeePolicy
    UserService --> StoreRepository
    BookService --> StoreRepository
    AuthorService --> StoreRepository
    CategoryService --> StoreRepository
    OrderService --> StoreRepository
    ReviewService --> StoreRepository
```

Relationships use IDs rather than serialized object graphs. Historical order lines keep the purchased title and price, so later catalog changes do not rewrite old receipts. `0..1` permits a completed/cancelled order's original book to be removed. The diagram omits routine accessors for readability; every persisted domain field is private with public accessors.
