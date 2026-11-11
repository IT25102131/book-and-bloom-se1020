"use strict";

const base = document.body.dataset.base || "",
  page = document.body.dataset.page,
  main = document.querySelector("#main");

const state = {
  books: [],
  authors: [],
  categories: [],
  reviews: [],
  user: null,
  csrf: "",
  adminTab: "overview",
};

const icons = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
};

const icon = (n) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.book}</svg>`;

const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const url = (p) => base + p;

const money = (v) =>
  "LKR " +
  Number(v || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const date = (v) =>
  new Date(v).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const author = (b) =>
  state.authors.find((a) => a.id === b.authorId)?.name || "Distinguished Author";

const category = (b) =>
  state.categories.find((c) => c.id === b.categoryId)?.name || "General Books";

let toastTimer;
function toast(message, error = false) {
  const el = document.querySelector("#toast");
  if (!el) return;
  el.textContent = message;
  el.className = "visible" + (error ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = ""), 4000);
}

async function api(path, method = "GET", data) {
  const r = await fetch(url("/api" + path), {
    method,
    headers: { "Content-Type": "application/json", "X-CSRF-Token": state.csrf },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  let result;
  try {
    result = await r.json();
  } catch {
    throw Error("The bookstore server did not respond. Please try again.");
  }
  if (!r.ok) throw Error(result.error || "Request failed.");
  return result;
}

function readCart() {
  try {
    const c = JSON.parse(localStorage.getItem("bookbloom-cart") || "[]");
    return Array.isArray(c)
      ? c
          .filter(
            (x) =>
              typeof x.bookId === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 20,
          )
          .slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("bookbloom-cart", JSON.stringify(cart));
  updateBag();
}

function updateBag() {
  const cart = readCart();
  const count = cart.reduce((n, x) => n + x.quantity, 0);
  const bagCountEl = document.querySelector("#bag-count");
  if (bagCountEl) {
    bagCountEl.textContent = count;
    bagCountEl.classList.remove("bounce");
    void bagCountEl.offsetWidth; // Reflow to re-trigger bounce
    bagCountEl.classList.add("bounce");
  }

  const bagTotalEl = document.querySelector("#bag-total");
  if (bagTotalEl) {
    let subtotal = cart.reduce((sum, item) => {
      const b = state.books.find((bk) => bk.id === item.bookId);
      return sum + (b ? Number(b.price) * item.quantity : 0);
    }, 0);
    bagTotalEl.textContent = money(subtotal);
  }
}

function addToCart(id, btn) {
  const b = state.books.find((b) => b.id === id);
  if (!b || b.stock < 1)
    return toast("This book is currently out of stock.", true);
  let cart = readCart(),
    item = cart.find((x) => x.bookId === id);
  if (item) {
    if (item.quantity >= Math.min(20, b.stock))
      return toast("Maximum available stock reached for this book.", true);
    item.quantity++;
  } else cart.push({ bookId: id, quantity: 1 });
  try {
    saveCart(cart);
    updateBag();
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.classList.add("added-state");
      btn.innerHTML = `${icon("check")} Added!`;
      setTimeout(() => {
        btn.classList.remove("added-state");
        btn.innerHTML = origHtml;
      }, 1200);
    }
    toast(`✓ Added "${b.title}" to your shopping bag!`);
  } catch {
    toast("Your browser cannot save the bag. Enable local storage.", true);
  }
}

function getEmblem(b) {
  const cat = category(b).toLowerCase();
  if (cat.includes("fiction") || cat.includes("novel")) {
    return `<svg viewBox="0 0 24 24" class="emblem-svg"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
  } else if (cat.includes("growth") || cat.includes("mind") || cat.includes("habits")) {
    return `<svg viewBox="0 0 24 24" class="emblem-svg"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  } else if (cat.includes("nature") || cat.includes("travel") || cat.includes("wild")) {
    return `<svg viewBox="0 0 24 24" class="emblem-svg"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
  } else if (cat.includes("tech") || cat.includes("code") || cat.includes("design")) {
    return `<svg viewBox="0 0 24 24" class="emblem-svg"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
  } else if (cat.includes("child") || cat.includes("young")) {
    return `<svg viewBox="0 0 24 24" class="emblem-svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  } else if (cat.includes("business") || cat.includes("money") || cat.includes("finance")) {
    return `<svg viewBox="0 0 24 24" class="emblem-svg"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5H10.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" class="emblem-svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
}

const imageMap = {
  "BK-001": { file: "the-art-of-slowing-down.svg", type: "jacket" },
  "BK-002": { file: "where-the-light-falls.svg", type: "jacket" },
  "BK-003": { file: "wild-ceylon.svg", type: "jacket" },
  "BK-004": { file: "a-little-more-wonder.svg", type: "jacket" },
  "BK-005": { file: "make-room-for-ideas.svg", type: "jacket" },
  "BK-006": { file: "the-long-way-home.svg", type: "jacket" },
  "BK-007": { file: "the-quiet-garden.svg", type: "jacket" },
  "BK-008": { file: "everyday-courage.svg", type: "jacket" },
  "BK-009": { file: "designing-with-purpose.svg", type: "jacket" },
  "BK-010": { file: "letters-from-galle.svg", type: "jacket" },
  "BK-011": { file: "beyond-the-tea-hills.svg", type: "jacket" },
  "BK-012": { file: "begin-again.svg", type: "jacket" },
  "BK-d135d5d8-aeb": { file: "gamperaliya.jpg", type: "jacket" },
  "BK-70da2aba-580": { file: "madol-doova.jpg", type: "jacket" },
  "BK-eb7f9215-19c": { file: "seven-moons.jpg", type: "jacket" },
  "BK-4137526d-0c4": { file: "atomic-habits.jpg", type: "jacket" },
  "BK-71a416dd-404": { file: "psychology-of-money.jpg", type: "jacket" },
  "BK-f7998dc6-615": { file: "clean-code.jpg", type: "jacket" },
  "BK-96a42db5-f19": { file: "kuda-hora.jpg", type: "jacket" },
  "BK-89f7540c-513": { file: "ape-gama.jpg", type: "jacket" },
  "BK-5f03a91c-77d": { file: "birds-of-sinharaja.svg", type: "jacket" },
  "BK-78fd1694-a57": { file: "modern-architecture.svg", type: "jacket" },
  "BK-c1c6b0ab-97e": { file: "mindful-living.svg", type: "jacket" },
};

function sanitizeSinhalaTitle(t) {
  if (!t) return "";
  if (t.includes("Gamperaliya")) return "Gamperaliya (ගම්පෙරළිය)";
  if (t.includes("Madol Doova")) return "Madol Doova (මඩොල් දූව)";
  if (t.includes("Kuda Hora")) return "Kuda Hora (කුඩ හොරා - The Umbrella Thief)";
  if (t.includes("Ape Gama")) return "Ape Gama (අපේ ගම)";
  return t;
}

function getBookCoverInfo(b) {
  if (!b) return null;
  if (imageMap[b.id]) return imageMap[b.id];
  const t = (b.title || "").toLowerCase();
  if (t.includes("habit")) return { file: "atomic-habits.jpg", type: "jacket" };
  if (t.includes("money") || t.includes("psychology")) return { file: "psychology-of-money.jpg", type: "jacket" };
  if (t.includes("clean code") || t.includes("code")) return { file: "clean-code.jpg", type: "jacket" };
  if (t.includes("seven moons") || t.includes("maali")) return { file: "seven-moons.jpg", type: "jacket" };
  if (t.includes("gamperaliya")) return { file: "gamperaliya.jpg", type: "jacket" };
  if (t.includes("elephant pass") || t.includes("pass")) return { file: "road-to-elephant-pass.jpg", type: "jacket" };
  if (t.includes("madol")) return { file: "madol-doova.jpg", type: "jacket" };
  if (t.includes("kuda hora") || t.includes("umbrella")) return { file: "kuda-hora.jpg", type: "jacket" };
  if (t.includes("ape gama") || t.includes("village")) return { file: "ape-gama.jpg", type: "jacket" };
  if (t.includes("slow")) return { file: "the-art-of-slowing-down.svg", type: "jacket" };
  if (t.includes("light")) return { file: "where-the-light-falls.svg", type: "jacket" };
  if (t.includes("ceylon") || t.includes("wild")) return { file: "wild-ceylon.svg", type: "jacket" };
  if (t.includes("wonder")) return { file: "a-little-more-wonder.svg", type: "jacket" };
  if (t.includes("ideas")) return { file: "make-room-for-ideas.svg", type: "jacket" };
  if (t.includes("long way") || t.includes("home")) return { file: "the-long-way-home.svg", type: "jacket" };
  if (t.includes("garden")) return { file: "the-quiet-garden.svg", type: "jacket" };
  if (t.includes("courage")) return { file: "everyday-courage.svg", type: "jacket" };
  if (t.includes("designing")) return { file: "designing-with-purpose.svg", type: "jacket" };
  if (t.includes("galle")) return { file: "letters-from-galle.svg", type: "jacket" };
  if (t.includes("tea hills")) return { file: "beyond-the-tea-hills.svg", type: "jacket" };
  if (t.includes("begin")) return { file: "begin-again.svg", type: "jacket" };
  if (t.includes("sinharaja") || t.includes("birds")) return { file: "birds-of-sinharaja.svg", type: "jacket" };
  if (t.includes("architecture") || t.includes("microservice")) return { file: "modern-architecture.svg", type: "jacket" };
  if (t.includes("mindful")) return { file: "mindful-living.svg", type: "jacket" };

  const fallbackList = [
    "the-art-of-slowing-down.svg", "where-the-light-falls.svg", "wild-ceylon.svg",
    "a-little-more-wonder.svg", "the-long-way-home.svg", "the-quiet-garden.svg",
    "beyond-the-tea-hills.svg", "begin-again.svg"
  ];
  const idx = Math.abs([...(b.id || "BK-0")].reduce((n, c) => n + c.charCodeAt(0), 0)) % fallbackList.length;
  return { file: fallbackList[idx], type: "jacket" };
}

function cover(b, extra = "") {
  const info = getBookCoverInfo(b);
  if (info) {
    const imgUrl = url("/images/covers/" + info.file);
    return `<div class="book-cover has-image real-jacket ${extra}" aria-hidden="true">
      <img src="${imgUrl}" alt="${esc(sanitizeSinhalaTitle(b.title))}" class="book-cover-img" loading="lazy">
    </div>`;
  }

  let color = /^#[0-9a-f]{6}$/i.test(b.coverColor) ? b.coverColor : "#0A2540";
  return `<div class="book-cover real-jacket ${extra}" style="background:${color}" aria-hidden="true">
    <span class="cover-title">${esc(sanitizeSinhalaTitle(b.title))}</span>
  </div>`;
}

function card(b) {
  const origPrice = (Number(b.price) * 1.15).toFixed(2);
  const discountPercent = "15% OFF";
  const displayTitle = sanitizeSinhalaTitle(b.title);
  return `<article class="book-card reveal-item">
    <a href="${url("/book?id=" + encodeURIComponent(b.id))}" class="book-scene" aria-label="View ${esc(displayTitle)}">
      ${b.featured ? '<span class="badge">BESTSELLER</span>' : b.type === "EBOOK" ? '<span class="badge" style="background:#0284c7">E-BOOK</span>' : '<span class="badge" style="background:#16a34a">NEW</span>'}
      <span class="badge-discount">${discountPercent}</span>
      ${cover(b)}
    </a>
    <div class="book-info">
      <div class="book-meta">${esc(category(b))}</div>
      <a href="${url("/book?id=" + encodeURIComponent(b.id))}">
        <h3>${esc(displayTitle)}</h3>
      </a>
      <div class="book-author">by ${esc(author(b))}</div>
      <div class="book-rating">
        <span>★★★★★</span>
        <small>(4.9)</small>
      </div>
      <div class="book-price-row">
        <div class="price-stack">
          <span class="price">${money(b.price)}</span>
          <span class="old-price">${money(origPrice)}</span>
        </div>
        <button class="add-btn" data-add="${esc(b.id)}" aria-label="Add ${esc(displayTitle)} to bag" ${b.stock ? "" : "disabled"}>
          ${icon("bag")}
          <span>${b.stock ? "Add" : "Sold Out"}</span>
        </button>
      </div>
    </div>
  </article>`;
}

function empty(
  title,
  message,
  link = "/catalog",
  label = "Browse Book Catalog",
) {
  return `<div class="empty">${icon("book")}<h2>${esc(title)}</h2><p>${esc(message)}</p>${link ? `<a class="btn" href="${url(link)}">${esc(label)} →</a>` : ""}</div>`;
}

function intro(title, subtitle) {
  return `<div class="page-intro" style="margin-bottom:28px">
    <div class="breadcrumb"><a href="${url("/")}">Home</a> &nbsp; / &nbsp; ${esc(title)}</div>
    <h1 style="font-size:32px;font-weight:800;color:var(--sarasavi-navy);margin:0 0 6px 0;letter-spacing:-0.5px">${esc(title)}</h1>
    <p style="color:var(--text-muted);font-size:14px;margin:0">${esc(subtitle)}</p>
  </div>`;
}

function updateAccount() {
  const a = document.querySelector("#account-link");
  const label = document.querySelector("#account-status-label");
  if (a) {
    a.href = url(state.user ? "/account" : "/login");
    a.setAttribute("aria-label", state.user ? "My account" : "Sign in");
  }
  if (label) {
    label.textContent = state.user ? state.user.name.split(" ")[0] : "Sign In";
  }
  const s = document.querySelector("#search-link");
  if (s) s.innerHTML = icon("search");
  updateBag();
}

/* ==========================================================================
   HOMEPAGE (Sarasavi.lk Storefront Inspired)
   ========================================================================== */
function home() {
  const books = state.books || [];

  // Find 3 flagship titles for the 3D Hero Spotlight Showcase
  const findBook = (needle) => books.find((b) => (b.title || "").toLowerCase().includes(needle));
  const b1 = findBook("habit") || books[0] || {};
  const b2 = findBook("gamperaliya") || findBook("madol") || books[1] || {};
  const b3 = findBook("seven moons") || findBook("money") || books[2] || {};

  // Sort bestsellers so iconic, famous titles appear prominently on the storefront
  const priorityKeywords = ["habit", "gamperaliya", "money", "madol", "seven moons", "clean code", "kuda hora", "ceylon", "slow", "light", "wonder", "galle"];
  const featuredBooks = books.filter((b) => b.featured);
  featuredBooks.sort((a, b) => {
    const aScore = priorityKeywords.findIndex((k) => (a.title || "").toLowerCase().includes(k));
    const bScore = priorityKeywords.findIndex((k) => (b.title || "").toLowerCase().includes(k));
    const aVal = aScore === -1 ? 999 : aScore;
    const bVal = bScore === -1 ? 999 : bScore;
    return aVal - bVal;
  });
  const displayFeatured = featuredBooks.length ? featuredBooks.slice(0, 8) : books.slice(0, 8);
  const newArrivals = books.slice(-8).reverse();

  // Category visual metadata map
  const catMeta = {
    "CAT-1": { name: "Fiction & Novels", sub: "ප්‍රබන්ධ සාහිත්‍යය · Classics", iconName: "book", img: "covers/a-little-more-wonder.jpg", grad: "rgba(42, 28, 22, 0.88)" },
    "CAT-2": { name: "Personal Growth", sub: "පුද්ගල සංවර්ධන · Mastery", iconName: "leaf", img: "covers/mindful-living.jpg", grad: "rgba(28, 48, 44, 0.88)" },
    "CAT-4": { name: "Technology & Innovation", sub: "තාක්ෂණය · Code & Systems", iconName: "code", img: "covers/make-room-for-ideas.jpg", grad: "rgba(25, 39, 52, 0.90)" },
    "CAT-3": { name: "Nature & Travel", sub: "ස්වභාවධර්ම · Ceylon Wild", iconName: "compass", img: "covers/the-quiet-garden.jpg", grad: "rgba(20, 48, 36, 0.88)" },
    "CAT-5d06be3c-fca": { name: "Children's Books", sub: "ළමා සාහිත්‍යය · Stories", iconName: "star", img: "covers/kuda-hora.jpg", grad: "rgba(74, 52, 30, 0.88)" },
    "CAT-77be722a-b06": { name: "Business & Finance", sub: "ව්‍යාපාර · Wealth & Mindset", iconName: "shield", img: "covers/designing-with-purpose.jpg", grad: "rgba(15, 28, 46, 0.88)" }
  };

  // Author recognition tags map
  const authorAccolades = {
    "Martin Wickramasinghe": "Father of Modern Sinhala Literature",
    "Shehan Karunatilaka": "Booker Prize Winner (2022)",
    "James Clear": "#1 NYT Bestselling Author",
    "Sybil Wettasinghe": "Legendary Children's Illustrator",
    "Morgan Housel": "Wall Street Journal Columnist",
    "Robert C. Martin": "Software Craftsmanship Pioneer (Uncle Bob)",
    "Arun Fernando": "Naturalist & Ceylon Documentarian",
    "Maya Senanayake": "Award-Winning Contemporary Novelist",
    "Elliot Reed": "Essayist & Mindful Living Writer"
  };

  // Sort authors so eminent literary figures are prioritized
  const authorPriority = ["Martin", "Shehan", "Sybil", "James", "Morgan", "Robert", "Arun", "Maya"];
  const displayAuthors = [...state.authors].sort((a, b) => {
    const aIdx = authorPriority.findIndex((k) => a.name.includes(k));
    const bIdx = authorPriority.findIndex((k) => b.name.includes(k));
    const aVal = aIdx === -1 ? 999 : aIdx;
    const bVal = bIdx === -1 ? 999 : bIdx;
    return aVal - bVal;
  }).slice(0, 6);

  main.innerHTML = `
    <!-- Sarasavi Luxury Editorial Hero Slider -->
    <section class="hero-slider-section" id="hero-slider">
      <div class="hero-slides-wrapper">
        <!-- Slide 1: Atomic Habits -->
        <div class="hero-slide active" data-slide="0">
          <div class="container hero-slide-inner">
            <div class="hero-slide-content">
              <div class="hero-slide-badge">
                <span class="badge-star">★</span> #1 GLOBAL BESTSELLER · OVER 15M COPIES SOLD
              </div>
              <h1 class="hero-slide-title">
                Atomic Habits
                <span class="hero-serif-sub">Tiny Changes, Remarkable Results</span>
              </h1>
              <p class="hero-slide-desc">No matter your goals, Atomic Habits offers a proven framework for improving every day. Learn how tiny daily adjustments lead to extraordinary transformation with James Clear's worldwide phenomenon.</p>
              <div class="hero-slide-features">
                <span><svg viewBox="0 0 24 24" class="feat-icon"><polyline points="20 6 9 17 4 12"/></svg> 100% Genuine Publications</span>
                <span><svg viewBox="0 0 24 24" class="feat-icon"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> Cash on Delivery Islandwide</span>
                <span><svg viewBox="0 0 24 24" class="feat-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Express Doorstep Dispatch</span>
              </div>
              <div class="hero-slide-actions">
                <a class="btn-hero-primary" href="${url("/book?id=" + encodeURIComponent(b1.id || "BK-4137526d-0c4"))}">
                  ${icon("bag")} Order Best Seller – ${money(b1.price || 2200)} <span class="btn-arrow">→</span>
                </a>
                <a class="btn-hero-secondary" href="${url("/catalog?filter=featured")}">
                  ${icon("book")} Explore Best Sellers <span class="btn-arrow">→</span>
                </a>
              </div>
            </div>
            <div class="hero-slide-visual">
              <a href="${url("/book?id=" + encodeURIComponent(b1.id || "BK-4137526d-0c4"))}" class="hero-spotlight-card" aria-label="View Atomic Habits">
                <span class="spotlight-tag">★ SARASAVI CHOICE</span>
                ${cover(b1, "hero-spotlight-cover")}
                <div class="spotlight-card-footer">
                  <div class="spotlight-rating">★★★★★ <span>(4.9 · 1,420 Reviews)</span></div>
                  <div class="spotlight-price">${money(b1.price || 2200)} <small>LKR ${(Number(b1.price || 2200) * 1.15).toFixed(2)}</small></div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Slide 2: Gamperaliya (Martin Wickramasinghe) -->
        <div class="hero-slide" data-slide="1">
          <div class="container hero-slide-inner">
            <div class="hero-slide-content">
              <div class="hero-slide-badge gold">
                <span>🇱🇰</span> CEYLON LITERARY HERITAGE · MARTIN WICKRAMASINGHE
              </div>
              <h1 class="hero-slide-title">
                Gamperaliya
                <span class="hero-serif-sub">ගම්පෙරළිය · The Seminal Sinhala Masterpiece</span>
              </h1>
              <p class="hero-slide-desc">Step into the rich tapestry of southern Sri Lankan life with the pioneering masterpiece that heralded modern Sinhala realistic literature. Official Sarasavi commemorative edition.</p>
              <div class="hero-slide-features">
                <span>✓ Authentic Sarasavi Edition</span>
                <span>✓ Commemorative Print</span>
                <span>✓ Delivered Islandwide</span>
              </div>
              <div class="hero-slide-actions">
                <a class="btn-hero-primary" href="${url("/book?id=" + encodeURIComponent(b2.id || "BK-d135d5d8-aeb"))}">
                  ${icon("bag")} Order Classic · ${money(b2.price || 1450)}
                </a>
                <a class="btn-hero-secondary" href="${url("/catalog?category=CAT-1")}">
                  ${icon("book")} Sinhala Fiction &amp; Classics ↗
                </a>
              </div>
            </div>
            <div class="hero-slide-visual">
              <div class="hero-spotlight-halo gold"></div>
              <div class="hero-spotlight-pedestal"></div>
              <a href="${url("/book?id=" + encodeURIComponent(b2.id || "BK-d135d5d8-aeb"))}" class="hero-spotlight-card" aria-label="View Gamperaliya">
                <span class="spotlight-tag tag-heritage">NATIONAL TREASURE</span>
                ${cover(b2, "hero-spotlight-cover")}
                <div class="spotlight-card-footer">
                  <div class="spotlight-rating">★★★★★ <span>(5.0 · Timeless Classic)</span></div>
                  <div class="spotlight-price">${money(b2.price || 1450)} <small>Special Edition</small></div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Slide 3: The Seven Moons of Maali Almeida -->
        <div class="hero-slide" data-slide="2">
          <div class="container hero-slide-inner">
            <div class="hero-slide-content">
              <div class="hero-slide-badge booker">
                <span>🏆</span> THE 2022 BOOKER PRIZE WINNER
              </div>
              <h1 class="hero-slide-title">
                The Seven Moons of Maali Almeida
                <span class="hero-serif-sub">by Shehan Karunatilaka</span>
              </h1>
              <p class="hero-slide-desc">Winner of the prestigious Booker Prize. A searing, brilliant afterlife mystery that unfolds amidst the magical realism and turbulent history of Sri Lanka. An unforgettable triumph of storytelling.</p>
              <div class="hero-slide-features">
                <span>✓ Booker Prize Winner</span>
                <span>✓ Original International Print</span>
                <span>✓ Cash on Delivery Available</span>
              </div>
              <div class="hero-slide-actions">
                <a class="btn-hero-primary" href="${url("/book?id=" + encodeURIComponent(b3.id || "BK-eb7f9215-19c"))}">
                  ${icon("bag")} Read Booker Winner · ${money(b3.price || 2650)}
                </a>
                <a class="btn-hero-secondary" href="${url("/catalog")}">
                  ${icon("book")} Browse Bookstore Catalog ↗
                </a>
              </div>
            </div>
            <div class="hero-slide-visual">
              <div class="hero-spotlight-halo crimson"></div>
              <div class="hero-spotlight-pedestal"></div>
              <a href="${url("/book?id=" + encodeURIComponent(b3.id || "BK-eb7f9215-19c"))}" class="hero-spotlight-card" aria-label="View The Seven Moons of Maali Almeida">
                <span class="spotlight-tag tag-booker">BOOKER PRIZE WINNER</span>
                ${cover(b3, "hero-spotlight-cover")}
                <div class="spotlight-card-footer">
                  <div class="spotlight-rating">★★★★★ <span>(4.9 · Booker Jury Praise)</span></div>
                  <div class="spotlight-price">${money(b3.price || 2650)} <small>LKR ${(Number(b3.price || 2650) * 1.15).toFixed(2)}</small></div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Slider Controls -->
      <button class="hero-slider-nav hero-nav-prev" id="hero-slider-prev" aria-label="Previous Slide">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="hero-slider-nav hero-nav-next" id="hero-slider-next" aria-label="Next Slide">
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <!-- Slider Pagination Dots -->
      <div class="hero-slider-dots" id="hero-slider-dots">
        <button class="slider-dot active" data-slide-index="0" aria-label="Slide 1"></button>
        <button class="slider-dot" data-slide-index="1" aria-label="Slide 2"></button>
        <button class="slider-dot" data-slide-index="2" aria-label="Slide 3"></button>
      </div>
    </section>

    <!-- Storefront Assurance Strip (4 Pillars) -->
    <section class="store-features-strip">
      <div class="container features-strip-inner">
        <div class="feature-strip-card">
          <div class="feature-strip-icon-box bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="feature-strip-text">
            <strong>Islandwide Delivery</strong>
            <small>Direct to your door within 2-4 days</small>
          </div>
        </div>
        <div class="feature-strip-card">
          <div class="feature-strip-icon-box bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div class="feature-strip-text">
            <strong>Cash on Delivery</strong>
            <small>Pay safely when your parcel arrives</small>
          </div>
        </div>
        <div class="feature-strip-card">
          <div class="feature-strip-icon-box bg-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="feature-strip-text">
            <strong>100% Genuine Publications</strong>
            <small>Original prints from top publishers</small>
          </div>
        </div>
        <div class="feature-strip-card">
          <div class="feature-strip-icon-box bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div class="feature-strip-text">
            <strong>Hotline Support</strong>
            <small>+94 11 282 0820 · Mon to Sat</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Container -->
    <div class="container">
      <!-- Popular Categories Grid -->
      <section class="section" style="padding-top:10px">
        <div class="section-heading">
          <div class="section-title-wrap">
            <span class="eyebrow">EXPLORE COLLECTIONS • ප්‍රවර්ග</span>
            <div class="section-title-row">
              <h2>Popular Book Categories</h2>
              <div class="heading-divider-line"></div>
              <a class="view-all-link" href="${url("/catalog")}">All Categories <span class="btn-arrow">→</span></a>
            </div>
            <p class="section-subtext">Select a shelf to explore timeless literature, self-development, technology, and children's stories.</p>
          </div>
        </div>
        <div class="category-row">
          ${[...state.categories]
            .sort((a, b) => {
              const order = ["CAT-1", "CAT-2", "CAT-4", "CAT-3", "CAT-5d06be3c-fca"];
              const ia = order.indexOf(a.id);
              const ib = order.indexOf(b.id);
              return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
            })
            .slice(0, 5)
            .map((c) => {
              const m = catMeta[c.id] || { name: c.name, sub: "Featured Collection", iconName: "book", img: "covers/gamperaliya.jpg", grad: "rgba(11, 60, 53, 0.88)" };
              const count = state.books.filter((b) => b.categoryId === c.id).length;
              return `
              <a class="category-card-v2" href="${url("/catalog?category=" + encodeURIComponent(c.id))}" style="background-image:url('${url("/images/" + m.img)}');--cat-grad:${m.grad}">
                <div class="category-card-content">
                  <strong>${esc(m.name)}</strong>
                  <span class="category-sub">${esc(m.sub)}</span>
                  <div class="category-meta">
                    <span class="category-count">${count} Titles</span>
                    <span class="category-arrow">→</span>
                  </div>
                </div>
              </a>`;
            })
            .join("")}
        </div>
      </section>

      <!-- Bestsellers Section (Sarasavi Best Sellers) -->
      <section class="section">
        <div class="section-heading">
          <div class="section-title-wrap">
            <span class="eyebrow">Top Recommendations · ජනප්‍රියම පොත්</span>
            <h2>Sarasavi &amp; Book &amp; Bloom Best Sellers</h2>
            <p>The most celebrated reads loved by book lovers across the island.</p>
          </div>
          <a class="view-all-link" href="${url("/catalog?filter=featured")}">View All Best Sellers ↗</a>
        </div>
        <div class="book-grid">
          ${displayFeatured.map(card).join("")}
        </div>
      </section>

      <!-- Sarasavi Promotional Banners Grid -->
      <div class="promo-banners-grid">
        <div class="promo-banner promo-banner-heritage">
          <div class="promo-banner-content">
            <span class="promo-pill-tag">🇱🇰 HERITAGE CLASSICS · සිංහල සාහිත්‍යය</span>
            <h3>Martin Wickramasinghe Commemorative Collection</h3>
            <p>Rediscover the immortal masterpieces of Sinhala literature — <em>Gamperaliya</em>, <em>Madol Doova</em>, and <em>Ape Gama</em> in official commemorative prints.</p>
            <a href="${url("/catalog?category=CAT-1")}" class="promo-btn-action">
              Explore Sinhala Classics <span>→</span>
            </a>
          </div>
        </div>

        <div class="promo-banner promo-banner-savings">
          <div class="promo-banner-content">
            <span class="promo-pill-tag tag-crimson">⚡ SPECIAL DISCOUNT · 15% OFF</span>
            <h3>Global Non-Fiction &amp; Mastery Bestsellers</h3>
            <p>Transform your habits and financial psychology with <em>Atomic Habits</em>, <em>The Psychology of Money</em>, and <em>Clean Code</em> with islandwide cash on delivery.</p>
            <a href="${url("/catalog?filter=featured")}" class="promo-btn-action">
              Shop Bestsellers <span>→</span>
            </a>
          </div>
        </div>
      </div>

      <!-- New Arrivals Section -->
      <section class="section">
        <div class="section-heading">
          <div class="section-title-wrap">
            <span class="eyebrow">Just Landed · අලුත්ම පොත්</span>
            <h2>New Arrivals On Our Shelves</h2>
            <p>Freshly printed editions and new releases ready for immediate dispatch.</p>
          </div>
          <a class="view-all-link" href="${url("/catalog?filter=new")}">View All New Arrivals ↗</a>
        </div>
        <div class="book-grid">
          ${newArrivals.map(card).join("")}
        </div>
      </section>

      <!-- Featured Authors Showcase -->
      <section class="section">
        <div class="section-heading">
          <div class="section-title-wrap">
            <span class="eyebrow">Distinguished Writers · ප්‍රවීණ ලේඛකයින්</span>
            <h2>Featured Authors</h2>
            <p>Celebrating the distinguished voices enriching Sri Lankan and world literature.</p>
          </div>
          <a class="view-all-link" href="${url("/catalog")}">Browse All Authors ↗</a>
        </div>
        <div class="authors-grid">
          ${displayAuthors.map((a) => {
            const count = state.books.filter((b) => b.authorId === a.id).length;
            const accolade = a.accolades || authorAccolades[a.name] || a.primaryGenre || (a.bio ? a.bio.split(".")[0] : "Renowned Author");
            const authorImg = a.photoUrl
              ? `<img src="${esc(a.photoUrl)}" alt="${esc(a.name)}" class="author-avatar-img-v2" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
              : "";
            return `
            <a href="${url("/catalog?search=" + encodeURIComponent(a.name))}" class="author-card-v2" title="Browse books by ${esc(a.name)}">
              <div class="author-avatar-v2">
                ${authorImg}
                <span class="author-avatar-initial-v2">${esc(a.name.charAt(0))}</span>
              </div>
              <strong>${esc(a.name)}</strong>
              ${a.nationality ? `<span class="author-card-flag">🇱🇰 ${esc(a.nationality)}</span>` : ""}
              <p class="author-sub-v2">${esc(accolade)}</p>
              <span class="author-count-v2">${count} Books Available</span>
            </a>`;
          }).join("")}
        </div>
      </section>

      <!-- Verified Reader Testimonials Section -->
      <section class="section">
        <div class="section-heading">
          <div class="section-title-wrap">
            <span class="eyebrow">Islandwide Reader Feedback · පාඨක අදහස්</span>
            <h2>Loved by Readers Across Sri Lanka</h2>
            <p>Real experiences from book lovers ordering from Colombo, Kandy, Galle, and beyond.</p>
          </div>
          <span class="verified-badge">
            <svg style="width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            100% Genuine Reader Reviews
          </span>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-quote">“Ordered 'Gamperaliya' and 'Atomic Habits' on Tuesday; both arrived in Kandy by Thursday noon! Pristine print quality, authentic publisher stamps, and polite courier delivery.”</p>
            <div class="testimonial-author-row">
              <div class="testimonial-avatar">KJ</div>
              <div class="testimonial-info">
                <strong>Dr. Kalinga Jayasuriya</strong>
                <small>Senior Lecturer · Peradeniya</small>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-quote">“Best online bookstore experience in Sri Lanka. Cash on delivery was seamless, and the customer helpline guided me to find rare Sinhala translations. Highly recommended!”</p>
            <div class="testimonial-author-row">
              <div class="testimonial-avatar">DW</div>
              <div class="testimonial-info">
                <strong>Dilani Wickramasinghe</strong>
                <small>Architect · Colombo 07</small>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-quote">“Sybil Wettasinghe’s children’s classics arrived in immaculate packaging for my children in Galle. Finding genuine original editions online has never been this easy.”</p>
            <div class="testimonial-author-row">
              <div class="testimonial-avatar">RF</div>
              <div class="testimonial-info">
                <strong>Ruchira Fernando</strong>
                <small>Parent &amp; Educator · Galle Fort</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- VIP Reader Club Newsletter Banner -->
      <div class="newsletter-club-strip">
        <div class="newsletter-copy">
          <span class="hero-slide-badge gold" style="margin-bottom:10px">✧ SARASAVI READERS' CLUB</span>
          <h3>Join Over 25,000 Book Lovers in Sri Lanka</h3>
          <p>Subscribe for exclusive 15% discount vouchers, author interview digests, and notifications on limited hardcover reprint releases.</p>
        </div>
        <form class="newsletter-form" id="newsletter-club-form" onsubmit="event.preventDefault();toast('✓ Welcome to Book &amp; Bloom Readers Club! Your 15% discount voucher has been emailed.');this.reset();">
          <input type="email" class="newsletter-input" placeholder="Enter your email address..." required aria-label="Email address for book club">
          <button type="submit" class="newsletter-btn">Join Club</button>
        </form>
      </div>
    </div>
  `;

  initHeroSlider();
  init3DBookTilt();
  initScrollReveal();
}

/* ==========================================================================
   CATALOG / BROWSE PAGE
   ========================================================================== */
function catalog() {
  const params = new URLSearchParams(location.search);
  let cat = params.get("category") || "",
    filter = params.get("filter") || "",
    searchParam = params.get("q") || params.get("search") || "",
    p = 1;

  main.innerHTML = `
    <div class="container section">
      ${intro("Browse Bookstore Catalog", "Discover our complete collection of Sri Lankan and international literature.")}
      
      <div class="catalog-toolbar">
        <div class="search-field">
          ${icon("search")}
          <input id="catalog-search" type="search" placeholder="Search by title, author, ISBN..." value="${esc(searchParam)}" aria-label="Search bookstore catalog">
        </div>
        <select id="format-filter" aria-label="Book format filter">
          <option value="">All Formats (Printed &amp; E-Books)</option>
          <option value="PRINTED">Printed Books (Paperback)</option>
          <option value="EBOOK">Digital E-Books</option>
        </select>
        <select id="sort" aria-label="Sort books">
          <option value="curated">Recommended for You</option>
          <option value="new">Newest First</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="az">Title: A–Z</option>
        </select>
      </div>

      <div class="chips" id="category-chips"></div>
      <p class="result-count" id="results" aria-live="polite"></p>
      <div class="book-grid" id="catalog-grid"></div>
      <div class="pagination" id="pagination"></div>
    </div>
  `;

  const draw = () => {
    let q = document.querySelector("#catalog-search").value.toLowerCase(),
      fmt = document.querySelector("#format-filter").value,
      sort = document.querySelector("#sort").value;

    let list = state.books.filter(
      (b) =>
        (!cat || b.categoryId === cat) &&
        (!fmt || b.type === fmt) &&
        (filter !== "featured" || b.featured) &&
        `${b.title} ${author(b)} ${b.isbn}`.toLowerCase().includes(q),
    );

    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "new" || (sort === "curated" && filter === "new"))
      list.reverse();

    let pages = Math.max(1, Math.ceil(list.length / 8));
    p = Math.min(p, pages);

    document.querySelector("#category-chips").innerHTML =
      [{ id: "", name: "All Books" }, ...state.categories]
        .map(
          (c) =>
            `<button class="chip ${cat === c.id ? "active" : ""}" data-category="${esc(c.id)}">${esc(c.name)}</button>`,
        )
        .join("") +
      (filter === "featured"
        ? '<button class="chip active" id="clear-featured">Best Sellers ×</button>'
        : "");

    document.querySelector("#results").textContent =
      `Showing ${list.length} book${list.length === 1 ? "" : "s"}${filter === "featured" ? " in Best Sellers" : ""} · In stock & ready for delivery across Sri Lanka`;

    document.querySelector("#catalog-grid").innerHTML = list.length
      ? list
          .slice((p - 1) * 8, p * 8)
          .map(card)
          .join("")
      : empty(
          "No books match your search.",
          "Try adjusting your search terms or select a different category.",
          null,
        );

    document.querySelector("#catalog-grid").style.display = list.length
      ? ""
      : "block";

    init3DBookTilt();
    initScrollReveal();

    document.querySelector("#pagination").innerHTML =
      pages > 1
        ? `<button class="btn secondary small" id="prev" ${p === 1 ? "disabled" : ""}>← Previous</button><span>Page ${p} of ${pages}</span><button class="btn secondary small" id="next" ${p === pages ? "disabled" : ""}>Next →</button>`
        : "";

    document.querySelector("#prev")?.addEventListener("click", () => {
      p--;
      draw();
      window.scrollTo({ top: 200, behavior: "smooth" });
    });
    document.querySelector("#next")?.addEventListener("click", () => {
      p++;
      draw();
      window.scrollTo({ top: 200, behavior: "smooth" });
    });
    document.querySelector("#clear-featured")?.addEventListener("click", () => {
      filter = "";
      draw();
    });
  };

  document.querySelector("#category-chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-category]");
    if (b) {
      cat = b.dataset.category;
      p = 1;
      draw();
    }
  });

  ["catalog-search", "format-filter", "sort"].forEach((id) =>
    document
      .getElementById(id)
      ?.addEventListener(id === "catalog-search" ? "input" : "change", () => {
        p = 1;
        draw();
      }),
  );

  draw();
}

