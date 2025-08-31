// ===== helpers =====
const $ = (q, c = document) => c.querySelector(q);
const $$ = (q, c = document) => [...c.querySelectorAll(q)];
const fmt = (n) =>
  n.toLocaleString("nl-BE", { style: "currency", currency: "EUR" });

// ===== burger & smooth scroll =====
const burger = $(".burger");
const nav = $("#main-nav");
if (burger && nav) {
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (open) window.scrollTo({ top: 0 }); // чтобы меню не "съезжало"
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

// плавный скролл
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// год в подвале
$("#year").textContent = new Date().getFullYear();

// ===== About: смена фона/фото (локально в браузере) =====
const aboutSection = $("#about");
$("#about-bg-input")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  aboutSection.style.background = `linear-gradient(180deg, rgba(212,175,55,.04), rgba(0,0,0,0)), url('${url}') center/cover no-repeat`;
});
$("#about-gallery-input")?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.src = url;
  img.alt = "Galerij";
  $("#about-gallery").prepend(img);
});

// ===== Shop: демо-товары (замени своими) =====
const PRODUCTS = [
  {
    id: "boho-aurora",
    name: "Boho Jurk “Aurora”",
    desc: "Zijde, handgemaakt borduurwerk.",
    price: 189,
    img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop",
    frames: null,
  },
  {
    id: "renaissance-coat",
    name: "Renaissance Jas",
    desc: "Historische snit, moderne pasvorm.",
    price: 260,
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    frames: "assets/360/coat",
  },
  {
    id: "corset-elise",
    name: "Korset “Elise”",
    desc: "Op maat, baleinen en kant.",
    price: 149,
    img: "https://images.unsplash.com/photo-1520975922284-9a4b3a3a0fda?q=80&w=1200&auto=format&fit=crop",
    frames: "assets/360/corset",
  },
];

const productsEl = $("#products");
function renderProducts() {
  productsEl.innerHTML = PRODUCTS.map(
    (p) => `
    <article class="card" data-id="${p.id}">
      <div class="media"><img src="${p.img}" alt="${p.name}"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <p class="muted">${p.desc}</p>
        <div class="price">${fmt(p.price)}</div>
      </div>
      <div class="footer">
        ${
          p.frames
            ? `<button class="btn-secondary" data-360="${p.id}">360°</button>`
            : ""
        }
        <button class="btn btn-gold" data-add="${p.id}">In winkelwagen</button>
      </div>
    </article>
  `
  ).join("");
}
renderProducts();

// ===== Cart (localStorage) =====
const CART_KEY = "atelier_cart_v1";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const cartDrawer = $("#cart-drawer");
const cartCount = $("#cart-count");
const backdrop = $("#backdrop");

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}
function addToCart(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const it = cart.find((x) => x.id === id);
  if (it) it.qty++;
  else
    cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
  saveCart();
  openCart();
}
function removeFromCart(id) {
  cart = cart.filter((x) => x.id !== id);
  saveCart();
}
function changeQty(id, d) {
  const it = cart.find((x) => x.id === id);
  if (!it) return;
  it.qty = Math.max(1, it.qty + d);
  saveCart();
}
function subtotal() {
  return cart.reduce((s, x) => s + x.price * x.qty, 0);
}

function updateCartUI() {
  cartCount.textContent = cart.reduce((s, x) => s + x.qty, 0);
  const box = $("#cart-items");
  box.innerHTML = cart.length
    ? cart
        .map(
          (it) => `
    <div class="cart-item">
      <img src="${it.img}" alt="${it.name}">
      <div>
        <h4>${it.name}</h4>
        <div class="muted">${fmt(it.price)} • per stuk</div>
        <div class="qty">
          <button aria-label="Minder" data-dec="${it.id}">−</button>
          <span>${it.qty}</span>
          <button aria-label="Meer" data-inc="${it.id}">+</button>
          <button class="remove" data-rem="${it.id}">verwijderen</button>
        </div>
      </div>
      <div class="price">${fmt(it.price * it.qty)}</div>
    </div>
  `
        )
        .join("")
    : `<p class="muted">Je winkelwagen is leeg.</p>`;
  $("#subtotal").textContent = fmt(subtotal());
  calcTotal();
}
updateCartUI();

function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
}

$(".cart-link").addEventListener("click", (e) => {
  e.preventDefault();
  openCart();
});
$("#cart-close").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

