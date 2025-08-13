// ---- Table data ----
const TABLES = [
  { id: "T1", name: "Garden Nook", capacity: 2 },
  { id: "T2", name: "Sunset Corner", capacity: 4 },
  { id: "T3", name: "Terrace A", capacity: 6 },
  { id: "T4", name: "Riverside", capacity: 8 }
];

// ---- Storage helpers ----
function getKey(date, time) {
  return reservations_${date}_${time};
}

function getReservations(date, time) {
  try {
    return JSON.parse(localStorage.getItem(getKey(date, time))) || {};
  } catch {
    return {};
  }
}

function saveReservations(date, time, data) {
  localStorage.setItem(getKey(date, time), JSON.stringify(data));
}

// ---- Main logic (runs after DOM is ready) ----
window.addEventListener("DOMContentLoaded"),  () => {
  const form = document.getElementById("searchForm");
  const grid = document.getElementById("tablesGrid");

  if (!form || !grid) {
    console.error("Missing #searchForm or #tablesGrid in your HTML.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const guestsRaw = document.getElementById("guests").value;
    const guests = parseInt(guestsRaw, 10) || 2;

    if (!date || !time) {
      alert("Please choose a valid date and time.");
      return;
    }

    const reservations = getReservations(date, time);
    grid.innerHTML = "";

    const candidates = TABLES.filter(t => t.capacity >= guests);

    if (candidates.length === 0) {
      grid.innerHTML = `<p style="padding:10px;background:#fff3cd;border:1px solid #ffeeba;border-radius:6px;">
        No tables can seat ${guests}. Try a smaller party size or call us for group bookings.
      </p>`;
      return;
    }

    candidates.forEach(table => {
      const isReserved = Boolean(reservations[table.id]);

      const card = document.createElement("div");
      card.className = table-card ${isReserved ? "unavailable" : "available"};
      card.innerHTML = `
        <strong>${table.name}</strong><br>
        Seats: ${table.capacity}<br>
        ${isReserved ? "Reserved" : <button type="button" class="reserve-btn">Reserve</button>}
      `;

      if (!isReserved) {
        card.querySelector(".reserve-btn").addEventListener("click", () => {
          // Re-check latest reservations to avoid race conditions
          const latest = getReservations(date, time);
          if (latest[table.id]) {
            alert("Sorry, this table was just reserved. Pick another.");
            form.dispatchEvent(new Event("submit"));
            return;
          }

          latest[table.id] = true;
          saveReservations(date, time, latest);
          alert(Reserved ${table.name}!);
          form.dispatchEvent(new Event("submit")); // refresh the grid
        });
      }

      grid.appendChild(card);
    });
  });
});