function field(name, label, value = "", type = "text", attrs = "") {
  return `<div class="form-field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${attrs}></div>`;
}

function textarea(name, label, value = "", attrs = "") {
  return `<div class="form-field wide"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" ${attrs}>${esc(value)}</textarea></div>`;
}

function select(name, label, options, value = "") {
  return `<div class="form-field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${options.map((o) => `<option value="${esc(o.id)}" ${o.id === value ? "selected" : ""}>${esc(o.name)}</option>`).join("")}</select></div>`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form));
}

function bindForm(form, handler) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("[type=submit]"),
      error = form.querySelector(".form-error");
    if (error) error.textContent = "";
    btn.disabled = true;
    try {
      await handler(formData(form));
    } catch (err) {
      if (error) error.textContent = err.message;
      else toast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });
}

function showModal(title, content) {
  const dialog = document.querySelector("#modal");
  document.querySelector("#modal-content").innerHTML =
    `<div class="modal-header"><h2 id="modal-title">${esc(title)}</h2><button class="close-modal" aria-label="Close dialog">×</button></div>${content}`;
  dialog.querySelector(".close-modal").onclick = () => dialog.close();
  dialog.showModal();
  return dialog;
}

async function confirmAction(title, message, action) {
  const dialog = showModal(
    title,
    `<p style="color:var(--text-muted);margin-bottom:20px">${esc(message)}</p><form><div class="form-error" role="alert"></div><div class="form-actions"><button type="button" class="btn secondary" id="cancel-action">Cancel</button><button type="submit" class="btn danger">Confirm</button></div></form>`,
  );
  dialog.querySelector("#cancel-action").onclick = () => dialog.close();
  bindForm(dialog.querySelector("form"), async () => {
    await action();
    dialog.close();
  });
}


