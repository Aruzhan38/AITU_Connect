async function loadCanteens() {
    const res = await fetch("/api/canteens");
    if (!res.ok) {
        console.error("Failed to load canteens", await res.text());
        return;
    }
    const data = await res.json();

    const container = document.getElementById("canteens");
    container.innerHTML = "";

    data.forEach(c => {
        const div = document.createElement("div");
        div.className = "col-md-6";

        div.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title fw-bold">${escapeHtml(c.name)}</h5>
          <p class="text-muted mb-3">${escapeHtml(c.location)}</p>
          <a href="/canteens/${c.id}" class="btn btn-primary btn-sm">View news</a>
        </div>
      </div>
    `;
        container.appendChild(div);
    });
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[m]));
}

loadCanteens();