const TOKEN_KEY = "aitu_token";

function token() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    return { res, text, json };
}

function showAlert(type, msg) {
    const el = document.getElementById("modAlert");
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    el.classList.remove("d-none");
}

function hideAlert() {
    const el = document.getElementById("modAlert");
    el.classList.add("d-none");
    el.textContent = "";
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[m]));
}

function normalizePrice(p) {
    const s = String(p ?? "").trim();
    if (!s) return "";
    if (s.includes("₸")) return s;
    if (/^\d+$/.test(s)) return s + "₸";
    return s;
}

async function ensureModeratorAccess() {
    const t = token();
    if (!t) {
        window.location.href = "/login";
        return false;
    }

    const { res, json } = await fetchJSON("/me", {
        headers: { Authorization: `Bearer ${t}` }
    });

    if (!res.ok) {
        window.location.href = "/login";
        return false;
    }

    const role = json?.role;
    if (role !== "moderator" && role !== "admin") {
        showAlert("danger", "Forbidden: moderator access required.");
        return false;
    }
    return true;
}

let canteensCache = [];
let allNewsCache = [];

async function loadCanteens() {
    const { res, json, text } = await fetchJSON("/api/canteens");
    if (!res.ok) throw new Error(text || "Failed to load canteens");

    canteensCache = Array.isArray(json) ? json : [];
    const sel = document.getElementById("canteenSelect");
    sel.innerHTML = `<option value="">All canteens</option>` + canteensCache.map(c =>
        `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} — ${escapeHtml(c.location)}</option>`
    ).join("");
}

async function loadAllNews() {
    allNewsCache = [];
    for (const c of canteensCache) {
        const { res, json, text } = await fetchJSON(`/api/canteens/${c.id}/news`);
        if (!res.ok) {
            console.warn("news load failed for", c.id, text);
            continue;
        }
        const list = Array.isArray(json) ? json : [];
        list.forEach(n => {
            allNewsCache.push({
                ...n,
                canteen_name: c.name,
                canteen_location: c.location
            });
        });
    }
}

function applyFiltersAndRender() {
    const canteenId = document.getElementById("canteenSelect").value;
    const q = document.getElementById("searchInput").value.trim().toLowerCase();

    let data = [...allNewsCache];

    if (canteenId) {
        data = data.filter(n => n.canteen_id === canteenId);
    }
    if (q) {
        data = data.filter(n =>
            String(n.title ?? "").toLowerCase().includes(q) ||
            String(n.content ?? "").toLowerCase().includes(q)
        );
    }

    renderNews(data);
}

function renderNews(items) {
    const list = document.getElementById("newsList");
    const empty = document.getElementById("emptyState");
    list.innerHTML = "";

    if (!items.length) {
        empty.classList.remove("d-none");
        return;
    }
    empty.classList.add("d-none");

    items.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));

    items.forEach(n => {
        const created = n.created_at ? new Date(n.created_at).toLocaleString() : "";
        const price = normalizePrice(n.price);

        const card = document.createElement("div");
        card.className = "card shadow-sm";

        card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="text-muted small mb-1">
              ${escapeHtml(n.canteen_name)} • ${escapeHtml(n.canteen_location)}
            </div>
            <h5 class="fw-bold mb-1">${escapeHtml(n.title)}</h5>
            <div class="text-muted small mb-3">${escapeHtml(created)}</div>
          </div>

          <div class="d-flex align-items-center gap-2">
            ${price ? `<span class="badge text-bg-primary">${escapeHtml(price)}</span>` : ""}
            <button class="btn btn-outline-secondary btn-sm" data-action="edit" data-id="${n.id}">Edit</button>
            <button class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${n.id}">Delete</button>
          </div>
        </div>

        <p class="mb-0">${escapeHtml(n.content)}</p>
      </div>
    `;

        card.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            if (action === "edit") openEditModal(id);
            if (action === "delete") deleteNews(id);
        });

        list.appendChild(card);
    });
}

let editModal = null;

function openEditModal(newsId) {
    const n = allNewsCache.find(x => Number(x.id) === Number(newsId));
    if (!n) return;

    const form = document.getElementById("editForm");
    form.elements.id.value = n.id;
    form.elements.title.value = n.title ?? "";
    form.elements.content.value = n.content ?? "";
    form.elements.price.value = n.price ?? "";

    document.getElementById("editMsg").textContent = "";

    if (!editModal) {
        editModal = new bootstrap.Modal(document.getElementById("editModal"));
    }
    editModal.show();
}

async function saveEdit() {
    const t = token();
    if (!t) {
        showAlert("warning", "Please login.");
        return;
    }

    const form = document.getElementById("editForm");
    const id = Number(form.elements.id.value);

    const title = form.elements.title.value.trim();
    const content = form.elements.content.value.trim();
    const priceRaw = form.elements.price.value.trim();

    const payload = {};
    if (title) payload.title = title;
    if (content) payload.content = content;
    if (priceRaw) payload.price = priceRaw;

    const { res, text } = await fetchJSON(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${t}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        document.getElementById("editMsg").textContent = `Error: ${text}`;
        return;
    }

    document.getElementById("editMsg").textContent = "Saved";
    await reload();
    setTimeout(() => editModal?.hide(), 300);
}

async function deleteNews(id) {
    if (!confirm("Delete this news?")) return;

    const t = token();
    if (!t) {
        showAlert("warning", "Please login.");
        return;
    }

    const { res, text } = await fetchJSON(`/api/news/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${t}` }
    });

    if (!res.ok) {
        showAlert("danger", text || "Delete failed");
        return;
    }

    showAlert("success", "Deleted");
    await reload();
}

async function reload() {
    hideAlert();
    await loadCanteens();
    await loadAllNews();
    applyFiltersAndRender();
}

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await ensureModeratorAccess();
    if (!ok) return;

    document.getElementById("refreshBtn").addEventListener("click", reload);
    document.getElementById("canteenSelect").addEventListener("change", applyFiltersAndRender);
    document.getElementById("searchInput").addEventListener("input", applyFiltersAndRender);
    document.getElementById("saveBtn").addEventListener("click", saveEdit);

    try {
        await reload();
    } catch (e) {
        showAlert("danger", e.message || "Failed to load");
    }
});