const TOKEN_KEY = "aitu_token";
const ROLE_KEY = "aitu_role";
const EMAIL_KEY = "aitu_email";

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
function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
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

    if (out?.user?.email) localStorage.setItem(EMAIL_KEY, out.user.email);
    if (out?.user?.role) localStorage.setItem(ROLE_KEY, out.user.role);

    const me = await apiGetMe();

    const role = me?.role || out?.user?.role || localStorage.getItem(ROLE_KEY) || "";
    const email = me?.email || out?.user?.email || localStorage.getItem(EMAIL_KEY) || "";

    if (role) localStorage.setItem(ROLE_KEY, role);
    if (email) localStorage.setItem(EMAIL_KEY, email);

    if (isAdminOrModerator(role)) {
        window.location.href = "/admin";
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
    }
})();
