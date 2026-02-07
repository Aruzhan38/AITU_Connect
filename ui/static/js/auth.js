const TOKEN_KEY = "aitu_token";
const ROLE_KEY = "aitu_role";
const EMAIL_KEY = "aitu_email";
const EXPIRY_KEY = "aitu_token_expiry";
const USER_ID_KEY = "aitu_user_id";

const alertBox = document.getElementById("alertBox");

function showAlert(msg, type = "danger") {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = msg;
    alertBox.classList.remove("d-none");
}

function hideAlert() {
    if (!alertBox) return;
    alertBox.classList.add("d-none");
    alertBox.textContent = "";
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}
function setExpiry(ts) {
    localStorage.setItem(EXPIRY_KEY, String(ts));
}

function getExpiry() {
    const v = localStorage.getItem(EXPIRY_KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

let _logoutTimer = null;
function scheduleAutoLogout() {
    const ts = getExpiry();
    if (!ts) return;
    const ms = ts * 1000 - Date.now();
    if (ms <= 0) {
        clearAuth();
        window.location.href = '/login';
        return;
    }
    if (_logoutTimer) clearTimeout(_logoutTimer);
    _logoutTimer = setTimeout(() => {
        clearAuth();
        window.location.href = '/login';
    }, ms);
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    if (_logoutTimer) {
        clearTimeout(_logoutTimer);
        _logoutTimer = null;
    }
}

function isAdminOrModerator(role) {
    return ["admin", "moderator"].includes(role);
}

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
        const msg =
            (typeof data === "string" && data) ||
            data?.error ||
            data?.message ||
            text ||
            `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data;
}

async function apiGetMe() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const res = await fetch("/me", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    try { return await res.json(); } catch { return null; }
}

async function afterAuthSuccess(out) {
    if (out?.token) setToken(out.token);
    if (out?.token_expiry) setExpiry(out.token_expiry);

    if (out?.user?.email) localStorage.setItem(EMAIL_KEY, out.user.email);
    if (out?.user?.role) localStorage.setItem(ROLE_KEY, out.user.role);
    if (out?.user?.id) localStorage.setItem(USER_ID_KEY, out.user.id);

    const me = await apiGetMe();

    const role = me?.role || out?.user?.role || localStorage.getItem(ROLE_KEY) || "";
    const email = me?.email || out?.user?.email || localStorage.getItem(EMAIL_KEY) || "";
    const userId = me?.user_id || out?.user?.id || localStorage.getItem(USER_ID_KEY) || "";

    if (role) localStorage.setItem(ROLE_KEY, role);
    if (email) localStorage.setItem(EMAIL_KEY, email);
    if (userId) localStorage.setItem(USER_ID_KEY, userId);

    scheduleAutoLogout();

    if (role === "admin") {
        window.location.href = "/admin";
    } else if (role === "moderator") {
        window.location.href = "/moderator";
    } else {
        window.location.href = "/feed";
    }
}

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const form = e.target;
    const payload = {
        email: form.email.value.trim(),
        password: form.password.value,
    };

    try {
        const out = await apiPost("/auth/login", payload);
        showAlert("Logged in successfully", "success")
        await afterAuthSuccess(out);
    } catch (err) {
        showAlert(err.message || "Login failed");
    }
});

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const form = e.target;
    const payload = {
        email: form.email.value.trim(),
        password: form.password.value,
    };

    try {
        const out = await apiPost("/auth/register", payload);
        showAlert("Account created successfully", "success")
        await afterAuthSuccess(out);
    } catch (err) {
        showAlert(err.message || "Register failed");
    }
});

(async function() {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;

    const me = await apiGetMe();
    if (!me?.role) {
        clearAuth();
        return;
    }

    scheduleAutoLogout();
})();
