// ══════════════════════════════════════════════
// TIME PLANNER
// ══════════════════════════════════════════════

let driveMode = 'arrive';

function setDriveMode(mode) {
  driveMode = mode;
  document.getElementById('mode-arrive').classList.toggle('active', mode === 'arrive');
  document.getElementById('mode-depart').classList.toggle('active', mode === 'depart');
  document.getElementById('drive-time-label').textContent =
    mode === 'arrive' ? 'Start time' : 'End time / deadline';
  calcDrive();
}

function formatTime(totalMins) {
  totalMins = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

function calcDrive() {
  const timeVal = document.getElementById('drive-time').value;
  const hours = parseInt(document.getElementById('drive-hours').value) || 0;
  const mins  = parseInt(document.getElementById('drive-mins').value)  || 0;
  const resultWrap  = document.getElementById('drive-result-wrap');
  const resultEl    = document.getElementById('drive-result');
  const resultLabel = document.getElementById('drive-result-label');

  if (!timeVal) {
    resultWrap.style.display = 'none';
    return;
  }

  const [h, m]      = timeVal.split(':').map(Number);
  const timeMins    = h * 60 + m;
  const durationMins = hours * 60 + mins;

  let resultMins;
  if (driveMode === 'arrive') {
    resultMins = timeMins + durationMins;
    resultLabel.textContent = 'You\'ll finish at';
  } else {
    resultMins = timeMins - durationMins;
    resultLabel.textContent = 'You need to start by';
  }

  resultEl.textContent = formatTime(resultMins);
  resultWrap.style.display = 'flex';
}