/* ==========================================================================
   LOOK INSIDE / LITERARY EXCERPT PREVIEWER
   ========================================================================== */
function getBookExcerpt(b) {
  const title = (b.title || "").toLowerCase();
  if (title.includes("gamperaliya")) {
    return {
      chapter: "Chapter I · The Ancestral Home of Koggala",
      sinhalaTitle: "ගම්පෙරළිය · පළමුවන පරිච්ඡේදය",
      dropCap: "කෙ",
      body: "ාග්ගල ග්‍රාමය එක් පසෙකින් මහ මුහුදින්ද, අනෙක් පසින් නිසල කොග්ගල ඔයෙන්ද මායිම්ව පිහිටියේය. ගම්මුන්ගේ මුළු ජීවිතයම මේ සුන්දර පරිසරය හා බැඳී පැවතුණි. ගමේ විසූ කයිසාරුවත්තේ මුහන්දිරම් මහතා පාරම්පරික කුලවත් පරපුරක උරුමය රකිමින් සිය මහගෙදර විසීය. නන්දා සහ අනුලා නම් වූ ඔහුගේ දියණියන් දෙදෙනා ගමේ කාගෙත් ගෞරවාදරයට පාත්‍ර වූ අතර, අසල්වැසි තරුණයෙකු වූ පියල්ගේ සිත නන්දා කෙරෙහි ඇදී ගියේ දෛවයේ සුවිශේෂී සන්ධිස්ථානයක් සනිටුහන් කරමිනි.\n\nKoggala village stood gracefully bordered on one side by the rolling surf of the Indian Ocean and on the other by the serene, mirrored waters of Koggala Lake. Life moved with the quiet dignity of ancient traditions, anchored by the stately Maha Gedara where Kaisaruwatte Muhandiram held court. It was amidst this fading feudal nobility that young Piyal first cast his eyes upon Nanda, setting in motion a profound human drama that would capture the very soul of a changing nation."
    };
  }
  if (title.includes("habit")) {
    return {
      chapter: "Chapter 1 · The Surprising Power of Atomic Habits",
      sinhalaTitle: "ක්ෂුද්‍ර පුරුදුවල විස්මිත බලය",
      dropCap: "I",
      body: "n 2003, the fate of British Cycling changed forever. The organization, which had been the governing body for professional cycling in Great Britain, had recently hired Dave Brailsford as its new performance director. For nearly one hundred years, British riders had achieved barely a handful of accolades, winning a single gold medal at the Olympic Games since 1908.\n\nBrailsford's strategy was simple yet revolutionary: the aggregation of marginal gains. The whole principle came from the idea that if you broke down everything you could think of that goes into riding a bike, and then improved each component by just 1 percent, you would achieve a significant increase when you put them all together. Tiny atomic improvements do not merely add up—they compound exponentially over time."
    };
  }
  if (title.includes("seven moon") || title.includes("maali")) {
    return {
      chapter: "Moon 1 · The In-Between Visa Office",
      sinhalaTitle: "පළමුවන සඳ · මාලි අල්මේදාගේ ආත්මය",
      dropCap: "Y",
      body: "ou might see yourself as a war photographer, a closet romantic, or an incorrigible gambler who consistently bet against his own survival. But right now, you are waking up in what appears to be a chaotic celestial waiting room, smelling faintly of old paperwork, damp coir mats, and administrative indifference.\n\nYou have a passport in a script you cannot decipher, a camera without any film, and exactly seven moons—seven celestial nights—to figure out who ended your earthly journey. Beneath you lies an island of unmatched natural beauty, turbulent politics, and forgotten laughter. The countdown has begun."
    };
  }
  if (title.includes("money") || title.includes("psychology")) {
    return {
      chapter: "Introduction · The Greatest Show on Earth",
      sinhalaTitle: "මුදලේ මනෝවිද්‍යාව · හැඳින්වීම",
      dropCap: "D",
      body: "oing well with money has a little to do with how smart you are and a lot to do with how you behave. And behavior is hard to teach, even to really smart people. A genius who loses control of their emotions can be a financial disaster. The opposite is also true. Ordinary folks with no financial education can be wealthy if they have a handful of behavioral skills that have nothing to do with formal measures of intelligence.\n\nFinancial success is not a hard science. It is a soft skill, where how you behave is vastly more important than what you know. I call this soft skill the psychology of money."
    };
  }
  if (title.includes("clean code")) {
    return {
      chapter: "Chapter 1 · Clean Code & Craftsmanship",
      sinhalaTitle: "පිරිසිදු කේතය · මෘදුකාංග ශිල්පීයත්වය",
      dropCap: "E",
      body: "ven bad code can function. But if code is not clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it does not have to be that way.\n\nClean code is simple and direct. Clean code reads like well-written prose. Clean code never obscures the designer's intent but rather is full of crisp abstractions and straightforward lines of control. Writing clean code is what separates a true software craftsman from a mere technician."
    };
  }
  return {
    chapter: "Chapter 1 · Literary Excerpt & Introduction",
    sinhalaTitle: b.title + " · නිල නියැදි පරිච්ඡේදය",
    dropCap: (b.title || "T").charAt(0),
    body: (b.description || "") + "\n\nThis official preview provides readers with an authentic glimpse into the author's narrative craftsmanship. Discover compelling prose, thought-provoking perspectives, and meticulous research that make this title a celebrated addition to the Book & Bloom collection. Order your original edition today for fast doorstep delivery anywhere in Sri Lanka."
  };
}

