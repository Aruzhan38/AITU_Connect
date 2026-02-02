document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const createPostArea = document.getElementById("createPostArea");
    const postForm = document.getElementById("postForm");
    const feedContainer = document.getElementById("feedContainer");

    if (token) {
        createPostArea.classList.remove("d-none");
    }

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
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No posts yet</p>';
            return;
        }

        container.innerHTML = posts.map(p => `
            <div class="card shadow-sm mb-3 border-0">
                <div class="card-body">
                    <h5 class="fw-bold">${p.title}</h5>
                    <p class="text-secondary">${p.content}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-primary">@${(p.author_email || "user@").split('@')[0]}</small>
                        <small class="text-muted">${new Date(p.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `).join("");
    } catch (e) {
        console.error("Load feed error:", e);
        container.innerHTML = '<div class="alert alert-danger">Error loading feed</div>';
    }
}