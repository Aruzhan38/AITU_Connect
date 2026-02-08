const CAFES = {
    "d85854aa-a302-4519-b98a-17eea9f104f1": { name: "Mokko", location: "Block C1.2" },
    "b15d9916-0714-4957-bf18-ee58d13e61fc": { name: "Atrium", location: "Main entrance" },
    "61ce75fd-0b4e-4535-8ae3-61924a5ec6ea": { name: "Sheker", location: "Block C1.1" },
};

const CATEGORIES = [
    { id: "all", title: "Популярное" },
    { id: "coffee", title: "Кофе ☕" },
    { id: "matcha", title: "Матча / чай 🍵" },
    { id: "milkshakes", title: "Молочные коктейли 🥤" },
    { id: "lemonades", title: "Лимонады 🍋" },
    { id: "signature", title: "Фирменные напитки ⭐" },
    { id: "hot", title: "Горячие напитки ♨️" },
    { id: "donuts", title: "Пончики 🍩" },
    { id: "sandwich", title: "Сэндвич 🥪" },
    { id: "desserts", title: "Десерты 🍰" },
    { id: "moti", title: "Моти 🍡" },
];

const COMMON_ITEMS = [
    { id: "c_latte_240", cat: "coffee", title: "Латте 240мл", desc: "Лёгкий молочно-кофейный напиток", price: 1090, img: "/static/img/menu/latte_240.jpg" },
    { id: "c_latte_360", cat: "coffee", title: "Ice Латте 360мл", desc: "Классический Ice латте", price: 1290, img: "/static/img/menu/latte_ice.jpg" },
    { id: "c_latte_480", cat: "coffee", title: "Латте 480мл", desc: "Большой латте", price: 1390, img: "/static/img/menu/latte_480.jpg" },
    { id: "c_raf_240", cat: "coffee", title: "Раф 240мл", desc: "Нежный ванильно-сливочный", price: 1090, img: "/static/img/menu/raf.jpg" },
    { id: "c_capp_240", cat: "coffee", title: "Капучино 240мл", desc: "Классика", price: 990, img: "/static/img/menu/cappuccino.jpg" },

    { id: "t_matcha", cat: "matcha", title: "Матча латте", desc: "Матча + молоко", price: 1490, img: "/static/img/menu/matcha.jpg" },
    { id: "t_black", cat: "matcha", title: "Чёрный чай", desc: "Классический", price: 690, img: "/static/img/menu/black_tea.png" },
    { id: "t_green", cat: "matcha", title: "Зелёный чай", desc: "Лёгкий", price: 690, img: "/static/img/menu/green_tea.jpg" },

    { id: "ms_vanilla", cat: "milkshakes", title: "Ванильный коктейль", desc: "Сливочный вкус", price: 1490, img: "/static/img/menu/vanilla_shake.jpg" },
    { id: "ms_choco", cat: "milkshakes", title: "Шоколадный коктейль", desc: "Какао + молоко", price: 1490, img: "/static/img/menu/choco_shake.jpg" },

    { id: "l_classic", cat: "lemonades", title: "Лимонад классик", desc: "Лимон + мята", price: 1190, img: "/static/img/menu/lemonade_classic.jpg" },
    { id: "l_berry", cat: "lemonades", title: "Ягодный лимонад", desc: "Ягоды + лёд", price: 1290, img: "/static/img/menu/lemonade_berry.jpg" },

    { id: "h_cocoa", cat: "hot", title: "Какао", desc: "Горячий шоколадный", price: 990, img: "/static/img/menu/cocoa.jpg" },
    { id: "h_americano", cat: "hot", title: "Американо", desc: "Крепкий", price: 890, img: "/static/img/menu/americano.jpg" },

    { id: "d_choco", cat: "donuts", title: "Пончик шоколад", desc: "Глазурь шоколад", price: 590, img: "/static/img/menu/donut_choco.jpeg" },
    { id: "d_straw", cat: "donuts", title: "Пончик клубника", desc: "Глазурь клубника", price: 590, img: "/static/img/menu/donut_straw.jpeg" },

    { id: "s_chicken", cat: "sandwich", title: "Сэндвич курица", desc: "Курица + соус", price: 1390, img: "/static/img/menu/sandwich_chicken.webp" },
    { id: "s_tuna", cat: "sandwich", title: "Сэндвич тунец", desc: "Тунец + салат", price: 1490, img: "/static/img/menu/sandwich_tuna.jpg" },

    { id: "ds_cheese", cat: "desserts", title: "Чизкейк", desc: "Классический", price: 1290, img: "/static/img/menu/cheesecake.webp" },
    { id: "ds_brownie", cat: "desserts", title: "Брауни", desc: "Шоколадный", price: 1090, img: "/static/img/menu/brownie.jpg" },

    { id: "m_mango", cat: "moti", title: "Моти манго", desc: "Нежный десерт", price: 990, img: "/static/img/menu/moti_mango.jpg" },
    { id: "m_straw", cat: "moti", title: "Моти клубника", desc: "Нежный десерт", price: 990, img: "/static/img/menu/moti_straw.jpg" },
];