function openLookInsideModal(b) {
  const excerpt = getBookExcerpt(b);
  const modalHtml = `
    <div class="look-inside-container" id="look-inside-container">
      <div class="reader-toolbar">
        <div class="reader-toolbar-left">
          <span class="reader-badge">FREE SAMPLE PREVIEW</span>
          <span class="reader-title-label">${esc(b.title)}</span>
        </div>
        <div class="reader-toolbar-right">
          <div class="reader-theme-picker">
            <button class="reader-theme-btn active" data-theme="day" title="Day Mode">☀️ Day</button>
            <button class="reader-theme-btn" data-theme="sepia" title="Sepia Parchment">📜 Sepia</button>
            <button class="reader-theme-btn" data-theme="night" title="Night Mode">🌙 Night</button>
          </div>
          <div class="reader-font-controls">
            <button class="reader-font-btn" id="reader-font-dec" title="Smaller font">A-</button>
            <button class="reader-font-btn" id="reader-font-inc" title="Larger font">A+</button>
          </div>
        </div>
      </div>

      <div class="reader-book-body theme-day" id="reader-book-body">
        <div class="reader-page-leaf">
          <div class="reader-header-meta">
            <span class="reader-book-category">${esc(category(b))}</span>
            <h1 class="reader-book-h1">${esc(b.title)}</h1>
            <p class="reader-book-author">by <strong>${esc(author(b))}</strong> · Sarasavi Official Edition</p>
            <hr class="reader-leaf-hr">
          </div>

          <h3 class="reader-chapter-heading">${esc(excerpt.chapter)}</h3>
          <h4 class="reader-sinhala-heading">${esc(excerpt.sinhalaTitle)}</h4>

          <div class="reader-prose" id="reader-prose">
            <p class="reader-paragraph-opening">
              <span class="reader-drop-cap">${esc(excerpt.dropCap)}</span>
              ${excerpt.body.replace(/\n\n/g, "</p><p>")}
            </p>
          </div>

          <div class="reader-end-banner">
            <div class="reader-end-icon">📖</div>
            <div class="reader-end-text">
              <strong>End of Free Preview</strong>
              <p>Continue your reading with the complete original edition delivered right to your doorstep across Sri Lanka.</p>
            </div>
            <div class="reader-end-actions">
              <button class="btn btn-reader-buy" data-add="${esc(b.id)}">
                ${icon("bag")} Order Book · ${money(b.price)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const dialog = showModal("Look Inside: " + b.title, modalHtml);

  const readerBody = dialog.querySelector("#reader-book-body");
  const prose = dialog.querySelector("#reader-prose");
  let currentFontSize = 15;

  dialog.querySelectorAll(".reader-theme-btn").forEach((btn) => {
    btn.onclick = () => {
      dialog.querySelectorAll(".reader-theme-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      readerBody.className = "reader-book-body theme-" + btn.dataset.theme;
    };
  });

  dialog.querySelector("#reader-font-inc")?.addEventListener("click", () => {
    if (currentFontSize < 22) {
      currentFontSize += 2;
      prose.style.fontSize = currentFontSize + "px";
    }
  });

  dialog.querySelector("#reader-font-dec")?.addEventListener("click", () => {
    if (currentFontSize > 12) {
      currentFontSize -= 2;
      prose.style.fontSize = currentFontSize + "px";
    }
  });

  dialog.querySelector(".btn-reader-buy")?.addEventListener("click", (e) => {
    addToCart(b.id, e.target);
    dialog.close();
  });
}

/* ==========================================================================
   BOOK DETAIL VIEW
   ========================================================================== */
function bookDetail() {
  const id = new URLSearchParams(location.search).get("id"),
    b = state.books.find((b) => b.id === id);

  if (!b) {
    main.innerHTML = `<div class="container section">${empty("Book Not Found on Shelf.", "The requested title may have been removed. Please browse our catalog for more titles.")}</div>`;
    return;
  }

  const rs = state.reviews.filter((r) => r.bookId === id),
    avg = rs.length
      ? (rs.reduce((n, r) => n + r.rating, 0) / rs.length).toFixed(1)
      : null,
    authObj = state.authors.find((a) => a.id === b.authorId);

  document.title = b.title + " | Book & Bloom";

  const origPrice = (Number(b.price) * 1.15).toFixed(2);

  main.innerHTML = `
    <div class="container section">
      <div class="breadcrumb">
        <a href="${url("/")}">Home</a> &nbsp; / &nbsp; 
        <a href="${url("/catalog")}">Catalog</a> &nbsp; / &nbsp; 
        <a href="${url("/catalog?category=" + encodeURIComponent(b.categoryId))}">${esc(category(b))}</a> &nbsp; / &nbsp; 
        ${esc(b.title)}
      </div>

      <div class="detail">
        <div class="detail-scene">
          ${cover(b, "detail-cover")}
          <div style="margin-top:20px;text-align:center">
            <span class="badge" style="position:static;display:inline-block">${b.type === "PRINTED" ? "ORIGINAL PRINT" : "DIGITAL EDITION"}</span>
          </div>
        </div>

        <div class="detail-copy">
          <div class="eyebrow">${esc(category(b))}</div>
          <h1>${esc(b.title)}</h1>
          <p>by <strong style="color:var(--sarasavi-navy)">${esc(author(b))}</strong></p>
          
          <p class="stars">
            ${avg ? "★ " + avg + " · (" + rs.length + " Verified Reader Reviews)" : "★ ★ ★ ★ ★ · Be the first reader to review this book"}
          </p>

          <div class="price" style="display:flex;align-items:baseline;gap:12px">
            <span>${money(b.price)}</span>
            <span style="font-size:16px;color:var(--text-light);text-decoration:line-through">${money(origPrice)}</span>
            <span class="badge-discount" style="position:static">Save 15%</span>
          </div>

          <div class="detail-data">
            <div>
              <span>Binding</span>
              ${b.type === "PRINTED" ? "Paperback" : esc(b.fileFormat) + " E-Book"}
            </div>
            <div>
              <span>${b.type === "PRINTED" ? "Pages" : "Format"}</span>
              ${b.type === "PRINTED" ? b.pages + " Pages" : "Digital Demo"}
            </div>
            <div>
              <span>ISBN</span>
              ${esc(b.isbn)}
            </div>
          </div>

          <div class="stock">
            ${b.stock ? `● In Stock (${b.stock} copies available for delivery)` : '<span style="color:var(--sarasavi-red)">● Out of stock</span>'}
          </div>

          <div class="detail-actions-row" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:10px">
            <button class="btn" style="padding:14px 28px;font-size:15px;width:fit-content" data-add="${esc(b.id)}" ${b.stock ? "" : "disabled"}>
              ${icon("bag")} Add to Shopping Bag
            </button>
            <button class="btn secondary btn-look-inside" id="btn-look-inside" style="padding:14px 22px;font-size:14.5px">
              📖 Look Inside / Sample Read
            </button>
          </div>

          <div style="background:var(--bg-alt);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:14px 18px;margin-top:24px">
            <div style="font-size:13px;font-weight:700;color:var(--sarasavi-navy);margin-bottom:4px">
              🚚 Islandwide Delivery: 2 - 3 Working Days
            </div>
            <div class="small-print">
              ${b.type === "PRINTED" ? "Standard delivery fee LKR 350. Free delivery on orders over LKR 5,000. Cash on delivery available islandwide." : "Digital demonstration title. Academic demo order recorded without actual downloadable payload."}
            </div>
          </div>

          <h3 style="font-size:18px;margin:28px 0 10px 0;font-weight:800;color:var(--sarasavi-navy)">About this Book</h3>
          <p style="line-height:1.7;color:var(--text-main)">${esc(b.description)}</p>

          ${
            authObj
              ? `
          <div class="author-spotlight-card">
            <div class="author-spotlight-header">
              <div class="author-spotlight-avatar-wrap">
                ${
                  authObj.photoUrl
                    ? `<img src="${esc(authObj.photoUrl)}" alt="${esc(authObj.name)}" class="author-spotlight-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                    : ""
                }
                <span class="author-spotlight-avatar-fallback">${esc((authObj.name || "A").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase())}</span>
              </div>
              <div class="author-spotlight-meta">
                <span class="author-spotlight-eyebrow">About the Author · ලේඛකයා පිළිබඳ විස්තරය</span>
                <h4 class="author-spotlight-name">${esc(authObj.name)}</h4>
                <div class="author-spotlight-tags">
                  ${authObj.bornYear ? `<span class="author-pill">🗓 ${esc(authObj.bornYear)}</span>` : ""}
                  ${authObj.nationality ? `<span class="author-pill author-pill-flag">🇱🇰 ${esc(authObj.nationality)}</span>` : ""}
                  ${authObj.primaryGenre ? `<span class="author-pill author-pill-genre">📚 ${esc(authObj.primaryGenre)}</span>` : ""}
                </div>
              </div>
            </div>
            ${
              authObj.accolades
                ? `<div class="author-spotlight-accolade">🏆 <strong>Honors & Awards:</strong> ${esc(authObj.accolades)}</div>`
                : ""
            }
            <p class="author-spotlight-bio">${esc(authObj.bio)}</p>
            <div class="author-spotlight-footer">
              <a href="${url("/catalog?search=" + encodeURIComponent(authObj.name))}" class="btn secondary" style="padding:9px 20px;font-size:13.5px;width:fit-content;display:inline-flex;align-items:center;gap:8px">
                Browse All Books by ${esc(authObj.name)} →
              </a>
            </div>
          </div>`
              : ""
          }
        </div>
      </div>

      <!-- Customer Reviews Layout -->
      <div class="review-layout">
        <section>
          <h2 style="font-size:22px;font-weight:800;color:var(--sarasavi-navy)">Reader Reviews</h2>
          <p style="color:var(--text-muted);font-size:13.5px">Honest feedback from readers across Sri Lanka.</p>
          <div class="review-list">
            ${rs.length
              ? rs
                  .map(
                    (r) => `
              <article class="review">
                <div class="review-header">
                  <strong>${esc(r.name)}</strong>
                  <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
                </div>
                <p>${esc(r.comment)}</p>
                <small>${date(r.createdAt)}</small>
                ${
                  state.user?.id === r.userId
                    ? `<div style="margin-top:10px;display:flex;gap:12px">
                        <button class="plain-button" data-edit-review="${r.id}">Edit Review</button>
                        <button class="plain-button" data-delete-review="${r.id}">Delete Review</button>
                      </div>`
                    : ""
                }
              </article>`,
                  )
                  .join("")
              : '<p style="color:var(--text-muted);font-style:italic">No reviews yet for this title. Share your thoughts below!</p>'}
          </div>
        </section>

        <aside class="panel">
          <h3>Share Your Review</h3>
          <p style="color:var(--text-muted);font-size:13px;margin-bottom:18px">Have you read this book? Help fellow book lovers discover it.</p>
          ${
            state.user
              ? `<button class="btn secondary full" id="write-review">${rs.some((r) => r.userId === state.user.id) ? "Edit Your Review" : "Write a Review"}</button>`
              : `<a class="btn secondary full" href="${url("/login")}">Sign In to Review</a>`
          }
        </aside>
      </div>

      <!-- Related Books Section -->
      <section class="section">
        <div class="section-heading">
          <div class="section-title-wrap">
            <span class="eyebrow">More to Explore</span>
            <h2>You May Also Like</h2>
          </div>
        </div>
        <div class="book-grid">
          ${state.books
            .filter((x) => x.id !== id)
            .slice(0, 4)
            .map(card)
            .join("")}
        </div>
      </section>
    </div>
  `;

  document.querySelector("#btn-look-inside")?.addEventListener("click", () => openLookInsideModal(b));

  document.querySelector("#write-review")?.addEventListener("click", () =>
    editReview(
      id,
      rs.find((r) => r.userId === state.user.id),
    ),
  );

  main.querySelectorAll("[data-edit-review]").forEach(
    (btn) =>
      (btn.onclick = () =>
        editReview(
          id,
          rs.find((r) => r.id === btn.dataset.editReview),
        )),
  );

  main.querySelectorAll("[data-delete-review]").forEach(
    (btn) =>
      (btn.onclick = () =>
        confirmAction(
          "Delete your review?",
          "This will remove your review permanently.",
          async () => {
            await api("/reviews/" + btn.dataset.deleteReview, "DELETE");
            await refreshCatalog();
            bookDetail();
            toast("Review deleted successfully.");
          },
        )),
  );
}

