const TOKEN_KEY = "aitu_token";
const ROLES = ["student", "moderator", "admin", "staff", "club_leader"];

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[m]));
}

async function fetchJSON(url, opts = {}) {
    try {
        const res = await fetch(url, opts);
        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch (_) {}
        return { res, text, json };
    } catch (err) {
        return { res: { ok: false }, text: err.message, json: null };
    }
}

function requireLogin() {
    const t = getToken();
    if (!t) {
        window.location.href = "/login";
        return null;
    }
    return t;
}

async function ensureAdmin() {
    const t = requireLogin();
    if (!t) return false;

    const { res, json } = await fetchJSON("/me", {
        headers: { Authorization: `Bearer ${t}` }
    });

    if (!res.ok || !json) {
        window.location.href = "/login";
        return false;
    }

    if (json.role !== "admin") {
        window.location.href = "/";
        return false;
    }
    return true;
}

async function loadStats() {
    const t = getToken();
    const container = document.getElementById("statsContainer");
    if (!container) return;

    const { res, text, json } = await fetchJSON("/api/admin/stats", {
        headers: { Authorization: `Bearer ${t}` }
    });

    if (!res.ok) {
        container.innerHTML = `<div class="w-100"><div class="alert alert-danger mb-0">Stats error: ${text}</div></div>`;
        return;
    }

    renderStats(json || {});
}

function renderStats(stats) {
    const container = document.getElementById("statsContainer");
    if (!container) return;
    container.innerHTML = "";

    const cards = [
        { label: "Total Users", value: stats.users || 0, icon: "👥", color: "primary" },
        { label: "Total Posts", value: stats.posts || 0, icon: "📝", color: "success" },
        { label: "Total Canteens", value: stats.canteens || 0, icon: "🍽️", color: "info" },
    ];

    cards.forEach(stat => {
        const wrap = document.createElement("div");
        wrap.className = "flex-shrink-0";
        wrap.style.width = "320px";
        wrap.innerHTML = `
            <div class="card shadow-sm border-0 h-100">
                <div class="card-body text-center p-4">
                    <div class="display-5 mb-2">${stat.icon}</div>
                    <h3 class="fw-bold text-${stat.color} mb-1">${stat.value}</h3>
                    <p class="text-muted small text-uppercase fw-bold mb-0">${stat.label}</p>
                </div>
            </div>`;
        container.appendChild(wrap);
    });
}

async function loadUsers() {
    const t = getToken();
    const msg = document.getElementById("usersMsg");
    if (!msg) return;

    const { res, text, json } = await fetchJSON("/api/users", {
        headers: { Authorization: `Bearer ${t}` }
    });

    if (!res.ok) {
        msg.className = "alert alert-danger mt-3 mb-0";
        msg.textContent = `Error: ${text}`;
        return;
    }

    renderUsers(Array.isArray(json) ? json : []);
}

function renderUsers(users) {
    const tbody = document.querySelector("#usersTable tbody");
    const msg = document.getElementById("usersMsg");
    if (!tbody || !msg) return;

    if (!users.length) {
        tbody.innerHTML = "";
        msg.className = "alert alert-warning mt-3 mb-0";
        msg.textContent = "No users found";
        return;
    }

    msg.className = "d-none";
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge bg-info">${escapeHtml(u.role || "unknown")}</span></td>
            <td>
                <select class="form-select form-select-sm" data-userid="${u.id}" data-email="${escapeHtml(u.email)}">
                    ${ROLES.map(r => `<option value="${r}" ${r === u.role ? "selected" : ""}>${r}</option>`).join("")}
                </select>
            </td>
        </tr>
    `).join("");

    tbody.querySelectorAll("select").forEach(sel => {
        sel.addEventListener("change", () => updateRole(sel));
    });
}

async function updateRole(selectEl) {
    const userId = Number(selectEl.dataset.userid);
    const email = selectEl.dataset.email;
    const newRole = selectEl.value;
    const t = getToken();

    const { res, text } = await fetchJSON("/api/users/role", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({ user_id: userId, role: newRole })
    });

    if (!res.ok) {
        alert(`Error: ${text}`);
        await loadUsers();
        return;
    }

    alert(`Updated: ${email} to ${newRole}`);
    await loadUsers();
}

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await ensureAdmin();
    if (ok) {
        await loadStats();
        await loadUsers();
    }
});