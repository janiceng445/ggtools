// ══════════════════════════════════════════════
// WOW AH FLIPPER
// ══════════════════════════════════════════════

const COPPER_PER_GOLD   = 10000;
const COPPER_PER_SILVER = 100;
const MAX_SILVER = 99;
const MAX_COPPER = 99;
const AH_CUT = 0.95; // 5% AH commission

const ROI_LEVELS = {
  breakeven: 1.00,
  minimum:   1.05,
  good:      1.15,
  great:     1.30,
  extreme:   1.50,
};

let currentRatio = 1;
let tierView = 'raw';
let configurations = [];
let lastTierResults = {};

// ── Ratio buttons ──
document.querySelectorAll('.ah-ratio-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    document.querySelectorAll('.ah-ratio-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentRatio = parseInt(e.currentTarget.dataset.ratio);
    calculateAll();
  });
});

document.getElementById('unit-price').addEventListener('input', handlePriceInput);
document.getElementById('resell-raw').addEventListener('input', handleResellInput);
document.getElementById('resell-craft').addEventListener('input', handleResellInput);
document.getElementById('save-config-btn').addEventListener('click', saveConfiguration);
document.getElementById('clear-resell-btn').addEventListener('click', clearResellInputs);

// ── Tier view toggle ──
function setTierView(view) {
  tierView = view;
  document.getElementById('toggle-raw').classList.toggle('active', view === 'raw');
  document.getElementById('toggle-craft').classList.toggle('active', view === 'craft');
  renderTierDisplay();
}

// ── Currency helpers ──
function parseCurrency(input) {
  const trimmed = input.trim();
  if (!trimmed) return { copper: 0, valid: true };

  let gold = 0, silver = 0, copper = 0;
  for (const part of trimmed.split(/\s+/)) {
    const m = part.match(/^(\d+)([gsc])$/i);
    if (!m) return { copper: 0, valid: false, error: 'Invalid format. Use: 1g 50s 25c' };
    const val = parseInt(m[1]);
    const cur = m[2].toLowerCase();
    if (cur === 'g') gold = val;
    else if (cur === 's') {
      if (val > MAX_SILVER) return { copper: 0, valid: false, error: `Silver max is ${MAX_SILVER}` };
      silver = val;
    } else {
      if (val > MAX_COPPER) return { copper: 0, valid: false, error: `Copper max is ${MAX_COPPER}` };
      copper = val;
    }
  }
  return { copper: gold * COPPER_PER_GOLD + silver * COPPER_PER_SILVER + copper, valid: true };
}

function formatCurrency(copper) {
  const total = Math.round(copper);
  if (total < 0) return '—';
  const g = Math.floor(total / COPPER_PER_GOLD);
  const rem = total % COPPER_PER_GOLD;
  const s = Math.floor(rem / COPPER_PER_SILVER);
  const c = rem % COPPER_PER_SILVER;
  let out = '';
  if (g > 0) out += `${g}g `;
  if (s > 0 || out) out += `${s}s `;
  if (c > 0 || out) out += `${c}c`;
  return out.trim() || '0c';
}

// ── Calculations ──
function calculateProfitTiers() {
  const parsed = parseCurrency(document.getElementById('unit-price').value);
  const buy = parsed.copper || 0;
  const results = {};
  for (const [tier, roi] of Object.entries(ROI_LEVELS)) {
    const rawSell    = (buy * roi) / AH_CUT;
    const craftSell  = (buy * currentRatio * roi) / AH_CUT;
    results[tier] = {
      rawSell,
      craftSell,
      rawProfit:   (rawSell   * AH_CUT) - buy,
      craftProfit: (craftSell * AH_CUT) - (buy * currentRatio),
    };
  }
  lastTierResults = results;
}

function renderTierDisplay() {
  for (const [tier, data] of Object.entries(lastTierResults)) {
    const isRaw = tierView === 'raw';
    document.getElementById(`tier-sell-${tier}`).textContent   = formatCurrency(isRaw ? data.rawSell   : data.craftSell);
    document.getElementById(`tier-profit-${tier}`).textContent = formatCurrency(isRaw ? data.rawProfit : data.craftProfit) + ' profit';
  }
}

function handlePriceInput() {
  const parsed = parseCurrency(document.getElementById('unit-price').value);
  document.getElementById('price-error').textContent = parsed.valid ? '' : parsed.error;
  calculateAll();
}

function calculateAll() {
  calculateProfitTiers();
  renderTierDisplay();
  handleResellInput();
}