function editReview(bookId, review) {
  const dialog = showModal(
    review ? "Edit Your Review" : "Write a Reader Review",
    `<form class="form-stack">${select(
      "rating",
      "Rating",
      [5, 4, 3, 2, 1].map((n) => ({
        id: String(n),
        name: "★".repeat(n) + " · " + n + "/5",
      })),
      String(review?.rating || 5),
    )}${textarea("comment", "Your Thoughts on This Book", review?.comment || "", 'required minlength="5" maxlength="1000"')}<div class="form-error" role="alert"></div><button class="btn full" type="submit">Submit Review</button></form>`,
  );
  bindForm(dialog.querySelector("form"), async (d) => {
    await api(
      "/reviews" + (review ? "/" + review.id : ""),
      review ? "PUT" : "POST",
      { ...d, rating: Number(d.rating), bookId },
    );
    dialog.close();
    await refreshCatalog();
    bookDetail();
    toast("Thank you! Your review has been saved.");
  });
}

/* ==========================================================================
   AUTH (Login & Registration)
   ========================================================================== */
function auth(register = false) {
  main.innerHTML = `
    <div class="container section">
      <div class="auth-wrap">
        <div class="auth-art">
          <div>
            <div class="eyebrow" style="color:var(--sarasavi-amber)">Book &amp; Bloom Bookshop</div>
            <h2>Sri Lanka's Premier Online Bookstore</h2>
            <p class="muted">Access your orders, save items to your bag, and explore thousands of books.</p>
          </div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.6">
            Hotline: +94 11 282 0820<br>
            Nugegoda · Colombo · Kandy · Galle
          </div>
        </div>

        <div class="auth-form">
          <h1>${register ? "Create an Account" : "Sign In to Your Account"}</h1>
          <p style="color:var(--text-muted);font-size:13px;margin:0 0 20px 0">
            ${register ? "Join our reading community for fast checkout and order tracking." : "Welcome back! Enter your login credentials below."}
          </p>

          <form id="auth-form">
            ${register ? field("name", "Full Name", "", "text", 'required minlength="2" maxlength="80" autocomplete="name"') : ""}
            ${field("email", "Email Address", "", "email", 'required maxlength="150" autocomplete="email"')}
            ${field("password", "Password", "", "password", `required minlength="${register ? 8 : 1}" maxlength="128" autocomplete="${register ? "new-password" : "current-password"}"`)}
            ${register ? '<p class="small-print" style="margin-bottom:12px">Use at least 8 characters for your password.</p>' : ""}
            <div class="form-error" role="alert"></div>
            <button class="btn full" type="submit">${register ? "Create Account" : "Sign In"} →</button>
          </form>

          <p class="small-print" style="margin-top:20px;text-align:center">
            ${register ? "Already have an account?" : "New to Book & Bloom?"}
            <a class="text-link" href="${url(register ? "/login" : "/register")}">
              ${register ? "Sign In" : "Register Here"}
            </a>
          </p>

          ${
            !register
              ? `<div class="demo-box">
                  <strong>Academic Demo Logins</strong><br>
                  <button class="plain-button" id="demo-reader" style="color:var(--sarasavi-blue);font-weight:700">Reader: reader@bookbloom.lk</button> &nbsp; · &nbsp;
                  <button class="plain-button" id="demo-admin" style="color:var(--sarasavi-blue);font-weight:700">Admin: admin@bookbloom.lk</button>
                </div>`
              : ""
          }
        </div>
      </div>
    </div>
  `;

  bindForm(document.querySelector("#auth-form"), async (d) => {
    if (register) {
      await api("/register", "POST", { ...d, address: "" });
      toast("Account registered successfully. Signing in…");
    }
    const result = await api("/login", "POST", d);
    state.csrf = result.csrf;
    state.user = result.user;
    location.href = url(
      result.user.role === "ADMIN"
        ? "/admin"
        : readCart().length
          ? "/cart"
          : "/account",
    );
  });

  [
    ["demo-reader", "reader@bookbloom.lk", "BloomReader!2026"],
    ["demo-admin", "admin@bookbloom.lk", "BloomAdmin!2026"],
  ].forEach(([id, email, pw]) =>
    document.getElementById(id)?.addEventListener("click", () => {
      document.querySelector("#f-email").value = email;
      document.querySelector("#f-password").value = pw;
    }),
  );
}

function requireUser() {
  if (state.user) return true;
  main.innerHTML = `<div class="container section">${empty("Please Sign In First", "Sign in or create an account to view your account details and orders.", "/login", "Sign In")}</div>`;
  return false;
}

/* ==========================================================================
   CART & CHECKOUT
   ========================================================================== */
function cartPage() {
  let cart = readCart();
  const stale = cart.filter((x) => !state.books.some((b) => b.id === x.bookId));
  if (stale.length) {
    cart = cart.filter((x) => state.books.some((b) => b.id === x.bookId));
    saveCart(cart);
    toast("Unavailable books were removed from your bag.");
  }

  if (!cart.length) {
    main.innerHTML = `
      <div class="container section">
        ${intro("Your Shopping Bag", "Review your items and proceed to secure checkout.")}
        ${empty("Your Shopping Bag is Empty.", "Discover great books from our collection and add them to your bag.", "/catalog", "Browse Books")}
      </div>
    `;
    return;
  }

  let subtotal =
      cart.reduce(
        (n, x) =>
          n +
          Math.round(
            Number(state.books.find((b) => b.id === x.bookId).price) * 100,
          ) *
            x.quantity,
        0,
      ) / 100,
    ships = cart.some(
      (x) => state.books.find((b) => b.id === x.bookId).type === "PRINTED",
    ),
    delivery = ships && subtotal < 5000 ? 350 : 0;

  main.innerHTML = `
    <div class="container section">
      ${intro("Shopping Bag", "Review your items and proceed to checkout.")}

      <!-- Free Islandwide Delivery Progress Meter -->
      <div class="cart-delivery-meter ${subtotal >= 5000 ? "meter-unlocked" : ""}">
        <div class="meter-text">
          ${subtotal >= 5000 
            ? `<span>🎉 <strong>Congratulations!</strong> Your order qualifies for <strong>FREE Express Islandwide Delivery!</strong></span>`
            : `<span>🚚 Add <strong>${money(5000 - subtotal)}</strong> more of books to unlock <strong>FREE Islandwide Delivery!</strong></span>`
          }
          <span class="threshold-pill">${money(subtotal)} / ${money(5000)}</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width: ${Math.min(100, Math.round((subtotal / 5000) * 100))}%;"></div>
        </div>
      </div>

      <div class="two-columns">
        <section>
          ${cart
            .map((x) => {
              let b = state.books.find((b) => b.id === x.bookId);
              return `
              <article class="cart-line">
                ${cover(b)}
                <div>
                  <a href="${url("/book?id=" + b.id)}"><h3>${esc(b.title)}</h3></a>
                  <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px">
                    by ${esc(author(b))} · ${b.type === "PRINTED" ? "Paperback" : "Digital E-Book"}
                  </div>
                  <label class="small-print" style="display:inline-flex;align-items:center;gap:6px">
                    Qty: 
                    <input class="qty" type="number" min="1" max="${Math.min(20, b.stock) || 1}" value="${x.quantity}" data-quantity="${x.bookId}" aria-label="Quantity for ${esc(b.title)}">
                  </label> 
                  &nbsp;·&nbsp;
                  <button class="plain-button" data-remove="${x.bookId}">Remove Item</button>
                  ${x.quantity > b.stock ? '<p class="form-error">Requested quantity exceeds current stock. Please reduce quantity.</p>' : ""}
                </div>
                <div style="text-align:right">
                  <span class="price">${money(Number(b.price) * x.quantity)}</span>
                  <div style="font-size:11px;color:var(--text-light)">${money(b.price)} each</div>
                </div>
              </article>`;
            })
            .join("")}
          
          <p style="margin-top:20px">
            <a class="text-link" href="${url("/catalog")}">← Continue Shopping</a>
          </p>
        </section>

        <aside class="panel summary">
          <h2>Order Summary</h2>
          <div class="summary-line">
            <span>Books Subtotal</span>
            <span>${money(subtotal)}</span>
          </div>
          <div class="summary-line">
            <span>Islandwide Delivery</span>
            <span>${delivery ? money(delivery) : '<strong style="color:var(--sarasavi-green)">FREE</strong>'}</span>
          </div>
          <div class="summary-line total">
            <span>Order Total</span>
            <span>${money(subtotal + delivery)}</span>
          </div>

          <div style="background:#EFF6FF;border-radius:var(--radius-md);padding:10px 12px;margin:16px 0;font-size:12px;color:var(--sarasavi-blue)">
            ${ships && subtotal < 5000 ? `Add <strong>${money(5000 - subtotal)}</strong> more to qualify for <strong>FREE DELIVERY</strong>!` : '✓ Congratulations! You qualified for <strong>FREE DELIVERY</strong>.'}
          </div>

          ${
            state.user
              ? `<form id="checkout">
                  ${textarea("address", ships ? "Delivery Address (Islandwide)" : "Order Note (Optional)", state.user.address, `${ships ? 'required minlength="10"' : ""} maxlength="350" placeholder="Street Address, City, Postal Code"`)}
                  <div class="field-note" style="margin:14px 0;font-size:12px;color:var(--text-muted)">
                    <strong>Payment Method:</strong> ${ships ? "Cash on Delivery (Pay when package arrives)" : "Digital Order (Recorded)"}<br>
                    <small>Academic Demo: No real financial charges are applied.</small>
                  </div>
                  <div class="form-error" role="alert"></div>
                  <button class="btn full" style="padding:14px" type="submit">Place Order (Cash on Delivery) →</button>
                </form>`
              : `<a class="btn full" style="padding:14px" href="${url("/login")}">Sign In to Checkout →</a>`
          }
        </aside>
      </div>
    </div>
  `;

  main.querySelectorAll("[data-remove]").forEach(
    (btn) =>
      (btn.onclick = () => {
        saveCart(readCart().filter((x) => x.bookId !== btn.dataset.remove));
        cartPage();
      }),
  );

  main.querySelectorAll("[data-quantity]").forEach(
    (input) =>
      (input.onchange = () => {
        let value = Number(input.value),
          b = state.books.find((b) => b.id === input.dataset.quantity);
        if (
          !Number.isInteger(value) ||
          value < 1 ||
          value > Math.min(20, b.stock)
        ) {
          toast("Please enter a valid quantity within available stock.", true);
          cartPage();
          return;
        }
        let c = readCart();
        c.find((x) => x.bookId === b.id).quantity = value;
        saveCart(c);
        cartPage();
      }),
  );

  if (state.user)
    bindForm(document.querySelector("#checkout"), async (d) => {
      await api("/orders", "POST", { items: readCart(), address: d.address });
      saveCart([]);
      location.href = url("/orders?placed=1");
    });
}

