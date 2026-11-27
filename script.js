
const matches = [
  {
    league: "ENGLAND - PREMIER LEAGUE",
    home: "Manchester United",
    away: "Liverpool",
    time: "Today 20:00",
    status: "upcoming",
    odds: [2.40, 3.20, 2.10]
  },
  {
    league: "SPAIN - LA LIGA",
    home: "Real Madrid",
    away: "Barcelona",
    time: "Today 21:00",
    status: "upcoming",
    odds: [1.90, 3.50, 2.80]
  },
  {
    league: "ITALY - SERIE A",
    home: "Inter Milan",
    away: "Juventus",
    time: "Live 65'",
    status: "live",
    odds: [1.75, 3.40, 3.10]
  },
  {
    league: "GERMANY - BUNDESLIGA",
    home: "Bayern Munich",
    away: "Dortmund",
    time: "Tomorrow 19:30",
    status: "upcoming",
    odds: [1.65, 3.80, 3.60]
  }
];

let slip = [];

function renderMatches(filter = "all") {
  const container = document.getElementById("matches");

  const filtered = matches.filter(m =>
    filter === "all" || m.status === filter
  );

  container.innerHTML = filtered.map(m => {
    const index = matches.indexOf(m);

    return `
      <div class="match-card">
        <div class="league">${m.league}</div>
        <div class="match-info">
          <div class="match-time">${m.time}</div>
          <div class="teams">
            <span>${m.home}</span>
            <span>VS</span>
            <span>${m.away}</span>
          </div>
        </div>
        <div class="odds">
          ${["1","X","2"].map((label, j) => {
            const selected = slip.some(s =>
              s.matchIndex === index && s.outcome === label
            );

            return `
              <button class="${selected ? "selected" : ""}"
                onclick="addSelection(${index},'${label}')">
                <small>${label}</small>
                <strong>${m.odds[j].toFixed(2)}</strong>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("") || "<p>No matches available.</p>";
}

function filterMatches(type, button) {
  document.querySelectorAll(".filters button")
    .forEach(b => b.classList.remove("active"));

  button.classList.add("active");
  renderMatches(type);
}

function addSelection(index, outcome) {
  const existing = slip.findIndex(s =>
    s.matchIndex === index
  );

  if (existing !== -1) {
    if (slip[existing].outcome === outcome) {
      slip.splice(existing, 1);
    } else {
      slip[existing].outcome = outcome;
      slip[existing].odds = matches[index].odds[
        ["1","X","2"].indexOf(outcome)
      ];
    }
  } else {
    slip.push({
      matchIndex: index,
      outcome,
      odds: matches[index].odds[
        ["1","X","2"].indexOf(outcome)
      ]
    });
  }

  const active = document.querySelector(
    ".filters button.active"
  );

  const filter = active
    ? active.textContent.toLowerCase()
    : "all";

  renderMatches(
    filter === "live" || filter === "upcoming"
      ? filter : "all"
  );

  renderSlip();
}

function renderSlip() {
  const container = document.getElementById("selections");

  document.getElementById("slip-count").textContent =
    slip.length;

  if (slip.length === 0) {
    container.innerHTML =
      '<p class="empty">Your betting slip is empty.</p>';
  } else {
    container.innerHTML = slip.map((s, i) => `
      <div class="selection">
        <button onclick="removeSelection(${i})">✕</button>
        <strong>${matches[s.matchIndex].home} vs
        ${matches[s.matchIndex].away}</strong>
        <p>Selection: ${s.outcome} | Odds: ${s.odds.toFixed(2)}</p>
      </div>
    `).join("");
  }

  calculate();
}

function removeSelection(index) {
  slip.splice(index, 1);
  renderSlip();

  const active = document.querySelector(
    ".filters button.active"
  );

  const filter = active
    ? active.textContent.toLowerCase()
    : "all";

  renderMatches(
    filter === "live" || filter === "upcoming"
      ? filter : "all"
  );
}

function calculate() {
  const totalOdds = slip.reduce(
    (total, s) => total * s.odds, 1
  );

  const stake = Math.max(
    0,
    Number(document.getElementById("stake").value) || 0
  );

  document.getElementById("total-odds").textContent =
    totalOdds.toFixed(2);

  document.getElementById("potential").textContent =
    "KSh " +
    (slip.length ? stake * totalOdds : 0).toFixed(2);
}

function clearSlip() {
  slip = [];
  renderSlip();
  renderMatches();
}

function placeBet() {
  if (slip.length === 0) {
    alert("Please select a match first.");
    return;
  }

  const stake = Number(
    document.getElementById("stake").value
  );

  if (!stake || stake <= 0) {
    alert("Enter a valid demo stake.");
    return;
  }

  const odds = slip.reduce(
    (t, s) => t * s.odds, 1
  );

  alert(
    "DEMO BET ONLY\n\n" +
    "Selections: " + slip.length +
    "\nStake: KSh " + stake +
    "\nPotential return: KSh " +
    (stake * odds).toFixed(2) +
    "\n\nNo real bet has been placed."
  );
}

function showLogin() {
  document.getElementById("modal-title").textContent =
    "Login";

  document.getElementById("account-modal").style.display =
    "flex";
}

function showRegister() {
  document.getElementById("modal-title").textContent =
    "Register";

  document.getElementById("account-modal").style.display =
    "flex";
}

function closeModal() {
  document.getElementById("account-modal").style.display =
    "none";
}

renderMatches();
renderSlip();
// MYBET - Supabase connection
(async function () {
  const SUPABASE_URL = "https://mbvygwayikxkqbgodapz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_LJjXjLZXDMZuxzVljXVeCA_XZjuogsg";

  try {
    const { createClient } = await import(
      "https://esm.sh/@supabase/supabase-js@2"
    );

    window.mybetSupabase = createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.log("MYBET connected to Supabase!");
  } catch (error) {
    console.error("MYBET connection error:", error);
  }
})();
