// ══════════════════════════════════════════════
// AIRPORT PLANNER
// ══════════════════════════════════════════════

const BUFFER = { domestic: 120, international: 180 }; // minutes

let flightType = 'domestic';

function setFlightType(type) {
  flightType = type;
  document.getElementById('mode-domestic').classList.toggle('active', type === 'domestic');
  document.getElementById('mode-international').classList.toggle('active', type === 'international');
  document.getElementById('buffer-pill').textContent =
    type === 'domestic' ? 'Arrive 2 hrs before departure' : 'Arrive 3 hrs before departure';
  calcAirport();
}

function formatTime(totalMins) {
  totalMins = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const period  = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

function calcAirport() {
  const timeVal = document.getElementById('flight-time').value;
  const hours   = parseInt(document.getElementById('drive-hours').value) || 0;
  const mins    = parseInt(document.getElementById('drive-mins').value)  || 0;
  const results = document.getElementById('airport-results');

  if (!timeVal) { results.style.display = 'none'; return; }

  const [h, m]     = timeVal.split(':').map(Number);
  const flightMins = h * 60 + m;
  const driveMins  = hours * 60 + mins;
  const bufferMins = BUFFER[flightType];

  const arriveMins = flightMins - bufferMins;
  const departMins = arriveMins - driveMins;

  document.getElementById('result-arrive').textContent = formatTime(arriveMins);
  document.getElementById('result-depart').textContent = formatTime(departMins);
  results.style.display = 'flex';
}