/* ==========================================================================
   ACCOUNT & ORDERS
   ========================================================================== */
async function accountPage() {
  if (!requireUser()) return;
  const u = state.user;
  main.innerHTML = `
    <div class="container section">
      ${intro("My Account", "Manage your profile, delivery address, and account preferences.")}
      
      <div class="account-menu">
        <a class="btn small" href="${url("/orders")}">My Orders</a>
        ${u.role === "ADMIN" ? `<a class="btn small secondary" href="${url("/admin")}">Admin Store Manager</a>` : ""}
        <button class="btn small secondary" id="logout">Sign Out</button>
      </div>

      <div class="two-columns">
        <section class="panel">
          <h2>Profile Details</h2>
          <form id="profile-form">
            <div class="form-grid">
              ${field("name", "Full Name", u.name, "text", 'required minlength="2" maxlength="80"')}
              ${field("email", "Email Address", u.email, "email", 'required maxlength="150"')}
              ${textarea("address", "Default Delivery Address", u.address, 'maxlength="350"')}
              ${field("currentPassword", "Current Password (required to update password)", "", "password", 'autocomplete="current-password" maxlength="128"')}
              ${field("password", "New Password (optional)", "", "password", 'minlength="8" maxlength="128" autocomplete="new-password"')}
            </div>
            <div class="form-error" role="alert"></div>
            <div class="form-actions">
              <button type="submit" class="btn">Save Changes</button>
            </div>
          </form>

          ${
            u.role !== "ADMIN"
              ? `<div style="margin-top:35px;padding-top:20px;border-top:1px solid var(--border-light)">
                  <h3 style="font-size:15px;color:var(--sarasavi-red)">Delete Account</h3>
                  <p class="small-print">Accounts with active order history cannot be deleted. Deleting your account also removes your reviews.</p>
                  <button class="plain-button" id="delete-account">Permanently Close Account</button>
                </div>`
              : ""
          }
        </section>

        <aside class="panel summary">
          <div class="eyebrow">Reader Membership</div>
          <h2>Welcome Back,<br>${esc(u.name)}!</h2>
          <p style="color:var(--text-muted);font-size:13px">Thank you for being part of the Book &amp; Bloom reading community.</p>
          <p class="small-print">Member since ${date(u.createdAt)}</p>
          <a class="text-link" href="${url("/catalog")}">Explore New Releases ↗</a>
        </aside>
      </div>
    </div>
  `;

  bindForm(document.querySelector("#profile-form"), async (d) => {
    state.user = await api("/users/" + u.id, "PUT", d);
    toast("Your account details have been updated.");
    accountPage();
  });

  document.querySelector("#logout").onclick = async () => {
    await api("/logout", "POST");
    location.href = url("/");
  };

  document.querySelector("#delete-account")?.addEventListener("click", () =>
    confirmAction(
      "Permanently delete your account?",
      "Your profile and reviews will be removed permanently.",
      async () => {
        await api("/users/" + u.id, "DELETE");
        location.href = url("/");
      },
    ),
  );
}


/* ==========================================================================
   OFFICIAL SARASAVI-STYLE TAX INVOICE & DELIVERY NOTE
   ========================================================================== */
