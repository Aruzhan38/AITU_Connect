const TOKEN_KEY = "aitu_token";
const ROLES = ["student", "moderator", "admin", "staff", "club_leader"];

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) {}
    return { res, text, json };
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

    if (!res.ok) {
        window.location.href = "/login";
        return false;
    }

    if (json?.role !== "admin") {
        window.location.href = "/";
        return false;
    }
    return true;
}

async function loadStats() {
    const t = requireLogin();
    if (!t) return;

    const { res, text, json } = await fetchJSON("/api/admin/stats", {
        headers: { Authorization: `Bearer ${t}` }
    });

    const container = document.getElementById("statsContainer");

    if (!res.ok) {
        container.innerHTML = `<div class="w-100"><div class="alert alert-danger mb-0">Error loading stats: ${escapeHtml(text)}</div></div>`;
        return;
    }

    const stats = json || {};
    renderStats(stats);
}

function renderStats(stats) {
    const container = document.getElementById("statsContainer");
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
      </div>
    `;
        container.appendChild(wrap);
    });
}

async function loadUsers() {
    const t = requireLogin();
    if (!t) return;

    const msg = document.getElementById("usersMsg");
    msg.className = "alert alert-info mt-3 mb-0";
    msg.textContent = "Loading users...";

    const { res, text, json } = await fetchJSON("/api/users", {
        headers: { Authorization: `Bearer ${t}` }
    });

    if (!res.ok) {
        msg.className = "alert alert-danger mt-3 mb-0";
        msg.textContent = `Error loading users: ${text}`;
        return;
    }

    renderUsers(Array.isArray(json) ? json : []);
}

function renderUsers(users) {
    const tbody = document.querySelector("#usersTable tbody");
    const msg = document.getElementById("usersMsg");

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

    // обработчик смены роли
    tbody.querySelectorAll("select").forEach(sel => {
        sel.addEventListener("change", () => updateRole(sel));
    });
}

async function updateRole(selectEl) {
    const userId = Number(selectEl.dataset.userid);
    const email = selectEl.dataset.email;
    const newRole = selectEl.value;

    const t = requireLogin();
    if (!t) return;

    const { res, text } = await fetchJSON("/api/users/role", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({ user_id: userId, role: newRole })
    });

    if (!res.ok) {
        alert(`Error updating role: ${text}`);
        await loadUsers();
        return;
    }

    alert(`Role updated: ${email} → ${newRole}`);
    await loadUsers();
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[m]));
}

document.addEventListener("DOMContentLoaded", async () => {
    const ok = await ensureAdmin();
    if (!ok) return;

    await loadStats();
    await loadUsers();
});