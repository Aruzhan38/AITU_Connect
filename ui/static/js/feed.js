(() => {
    const auth = window.AITU_AUTH;

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
        const token = auth?.getToken?.() || "";
        const createPostArea = document.getElementById("createPostArea");
        const toggleBtn = document.getElementById("togglePostBtn");
        const closeBtn = document.getElementById("closePostBtn");
        const postForm = document.getElementById("postForm");

        if (token && toggleBtn) toggleBtn.classList.remove("d-none");

        toggleBtn?.addEventListener("click", () => {
            createPostArea?.classList.remove("d-none");
            toggleBtn.classList.add("d-none");
        });

        closeBtn?.addEventListener("click", () => {
            createPostArea?.classList.add("d-none");
            toggleBtn?.classList.remove("d-none");
        });

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
                createPostArea?.classList.add("d-none");
                toggleBtn?.classList.remove("d-none");
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

            const currentUserRole = (auth?.getRole?.() || "").toLowerCase();
            const currentUserId = Number(auth?.getUserId?.() || 0);

            container.innerHTML = posts.map((p) => {
                const authorRole = (p.author_role || "").toLowerCase();
                const canDelete =
                    p.author_id === currentUserId ||
                    currentUserRole === "admin" ||
                    (currentUserRole === "moderator" && authorRole !== "admin");

                const username = (p.author_email || "user@aitu.kz").split("@")[0];
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
                <button class="btn btn-sm btn-light rounded-pill px-3 border" type="button" data-like="${p.id}">❤️ Like</button>
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
                btn.addEventListener("click", () => {
                    btn.textContent = "❤️ Liked";
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

        const token = auth?.getToken?.() || "";
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