async function printOfficialInvoice(orderId) {
  let orders = state.orders;
  if (!orders || !orders.length) {
    try {
      orders = await api("/orders");
      state.orders = orders;
    } catch (e) {
      toast("Unable to retrieve order details for invoice.");
      return;
    }
  }
  const o = orders.find((x) => x.id === orderId);
  if (!o) {
    toast("Order not found.");
    return;
  }

  const customerName = state.users?.find((u) => u.id === o.userId)?.name || state.user?.name || "Valued Reader";
  const customerEmail = state.users?.find((u) => u.id === o.userId)?.email || state.user?.email || "customer@bookbloom.lk";
  const invoiceNum = "INV-" + (o.id || "").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();

  const invoiceHtml = `
    <div class="invoice-wrapper" id="invoice-printable">
      <div class="invoice-toolbar-no-print">
        <button class="btn" id="btn-do-print">🖨️ Print Invoice / Save as PDF</button>
        <button class="btn secondary" id="btn-close-invoice">Close</button>
      </div>

      <div class="invoice-paper">
        <!-- Invoice Header -->
        <div class="invoice-header-row">
          <div class="invoice-brand">
            <div class="invoice-crest">
              <svg viewBox="0 0 36 36" fill="none" style="width:38px;height:38px">
                <rect width="36" height="36" rx="8" fill="#0A2540"/>
                <path d="M18 10C15 8 10 8 8 10V26C10 24 15 24 18 26M18 10C21 8 26 8 28 10V26C26 24 21 24 18 26M18 10V26" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 6L18 9" stroke="#E65100" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="18" cy="4" r="1.5" fill="#E65100"/>
              </svg>
            </div>
            <div>
              <h2 class="invoice-comp-title">BOOK &amp; BLOOM BOOKSHOP (PVT) LTD</h2>
              <small class="invoice-comp-tag">SRI LANKA'S PREMIER BOOKSTORE · INSPIRED BY SARASAVI</small>
              <div class="invoice-comp-meta">
                VAT Reg No: 114282082-7000 &nbsp;·&nbsp; Reg No: PV-98214<br>
                Stanley Thilakarathne Mawatha, Nugegoda &nbsp;|&nbsp; Galle Road, Colombo 03<br>
                Helpline: +94 11 282 0820 &nbsp;·&nbsp; Email: orders@bookbloom.lk
              </div>
            </div>
          </div>

          <div class="invoice-meta-box">
            <div class="invoice-badge-title">OFFICIAL TAX INVOICE</div>
            <table class="invoice-meta-table">
              <tr><td><strong>Invoice No:</strong></td><td>${invoiceNum}</td></tr>
              <tr><td><strong>Order Ref:</strong></td><td>${esc(o.id)}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${date(o.createdAt)}</td></tr>
              <tr><td><strong>Payment:</strong></td><td>${esc(o.paymentMethod || "Cash on Delivery")}</td></tr>
              <tr><td><strong>Status:</strong></td><td><span class="status ${o.status}">${o.status}</span></td></tr>
            </table>
          </div>
        </div>

        <hr class="invoice-divider">

        <!-- Customer & Dispatch Info -->
        <div class="invoice-addresses-row">
          <div class="invoice-address-col">
            <strong>BILLED &amp; DELIVER TO:</strong>
            <p>
              ${esc(customerName)}<br>
              ${esc(customerEmail)}<br>
              ${o.address ? esc(o.address) : "Digital E-Book Order (Email Dispatch)"}
            </p>
          </div>
          <div class="invoice-address-col">
            <strong>DISPATCH &amp; COURIER METHOD:</strong>
            <p>
              Prompt Express Islandwide Delivery Network<br>
              Dispatch Hub: Nugegoda Central Warehouse<br>
              Estimated Delivery: 2 - 3 Working Days
            </p>
          </div>
        </div>

        <!-- Line Items Table -->
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description / Book Title</th>
              <th>Format</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Unit Price</th>
              <th style="text-align:right">Total (LKR)</th>
            </tr>
          </thead>
          <tbody>
            ${o.lines.map((l, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${esc(l.title)}</strong></td>
                <td>Paperback Edition</td>
                <td style="text-align:center">${l.quantity}</td>
                <td style="text-align:right">${money(l.unitPrice)}</td>
                <td style="text-align:right">${money(Number(l.unitPrice) * l.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4"></td>
              <td style="text-align:right"><strong>Subtotal:</strong></td>
              <td style="text-align:right"><strong>${money(o.subtotal || o.lines.reduce((n, l) => n + Number(l.unitPrice) * l.quantity, 0))}</strong></td>
            </tr>
            <tr>
              <td colspan="4"></td>
              <td style="text-align:right"><strong>Islandwide Delivery:</strong></td>
              <td style="text-align:right"><strong>${Number(o.deliveryFee) === 0 ? "FREE" : money(o.deliveryFee)}</strong></td>
            </tr>
            <tr class="invoice-total-row">
              <td colspan="4"></td>
              <td style="text-align:right"><strong>TOTAL AMOUNT:</strong></td>
              <td style="text-align:right"><strong class="invoice-grand-total">${money(o.total)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <!-- Invoice Footer & Stamp -->
        <div class="invoice-footer-row">
          <div class="invoice-notice">
            <p><strong>Thank you for choosing Book &amp; Bloom Bookshop!</strong></p>
            <small>This is a computer-generated official tax invoice and courier delivery manifest. For inquiries regarding dispatch or exchanges, quote invoice reference number <strong>${invoiceNum}</strong>.</small>
          </div>

          <div class="invoice-stamp-box">
            <div class="invoice-seal">
              <span>BOOK &amp; BLOOM</span>
              <small>★ DISPATCH VERIFIED ★</small>
              <span>SRI LANKA</span>
            </div>
            <div class="invoice-signature-line">
              Authorized Dispatcher
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const dialog = showModal("Official Tax Invoice", invoiceHtml);
  dialog.querySelector("#btn-do-print")?.addEventListener("click", () => {
    window.print();
  });
  dialog.querySelector("#btn-close-invoice")?.addEventListener("click", () => {
    dialog.close();
  });
}

function orderCard(o, isAdmin = false) {
  return `
    <article class="order-card">
      <div class="order-top">
        <div>
          <h3>Order ${esc(o.id)}</h3>
          <span style="font-size:12px;color:var(--text-muted)">
            Placed on ${date(o.createdAt)}${isAdmin ? " · Customer: " + esc(state.users?.find((u) => u.id === o.userId)?.name || o.userId) : ""}
          </span>
        </div>
        <span class="status ${o.status}">${o.status}</span>
      </div>

      <!-- Live Logistics Delivery Stepper -->
      <div class="order-stepper">
        <div class="step-item ${o.status !== "CANCELLED" ? "step-done" : "step-cancelled"}">
          <div class="step-marker">${o.status === "CANCELLED" ? "✕" : "✓"}</div>
          <div class="step-desc"><strong>Order Placed</strong><small>${date(o.createdAt)}</small></div>
        </div>
        <div class="step-connector ${o.status === "PROCESSING" || o.status === "COMPLETED" ? "connector-active" : ""}"></div>
        <div class="step-item ${o.status === "PROCESSING" || o.status === "COMPLETED" ? "step-done" : (o.status === "CANCELLED" ? "step-cancelled" : "step-active")}">
          <div class="step-marker">${o.status === "COMPLETED" ? "✓" : (o.status === "PROCESSING" ? "●" : "2")}</div>
          <div class="step-desc"><strong>Warehouse</strong><small>Nugegoda Super Branch</small></div>
        </div>
        <div class="step-connector ${o.status === "COMPLETED" ? "connector-active" : ""}"></div>
        <div class="step-item ${o.status === "COMPLETED" ? "step-done" : (o.status === "PROCESSING" ? "step-active" : "")}">
          <div class="step-marker">${o.status === "COMPLETED" ? "✓" : "🚚"}</div>
          <div class="step-desc"><strong>Prompt Express</strong><small>${o.status === "COMPLETED" ? "Dispatched" : "Islandwide Courier"}</small></div>
        </div>
        <div class="step-connector ${o.status === "COMPLETED" ? "connector-active" : ""}"></div>
        <div class="step-item ${o.status === "COMPLETED" ? "step-done" : ""}">
          <div class="step-marker">${o.status === "COMPLETED" ? "★" : "📦"}</div>
          <div class="step-desc"><strong>Handover</strong><small>${o.status === "COMPLETED" ? "Delivered" : "Doorstep (2-3 Days)"}</small></div>
        </div>
      </div>

      ${o.lines
        .map(
          (l) => `
        <div class="order-line">
          <span>${esc(l.title)} × ${l.quantity}</span>
          <strong>${money(Number(l.unitPrice) * l.quantity)}</strong>
        </div>`,
        )
        .join("")}

      <div class="order-line" style="color:var(--text-muted)">
        <span>Islandwide Delivery</span>
        <span>${money(o.deliveryFee)}</span>
      </div>

      <p class="small-print" style="margin:12px 0 0 0">
        ${o.address ? "Delivery Address: " + esc(o.address) : "Digital Edition Order"} · Cash on delivery
      </p>

      <div class="order-bottom">
        <strong class="price">Total Amount: ${money(o.total)}</strong>
        <div class="order-actions">
          <button class="btn secondary small btn-print-invoice" data-print-order="${o.id}">
            📄 Print Tax Invoice
          </button>
          ${
            o.status === "PLACED"
              ? `<button class="btn secondary small" data-status="${o.id}" data-next="CANCELLED">Cancel Order</button>
                 ${isAdmin ? `<button class="btn small" data-status="${o.id}" data-next="PROCESSING">Process Order</button>` : ""}`
              : ""
          }
          ${
            o.status === "PROCESSING" && isAdmin
              ? `<button class="btn secondary small" data-status="${o.id}" data-next="CANCELLED">Cancel</button>
                 <button class="btn small" data-status="${o.id}" data-next="COMPLETED">Mark Completed</button>`
              : ""
          }
          ${
            o.status === "CANCELLED"
              ? `<button class="plain-button" data-delete-order="${o.id}">Delete Record</button>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

function bindOrders(refresh) {
  main.querySelectorAll("[data-status]").forEach(
    (btn) =>
      (btn.onclick = () =>
        confirmAction(
          btn.dataset.next === "CANCELLED"
            ? "Cancel this order?"
            : "Update order status?",
          btn.dataset.next === "CANCELLED"
            ? "All book quantities will be restored back to warehouse stock."
            : "Update this order status to " + btn.dataset.next.toLowerCase() + ".",
          async () => {
            await api("/orders/" + btn.dataset.status, "PUT", {
              status: btn.dataset.next,
            });
            await refreshCatalog();
            await refresh();
            toast("Order status updated.");
          },
        )),
  );

  main.querySelectorAll("[data-print-order]").forEach((btn) => {
    btn.onclick = () => printOfficialInvoice(btn.dataset.printOrder);
  });

  main.querySelectorAll("[data-delete-order]").forEach(
    (btn) =>
      (btn.onclick = () =>
        confirmAction(
          "Delete cancelled order record?",
          "This will remove the cancelled order from your history.",
          async () => {
            await api("/orders/" + btn.dataset.deleteOrder, "DELETE");
            await refresh();
            toast("Order record deleted.");
          },
        )),
  );
}

async function ordersPage() {
  if (!requireUser()) return;
  const orders = await api("/orders");
  main.innerHTML = `
    <div class="container section">
      ${intro("Order Tracking & History", "Track your book dispatches and past orders across Sri Lanka.")}
      <div style="margin-top:20px">
        ${orders.length ? orders.map((o) => orderCard(o, state.user.role === "ADMIN")).join("") : empty("No Orders Placed Yet.", "Your bookshelf is waiting. Find your next book today!", "/catalog", "Start Shopping")}
      </div>
    </div>
  `;
  bindOrders(ordersPage);
  if (new URLSearchParams(location.search).has("placed")) {
    toast("✓ Your order has been placed! Thank you for choosing Book & Bloom.");
    history.replaceState(null, "", url("/orders"));
  }
}

/* ==========================================================================
   ADMIN STORE MANAGER
   ========================================================================== */
const adminModules = [
  ["overview", "grid", "Dashboard"],
  ["books", "book", "Inventory"],
  ["authors", "user", "Authors"],
  ["categories", "leaf", "Categories"],
  ["orders", "bag", "Orders"],
  ["users", "user", "Customers"],
  ["reviews", "star", "Reviews"],
];

async function adminPage(tab = state.adminTab) {
  if (!requireUser()) return;
  if (state.user.role !== "ADMIN") {
    main.innerHTML = `<div class="container section">${empty("Restricted Area.", "Administrator privileges required to access Store Manager.", "/account", "Back to Account")}</div>`;
    return;
  }
  state.adminTab = tab;
  [state.orders, state.users] = await Promise.all([
    api("/orders"),
    api("/users"),
  ]);

  main.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="eyebrow">STORE MANAGER</div>
        <h3 style="color:#FFFFFF;font-size:16px;margin:0 0 16px 0">Sarasavi Desk</h3>
        <nav class="admin-tabs" aria-label="Administration Navigation">
          ${adminModules
            .map(
              ([id, i, title]) =>
                `<button class="admin-tab ${tab === id ? "active" : ""}" data-tab="${id}">${icon(i)}<span>${title}</span></button>`,
            )
            .join("")}
        </nav>
        <div style="margin-top:30px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:11px;color:#94A3B8">
          Logged in as <strong>${esc(state.user.name)}</strong><br>
          Role: Bookstore Administrator
        </div>
      </aside>

      <section id="admin-content"></section>
    </div>
  `;

  main.querySelectorAll("[data-tab]").forEach(
    (btn) =>
      (btn.onclick = () =>
        adminPage(btn.dataset.tab).catch((e) => toast(e.message, true))),
  );

  renderAdmin(tab);
}

function renderAdmin(tab) {
  const el = document.querySelector("#admin-content"),
    title = adminModules.find((x) => x[0] === tab)[2],
    descriptions = {
      overview: "Comprehensive performance overview of sales, inventory and readers.",
      books: "Manage catalog books, pricing, stock levels and formats.",
      authors: "Manage author profiles and biographies.",
      categories: "Organize book categories and inventory sections.",
      orders: "Process customer orders and manage dispatch statuses.",
      users: "View reader accounts and manage roles.",
      reviews: "Moderate reader reviews and maintain quality community feedback.",
    };

  el.innerHTML = `
    <div class="admin-heading">
      <div>
        <h1>${tab === "overview" ? "Bookstore Overview" : title}</h1>
        <p style="color:var(--text-muted);font-size:13px;margin:4px 0 0 0">${descriptions[tab]}</p>
      </div>
      ${
        ["books", "authors", "categories", "users"].includes(tab)
          ? `<button class="btn" id="add-record">+ Add ${tab === "categories" ? "Category" : tab === "users" ? "Customer" : tab.slice(0, -1)}</button>`
          : tab === "overview"
            ? `<a class="btn secondary small" href="${url("/")}">View Storefront ↗</a>`
            : ""
      }
    </div>
    <div id="admin-body"></div>
  `;

  document
    .querySelector("#add-record")
    ?.addEventListener("click", () => editRecord(tab));

  const body = document.querySelector("#admin-body");

  if (tab === "overview") {
    let active = state.orders.filter((o) => o.status !== "CANCELLED"),
      revenue = active.reduce((n, o) => n + Number(o.total), 0);

    body.innerHTML = `
      <div class="stats">
        ${[
          ["Books in Catalog", state.books.length, "Across " + state.categories.length + " categories"],
          ["Active Orders", active.length, "Placed & processing"],
          ["Gross Order Value", money(revenue), "Excludes cancelled orders"],
          ["Registered Readers", state.users.filter((u) => u.role === "CUSTOMER").length, "Active bookstore members"],
        ]
          .map(
            ([label, value, note]) => `
          <div class="stat">
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${note}</small>
          </div>`,
          )
          .join("")}
      </div>

      <div class="admin-panels">
        <div class="panel">
          <h3>Recent Orders</h3>
          ${
            state.orders.length
              ? state.orders
                  .slice(0, 5)
                  .map(
                    (o) => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light)">
                  <div>
                    <strong>${esc(o.id)}</strong>
                    <small style="display:block;color:var(--text-muted)">${date(o.createdAt)}</small>
                  </div>
                  <span class="status ${o.status}">${o.status}</span>
                  <strong>${money(o.total)}</strong>
                </div>`,
                  )
                  .join("")
              : '<p style="color:var(--text-muted)">No orders placed yet.</p>'
          }
        </div>

        <div class="panel">
          <h3>Books by Category</h3>
          ${state.categories
            .map((c) => {
              let n = state.books.filter((b) => b.categoryId === c.id).length;
              return `
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px">
                <span>${esc(c.name)}</span>
                <span>${n} titles</span>
              </div>
              <div style="background:#E2E8F0;height:6px;border-radius:3px;overflow:hidden;margin-bottom:12px">
                <div style="background:var(--sarasavi-blue);height:100%;width:${state.books.length ? (n / state.books.length) * 100 : 0}%"></div>
              </div>`;
            })
            .join("")}
        </div>
      </div>
    `;
    return;
  }

  if (tab === "orders") {
    body.innerHTML = `
      <div style="margin-bottom:20px">
        <select id="order-filter" aria-label="Filter orders by status" style="padding:8px 14px;border:1px solid var(--border-dark);border-radius:var(--radius-md)">
          <option value="">All Orders</option>
          ${["PLACED", "PROCESSING", "COMPLETED", "CANCELLED"].map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      </div>
      <div id="admin-orders"></div>
    `;

    const draw = () => {
      const filter = document.querySelector("#order-filter").value,
        list = state.orders.filter((o) => !filter || o.status === filter);
      document.querySelector("#admin-orders").innerHTML = list.length
        ? list.map((o) => orderCard(o, true)).join("")
        : empty("No Orders Found.", "No orders match the selected filter.", null);
      bindOrders(() => adminPage("orders"));
    };

    document.querySelector("#order-filter").onchange = draw;
    draw();
    return;
  }

  body.innerHTML = `
    <input class="table-search" id="admin-search" type="search" placeholder="Search records by keyword…" aria-label="Search records">
    <div id="admin-table"></div>
  `;

  const draw = () => {
    let q = document.querySelector("#admin-search").value.toLowerCase(),
      list = state[tab].filter((x) =>
        JSON.stringify(x).toLowerCase().includes(q),
      );

    let headers = {
      books: ["Book", "Category", "Price / Stock", "Actions"],
      authors: ["Author & Era", "Nationality & Genre", "Honors & Accolades", "Catalog Titles", "Actions"],
      categories: ["Category Name", "Description", "Titles", "Actions"],
      users: ["Customer Name", "Contact", "Role", "Actions"],
      reviews: ["Reader / Book", "Review", "Rating", "Actions"],
    }[tab];

    const actions = (x) =>
      `<div class="table-actions">
        ${tab !== "reviews" ? `<button class="plain-button" style="color:var(--sarasavi-blue)" data-edit="${esc(x.id)}">Edit</button>` : ""}
        ${!(tab === "users" && x.role === "ADMIN") ? `<button class="plain-button" data-delete="${esc(x.id)}">Delete</button>` : ""}
      </div>`;

    const row = (x) => {
      switch (tab) {
        case "books":
          return `<td><strong>${esc(x.title)}</strong><small style="display:block;color:var(--text-muted)">${esc(author(x))} · ${x.type === "PRINTED" ? "Paperback" : "E-Book"}</small></td><td>${esc(category(x))}</td><td>${money(x.price)}<small style="display:block;color:var(--text-muted)">${x.stock} in stock</small></td><td>${actions(x)}</td>`;
        case "authors": {
          const titlesCount = state.books.filter((b) => b.authorId === x.id).length;
          const authorAvatar = x.photoUrl
            ? `<img src="${esc(x.photoUrl)}" alt="${esc(x.name)}" class="author-table-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : "";
          const initials = (x.name || "A").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
          const fallbackAvatar = `<span class="author-table-avatar-fallback">${esc(initials)}</span>`;
          return `
            <td>
              <div style="display:flex;align-items:center;gap:12px">
                <div class="author-table-avatar-wrap">
                  ${authorAvatar}
                  ${fallbackAvatar}
                </div>
                <div>
                  <strong style="color:var(--text);font-size:14px;display:block">${esc(x.name)}</strong>
                  <small style="color:var(--text-muted);font-size:12px;display:flex;align-items:center;gap:4px">
                    ${x.bornYear ? `<span>🗓 ${esc(x.bornYear)}</span>` : `<span style="font-style:italic">Era not specified</span>`}
                  </small>
                </div>
              </div>
            </td>
            <td>
              <div style="display:flex;flex-direction:column;gap:4px">
                ${x.nationality ? `<span class="badge" style="width:fit-content;background:rgba(10,37,64,0.08);color:#0a2540;font-weight:700;font-size:11.5px;padding:2px 8px;border-radius:4px">🇱🇰 ${esc(x.nationality)}</span>` : `<span style="color:var(--text-muted);font-size:12px">—</span>`}
                ${x.primaryGenre ? `<span style="font-size:12px;color:var(--text-secondary);font-weight:600">${esc(x.primaryGenre)}</span>` : ""}
              </div>
            </td>
            <td style="max-width:260px">
              ${x.accolades
                ? `<span class="badge" style="background:rgba(217,119,6,0.12);color:#b45309;border:1px solid rgba(217,119,6,0.25);font-size:11.5px;font-weight:600;display:inline-block;padding:3px 8px;border-radius:6px;line-height:1.35">🏆 ${esc(x.accolades)}</span>`
                : `<span style="color:var(--text-muted);font-size:12px">—</span>`}
            </td>
            <td>
              <a href="${url("/catalog?search=" + encodeURIComponent(x.name))}" style="text-decoration:none">
                <span class="badge" style="background:var(--bg-light);border:1px solid var(--border);color:var(--text);font-weight:700;padding:3px 10px;border-radius:20px;font-size:12px;cursor:pointer">
                  ${titlesCount} ${titlesCount === 1 ? "Title" : "Titles"} ↗
                </span>
              </a>
            </td>
            <td>${actions(x)}</td>
          `;
        }
        case "categories":
          return `<td><strong>${esc(x.name)}</strong></td><td>${esc(x.description)}</td><td>${state.books.filter((b) => b.categoryId === x.id).length}</td><td>${actions(x)}</td>`;
        case "users":
          return `<td><strong>${esc(x.name)}</strong><small style="display:block;color:var(--text-muted)">${esc(x.id)}</small></td><td>${esc(x.email)}<small style="display:block;color:var(--text-muted)">${esc(x.address)}</small></td><td><span class="status">${x.role}</span></td><td>${actions(x)}</td>`;
        case "reviews":
          return `<td><strong>${esc(x.name)}</strong><small style="display:block;color:var(--text-muted)">${esc(state.books.find((b) => b.id === x.bookId)?.title)}</small></td><td>${esc(x.comment)}</td><td class="stars">${"★".repeat(x.rating)}</td><td>${actions(x)}</td>`;
      }
    };

    document.querySelector("#admin-table").innerHTML = list.length
      ? `<div class="table-wrap">
          <table>
            <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>${list.map((x) => `<tr>${row(x)}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="small-print" style="margin-top:10px">${list.length} records</p>`
      : empty("No Records Found.", "Try another keyword or add a new entry.", null);

    main.querySelectorAll("[data-edit]").forEach(
      (btn) =>
        (btn.onclick = () =>
          editRecord(
            tab,
            state[tab].find((x) => x.id === btn.dataset.edit),
          )),
    );

    main.querySelectorAll("[data-delete]").forEach(
      (btn) =>
        (btn.onclick = () =>
          confirmAction(
            "Delete record?",
            "This action is permanent. Records currently referenced by other orders cannot be removed.",
            async () => {
              await api("/" + tab + "/" + btn.dataset.delete, "DELETE");
              await refreshCatalog();
              await adminPage(tab);
              toast("Record deleted successfully.");
            },
          )),
    );
  };

  document.querySelector("#admin-search").oninput = draw;
  draw();
}

function editRecord(tab, item) {
  let x = item || {},
    fields = "";

  if (tab === "books")
    fields = `
      ${field("title", "Book Title", x.title, "text", 'required maxlength="140"')}
      ${field("isbn", "ISBN / Barcode", x.isbn, "text", 'required minlength="3" maxlength="30"')}
      ${select("authorId", "Author", state.authors, x.authorId)}
      ${select("categoryId", "Category", state.categories, x.categoryId)}
      ${select(
        "type",
        "Book Format",
        [
          { id: "PRINTED", name: "Printed Book (Paperback)" },
          { id: "EBOOK", name: "Digital E-Book" },
        ],
        x.type || "PRINTED",
      )}
      ${field("price", "Price (LKR)", x.price || "", "number", 'required min="0.01" max="1000000" step="0.01"')}
      ${field("stock", "Stock Available", x.stock ?? 0, "number", 'required min="0" max="100000" step="1"')}
      ${field("pages", "Pages (Printed)", x.pages || 240, "number", 'min="1" max="10000" step="1"')}
      ${select(
        "fileFormat",
        "E-Book Format",
        [
          { id: "PDF", name: "PDF" },
          { id: "EPUB", name: "EPUB" },
        ],
        x.fileFormat || "PDF",
      )}
      ${field("coverColor", "Cover Theme Color", x.coverColor || "#0A2540", "color", "required")}
      ${textarea("description", "Book Description", x.description, 'required minlength="10" maxlength="2500"')}
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;margin-top:8px">
        <input type="checkbox" name="featured" ${x.featured ? "checked" : ""}> Mark as Sarasavi Best Seller
      </label>
    `;

  if (tab === "authors")
    fields = `
      <div class="form-grid-2col">
        ${field("name", "Author Full Name *", x.name, "text", 'required minlength="2" maxlength="100" placeholder="e.g. Martin Wickramasinghe"')}
        ${field("bornYear", "Birth Year / Literary Era", x.bornYear || "", "text", 'placeholder="e.g. 1890 – 1976 or 1975 – Present" maxlength="30"')}
        ${field("nationality", "Nationality / Origin", x.nationality || "", "text", 'placeholder="e.g. Sri Lankan, British, American" maxlength="80"')}
        ${field("primaryGenre", "Primary Literary Genre", x.primaryGenre || "", "text", 'placeholder="e.g. Sinhala Realism & Classics, Fiction" maxlength="100"')}
        <div class="form-field wide">
          <label for="f-accolades">Honors & Accolades (Prestigious Awards)</label>
          <input id="f-accolades" name="accolades" type="text" value="${esc(x.accolades || "")}" placeholder="e.g. Booker Prize Winner 2022, Father of Modern Sinhala Literature" maxlength="250">
        </div>
        <div class="form-field wide">
          <label for="f-photoUrl">Author Portrait / Photo URL</label>
          <input id="f-photoUrl" name="photoUrl" type="text" value="${esc(x.photoUrl || "")}" placeholder="https://... or /images/authors/author-name.jpg" maxlength="500">
        </div>
        ${textarea("bio", "Biography & Literary Legacy *", x.bio, 'required minlength="10" maxlength="1500" placeholder="A comprehensive biographical note highlighting the author\'s style, major themes, and cultural impact..."')}
      </div>
    `;

  if (tab === "categories")
    fields = `
      ${field("name", "Category Name", x.name, "text", 'required minlength="2" maxlength="60"')}
      ${textarea("description", "Description", x.description, 'required minlength="5" maxlength="300"')}
    `;

  if (tab === "users")
    fields = `
      ${field("name", "Customer Name", x.name, "text", 'required minlength="2" maxlength="80"')}
      ${field("email", "Email Address", x.email, "email", 'required maxlength="150"')}
      ${textarea("address", "Delivery Address", x.address, 'maxlength="350"')}
      ${!item ? field("password", "Initial Password", "", "password", 'required minlength="8" maxlength="128" autocomplete="new-password"') : ""}
    `;

  const label =
      tab === "categories"
        ? "Category"
        : tab === "users"
          ? "Customer"
          : tab.slice(0, -1),
    dialog = showModal(
      (item ? "Edit " : "Add New ") + label,
      `<form><div class="form-grid">${fields}</div><div class="form-error" role="alert"></div><div class="form-actions"><button class="btn" type="submit">Save ${label}</button></div></form>`,
    );

  if (tab === "books") {
    const toggle = () => {
      const printed = dialog.querySelector("[name=type]").value === "PRINTED";
      dialog.querySelector("[name=pages]").closest(".form-field").hidden =
        !printed;
      dialog.querySelector("[name=pages]").disabled = !printed;
      dialog.querySelector("[name=fileFormat]").closest(".form-field").hidden =
        printed;
      dialog.querySelector("[name=fileFormat]").disabled = printed;
    };
    dialog.querySelector("[name=type]").onchange = toggle;
    toggle();
  }

  bindForm(dialog.querySelector("form"), async (d) => {
    if (tab === "books") {
      d.stock = Number(d.stock);
      if (d.pages) d.pages = Number(d.pages);
      d.featured = d.featured === "on";
    }
    await api(
      tab === "users" && !item
        ? "/register"
        : "/" + tab + (item ? "/" + item.id : ""),
      item ? "PUT" : "POST",
      d,
    );
    dialog.close();
    await refreshCatalog();
    await adminPage(tab);
    toast("Saved! Bookstore records updated.");
  });
}

async function refreshCatalog() {
  [state.books, state.authors, state.categories, state.reviews] =
    await Promise.all([
      api("/books"),
      api("/authors"),
      api("/categories"),
      api("/reviews"),
    ]);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToCart(btn.dataset.add, btn);
});

window.addEventListener("storage", (e) => {
  if (e.key === "bookbloom-cart") {
    updateBag();
    if (page === "cart") cartPage();
  }
});

/* ==========================================================================
   INTERACTIVE ANIMATION SYSTEMS
   ========================================================================== */

// 1. Gold-Standard Luxury Dual-Stage Magnetic Cursor
function initCustomCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isMoving = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    if (!isMoving) {
      ringX = mouseX;
      ringY = mouseY;
      isMoving = true;
    }
    document.body.classList.remove("cursor-hidden");
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    document.body.classList.add("cursor-hidden");
  });

  document.addEventListener("mousedown", () => {
    document.body.classList.add("cursor-active");
  });

  document.addEventListener("mouseup", () => {
    document.body.classList.remove("cursor-active");
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Dynamic hover delegation for smooth highlight halo
  document.addEventListener("mouseover", (e) => {
    const interactive = e.target.closest("a, button, .btn, .category-card-v2, .author-card-v2, input, select, .feature-strip-card, .book-scene, .hero-spotlight-card, .book-card");
    if (interactive) {
      document.body.classList.add("cursor-hover");
    }
  });

  document.addEventListener("mouseout", (e) => {
    const interactive = e.target.closest("a, button, .btn, .category-card-v2, .author-card-v2, input, select, .feature-strip-card, .book-scene, .hero-spotlight-card, .book-card");
    if (interactive) {
      document.body.classList.remove("cursor-hover");
    }
  });
}

// 2. Luxury Hero Editorial Slider (Auto-play, Cross-fade, Arrow & Dot Nav)
function initHeroSlider() {
  const slider = document.getElementById("hero-slider");
  if (!slider || slider.__sliderBound) return;
  slider.__sliderBound = true;

  const slides = slider.querySelectorAll(".hero-slide");
  const dots = slider.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("hero-slider-prev");
  const nextBtn = document.getElementById("hero-slider-next");
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  function goToSlide(index) {
    slides[current].classList.remove("active");
    if (dots[current]) dots[current].classList.remove("active");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("active");
    if (dots[current]) dots[current].classList.add("active");
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(() => {
      goToSlide(current + 1);
    }, 5500);
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goToSlide(current - 1);
      startAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToSlide(current + 1);
      startAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      goToSlide(idx);
      startAutoPlay();
    });
  });

  slider.addEventListener("mouseenter", stopAutoPlay);
  slider.addEventListener("mouseleave", startAutoPlay);

  startAutoPlay();
}

// 3. 3D Perspective Book Tilt with Dynamic Glare Sheen
function init3DBookTilt() {
  const cards = document.querySelectorAll(".book-scene, .hero-spotlight-card");
  cards.forEach((card) => {
    if (card.__tiltBound) return;
    card.__tiltBound = true;

    let glare = card.querySelector(".book-glare");
    if (!glare) {
      glare = document.createElement("div");
      glare.className = "book-glare";
      const cover = card.querySelector(".book-cover") || card;
      cover.appendChild(glare);
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;

      const rotX = (-dy * 12).toFixed(2);
      const rotY = (dx * 14).toFixed(2);

      card.style.transform = `perspective(850px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04) translateZ(8px)`;
      if (glare) {
        glare.style.opacity = "0.7";
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)`;
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      if (glare) {
        glare.style.opacity = "0";
      }
    });
  });
}

