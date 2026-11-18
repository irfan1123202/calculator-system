# WaterFlow – Water Management System Calculator (calculator-system)

> **Professional Hydraulic Engineering & Educational Pipe Network Analysis Suite**  
> Developed for civil engineering students, professors, and hydraulic practitioners to calculate water distribution networks using the **Hardy Cross Method** and **Equivalent Pipe Method** (Series & Parallel).

---

## 🌊 Table of Contents

- [1. Overview](#1-overview)
- [2. Key Features](#2-key-features)
- [3. Hydraulic Calculation Methods & Formulas](#3-hydraulic-calculation-methods--formulas)
  - [A. Hardy Cross Method](#a-hardy-cross-method)
  - [B. Equivalent Pipe Method – Series](#b-equivalent-pipe-method--series)
  - [C. Equivalent Pipe Method – Parallel](#c-equivalent-pipe-method--parallel)
- [4. Project Structure](#4-project-structure)
- [5. Installation & Local Development](#5-installation--local-development)
- [6. Build & Deployment to Vercel](#6-build--deployment-to-vercel)
- [7. Verified Test Benchmarks & Expected Results](#7-verified-test-benchmarks--expected-results)
- [8. Educational Features](#8-educational-features)
- [9. License](#9-license)

---

## 1. Overview

**WaterFlow** is a modern, responsive, client-side web application designed to solve and visualize water distribution pipe networks. It eliminates black-box mystery by providing **step-by-step iteration logs**, **mathematical substitutions**, **interactive SVG network schematics**, and **engineering charts**.

Calculations run 100% in the browser with zero backend or external database required, guaranteeing instant performance and offline capability.

---

## 2. Key Features

- **Hardy Cross Looped Network Solver**:
  - Dynamically configure loops ($1$ to $5$ loops) and pipe rows.
  - Choose between **Darcy-Weisbach** ($n = 2.0$) and **Hazen-Williams** ($n = 1.852$) equations.
  - Support for exact analytical SI resistance $K = \frac{8 f L}{\pi^2 g D^5}$ or textbook formulation $K = \frac{f L}{12.1 D^5}$.
  - Robust handling of zero flow stagnation without divide-by-zero errors.
  - Iteration table with algebraic head loss ($\Sigma h$), derivative terms ($\Sigma \frac{n \cdot h}{Q}$), and flow corrections ($\Delta Q$).
  - Interactive SVG network diagram with auto-oriented flow direction arrows, diameter-scaled lines, and hover inspector.
  - Chart.js flow distribution, head loss, and logarithmic convergence line charts.
- **Equivalent Pipe Calculator**:
  - **Pipes in Series**: Dupuit's equation $\frac{L_e}{D_e^5} = \Sigma \left(\frac{L_i}{D_i^5}\right)$, solving for either equivalent diameter $D_e$ or equivalent length $L_e$.
  - **Pipes in Parallel**: Equivalent resistance coefficient $K_e = \left[\Sigma \left(\frac{1}{\sqrt{K_i}}\right)\right]^{-2}$, individual branch discharge apportionment, and verification of common head loss.
- **Export & Reporting**:
  - RFC 4180 compliant CSV export for pipe balance results and complete iteration history tables.
  - Print-friendly layout (`@media print`) designed for generating assignment calculation sheets and engineering reports.
- **Modern Water Engineering Aesthetic**:
  - Designed with modern water blues, cyans, crisp slate cards, Plus Jakarta Sans typography, and JetBrains Mono for engineering figures.

---

## 3. Hydraulic Calculation Methods & Formulas

### A. Hardy Cross Method

Traversing around any closed loop must satisfy Conservation of Energy (Kirchhoff's Second Law):
$$\sum_{i \in \text{Loop } k} h_i = 0$$

Where head loss $h$ in each pipe is expressed as:
$$h_i = \text{sign}(Q_i) \cdot K_i \cdot |Q_i|^n$$

Applying a first-order Taylor series expansion about the guessed flow rate $Q_i$:
$$h(Q_i + \Delta Q) \approx h(Q_i) + \Delta Q \cdot \frac{dh_i}{dQ_i} = 0$$

Solving for the loop flow correction $\Delta Q$:
$$\Delta Q = -\frac{\sum h_i}{\sum \left( \frac{dh_i}{dQ_i} \right)} = -\frac{\sum h_i}{\sum \left( n \cdot K_i \cdot |Q_i|^{n-1} \right)} = -\frac{\sum h_i}{\sum \left( n \cdot \frac{|h_i|}{|Q_i|} \right)}$$

#### Equations Supported:
1. **Darcy-Weisbach** ($n = 2.0$):
   $$K = \frac{8 f L}{\pi^2 g D^5} \approx \frac{0.082627 f L}{D^5} \quad \text{or} \quad K = \frac{f L}{12.1 D^5}$$
2. **Hazen-Williams** ($n = 1.852$):
   $$K = \frac{10.67 L}{C^{1.852} D^{4.87}}$$

#### Common (Shared) Branch Updating:
For a pipe common to Loop 1 and Loop 2 with clockwise positive reference (+1):
$$Q_{\text{common}}^{(m+1)} = Q_{\text{common}}^{(m)} + \Delta Q_1 \cdot \text{dir}_1 + \Delta Q_2 \cdot \text{dir}_2$$

---

### B. Equivalent Pipe Method – Series

For pipes connected end-to-end carrying identical discharge $Q$:
$$Q_1 = Q_2 = \dots = Q$$
$$H_{\text{total}} = \sum_{i=1}^m h_i = Q^2 \sum_{i=1}^m K_i = K_e Q^2 \implies K_e = \sum_{i=1}^m K_i$$

Under Dupuit’s equation (assuming uniform Darcy friction factor $f$):
$$\frac{L_e}{D_e^5} = \sum_{i=1}^m \frac{L_i}{D_i^5} \implies D_e = \left( \frac{L_e}{\sum \frac{L_i}{D_i^5}} \right)^{0.2}$$

---

### C. Equivalent Pipe Method – Parallel

For pipes connected between common junction manifolds, head loss is identical:
$$h_1 = h_2 = \dots = h_{\text{total}} = h$$
$$Q_{\text{total}} = \sum_{i=1}^m Q_i = \sum_{i=1}^m \left(\frac{h}{K_i}\right)^{1/n} = h^{1/n} \sum_{i=1}^m \frac{1}{K_i^{1/n}}$$

Equivalent resistance $K_e$:
$$\frac{1}{K_e^{1/n}} = \sum_{i=1}^m \frac{1}{K_i^{1/n}} \implies K_e = \left( \sum_{i=1}^m K_i^{-1/n} \right)^{-n}$$

For Darcy-Weisbach ($n = 2$):
$$\frac{1}{\sqrt{K_e}} = \sum_{i=1}^m \frac{1}{\sqrt{K_i}} \implies K_e = \left( \sum_{i=1}^m \frac{1}{\sqrt{K_i}} \right)^{-2}$$

Branch flow apportionment:
$$Q_i = Q_{\text{total}} \cdot \frac{K_i^{-1/n}}{\sum_{j=1}^m K_j^{-1/n}}$$

---

## 4. Project Structure

```text
watterflow/
├── public/                 # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── HardyCross/
│   │   │   ├── HardyCrossCalculator.jsx   # Looped network solver container
│   │   │   ├── NetworkDiagram.jsx        # Interactive SVG vector schematic
│   │   │   ├── PipeInputTable.jsx        # Dynamic inventory & loop directions
│   │   │   ├── IterationTable.jsx        # Full step-by-step iteration logs
│   │   │   ├── ResultsDashboard.jsx      # Metrics, balanced table & Chart.js charts
│   │   │   └── StepByStepFormulas.jsx    # Mathematical Taylor expansion breakdown
│   │   ├── EquivalentPipe/
│   │   │   ├── EquivalentPipeCalculator.jsx # Series/Parallel master view
│   │   │   ├── SeriesCalculator.jsx         # Dupuit series calculation
│   │   │   ├── ParallelCalculator.jsx       # Parallel manifold calculation
│   │   │   └── EquivalentDiagram.jsx        # SVG cross-section & manifold schematic
│   │   ├── Theory/
│   │   │   ├── TheorySection.jsx         # Mathematical derivations & physics
│   │   │   ├── WorkedExamples.jsx        # Hand-worked textbook problems
│   │   │   └── HelpSection.jsx           # User guide & sign conventions
│   │   ├── Home/
│   │   │   └── HomeView.jsx              # Landing page with stats & cards
│   │   ├── AboutModal.jsx                # Software specifications dialog
│   │   ├── Navbar.jsx                    # Navigation & unit toggles
│   │   └── Footer.jsx                    # Documentation links & credits
│   ├── engine/
│   │   ├── hardyCrossSolver.js           # Pure hydraulic Hardy Cross engine
│   │   ├── equivalentPipeSolver.js       # Series & Parallel equivalent engines
│   │   ├── presets.js                    # Verified textbook benchmark scenarios
│   │   ├── unitConversions.js            # SI to L/s, m³/s & formatting helpers
│   │   └── csvExport.js                  # RFC 4180 CSV export utilities
│   ├── App.jsx                           # Root layout coordinator
│   ├── main.jsx                          # React 19 entry point
│   └── index.css                         # Hydraulic theme, typography & print CSS
├── index.html                            # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                          # Dependencies: react, chart.js, react-chartjs-2, lucide-react
├── vite.config.js                        # Vite bundler configuration
└── README.md                             # Documentation & user guide
```

---

## 5. Installation & Local Development

### Prerequisites
- Node.js (v18 or higher, recommended v20+)
- npm (v9 or higher)

### Setup Steps

1. **Clone or Navigate to the Project Directory**:
   ```bash
   cd watterflow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## 6. Build & Deployment to Vercel

### Step 1: Validate Production Build Locally
Verify the bundle compiles cleanly:
```bash
npm run build
```
The optimized bundle will be generated in `dist/`.

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI
1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```
2. Run deployment from the project directory:
   ```bash
   vercel
   ```
3. Follow the CLI prompts:
   - **Set up and deploy?** Yes (`Y`)
   - **Which scope?** Select your Vercel account
   - **Link to existing project?** No (`N`)
   - **Project name?** `waterflow-calculator`
   - **Directory located?** `./`
   - **Want to modify settings?** No (`N`)
4. To deploy to production:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via GitHub + Vercel Dashboard
1. Initialize a Git repository and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: WaterFlow Hydraulic Calculator"
   git remote add origin https://github.com/your-username/waterflow.git
   git push -u origin main
   ```
2. Log into [vercel.com](https://vercel.com).
3. Click **"Add New Project"** and import your `waterflow` repository.
4. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**. Your live URL will be ready in under 30 seconds!

---

## 7. Verified Test Benchmarks & Expected Results

### Benchmark 1: Classic Two-Loop 7-Pipe Network
- **Equation**: Darcy-Weisbach ($K = \frac{f L}{12.1 D^5}$)
- **Inflow**: Node A ($100 \text{ L/s} = 0.100 \text{ m}^3/\text{s}$)
- **Outflows**: B ($20 \text{ L/s}$), C ($40 \text{ L/s}$), D ($10 \text{ L/s}$), E ($15 \text{ L/s}$), F ($15 \text{ L/s}$)
- **Expected Convergence**:
  - Reaches tolerance ($\epsilon < 0.0001$) within **3 to 4 iterations**.
  - Final balanced flows satisfy $\Sigma Q = 0$ at all 6 junctions and loop head loss $\Sigma h \approx 0.000 \text{ m}$.

### Benchmark 2: Three-Segment Series Transmission Main
- **Pipes**:
  - $L_1 = 400 \text{ m}, D_1 = 0.30 \text{ m}, f_1 = 0.02 \implies \frac{L_1}{D_1^5} = 164,609$
  - $L_2 = 200 \text{ m}, D_2 = 0.20 \text{ m}, f_2 = 0.02 \implies \frac{L_2}{D_2^5} = 625,000$
  - $L_3 = 300 \text{ m}, D_3 = 0.25 \text{ m}, f_3 = 0.02 \implies \frac{L_3}{D_3^5} = 307,200$
- **Total**: $\Sigma \left(\frac{L_i}{D_i^5}\right) = 1,096,809$
- **Expected Equivalent Diameter for $L_e = 900 \text{ m}$**:
  $$D_e = \left(\frac{900}{1,096,809}\right)^{0.2} = \mathbf{0.2415 \text{ m} \ (241.5 \text{ mm})}$$

### Benchmark 3: Dual Industrial Parallel Feeders
- **Pipes**:
  - Branch 1: $L_1 = 600 \text{ m}, D_1 = 0.25 \text{ m}, f = 0.02 \implies K_1 = 1,015.54 \implies \frac{1}{\sqrt{K_1}} = 0.03138$
  - Branch 2: $L_2 = 800 \text{ m}, D_2 = 0.30 \text{ m}, f = 0.02 \implies K_2 = 544.15 \implies \frac{1}{\sqrt{K_2}} = 0.04287$
- **Total Flow**: $Q_{\text{total}} = 0.080 \text{ m}^3/\text{s} \ (80 \text{ L/s})$
- **Expected Flow Distribution**:
  - Branch 1: $Q_1 = 0.080 \times \frac{0.03138}{0.07425} = \mathbf{0.0338 \text{ m}^3/\text{s} \ (33.8 \text{ L/s}, 42.3\%)}$
  - Branch 2: $Q_2 = 0.080 \times \frac{0.04287}{0.07425} = \mathbf{0.0462 \text{ m}^3/\text{s} \ (46.2 \text{ L/s}, 57.7\%)}$
  - Common Head Loss across both branches: $h_1 = h_2 = \mathbf{1.16 \text{ m}}$.

---

## 8. Educational Features

- **Theory Section**: Physical derivation of the Hardy Cross method, Taylor series justification, conservation laws, and fluid mechanics constraints.
- **Worked Examples Tab**: Full hand-worked solutions with tabular iteration walkthroughs.
- **Help & Sign Conventions**: Explains clockwise ($+1$), anti-clockwise ($-1$), and shared branch sign handling.
- **Hydraulic Design Guidance**: Highlights optimal water velocity thresholds ($0.6 \text{ m/s} \le v \le 2.5 \text{ m/s}$) to avoid pipe sedimentation or erosion.

---

## 9. License

This project is released under the **MIT License**. Free for educational and academic use.
