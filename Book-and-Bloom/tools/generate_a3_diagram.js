const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const W = 3508;
const H = 2480;

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class DiagramBuilder {
  constructor() {
    this.svgParts = [];
    this.classes = [];
  }

  addClass(c) {
    this.classes.push(c);
  }

  // Draw box with UML 3-compartment layout
  renderClass(c) {
    const { x, y, w, name, stereotype, fields = [], methods = [], theme = 'model' } = c;
    
    // Theme colors
    let headerBg1, headerBg2, headerBorder, badgeBg, badgeColor;
    if (theme === 'model') {
      headerBg1 = '#0F2744'; headerBg2 = '#1E3A8A'; headerBorder = '#0A1E35';
      badgeBg = 'rgba(255,255,255,0.18)'; badgeColor = '#FFFFFF';
    } else if (theme === 'service') {
      headerBg1 = '#064E3B'; headerBg2 = '#047857'; headerBorder = '#043A2C';
      badgeBg = 'rgba(255,255,255,0.2)'; badgeColor = '#FFFFFF';
    } else if (theme === 'repo') {
      headerBg1 = '#4C1D95'; headerBg2 = '#6D28D9'; headerBorder = '#3B1475';
      badgeBg = 'rgba(255,255,255,0.2)'; badgeColor = '#FFFFFF';
    } else if (theme === 'web') {
      headerBg1 = '#1E293B'; headerBg2 = '#334155'; headerBorder = '#0F172A';
      badgeBg = 'rgba(255,255,255,0.2)'; badgeColor = '#FFFFFF';
    }

    const headerH = stereotype ? 54 : 44;
    const fieldItemH = 22;
    const methodItemH = 22;
    const padding = 14;

    const fieldsH = fields.length > 0 ? (fields.length * fieldItemH + padding) : 0;
    const methodsH = methods.length > 0 ? (methods.length * methodItemH + padding) : 0;
    const totalH = headerH + fieldsH + methodsH + (fields.length > 0 && methods.length > 0 ? 0 : 6);

    c.actualH = totalH;

    let svg = `
    <!-- Class ${name} -->
    <g class="uml-class" id="class-${name}">
      <!-- Outer Card Shadow & Border -->
      <rect x="${x}" y="${y}" width="${w}" height="${totalH}" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.8" filter="url(#drop-shadow)"/>
      
      <!-- Header Gradient Box -->
      <path d="M ${x} ${y + 8} Q ${x} ${y} ${x + 8} ${y} L ${x + w - 8} ${y} Q ${x + w} ${y} ${x + w} ${y + 8} L ${x + w} ${y + headerH} L ${x} ${y + headerH} Z" fill="url(#grad-${theme})"/>
      <line x1="${x}" y1="${y + headerH}" x2="${x + w}" y2="${y + headerH}" stroke="${headerBorder}" stroke-width="1.5"/>
    `;

    if (stereotype) {
      svg += `
      <text x="${x + w/2}" y="${y + 20}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-style="italic" fill="#E2E8F0">&lt;&lt;${escapeHtml(stereotype)}&gt;&gt;</text>
      <text x="${x + w/2}" y="${y + 40}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF">${escapeHtml(name)}</text>
      `;
    } else {
      svg += `
      <text x="${x + w/2}" y="${y + 28}" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF">${escapeHtml(name)}</text>
      `;
    }

    let currentY = y + headerH;

    // Compartment 2: Attributes / Fields
    if (fields.length > 0) {
      currentY += 8;
      for (const f of fields) {
        currentY += fieldItemH;
        // Parse visibility and type
        const vis = f.startsWith('-') ? '-' : (f.startsWith('+') ? '+' : '#');
        const text = f.substring(1).trim();
        const visColor = vis === '-' ? '#DC2626' : (vis === '+' ? '#16A34A' : '#D97706');

        svg += `
        <text x="${x + 14}" y="${currentY}" font-family="'Fira Code', 'Consolas', monospace" font-size="12" font-weight="bold" fill="${visColor}">${vis}</text>
        <text x="${x + 28}" y="${currentY}" font-family="'Segoe UI', Arial, sans-serif" font-size="12.5" fill="#1E293B">${escapeHtml(text)}</text>
        `;
      }
      currentY += 6;
      if (methods.length > 0) {
        svg += `<line x1="${x}" y1="${currentY}" x2="${x + w}" y2="${currentY}" stroke="#E2E8F0" stroke-width="1.2"/>`;
      }
    }

    // Compartment 3: Operations / Methods
    if (methods.length > 0) {
      currentY += 8;
      for (const m of methods) {
        currentY += methodItemH;
        const vis = m.startsWith('+') ? '+' : (m.startsWith('-') ? '-' : '#');
        const text = m.substring(1).trim();
        const visColor = vis === '+' ? '#16A34A' : (vis === '-' ? '#DC2626' : '#D97706');

        svg += `
        <text x="${x + 14}" y="${currentY}" font-family="'Fira Code', 'Consolas', monospace" font-size="12" font-weight="bold" fill="${visColor}">${vis}</text>
        <text x="${x + 28}" y="${currentY}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#334155">${escapeHtml(text)}</text>
        `;
      }
    }

    svg += `</g>\n`;
    return svg;
  }
}

