$ErrorActionPreference = 'Stop'
$dir = Join-Path $PSScriptRoot "..\src\main\resources\static\images\covers"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

function Save-Cover {
    param($File, $Bg1, $Bg2, $Accent, $Ribbon, $Title1, $Title2, $Sub, $Author, $Art)

    $titleBlock = if ($Title2) {
        "<text y='0' fill='#FFFFFF' font-family='Playfair Display, Georgia, serif' font-size='24' font-weight='800' letter-spacing='-0.5' filter='url(#shadow)'>$Title1</text><text y='30' fill='#FFFFFF' font-family='Playfair Display, Georgia, serif' font-size='22' font-weight='800' letter-spacing='-0.5' filter='url(#shadow)'>$Title2</text><text y='58' fill='rgba(255,255,255,0.85)' font-family='Segoe UI, sans-serif' font-size='11' font-weight='500' letter-spacing='0.5'>$Sub</text>"
    } else {
        "<text y='0' fill='#FFFFFF' font-family='Playfair Display, Georgia, serif' font-size='26' font-weight='800' letter-spacing='-0.5' filter='url(#shadow)'>$Title1</text><text y='28' fill='rgba(255,255,255,0.85)' font-family='Segoe UI, sans-serif' font-size='11.5' font-weight='500' letter-spacing='0.5'>$Sub</text>"
    }

    $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="$Bg1"/>
      <stop offset="100%" stop-color="$Bg2"/>
    </linearGradient>
    <linearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
      <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#000000" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <rect width="400" height="600" fill="url(#bg)"/>
  <rect x="20" y="20" width="360" height="560" rx="4" fill="none" stroke="$Accent" stroke-width="1.2" stroke-opacity="0.35"/>
  <rect x="24" y="24" width="352" height="552" rx="2" fill="none" stroke="$Accent" stroke-width="0.6" stroke-opacity="0.2"/>

  <g transform="translate(40, 42)">
    <rect x="0" y="0" width="320" height="24" rx="12" fill="rgba(0,0,0,0.3)"/>
    <text x="160" y="16" fill="$Accent" font-family="Segoe UI, sans-serif" font-size="9.5" font-weight="800" letter-spacing="2" text-anchor="middle">$Ribbon</text>
  </g>

  <g transform="translate(200, 110)" text-anchor="middle">
    $titleBlock
  </g>

  <g transform="translate(200, 310)">
    $Art
  </g>

  <g transform="translate(200, 520)" text-anchor="middle">
    <line x1="-100" y1="0" x2="100" y2="0" stroke="$Accent" stroke-width="1" stroke-opacity="0.3"/>
    <circle cx="0" cy="0" r="3" fill="$Accent"/>
    <text y="24" fill="$Accent" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="800" letter-spacing="2.5">$Author</text>
    <text y="40" fill="rgba(255,255,255,0.6)" font-family="Segoe UI, sans-serif" font-size="8.5" font-weight="600" letter-spacing="1.5">SARASAVI · BOOK &amp; BLOOM PRESS</text>
  </g>

  <rect x="0" y="0" width="20" height="600" fill="url(#spine)"/>
  <rect x="394" y="4" width="4" height="592" fill="#E2E8F0" opacity="0.6"/>
</svg>
"@
    Set-Content -Path (Join-Path $dir $File) -Value $svg -Encoding UTF8
}

# 1. The Art of Slowing Down
Save-Cover "the-art-of-slowing-down.svg" "#B45309" "#78350F" "#FDE68A" "NATIONAL BESTSELLER" "THE ART OF" "SLOWING DOWN" "Finding Calm in an Accelerated World" "ELLIOT REED" @"
  <circle cx="0" cy="0" r="70" fill="rgba(255,255,255,0.08)" stroke="#FDE68A" stroke-width="1.5"/>
  <path d="M-30,25 C-15,30 15,30 30,25 C25,45 -25,45 -30,25 Z" fill="#FDE68A" opacity="0.9"/>
  <path d="M-10,18 C-5,5 -20,-15 -5,-35 M5,18 C15,0 0,-20 10,-35" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="45" cy="-35" r="16" fill="#FDE68A" opacity="0.3"/>
"@

# 2. Where the Light Falls
Save-Cover "where-the-light-falls.svg" "#064E3B" "#022C22" "#A7F3D0" "SARASAVI FICTION PRIZE" "WHERE THE" "LIGHT FALLS" "A Colombo Family Story of Grace & Memory" "MAYA SENANAYAKE" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#A7F3D0" stroke-width="1.5"/>
  <path d="M-40,40 L-40,-30 C-40,-50 40,-50 40,-30 L40,40 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="0" y1="-45" x2="0" y2="40" stroke="#FFFFFF" stroke-width="1.5"/>
  <line x1="-40" y1="0" x2="40" y2="0" stroke="#FFFFFF" stroke-width="1.5"/>
  <polygon points="-30,35 45,-20 55,-10 -20,45" fill="#FDE047" opacity="0.4"/>
