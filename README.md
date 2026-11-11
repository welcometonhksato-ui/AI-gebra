# MatrixLab &bull; 3×3 Linear Algebra Workbench (YouTube Dark Theme)

A high-precision, responsive scientific workbench for computing the determinant of a 3×3 matrix, solving 3×3 linear systems via **Cramer's Rule**, and calculating the **Matrix Inverse** ($A^{-1}$) with exact step-by-step arithmetic.

Styled using YouTube's official Dark Theme palette (`#0F0F0F`, `#212121`, `#3F3F3F`, `#FF0000`, `#3EA6FF`, `#F1F1F1`) and the design intelligence from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

---

## Directory Structure

```
matrix_solver/
├── index.html     # Semantic, accessible HTML5 layout & equation studio
├── style.css      # YouTube Dark Theme stylesheet, pill buttons, mathematical brackets
├── script.js      # Exact BigInt rational arithmetic engine, Cramer's solver, & UI logic
└── README.md      # Documentation, formulas, and usage guide
```

---

## Design System & YouTube Dark Theme Specifications

* **YouTube Dark Theme Tokens**:
  - **Canvas Background**: `#0F0F0F` (True YouTube dark mode canvas)
  - **Surface / Cards**: `#212121` (Container cards & dialogs)
  - **Hover Surface**: `#272727`
  - **Raised / Elevated**: `#282828`
  - **Sunken Headers & Previews**: `#181818`
  - **Filter Chips & Presets**: `rgba(255, 255, 255, 0.1)` with hover `rgba(255, 255, 255, 0.2)`
  - **Brand Red Primary Button**: `#FF0000` (Hover: `#CC0000`, Active: `#990000`)
  - **Active Blue Links & Focus Rings**: `#3EA6FF` (Focus outline: `2px solid #3EA6FF`)
  - **Text Colors**: Primary `#F1F1F1`, Secondary `#AAAAAA`, Muted `#717171`
  - **Feedback**: YouTube Success Green (`#2BA640`), Warning Amber (`#F59E0B`), Danger Red (`#FF4E45`)
* **YouTube Pill Geometry**:
  - Filter chips, Solve button, copy buttons, and status badges styled with rounded pill geometry (`border-radius: 9999px`).
  - Active navigation tab styled with YouTube's signature red underline.
* **Exact Rational Arithmetic**:
  - `Fraction` class backed by `BigInt` eliminates all floating-point roundoff issues (e.g., $0.1 + 0.2 \ne 0.3$).
  - Full support for integers (`-4`), fractions (`3/4`), mixed numbers (`2 1/3`), and decimals (`0.375`).
  - Toggle between **Exact Fractions** and **Decimals (2, 4, or 6 places)** instantly.
* **Mathematical Methods**:
  - **Determinant**: Evaluated via Laplace Expansion along Row 1 and verified via Sarrus' Rule diagonal sums.
  - **Cramer's Rule**: Evaluates $D, D_x, D_y, D_z$ with the substituted column highlighted in the UI. Distinguishes inconsistent (no solution) from dependent systems (infinitely many solutions).
  - **Matrix Inverse**: Full matrix of minors $M$, cofactor checkerboard signs $C$, adjugate transpose $\text{adj}(A) = C^T$, and $A^{-1} = \frac{1}{\det(A)}\text{adj}(A)$. Proves $A \times A^{-1} = I_3$.
* **Keyboard-First Ergonomics**:
  - Seamless navigation between matrix and vector cells via Arrow keys (<kbd>&larr;</kbd> <kbd>&rarr;</kbd> <kbd>&uarr;</kbd> <kbd>&darr;</kbd>) and <kbd>Tab</kbd>.
  - Instant recalculation on <kbd>Enter</kbd> or live solve toggle.

---

## How to Run

Open [`index.html`](file:///c:/Users/Admin/Antigravity/GEMINI%20CHAT/matrix_solver/index.html) in any web browser. It is fully self-contained, runs offline, and requires no build tools or package managers.