// Generate the complete A3 SVG
function buildA3Svg() {
  const builder = new DiagramBuilder();

  // -------------------------------------------------------------
  // DEFINITIONS OF ALL CLASSES ACROSS THE 3 TIERS
  // -------------------------------------------------------------

  // --- CONTROLLER TIER ---
  builder.addClass({
    x: 80, y: 280, w: 320, name: 'PageController', stereotype: 'controller', theme: 'web',
    fields: [
      '- root: Path',
      '- isDev: boolean'
    ],
    methods: [
      '+ home(): String',
      '+ catalog(): String',
      '+ book(): String',
      '+ cart(): String',
      '+ orders(): String',
      '+ admin(): String',
      '+ account(): String'
    ]
  });

  builder.addClass({
    x: 440, y: 280, w: 380, name: 'ApiServlet', stereotype: 'HttpServlet', theme: 'web',
    fields: [
      '- mapper: ObjectMapper',
      '- users: UserService',
      '- books: BookService',
      '- authors: AuthorService',
      '- categories: CategoryService',
      '- orders: OrderService',
      '- reviews: ReviewService'
    ],
    methods: [
      '+ service(req, res): void',
      '- authenticate(req): String',
      '- validateCsrf(req): void',
      '- parseBody(req): JsonNode'
    ]
  });

  // --- SERVICE TIER (6 Services + 1 Policy) ---
  builder.addClass({
    x: 870, y: 280, w: 340, name: 'UserService', stereotype: 'service', theme: 'service',
    fields: [
      '- repository: StoreRepository'
    ],
    methods: [
      '+ authenticate(JsonNode): User',
      '+ register(JsonNode): User',
      '+ profile(String): User',
      '+ updateProfile(String, JsonNode): User',
      '+ delete(String, String): void'
    ]
  });

  builder.addClass({
    x: 1240, y: 280, w: 340, name: 'BookService', stereotype: 'service', theme: 'service',
    fields: [
      '- repository: StoreRepository'
    ],
    methods: [
      '+ list(): List<Book>',
      '+ save(actor, id, body): Book',
      '+ delete(actor, id): void'
    ]
  });

  builder.addClass({
    x: 1610, y: 280, w: 340, name: 'AuthorService', stereotype: 'service', theme: 'service',
    fields: [
      '- repository: StoreRepository'
    ],
    methods: [
      '+ list(): List<Author>',
      '+ save(actor, id, body): Author',
      '+ delete(actor, id): void'
    ]
  });

  builder.addClass({
    x: 1980, y: 280, w: 340, name: 'CategoryService', stereotype: 'service', theme: 'service',
    fields: [
      '- repository: StoreRepository'
    ],
    methods: [
      '+ list(): List<Category>',
      '+ save(actor, id, body): Category',
      '+ delete(actor, id): void'
    ]
  });

  builder.addClass({
    x: 2350, y: 280, w: 350, name: 'OrderService', stereotype: 'service', theme: 'service',
    fields: [
      '- repository: StoreRepository'
    ],
    methods: [
      '+ create(actor, body): Order',
      '+ updateStatus(actor, id, status): Order',
      '+ delete(actor, id): void'
    ]
  });

  builder.addClass({
    x: 2730, y: 280, w: 340, name: 'ReviewService', stereotype: 'service', theme: 'service',
    fields: [
      '- repository: StoreRepository'
    ],
    methods: [
      '+ list(): List<Review>',
      '+ submit(actor, body): Review',
      '+ delete(actor, id): void'
    ]
  });

  builder.addClass({
    x: 3100, y: 280, w: 320, name: 'DeliveryFeePolicy', stereotype: 'utility / domain rule', theme: 'service',
    fields: [
      '+ FREE_THRESHOLD: BigDecimal = 5000',
      '+ STANDARD_FEE: BigDecimal = 350'
    ],
    methods: [
      '+ calculate(subtotal, shipping): BigDecimal'
    ]
  });

  // --- CORE DOMAIN MODEL TIER (MIDDLE ROW) ---

  // 1. User Hierarchy (Member 1: IT25102131)
  builder.addClass({
    x: 80, y: 780, w: 360, name: 'User', stereotype: 'abstract', theme: 'model',
    fields: [
      '- id: String',
      '- name: String',
      '- email: String',
      '- passwordHash: String',
      '- address: String',
      '- createdAt: String'
    ],
    methods: [
      '+ getId(): String',
      '+ getName(): String',
      '+ getEmail(): String',
      '+ role(): String*',
      '+ canManageCatalog(): boolean*',
      '+ publicProfile(): Map<String, Object>'
    ]
  });

  builder.addClass({
    x: 60, y: 1140, w: 180, name: 'Customer', stereotype: 'entity', theme: 'model',
    fields: [],
    methods: [
      '+ role(): String {return "CUSTOMER"}',
      '+ canManageCatalog(): boolean {false}'
    ]
  });

  builder.addClass({
    x: 270, y: 1140, w: 180, name: 'AdminUser', stereotype: 'entity', theme: 'model',
    fields: [],
    methods: [
      '+ role(): String {return "ADMIN"}',
      '+ canManageCatalog(): boolean {true}'
    ]
  });

  // 2. Book Hierarchy (Member 2: IT25102114)
  builder.addClass({
    x: 520, y: 780, w: 370, name: 'Book', stereotype: 'abstract', theme: 'model',
    fields: [
      '- id: String',
      '- title: String',
      '- authorId: String',
      '- categoryId: String',
      '- isbn: String',
      '- price: BigDecimal',
      '- stock: int',
      '- description: String',
      '- coverColor: String',
      '- featured: boolean'
    ],
    methods: [
      '+ getId(): String',
      '+ getTitle(): String',
      '+ getPrice(): BigDecimal',
      '+ getStock(): int',
      '+ requiresShipping(): boolean*',
      '+ fulfillment(): String*'
    ]
  });

  builder.addClass({
    x: 500, y: 1220, w: 190, name: 'PrintedBook', stereotype: 'entity', theme: 'model',
    fields: [
      '- pages: int'
    ],
    methods: [
      '+ getPages(): int',
      '+ requiresShipping(): boolean {true}',
      '+ fulfillment(): String'
    ]
  });

  builder.addClass({
    x: 710, y: 1220, w: 190, name: 'EBook', stereotype: 'entity', theme: 'model',
    fields: [
      '- fileFormat: String'
    ],
    methods: [
      '+ getFileFormat(): String',
      '+ requiresShipping(): boolean {false}',
      '+ fulfillment(): String'
    ]
  });

  // 3. Author Entity (Member 4: IT25101966 - ENHANCED!)
  builder.addClass({
    x: 960, y: 780, w: 360, name: 'Author', stereotype: 'entity', theme: 'model',
    fields: [
      '- id: String',
      '- name: String',
      '- bio: String',
      '- nationality: String',
      '- primaryGenre: String',
      '- accolades: String',
      '- bornYear: String',
      '- photoUrl: String'
    ],
    methods: [
      '+ getId(): String',
      '+ getName(): String',
      '+ getNationality(): String',
      '+ getPrimaryGenre(): String',
      '+ getAccolades(): String',
      '+ getBornYear(): String',
      '+ getPhotoUrl(): String'
    ]
  });

  // 4. Category Entity (Member 5: IT25102132)
  builder.addClass({
    x: 1390, y: 780, w: 300, name: 'Category', stereotype: 'entity', theme: 'model',
    fields: [
      '- id: String',
      '- name: String',
      '- description: String'
    ],
    methods: [
      '+ getId(): String',
      '+ getName(): String',
      '+ getDescription(): String'
    ]
  });

  // 5. Order & OrderLine Composition (Member 3: IT25102130)
  builder.addClass({
    x: 1760, y: 780, w: 370, name: 'Order', stereotype: 'entity', theme: 'model',
    fields: [
      '- id: String',
      '- userId: String',
      '- lines: List<OrderLine>',
      '- subtotal: BigDecimal',
      '- deliveryFee: BigDecimal',
      '- total: BigDecimal',
      '- status: String',
      '- address: String',
      '- createdAt: String'
    ],
    methods: [
      '+ getId(): String',
      '+ getLines(): List<OrderLine>',
      '+ getTotal(): BigDecimal',
      '+ getStatus(): String',
      '+ setStatus(String): void'
    ]
  });

  builder.addClass({
    x: 2200, y: 780, w: 300, name: 'OrderLine', stereotype: 'value object (composite)', theme: 'model',
    fields: [
      '- bookId: String',
      '- title: String',
      '- unitPrice: BigDecimal',
      '- quantity: int',
      '- shipping: boolean'
    ],
    methods: [
      '+ getBookId(): String',
      '+ getQuantity(): int',
      '+ getUnitPrice(): BigDecimal',
      '+ isShipping(): boolean'
    ]
  });

  // 6. Review Entity (Member 6: IT25102519)
  builder.addClass({
    x: 2570, y: 780, w: 320, name: 'Review', stereotype: 'entity', theme: 'model',
    fields: [
      '- id: String',
      '- userId: String',
      '- bookId: String',
      '- rating: int (1..5)',
      '- comment: String',
      '- createdAt: String'
    ],
    methods: [
      '+ getId(): String',
      '+ getRating(): int',
      '+ getComment(): String',
      '+ getUserId(): String',
      '+ getBookId(): String'
    ]
  });

  // Helper Security & Utilities
  builder.addClass({
    x: 2960, y: 780, w: 460, name: 'Passwords', stereotype: 'cryptographic utility', theme: 'model',
    fields: [
      '- ALGORITHM: String = "PBKDF2WithHmacSHA256"',
      '- ITERATIONS: int = 210000',
      '- SALT_BYTES: int = 16'
    ],
    methods: [
      '+ hash(char[] password): String',
      '+ verify(char[] password, String storedHash): boolean'
    ]
  });

  // --- REPOSITORY & PERSISTENCE TIER (BOTTOM ROW) ---
  builder.addClass({
    x: 1000, y: 1540, w: 360, name: 'StoreState', stereotype: 'aggregate state snapshot', theme: 'repo',
    fields: [
      '- schemaVersion: int = 1',
      '- books: List<Book>',
      '- authors: List<Author>',
      '- categories: List<Category>',
      '- users: List<User>',
      '- orders: List<Order>',
      '- reviews: List<Review>'
    ],
    methods: [
      '+ getBooks(): List<Book>',
      '+ getAuthors(): List<Author>',
      '+ getCategories(): List<Category>',
      '+ getUsers(): List<User>',
      '+ getOrders(): List<Order>',
      '+ getReviews(): List<Review>'
    ]
  });

  builder.addClass({
    x: 1470, y: 1540, w: 460, name: 'StoreRepository', stereotype: 'interface', theme: 'repo',
    fields: [],
    methods: [
      '+ snapshot(): StoreState',
      '+ transaction(Function<StoreState, T> action): T'
    ]
  });

  builder.addClass({
    x: 1300, y: 1840, w: 380, name: 'FileStoreRepository', stereotype: 'atomic file storage', theme: 'repo',
    fields: [
      '- mapper: ObjectMapper',
      '- file: Path',
      '- lockChannel: FileChannel',
      '- processLock: FileLock',
      '- state: StoreState'
    ],
    methods: [
      '+ snapshot(): StoreState',
      '+ transaction(Function): T',
      '+ close(): void',
      '- copy(StoreState): StoreState'
    ]
  });

  builder.addClass({
    x: 1740, y: 1840, w: 420, name: 'MysqlStoreRepository', stereotype: 'relational persistence (MySQL 8.0)', theme: 'repo',
    fields: [
      '- mapper: ObjectMapper',
      '- url: String = "jdbc:mysql://127.0.0.1:3306/book_bloom"',
      '- credentials: Properties'
    ],
    methods: [
      '+ snapshot(): StoreState',
      '+ transaction(Function): T',
      '- load(Connection, boolean): StoreState',
      '- persist(Connection, StoreState, StoreState): void',
      '- upsert(Connection, table, columns, values): void'
    ]
  });

  // Render all classes
  let classesSvg = '';
  for (const c of builder.classes) {
    classesSvg += builder.renderClass(c);
  }

  // -------------------------------------------------------------
  // ORTHOGONAL RELATIONSHIPS & CONNECTORS
  // -------------------------------------------------------------
  let connectorsSvg = `
  <!-- ==================== RELATIONSHIPS ==================== -->
  <g class="relationships" stroke-linecap="round" stroke-linejoin="round">

    <!-- INHERITANCE: Customer & AdminUser -> User -->
    <path d="M 150 1140 L 150 1100 L 260 1100 L 260 1060" fill="none" stroke="#0F2744" stroke-width="2.5" marker-end="url(#triangle-generalization)"/>
    <path d="M 360 1140 L 360 1100 L 260 1100" fill="none" stroke="#0F2744" stroke-width="2.5"/>

    <!-- INHERITANCE: PrintedBook & EBook -> Book -->
    <path d="M 595 1220 L 595 1180 L 705 1180 L 705 1120" fill="none" stroke="#0F2744" stroke-width="2.5" marker-end="url(#triangle-generalization)"/>
    <path d="M 805 1220 L 805 1180 L 705 1180" fill="none" stroke="#0F2744" stroke-width="2.5"/>

    <!-- REALIZATION: FileStoreRepository & MysqlStoreRepository -> StoreRepository -->
    <path d="M 1490 1840 L 1490 1780 L 1700 1780 L 1700 1670" fill="none" stroke="#4C1D95" stroke-width="2.5" stroke-dasharray="8 6" marker-end="url(#triangle-realization)"/>
    <path d="M 1950 1840 L 1950 1780 L 1700 1780" fill="none" stroke="#4C1D95" stroke-width="2.5" stroke-dasharray="8 6"/>

    <!-- COMPOSITION: Order owns OrderLine (Black Diamond) -->
    <path d="M 2130 920 L 2200 920" fill="none" stroke="#0F2744" stroke-width="2.5" marker-start="url(#diamond-composition)"/>
    <text x="2145" y="905" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1</text>
    <text x="2170" y="905" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1..*</text>

    <!-- ASSOCIATION: Author 1 <-> 0..* Book -->
    <path d="M 960 900 L 890 900" fill="none" stroke="#0F2744" stroke-width="2.2" marker-end="url(#arrow-association)"/>
    <text x="940" y="885" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1</text>
    <text x="905" y="885" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">0..*</text>
    <text x="905" y="920" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#64748B">authorId</text>

    <!-- ASSOCIATION: Category 1 <-> 0..* Book -->
    <path d="M 1390 930 L 1340 930 L 1340 950 L 890 950" fill="none" stroke="#0F2744" stroke-width="2.2" marker-end="url(#arrow-association)"/>
    <text x="1370" y="915" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1</text>
    <text x="905" y="940" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">0..*</text>
    <text x="1100" y="942" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#64748B">categoryId</text>

    <!-- ASSOCIATION: User 1 <-> 0..* Order -->
    <path d="M 440 850 L 480 850 L 480 730 L 1800 730 L 1800 780" fill="none" stroke="#0F2744" stroke-width="2.2" marker-end="url(#arrow-association)"/>
    <text x="450" y="840" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1</text>
    <text x="1780" y="765" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">0..*</text>
    <text x="1100" y="722" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#64748B">userId</text>

    <!-- ASSOCIATION: Book 1 <-> 0..* Review -->
    <path d="M 890 820 L 920 820 L 920 740 L 2600 740 L 2600 780" fill="none" stroke="#0F2744" stroke-width="2.2" marker-end="url(#arrow-association)"/>
    <text x="895" y="810" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1</text>
    <text x="2580" y="765" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">0..*</text>
    <text x="2100" y="732" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#64748B">bookId</text>

    <!-- ASSOCIATION: User 1 <-> 0..* Review -->
    <path d="M 260 780 L 260 710 L 2700 710 L 2700 780" fill="none" stroke="#0F2744" stroke-width="2.2" marker-end="url(#arrow-association)"/>
    <text x="270" y="740" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">1</text>
    <text x="2710" y="765" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">0..*</text>
    <text x="1450" y="702" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#64748B">userId</text>

    <!-- DEPENDENCY: ApiServlet delegates to 6 Services -->
    <path d="M 630 450 L 630 520 L 1040 520 L 1040 435" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>
    <path d="M 1040 520 L 1410 520 L 1410 420" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>
    <path d="M 1410 520 L 1780 520 L 1780 420" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>
    <path d="M 1780 520 L 2150 520 L 2150 420" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>
    <path d="M 2150 520 L 2520 520 L 2520 425" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>
    <path d="M 2520 520 L 2900 520 L 2900 425" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>

    <!-- DEPENDENCY: Services use StoreRepository -->
    <path d="M 1780 430 L 1780 480 L 1700 480 L 1700 1540" fill="none" stroke="#4C1D95" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency-repo)"/>

    <!-- DEPENDENCY: OrderService uses DeliveryFeePolicy -->
    <path d="M 2700 360 L 3100 360" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-dependency)"/>
    <text x="2880" y="350" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#047857">&lt;&lt;uses policy&gt;&gt;</text>

    <!-- AGGREGATE LINK: StoreRepository manages StoreState -->
    <path d="M 1470 1620 L 1360 1620" fill="none" stroke="#4C1D95" stroke-width="2.5" marker-end="url(#arrow-dependency-repo)"/>
    <text x="1375" y="1610" font-family="'Segoe UI', Arial" font-size="11" font-style="italic" fill="#4C1D95">snapshot / restore</text>

  </g>
  `;

  // Complete SVG String
  const fullSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Drop Shadow Filter for Clean Elevated Boxes -->
    <filter id="drop-shadow" x="-5%" y="-5%" width="112%" height="114%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>

    <!-- Theme Gradients -->
    <linearGradient id="grad-model" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F2744"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
    <linearGradient id="grad-service" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="grad-repo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
    <linearGradient id="grad-web" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>

    <!-- UML MARKERS -->
    <!-- Closed Hollow Triangle: Generalization / Inheritance -->
    <marker id="triangle-generalization" viewBox="0 0 20 20" refX="19" refY="10" markerWidth="14" markerHeight="14" orient="auto">
      <polygon points="1,1 19,10 1,19" fill="#FFFFFF" stroke="#0F2744" stroke-width="2.2"/>
    </marker>

    <!-- Closed Hollow Triangle: Realization / Implementation -->
    <marker id="triangle-realization" viewBox="0 0 20 20" refX="19" refY="10" markerWidth="14" markerHeight="14" orient="auto">
      <polygon points="1,1 19,10 1,19" fill="#FFFFFF" stroke="#4C1D95" stroke-width="2.2"/>
    </marker>

    <!-- Filled Black Diamond: Composition -->
    <marker id="diamond-composition" viewBox="0 0 24 24" refX="1" refY="12" markerWidth="16" markerHeight="16" orient="auto">
      <polygon points="1,12 12,5 23,12 12,19" fill="#0F2744" stroke="#0F2744" stroke-width="1.5"/>
    </marker>

    <!-- Open Stick Arrow: Association -->
    <marker id="arrow-association" viewBox="0 0 16 16" refX="14" refY="8" markerWidth="10" markerHeight="10" orient="auto">
      <polyline points="2,2 14,8 2,14" fill="none" stroke="#0F2744" stroke-width="2.2"/>
    </marker>

    <!-- Open Stick Arrow: Dependency (Green) -->
    <marker id="arrow-dependency" viewBox="0 0 16 16" refX="14" refY="8" markerWidth="10" markerHeight="10" orient="auto">
      <polyline points="2,2 14,8 2,14" fill="none" stroke="#047857" stroke-width="2"/>
    </marker>

    <!-- Open Stick Arrow: Dependency (Purple) -->
    <marker id="arrow-dependency-repo" viewBox="0 0 16 16" refX="14" refY="8" markerWidth="10" markerHeight="10" orient="auto">
      <polyline points="2,2 14,8 2,14" fill="none" stroke="#4C1D95" stroke-width="2"/>
    </marker>
  </defs>

  <!-- Clean Canvas Background -->
  <rect width="${W}" height="${H}" fill="#F8FAFC"/>
  
  <!-- Outer Engineering Sheet Border -->
  <rect x="30" y="30" width="${W - 60}" height="${H - 60}" rx="12" fill="none" stroke="#CBD5E1" stroke-width="2"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="8" fill="none" stroke="#94A3B8" stroke-width="1.2"/>

  <!-- ==================== HEADER BAR ==================== -->
  <g class="header-section">
    <!-- Main Title Card -->
    <rect x="60" y="60" width="1680" height="150" rx="10" fill="#0F2744" stroke="#0A1E35" stroke-width="1.5"/>
    <text x="90" y="112" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="bold" fill="#FFFFFF" letter-spacing="0.5">BOOK &amp; BLOOM — ONLINE BOOKSTORE MANAGEMENT SYSTEM</text>
    <text x="90" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600" fill="#93C5FD">UML 2.5 Detailed Architecture &amp; Object-Oriented Domain Specification</text>
    <text x="90" y="180" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#E2E8F0">SLIIT · SE1020 Object Oriented Programming Prorata Project · Three-Tier Architecture (JSP / Servlet / Spring Boot / MySQL &amp; Atomic File Storage)</text>

    <!-- UML 2.5 Notation Legend -->
    <rect x="1780" y="60" width="1660" height="150" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" filter="url(#drop-shadow)"/>
    <text x="1810" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="bold" fill="#0F2744">UML 2.5 NOTATION &amp; RELATIONSHIP LEGEND</text>
    
    <!-- Legend Items -->
    <!-- 1. Inheritance -->
    <line x1="1810" y1="125" x2="1870" y2="125" stroke="#0F2744" stroke-width="2.5" marker-end="url(#triangle-generalization)"/>
    <text x="1885" y="130" font-family="'Segoe UI', Arial" font-size="13.5" font-weight="600" fill="#1E293B">Generalization / Inheritance (<tspan font-family="'Fira Code', monospace" fill="#0284C7">extends</tspan>)</text>

    <!-- 2. Realization -->
    <line x1="1810" y1="168" x2="1870" y2="168" stroke="#4C1D95" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#triangle-realization)"/>
    <text x="1885" y="173" font-family="'Segoe UI', Arial" font-size="13.5" font-weight="600" fill="#1E293B">Interface Realization (<tspan font-family="'Fira Code', monospace" fill="#7C3AED">implements</tspan>)</text>

    <!-- 3. Composition -->
    <line x1="2280" y1="125" x2="2340" y2="125" stroke="#0F2744" stroke-width="2.5" marker-start="url(#diamond-composition)"/>
    <text x="2355" y="130" font-family="'Segoe UI', Arial" font-size="13.5" font-weight="600" fill="#1E293B">Composition (<tspan font-style="italic" fill="#64748B">Order owns OrderLine</tspan>)</text>

    <!-- 4. Association -->
    <line x1="2280" y1="168" x2="2340" y2="168" stroke="#0F2744" stroke-width="2.2" marker-end="url(#arrow-association)"/>
    <text x="2355" y="173" font-family="'Segoe UI', Arial" font-size="13.5" font-weight="600" fill="#1E293B">Navigable Association (<tspan font-style="italic" fill="#64748B">Multiplicity: 1 to 0..*</tspan>)</text>

    <!-- 5. Package Badges -->
    <rect x="2760" y="108" width="110" height="26" rx="4" fill="#0F2744"/>
    <text x="2815" y="125" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="12" font-weight="bold" fill="#FFFFFF">Model Entity</text>

    <rect x="2885" y="108" width="110" height="26" rx="4" fill="#064E3B"/>
    <text x="2940" y="125" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="12" font-weight="bold" fill="#FFFFFF">Service Layer</text>

    <rect x="3010" y="108" width="120" height="26" rx="4" fill="#4C1D95"/>
    <text x="3070" y="125" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="12" font-weight="bold" fill="#FFFFFF">Repository Layer</text>

    <rect x="3145" y="108" width="110" height="26" rx="4" fill="#1E293B"/>
    <text x="3200" y="125" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="12" font-weight="bold" fill="#FFFFFF">Servlet Layer</text>

    <!-- Encapsulation Note -->
    <text x="2760" y="172" font-family="'Segoe UI', Arial" font-size="12.5" fill="#475569">All persisted fields are <tspan font-weight="bold" fill="#DC2626">private (-)</tspan> with corresponding public getters/setters (<tspan font-weight="bold" fill="#16A34A">+</tspan>).</text>
  </g>

  <!-- LAYER BOUNDARY LABELS -->
  <text x="80" y="260" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#475569" letter-spacing="1">1. PRESENTATION &amp; CONTROLLER TIER (WEB LAYER)</text>
  <text x="870" y="260" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#047857" letter-spacing="1">2. BUSINESS LOGIC &amp; SERVICE TIER (6 MEMBERS ALLOCATED CRUD SERVICES)</text>
  
  <text x="80" y="755" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#1E3A8A" letter-spacing="1">3. CORE DOMAIN MODEL TIER (OOP OBJECT MODEL, INHERITANCE, ENCAPSULATION &amp; ASSOCIATIONS)</text>
  
  <text x="1000" y="1515" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#6D28D9" letter-spacing="1">4. DATA PERSISTENCE &amp; REPOSITORY TIER (ABSTRACTION BEHIND StoreRepository INTERFACE)</text>

  <!-- RENDER ALL RELATIONSHIPS FIRST (BEHIND CLASSES) -->
  ${connectorsSvg}

  <!-- RENDER ALL CLASS BOXES -->
  ${classesSvg}

  <!-- ==================== OFFICIAL TITLE BLOCK (BOTTOM-RIGHT) ==================== -->
  <g class="title-block" transform="translate(2580, 2040)">
    <rect x="0" y="0" width="860" height="340" rx="8" fill="#FFFFFF" stroke="#0F2744" stroke-width="2" filter="url(#drop-shadow)"/>
    
    <!-- Title Block Header -->
    <rect x="0" y="0" width="860" height="50" rx="8" fill="#0F2744"/>
    <text x="430" y="32" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="18" font-weight="bold" fill="#FFFFFF">SLIIT · FACULTY OF COMPUTING · SE1020</text>

    <!-- Table Grid Lines -->
    <line x1="0" y1="95" x2="860" y2="95" stroke="#CBD5E1" stroke-width="1.2"/>
    <line x1="0" y1="140" x2="860" y2="140" stroke="#CBD5E1" stroke-width="1.2"/>
    <line x1="0" y1="185" x2="860" y2="185" stroke="#CBD5E1" stroke-width="1.2"/>
    <line x1="430" y1="50" x2="430" y2="185" stroke="#CBD5E1" stroke-width="1.2"/>

    <!-- Row 1 -->
    <text x="18" y="78" font-family="'Segoe UI', Arial" font-size="12" fill="#64748B">PROJECT TITLE:</text>
    <text x="130" y="78" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#0F2744">Book &amp; Bloom (Online Bookstore)</text>

    <text x="448" y="78" font-family="'Segoe UI', Arial" font-size="12" fill="#64748B">DRAWING TITLE:</text>
    <text x="565" y="78" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#0F2744">A3 Detailed UML Class Diagram</text>

    <!-- Row 2 -->
    <text x="18" y="123" font-family="'Segoe UI', Arial" font-size="12" fill="#64748B">PAPER SIZE:</text>
    <text x="110" y="123" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">ISO A3 Landscape (420 x 297 mm)</text>

    <text x="448" y="123" font-family="'Segoe UI', Arial" font-size="12" fill="#64748B">EVALUATION DATE:</text>
    <text x="585" y="123" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">November 2026 (Final Viva)</text>

    <!-- Row 3 -->
    <text x="18" y="168" font-family="'Segoe UI', Arial" font-size="12" fill="#64748B">ARCHITECTURE:</text>
    <text x="135" y="168" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#0F2744">Three-Tier MVC / Repository Pattern</text>

    <text x="448" y="168" font-family="'Segoe UI', Arial" font-size="12" fill="#64748B">STATUS:</text>
    <text x="515" y="168" font-family="'Segoe UI', Arial" font-size="13" font-weight="bold" fill="#16A34A">100% Implemented &amp; Verified Live</text>

    <!-- Group Members Grid (Row 4) -->
    <rect x="0" y="185" width="860" height="30" fill="#F1F5F9"/>
    <text x="18" y="205" font-family="'Segoe UI', Arial" font-size="12" font-weight="bold" fill="#0F2744">GROUP WORKLOAD &amp; COMPONENT ALLOCATION (6 TEAM MEMBERS):</text>

    <text x="18" y="235" font-family="'Segoe UI', Arial" font-size="12" fill="#1E293B"><tspan font-weight="bold" fill="#0F2744">IT25102131:</tspan> User Management &amp; Auth (Customer / AdminUser)</text>
    <text x="448" y="235" font-family="'Segoe UI', Arial" font-size="12" fill="#1E293B"><tspan font-weight="bold" fill="#0F2744">IT25102114:</tspan> Book Management (PrintedBook / EBook)</text>

    <text x="18" y="265" font-family="'Segoe UI', Arial" font-size="12" fill="#1E293B"><tspan font-weight="bold" fill="#0F2744">IT25102130:</tspan> Order &amp; Delivery Management (Order / OrderLine)</text>
    <text x="448" y="265" font-family="'Segoe UI', Arial" font-size="12" fill="#1E293B"><tspan font-weight="bold" fill="#0F2744">IT25101966:</tspan> Author Management (Era, Awards, Nationality)</text>

    <text x="18" y="295" font-family="'Segoe UI', Arial" font-size="12" fill="#1E293B"><tspan font-weight="bold" fill="#0F2744">IT25102132:</tspan> Category Management (Navigation &amp; Filtering)</text>
    <text x="448" y="295" font-family="'Segoe UI', Arial" font-size="12" fill="#1E293B"><tspan font-weight="bold" fill="#0F2744">IT25102519:</tspan> Review &amp; Rating Management (Moderation)</text>

    <text x="18" y="325" font-family="'Segoe UI', Arial" font-size="11.5" font-style="italic" fill="#64748B">GitHub: https://github.com/IT25102131/book-and-bloom-se1020 · Sheet 1 of 1 · Master Evaluation Copy</text>
  </g>

</svg>
  `;

  return fullSvg;
}

// Write the files
const svgContent = buildA3Svg();
const svgPath = path.join(__dirname, '..', 'docs', 'class-diagram-A3.svg');
fs.writeFileSync(svgPath, svgContent, 'utf-8');
console.log(`Generated SVG: ${svgPath} (${(svgContent.length / 1024).toFixed(1)} KB)`);

// Build HTML wrapper for printing
const htmlWrapper = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Book & Bloom — SE1020 A3 UML Class Diagram</title>
<style>
  @page {
    size: A3 landscape;
    margin: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 420mm;
    height: 297mm;
    background: #F8FAFC;
    overflow: hidden;
  }
  svg {
    display: block;
    width: 420mm;
    height: 297mm;
  }
</style>
</head>
<body>
${svgContent}
</body>
</html>`;

const htmlPath = path.join(__dirname, '..', 'docs', 'class-diagram-A3.html');
fs.writeFileSync(htmlPath, htmlWrapper, 'utf-8');
console.log(`Generated HTML: ${htmlPath}`);

// Run Chrome to render PDF and PNG
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pdfPath = path.join(__dirname, '..', 'docs', 'Book-and-Bloom-SE1020-Class-Diagram-A3.pdf');
const desktopPdf = 'C:\\Users\\USER\\Desktop\\Book-and-Bloom-SE1020-Class-Diagram-A3.pdf';

console.log("Rendering A3 Landscape PDF with Chrome...");
try {
  execSync(`"${chrome}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`, { stdio: 'inherit' });
  console.log(`Generated A3 PDF: ${pdfPath}`);

  // Copy to Desktop
  fs.copyFileSync(pdfPath, desktopPdf);
  console.log(`Copied to Desktop: ${desktopPdf}`);

  // Also render a high-resolution screenshot (PNG) for quick viewing/printing
  const pngPath = path.join(__dirname, '..', 'docs', 'Book-and-Bloom-SE1020-Class-Diagram-A3.png');
  const desktopPng = 'C:\\Users\\USER\\Desktop\\Book-and-Bloom-SE1020-Class-Diagram-A3.png';
  console.log("Rendering A3 PNG screenshot with Chrome...");
  execSync(`"${chrome}" --headless --disable-gpu --window-size=3508,2480 --screenshot="${pngPath}" "${htmlPath}"`, { stdio: 'inherit' });
  fs.copyFileSync(pngPath, desktopPng);
  console.log(`Generated and Copied A3 PNG: ${desktopPng}`);
} catch (e) {
  console.error("Chrome rendering error:", e);
}
