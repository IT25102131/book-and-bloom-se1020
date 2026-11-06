const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../src/main/resources/static/images/covers');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function createCover({ file, bg1, bg2, accent, ribbon, title1, title2, sub, author, art }) {
  const titleBlock = title2
    ? `<text y="0" fill="#FFFFFF" font-family="'Playfair Display', Georgia, serif" font-size="24" font-weight="800" letter-spacing="-0.5" filter="url(#shadow)">${title1}</text>
       <text y="30" fill="#FFFFFF" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="800" letter-spacing="-0.5" filter="url(#shadow)">${title2}</text>
       <text y="58" fill="rgba(255,255,255,0.88)" font-family="Segoe UI, sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">${sub}</text>`
    : `<text y="0" fill="#FFFFFF" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="800" letter-spacing="-0.5" filter="url(#shadow)">${title1}</text>
       <text y="28" fill="rgba(255,255,255,0.88)" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="600" letter-spacing="0.5">${sub}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <linearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.5"/>
      <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="50%" stop-color="#000000" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="400" height="600" fill="url(#bg)"/>
  
  <!-- Subtle Texture Grid -->
  <rect width="400" height="600" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Ornate Decorative Frame -->
  <rect x="20" y="20" width="360" height="560" rx="4" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.4"/>
  <rect x="25" y="25" width="350" height="550" rx="2" fill="none" stroke="${accent}" stroke-width="0.75" stroke-opacity="0.25"/>

  <!-- Top Ribbon Banner -->
  <g transform="translate(40, 42)">
    <rect x="0" y="0" width="320" height="24" rx="12" fill="rgba(0,0,0,0.35)"/>
    <text x="160" y="16" fill="${accent}" font-family="Segoe UI, sans-serif" font-size="9.5" font-weight="800" letter-spacing="2" text-anchor="middle">${ribbon}</text>
  </g>

  <!-- Title & Subtitle Block -->
  <g transform="translate(200, 112)" text-anchor="middle">
    ${titleBlock}
  </g>

  <!-- Center Artwork -->
  <g transform="translate(200, 310)">
    ${art}
  </g>

  <!-- Bottom Author Banner -->
  <g transform="translate(200, 520)" text-anchor="middle">
    <line x1="-100" y1="0" x2="100" y2="0" stroke="${accent}" stroke-width="1" stroke-opacity="0.4"/>
    <circle cx="0" cy="0" r="3" fill="${accent}"/>
    <text y="24" fill="${accent}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" letter-spacing="2.5">${author}</text>
    <text y="40" fill="rgba(255,255,255,0.65)" font-family="Segoe UI, sans-serif" font-size="8.5" font-weight="600" letter-spacing="1.5">SARASAVI · BOOK &amp; BLOOM PRESS</text>
  </g>

  <!-- 3D Spine Crease Highlight -->
  <rect x="0" y="0" width="20" height="600" fill="url(#spine)"/>
  
  <!-- Right Page Edge -->
  <rect x="394" y="4" width="4" height="592" fill="#E2E8F0" opacity="0.6"/>
</svg>`;

  fs.writeFileSync(path.join(outDir, file), svg, 'utf-8');
}

