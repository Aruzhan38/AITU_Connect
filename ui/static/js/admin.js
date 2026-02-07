async function loadStats() {
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
        console.log("Fetching /api/admin/stats...");
        const res = await fetch("/api/admin/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log("Response status:", res.status);
        
        if (!res.ok) {
            const text = await res.text();
            console.log("Error response:", text);
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const stats = await res.json();
        console.log("Stats loaded:", stats);
        renderStats(stats || {});
    } catch (e) {
        console.error("Error loading stats:", e);
        const container = document.getElementById("statsContainer");
        container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error loading statistics: ${e.message}</div></div>`;
    }
}

function renderStats(stats) {
    const container = document.getElementById("statsContainer");
    
    container.innerHTML = "";

    const statsData = [
        { label: "Total Users", value: stats.users || 0, icon: "👥", color: "primary" },
        { label: "Total Posts", value: stats.posts || 0, icon: "📝", color: "success" },
        { label: "Total Canteens", value: stats.canteens || 0, icon: "🍽️", color: "info" }
    ];
    
    statsData.forEach(stat => {
        const col = document.createElement("div");
        col.className = "flex-shrink-0 me-3";
col.style.width = "300px";
        col.innerHTML = `
            <div class="card shadow-sm border-0 h-100">
                <div class="card-body text-center p-4">
                    <div class="display-5 mb-2">${stat.icon}</div>
                    <h3 class="fw-bold text-${stat.color} mb-1">${stat.value}</h3>
                    <p class="text-muted small text-uppercase fw-bold mb-0">${stat.label}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

document.addEventListener("DOMContentLoaded", loadStats);
