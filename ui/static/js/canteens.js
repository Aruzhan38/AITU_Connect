async function loadCanteens() {
    const res = await fetch("/api/canteens");
    const data = await res.json();

    const container = document.getElementById("canteens");
    container.innerHTML = "";

    data.forEach(c => {
        const div = document.createElement("div");
        div.className = "col-md-6";

        div.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title fw-bold">${c.name}</h5>
          <p class="text-muted mb-2">${c.location}</p>
          <a href="/canteens/${c.id}" class="btn btn-outline-primary btn-sm">
            View news
          </a>
        </div>
      </div>
    `;

        container.appendChild(div);
    });
}

loadCanteens();