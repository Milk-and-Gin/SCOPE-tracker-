// SCOPE PWA main JavaScript
// Handles computation, data persistence, export and service worker registration

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('scope-form');
  const status = document.getElementById('status');
  // Input elements mapped by id for convenience
  const inputs = {
    date: document.getElementById('date'),
    location: document.getElementById('location'),
    tradition: document.getElementById('tradition'),
    goal: document.getElementById('goal'),
    refClass: document.getElementById('refClass'),
    baselineP: document.getElementById('baselineP'),
    aFocus: document.getElementById('aFocus'),
    bBelief: document.getElementById('bBelief'),
    dAttach: document.getElementById('dAttach'),
    rRes: document.getElementById('rRes'),
    sSkill: document.getElementById('sSkill'),
    lLink: document.getElementById('lLink'),
    rRepr: document.getElementById('rRepr'),
    cCoord: document.getElementById('cCoord'),
    vVitality: document.getElementById('vVitality'),
    qNoise: document.getElementById('qNoise'),
    kappa: document.getElementById('kappa'),
  };
  const psiField = document.getElementById('psi');
  const pStarField = document.getElementById('pStar');

  // Helper: compute Ψ and P* and update the display
  function computeAndDisplay() {
    const A = parseFloat(inputs.aFocus.value) || 0;
    const B = parseFloat(inputs.bBelief.value) || 0;
    const D = parseFloat(inputs.dAttach.value) || 0;
    const R = parseFloat(inputs.rRes.value) || 0;
    const S = parseFloat(inputs.sSkill.value) || 0;
    const L = parseFloat(inputs.lLink.value) || 0;
    const Rp = parseFloat(inputs.rRepr.value) || 0;
    const C = parseFloat(inputs.cCoord.value) || 0;
    const V = parseFloat(inputs.vVitality.value) || 0;
    const Q = parseFloat(inputs.qNoise.value) || 0;
    const kappaVal = parseFloat(inputs.kappa.value) || 1;
    // Baseline probability
    const P = Math.min(Math.max(parseFloat(inputs.baselineP.value) || 0, 0), 1);
    // Compute H and X
    const H = A * B * (1 - D) * (1 - R);
    const X = S * L * Rp * C;
    const Psi = kappaVal * H * X * V * Q;
    // Limit Psi to [0,1]
    const PsiClamped = Math.min(Math.max(Psi, 0), 1);
    // Compute P* for spell (increasing probability)
    const PStar = P + (1 - P) * PsiClamped;
    psiField.textContent = PsiClamped.toFixed(3);
    pStarField.textContent = PStar.toFixed(3);
    return { Psi: PsiClamped, PStar };
  }

  // Save entry to localStorage
  function saveEntry(e) {
    // Compute first to update display and get values
    const { Psi, PStar } = computeAndDisplay();
    // Construct entry object
    const entry = {
      date: inputs.date.value,
      location: inputs.location.value,
      tradition: inputs.tradition.value,
      goal: inputs.goal.value,
      refClass: inputs.refClass.value,
      baselineP: parseFloat(inputs.baselineP.value) || 0,
      A_focus: parseFloat(inputs.aFocus.value) || 0,
      B_belief: parseFloat(inputs.bBelief.value) || 0,
      D_attach: parseFloat(inputs.dAttach.value) || 0,
      R_res: parseFloat(inputs.rRes.value) || 0,
      S_skill: parseFloat(inputs.sSkill.value) || 0,
      L_link: parseFloat(inputs.lLink.value) || 0,
      R_repr: parseFloat(inputs.rRepr.value) || 0,
      C_coord: parseFloat(inputs.cCoord.value) || 0,
      V_vitality: parseFloat(inputs.vVitality.value) || 0,
      Q_noise: parseFloat(inputs.qNoise.value) || 0,
      kappa: parseFloat(inputs.kappa.value) || 1,
      Psi,
      PStar,
    };
    // Retrieve existing entries array or init
    const existing = JSON.parse(localStorage.getItem('scopeEntries') || '[]');
    existing.push(entry);
    localStorage.setItem('scopeEntries', JSON.stringify(existing));
    status.textContent = 'Entry saved.';
    setTimeout(() => (status.textContent = ''), 3000);
  }

  // Export data to CSV
  function exportData() {
    const entries = JSON.parse(localStorage.getItem('scopeEntries') || '[]');
    if (entries.length === 0) {
      status.textContent = 'No entries to export.';
      setTimeout(() => (status.textContent = ''), 3000);
      return;
    }
    // Build CSV header and rows
    const headers = Object.keys(entries[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    entries.forEach((obj) => {
      csvRows.push(headers.map((h) => JSON.stringify(obj[h] ?? '')).join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scope_entries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Attach input listeners to update outputs in real time
  Object.values(inputs).forEach((el) => {
    el.addEventListener('input', computeAndDisplay);
  });
  // Compute initial values
  computeAndDisplay();

  // Form submit event handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEntry();
  });
  // Export button handler
  document.getElementById('export').addEventListener('click', exportData);

  // Register service worker for offline functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('service-worker.js')
      .catch((err) => console.error('Service Worker registration failed:', err));
  }
});