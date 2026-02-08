async function loadCanteens() {
    const res = await fetch("/api/canteens");
    if (!res.ok) {
        console.error("Failed to load canteens", await res.text());
        return;
    }

    const data = await res.json();
    const container = document.getElementById("canteens");
    if (!container) return;

    container.innerHTML = "";

    const CAFE_IDS = new Set([
        "d85854aa-a302-4519-b98a-17eea9f104f1", // Mokko
        "b15d9916-0714-4957-bf18-ee58d13e61fc", // Atrium
        "61ce75fd-0b4e-4535-8ae3-61924a5ec6ea", // Sheker
    ]);

    data.forEach((c) => {
        const div = document.createElement("div");
        div.className = "col-md-6";

        const isCafe = CAFE_IDS.has(c.id);

        const href = isCafe
            ? `/canteens/${encodeURIComponent(c.id)}/menu`
            : `/canteens/${encodeURIComponent(c.id)}`;

        const label = isCafe ? "View menu" : "View news";

        div.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title fw-bold">${escapeHtml(c.name)}</h5>
          <p class="text-muted mb-3">${escapeHtml(c.location)}</p>
          <a href="${href}" class="btn btn-primary btn-sm">${label}</a>
        </div>
      </div>
    `;

        container.appendChild(div);
    });
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

loadCanteens();