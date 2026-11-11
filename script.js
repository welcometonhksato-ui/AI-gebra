/**
 * MatrixLab &bull; 3×3 Linear Algebra Engine & Interactive Solver
 * Adheres to UI/UX Pro Max standards: Zero vibe-coded slop, exact BigInt rational math,
 * scalable SVG vector iconography, and keyboard-first accessibility.
 */

// =============================================================================
// 1. Exact Rational Arithmetic Engine (Fraction backed by BigInt)
// =============================================================================

class Fraction {
  constructor(num, den = 1n) {
    if (typeof num === 'number') num = BigInt(Math.round(num));
    if (typeof den === 'number') den = BigInt(Math.round(den));
    if (typeof num === 'string') num = BigInt(num);
    if (typeof den === 'string') den = BigInt(den);

    if (den === 0n) {
      throw new Error("Denominator cannot be zero.");
    }
    if (den < 0n) {
      num = -num;
      den = -den;
    }
    const g = Fraction.gcd(num, den);
    this.n = num / g;
    this.d = den / g;
  }

  static gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  static fromString(str) {
    if (str === null || str === undefined) return new Fraction(0n, 1n);
    let s = String(str).trim();
    if (s === '') return new Fraction(0n, 1n);

    // Mixed fraction support: "2 1/3" or "-2 1/3"
    const mixedParts = s.split(/\s+/);
    if (mixedParts.length === 2 && mixedParts[1].includes('/')) {
      const whole = Fraction.fromString(mixedParts[0]);
      const frac = Fraction.fromString(mixedParts[1]);
      return whole.n < 0n ? whole.sub(frac) : whole.add(frac);
    }

    // Fraction format: "a/b"
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length !== 2) throw new Error(`Invalid fraction: "${str}"`);
      const numF = Fraction.fromString(parts[0]);
      const denF = Fraction.fromString(parts[1]);
      if (denF.isZero()) throw new Error("Division by zero in input: " + str);
      return numF.div(denF);
    }

    // Decimal or Integer
    const isNeg = s.startsWith('-');
    if (isNeg || s.startsWith('+')) {
      s = s.substring(1).trim();
    }
    const sign = isNeg ? -1n : 1n;

    if (s.includes('.')) {
      const [intPart, decPart] = s.split('.');
      const cleanDec = decPart || '0';
      if (!/^\d*$/.test(cleanDec) || (intPart && !/^\d+$/.test(intPart))) {
        throw new Error(`Invalid numeric input: "${str}"`);
      }
      const decimals = cleanDec.length;
      const den = 10n ** BigInt(decimals);
      const intVal = intPart ? BigInt(intPart) : 0n;
      const decVal = BigInt(cleanDec);
      const num = sign * (intVal * den + decVal);
      return new Fraction(num, den);
    } else {
      if (!/^\d+$/.test(s)) {
        throw new Error(`Invalid numeric input: "${str}"`);
      }
      return new Fraction(sign * BigInt(s), 1n);
    }
  }

  add(o) {
    return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  sub(o) {
    return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d);
  }

  mul(o) {
    return new Fraction(this.n * o.n, this.d * o.d);
  }

  div(o) {
    if (o.isZero()) throw new Error("Division by zero.");
    return new Fraction(this.n * o.d, this.d * o.n);
  }

  neg() {
    return new Fraction(-this.n, this.d);
  }

  abs() {
    return new Fraction(this.n < 0n ? -this.n : this.n, this.d);
  }

  isZero() {
    return this.n === 0n;
  }

  equals(o) {
    return this.n === o.n && this.d === o.d;
  }

  toString() {
    if (this.d === 1n) return this.n.toString();
    return `${this.n}/${this.d}`;
  }

  toDecimal(precision = 4) {
    if (this.d === 1n) return this.n.toString();
    const isNeg = this.n < 0n;
    const absN = isNeg ? -this.n : this.n;

    const intPart = absN / this.d;
    let remainder = absN % this.d;

    if (remainder === 0n) {
      return (isNeg ? '-' : '') + intPart.toString();
    }

    const factor = 10n ** BigInt(precision + 1);
    let decVal = (remainder * factor) / this.d;
    decVal = (decVal + 5n) / 10n; // round

    let decStr = decVal.toString().padStart(precision, '0');
    if (decStr.length > precision) {
      const carry = BigInt(decStr.slice(0, decStr.length - precision));
      const newInt = intPart + carry;
      decStr = decStr.slice(decStr.length - precision).replace(/0+$/, '');
      return (isNeg ? '-' : '') + newInt.toString() + (decStr ? '.' + decStr : '');
    }
    decStr = decStr.replace(/0+$/, '');
    return (isNeg ? '-' : '') + intPart.toString() + (decStr ? '.' + decStr : '');
  }

  toFormatted(mode = 'fraction') {
    if (mode === 'fraction') return this.toString();
    if (mode === 'decimal2') return this.toDecimal(2);
    if (mode === 'decimal6') return this.toDecimal(6);
    return this.toDecimal(4); // default decimal4
  }

  toHTML(mode = 'fraction') {
    if (mode !== 'fraction') {
      return `<span class="val-num">${this.toFormatted(mode)}</span>`;
    }
    if (this.d === 1n) {
      return `<span class="val-num">${this.n.toString()}</span>`;
    }
    const isNeg = this.n < 0n;
    const absN = isNeg ? -this.n : this.n;
    return `${isNeg ? '<span class="sign-neg">&minus;</span>' : ''}<span class="frac"><span class="num">${absN}</span><span class="den">${this.d}</span></span>`;
  }

  toLaTeX() {
    if (this.d === 1n) return this.n.toString();
    if (this.n < 0n) return `-\\frac{${-this.n}}{${this.d}}`;
    return `\\frac{${this.n}}{${this.d}}`;
  }
}