"@

# 3. Wild Ceylon
Save-Cover "wild-ceylon.svg" "#14532D" "#052E16" "#86EFAC" "ILLUSTRATED NATURE CLASSIC" "WILD CEYLON" "" "Expeditions into the Heart of the Island" "ARUN FERNANDO" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#86EFAC" stroke-width="1.5"/>
  <polygon points="-65,35 -20,-25 15,20 40,-10 65,35" fill="none" stroke="#86EFAC" stroke-width="2"/>
  <circle cx="0" cy="-35" r="18" fill="#FDE047" opacity="0.6"/>
  <path d="M-55,25 Q-20,10 0,22 Q30,12 55,25" fill="none" stroke="#FFFFFF" stroke-width="2"/>
"@

# 4. A Little More Wonder
Save-Cover "a-little-more-wonder.svg" "#831843" "#500724" "#FBCFE8" "CONTEMPORARY FICTION" "A LITTLE MORE" "WONDER" "Unfinished Letters & Found Friendships" "CLARA BENNETT" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FBCFE8" stroke-width="1.5"/>
  <rect x="-35" y="-20" width="70" height="48" rx="4" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M-35,-20 L0,8 L35,-20" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <polygon points="0,-45 8,-28 26,-28 12,-16 17,2 0,-9 -17,2 -12,-16 -26,-28 -8,-28" fill="#FDE047" transform="scale(0.7) translate(0, -30)"/>
"@

# 5. Make Room for Ideas
Save-Cover "make-room-for-ideas.svg" "#1D4ED8" "#0F172A" "#93C5FD" "CREATIVE STRATEGY GUIDE" "MAKE ROOM" "FOR IDEAS" "From Untidy Thoughts to Finished Work" "SAMIRA KHAN" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#93C5FD" stroke-width="1.5"/>
  <polygon points="0,-45 35,-15 35,35 -35,35 -35,-15" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <line x1="0" y1="-45" x2="0" y2="35" stroke="#93C5FD" stroke-width="1.5"/>
  <circle cx="0" cy="-5" r="14" fill="#FBBF24"/>
"@

# 6. The Long Way Home
Save-Cover "the-long-way-home.svg" "#C2410C" "#7C2D12" "#FED7AA" "TRAVEL ESSAY OF THE YEAR" "THE LONG" "WAY HOME" "Coastal Railways & Scenic Journeys" "OLIVER HAYES" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FED7AA" stroke-width="1.5"/>
  <path d="M-60,30 Q-20,0 0,35 Q30,10 60,30" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="0" cy="-20" r="22" fill="#FDBA74" opacity="0.8"/>
  <path d="M-25,10 C-15,-10 15,-10 25,10" fill="none" stroke="#FED7AA" stroke-width="2"/>
"@

# 7. The Quiet Garden
Save-Cover "the-quiet-garden.svg" "#3F6212" "#1A2E05" "#D9F99D" "BELOVED FICTION" "THE QUIET" "GARDEN" "A Forgotten Gate & New Beginnings" "CLARA BENNETT" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#D9F99D" stroke-width="1.5"/>
  <path d="M-30,40 L-30,-20 C-30,-40 30,-40 30,-20 L30,40" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M-20,40 L-20,-15 M0,40 L0,-25 M20,40 L20,-15" stroke="#D9F99D" stroke-width="1.5"/>
  <circle cx="0" cy="-35" r="6" fill="#FDE047"/>
"@

# 8. Everyday Courage
Save-Cover "everyday-courage.svg" "#991B1B" "#450A0A" "#FECACA" "INSPIRATIONAL BESTSELLER" "EVERYDAY" "COURAGE" "Small Steps Toward Meaningful Life" "ELLIOT REED" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FECACA" stroke-width="1.5"/>
  <polygon points="0,-45 40,35 -40,35" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="0" cy="0" r="16" fill="#F87171" opacity="0.7"/>
"@

# 9. Designing with Purpose
Save-Cover "designing-with-purpose.svg" "#0F172A" "#020617" "#F97316" "THE DEFINITIVE DESIGN GUIDE" "DESIGNING" "WITH PURPOSE" "Human-Centered Problem Solving" "SAMIRA KHAN" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#F97316" stroke-width="1.5"/>
  <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="0" cy="0" r="35" fill="none" stroke="#F97316" stroke-width="2"/>
  <line x1="-35" y1="-35" x2="35" y2="35" stroke="#FFFFFF" stroke-width="1"/>
"@