const SIGNATURE_BY_CAFE = {
    "d85854aa-a302-4519-b98a-17eea9f104f1": [
        { id: "sig_mokko_1", cat: "signature", title: "Mokko Special", desc: "Фирменный кофе", price: 1590, img: "/static/img/menu/mokko_special.jpg" },
        { id: "sig_mokko_2", cat: "signature", title: "Caramel Breeze", desc: "Карамельный латте", price: 1690, img: "/static/img/menu/caramel_breeze.jpg" },
    ],
    "b15d9916-0714-4957-bf18-ee58d13e61fc": [
        { id: "sig_atrium_1", cat: "signature", title: "Atrium Berry Latte", desc: "Ягодный латте", price: 1690, img: "/static/img/menu/berry_latte.jpg" },
        { id: "sig_atrium_2", cat: "signature", title: "Vanilla Cloud", desc: "Ванильный раф", price: 1590, img: "/static/img/menu/vanilla_cloud.jpg" },
    ],
    "61ce75fd-0b4e-4535-8ae3-61924a5ec6ea": [
        { id: "sig_sheker_1", cat: "signature", title: "Sheker Ice Coffee", desc: "Фирменный айс", price: 1590, img: "/static/img/menu/ice_coffee.jpeg" },
        { id: "sig_sheker_2", cat: "signature", title: "Pistachio Latte", desc: "Фисташковый латте", price: 1790, img: "/static/img/menu/pistachio_latte.jpg" },
    ],
};

let PLACE_ID = "";
let ALL_ITEMS = [];
let ACTIVE_CAT = "all";

function cartKey(placeId){ return `aitu_saved_menu_${placeId}`; }
function loadCart(placeId){
    try { return JSON.parse(localStorage.getItem(cartKey(placeId)) || "[]"); }
    catch { return []; }
}
function saveCart(placeId, items){ localStorage.setItem(cartKey(placeId), JSON.stringify(items)); }

function money(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "";
    return `${x.toLocaleString("ru-RU").replace(/\s/g, "\u00A0")}\u00A0₸`;
}

function escapeHtml(s){
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
}
function safeAttr(s){
    return String(s ?? "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getPlaceIdFromPath(){
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[1] || "";
}

function buildItems(placeId){
    const signature = SIGNATURE_BY_CAFE[placeId] || [];
    return [...COMMON_ITEMS, ...signature];
}

function renderHeader(placeId){
    const meta = CAFES[placeId];
    const nameEl = document.getElementById("placeName");
    const locEl  = document.getElementById("placeLocation");
    if (!nameEl || !locEl) return;
    nameEl.textContent = meta?.name || "Cafe";
    locEl.textContent  = meta?.location || "Unknown place";
}

function catTitle(catId){
    if (catId === "all") return "Популярное";
    const t = (CATEGORIES.find(c => c.id === catId)?.title || catId);
    return String(t).replace(/[^\w\s\/\u0400-\u04FF\u00A0-]+/g, "").trim();
}

function renderCategories(){
    const bar = document.getElementById("catBar");
    if (!bar) return;

    bar.innerHTML = "";
    CATEGORIES.forEach(c => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `cat-btn ${c.id === ACTIVE_CAT ? "active" : ""}`;
        btn.textContent = c.title;
        btn.addEventListener("click", () => {
            ACTIVE_CAT = c.id;
            renderCategories();
            renderSections();
        });
        bar.appendChild(btn);
    });
}

