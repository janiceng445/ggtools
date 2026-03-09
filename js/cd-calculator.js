// ══════════════════════════════════════════════
// CD CALCULATOR
// ══════════════════════════════════════════════

// Default start date to today, auto-fill maturity
(function () {
  document.getElementById('cd-start-date').value = fmtDateInput(new Date());
  onStartOrTermChange();
})();

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDateInput(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function onStartOrTermChange() {
  const startStr = document.getElementById('cd-start-date').value;
  const term     = parseInt(document.getElementById('cd-term').value);
  if (startStr && term >= 1 && !isNaN(term)) {
    const m = parseDate(startStr);
    m.setMonth(m.getMonth() + term);
    document.getElementById('cd-maturity').value = fmtDateInput(m);
  }
  calc();
}

function calc() {
  const deposit     = parseFloat(document.getElementById('cd-deposit').value);
  const rate        = parseFloat(document.getElementById('cd-rate').value);
  const startStr    = document.getElementById('cd-start-date').value;
  const maturityStr = document.getElementById('cd-maturity').value;

  const summary   = document.getElementById('cd-summary');
  const tbody     = document.getElementById('cd-tbody');
  const tableWrap = document.getElementById('cd-table-wrap');

  const valid = deposit > 0 && rate > 0 && startStr && maturityStr &&
                !isNaN(deposit) && !isNaN(rate);

  if (!valid) {
    summary.classList.remove('visible');
    tableWrap.classList.remove('visible');
    tbody.innerHTML = '';
    return;
  }

  const apy       = rate / 100;
  const startDate = parseDate(startStr);
  const maturity  = parseDate(maturityStr);

  if (maturity <= startDate) {
    summary.classList.remove('visible');
    tableWrap.classList.remove('visible');
    tbody.innerHTML = '';
    return;
  }

  let balance = deposit;
  const rows  = [];
  let d       = new Date(startDate);

  while (d < maturity) {
    const nextMonthStart = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const periodEnd      = maturity <= nextMonthStart ? maturity : nextMonthStart;

    const days     = Math.round((periodEnd - d) / 86400000);
    const interest = balance * (Math.pow(1 + apy, days / 365) - 1);
    balance       += interest;

    const label  = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const isLast = periodEnd >= maturity;

    rows.push({ label, days, interest, balance, isLast });
    d = periodEnd;
  }

  const totalInterest = balance - deposit;

  // Render summary
  document.getElementById('cd-final').textContent          = usd(balance);
  document.getElementById('cd-interest-total').textContent = '+' + usd(totalInterest) + ' earned';
  document.getElementById('cd-apy').textContent            = fmt(rate) + '% APY';
  summary.classList.add('visible');

  // Render table
  tbody.innerHTML = '';
  rows.forEach(row => {
    const tr = document.createElement('tr');
    if (row.isLast) tr.classList.add('cd-row-final');
    const daysNote = row.days < 28 ? `<span class="cd-days">${row.days}d</span>` : '';
    tr.innerHTML = `
      <td class="cd-td-month">${row.label}${daysNote}${row.isLast ? '<span class="cd-badge">Maturity</span>' : ''}</td>
      <td class="cd-td-interest">+${usd(row.interest)}</td>
      <td class="cd-td-balance">${usd(row.balance)}</td>
    `;
    tbody.appendChild(tr);
  });

  tableWrap.classList.add('visible');
}

function usd(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmt(n) {
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
