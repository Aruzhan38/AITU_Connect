function getCanteenIdFromPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[1];
}

function token() {
    return localStorage.getItem("aitu-token") || "";
}

let currentUserRole = null;


async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch (_) {}
    return { res, text, json };
}

function normalizePrice(price) {
    if (price === null || price === undefined) return "";

    const s = String(price).trim();
    if (!s) return "";

    if (s.includes("₸") || s.toLowerCase().includes("тг")) return s;

    return `${s} ₸`;
}

async function loadCanteenHeader(canteenID) {
    const { res, json, text } = await fetchJSON("/api/canteens");
    if (!res.ok) {
        console.error("canteens list error:", text);
        return;
    }
    const c = (json || []).find((x) => x.id === canteenID);
    if (c) {
        document.getElementById("canteenName").textContent = c.name;
        document.getElementById("canteenLocation").textContent = c.location;
    }
}

async function deleteNews(newsID, canteenID) {
    if (!confirm("Delete this update?")) return;
    
    const t = token();
    if (!t) {
        alert("Please login first.");
        return;
    }

    const { res, text } = await fetchJSON(`/api/news/${newsID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
    });

    if (!res.ok) {
        alert(`Error: ${text}`);
        return;
    }

    await loadNews(canteenID, currentUserRole);
}

async function loadNews(canteenID, userRole) {
    const { res, json, text } = await fetchJSON(`/api/canteens/${canteenID}/news`);
    if (!res.ok) {
        console.error("news error:", text);
        return;
    }

    const list = document.getElementById("newsList");
    const empty = document.getElementById("emptyState");
    list.innerHTML = "";

    const data = Array.isArray(json) ? json : [];
    if (data.length === 0) {
        empty.classList.remove("d-none");
        return;
    }
    empty.classList.add("d-none");

    const isAdmin = userRole === "admin";

    data.forEach((n) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm";

        const created = n.created_at ? new Date(n.created_at).toLocaleString() : "";
        const priceLabel = normalizePrice(n.price);

        card.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-start justify-content-between gap-3">
          <div>
            <h5 class="fw-bold mb-1">${escapeHtml(n.title)}</h5>
            <div class="text-muted small mb-2">${escapeHtml(created)}</div>
          </div>
          <div class="d-flex gap-2 align-items-start">
            ${
              priceLabel
                  ? `<span class="badge text-bg-primary">${escapeHtml(priceLabel)}</span>`
                  : ""
            }
            ${
              isAdmin
                  ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteNews(${n.id}, '${canteenID}')">×</button>`
                  : ""
            }
          </div>
        </div>
        <p class="mb-0">${escapeHtml(n.content)}</p>
      </div>
    `;
        list.appendChild(card);
    });
}

async function checkRoleAndShowCreate(canteenID) {
    const t = token();
    const box = document.getElementById("createBox");
    if (!t) return null;

    const { res, json } = await fetchJSON("/me", {
        headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) return null;

    const role = json?.role;
    if (["admin","moderator","staff"].includes(role)) {
        box.classList.remove("d-none");
    }
    return role;
}

async function setupCreateForm(canteenID) {
    const form = document.getElementById("createNewsForm");
    const msg = document.getElementById("createMsg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";

        const t = token();
        if (!t) {
            msg.textContent = "Please login first.";
            return;
        }

        const fd = new FormData(form);
        
        const rawPrice = fd.get("price") ? String(fd.get("price")).trim() : "";

        const payload = {
            title: fd.get("title"),
            content: fd.get("content"),
            price: rawPrice ? rawPrice : null,
        };

        const { res, text } = await fetchJSON(`/api/canteens/${canteenID}/news`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${t}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            msg.textContent = `Error: ${text}`;
            return;
        }

        form.reset();
        msg.textContent = "Published";
        await loadNews(canteenID, currentUserRole);
    });
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[m]));
}

(async function init() {
    const canteenID = getCanteenIdFromPath();
    if (!canteenID) return;

    await loadCanteenHeader(canteenID);
    currentUserRole = await checkRoleAndShowCreate(canteenID);
    await loadNews(canteenID, currentUserRole);
    await setupCreateForm(canteenID);
})();