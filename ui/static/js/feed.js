const TOKEN_KEY = "aitu_token";
const ROLE_KEY = "aitu_role";
const USER_ID_KEY = "aitu_user_id";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const createPostArea = document.getElementById("createPostArea");
    const postForm = document.getElementById("postForm");

    const canCreate = !!token;
    if (canCreate && createPostArea) createPostArea.classList.remove("d-none");
    if (!canCreate && createPostArea) createPostArea.classList.add("d-none");

    postForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            title: (document.getElementById("postTitle")?.value || "").trim(),
            content: (document.getElementById("postContent")?.value || "").trim(),
        };

        const res = await fetch("/api/posts/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            postForm.reset();
            loadFeed();
        } else {
            alert(await res.text());
        }
    });

    loadFeed();
});

async function loadFeed() {
    const container = document.getElementById("feedContainer");
    if (!container) return;

    try {
        const res = await fetch("/api/posts/feed");
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Server error:", errorText);
            container.innerHTML = '<div class="alert alert-danger">Error loading feed</div>';
            return;
        }

        const posts = await res.json();

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No posts yet</p>';
            return;
        }

        const currentUserRole = (localStorage.getItem(ROLE_KEY) || "").toLowerCase();
        const currentUserId = parseInt(localStorage.getItem(USER_ID_KEY) || "0", 10);

        container.innerHTML = posts.map(p => {
            const authorRole = (p.author_role || "").toLowerCase();

            const canDelete =
                p.author_id === currentUserId ||
                currentUserRole === "admin" ||
                (currentUserRole === "moderator" && authorRole !== "admin");

            const deleteBtn = canDelete
                ? `<button class="btn btn-sm btn-danger" onclick="deletePost(${p.id})">Delete</button>`
                : "";

            const username = (p.author_email || "user@aitu.kz").split("@")[0];

            return `
            <div class="card shadow-sm mb-3 border-0">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="fw-bold mb-0">${escapeHtml(p.title)}</h5>
                        ${deleteBtn}
                    </div>
                    <p class="text-secondary">${escapeHtml(p.content)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-primary">@${escapeHtml(username)}</small>
                        <small class="text-muted">${formatDate(p.created_at)}</small>
                    </div>
                </div>
            </div>
            `;
        }).join("");

    } catch (e) {
        console.error("Load feed error:", e);
        container.innerHTML = '<div class="alert alert-danger">Error loading feed</div>';
    }
}

async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        alert("Not authenticated");
        return;
    }

    const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (res.status === 204) {
        loadFeed();
        return;
    }

    alert(await res.text());
}

function formatDate(x) {
    const d = new Date(x);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
}

function escapeHtml(s){
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
}