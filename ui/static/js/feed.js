(() => {
    const TOKEN_KEY = "aitu_token";
    const ROLE_KEY = "aitu_role";
    const USER_ID_KEY = "aitu_user_id";

    function getToken() {
        const t = localStorage.getItem(TOKEN_KEY);
        return t ? t.trim() : "";
    }

    function getRole() {
        const r = localStorage.getItem(ROLE_KEY);
        return r ? r.trim().toLowerCase() : "";
    }

    function getUserId() {
        const u = localStorage.getItem(USER_ID_KEY);
        return u ? parseInt(u, 10) : 0;
    }

    function escapeHtml(s) {
        return String(s ?? "").replace(/[&<>"']/g, (m) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[m]));
    }

    function formatDate(x) {
        const d = new Date(x);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString();
    }

    document.addEventListener("DOMContentLoaded", () => {
        const token = getToken();
        const role = getRole();
        const createPostArea = document.getElementById("createPostArea");
        const postForm = document.getElementById("postForm");
        const cancelBtn = document.getElementById("cancelPostBtn");

        console.log("[Feed] Role check:", role);
        
        // Show form only to authenticated users
        if (!token) {
            if (createPostArea) createPostArea.style.display = "none";
        }

        cancelBtn?.addEventListener("click", () => {
            postForm?.reset();
        });

        postForm?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentToken = getToken();
            if (!currentToken) {
                alert("Not authenticated. Please log in first.");
                return;
            }

            const title = (document.getElementById("postTitle")?.value || "").trim();
            const content = (document.getElementById("postContent")?.value || "").trim();

            if (!title || !content) {
                alert("Title and content are required");
                return;
            }

            try {
                const res = await fetch("/api/posts/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${currentToken}`,
                    },
                    body: JSON.stringify({ 
                        title, 
                        content
                    }),
                });

                if (res.ok) {
                    postForm.reset();
                    await loadFeed();
                } else {
                    const errMsg = await res.text();
                    alert("Error: " + errMsg);
                }
            } catch (err) {
                alert("Request failed: " + err.message);
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
                container.innerHTML = `<div class="alert alert-danger">${escapeHtml(await res.text())}</div>`;
                return;
            }

            const posts = await res.json();

            if (!posts || posts.length === 0) {
                container.innerHTML = `
          <div class="text-center py-5 bg-white rounded-4 shadow-sm border">
            <div class="display-1 mb-3">📭</div>
            <h5 class="text-muted">No posts yet. Be the first to share something!</h5>
          </div>`;
                return;
            }

            const currentUserRole = getRole();
            const currentUserId = getUserId();

            container.innerHTML = posts.map((p) => {
                const authorRole = (p.author_role || "").toLowerCase().trim();
                const canDelete =
                    p.author_id === currentUserId ||
                    currentUserRole === "admin" ||
                    (currentUserRole === "moderator" && authorRole !== "admin");

                let username = "";
                if (authorRole === "admin") {
                    username = "ДСВР";
                } else if (authorRole === "club_leader" && p.author_club_name) {
                    username = p.author_club_name;
                } else {
                    username = (p.author_email || "user@aitu.kz").split("@")[0];
                }
                const initial = username.charAt(0).toUpperCase();

                return `
          <div class="card feed-card shadow-sm mb-4 border-0 rounded-4">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="avatar-circle me-3">${escapeHtml(initial)}</div>
                <div class="flex-grow-1">
                  <h6 class="mb-0 fw-bold text-dark">@${escapeHtml(username)}</h6>
                  <small class="text-muted">${formatDate(p.created_at)}</small>
                </div>
                ${
                    canDelete
                        ? `<button class="btn btn-link text-danger text-decoration-none p-0" data-delete="${p.id}">Delete</button>`
                        : ""
                }
              </div>

              <h5 class="fw-bold mb-2">${escapeHtml(p.title)}</h5>
              <p class="text-secondary mb-3" style="line-height: 1.6;">${escapeHtml(p.content)}</p>

                            <div class="d-flex gap-3 pt-3 border-top">
                                <button class="btn btn-sm btn-light rounded-pill px-3 border btn-like ${p.liked ? 'liked' : ''}" type="button" data-like="${p.id}" data-liked="${p.liked ? '1' : '0'}">❤️</button>
                                <span class="ms-2 text-muted align-self-center" data-like-count="${p.id}">${p.likes_count || 0}</span>
                                <button class="btn btn-sm btn-light rounded-pill px-3 border" type="button" data-comment="${p.id}">💬 Comment</button>
                            </div>
            </div>
          </div>
        `;
            }).join("");

            container.querySelectorAll("[data-delete]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const id = Number(btn.getAttribute("data-delete") || "0");
                    if (id > 0) deletePost(id);
                });
            });

            container.querySelectorAll("[data-like]").forEach((btn) => {
                btn.addEventListener("click", async () => {
                    const token = getToken();
                    if (!token) {
                        alert("Please register or log in to like posts");
                        return;
                    }

                    const postId = Number(btn.getAttribute("data-like") || "0");
                    if (!postId) return;

                    try {
                        const res = await fetch(`/api/posts/${postId}/like`, {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${token}` },
                        });

                        if (!res.ok) {
                            const txt = await res.text();
                            alert(txt);
                            return;
                        }

                        const data = await res.json(); // { count: number, liked: bool }
                        const countEl = container.querySelector(`[data-like-count="${postId}"]`);
                        if (countEl) countEl.textContent = data.count;
                        // toggle visual state via class, do not change button text
                        if (data.liked) {
                            btn.classList.add("liked");
                        } else {
                            btn.classList.remove("liked");
                        }
                        btn.setAttribute("data-liked", data.liked ? "1" : "0");
                    } catch (err) {
                        alert("Request failed: " + err.message);
                    }
                });
            });

            container.querySelectorAll("[data-comment]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    alert("Comments feature is coming soon 🙂");
                });
            });
        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="alert alert-danger">Error loading feed</div>`;
        }
    }

    async function deletePost(postId) {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const token = getToken();
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
})();