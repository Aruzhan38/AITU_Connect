const statusEl = document.getElementById("status");
const TOKEN_KEY = "aitu_token";

function setStatus(obj) {
    statusEl.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw { status: res.status, data };
    return data;
}

async function apiGet(url, withAuth = false) {
    const headers = {};
    if (withAuth) {
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw { status: res.status, data };
    return data;
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
        email: form.email.value.trim(),
        password: form.password.value,
    };

    try {
        const out = await apiPost("/auth/login", payload);
        if (out.token) setToken(out.token);
        setStatus(out);
    } catch (err) {
        setStatus(err);
    }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
        email: form.email.value.trim(),
        password: form.password.value,
    };

    try {
        const out = await apiPost("/auth/register", payload);
        if (out.token) setToken(out.token);
        setStatus(out);
    } catch (err) {
        setStatus(err);
    }
});

document.getElementById("btnMe").addEventListener("click", async () => {
    try {
        const out = await apiGet("/me", true);
        setStatus(out);
    } catch (err) {
        setStatus(err);
    }
});

document.getElementById("btnLogout").addEventListener("click", () => {
    clearToken();
    setStatus("Logged out. Token removed.");
});

setStatus(getToken() ? "Token found in localStorage" : "Not logged in");