$("#cart-items").addEventListener("click", (e) => {
  const dec = e.target.closest("[data-dec]")?.getAttribute("data-dec");
  const inc = e.target.closest("[data-inc]")?.getAttribute("data-inc");
  const rem = e.target.closest("[data-rem]")?.getAttribute("data-rem");
  if (dec) changeQty(dec, -1);
  if (inc) changeQty(inc, +1);
  if (rem) removeFromCart(rem);
});

$("#shipping").addEventListener("change", calcTotal);
function calcTotal() {
  const ship = parseFloat($("#shipping").value || "0");
  $("#total").textContent = fmt(subtotal() + ship);
}

// demo checkout
$("#checkout-form").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Bedankt! Je demo-bestelling is bevestigd.");
  cart = [];
  saveCart();
  closeCart();
});

// ===== 360 viewer =====
const viewerModal = $("#viewer360");
const viewerImg = $("#viewer360-img");
const viewerClose = $("#viewer360-close");

function framePath(prefix, i) {
  return `${prefix}_${String(i).padStart(2, "0")}.jpg`;
}

let frames = [],
  idx = 0,
  drag = false,
  lastX = 0;

function openViewer360(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p?.frames) return;
  frames = Array.from({ length: 36 }, (_, k) => framePath(p.frames, k + 1));
  idx = 0;
  viewerImg.src = frames[idx];
  viewerModal.setAttribute("aria-hidden", "false");
  for (let i = 1; i < 6; i++) {
    const im = new Image();
    im.src = frames[i];
  }
}
function closeViewer() {
  viewerModal.setAttribute("aria-hidden", "true");
}
viewerClose.addEventListener("click", closeViewer);

viewerModal.addEventListener("mousedown", (e) => {
  drag = true;
  lastX = e.clientX;
});
window.addEventListener("mouseup", () => (drag = false));
viewerModal.addEventListener("mousemove", (e) => {
  if (!drag) return;
  const dx = e.clientX - lastX;
  if (Math.abs(dx) > 5) {
    lastX = e.clientX;
    idx = (idx + (dx > 0 ? -1 : 1) + frames.length) % frames.length;
    viewerImg.src = frames[idx];
  }
});

productsEl.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]")?.getAttribute("data-add");
  if (add) addToCart(add);
  const v = e.target.closest("[data-360]")?.getAttribute("data-360");
  if (v) openViewer360(v);
});

// ===== Reviews carousel arrows =====
$(".carousel .prev").addEventListener("click", () =>
  $("#reviews-track").scrollBy({ left: -320, behavior: "smooth" })
);
$(".carousel .next").addEventListener("click", () =>
  $("#reviews-track").scrollBy({ left: 320, behavior: "smooth" })
);
// ===== Попап-окна для иконок (откроются в отдельном окне)
function openPopup(title, html) {
  const w = window.open("", "_blank", "width=480,height=600");
  if (!w) return alert("Sta pop-ups toe om dit venster te openen.");
  w.document.write(`<!doctype html><html lang="nl"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
    <style>
      body{margin:0;background:#0b0c0f;color:#e7e2d3;font-family:"Cormorant Garamond",serif;line-height:1.5}
      .wrap{padding:16px 18px}
      h1{font-family:"Cinzel",serif;color:#d4af37;font-size:22px;margin:0 0 10px}
      input,select,button{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(212,175,55,.3);background:#11131a;color:#e7e2d3;margin:8px 0}
      .btn{background:linear-gradient(180deg, #f5e4b2, #d4af37);color:#1b1607;font-weight:700}
      .muted{color:#a6997b;font-size:13px}
    </style>
  </head><body><div class="wrap">${html}</div></body></html>`);
  w.document.close();
}

// Поиск
$("#btn-search")?.addEventListener("click", () => {
  openPopup(
    "Zoeken",
    `
    <h1>Zoeken</h1>
    <input placeholder="Zoekterm…">
    <button class="btn">Zoek</button>
    <p class="muted">Demo-venster. Hier kan later site-brede zoekfunctie komen.</p>
  `
  );
});

// Избранное
$("#btn-wishlist")?.addEventListener("click", () => {
  openPopup(
    "Verlanglijst",
    `
    <h1>Verlanglijst</h1>
    <p class="muted">Je verlanglijst is nog leeg.</p>
  `
  );
});

