
const ROLES = ["student", "club_leader", "moderator", "staff", "admin"];

async function loadUsers() {
    let token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
        console.log("Token not in localStorage, fetching from /me...");
        try {
            const meRes = await fetch("/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                token = meData.token;
                if (token) {
                    localStorage.setItem(TOKEN_KEY, token);
                    console.log("Token retrieved from /me and stored");
                }
            }
        } catch (e) {
            console.error("Error fetching from /me:", e);
        }
    }
    
    console.log("Token:", token);
    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        console.log("Fetching /api/users...");
        const res = await fetch("/api/users", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log("Response status:", res.status);
        
        if (!res.ok) {
            const text = await res.text();
            console.log("Error response:", text);
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const users = await res.json();
        console.log("Users loaded:", users);
        renderUsers(users || []);
    } catch (e) {
        console.error("Error loading users:", e);
        document.getElementById("noUsers").textContent = "Error loading users: " + e.message;
    }
}

function renderUsers(users) {
    const tbody = document.querySelector("#usersTable tbody");
    const noUsers = document.getElementById("noUsers");

    if (!users || users.length === 0) {
        noUsers.textContent = "No users found";
        return;
    }

    noUsers.style.display = "none";
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.email}</td>
            <td>
                <span class="badge bg-info">${u.role || "unknown"}</span>
            </td>
            <td>
                <select class="form-select form-select-sm" id="role-${u.id}" onchange="updateRole(${u.id}, '${u.email}')">
                    ${ROLES.map(r => `<option value="${r}" ${r === u.role ? "selected" : ""}>${r}</option>`).join("")}
                </select>
            </td>
        </tr>
    `).join("");
}

async function updateRole(userId, email) {
    const select = document.getElementById(`role-${userId}`);
    const newRole = select.value;
    let token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        console.log("Token not in localStorage, fetching from /me...");
        try {
            const meRes = await fetch("/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                token = meData.token;
                if (token) {
                    localStorage.setItem(TOKEN_KEY, token);
                    console.log("Token retrieved from /me and stored");
                }
            }
        } catch (e) {
            console.error("Error fetching from /me:", e);
        }
    }

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        const res = await fetch("/api/users/role", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                role: newRole
            })
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || `HTTP ${res.status}`);
        }

        alert(`Role updated for ${email} to ${newRole}`);
        loadUsers();
    } catch (e) {
        console.error("Error updating role:", e);
        alert("Error updating role: " + e.message);
        loadUsers();
    }
}
document.addEventListener("DOMContentLoaded", loadUsers);