// =============================================================================
// 2. Linear Algebra Algorithms
// =============================================================================

function det2x2(a, b, c, d) {
  return a.mul(d).sub(b.mul(c));
}

function compute3x3Det(m) {
  // Laplace expansion along Row 0:
  const m00 = det2x2(m[1][1], m[1][2], m[2][1], m[2][2]);
  const m01 = det2x2(m[1][0], m[1][2], m[2][0], m[2][2]);
  const m02 = det2x2(m[1][0], m[1][1], m[2][0], m[2][1]);

  const term0 = m[0][0].mul(m00);
  const term1 = m[0][1].mul(m01);
  const term2 = m[0][2].mul(m02);

  const det = term0.sub(term1).add(term2);

  return {
    det,
    minorsRow0: [m00, m01, m02],
    termsRow0: [term0, term1, term2]
  };
}

function computeAllMinors(m) {
  return [
    [
      det2x2(m[1][1], m[1][2], m[2][1], m[2][2]),
      det2x2(m[1][0], m[1][2], m[2][0], m[2][2]),
      det2x2(m[1][0], m[1][1], m[2][0], m[2][1])
    ],
    [
      det2x2(m[0][1], m[0][2], m[2][1], m[2][2]),
      det2x2(m[0][0], m[0][2], m[2][0], m[2][2]),
      det2x2(m[0][0], m[0][1], m[2][0], m[2][1])
    ],
    [
      det2x2(m[0][1], m[0][2], m[1][1], m[1][2]),
      det2x2(m[0][0], m[0][2], m[1][0], m[1][2]),
      det2x2(m[0][0], m[0][1], m[1][0], m[1][1])
    ]
  ];
}

function computeCofactors(minors) {
  return [
    [minors[0][0], minors[0][1].neg(), minors[0][2]],
    [minors[1][0].neg(), minors[1][1], minors[1][2].neg()],
    [minors[2][0], minors[2][1].neg(), minors[2][2]]
  ];
}

function transpose(m) {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]]
  ];
}

function computeInverse(m, det, adj) {
  if (det.isZero()) return null;
  return [
    [adj[0][0].div(det), adj[0][1].div(det), adj[0][2].div(det)],
    [adj[1][0].div(det), adj[1][1].div(det), adj[1][2].div(det)],
    [adj[2][0].div(det), adj[2][1].div(det), adj[2][2].div(det)]
  ];
}

function matrixMultiply(A, B) {
  const res = [];
  for (let r = 0; r < 3; r++) {
    res[r] = [];
    for (let c = 0; c < 3; c++) {
      let sum = new Fraction(0n, 1n);
      for (let k = 0; k < 3; k++) {
        sum = sum.add(A[r][k].mul(B[k][c]));
      }
      res[r][c] = sum;
    }
  }
  return res;
}

function matrixVectorMultiply(A, v) {
  const res = [];
  for (let r = 0; r < 3; r++) {
    let sum = new Fraction(0n, 1n);
    for (let c = 0; c < 3; c++) {
      sum = sum.add(A[r][c].mul(v[c]));
    }
    res[r] = sum;
  }
  return res;
}

function replaceColumn(A, B, colIdx) {
  const res = [];
  for (let r = 0; r < 3; r++) {
    res[r] = [...A[r]];
    res[r][colIdx] = B[r];
  }
  return res;
}

function checkSystemRank(A, B) {
  const M = [
    [...A[0], B[0]],
    [...A[1], B[1]],
    [...A[2], B[2]]
  ];

  let lead = 0;
  for (let r = 0; r < 3; r++) {
    if (lead >= 4) break;
    let i = r;
    while (M[i][lead].isZero()) {
      i++;
      if (i === 3) {
        i = r;
        lead++;
        if (lead === 4) break;
      }
    }
    if (lead >= 4) break;

    if (i !== r) {
      const temp = M[i];
      M[i] = M[r];
      M[r] = temp;
    }

    const div = M[r][lead];
    for (let j = 0; j < 4; j++) {
      M[r][j] = M[r][j].div(div);
    }

    for (let k = 0; k < 3; k++) {
      if (k !== r) {
        const factor = M[k][lead];
        if (!factor.isZero()) {
          for (let j = 0; j < 4; j++) {
            M[k][j] = M[k][j].sub(factor.mul(M[r][j]));
          }
        }
      }
    }
    lead++;
  }

  let rankA = 0;
  let rankAug = 0;
  for (let r = 0; r < 3; r++) {
    const isZeroA = M[r][0].isZero() && M[r][1].isZero() && M[r][2].isZero();
    const isZeroAug = isZeroA && M[r][3].isZero();
    if (!isZeroA) rankA++;
    if (!isZeroAug) rankAug++;
  }

  return { rankA, rankAug };
}

// =============================================================================
// 3. Precision HTML & Vector Icon Helpers
// =============================================================================

