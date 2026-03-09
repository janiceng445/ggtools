// ══════════════════════════════════════════════
// PERCENTAGE CALCULATOR
// ══════════════════════════════════════════════

let pctMode = 'change';

function setMode(m) {
  pctMode = m;
  document.querySelectorAll('.pct-tab').forEach((tab, i) => {
    tab.classList.toggle('active', ['change', 'new', 'original'][i] === m);
  });
  document.querySelectorAll('.pct-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`panel-${m}`).classList.remove('hidden');
  hideResult();
}

function calc() {
  if (pctMode === 'change')        calcChange();
  else if (pctMode === 'new')      calcNew();
  else                             calcOriginal();
}

function calcChange() {
  const from = parseFloat(document.getElementById('change-from').value);
  const to   = parseFloat(document.getElementById('change-to').value);
  if (isNaN(from) || isNaN(to) || from === 0) { hideResult(); return; }

  const pct = ((to - from) / Math.abs(from)) * 100;
  const dir  = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'neutral';
  const sign = pct > 0 ? '↑' : pct < 0 ? '↓' : '';

  showResult(
    `${sign} ${fmt(Math.abs(pct))}%`,
    dir === 'neutral' ? 'no change' : dir,
    dir
  );
}

function calcNew() {
  const base = parseFloat(document.getElementById('new-base').value);
  const pct  = parseFloat(document.getElementById('new-pct').value);
  if (isNaN(base) || isNaN(pct)) { hideResult(); return; }

  const result = base * (1 + pct / 100);
  const dir    = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'neutral';

  showResult(
    fmt(result),
    `${pct >= 0 ? '+' : ''}${fmt(pct)}% from ${fmt(base)}`,
    dir
  );
}

function calcOriginal() {
  const final = parseFloat(document.getElementById('orig-final').value);
  const pct   = parseFloat(document.getElementById('orig-pct').value);
  if (isNaN(final) || isNaN(pct) || pct === -100) { hideResult(); return; }

  const original = final / (1 + pct / 100);
  const dir      = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'neutral';

  showResult(
    fmt(original),
    `original · ${pct >= 0 ? '+' : ''}${fmt(pct)}% → ${fmt(final)}`,
    dir
  );
}

function showResult(value, sub, dir) {
  const wrap = document.getElementById('pct-result-wrap');
  wrap.className = `pct-result-wrap visible ${dir}`;
  document.getElementById('pct-result').textContent = value;
  document.getElementById('pct-result-sub').textContent = sub;
}

function hideResult() {
  document.getElementById('pct-result-wrap').className = 'pct-result-wrap';
}

function fmt(n) {
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
