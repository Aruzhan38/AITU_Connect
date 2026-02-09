(() => {
    const auth = window.AITU_AUTH;

    function escapeHtml(s){
        return String(s ?? "").replace(/[&<>"']/g, (m) => ({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
        }[m]));
    }

    function formatDate(x) {
        const d = new Date(x);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString();
    }

    function getCommunityIdFromPage() {
        const container = document.querySelector("[data-community-id]");
        const cid = parseInt(container?.getAttribute("data-community-id") || "0", 10);
        if (cid > 0) return cid;

        const parts = location.pathname.split("/").filter(Boolean);
        const maybe = parseInt(parts[1] || "0", 10);
        return maybe;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const token = auth?.getToken?.() || "";
        const createPostArea = document.getElementById("createPostArea");
        const postForm = document.getElementById("postForm");

        if (token && createPostArea) createPostArea.classList.remove("d-none");

        postForm?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const communityId = getCommunityIdFromPage();
            const data = {
                title: (document.getElementById("postTitle")?.value || "").trim(),
                content: (document.getElementById("postContent")?.value || "").trim(),
                community_id: communityId,
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
                loadCommunityFeed();
            } else {
                alert(await res.text());
            }
        });

        loadCommunityFeed();
    });

    async function loadCommunityFeed() {
        const container = document.getElementById("feedContainer");
        if (!container) return;

        const communityId = getCommunityIdFromPage();
        if (!communityId) {
            container.innerHTML = `<div class="alert alert-danger">Invalid community id</div>`;
            return;
        }

        try {
            const res = await fetch(`/api/communities/${communityId}/posts`);
            if (!res.ok) {
                container.innerHTML = `<div class="alert alert-danger">${escapeHtml(await res.text())}</div>`;
                return;
            }

            const posts = await res.json();
            if (!posts || posts.length === 0) {
                container.innerHTML = `<p class="text-center text-muted py-4">No posts yet in this community</p>`;
                return;
            }

            const currentRole = (auth?.getRole?.() || "").toLowerCase();
            const currentUserId = auth?.getUserId?.() || 0;

            container.innerHTML = posts.map(p => {
                const authorRole = (p.author_role || "").toLowerCase();
                const canDelete =
                    p.author_id === currentUserId ||
                    currentRole === "admin" ||
                    (currentRole === "moderator" && authorRole !== "admin");

                const username = (p.author_email || "user@aitu.kz").split("@")[0];

                return `
          <div class="card shadow-sm mb-3 border-0">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
                <h5 class="fw-bold mb-0">${escapeHtml(p.title)}</h5>
                ${canDelete ? `<button class="btn btn-sm btn-outline-danger" data-delete="${p.id}">Delete</button>` : ""}
              </div>

              <p class="text-secondary mb-3">${escapeHtml(p.content)}</p>

              <div class="d-flex justify-content-between align-items-center">
                <small class="text-primary">@${escapeHtml(username)}</small>
                <small class="text-muted">${formatDate(p.created_at)}</small>
              </div>
            </div>
          </div>
        `;
            }).join("");

            container.querySelectorAll("[data-delete]").forEach(btn => {
                btn.addEventListener("click", () => deletePost(parseInt(btn.getAttribute("data-delete"), 10)));
            });

        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="alert alert-danger">Error loading community feed</div>`;
        }
    }

    async function deletePost(postId) {
        if (!confirm("Delete this post?")) return;

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
            loadCommunityFeed();
            return;
        }
        alert(await res.text());
    }
})();