// Язык
$("#btn-lang")?.addEventListener("click", () => {
  openPopup(
    "Taal",
    `
    <h1>Taal</h1>
    <select>
      <option>Nederlands</option>
      <option>Français</option>
      <option>English</option>
      <option>Русский</option>
      <option>Українська</option>
    </select>
    <button class="btn">Opslaan</button>
    <p class="muted">Demo-venster. Later koppelen aan i18n.</p>
  `
  );
});

// Вход / регистрация
$("#btn-auth")?.addEventListener("click", () => {
  openPopup(
    "Inloggen / Registreren",
    `
    <h1>Inloggen</h1>
    <input type="email" placeholder="E-mail">
    <input type="password" placeholder="Wachtwoord">
    <button class="btn">Inloggen</button>
    <hr style="border-color:rgba(212,175,55,.3)">
    <h1>Registreren</h1>
    <input placeholder="Naam">
    <input type="email" placeholder="E-mail">
    <input type="password" placeholder="Wachtwoord">
    <button class="btn">Account aanmaken</button>
    <p class="muted">Demo-venster. Voor echte accounts is backend nodig.</p>
  `
  );
});
const pages = {
  home: $("#page-home"),
  shop: $("#page-shop"),
  contact: $("#page-contact"),
  atelier: $("#page-atelier"), // НОВЫЙ
};
function parseRoute() {
  return (location.hash.replace("#/", "") || "home").split("?")[0];
}
const BG_KEYS = {
  home: "--home-bg",
  shop: "--shop-bg",
  contact: "--contact-bg",
  atelier: "--atelier-bg",
};
["home", "shop", "contact", "atelier"].forEach(applySavedBg);
/* ===== NAV ===== */
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

/* ===== MODALS (search/auth) ===== */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute("aria-hidden", "false");
}
function closeModal(el) {
  el.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.open));
});
document.querySelectorAll(".modal [data-close]").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
});
document.querySelectorAll(".modal").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m) closeModal(m);
  });
});

/* ===== SEARCH ===== */
const siteSearchForm = document.getElementById("siteSearchForm");
if (siteSearchForm) {
  siteSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = new FormData(siteSearchForm).get("q");
    // Открываем страницу поиска в новой вкладке с параметром:
    window.open(`search.html?q=${encodeURIComponent(q)}`, "_blank");
  });
}

/* ===== AUTH (локально, демо) ===== */
const tabs = document.querySelectorAll(".tab");
const forms = {
  login: document.getElementById("loginForm"),
  register: document.getElementById("registerForm"),
};
tabs.forEach((t) =>
  t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    Object.values(forms).forEach((f) => f.classList.remove("active"));
    forms[t.dataset.tab]?.classList.add("active");
  })
);

if (forms.login) {
  forms.login.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(forms.login);
    const email = fd.get("email");
    localStorage.setItem("user", JSON.stringify({ email }));
    alert("Welkom!");
    closeModal(document.getElementById("authModal"));
  });
}
if (forms.register) {
  forms.register.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(forms.register);
    const user = { name: fd.get("name"), email: fd.get("email") };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Account aangemaakt. Welkom!");
    closeModal(document.getElementById("authModal"));
  });
}

/* ===== LANG ===== */
const langSwitch = document.querySelector(".lang-switch");
const langBtn = langSwitch?.querySelector(".icon-btn");
const langMenu = langSwitch?.querySelector(".lang-menu");

function setLang(code) {
  localStorage.setItem("lang", code);
  document.documentElement.lang = code;
  if (langBtn) langBtn.textContent = code.toUpperCase() + " ▾";
}
if (langBtn && langMenu) {
  langBtn.addEventListener("click", () => {
    const expanded = langBtn.getAttribute("aria-expanded") === "true";
    langBtn.setAttribute("aria-expanded", String(!expanded));
  });
  langMenu.querySelectorAll("[data-lang]").forEach((item) => {
    item.addEventListener("click", () => {
      setLang(item.dataset.lang);
      langBtn.setAttribute("aria-expanded", "false");
    });
  });
  // начальный язык:
  setLang(localStorage.getItem("lang") || "nl");
}

/* ===== CART BADGE (демо) ===== */
const cartCountEl = document.getElementById("cartCount");
function refreshCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cartCountEl) cartCountEl.textContent = cart.length;
}
refreshCartBadge();