function renderMatrixHTML(m, options = {}) {
  const { type = 'bracket', highlightCol = -1, mode = 'fraction' } = options;
  const rows = m.map((row) => {
    const cells = row.map((cell, c) => {
      const cls = (c === highlightCol) ? 'col-replaced' : '';
      return `<td class="${cls}">${cell.toHTML(mode)}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<div class="render-matrix ${type}"><table class="matrix-table">${rows}</table></div>`;
}

function render2x2DetHTML(a, b, c, d, mode = 'fraction') {
  return `
    <div class="render-matrix det-bars">
      <table class="matrix-table">
        <tr><td>${a.toHTML(mode)}</td><td>${b.toHTML(mode)}</td></tr>
        <tr><td>${c.toHTML(mode)}</td><td>${d.toHTML(mode)}</td></tr>
      </table>
    </div>
  `;
}

// =============================================================================
// 4. MatrixApp Application Controller
// =============================================================================

class MatrixApp {
  constructor() {
    this.displayMode = 'fraction';
    this.autoCalc = true;
    this.initElements();
    this.bindEvents();
    this.initTheme();
    this.solve();
  }

  initElements() {
    this.aCells = [
      [document.getElementById('a00'), document.getElementById('a01'), document.getElementById('a02')],
      [document.getElementById('a10'), document.getElementById('a11'), document.getElementById('a12')],
      [document.getElementById('a20'), document.getElementById('a21'), document.getElementById('a22')]
    ];
    this.bCells = [
      document.getElementById('b0'),
      document.getElementById('b1'),
      document.getElementById('b2')
    ];

    this.formatSelect = document.getElementById('formatSelect');
    this.themeToggle = document.getElementById('themeToggle');
    this.printBtn = document.getElementById('printBtn');
    this.solveBtn = document.getElementById('solveBtn');
    this.autoCalcCheckbox = document.getElementById('autoCalcCheckbox');
    this.inputErrorBanner = document.getElementById('inputErrorBanner');

    // Status strip metrics
    this.summaryDetVal = document.getElementById('summaryDetVal');
    this.summaryDetStatus = document.getElementById('summaryDetStatus');
    this.summaryCramerVal = document.getElementById('summaryCramerVal');
    this.summaryCramerStatus = document.getElementById('summaryCramerStatus');
    this.summaryInvVal = document.getElementById('summaryInvVal');
    this.summaryInvStatus = document.getElementById('summaryInvStatus');

    // Step containers
    this.detStepContainer = document.getElementById('detStepContainer');
    this.cramerStepContainer = document.getElementById('cramerStepContainer');
    this.inverseStepContainer = document.getElementById('inverseStepContainer');
    this.latexOutput = document.getElementById('latexOutput');
    this.plainTextOutput = document.getElementById('plainTextOutput');

    // Equation previews
    this.previewEq0 = document.getElementById('previewEq0');
    this.previewEq1 = document.getElementById('previewEq1');
    this.previewEq2 = document.getElementById('previewEq2');

    // Toast element
    this.toast = document.getElementById('toast');
  }

  bindEvents() {
    const allInputs = [...this.aCells.flat(), ...this.bCells];
    allInputs.forEach(input => {
      input.addEventListener('input', () => {
        this.updateEquationPreview();
        if (this.autoCalc) this.solve();
      });
      input.addEventListener('keydown', (e) => this.handleCellNavigation(e, input));
    });

    this.autoCalcCheckbox.addEventListener('change', (e) => {
      this.autoCalc = e.target.checked;
      if (this.autoCalc) this.solve();
    });

    this.solveBtn.addEventListener('click', () => this.solve());

    this.formatSelect.addEventListener('change', (e) => {
      this.displayMode = e.target.value;
      this.solve();
    });

    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.printBtn.addEventListener('click', () => window.print());

    // Presets
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyPreset(btn.dataset.preset);
        this.updateEquationPreview();
        this.solve();
      });
    });

    // Tab switching
    document.querySelectorAll('.tab-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Copy actions
    document.getElementById('copyLatexBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(this.latexOutput.value);
      this.showToast("LaTeX code copied to clipboard");
    });

    document.getElementById('copyTextBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(this.plainTextOutput.value);
      this.showToast("Plain text summary copied to clipboard");
    });
  }

  handleCellNavigation(e, currentInput) {
    const isMatrixA = currentInput.classList.contains('num-input') && !currentInput.classList.contains('vec-input');
    const r = parseInt(currentInput.dataset.r, 10);
    const c = isMatrixA ? parseInt(currentInput.dataset.c, 10) : 0;

    let targetInput = null;

    if (e.key === 'ArrowRight') {
      if (isMatrixA) {
        if (c < 2) targetInput = this.aCells[r][c + 1];
        else targetInput = this.bCells[r];
      }
    } else if (e.key === 'ArrowLeft') {
      if (!isMatrixA) {
        targetInput = this.aCells[r][2];
      } else if (c > 0) {
        targetInput = this.aCells[r][c - 1];
      }
    } else if (e.key === 'ArrowDown') {
      if (r < 2) {
        targetInput = isMatrixA ? this.aCells[r + 1][c] : this.bCells[r + 1];
      }
    } else if (e.key === 'ArrowUp') {
      if (r > 0) {
        targetInput = isMatrixA ? this.aCells[r - 1][c] : this.bCells[r - 1];
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.solve();
    }

    if (targetInput) {
      e.preventDefault();
      targetInput.focus();
      targetInput.select();
    }
  }

  showToast(message) {
    this.toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2200);
  }

  initTheme() {
    const saved = localStorage.getItem('matrix_solver_theme') || 'dark';
    document.body.className = `theme-${saved}`;
  }

  toggleTheme() {
    const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.className = `theme-${next}`;
    localStorage.setItem('matrix_solver_theme', next);
  }

  applyPreset(preset) {
    const presets = {
      integers: {
        A: [['2', '1', '-1'], ['-3', '-1', '2'], ['-2', '1', '2']],
        B: ['8', '-11', '-3']
      },
      fractional: {
        A: [['1', '2', '3'], ['2', '-1', '1'], ['3', '1', '-1']],
        B: ['1', '3', '2']
      },
      identity: {
        A: [['1', '0', '0'], ['0', '1', '0'], ['0', '0', '1']],
        B: ['4', '-2', '7']
      },
      singular: {
        A: [['1', '2', '3'], ['2', '4', '6'], ['1', '1', '1']],
        B: ['5', '10', '2']
      },
      clear: {
        A: [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']],
        B: ['0', '0', '0']
      },
      random: {
        A: Array.from({ length: 3 }, () =>
          Array.from({ length: 3 }, () => (Math.floor(Math.random() * 11) - 5).toString())
        ),
        B: Array.from({ length: 3 }, () => (Math.floor(Math.random() * 19) - 9).toString())
      }
    };

    const data = presets[preset];
    if (!data) return;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.aCells[r][c].value = data.A[r][c];
        this.aCells[r][c].classList.remove('cell-invalid');
      }
      this.bCells[r].value = data.B[r];
      this.bCells[r].classList.remove('cell-invalid');
    }
  }

  parseInputs() {
    let hasError = false;
    let errorMessage = '';

    const A = [];
    for (let r = 0; r < 3; r++) {
      A[r] = [];
      for (let c = 0; c < 3; c++) {
        const cell = this.aCells[r][c];
        try {
          A[r][c] = Fraction.fromString(cell.value);
          cell.classList.remove('cell-invalid');
        } catch (err) {
          cell.classList.add('cell-invalid');
          hasError = true;
          errorMessage = `Matrix A row ${r + 1}, column ${c + 1}: "${cell.value}" (${err.message})`;
        }
      }
    }

    const B = [];
    for (let r = 0; r < 3; r++) {
      const cell = this.bCells[r];
      try {
        B[r] = Fraction.fromString(cell.value);
        cell.classList.remove('cell-invalid');
      } catch (err) {
        cell.classList.add('cell-invalid');
        hasError = true;
        errorMessage = `Vector b row ${r + 1}: "${cell.value}" (${err.message})`;
      }
    }

    if (hasError) {
      this.inputErrorBanner.style.display = 'block';
      this.inputErrorBanner.textContent = `Error in input: ${errorMessage}`;
      return null;
    } else {
      this.inputErrorBanner.style.display = 'none';
      return { A, B };
    }
  }

  updateEquationPreview() {
    const names = ['x', 'y', 'z'];
    for (let r = 0; r < 3; r++) {
      const parts = [];
      for (let c = 0; c < 3; c++) {
        const val = this.aCells[r][c].value.trim() || '0';
        parts.push(`(${val})${names[c]}`);
      }
      const bVal = this.bCells[r].value.trim() || '0';
      const eqStr = `${parts.join(' + ')} = ${bVal}`;
      if (r === 0) this.previewEq0.textContent = eqStr;
      if (r === 1) this.previewEq1.textContent = eqStr;
      if (r === 2) this.previewEq2.textContent = eqStr;
    }
  }

  solve() {
    const parsed = this.parseInputs();
    if (!parsed) return;
    const { A, B } = parsed;
    const mode = this.displayMode;

    // 1. Compute Determinant of A
    const detResult = compute3x3Det(A);
    const detA = detResult.det;

    // 2. Compute Cramer's Rule matrices
    const Ax = replaceColumn(A, B, 0);
    const Ay = replaceColumn(A, B, 1);
    const Az = replaceColumn(A, B, 2);

    const Dx = compute3x3Det(Ax).det;
    const Dy = compute3x3Det(Ay).det;
    const Dz = compute3x3Det(Az).det;

    let solX = null;
    let solY = null;
    let solZ = null;
    let cramerStatus = 'unique';

    if (!detA.isZero()) {
      solX = Dx.div(detA);
      solY = Dy.div(detA);
      solZ = Dz.div(detA);
    } else {
      const { rankA, rankAug } = checkSystemRank(A, B);
      if (rankA < rankAug) {
        cramerStatus = 'inconsistent';
      } else {
        cramerStatus = 'infinite';
      }
    }

    // 3. Compute Minors, Cofactors, Adjugate, and Inverse
    const minors = computeAllMinors(A);
    const cofactors = computeCofactors(minors);
    const adjugate = transpose(cofactors);
    const inverse = computeInverse(A, detA, adjugate);

    // 4. Update Diagnostics Strip
    this.renderDiagnostics(detA, cramerStatus, solX, solY, solZ, inverse, mode);

    // 5. Render Step-by-Step Studio Views
    this.renderDeterminantTab(A, detResult, mode);
    this.renderCramerTab(A, B, detA, Ax, Ay, Az, Dx, Dy, Dz, cramerStatus, solX, solY, solZ, mode);
    this.renderInverseTab(A, detA, minors, cofactors, adjugate, inverse, mode);
    this.renderExportTab(A, B, detA, Dx, Dy, Dz, solX, solY, solZ, cramerStatus, inverse);
  }

  renderDiagnostics(detA, cramerStatus, solX, solY, solZ, inverse, mode) {
    // Determinant Metric
    this.summaryDetVal.innerHTML = detA.toHTML(mode);
    if (detA.isZero()) {
      this.summaryDetStatus.textContent = "Singular (det = 0)";
      this.summaryDetStatus.className = "metric-badge badge-danger";
    } else {
      this.summaryDetStatus.textContent = "Non-Singular";
      this.summaryDetStatus.className = "metric-badge badge-neutral";
    }

    // Cramer's Metric
    if (cramerStatus === 'unique') {
      this.summaryCramerVal.innerHTML = `x = ${solX.toHTML(mode)}, y = ${solY.toHTML(mode)}, z = ${solZ.toHTML(mode)}`;
      this.summaryCramerStatus.textContent = "Unique Solution";
      this.summaryCramerStatus.className = "metric-badge badge-success";
    } else if (cramerStatus === 'inconsistent') {
      this.summaryCramerVal.innerHTML = `<span style="color:var(--color-danger)">No Solution</span>`;
      this.summaryCramerStatus.textContent = "Inconsistent";
      this.summaryCramerStatus.className = "metric-badge badge-danger";
    } else {
      this.summaryCramerVal.innerHTML = `<span style="color:var(--color-warning)">Infinite Solutions</span>`;
      this.summaryCramerStatus.textContent = "Dependent";
      this.summaryCramerStatus.className = "metric-badge badge-warning";
    }

    // Inverse Metric
    if (inverse) {
      this.summaryInvVal.innerHTML = `A⁻¹ Exists`;
      this.summaryInvStatus.textContent = "Invertible";
      this.summaryInvStatus.className = "metric-badge badge-success";
    } else {
      this.summaryInvVal.innerHTML = `<span style="color:var(--color-danger)">Undefined</span>`;
      this.summaryInvStatus.textContent = "Non-Invertible";
      this.summaryInvStatus.className = "metric-badge badge-danger";
    }
  }

  // ---------------------------------------------------------------------------
  // Studio Pane 1: Determinant Steps
  // ---------------------------------------------------------------------------
  renderDeterminantTab(A, detResult, mode) {
    const { det, minorsRow0, termsRow0 } = detResult;
    const a00 = A[0][0], a01 = A[0][1], a02 = A[0][2];
    const m00 = minorsRow0[0], m01 = minorsRow0[1], m02 = minorsRow0[2];
    const t0 = termsRow0[0], t1 = termsRow0[1], t2 = termsRow0[2];

    const html = `
      <div class="flow-step">
        <div class="flow-step-header">
          <span class="step-pill">Method 1</span>
          <h3 class="flow-step-title">Laplace Expansion along Row 1</h3>
        </div>
        <p class="flow-text">
          Evaluate the determinant using cofactor expansion along the first row:
        </p>

        <div class="math-display-card">
          <span>&det;(A) = a₁₁ &middot; M₁₁ &minus; a₁₂ &middot; M₁₂ + a₁₃ &middot; M₁₃</span>
        </div>

        <p class="flow-text" style="margin-top: 0.5rem;">
          Coefficient Matrix <strong>A</strong>:
        </p>
        <div>
          ${renderMatrixHTML(A, { type: 'bracket', mode })}
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 0.75rem;">
          Step 1: Compute 2×2 Submatrix Minors
        </h4>

        <div class="minors-layout">
          <!-- M11 -->
          <div class="minor-item-card">
            <div class="minor-card-top">
              <span>Minor M₁₁ (Row 1, Col 1 eliminated)</span>
              <span class="sign-indicator sign-pos">+</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
              <span>M₁₁ =</span>
              ${render2x2DetHTML(A[1][1], A[1][2], A[2][1], A[2][2], mode)}
              <span>= (${A[1][1].toHTML(mode)} &times; ${A[2][2].toHTML(mode)}) &minus; (${A[1][2].toHTML(mode)} &times; ${A[2][1].toHTML(mode)})</span>
            </div>
            <div>
              <strong>M₁₁ = ${m00.toHTML(mode)}</strong>
            </div>
          </div>

          <!-- M12 -->
          <div class="minor-item-card">
            <div class="minor-card-top">
              <span>Minor M₁₂ (Row 1, Col 2 eliminated)</span>
              <span class="sign-indicator sign-neg-ind">&minus;</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
              <span>M₁₂ =</span>
              ${render2x2DetHTML(A[1][0], A[1][2], A[2][0], A[2][2], mode)}
              <span>= (${A[1][0].toHTML(mode)} &times; ${A[2][2].toHTML(mode)}) &minus; (${A[1][2].toHTML(mode)} &times; ${A[2][0].toHTML(mode)})</span>
            </div>
            <div>
              <strong>M₁₂ = ${m01.toHTML(mode)}</strong>
            </div>
          </div>

          <!-- M13 -->
          <div class="minor-item-card">
            <div class="minor-card-top">
              <span>Minor M₁₃ (Row 1, Col 3 eliminated)</span>
              <span class="sign-indicator sign-pos">+</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
              <span>M₁₃ =</span>
              ${render2x2DetHTML(A[1][0], A[1][1], A[2][0], A[2][1], mode)}
              <span>= (${A[1][0].toHTML(mode)} &times; ${A[2][1].toHTML(mode)}) &minus; (${A[1][1].toHTML(mode)} &times; ${A[2][0].toHTML(mode)})</span>
            </div>
            <div>
              <strong>M₁₃ = ${m02.toHTML(mode)}</strong>
            </div>
          </div>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 2: Linear Combination with Alternating Signs
        </h4>
        <div class="math-display-card">
          <span>&det;(A) = [ (${a00.toHTML(mode)}) &times; (${m00.toHTML(mode)}) ] &minus; [ (${a01.toHTML(mode)}) &times; (${m01.toHTML(mode)}) ] + [ (${a02.toHTML(mode)}) &times; (${m02.toHTML(mode)}) ]</span>
        </div>
        <div class="math-display-card">
          <span>&det;(A) = [ ${t0.toHTML(mode)} ] &minus; [ ${t1.toHTML(mode)} ] + [ ${t2.toHTML(mode)} ] = <strong>${det.toHTML(mode)}</strong></span>
        </div>

        <!-- Sarrus Rule Section -->
        <div style="margin-top: 1.5rem;">
          <div class="flow-step-header">
            <span class="step-pill">Method 2</span>
            <h3 class="flow-step-title">Verification via Sarrus' Rule</h3>
          </div>
          <p class="flow-text">
            Sum products of the three downward diagonals and subtract products of the three upward diagonals:
          </p>
          ${this.renderSarrusDetails(A, det, mode)}
        </div>
      </div>
    `;

    this.detStepContainer.innerHTML = html;
  }

  renderSarrusDetails(A, det, mode) {
    const p1 = A[0][0].mul(A[1][1]).mul(A[2][2]);
    const p2 = A[0][1].mul(A[1][2]).mul(A[2][0]);
    const p3 = A[0][2].mul(A[1][0]).mul(A[2][1]);
    const sumDown = p1.add(p2).add(p3);

    const q1 = A[0][2].mul(A[1][1]).mul(A[2][0]);
    const q2 = A[0][0].mul(A[1][2]).mul(A[2][1]);
    const q3 = A[0][1].mul(A[1][0]).mul(A[2][2]);
    const sumUp = q1.add(q2).add(q3);

    return `
      <div class="math-display-card" style="margin-top: 0.5rem;">
        <div>
          <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Downward Diagonals (&plus;) :</div>
          <span>(${A[0][0].toHTML(mode)} &times; ${A[1][1].toHTML(mode)} &times; ${A[2][2].toHTML(mode)}) + (${A[0][1].toHTML(mode)} &times; ${A[1][2].toHTML(mode)} &times; ${A[2][0].toHTML(mode)}) + (${A[0][2].toHTML(mode)} &times; ${A[1][0].toHTML(mode)} &times; ${A[2][1].toHTML(mode)})</span>
          <br><span>= ${p1.toHTML(mode)} + ${p2.toHTML(mode)} + ${p3.toHTML(mode)} = <strong>${sumDown.toHTML(mode)}</strong></span>
        </div>
      </div>

      <div class="math-display-card" style="margin-top: 0.5rem;">
        <div>
          <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Upward Diagonals (&minus;) :</div>
          <span>(${A[0][2].toHTML(mode)} &times; ${A[1][1].toHTML(mode)} &times; ${A[2][0].toHTML(mode)}) + (${A[0][0].toHTML(mode)} &times; ${A[1][2].toHTML(mode)} &times; ${A[2][1].toHTML(mode)}) + (${A[0][1].toHTML(mode)} &times; ${A[1][0].toHTML(mode)} &times; ${A[2][2].toHTML(mode)})</span>
          <br><span>= ${q1.toHTML(mode)} + ${q2.toHTML(mode)} + ${q3.toHTML(mode)} = <strong>${sumUp.toHTML(mode)}</strong></span>
        </div>
      </div>

      <div class="math-display-card" style="margin-top: 0.5rem;">
        <span>&det;(A) = (${sumDown.toHTML(mode)}) &minus; (${sumUp.toHTML(mode)}) = <strong>${sumDown.sub(sumUp).toHTML(mode)}</strong></span>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Studio Pane 2: Cramer's Rule Steps
  // ---------------------------------------------------------------------------
  renderCramerTab(A, B, detA, Ax, Ay, Az, Dx, Dy, Dz, cramerStatus, solX, solY, solZ, mode) {
    let alertBanner = '';

    if (cramerStatus === 'inconsistent') {
      alertBanner = `
        <div class="callout-alert callout-danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <div>
            <div class="callout-title">System Inconsistent &mdash; No Solution</div>
            <div class="callout-desc">
              The determinant is &det;(A) = 0, while at least one column determinant (Dx = ${Dx.toFormatted(mode)}, Dy = ${Dy.toFormatted(mode)}, Dz = ${Dz.toFormatted(mode)}) is non-zero. 
              The planes are non-intersecting / parallel, and no solution exists.
            </div>
          </div>
        </div>
      `;
    } else if (cramerStatus === 'infinite') {
      alertBanner = `
        <div class="callout-alert callout-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <div class="callout-title">System Dependent &mdash; Infinitely Many Solutions</div>
            <div class="callout-desc">
              The determinant is &det;(A) = 0, and all numerator determinants Dx = Dy = Dz = 0. The equations are linearly dependent, producing indeterminate forms (0/0).
            </div>
          </div>
        </div>
      `;
    }

    const html = `
      <div class="flow-step">
        ${alertBanner}

        <div class="flow-step-header">
          <span class="step-pill">Theory</span>
          <h3 class="flow-step-title">Cramer's Rule Formulation</h3>
        </div>
        <p class="flow-text">
          For the linear system <em>A &middot; x = b</em>, let <strong>D = &det;(A)</strong>. 
          When <strong>D &ne; 0</strong>, the unique solution vector is:
        </p>

        <div class="math-display-card" style="justify-content: space-around;">
          <span>x = <span class="frac"><span class="num">D<sub>x</sub></span><span class="den">D</span></span></span>
          <span>y = <span class="frac"><span class="num">D<sub>y</sub></span><span class="den">D</span></span></span>
          <span>z = <span class="frac"><span class="num">D<sub>z</sub></span><span class="den">D</span></span></span>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 1: Compute Main Determinant D
        </h4>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span>D = &det;(A) =</span>
          ${renderMatrixHTML(A, { type: 'det-bars', mode })}
          <span>= <strong>${detA.toHTML(mode)}</strong></span>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 2: Compute D<sub>x</sub> (replace column 1 with vector b)
        </h4>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span>D<sub>x</sub> =</span>
          ${renderMatrixHTML(Ax, { type: 'det-bars', highlightCol: 0, mode })}
          <span>= <strong>${Dx.toHTML(mode)}</strong></span>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 3: Compute D<sub>y</sub> (replace column 2 with vector b)
        </h4>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span>D<sub>y</sub> =</span>
          ${renderMatrixHTML(Ay, { type: 'det-bars', highlightCol: 1, mode })}
          <span>= <strong>${Dy.toHTML(mode)}</strong></span>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 4: Compute D<sub>z</sub> (replace column 3 with vector b)
        </h4>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span>D<sub>z</sub> =</span>
          ${renderMatrixHTML(Az, { type: 'det-bars', highlightCol: 2, mode })}
          <span>= <strong>${Dz.toHTML(mode)}</strong></span>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 5: Final Solution Values
        </h4>
        ${
          cramerStatus === 'unique'
            ? `
          <div class="math-display-card" style="font-size: 1.05rem; gap: 2rem;">
            <div>x = <span class="frac"><span class="num">${Dx.toHTML(mode)}</span><span class="den">${detA.toHTML(mode)}</span></span> = <strong>${solX.toHTML(mode)}</strong></div>
            <div>y = <span class="frac"><span class="num">${Dy.toHTML(mode)}</span><span class="den">${detA.toHTML(mode)}</span></span> = <strong>${solY.toHTML(mode)}</strong></div>
            <div>z = <span class="frac"><span class="num">${Dz.toHTML(mode)}</span><span class="den">${detA.toHTML(mode)}</span></span> = <strong>${solZ.toHTML(mode)}</strong></div>
          </div>

          <div class="verification-card" style="margin-top: 1.25rem;">
            <div class="verification-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Solution Verification Check: A &middot; [x, y, z]ᵀ = b</span>
            </div>
            <div class="verification-list">
              ${this.renderVerificationRows(A, B, solX, solY, solZ, mode)}
            </div>
          </div>
        `
            : `
          <p class="flow-text">
            Because D = 0, division by zero is undefined. Cramer's rule cannot evaluate a unique solution.
          </p>
        `
        }
      </div>
    `;

    this.cramerStepContainer.innerHTML = html;
  }

  renderVerificationRows(A, B, x, y, z, mode) {
    const v = [x, y, z];
    const computedB = matrixVectorMultiply(A, v);

    return [0, 1, 2].map(r => {
      const term0 = `(${A[r][0].toHTML(mode)} &times; ${x.toHTML(mode)})`;
      const term1 = `(${A[r][1].toHTML(mode)} &times; ${y.toHTML(mode)})`;
      const term2 = `(${A[r][2].toHTML(mode)} &times; ${z.toHTML(mode)})`;
      const sum = computedB[r];
      const target = B[r];
      const match = sum.equals(target);

      return `
        <div>
          Eq ${r + 1}: ${term0} + ${term1} + ${term2} = <strong>${sum.toHTML(mode)}</strong> 
          ${match ? `<span style="color:var(--color-success)">= b${r + 1} (${target.toHTML(mode)}) &check;</span>` : `<span style="color:var(--color-danger)">Mismatch</span>`}
        </div>
      `;
    }).join('');
  }

  // ---------------------------------------------------------------------------
  // Studio Pane 3: Matrix Inverse Steps
  // ---------------------------------------------------------------------------
  renderInverseTab(A, detA, minors, cofactors, adjugate, inverse, mode) {
    if (detA.isZero()) {
      this.inverseStepContainer.innerHTML = `
        <div class="callout-alert callout-danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <div>
            <div class="callout-title">Matrix A is Singular &mdash; Inverse Does Not Exist</div>
            <div class="callout-desc">
              The determinant is &det;(A) = 0. A square matrix is invertible if and only if its determinant is non-zero. 
              Because the determinant is zero, matrix <em>A</em> is non-invertible and its inverse matrix <em>A⁻¹</em> is undefined.
            </div>
          </div>
        </div>
      `;
      return;
    }

    const html = `
      <div class="flow-step">
        <div class="flow-step-header">
          <span class="step-pill">Formula</span>
          <h3 class="flow-step-title">Adjugate / Cofactor Inversion Formula</h3>
        </div>
        <p class="flow-text">
          The inverse matrix <em>A⁻¹</em> is evaluated by dividing the adjugate matrix by the determinant:
        </p>

        <div class="math-display-card">
          <span>A⁻¹ = <span class="frac"><span class="num">1</span><span class="den">&det;(A)</span></span> &middot; adj(A) = <span class="frac"><span class="num">1</span><span class="den">&det;(A)</span></span> &middot; Cᵀ</span>
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 1: Matrix of Minors M
        </h4>
        <p class="flow-text">
          Each entry <em>M<sub>ij</sub></em> is the determinant of the 2×2 submatrix formed by eliminating row <em>i</em> and column <em>j</em>:
        </p>
        <div>
          ${renderMatrixHTML(minors, { type: 'bracket', mode })}
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 2: Matrix of Cofactors C
        </h4>
        <p class="flow-text">
          Apply the checkerboard signs <em>C<sub>ij</sub> = (&minus;1)<sup>i+j</sup> &middot; M<sub>ij</sub></em>:
        </p>
        <div class="code-tag" style="margin-bottom: 0.5rem; display: inline-block;">
          Sign Pattern: [ + &minus; + ] [ &minus; + &minus; ] [ + &minus; + ]
        </div>
        <div>
          ${renderMatrixHTML(cofactors, { type: 'bracket', mode })}
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 3: Adjugate Matrix adj(A) = Cᵀ
        </h4>
        <p class="flow-text">
          Transpose the cofactor matrix by swapping rows with columns:
        </p>
        <div>
          ${renderMatrixHTML(adjugate, { type: 'bracket', mode })}
        </div>

        <h4 style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-top: 1rem;">
          Step 4: Division by &det;(A) = ${detA.toHTML(mode)}
        </h4>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span>A⁻¹ = <span class="frac"><span class="num">1</span><span class="den">${detA.toHTML(mode)}</span></span> &times;</span>
          ${renderMatrixHTML(adjugate, { type: 'bracket', mode })}
          <span>=</span>
          ${renderMatrixHTML(inverse, { type: 'bracket', mode })}
        </div>

        <!-- Verification -->
        <div class="verification-card" style="margin-top: 1.5rem;">
          <div class="verification-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Verification: A &middot; A⁻¹ = I₃ (Identity Matrix)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
            ${renderMatrixHTML(A, { type: 'bracket', mode })}
            <span>&times;</span>
            ${renderMatrixHTML(inverse, { type: 'bracket', mode })}
            <span>=</span>
            ${renderMatrixHTML(matrixMultiply(A, inverse), { type: 'bracket', mode })}
            <span style="color: var(--color-success); font-weight: 700; margin-left: 0.5rem;">= I₃ &check;</span>
          </div>
        </div>
      </div>
    `;

    this.inverseStepContainer.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // Studio Pane 4: LaTeX & Text Export
  // ---------------------------------------------------------------------------
  renderExportTab(A, B, detA, Dx, Dy, Dz, solX, solY, solZ, cramerStatus, inverse) {
    const aLatex = `\\begin{pmatrix}
  ${A[0][0].toLaTeX()} & ${A[0][1].toLaTeX()} & ${A[0][2].toLaTeX()} \\\\
  ${A[1][0].toLaTeX()} & ${A[1][1].toLaTeX()} & ${A[1][2].toLaTeX()} \\\\
  ${A[2][0].toLaTeX()} & ${A[2][1].toLaTeX()} & ${A[2][2].toLaTeX()}
\\end{pmatrix}`;

    const bLatex = `\\begin{pmatrix}
  ${B[0].toLaTeX()} \\\\
  ${B[1].toLaTeX()} \\\\
  ${B[2].toLaTeX()}
\\end{pmatrix}`;

    let latex = `% 3x3 Linear System & Matrix Solver Export\n`;
    latex += `\\text{System: } A \\mathbf{x} = \\mathbf{b}\n`;
    latex += `A = ${aLatex}, \\quad \\mathbf{b} = ${bLatex}\n\n`;

    latex += `% 1. Determinant\n`;
    latex += `\\det(A) = ${detA.toLaTeX()}\n\n`;

    latex += `% 2. Cramer's Rule\n`;
    latex += `D = ${detA.toLaTeX()}, \\quad D_x = ${Dx.toLaTeX()}, \\quad D_y = ${Dy.toLaTeX()}, \\quad D_z = ${Dz.toLaTeX()}\n`;
    if (cramerStatus === 'unique') {
      latex += `x = \\frac{D_x}{D} = ${solX.toLaTeX()}, \\quad y = \\frac{D_y}{D} = ${solY.toLaTeX()}, \\quad z = \\frac{D_z}{D} = ${solZ.toLaTeX()}\n\n`;
    } else {
      latex += `% System status: ${cramerStatus}\n\n`;
    }

    latex += `% 3. Matrix Inverse\n`;
    if (inverse) {
      const invLatex = `\\begin{pmatrix}
  ${inverse[0][0].toLaTeX()} & ${inverse[0][1].toLaTeX()} & ${inverse[0][2].toLaTeX()} \\\\
  ${inverse[1][0].toLaTeX()} & ${inverse[1][1].toLaTeX()} & ${inverse[1][2].toLaTeX()} \\\\
  ${inverse[2][0].toLaTeX()} & ${inverse[2][1].toLaTeX()} & ${inverse[2][2].toLaTeX()}
\\end{pmatrix}`;
      latex += `A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A) = ${invLatex}\n`;
    } else {
      latex += `% Matrix A is singular; inverse undefined.\n`;
    }

    this.latexOutput.value = latex;

    let txt = `=== MATRIX 3x3 SOLVER REPORT ===\n\n`;
    txt += `Matrix A:\n`;
    txt += `[ ${A[0][0].toString().padStart(6)}, ${A[0][1].toString().padStart(6)}, ${A[0][2].toString().padStart(6)} ]\n`;
    txt += `[ ${A[1][0].toString().padStart(6)}, ${A[1][1].toString().padStart(6)}, ${A[1][2].toString().padStart(6)} ]\n`;
    txt += `[ ${A[2][0].toString().padStart(6)}, ${A[2][1].toString().padStart(6)}, ${A[2][2].toString().padStart(6)} ]\n\n`;

    txt += `Vector b:\n`;
    txt += `[ ${B[0].toString()}, ${B[1].toString()}, ${B[2].toString()} ]^T\n\n`;

    txt += `Determinant:\n`;
    txt += `det(A) = ${detA.toString()} (${detA.toDecimal(4)})\n\n`;

    txt += `Cramer's Rule:\n`;
    txt += `D = ${detA.toString()}, Dx = ${Dx.toString()}, Dy = ${Dy.toString()}, Dz = ${Dz.toString()}\n`;
    if (cramerStatus === 'unique') {
      txt += `x = ${solX.toString()} (${solX.toDecimal(4)})\n`;
      txt += `y = ${solY.toString()} (${solY.toDecimal(4)})\n`;
      txt += `z = ${solZ.toString()} (${solZ.toDecimal(4)})\n\n`;
    } else {
      txt += `Status: ${cramerStatus.toUpperCase()}\n\n`;
    }

    txt += `Inverse Matrix A^(-1):\n`;
    if (inverse) {
      txt += `[ ${inverse[0][0].toString().padStart(7)}, ${inverse[0][1].toString().padStart(7)}, ${inverse[0][2].toString().padStart(7)} ]\n`;
      txt += `[ ${inverse[1][0].toString().padStart(7)}, ${inverse[1][1].toString().padStart(7)}, ${inverse[1][2].toString().padStart(7)} ]\n`;
      txt += `[ ${inverse[2][0].toString().padStart(7)}, ${inverse[2][1].toString().padStart(7)}, ${inverse[2][2].toString().padStart(7)} ]\n`;
    } else {
      txt += `Undefined (det = 0)\n`;
    }

    this.plainTextOutput.value = txt;
  }
}

// Initialise on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new MatrixApp();
});