# 10. Letters from Galle
Save-Cover "letters-from-galle.svg" "#0369A1" "#082F49" "#BAE6FD" "CRITICALLY ACCLAIMED NOVEL" "LETTERS" "FROM GALLE" "Two Strangers & Secrets by the Sea" "MAYA SENANAYAKE" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#BAE6FD" stroke-width="1.5"/>
  <polygon points="-12,40 12,40 8,-35 -8,-35" fill="#FFFFFF"/>
  <circle cx="0" cy="-42" r="8" fill="#FDE047"/>
  <path d="M-50,42 Q0,20 50,42" stroke="#BAE6FD" stroke-width="2" fill="none"/>
"@

# 11. Beyond the Tea Hills
Save-Cover "beyond-the-tea-hills.svg" "#047857" "#064E3B" "#A7F3D0" "CENTRAL HIGHLANDS SAGA" "BEYOND THE" "TEA HILLS" "Paths Across the Misty Nuwara Eliya Ridges" "ARUN FERNANDO" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#A7F3D0" stroke-width="1.5"/>
  <path d="M-60,35 Q-20,0 10,25 Q35,10 60,35" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
  <path d="M-50,15 Q-15,-10 20,10 Q40,-5 55,15" stroke="#A7F3D0" stroke-width="1.5" fill="none"/>
  <circle cx="25" cy="-25" r="18" fill="#FDE047" opacity="0.6"/>
"@

# 12. Begin Again
Save-Cover "begin-again.svg" "#581C87" "#2E1065" "#E9D5FF" "MINDFULNESS & REFLECTION" "BEGIN AGAIN" "" "Building Habits That Leave Room for Living" "ELLIOT REED" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#E9D5FF" stroke-width="1.5"/>
  <path d="M0,-40 C25,-10 35,20 0,40 C-35,20 -25,-10 0,-40 Z" fill="#C084FC" opacity="0.8"/>
  <circle cx="0" cy="0" r="8" fill="#FDE047"/>
"@

# 13. Gamperaliya
Save-Cover "gamperaliya.svg" "#7F1D1D" "#450A0A" "#FDE047" "PIONEER OF MODERN SINHALA LITERATURE" "GAMPERALIYA" "(ගම්පෙරළිය)" "The Changing Village & the Fall of the Mahagedara" "MARTIN WICKRAMASINGHE" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE047" stroke-width="1.5"/>
  <polygon points="0,-40 50,0 0,40 -50,0" fill="none" stroke="#FDE047" stroke-width="2"/>
  <text y="8" fill="#FFFFFF" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="800" text-anchor="middle">ගම්</text>
"@

# 14. Madol Doova
Save-Cover "madol-doova.svg" "#0E7490" "#164E63" "#CFFAFE" "SRI LANKA'S MOST CELEBRATED ADVENTURE" "MADOL DOOVA" "(මඩොල් දූව)" "The Boys of Koggala & the Secret Island" "MARTIN WICKRAMASINGHE" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#CFFAFE" stroke-width="1.5"/>
  <path d="M-55,25 C-30,5 30,5 55,25 C30,45 -30,45 -55,25 Z" fill="#38BDF8" opacity="0.8"/>
  <path d="M-15,10 L0,-35 L15,10 Z" fill="#FFFFFF"/>
"@

# 15. The Seven Moons of Maali Almeida
Save-Cover "seven-moons.svg" "#1E1B4B" "#0F172A" "#F43F5E" "★ WINNER OF THE BOOKER PRIZE 2022 ★" "THE SEVEN MOONS OF" "MAALI ALMEIDA" "Afterlife, Memory & Mystery in Colombo" "SHEHAN KARUNATILAKA" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#F43F5E" stroke-width="1.5"/>
  <circle cx="0" cy="0" r="35" fill="#E11D48"/>
  <circle cx="15" cy="-8" r="30" fill="#1E1B4B"/>
  <circle cx="-35" cy="-35" r="5" fill="#FDE047"/>
  <circle cx="40" cy="-25" r="4" fill="#FDE047"/>
"@

# 16. Atomic Habits
Save-Cover "atomic-habits.svg" "#1C1917" "#0C0A09" "#EF4444" "OVER 15 MILLION COPIES SOLD" "ATOMIC HABITS" "" "Tiny Changes, Remarkable Lifelong Results" "JAMES CLEAR" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#EF4444" stroke-width="1.5"/>
  <g fill="#EF4444">
    <circle cx="0" cy="0" r="14"/>
    <circle cx="-35" cy="0" r="8"/> <circle cx="35" cy="0" r="8"/>
    <circle cx="0" cy="-35" r="8"/> <circle cx="0" cy="35" r="8"/>
    <circle cx="-25" cy="-25" r="6"/> <circle cx="25" cy="25" r="6"/>
    <circle cx="25" cy="-25" r="6"/> <circle cx="-25" cy="25" r="6"/>
  </g>
