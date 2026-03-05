// ══════════════════════════════════════════════
// TIP CALCULATOR
// ══════════════════════════════════════════════

let tipPct = 20;

function selectPct(el, pct) {
  document.querySelectorAll('.pct-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  tipPct = pct;
  // hide custom field if open
  const customGroup = document.getElementById('custom-tip-group');
  if (customGroup) customGroup.style.display = 'none';
  const customInput = document.getElementById('custom-tip');
  if (customInput) customInput.value = '';
  calcTip();
}

function toggleCustomField(el) {
  const group = document.getElementById('custom-tip-group');
  if (!group) return;
  
  const isOpen = group.style.display !== 'none';
  if (isOpen) {
    group.style.display = 'none';
    el.classList.remove('selected');
    const customInput = document.getElementById('custom-tip');
    if (customInput) customInput.value = '';
    tipPct = 20;
    const presetPill = document.querySelector('.pct-pill[onclick*="selectPct(this, 20)"]');
    if (presetPill) presetPill.classList.add('selected');
    calcTip();
  } else {
    document.querySelectorAll('.pct-pill').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    group.style.display = 'block';
    const customInput = document.getElementById('custom-tip');
    setTimeout(() => customInput?.focus(), 50);
  }
}

// Auto-decimal: insert decimal 2 places from right once 3+ digits are typed
function handleCurrencyInput(el) {
  let raw = el.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
  if (raw === '') {
    el.value = '';
    calcTip();
    return;
  }
  if (raw.length <= 2) {
    el.value = raw;
  } else {
    el.value = raw.slice(0, raw.length - 2) + '.' + raw.slice(-2);
  }
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = el.value.length;
  }, 0);
  calcTip();
}

function handlePeopleInput(el) {
  let raw = el.value.replace(/[^0-9]/g, '');
  if (raw === '') {
    el.value = '';
    calcTip();
    return;
  }
  el.value = parseInt(raw, 10).toString();
  calcTip();
}

function handleCustomTip(el) {
  let raw = el.value.replace(/[^0-9.]/g, '');
  el.value = raw;
  if (raw !== '') {
    const v = parseFloat(raw);
    if (!isNaN(v)) {
      document.querySelectorAll('.pct-pill').forEach(p => p.classList.remove('selected'));
      tipPct = v;
      calcTip();
    }
  }
}

function calcTip() {
  const billInput = document.getElementById('bill-amount');
  const bill = billInput ? parseFloat(billInput.value) || 0 : 0;

  const tip = bill * (tipPct / 100);
  const total = bill + tip;

  const resTip = document.getElementById('res-tip-amt');
  const resTotal = document.getElementById('res-total');
  if (resTip) resTip.textContent = '$' + tip.toFixed(2);
  if (resTotal) resTotal.textContent = '$' + total.toFixed(2);

  const tipResult = document.getElementById('tip-result');
  const show = bill > 0;
  if (tipResult) tipResult.classList.toggle('visible', show);

  if (show) {
    // Round down to nearest $0.25
    const rdTotal = Math.floor(total);
    const rdTip = rdTotal - bill;
    const rdDiff = total - rdTotal;
    const rdPct = bill > 0 ? (rdTip / bill * 100) : 0;

    document.getElementById('rd-total').textContent = '$' + rdTotal.toFixed(2);
    document.getElementById('rd-badge').textContent = '▼ −$' + rdDiff.toFixed(2);
    document.getElementById('rd-tip-pct').textContent = rdPct.toFixed(1) + '%';
    document.getElementById('rd-tip-amt').textContent = '$' + Math.max(0, rdTip).toFixed(2);

    // Round up to nearest $0.25
    const ruTotal = Math.ceil(total);
    const ruTip = ruTotal - bill;
    const ruDiff = ruTotal - total;
    const ruPct = bill > 0 ? (ruTip / bill * 100) : 0;

    document.getElementById('ru-total').textContent = '$' + ruTotal.toFixed(2);
    document.getElementById('ru-badge').textContent = '▲ +$' + ruDiff.toFixed(2);
    document.getElementById('ru-tip-pct').textContent = ruPct.toFixed(1) + '%';
    document.getElementById('ru-tip-amt').textContent = '$' + ruTip.toFixed(2);
  }
}

