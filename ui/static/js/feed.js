document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("aitu_token");
    const createPostArea = document.getElementById("createPostArea");
    const postForm = document.getElementById("postForm");
    const feedContainer = document.getElementById("feedContainer");

    const role = localStorage.getItem("aitu_role");
    const canCreate = !!token;
    if (canCreate) createPostArea.classList.remove("d-none");

    postForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const data = {
            title: document.getElementById("postTitle").value,
            content: document.getElementById("postContent").value
        };

        const res = await fetch("/api/posts/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            postForm.reset();
            loadFeed();
        } else {
            alert("Error creating post");
        }
    });

    loadFeed();
});

async function loadFeed() {
    const container = document.getElementById("feedContainer");
    try {
        const res = await fetch("/api/posts/feed");
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Server error:", errorText);
            throw new Error("Server responded with error");
        }

        const posts = await res.json();
        console.log("Posts loaded with author_role:", posts.map(p => ({id: p.id, author_email: p.author_email, author_role: p.author_role})));
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No posts yet</p>';
            return;
        }

        const currentUserRole = getRole?.() || localStorage.getItem("aitu_role") || "";
        const currentUserId = parseInt(localStorage.getItem("aitu_user_id") || "0");
        
        container.innerHTML = posts.map(p => {
            const canDelete = p.author_id === currentUserId || currentUserRole === "admin";
            const deleteBtn = canDelete ? `<button class="btn btn-sm btn-danger" onclick="deletePost(${p.id})">Delete</button>` : '';
            
            return `
            <div class="card shadow-sm mb-3 border-0">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="fw-bold mb-0">${p.title}</h5>
                        ${deleteBtn}
                    </div>
                    <p class="text-secondary">${p.content}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-primary">@${p.author_role === "admin" ? "ДСВР" : (p.author_email || "user@").split('@')[0]}</small>
                        <small class="text-muted">${new Date(p.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `}).join("");
    } catch (e) {
        console.error("Load feed error:", e);
        container.innerHTML = '<div class="alert alert-danger">Error loading feed</div>';
    }
}

async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        alert("Not authenticated");
        return;
    }

    try {
        console.log("Deleting post:", postId);
        console.log("Token:", token.substring(0, 20) + "...");
        
        const res = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log("Delete response status:", res.status);

        if (res.status === 204) {
            loadFeed();
        } else if (res.status === 403) {
            alert("You don't have permission to delete this post");
        } else if (res.status === 404) {
            alert("Post not found");
        } else {
            const text = await res.text();
            console.log("Error response:", text);
            alert(`Error: ${text}`);
        }
    } catch (e) {
        console.error("Error deleting post:", e);
        alert("Error deleting post: " + e.message);
    }
}