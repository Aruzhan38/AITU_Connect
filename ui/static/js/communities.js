const TOKEN_KEY = window.TOKEN_KEY || "aitu_token";

document.addEventListener("DOMContentLoaded", () => {
    loadCommunities();
});

async function loadCommunities() {
    const token = localStorage.getItem(TOKEN_KEY);

    const root = document.getElementById("commList");
    if (!root) return;

    try {
        const res = await fetch("/api/communities", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            root.innerHTML = `<div class="alert alert-danger">${await res.text()}</div>`;
            return;
        }

        const data = await res.json();
        const list = data.communities || [];
        const memberships = data.memberships || {};

        if (list.length === 0) {
            root.innerHTML = `<div class="text-muted text-center py-5">No communities yet</div>`;
            return;
        }

        root.innerHTML = list
            .map((c) => {
                const joined = !!memberships[c.id];

                const badge =
                    c.kind === "course"
                        ? `<span class="badge text-bg-primary">Course</span>`
                        : c.kind === "club"
                            ? `<span class="badge text-bg-success">Club</span>`
                            : `<span class="badge text-bg-warning">Interest</span>`;

                const btn = joined
                    ? `<button class="btn btn-outline-danger btn-sm" onclick="leaveComm(${c.id})">Leave</button>`
                    : `<button class="btn btn-primary btn-sm" onclick="joinComm(${c.id})">Join</button>`;

                return `
          <div class="col-md-4">
            <div class="card shadow-sm border-0 h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="fw-bold fs-5">${escapeHtml(c.title)}</div>
                  ${badge}
                </div>

                <div class="text-muted small mb-3">@${escapeHtml(c.slug)}</div>

                <div class="d-flex gap-2">
                  <a class="btn btn-outline-secondary btn-sm" href="/communities/${c.id}">Open feed</a>
                  ${btn}
                </div>
              </div>
            </div>
          </div>
        `;
            })
            .join("");
    } catch (e) {
        console.error(e);
        root.innerHTML = `<div class="alert alert-danger">Failed to load communities</div>`;
    }
}

async function joinComm(id) {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`/api/communities/join/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) alert(await res.text());
    loadCommunities();
}

async function leaveComm(id) {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`/api/communities/leave/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) alert(await res.text());
    loadCommunities();
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