// 4. Rotating Top Announcement Ticker
function initAnnouncementTicker() {
  const ticker = document.getElementById("announcement-ticker");
  if (!ticker) return;
  const items = ticker.querySelectorAll(".ticker-item");
  if (items.length <= 1) return;
  let current = 0;
  setInterval(() => {
    items[current].classList.remove("active");
    items[current].classList.add("prev");
    const prev = current;
    setTimeout(() => {
      items[prev].classList.remove("prev");
    }, 500);
    current = (current + 1) % items.length;
    items[current].classList.add("active");
  }, 3800);
}

// 5. Floating Back to Top Button
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 6. Scroll Reveal Observer
function initScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal-item, .feature-strip-card, .category-card-v2, .author-card-v2, .promo-banner-card").forEach((el) => {
      el.classList.add("revealed");
    });
    return;
  }

  const elements = document.querySelectorAll(".book-card, .author-card-v2, .promo-banner-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.04, rootMargin: "0px 0px -10px 0px" });

  elements.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 350) {
      el.classList.add("revealed");
    } else {
      el.classList.add("reveal-item");
      el.style.setProperty("--reveal-index", i % 6);
      observer.observe(el);
    }
  });
}

async function init() {
  try {
    const session = await api("/session");
    state.user = session.user;
    state.csrf = session.csrf;
    await refreshCatalog();
    updateAccount();

    // Bind header search form submission
    const headerSearchForm = document.querySelector("#header-search-form");
    if (headerSearchForm) {
      headerSearchForm.addEventListener("submit", (e) => {
        const val = document.querySelector("#header-search-input")?.value?.trim();
        if (page === "catalog") {
          e.preventDefault();
          const catSearchInput = document.querySelector("#catalog-search");
          if (catSearchInput) {
            catSearchInput.value = val;
            catSearchInput.dispatchEvent(new Event("input"));
          }
        }
      });
    }

    const routes = {
      home,
      catalog,
      book: bookDetail,
      cart: cartPage,
      login: () => auth(false),
      register: () => auth(true),
      account: accountPage,
      orders: ordersPage,
      admin: adminPage,
    };
    await (routes[page] || home)();

    // Initialize Global Interactive Animations
    initCustomCursor();
    initHeroSlider();
    init3DBookTilt();
    initAnnouncementTicker();
    initBackToTop();
    initScrollReveal();
  } catch (e) {
    main.innerHTML = `<div class="container section">${empty("Unable to Load Bookstore.", e.message, null)}<p style="text-align:center;margin-top:20px"><button class="btn secondary" id="retry">Try Again</button></p></div>`;
    document.querySelector("#retry")?.addEventListener("click", init);
  }
}

init();