const covers = [
  {
    file: "the-art-of-slowing-down.svg",
    bg1: "#B45309", bg2: "#78350F", accent: "#FDE68A",
    ribbon: "NATIONAL BESTSELLER",
    title1: "THE ART OF", title2: "SLOWING DOWN",
    sub: "Finding Calm in an Accelerated World",
    author: "ELLIOT REED",
    art: `<circle cx="0" cy="0" r="72" fill="rgba(255,255,255,0.08)" stroke="#FDE68A" stroke-width="1.5"/>
          <path d="M-30,25 C-15,30 15,30 30,25 C25,45 -25,45 -30,25 Z" fill="#FDE68A" opacity="0.9"/>
          <path d="M-10,18 C-5,5 -20,-15 -5,-35 M5,18 C15,0 0,-20 10,-35" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <circle cx="45" cy="-35" r="16" fill="#FDE68A" opacity="0.35"/>`
  },
  {
    file: "where-the-light-falls.svg",
    bg1: "#064E3B", bg2: "#022C22", accent: "#A7F3D0",
    ribbon: "SARASAVI FICTION PRIZE",
    title1: "WHERE THE", title2: "LIGHT FALLS",
    sub: "A Colombo Family Story of Grace &amp; Memory",
    author: "MAYA SENANAYAKE",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#A7F3D0" stroke-width="1.5"/>
          <path d="M-40,40 L-40,-30 C-40,-50 40,-50 40,-30 L40,40 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
          <line x1="0" y1="-45" x2="0" y2="40" stroke="#FFFFFF" stroke-width="1.5"/>
          <line x1="-40" y1="0" x2="40" y2="0" stroke="#FFFFFF" stroke-width="1.5"/>
          <polygon points="-30,35 45,-20 55,-10 -20,45" fill="#FDE047" opacity="0.45"/>`
  },
  {
    file: "wild-ceylon.svg",
    bg1: "#14532D", bg2: "#052E16", accent: "#86EFAC",
    ribbon: "ILLUSTRATED NATURE CLASSIC",
    title1: "WILD CEYLON", title2: "",
    sub: "Expeditions into the Heart of the Island",
    author: "ARUN FERNANDO",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#86EFAC" stroke-width="1.5"/>
          <polygon points="-65,35 -20,-25 15,20 40,-10 65,35" fill="none" stroke="#86EFAC" stroke-width="2"/>
          <circle cx="0" cy="-35" r="18" fill="#FDE047" opacity="0.7"/>
          <path d="M-55,25 Q-20,10 0,22 Q30,12 55,25" fill="none" stroke="#FFFFFF" stroke-width="2"/>`
  },
  {
    file: "a-little-more-wonder.svg",
    bg1: "#831843", bg2: "#500724", accent: "#FBCFE8",
    ribbon: "CONTEMPORARY FICTION",
    title1: "A LITTLE MORE", title2: "WONDER",
    sub: "Unfinished Letters &amp; Found Friendships",
    author: "CLARA BENNETT",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FBCFE8" stroke-width="1.5"/>
          <rect x="-35" y="-20" width="70" height="48" rx="4" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M-35,-20 L0,8 L35,-20" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <polygon points="0,-45 8,-28 26,-28 12,-16 17,2 0,-9 -17,2 -12,-16 -26,-28 -8,-28" fill="#FDE047" transform="scale(0.7) translate(0, -30)"/>`
  },
  {
    file: "make-room-for-ideas.svg",
    bg1: "#1D4ED8", bg2: "#0F172A", accent: "#93C5FD",
    ribbon: "CREATIVE STRATEGY GUIDE",
    title1: "MAKE ROOM", title2: "FOR IDEAS",
    sub: "From Untidy Thoughts to Finished Work",
    author: "SAMIRA KHAN",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#93C5FD" stroke-width="1.5"/>
          <polygon points="0,-45 35,-15 35,35 -35,35 -35,-15" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <line x1="0" y1="-45" x2="0" y2="35" stroke="#93C5FD" stroke-width="1.5"/>
          <circle cx="0" cy="-5" r="14" fill="#FBBF24"/>`
  },
  {
    file: "the-long-way-home.svg",
    bg1: "#C2410C", bg2: "#7C2D12", accent: "#FED7AA",
    ribbon: "TRAVEL ESSAY OF THE YEAR",
    title1: "THE LONG", title2: "WAY HOME",
    sub: "Coastal Railways &amp; Scenic Journeys",
    author: "OLIVER HAYES",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FED7AA" stroke-width="1.5"/>
          <path d="M-60,30 Q-20,0 0,35 Q30,10 60,30" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="0" cy="-20" r="22" fill="#FDBA74" opacity="0.8"/>
          <path d="M-25,10 C-15,-10 15,-10 25,10" fill="none" stroke="#FED7AA" stroke-width="2"/>`
  },
  {
    file: "the-quiet-garden.svg",
    bg1: "#3F6212", bg2: "#1A2E05", accent: "#D9F99D",
    ribbon: "BELOVED FICTION",
    title1: "THE QUIET", title2: "GARDEN",
    sub: "A Forgotten Gate &amp; New Beginnings",
    author: "CLARA BENNETT",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#D9F99D" stroke-width="1.5"/>
          <path d="M-30,40 L-30,-20 C-30,-40 30,-40 30,-20 L30,40" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M-20,40 L-20,-15 M0,40 L0,-25 M20,40 L20,-15" stroke="#D9F99D" stroke-width="1.5"/>
          <circle cx="0" cy="-35" r="6" fill="#FDE047"/>`
  },
  {
    file: "everyday-courage.svg",
    bg1: "#991B1B", bg2: "#450A0A", accent: "#FECACA",
    ribbon: "INSPIRATIONAL BESTSELLER",
    title1: "EVERYDAY", title2: "COURAGE",
    sub: "Small Steps Toward Meaningful Life",
    author: "ELLIOT REED",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FECACA" stroke-width="1.5"/>
          <polygon points="0,-45 40,35 -40,35" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="0" cy="0" r="16" fill="#F87171" opacity="0.75"/>`
  },
  {
    file: "designing-with-purpose.svg",
    bg1: "#0F172A", bg2: "#020617", accent: "#F97316",
    ribbon: "THE DEFINITIVE DESIGN GUIDE",
    title1: "DESIGNING", title2: "WITH PURPOSE",
    sub: "Human-Centered Problem Solving",
    author: "SAMIRA KHAN",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#F97316" stroke-width="1.5"/>
          <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="0" cy="0" r="35" fill="none" stroke="#F97316" stroke-width="2"/>
          <line x1="-35" y1="-35" x2="35" y2="35" stroke="#FFFFFF" stroke-width="1"/>`
  },
  {
    file: "letters-from-galle.svg",
    bg1: "#0369A1", bg2: "#082F49", accent: "#BAE6FD",
    ribbon: "CRITICALLY ACCLAIMED NOVEL",
    title1: "LETTERS", title2: "FROM GALLE",
    sub: "Two Strangers &amp; Secrets by the Sea",
    author: "MAYA SENANAYAKE",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#BAE6FD" stroke-width="1.5"/>
          <polygon points="-12,40 12,40 8,-35 -8,-35" fill="#FFFFFF"/>
          <circle cx="0" cy="-42" r="8" fill="#FDE047"/>
          <path d="M-50,42 Q0,20 50,42" stroke="#BAE6FD" stroke-width="2" fill="none"/>`
  },
  {
    file: "beyond-the-tea-hills.svg",
    bg1: "#047857", bg2: "#064E3B", accent: "#A7F3D0",
    ribbon: "CENTRAL HIGHLANDS SAGA",
    title1: "BEYOND THE", title2: "TEA HILLS",
    sub: "Paths Across Misty Nuwara Eliya Ridges",
    author: "ARUN FERNANDO",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#A7F3D0" stroke-width="1.5"/>
          <path d="M-60,35 Q-20,0 10,25 Q35,10 60,35" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
          <path d="M-50,15 Q-15,-10 20,10 Q40,-5 55,15" stroke="#A7F3D0" stroke-width="1.5" fill="none"/>
          <circle cx="25" cy="-25" r="18" fill="#FDE047" opacity="0.6"/>`
  },
  {
    file: "begin-again.svg",
    bg1: "#581C87", bg2: "#2E1065", accent: "#E9D5FF",
    ribbon: "MINDFULNESS &amp; REFLECTION",
    title1: "BEGIN AGAIN", title2: "",
    sub: "Building Habits That Leave Room for Living",
    author: "ELLIOT REED",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#E9D5FF" stroke-width="1.5"/>
          <path d="M0,-40 C25,-10 35,20 0,40 C-35,20 -25,-10 0,-40 Z" fill="#C084FC" opacity="0.8"/>
          <circle cx="0" cy="0" r="8" fill="#FDE047"/>`
  },
  {
    file: "gamperaliya.svg",
    bg1: "#7F1D1D", bg2: "#450A0A", accent: "#FDE047",
    ribbon: "PIONEER OF MODERN SINHALA LITERATURE",
    title1: "GAMPERALIYA", title2: "(ගම්පෙරළිය)",
    sub: "The Fall of the Southern Kaisaruwatte Manor",
    author: "MARTIN WICKRAMASINGHE",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE047" stroke-width="1.5"/>
          <polygon points="0,-40 50,0 0,40 -50,0" fill="none" stroke="#FDE047" stroke-width="2"/>
          <text y="8" fill="#FFFFFF" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="800" text-anchor="middle">ගම්</text>`
  },
  {
    file: "madol-doova.svg",
    bg1: "#0E7490", bg2: "#164E63", accent: "#CFFAFE",
    ribbon: "SRI LANKA'S MOST CELEBRATED ADVENTURE",
    title1: "MADOL DOOVA", title2: "(මඩොල් දූව)",
    sub: "The Boys of Koggala &amp; the Secret Island",
    author: "MARTIN WICKRAMASINGHE",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#CFFAFE" stroke-width="1.5"/>
          <path d="M-55,25 C-30,5 30,5 55,25 C30,45 -30,45 -55,25 Z" fill="#38BDF8" opacity="0.8"/>
          <path d="M-15,10 L0,-35 L15,10 Z" fill="#FFFFFF"/>`
  },
  {
    file: "seven-moons.svg",
    bg1: "#1E1B4B", bg2: "#0F172A", accent: "#F43F5E",
    ribbon: "★ WINNER OF THE BOOKER PRIZE 2022 ★",
    title1: "THE SEVEN MOONS OF", title2: "MAALI ALMEIDA",
    sub: "Afterlife, Memory &amp; Mystery in Colombo",
    author: "SHEHAN KARUNATILAKA",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#F43F5E" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="35" fill="#E11D48"/>
          <circle cx="15" cy="-8" r="30" fill="#1E1B4B"/>
          <circle cx="-35" cy="-35" r="5" fill="#FDE047"/>
          <circle cx="40" cy="-25" r="4" fill="#FDE047"/>`
  },
  {
    file: "atomic-habits.svg",
    bg1: "#1C1917", bg2: "#0C0A09", accent: "#EF4444",
    ribbon: "OVER 15 MILLION COPIES SOLD",
    title1: "ATOMIC HABITS", title2: "",
    sub: "Tiny Changes, Remarkable Lifelong Results",
    author: "JAMES CLEAR",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#EF4444" stroke-width="1.5"/>
          <g fill="#EF4444">
            <circle cx="0" cy="0" r="14"/>
            <circle cx="-35" cy="0" r="8"/> <circle cx="35" cy="0" r="8"/>
            <circle cx="0" cy="-35" r="8"/> <circle cx="0" cy="35" r="8"/>
            <circle cx="-25" cy="-25" r="6"/> <circle cx="25" cy="25" r="6"/>
            <circle cx="25" cy="-25" r="6"/> <circle cx="-25" cy="25" r="6"/>
          </g>`
  },
  {
    file: "psychology-of-money.svg",
    bg1: "#064E3B", bg2: "#022C22", accent: "#FDE047",
    ribbon: "WALL STREET JOURNAL BESTSELLER",
    title1: "THE PSYCHOLOGY", title2: "OF MONEY",
    sub: "Timeless Lessons on Wealth &amp; Happiness",
    author: "MORGAN HOUSEL",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE047" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="40" fill="none" stroke="#FDE047" stroke-width="3"/>
          <text y="14" fill="#FDE047" font-family="Segoe UI, sans-serif" font-size="42" font-weight="800" text-anchor="middle">$</text>`
  },
  {
    file: "clean-code.svg",
    bg1: "#1E3A8A", bg2: "#172554", accent: "#60A5FA",
    ribbon: "SOFTWARE CRAFTSMANSHIP SERIES",
    title1: "CLEAN CODE", title2: "",
    sub: "A Handbook of Agile Craftsmanship",
    author: "ROBERT C. MARTIN",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#60A5FA" stroke-width="1.5"/>
          <text y="12" fill="#FFFFFF" font-family="Consolas, monospace" font-size="34" font-weight="800" text-anchor="middle">&lt; / &gt;</text>
          <circle cx="0" cy="0" r="48" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="6,4"/>`
  },
  {
    file: "kuda-hora.svg",
    bg1: "#C2410C", bg2: "#7C2D12", accent: "#FDE047",
    ribbon: "AWARD-WINNING CHILDREN'S CLASSIC",
    title1: "KUDA HORA", title2: "(කුඩා හොරා)",
    sub: "The Umbrella Thief — A Celebrated Tale",
    author: "SYBIL WETTASINGHE",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE047" stroke-width="1.5"/>
          <path d="M-45,10 C-45,-30 45,-30 45,10 Z" fill="#FDE047"/>
          <line x1="0" y1="10" x2="0" y2="40" stroke="#FFFFFF" stroke-width="3"/>
          <path d="M0,40 C0,48 -10,48 -10,40" fill="none" stroke="#FFFFFF" stroke-width="3"/>`
  },
  {
    file: "ape-gama.svg",
    bg1: "#365314", bg2: "#1A2E05", accent: "#FEF08A",
    ribbon: "HERITAGE SINHALA LITERATURE",
    title1: "APE GAMA", title2: "(අපේ ගම)",
    sub: "Memories of Village Life &amp; Lost Traditions",
    author: "MARTIN WICKRAMASINGHE",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FEF08A" stroke-width="1.5"/>
          <polygon points="0,-35 45,15 -45,15" fill="#A3E635" opacity="0.8"/>
          <rect x="-15" y="15" width="30" height="25" fill="#FEF08A"/>`
  },
  {
    file: "birds-of-sinharaja.svg",
    bg1: "#065F46", bg2: "#022C22", accent: "#38BDF8",
    ribbon: "UNESCO WORLD HERITAGE SERIES",
    title1: "BIRDS OF", title2: "SINHARAJA",
    sub: "A Photographic Guide to the Primeval Forest",
    author: "ARUN FERNANDO",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#38BDF8" stroke-width="1.5"/>
          <path d="M-30,30 C-10,0 20,-20 40,-35 C20,10 -10,25 -30,30 Z" fill="#38BDF8"/>
          <circle cx="28" cy="-22" r="3" fill="#FFFFFF"/>`
  },
  {
    file: "modern-architecture.svg",
    bg1: "#312E81", bg2: "#1E1B4B", accent: "#38BDF8",
    ribbon: "ENTERPRISE SOFTWARE ENGINEERING",
    title1: "MODERN SYSTEM", title2: "ARCHITECTURE",
    sub: "Microservices, Distributed Scale &amp; Mesh",
    author: "SAMIRA KHAN",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#38BDF8" stroke-width="1.5"/>
          <polygon points="0,-40 35,-20 0,0 -35,-20" fill="#38BDF8" opacity="0.8"/>
          <polygon points="0,0 35,-20 35,15 0,35" fill="#1D4ED8"/>
          <polygon points="0,0 -35,-20 -35,15 0,35" fill="#60A5FA"/>`
  },
  {
    file: "mindful-living.svg",
    bg1: "#78350F", bg2: "#451A03", accent: "#FDE68A",
    ribbon: "GUIDE TO PEACE OF MIND",
    title1: "THE ART OF", title2: "MINDFUL LIVING",
    sub: "Daily Meditations for Clarity &amp; Balance",
    author: "ELLIOT REED",
    art: `<circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE68A" stroke-width="1.5"/>
          <ellipse cx="0" cy="25" rx="35" ry="12" fill="#D97706"/>
          <ellipse cx="0" cy="5" rx="26" ry="10" fill="#F59E0B"/>
          <ellipse cx="0" cy="-12" rx="16" ry="7" fill="#FDE68A"/>`
  }
];

covers.forEach(createCover);
console.log(`Generated ${covers.length} high-res SVG book covers in ${outDir}`);