// ── Resell comparison ──
function handleResellInput() {
  const rawEl    = document.getElementById('raw-result-item');
  const craftEl  = document.getElementById('craft-result-item');
  const rawErr   = document.getElementById('resell-raw-error');
  const craftErr = document.getElementById('resell-craft-error');

  rawErr.textContent = '';
  craftErr.textContent = '';

  const parsed = parseCurrency(document.getElementById('unit-price').value);
  const buy = parsed.copper || 0;

  if (buy <= 0) {
    rawEl.style.display = craftEl.style.display = 'none';
    return;
  }

  const rawVal   = document.getElementById('resell-raw').value.trim();
  const craftVal = document.getElementById('resell-craft').value.trim();

  if (!rawVal && !craftVal) {
    rawEl.style.display = craftEl.style.display = 'none';
    document.getElementById('recommendation-box').classList.remove('show');
    return;
  }

  let rawProfit = null, craftProfit = null;

  if (rawVal) {
    const rp = parseCurrency(rawVal);
    if (!rp.valid) {
      rawErr.textContent = rp.error;
      rawEl.style.display = 'none';
    } else {
      const rawPrice = rp.copper;
      rawProfit = (rawPrice * AH_CUT) - buy;
      const craftEquiv = (rawProfit + buy * currentRatio) / AH_CUT;
      document.getElementById('custom-raw-input-display').textContent = formatCurrency(rawPrice);
      document.getElementById('custom-raw-profit').textContent        = formatCurrency(rawProfit);
      document.getElementById('custom-raw-equivalent').textContent    = formatCurrency(craftEquiv);
      rawEl.style.display = 'flex';
    }
  } else {
    rawEl.style.display = 'none';
  }

  if (craftVal) {
    const cp = parseCurrency(craftVal);
    if (!cp.valid) {
      craftErr.textContent = cp.error;
      craftEl.style.display = 'none';
    } else {
      const craftPrice = cp.copper;
      craftProfit = (craftPrice * AH_CUT) - (buy * currentRatio);
      const rawEquiv = (craftProfit + buy) / AH_CUT;
      document.getElementById('custom-craft-input-display').textContent = formatCurrency(craftPrice);
      document.getElementById('custom-craft-profit').textContent        = formatCurrency(craftProfit);
      document.getElementById('custom-craft-equivalent').textContent    = formatCurrency(rawEquiv);
      craftEl.style.display = 'flex';
    }
  } else {
    craftEl.style.display = 'none';
  }

  updateRecommendation(rawProfit, craftProfit);
}

function updateRecommendation(rawProfit, craftProfit) {
  const box  = document.getElementById('recommendation-box');
  const text = document.getElementById('recommendation-text');
  if (rawProfit === null || craftProfit === null) {
    box.classList.remove('show');
    return;
  }
  if (Math.abs(rawProfit - craftProfit) < 1) {
    text.textContent = 'Both options yield equal profit. Choose based on market demand.';
  } else if (rawProfit > craftProfit) {
    text.textContent = `Sell raw — profit better by ${formatCurrency(rawProfit - craftProfit)}`;
  } else {
    text.textContent = `Sell crafted — profit better by ${formatCurrency(craftProfit - rawProfit)}`;
  }
  box.classList.add('show');
}

function clearResellInputs() {
  document.getElementById('resell-raw').value   = '';
  document.getElementById('resell-craft').value = '';
  document.getElementById('raw-result-item').style.display   = 'none';
  document.getElementById('craft-result-item').style.display = 'none';
  document.getElementById('resell-raw-error').textContent   = '';
  document.getElementById('resell-craft-error').textContent = '';
  document.getElementById('recommendation-box').classList.remove('show');
}

// ── Saved configs ──
function loadConfigurations() {
  const stored = localStorage.getItem('ggtools_ahConfigs');
  if (stored) configurations = JSON.parse(stored);
  renderConfigurations();
}

function saveConfiguration() {
  const name = document.getElementById('config-name').value.trim();
  if (!name) { alert('Please enter a config name'); return; }
  const parsed = parseCurrency(document.getElementById('unit-price').value);
  if (!parsed.valid || parsed.copper <= 0) { alert('Please enter a valid unit price'); return; }

  configurations.push({
    id: Date.now(),
    name,
    unitPrice: document.getElementById('unit-price').value.trim(),
    ratio: currentRatio,
  });
  localStorage.setItem('ggtools_ahConfigs', JSON.stringify(configurations));
  document.getElementById('config-name').value = '';
  renderConfigurations();
}

function renderConfigurations() {
  const scroll = document.getElementById('configs-scroll');
  const empty  = document.getElementById('configs-empty');
  scroll.innerHTML = '';

  if (configurations.length === 0) {
    scroll.appendChild(empty);
    return;
  }

  configurations.forEach(config => {
    const pill = document.createElement('div');
    pill.className = 'ah-config-pill';
    pill.innerHTML = `
      <div class="ah-config-info">
        <div class="ah-config-name">${config.name}</div>
        <div class="ah-config-meta">1:${config.ratio} · ${config.unitPrice}</div>
      </div>
      <button class="ah-config-delete" title="Delete">×</button>
    `;
    pill.querySelector('.ah-config-delete').addEventListener('click', e => {
      e.stopPropagation();
      configurations = configurations.filter(c => c.id !== config.id);
      localStorage.setItem('ggtools_ahConfigs', JSON.stringify(configurations));
      renderConfigurations();
    });
    pill.addEventListener('click', () => {
      document.getElementById('unit-price').value = config.unitPrice;
      document.querySelectorAll('.ah-ratio-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.ratio) === config.ratio);
      });
      currentRatio = config.ratio;
      calculateAll();
    });
    scroll.appendChild(pill);
  });
}

// ── Init ──
loadConfigurations();
calculateAll();