function groupByCategory(items){
    const map = new Map();
    for (const it of items){
        if (!map.has(it.cat)) map.set(it.cat, []);
        map.get(it.cat).push(it);
    }
    return map;
}

function renderSections(){
    const root = document.getElementById("menuSections");
    if (!root) return;

    const q = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
    const cart = loadCart(PLACE_ID);

    let filtered = ALL_ITEMS.filter(it => {
        if (ACTIVE_CAT !== "all" && it.cat !== ACTIVE_CAT) return false;
        if (!q) return true;
        return (`${it.title} ${it.desc || ""}`).toLowerCase().includes(q);
    });

    if (ACTIVE_CAT === "all") filtered = filtered.slice(0, 10);

    const byCat = groupByCategory(filtered);
    root.innerHTML = "";

    for (const [catId, list] of byCat.entries()){
        const section = document.createElement("div");
        const key = safeAttr(catId);

        section.innerHTML = `
      <div class="menu-section-title">${escapeHtml(catTitle(catId))}</div>
      <div class="menu-grid" data-grid="${key}"></div>
    `;
        root.appendChild(section);

        const grid = section.querySelector(`[data-grid="${key}"]`);
        if (!grid) continue;

        list.forEach(it => {
            const inSaved = cart.includes(it.id);
            const cardWrap = document.createElement("div");

            const media = it.img
                ? `<img src="${escapeHtml(it.img)}" alt="${escapeHtml(it.title)}">`
                : `No photo`;

            cardWrap.innerHTML = `
        <div class="product-card">
          <div class="product-body">
            <div>
              <div class="product-title">${escapeHtml(it.title)}</div>
              <div class="product-desc">${escapeHtml(it.desc || "")}</div>
            </div>

            <div class="product-bottom">
              <div class="product-price">${money(it.price)}</div>
              <span class="badge rounded-pill text-bg-light product-badge">${escapeHtml(catTitle(it.cat))}</span>
            </div>
          </div>

          <div class="product-media ${it.img ? "" : "placeholder"}">
            ${media}
            <button class="add-btn" data-add="${escapeHtml(it.id)}" title="Save">${inSaved ? "✓" : "+"}</button>
          </div>
        </div>
      `;

            grid.appendChild(cardWrap);
            cardWrap.querySelector("[data-add]")?.addEventListener("click", () => toggleSaved(it.id));
        });
    }

    renderCart();
}

function toggleSaved(itemId){
    const cart = loadCart(PLACE_ID);
    const idx = cart.indexOf(itemId);
    if (idx >= 0) cart.splice(idx, 1);
    else cart.push(itemId);
    saveCart(PLACE_ID, cart);
    renderSections();
}

function renderCart(){
    const list  = document.getElementById("cartList");
    const count = document.getElementById("cartCount");
    const hint  = document.getElementById("cartHint");
    if (!list || !count || !hint) return;

    const cart = loadCart(PLACE_ID);
    count.textContent = String(cart.length);

    const map = new Map(ALL_ITEMS.map(x => [x.id, x]));
    const items = cart.map(id => map.get(id)).filter(Boolean);

    list.innerHTML = "";
    if (items.length === 0){
        hint.classList.remove("d-none");
        return;
    }
    hint.classList.add("d-none");

    items.forEach(it => {
        const row = document.createElement("div");
        row.className = "card border-0 shadow-sm";
        row.innerHTML = `
      <div class="card-body py-2">
        <div class="d-flex align-items-start justify-content-between gap-2">
          <div style="min-width:0">
            <div class="fw-semibold">${escapeHtml(it.title)}</div>
            <div class="text-muted small">${money(it.price)}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger" data-remove="${escapeHtml(it.id)}">Remove</button>
        </div>
      </div>
    `;
        list.appendChild(row);
        row.querySelector("[data-remove]")?.addEventListener("click", () => toggleSaved(it.id));
    });
}

function bindActions(){
    document.getElementById("searchInput")?.addEventListener("input", renderSections);
    document.getElementById("btnClearCart")?.addEventListener("click", () => {
        saveCart(PLACE_ID, []);
        renderSections();
    });
}

(function init(){
    PLACE_ID = getPlaceIdFromPath();
    renderHeader(PLACE_ID);

    ALL_ITEMS = buildItems(PLACE_ID);

    renderCategories();
    bindActions();
    renderSections();
})();