"@

# 17. The Psychology of Money
Save-Cover "psychology-of-money.svg" "#064E3B" "#022C22" "#FDE047" "INTERNATIONAL WALL STREET BESTSELLER" "THE PSYCHOLOGY" "OF MONEY" "Timeless Lessons on Wealth, Greed & Happiness" "MORGAN HOUSEL" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE047" stroke-width="1.5"/>
  <circle cx="0" cy="0" r="40" fill="none" stroke="#FDE047" stroke-width="3"/>
  <text y="14" fill="#FDE047" font-family="Segoe UI, sans-serif" font-size="42" font-weight="800" text-anchor="middle">$</text>
"@

# 18. Clean Code
Save-Cover "clean-code.svg" "#1E3A8A" "#172554" "#60A5FA" "THE SOFTWARE CRAFTSMANSHIP CLASSIC" "CLEAN CODE" "" "A Handbook of Agile Software Craftsmanship" "ROBERT C. MARTIN" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#60A5FA" stroke-width="1.5"/>
  <text y="12" fill="#FFFFFF" font-family="Consolas, monospace" font-size="34" font-weight="800" text-anchor="middle">&lt; / &gt;</text>
  <circle cx="0" cy="0" r="48" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="6,4"/>
"@

# 19. Kuda Hora
Save-Cover "kuda-hora.svg" "#C2410C" "#7C2D12" "#FDE047" "AWARD-WINNING CHILDREN'S FOLK CLASSIC" "KUDA HORA" "(කුඩා හොරා)" "The Umbrella Thief — A Timeless Tale" "SYBIL WETTASINGHE" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE047" stroke-width="1.5"/>
  <path d="M-45,10 C-45,-30 45,-30 45,10 Z" fill="#FDE047"/>
  <line x1="0" y1="10" x2="0" y2="40" stroke="#FFFFFF" stroke-width="3"/>
  <path d="M0,40 C0,48 -10,48 -10,40" fill="none" stroke="#FFFFFF" stroke-width="3"/>
"@

# 20. Ape Gama
Save-Cover "ape-gama.svg" "#365314" "#1A2E05" "#FEF08A" "HERITAGE SINHALA LITERATURE" "APE GAMA" "(අපේ ගම)" "Memories of Village Life & Southern Traditions" "MARTIN WICKRAMASINGHE" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FEF08A" stroke-width="1.5"/>
  <polygon points="0,-35 45,15 -45,15" fill="#A3E635" opacity="0.8"/>
  <rect x="-15" y="15" width="30" height="25" fill="#FEF08A"/>
"@

# 21. Birds of Sinharaja
Save-Cover "birds-of-sinharaja.svg" "#065F46" "#022C22" "#38BDF8" "UNESCO WORLD HERITAGE SERIES" "BIRDS OF" "SINHARAJA" "A Photographic Guide to the Primeval Rainforest" "ARUN FERNANDO" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#38BDF8" stroke-width="1.5"/>
  <path d="M-30,30 C-10,0 20,-20 40,-35 C20,10 -10,25 -30,30 Z" fill="#38BDF8"/>
  <circle cx="28" cy="-22" r="3" fill="#FFFFFF"/>
"@

# 22. Modern Architecture
Save-Cover "modern-architecture.svg" "#312E81" "#1E1B4B" "#38BDF8" "ENTERPRISE SOFTWARE ENGINEERING" "MODERN SYSTEM" "ARCHITECTURE" "Microservices, Distributed Scale & Cloud Mesh" "SAMIRA KHAN" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#38BDF8" stroke-width="1.5"/>
  <polygon points="0,-40 35,-20 0,0 -35,-20" fill="#38BDF8" opacity="0.8"/>
  <polygon points="0,0 35,-20 35,15 0,35" fill="#1D4ED8"/>
  <polygon points="0,0 -35,-20 -35,15 0,35" fill="#60A5FA"/>
"@

# 23. Mindful Living
Save-Cover "mindful-living.svg" "#78350F" "#451A03" "#FDE68A" "GUIDE TO PEACE OF MIND" "THE ART OF" "MINDFUL LIVING" "Daily Meditations for Clarity and Balance" "ELLIOT REED" @"
  <circle cx="0" cy="0" r="75" fill="rgba(255,255,255,0.06)" stroke="#FDE68A" stroke-width="1.5"/>
  <ellipse cx="0" cy="25" rx="35" ry="12" fill="#D97706"/>
  <ellipse cx="0" cy="5" rx="26" ry="10" fill="#F59E0B"/>
  <ellipse cx="0" cy="-12" rx="16" ry="7" fill="#FDE68A"/>
"@

Write-Output "All 23 book covers generated successfully in $dir"

