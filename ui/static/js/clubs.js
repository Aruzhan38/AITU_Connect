const CLUBS = [
    {
        id: "volunteer",
        emoji: "🤝",
        title: "Volunteer Club",
        category: "Charity",
        desc: "Helping community, social projects, volunteering events.",
        tags: ["Charity", "Community", "Events"],
        tg: "http://forms.office.com/r/PULcSczHuj"
    },
    {
        id: "volleyball",
        emoji: "🏐",
        title: "Volleyball Club",
        category: "Sport",
        desc: "Trainings, friendly matches and university tournaments.",
        tags: ["Sport", "Training", "Team"],
        tg: "https://t.me/aituvolley"
    },
    {
        id: "choir",
        emoji: "🎶",
        title: "Choir Club",
        category: "Music",
        desc: "University choir, performances and vocal practice.",
        tags: ["Singing", "Performances", "Music"],
        tg: "https://t.me/aitu_choir"
    },
    {
        id: "chess",
        emoji: "♟️",
        title: "Chess Club",
        category: "Mind Sports",
        desc: "Chess games, tournaments and strategy learning.",
        tags: ["Chess", "Strategy", "Tournaments"],
        tg: "https://t.me/chessclubchannel"
    },
    {
        id: "music",
        emoji: "🎵",
        title: "Music Club",
        category: "Creative",
        desc: "Jam sessions, bands, concerts and music creativity.",
        tags: ["Music", "Jam", "Concerts"],
        tg: "https://t.me/aitumusicclub"
    },
    {
        id: "divine",
        emoji: "💖",
        title: "Divine Club",
        category: "Charity",
        desc: "Charity initiatives, kindness and social responsibility.",
        tags: ["Charity", "Help", "Care"],
        tg: "https://t.me/devineaitu"
    },
    {
        id: "drama",
        emoji: "🎭",
        title: "Drama Club",
        category: "Art",
        desc: "Acting, stage performances and theatre productions.",
        tags: ["Acting", "Theatre", "Stage"],
        tg: "https://t.me/aitulovesdrama"
    },
    {
        id: "art",
        emoji: "🎨",
        title: "Art Club",
        category: "Creative",
        desc: "Drawing, painting, exhibitions and visual art.",
        tags: ["Art", "Drawing", "Exhibitions"],
        tg: "https://t.me/AituArtClub"
    },
    {
        id: "running",
        emoji: "🏃‍♀️",
        title: "Running Club",
        category: "Sport",
        desc: "Morning runs, endurance training and healthy lifestyle.",
        tags: ["Running", "Fitness", "Health"],
        tg: "https://t.me/aitu_running"
    }
];

let modalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    modalInstance = new bootstrap.Modal(document.getElementById("clubModal"));

    renderClubs(CLUBS);

    const search = document.getElementById("clubSearch");
    search?.addEventListener("input", () => {
        const q = (search.value || "").trim().toLowerCase();
        const filtered = CLUBS.filter(c =>
            (c.title + " " + c.category + " " + c.desc + " " + c.tags.join(" ")).toLowerCase().includes(q)
        );
        renderClubs(filtered);
    });
});

function renderClubs(list){
    const root = document.getElementById("clubsGrid");
    if (!root) return;

    if (!list.length){
        root.innerHTML = `<div class="col-12"><div class="alert alert-light border">No clubs found.</div></div>`;
        return;
    }

    root.innerHTML = list.map(c => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="club-card" onclick="openClub('${escapeAttr(c.id)}')">
        <div class="club-top">
          <div class="d-flex align-items-center gap-3">
            <div class="club-emoji">${escapeHtml(c.emoji)}</div>
            <div>
              <div class="text-muted small">${escapeHtml(c.category)}</div>
              <h5 class="club-title">${escapeHtml(c.title)}</h5>
            </div>
          </div>
        </div>

        <div class="club-body">
          <p class="club-desc mb-0">${escapeHtml(c.desc)}</p>
        </div>

        <div class="club-footer">
          ${c.tags.slice(0,3).map(t => `<span class="club-chip">${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>
    </div>
  `).join("");
}

function openClub(id){
    const c = CLUBS.find(x => x.id === id);
    if (!c) return;

    document.getElementById("mCategory").textContent = c.category;
    document.getElementById("mTitle").textContent = c.title;
    document.getElementById("mDesc").textContent = c.desc;

    const t1 = document.getElementById("mTag1");
    const t2 = document.getElementById("mTag2");
    const t3 = document.getElementById("mTag3");
    t1.textContent = c.tags[0] || "";
    t2.textContent = c.tags[1] || "";
    t3.textContent = c.tags[2] || "";
    t1.classList.toggle("d-none", !c.tags[0]);
    t2.classList.toggle("d-none", !c.tags[1]);
    t3.classList.toggle("d-none", !c.tags[2]);

    const tg = document.getElementById("mTelegram");
    tg.href = c.tg || "#";
    tg.classList.toggle("disabled", !c.tg);

    modalInstance.show();
}

function escapeHtml(s){
    return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
}
function escapeAttr(s){
    return String(s ?? "").replace(/'/g, "\\'");
}