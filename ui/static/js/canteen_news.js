function getCanteenIdFromPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[1];
}

function token() {
    return window.AITU_AUTH?.getToken?.() || localStorage.getItem("aitu_token") || "";
}

let currentUserRole = null;
let editModal = null;

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

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[m]));
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

async function getRole() {
    const t = token();
    if (!t) return null;

    const { res, json } = await fetchJSON("/me", {
        headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) return null;
    return json?.role || null;
}

function showEditAlert(msg, type = "danger") {
    const box = document.getElementById("editMsg");
    if (!box) return;
    box.className = `alert alert-${type}`;
    box.textContent = msg;
    box.classList.remove("d-none");
}

function hideEditAlert() {
    const box = document.getElementById("editMsg");
    if (!box) return;
    box.classList.add("d-none");
    box.textContent = "";
}

function openEditModal(news) {
    const form = document.getElementById("editNewsForm");
    if (!form) return;

    form.elements.id.value = news.id;
    form.elements.title.value = news.title || "";
    form.elements.content.value = news.content || "";
    form.elements.price.value = news.price || "";

    hideEditAlert();

    if (!editModal) {
        const el = document.getElementById("editNewsModal");
        if (!el || !window.bootstrap?.Modal) {
            alert("Bootstrap Modal not found. Check bootstrap.bundle.js in base.tmpl");
            return;
        }
        editModal = new window.bootstrap.Modal(el);
    }
    editModal.show();
}

async function saveEdit(canteenID) {
    const form = document.getElementById("editNewsForm");
    if (!form) return;

    const t = token();
    if (!t) {
        showEditAlert("Please login first.");
        return;
    }

    const id = Number(form.elements.id.value);
    const title = String(form.elements.title.value || "").trim();
    const content = String(form.elements.content.value || "").trim();
    const rawPrice = String(form.elements.price.value || "").trim();

    if (!id || !title || !content) {
        showEditAlert("Title and content are required.");
        return;
    }

    const payload = {
        title,
        content,
        price: rawPrice ? rawPrice : null,
    };

    const { res, text } = await fetchJSON(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        showEditAlert(text || `HTTP ${res.status}`);
        return;
    }

    showEditAlert("Saved!", "success");
    setTimeout(() => {
        editModal?.hide();
    }, 300);

    await loadNews(canteenID, currentUserRole);
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

    const canEdit = ["admin", "moderator", "staff"].includes(userRole);

    data.forEach((n) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm";

        const created = n.created_at ? new Date(n.created_at).toLocaleString() : "";
        const priceLabel = normalizePrice(n.price);

        const imgBlock = n.image_url
            ? `
        <div class="mt-2" style="max-width:720px;">
          <div style="border-radius:14px; overflow:hidden; border:1px solid #dee2e6; background:#f8f9fa;">
            <img
              src="${escapeHtml(n.image_url)}"
              alt="menu photo"
              style="width:100%; max-height:320px; object-fit:cover; display:block;"
            >
          </div>
        </div>
      `
            : "";

        card.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-start justify-content-between gap-3">
          <div class="flex-grow-1">
            <h5 class="fw-bold mb-1">${escapeHtml(n.title)}</h5>
            <div class="text-muted small mb-2">${escapeHtml(created)}</div>
          </div>

          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            ${priceLabel ? `<span class="badge text-bg-primary">${escapeHtml(priceLabel)}</span>` : ""}
            ${canEdit ? `<button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${n.id}">Edit</button>` : ""}
            ${canEdit ? `<button class="btn btn-sm btn-outline-danger" data-action="del" data-id="${n.id}">Delete</button>` : ""}
          </div>
        </div>

        <p class="mb-2">${escapeHtml(n.content)}</p>
        ${imgBlock}
      </div>
    `;

        if (canEdit) {
            const editBtn = card.querySelector('button[data-action="edit"]');
            const delBtn = card.querySelector('button[data-action="del"]');

            if (editBtn) editBtn.addEventListener("click", () => openEditModal(n));
            if (delBtn) delBtn.addEventListener("click", () => deleteNews(n.id, canteenID));
        }

        list.appendChild(card);
    });
}

async function checkRoleAndShowCreate() {
    const t = token();
    const box = document.getElementById("createBox");
    if (!t) return null;

    const role = await getRole();

    if (["admin", "staff"].includes(role)) {
        box.classList.remove("d-none");
    } else {
        box.classList.add("d-none");
    }

    return role;
}

async function uploadImage(file, t) {
    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/uploads/canteen-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
    });

    const text = await res.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch (_) {}

    if (!res.ok) {
        throw new Error(text || "upload failed");
    }
    return json?.url || null;
}

async function setupCreateForm(canteenID) {
    const form = document.getElementById("createNewsForm");
    const msg = document.getElementById("createMsg");
    if (!form) return;

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
        const file = form.querySelector('input[name="image"]')?.files?.[0] || null;

        let imageUrl = null;
        try {
            if (file) {
                msg.textContent = "Uploading image...";
                imageUrl = await uploadImage(file, t);
            }
        } catch (e2) {
            msg.textContent = `Upload error: ${e2.message}`;
            return;
        }

        const payload = {
            title: String(fd.get("title") || "").trim(),
            content: String(fd.get("content") || "").trim(),
            price: rawPrice ? rawPrice : null,
            image_url: imageUrl ? imageUrl : null,
        };

        msg.textContent = "Publishing...";

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

(async function init() {
    const canteenID = getCanteenIdFromPath();
    if (!canteenID) return;

    await loadCanteenHeader(canteenID);
    currentUserRole = await checkRoleAndShowCreate();
    await loadNews(canteenID, currentUserRole);
    await setupCreateForm(canteenID);

    const saveBtn = document.getElementById("saveEditBtn");
    if (saveBtn) saveBtn.addEventListener("click", () => saveEdit(canteenID));
})();