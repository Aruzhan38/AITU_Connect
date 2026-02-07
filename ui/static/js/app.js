const TOKEN_KEY = "aitu_token";
const ROLE_KEY = "aitu_role";
const EMAIL_KEY = "aitu_email";
const USER_ID_KEY = "aitu_user_id";

function $(id) {
    return document.getElementById(id);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(t) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
}

function setRole(role) {
    if (role) localStorage.setItem(ROLE_KEY, role);
}

function setEmail(email) {
    if (email) localStorage.setItem(EMAIL_KEY, email);
}

function getRole() {
    return localStorage.getItem(ROLE_KEY) || "";
}

function getEmail() {
    return localStorage.getItem(EMAIL_KEY) || "";
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(USER_ID_KEY);
}

function isStaff(role) {
    return ["admin", "moderator", "staff", "club_leader"].includes(role);
}

async function fetchMe() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch("/me", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    try {
        return await res.json();
    } catch {
        return null;
    }
}

function setNavbarLoggedOut() {
    $("navLogin")?.classList.remove("d-none");
    $("navUser")?.classList.add("d-none");
    $("navAdmin")?.classList.add("d-none");
    $("navModerator")?.classList.add("d-none");
    $("homeSignInBtn")?.classList.remove("d-none");

    const label = $("navUserLabel");
    if (label) label.textContent = "Account";
}

function setNavbarLoggedIn(role, email) {
    $("navLogin")?.classList.add("d-none");
    $("navUser")?.classList.remove("d-none");
    $("homeSignInBtn")?.classList.add("d-none");

    const label = $("navUserLabel");
    if (label) {
        const left = email || getEmail();
        label.textContent = left ? `${left} (${role})` : `(${role})`;
    }

    if (role === "admin") {
        $("navAdmin")?.classList.remove("d-none");
        $("navModerator")?.classList.add("d-none");
    }
    else if (role === "moderator") {
        $("navModerator")?.classList.remove("d-none");
        $("navAdmin")?.classList.add("d-none");
    }
    else {
        $("navAdmin")?.classList.add("d-none");
        $("navModerator")?.classList.add("d-none");
    }
}

function bindOnce(el, event, handler) {
    if (!el) return;
    const key = `bound_${event}`;
    if (el.dataset[key] === "1") return;
    el.addEventListener(event, handler);
    el.dataset[key] = "1";
}

async function initNavbar() {
    const token = getToken();
    const role = getRole();
    const email = getEmail();
    
    if (token && role && email) {
        setNavbarLoggedIn(role, email);
        
        const me = await fetchMe();
        if (me && me.role) {
            setRole(me.role);
            setEmail(me.email);
            setNavbarLoggedIn(me.role, me.email);
        }
    } else if (!token) {
        setNavbarLoggedOut();
        return;
    } else {
        const me = await fetchMe();

        if (!me || !me.role) {
            clearAuth();
            setNavbarLoggedOut();
            return;
        }

        setRole(me.role);
        if (me.email) setEmail(me.email);

        setNavbarLoggedIn(me.role, me.email);
    }

    bindOnce($("navLogout"), "click", (e) => {
        e.preventDefault();
        clearAuth();
        window.location.href = "/";
    });

    bindOnce($("navMe"), "click", async (e) => {
        e.preventDefault();
        const me2 = await fetchMe();
        alert(me2 ? JSON.stringify(me2, null, 2) : "Not authorized");
    });
}

document.addEventListener("DOMContentLoaded", initNavbar);

window.AITU_AUTH = {
    TOKEN_KEY,
    ROLE_KEY,
    EMAIL_KEY,
    getToken,
    setToken,
    getRole,
    getEmail,
    setRole,
    setEmail,
    clearAuth,
    fetchMe,
    isStaff,
};

(async function protectPages() {
    const path = window.location.pathname;
    const role = getRole();

    if (path === "/admin" && role !== "admin") {
        if (role === "moderator") {
            window.location.href = "/moderator";
        } else {
            window.location.href = "/feed";
        }
        return;
    }

    if (path === "/moderator" && role !== "moderator") {
        if (role === "admin") {
            window.location.href = "/admin";
        } else {
            window.location.href = "/feed";
        }
        return;
    }
})();
