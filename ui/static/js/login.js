const TOKEN_KEY = "aitu_token";
const ROLE_KEY = "aitu_role";
const EMAIL_KEY = "aitu_email";
const USER_ID_KEY = "aitu_user_id";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.textContent = "";

        const email = form.email.value.trim();
        const password = form.password.value.trim();

        if (!email || !password) {
            errorBox.textContent = "Email and password are required";
            return;
        }

        try {
            const res = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Login failed");
            }

            const data = await res.json();
            
            if (!data.token || !data.user) {
                throw new Error("Invalid response format");
            }
            
            console.log("[Login] User data:", data.user);
            
            
            const userId = data.user.id || data.user.user_id;
            
            
            localStorage.clear(); 
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(EMAIL_KEY, data.user.email || "");
            localStorage.setItem(ROLE_KEY, data.user.role || "user");
            localStorage.setItem(USER_ID_KEY, String(userId || 0));
            
            
            const saved = {
                token: localStorage.getItem(TOKEN_KEY),
                email: localStorage.getItem(EMAIL_KEY),
                role: localStorage.getItem(ROLE_KEY),
                userId: localStorage.getItem(USER_ID_KEY)
            };
            
            console.log("[Login] Saved to localStorage:", saved);
            
            if (!saved.token) {
                throw new Error("Failed to save authentication data");
            }
            
            
            setTimeout(() => {
                const role = (data.user.role || "").toLowerCase();
                if (role === "admin") {
                    window.location.href = "/admin";
                } else if (role === "moderator") {
                    window.location.href = "/moderator";
                } else {
                    window.location.href = "/feed";
                }
            }, 100);

        } catch (err) {
            console.error(err);
            errorBox.textContent = err.message || "Login error";
        }
    });
});