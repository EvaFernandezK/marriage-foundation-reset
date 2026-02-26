import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// ─── DESIGN SYSTEM ─────────────────────────────────────────────────────────────
// Per-screen gradient shifts — same warm+cool palette, varied emphasis
const SCREEN_GRADIENTS = {
  gate:      "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(200,212,232,0.55) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 85% 10%, rgba(240,235,226,0.60) 0%, transparent 50%), linear-gradient(150deg, #CDD4E2 0%, #D6D2CC 35%, #DCD8D2 60%, #E2DDD8 100%)",
  onboard:   "radial-gradient(ellipse 55% 55% at 15% 25%, rgba(198,210,230,0.55) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 88% 12%, rgba(238,233,224,0.60) 0%, transparent 50%), linear-gradient(150deg, #CCD2E0 0%, #D5D1CB 35%, #DDDAD4 60%, #E3DED9 100%)",
  dashboard: "radial-gradient(ellipse 60% 50% at 10% 15%, rgba(195,208,230,0.55) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 90% 5%, rgba(240,236,228,0.65) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(218,212,228,0.40) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(235,230,220,0.55) 0%, transparent 55%), linear-gradient(150deg, #D0D6E4 0%, #D8D5D0 30%, #DDD9D3 55%, #E2DDD8 75%, #E6E2DC 100%)",
  setup:     "radial-gradient(ellipse 55% 50% at 5% 20%, rgba(215,205,235,0.45) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 90% 5%, rgba(235,230,220,0.60) 0%, transparent 55%), radial-gradient(ellipse 45% 55% at 75% 85%, rgba(200,215,230,0.35) 0%, transparent 50%), linear-gradient(155deg, #D2CEDF 0%, #D8D3CE 35%, #DEDAD4 60%, #E4DFD9 100%)",
  regulate:  "radial-gradient(ellipse 65% 55% at 5% 10%, rgba(195,220,210,0.50) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 85% 15%, rgba(235,230,220,0.55) 0%, transparent 50%), radial-gradient(ellipse 55% 60% at 50% 90%, rgba(205,215,228,0.40) 0%, transparent 55%), linear-gradient(150deg, #C8D8D2 0%, #D2CFC8 35%, #D9D6D0 60%, #E0DCD6 100%)",
  repair:    "radial-gradient(ellipse 60% 50% at 8% 18%, rgba(220,205,215,0.50) 0%, transparent 58%), radial-gradient(ellipse 55% 45% at 88% 8%, rgba(238,232,222,0.60) 0%, transparent 52%), radial-gradient(ellipse 50% 55% at 70% 80%, rgba(208,215,228,0.38) 0%, transparent 52%), linear-gradient(150deg, #D0CAD8 0%, #D6D0CA 35%, #DDDAD4 60%, #E3DED9 100%)",
  reflect:   "radial-gradient(ellipse 55% 50% at 12% 22%, rgba(205,215,232,0.52) 0%, transparent 55%), radial-gradient(ellipse 50% 48% at 82% 10%, rgba(236,230,220,0.58) 0%, transparent 52%), radial-gradient(ellipse 55% 60% at 60% 88%, rgba(218,210,228,0.38) 0%, transparent 52%), linear-gradient(150deg, #CDD5E2 0%, #D5D1CB 35%, #DCDAD4 60%, #E2DDD8 100%)",
  goals:     "radial-gradient(ellipse 60% 52% at 8% 15%, rgba(218,208,195,0.52) 0%, transparent 58%), radial-gradient(ellipse 55% 45% at 88% 8%, rgba(195,212,228,0.55) 0%, transparent 52%), radial-gradient(ellipse 50% 58% at 72% 82%, rgba(225,218,205,0.40) 0%, transparent 52%), linear-gradient(150deg, #D4CEC5 0%, #D5D1CC 35%, #DDDAD4 60%, #E3DFDA 100%)",
  tools:     "radial-gradient(ellipse 60% 50% at 10% 15%, rgba(195,208,230,0.55) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 90% 5%, rgba(240,236,228,0.65) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 80% 80%, rgba(218,212,228,0.40) 0%, transparent 55%), linear-gradient(150deg, #D0D6E4 0%, #D8D5D0 30%, #DDD9D3 55%, #E2DDD8 75%, #E6E2DC 100%)",
};

// ─── GLOBAL CSS ────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Sofia+Sans:wght@200;300;400;500&display=swap');`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:        #1E2128;
    --ink-soft:   #363C48;
    --ink-mid:    #5A6070;
    --ink-muted:  #7A8094;
    --ink-faint:  #AAB0C0;

    --surface:    rgba(252, 251, 249, 0.72);
    --surface-md: rgba(252, 251, 249, 0.58);
    --surface-sm: rgba(252, 251, 249, 0.44);
    --stroke:     rgba(255, 255, 255, 0.70);
    --stroke-sm:  rgba(255, 255, 255, 0.48);

    --card-shadow:  0 2px 20px rgba(80,95,120,0.09), 0 1px 0 rgba(255,255,255,0.92) inset;
    --card-shadow-hover: 0 8px 32px rgba(80,95,120,0.14), 0 1px 0 rgba(255,255,255,0.96) inset;

    --accent-sage:  #7A9E8E;
    --accent-blush: #C49A8A;
    --accent-plum:  #8A849E;
    --accent-gold:  #B8995A;

    --serif: 'Cormorant Garamond', Georgia, serif;
    --sans:  'Sofia Sans', system-ui, sans-serif;

    --radius-xl: 28px;
    --radius-lg: 20px;
    --radius:    14px;
    --radius-sm: 10px;
  }

  html, body, #root {
    height: 100%;
    font-family: var(--sans);
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
    color: var(--ink);
  }

  /* ── APP SHELL ── */
  .app-shell {
    min-height: 100vh;
    transition: background 0.6s ease;
  }

  /* ── PAGE WRAPPER — tight padding so background is a frame, not dead space ── */
  .page-wrap {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 16px 20px 32px;
  }

  /* ── CONTAINER — deeper shadow to separate from bg, strong foreground ── */
  .container {
    width: 100%;
    max-width: 1200px;
    border-radius: 20px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.55),
      0 32px 80px rgba(55, 68, 95, 0.22),
      0 8px 24px rgba(55, 68, 95, 0.10),
      0 2px 6px rgba(55, 68, 95, 0.06);
    overflow: hidden;
    position: relative;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    min-height: 600px;
    padding: 36px 18px 28px;
    border-right: 1px solid rgba(255,255,255,0.40);
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: transparent;
  }

  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; padding: 0 6px; }
  .brand-mark {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--surface-sm); border: 1px solid var(--stroke);
    box-shadow: 0 2px 8px rgba(80,95,120,0.10);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .brand-ring {
    width: 12px; height: 12px; border-radius: 50%;
    border: 1.5px solid rgba(50,58,80,0.35);
    display: flex; align-items: center; justify-content: center;
  }
  .brand-ring::after { content: ''; width: 3.5px; height: 3.5px; border-radius: 50%; background: rgba(50,58,80,0.42); }
  .brand-name { font-size: 0.64rem; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-mid); line-height: 1.45; }

  .nav-link {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 14px; border-radius: var(--radius-sm);
    cursor: pointer; border: 1px solid transparent;
    transition: all 0.18s; text-decoration: none;
    background: transparent;
    font-family: var(--sans);
  }
  .nav-link:hover { background: rgba(255,255,255,0.35); border-color: rgba(255,255,255,0.50); }
  .nav-link.active {
    background: rgba(255,255,255,0.58);
    border-color: rgba(255,255,255,0.72);
    box-shadow: 0 2px 14px rgba(55,68,95,0.10), 0 1px 0 rgba(255,255,255,0.9) inset;
  }
  .nav-icon { font-size: 0.9rem; color: var(--ink-muted); width: 17px; text-align: center; }
  .nav-label { font-size: 0.78rem; font-weight: 300; color: var(--ink-mid); letter-spacing: 0.01em; }
  .nav-link.active .nav-icon { color: var(--ink); }
  .nav-link.active .nav-label { color: var(--ink); font-weight: 500; }

  .sidebar-fill { flex: 1; }

  .sync-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: var(--surface-sm); border: 1px solid var(--stroke-sm);
    border-radius: var(--radius-sm);
  }
  .sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-faint); flex-shrink: 0; }
  .sync-dot.live { background: var(--accent-sage); box-shadow: 0 0 0 2px rgba(122,158,142,0.18); }
  .sync-text { font-size: 0.63rem; font-weight: 300; color: var(--ink-muted); line-height: 1.45; }

  /* ── LAYOUT GRIDS ── */
  .layout-sidebar {
    display: grid;
    grid-template-columns: 210px 1fr;
    grid-template-rows: 1fr;
    min-height: 680px;
  }
  .layout-centered {
    display: flex; align-items: center; justify-content: center;
    min-height: 680px; padding: 48px 36px;
  }
  .layout-full {
    min-height: 680px;
    display: flex; flex-direction: column;
  }

  /* ── MAIN AREA ── */
  .main-area {
    display: flex; flex-direction: column;
    overflow-y: auto;
  }
  .main-header {
    padding: 36px 44px 22px;
    border-bottom: 1px solid rgba(255,255,255,0.36);
    flex-shrink: 0;
  }
  .main-body {
    padding: 26px 44px 44px;
    display: flex; flex-direction: column; gap: 24px;
    flex: 1;
  }

  /* ── TYPOGRAPHY ── */
  .eyebrow {
    font-size: 0.56rem; font-weight: 300; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--ink-muted); margin-bottom: 8px;
  }
  .heading {
    font-family: var(--serif); font-size: 2.5rem; font-weight: 400;
    color: var(--ink); line-height: 1.08; letter-spacing: -0.01em; margin-bottom: 5px;
  }
  .heading-md {
    font-family: var(--serif); font-size: 1.8rem; font-weight: 400;
    color: var(--ink); line-height: 1.15; margin-bottom: 10px;
  }
  .heading-sm {
    font-family: var(--serif); font-size: 1.2rem; font-weight: 400;
    color: var(--ink); line-height: 1.3; margin-bottom: 6px;
  }
  .subheading {
    font-family: var(--serif); font-size: 1rem; font-weight: 300;
    font-style: italic; color: var(--ink-muted);
  }
  .body-text {
    font-size: 0.82rem; font-weight: 300; color: var(--ink-soft);
    line-height: 1.65;
  }
  .caption-text {
    font-size: 0.68rem; font-weight: 300; color: var(--ink-muted); line-height: 1.5;
  }

  /* ── SECTION LABEL ── */
  .section-label {
    font-size: 0.54rem; font-weight: 400; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--ink-muted); margin-bottom: 11px;
  }

  /* ── CARDS ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--stroke);
    border-radius: var(--radius-lg);
    box-shadow: var(--card-shadow);
    padding: 22px 24px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .card-bright {
    background: rgba(255, 255, 254, 0.92);
    border: 1px solid rgba(255,255,255,0.92);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 28px rgba(80,95,120,0.11), 0 1px 0 rgba(255,255,255,1) inset;
    padding: 22px 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .card-hover {
    cursor: pointer; transition: all 0.18s;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover);
  }

  /* ── NUDGE CARD ── */
  .nudge-card {
    background: rgba(255,254,252,0.78);
    border: 1px solid rgba(255,255,255,0.78);
    border-radius: var(--radius-lg);
    box-shadow: 0 3px 24px rgba(80,95,120,0.10), 0 1px 0 rgba(255,255,255,0.95) inset;
    padding: 22px 28px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    display: flex; align-items: center; gap: 24px;
  }
  .nudge-text { flex: 1; }

  /* ── BUTTONS ── */
  /* Primary — dark ink, bright enough for all backgrounds */
  .btn {
    font-family: var(--sans); cursor: pointer; border: none;
    transition: all 0.18s; display: inline-flex; align-items: center;
    justify-content: center; letter-spacing: 0.07em; font-weight: 400;
  }
  .btn-primary {
    background: var(--ink); color: rgba(252,251,249,0.96);
    font-size: 0.73rem; padding: 13px 28px; border-radius: 100px;
    box-shadow: 0 2px 12px rgba(30,33,40,0.18);
  }
  .btn-primary:hover { background: #2C3240; transform: translateY(-1px); box-shadow: 0 5px 20px rgba(30,33,40,0.24); }
  .btn-primary:active { transform: translateY(0); }

  .btn-primary-wide {
    background: var(--ink); color: rgba(252,251,249,0.96);
    font-size: 0.76rem; padding: 15px 32px; border-radius: 100px;
    width: 100%; box-shadow: 0 2px 12px rgba(30,33,40,0.18);
  }
  .btn-primary-wide:hover { background: #2C3240; transform: translateY(-1px); box-shadow: 0 5px 20px rgba(30,33,40,0.24); }

  .btn-outline {
    background: var(--ink); color: rgba(252,251,249,0.96);
    font-size: 0.72rem; padding: 12px 24px; border-radius: 100px;
    border: none !important;
    box-shadow: 0 2px 12px rgba(30,33,40,0.18);
  }
  .btn-outline:hover { background: #2C3240; transform: translateY(-1px); box-shadow: 0 5px 20px rgba(30,33,40,0.24); }

  .btn-ghost {
    background: transparent; color: var(--ink-mid);
    font-size: 0.70rem; padding: 11px 20px; border-radius: 100px;
    border: 1.5px solid rgba(30,33,40,0.18) !important;
  }
  .btn-ghost:hover { color: var(--ink); border-color: rgba(30,33,40,0.35) !important; background: rgba(252,251,249,0.40); }

  .btn-full { width: 100%; }

  .btn + .btn { margin-top: 10px; }

  /* ── INPUTS ── */
  .field { margin-bottom: 18px; }
  .field label {
    display: block; font-size: 0.62rem; font-weight: 400;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--ink-muted); margin-bottom: 7px;
  }
  .field input, .field textarea, .field select {
    width: 100%;
    background: rgba(252,251,249,0.65);
    border: 1px solid rgba(255,255,255,0.60);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-family: var(--sans); font-size: 0.84rem; font-weight: 300;
    color: var(--ink); outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    backdrop-filter: blur(8px);
    box-shadow: 0 1px 4px rgba(80,95,120,0.06), 0 1px 0 rgba(255,255,255,0.8) inset;
  }
  .field input:focus, .field textarea:focus, .field select:focus {
    border-color: rgba(255,255,255,0.85);
    box-shadow: 0 0 0 3px rgba(80,95,120,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
  }
  .field textarea { resize: vertical; min-height: 96px; line-height: 1.6; }
  .field select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A8094' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 36px; cursor: pointer;
  }

  /* ── SLIDER ── */
  .slider-wrap { margin: 12px 0 8px; }
  .slider-val {
    font-family: var(--serif); font-size: 2.8rem; font-weight: 300;
    color: var(--ink); text-align: center; line-height: 1; margin-bottom: 10px;
  }
  .slider-wrap input[type=range] {
    width: 100%; height: 4px; -webkit-appearance: none; appearance: none;
    background: linear-gradient(to right, var(--accent-sage) 0%, var(--accent-blush) 55%, #C05848 100%);
    border-radius: 2px; outline: none; cursor: pointer;
  }
  .slider-wrap input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
    background: rgba(252,251,249,0.95); border: 2px solid var(--ink);
    box-shadow: 0 2px 8px rgba(30,33,40,0.16); cursor: pointer;
  }
  .slider-labels { display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--ink-muted); margin-top: 5px; }

  /* ── PILLS ── */
  .pills { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
  .pill {
    background: var(--surface-sm); border: 1px solid var(--stroke-sm);
    border-radius: 100px; padding: 7px 14px;
    font-size: 0.72rem; font-weight: 300; color: var(--ink-mid);
    cursor: pointer; transition: all 0.15s; font-family: var(--sans);
  }
  .pill:hover { background: var(--surface-md); }
  .pill.active { background: var(--ink); border-color: var(--ink); color: rgba(252,251,249,0.95); }

  /* ── PROGRESS DOTS ── */
  .step-dots { display: flex; gap: 5px; margin-bottom: 28px; }
  .step-dot { height: 2.5px; flex: 1; background: rgba(120,130,155,0.18); border-radius: 2px; transition: background 0.3s; }
  .step-dot.done { background: var(--ink); }
  .step-dot.active { background: var(--ink); opacity: 0.45; }

  /* ── TOOLS GRID ── */
  .tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .tool-card {
    background: rgba(255,255,254,0.68);
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: var(--radius-lg);
    box-shadow: 0 3px 20px rgba(55,68,95,0.10), 0 1px 0 rgba(255,255,255,0.95) inset;
    padding: 22px 14px 20px;
    text-align: center;
    cursor: pointer; transition: all 0.20s;
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .tool-card:hover {
    transform: translateY(-3px);
    background: rgba(255,255,254,0.88);
    box-shadow: 0 10px 36px rgba(55,68,95,0.15), 0 1px 0 rgba(255,255,255,1) inset;
  }
  /* Hot tools — slightly elevated/brighter to signal urgency */
  .tool-card.hot {
    background: rgba(255,255,254,0.82);
    box-shadow: 0 4px 24px rgba(55,68,95,0.13), 0 1px 0 rgba(255,255,255,1) inset;
  }
  .tool-card.hot:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(55,68,95,0.17), 0 1px 0 rgba(255,255,255,1) inset;
  }
  /* Learn tools — slightly recessed/tonal to signal reflection */
  .tool-card.learn {
    background: rgba(252,251,249,0.55);
    box-shadow: 0 2px 14px rgba(55,68,95,0.07), 0 1px 0 rgba(255,255,255,0.85) inset;
  }
  .tool-card.learn:hover {
    background: rgba(255,255,254,0.75);
    box-shadow: 0 8px 28px rgba(55,68,95,0.12), 0 1px 0 rgba(255,255,255,0.95) inset;
  }
  .tool-icon { font-size: 1.4rem; }
  .tool-name { font-family: var(--serif); font-size: 1.02rem; font-weight: 400; color: var(--ink); }
  .tool-desc { font-size: 0.65rem; font-weight: 300; color: var(--ink-muted); line-height: 1.45; }

  /* ── TWO COLUMNS ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* ── ACTIVATION LOG ── */
  .act-row { display: flex; align-items: center; gap: 12px; margin-bottom: 7px; }
  .act-track { flex: 1; height: 3px; background: rgba(100,112,140,0.12); border-radius: 2px; overflow: hidden; }
  .act-fill { height: 100%; border-radius: 2px; }
  .act-num { font-family: var(--serif); font-size: 1.7rem; font-weight: 300; color: var(--ink); line-height: 1; min-width: 20px; text-align: right; }
  .act-meta { display: flex; justify-content: space-between; margin-bottom: 11px; }
  .act-state { font-size: 0.64rem; font-weight: 300; }
  .act-tool  { font-size: 0.62rem; font-weight: 300; color: var(--ink-muted); }
  .act-note  { font-family: var(--serif); font-style: italic; font-size: 0.85rem; font-weight: 300; color: var(--ink-soft); line-height: 1.6; padding-top: 11px; border-top: 1px solid rgba(100,112,140,0.09); }

  /* ── GLIMMERS ── */
  .glimmer-item { display: flex; align-items: flex-start; gap: 9px; padding: 10px 0; border-bottom: 1px solid rgba(100,112,140,0.09); }
  .glimmer-item:last-of-type { border-bottom: none; padding-bottom: 0; }
  .g-star { font-size: 0.46rem; color: var(--ink-muted); margin-top: 5px; flex-shrink: 0; }
  .g-text { font-family: var(--serif); font-size: 0.86rem; font-weight: 300; font-style: italic; color: var(--ink-soft); line-height: 1.55; flex: 1; }
  .g-date { font-size: 0.59rem; font-weight: 300; color: var(--ink-faint); flex-shrink: 0; }

  /* ── SCRIPT CARDS ── */
  .script-card {
    background: var(--surface-md); border: 1px solid var(--stroke-sm);
    border-radius: var(--radius); padding: 14px 16px; margin-bottom: 8px;
    cursor: pointer; transition: all 0.18s;
  }
  .script-card:hover { background: var(--surface); border-color: var(--stroke); }
  .script-card.selected { background: rgba(255,254,252,0.80); border-color: rgba(255,255,255,0.75); box-shadow: var(--card-shadow); }
  .script-text { font-family: var(--serif); font-style: italic; font-size: 0.92rem; line-height: 1.6; color: var(--ink); }
  .script-ctx  { font-size: 0.62rem; font-weight: 300; color: var(--ink-muted); margin-top: 5px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* ── REPLACEMENT CARD ── */
  .replacement-card {
    background: rgba(255,254,252,0.75); border: 1px solid rgba(255,255,255,0.72);
    border-radius: var(--radius-lg); padding: 28px 24px;
    text-align: center; box-shadow: var(--card-shadow); margin: 20px 0;
    backdrop-filter: blur(16px);
  }
  .rep-instead { font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 6px; }
  .rep-old { font-family: var(--serif); font-size: 0.95rem; font-style: italic; color: var(--ink-muted); text-decoration: line-through; margin-bottom: 14px; }
  .rep-will { font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent-sage); margin-bottom: 6px; }
  .rep-new { font-family: var(--serif); font-size: 1.2rem; color: var(--ink); line-height: 1.5; }

  /* ── INSIGHT BOX ── */
  .insight {
    background: rgba(252,251,249,0.55); border-left: 2.5px solid rgba(120,130,155,0.30);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 12px 16px; margin: 14px 0;
    font-family: var(--serif); font-style: italic; font-size: 0.9rem;
    color: var(--ink-soft); line-height: 1.6;
  }

  /* ── BREATHING ANIMATION ── */
  .breathing-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; flex: 1; }
  .breath-circle {
    width: 176px; height: 176px; border-radius: 50%;
    border: 1.5px solid rgba(80,95,120,0.18);
    display: flex; align-items: center; justify-content: center; position: relative;
  }
  .breath-circle::before {
    content: ''; position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(80,95,120,0.12) 0%, transparent 70%);
  }
  .breath-circle.inhale::before { animation: expand 4s ease-in-out forwards; }
  .breath-circle.hold::before   { width: 156px; height: 156px; }
  .breath-circle.exhale::before { animation: contract 4s ease-in-out forwards; }
  @keyframes expand   { from { width: 40px; height: 40px; opacity: 0.3; } to { width: 156px; height: 156px; opacity: 1; } }
  @keyframes contract { from { width: 156px; height: 156px; opacity: 1; } to { width: 40px; height: 40px; opacity: 0.3; } }
  .breath-count { font-family: var(--serif); font-size: 3.2rem; font-weight: 300; color: var(--ink); line-height: 1; }
  .breath-phase { font-size: 0.68rem; font-weight: 300; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); margin-top: 3px; }
  .breath-instruction { font-family: var(--serif); font-size: 1.5rem; font-style: italic; color: var(--ink-soft); text-align: center; }

  /* ── GROUNDING ── */
  .grounding-num   { font-family: var(--serif); font-size: 5rem; font-weight: 300; color: var(--ink); text-align: center; line-height: 1; }
  .grounding-sense { font-family: var(--serif); font-size: 1.4rem; font-style: italic; color: var(--ink-soft); text-align: center; }
  .grounding-prompt { font-size: 0.86rem; font-weight: 300; color: var(--ink-muted); text-align: center; line-height: 1.65; max-width: 380px; margin: 0 auto; }

  /* ── MSG ── */
  .msg-error   { background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.18); border-radius: var(--radius-sm); padding: 11px 14px; font-size: 0.8rem; color: #C0392B; margin-bottom: 14px; }
  .msg-success { background: rgba(122,158,142,0.08); border: 1px solid rgba(122,158,142,0.22); border-radius: var(--radius-sm); padding: 11px 14px; font-size: 0.8rem; color: var(--accent-sage); margin-bottom: 14px; }

  /* ── LOADING ── */
  .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
  .spinner { width: 28px; height: 28px; border: 2px solid rgba(100,112,140,0.20); border-top-color: var(--ink); border-radius: 50%; animation: spin 0.75s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DIVIDER ── */
  .divider { height: 1px; background: rgba(100,112,140,0.12); margin: 20px 0; }

  /* ── SPACER ── */
  .spacer { flex: 1; }

  /* ── ANIMATE ── */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .delay-1 { animation-delay: 0.06s; }
  .delay-2 { animation-delay: 0.12s; }
  .delay-3 { animation-delay: 0.18s; }
  .delay-4 { animation-delay: 0.24s; }
  .delay-5 { animation-delay: 0.30s; }

  /* ── TOP BAR (sub-screens) ── */
  .top-bar { display: flex; align-items: center; justify-content: space-between; padding: 20px 44px 0; }
  .back-btn { background: none; border: none; cursor: pointer; font-family: var(--sans); font-size: 0.76rem; font-weight: 300; color: var(--ink-muted); display: flex; align-items: center; gap: 5px; padding: 4px 0; transition: color 0.18s; }
  .back-btn:hover { color: var(--ink); }

  /* ── RESPONSIVE ── */
  @media (max-width: 860px) {
    .page-wrap { padding: 10px 10px 24px; }
    .container { border-radius: 16px; }
    .layout-sidebar { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    .sidebar {
      position: static; height: auto; min-height: auto;
      flex-direction: row; flex-wrap: wrap; gap: 6px;
      padding: 14px 16px 12px;
      border-right: none; border-bottom: 1px solid rgba(255,255,255,0.36);
    }
    .brand { margin-bottom: 0; margin-right: 4px; }
    .sidebar-fill { display: none; }
    .sync-pill { padding: 7px 10px; }
    .main-header { padding: 20px 20px 14px; }
    .main-body   { padding: 16px 20px 32px; }
    .top-bar     { padding: 16px 20px 0; }
    .heading { font-size: 1.9rem; }
    .two-col { grid-template-columns: 1fr; }
    .nudge-card { flex-direction: column; gap: 14px; align-items: flex-start; }
    .btn-primary { width: 100%; }
    .layout-centered { padding: 28px 20px; }
  }

  @media (max-width: 560px) {
    .page-wrap { padding: 0; }
    .container { border-radius: 0; box-shadow: none; }
    .tools-grid { grid-template-columns: 1fr 1fr; }
    .heading { font-size: 1.7rem; }
    .main-header { padding: 16px 16px 12px; }
    .main-body   { padding: 12px 16px 36px; }
    .top-bar     { padding: 14px 16px 0; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" stroke="rgba(50,58,80,0.28)" strokeWidth="1.5"/>
      <circle cx="22" cy="22" r="13" stroke="rgba(50,58,80,0.42)" strokeWidth="1.5"/>
      <circle cx="22" cy="22" r="6"  stroke="rgba(50,58,80,0.65)" strokeWidth="1.5"/>
      <circle cx="22" cy="22" r="2"  fill="rgba(50,58,80,0.72)"/>
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function activationColor(n) {
  if (n <= 4) return "#7A9E8E";
  if (n <= 7) return "#B8995A";
  return "#C05848";
}
function activationLabel(n) {
  if (n <= 3) return "Regulated";
  if (n <= 5) return "Activated";
  if (n <= 7) return "Escalating";
  return "Flooded";
}

const DEFAULT_BEHAVIORS = [
  "I go quiet and withdraw","I escalate and pursue","I get defensive and explain",
  "I shut down completely","I deflect with humor","I leave the room",
  "I become sarcastic","I bring up past issues","I say things I don't mean",
  "I give the silent treatment",
];
const TRIGGERS = [
  "Feeling unheard","Feeling dismissed","Feeling criticized","Feeling controlled",
  "Feeling abandoned","Feeling disrespected","Feeling overwhelmed","Feeling blamed",
  "Feeling invisible","Tone of voice","Being interrupted","Feeling like a burden",
];
const BODY_RESPONSES = [
  "My chest tightens","My heart races","I feel heat in my face","I go numb",
  "My stomach drops","I feel frozen","My throat tightens","I start shaking",
  "I feel a wave of nausea","I dissociate or zone out",
];
const REPAIR_SCRIPTS = {
  opening: [
    { text: "I know that didn't go well. I want to try again — when you're ready.", ctx: "To open repair" },
    { text: "I care more about us than about being right. Can we talk?", ctx: "To de-escalate" },
    { text: "I got activated back there. That wasn't the real conversation.", ctx: "To name what happened" },
    { text: "I'm not okay with how that went. And I don't want to leave it there.", ctx: "To reconnect" },
  ],
  accountability: [
    { text: "I said some things that weren't fair. I'm sorry for that.", ctx: "Accountability" },
    { text: "I went after you when I was scared. That wasn't right.", ctx: "Accountability" },
    { text: "I shut down when you needed me to stay. I see that now.", ctx: "Accountability" },
  ],
  softening: [
    { text: "What I was really trying to say underneath all of that was... I miss feeling close to you.", ctx: "Underneath the fight" },
    { text: "When I got angry, what I was actually feeling was scared.", ctx: "The softer emotion" },
    { text: "I need you to know that you matter to me — more than winning this.", ctx: "Reassurance" },
  ],
  request: [
    { text: "Can we slow down and start over? I want to actually hear you.", ctx: "Making a request" },
    { text: "Will you tell me what you needed from me in that moment?", ctx: "Curiosity" },
    { text: "I want to understand your side. Will you help me?", ctx: "Repair through curiosity" },
  ],
};

// ─── SHELL WRAPPER ─────────────────────────────────────────────────────────────
// Applies per-screen gradient background + container
function AppScreen({ screen, children, layout = "sidebar", partnerData, activeNav, onNavClick }) {
  const gradient = SCREEN_GRADIENTS[screen] || SCREEN_GRADIENTS.dashboard;

  const showSidebar = layout === "sidebar";

  return (
    <div className="app-shell" style={{ background: gradient }}>
      <div className="page-wrap">
        <div className={`container fade-up`}>
          {showSidebar ? (
            <div className="layout-sidebar">
              <Sidebar activeNav={activeNav} onNavClick={onNavClick} partnerData={partnerData} />
              <div className="main-area">{children}</div>
            </div>
          ) : layout === "centered" ? (
            <div className="layout-centered">{children}</div>
          ) : (
            <div className="layout-full">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeNav, onNavClick, partnerData }) {
  const navItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "setup",     icon: "◎", label: "My Setup" },
    { id: "tools",     icon: "✦", label: "Tools" },
    { id: "goals",     icon: "◇", label: "Goals" },
  ];
  return (
    <nav className="sidebar">
      <div className="brand">
        <div className="brand-mark"><div className="brand-ring"></div></div>
        <span className="brand-name">Rewire<br/>the Fight</span>
      </div>
      {navItems.map(n => (
        <button key={n.id} className={`nav-link${activeNav === n.id ? " active" : ""}`} onClick={() => onNavClick(n.id)}>
          <span className="nav-icon">{n.icon}</span>
          <span className="nav-label">{n.label}</span>
        </button>
      ))}
      <div className="sidebar-fill" />
      <div className="sync-pill">
        <div className={`sync-dot${partnerData ? " live" : ""}`} />
        <div className="sync-text">
          {partnerData ? `Connected with ${partnerData.name}` : "Waiting for partner\nto connect"}
        </div>
      </div>
    </nav>
  );
}

// ─── GATE SCREEN ───────────────────────────────────────────────────────────────
function GateScreen() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!/^[A-Za-z0-9]{4,12}$/.test(code.trim())) { setError("Please enter a valid confirmation code."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: window.location.origin, data: { confirmation_code: code.trim().toUpperCase() } },
      });
      if (e) throw e;
      setSent(true);
    } catch(e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  }

  const bg = SCREEN_GRADIENTS.gate;

  if (sent) return (
    <div className="app-shell" style={{ background: bg }}>
      <div className="page-wrap">
        <div className="container">
          <div className="layout-centered" style={{ minHeight: 560 }}>
            <div style={{ textAlign: "center", maxWidth: 400 }}>
              <Logo size={52} />
              <div style={{ marginTop: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Check your inbox</div>
                <div className="heading-md">We sent you a link</div>
                <p className="body-text" style={{ margin: "12px 0 24px" }}>
                  A sign-in link was sent to <strong>{email}</strong>. Click it to open your workbook.
                </p>
                <button className="btn btn-ghost" onClick={() => setSent(false)}>Try a different email</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell" style={{ background: bg }}>
      <div className="page-wrap">
        <div className="container">
          <div className="layout-centered" style={{ minHeight: 560 }}>
            <div style={{ maxWidth: 400, width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <Logo size={52} />
                <div className="eyebrow" style={{ marginTop: 20, marginBottom: 6 }}>Inner Pathways MFT</div>
                <div className="heading" style={{ fontSize: "2rem" }}>Rewire the Fight</div>
                <div className="subheading" style={{ marginTop: 6 }}>A therapist-designed system for couples</div>
              </div>
              {error && <div className="msg-error">{error}</div>}
              <div className="field">
                <label>Confirmation Code</label>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. RTF2024" maxLength={12} />
              </div>
              <div className="field">
                <label>Your Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <button className="btn btn-primary-wide" disabled={loading} onClick={submit} style={{ marginTop: 8 }}>
                {loading ? "Sending link…" : "Send My Sign-In Link"}
              </button>
              <p className="caption-text" style={{ textAlign: "center", marginTop: 16 }}>We'll email you a secure link — no password needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING SCREEN ─────────────────────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmationCode = user?.user_metadata?.confirmation_code || "DEFAULT";

  async function submit() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setError(""); setLoading(true);
    try {
      let coupleId;
      const { data: existing } = await supabase.from("couples").select("id").eq("confirmation_code", confirmationCode).single();
      if (existing) { coupleId = existing.id; }
      else {
        const { data: nc, error: ce } = await supabase.from("couples").insert({ confirmation_code: confirmationCode }).select("id").single();
        if (ce) throw ce;
        coupleId = nc.id;
      }
      const { error: pe } = await supabase.from("partners").insert({ couple_id: coupleId, user_id: user.id, name: name.trim(), email: user.email, partner_email: partnerEmail.trim().toLowerCase() || null });
      if (pe) throw pe;
      const { data: pd } = await supabase.from("partners").select("id").eq("user_id", user.id).single();
      if (pd) await supabase.from("setup").insert({ partner_id: pd.id, couple_id: coupleId });
      onComplete();
    } catch(e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="app-shell" style={{ background: SCREEN_GRADIENTS.onboard }}>
      <div className="page-wrap">
        <div className="container">
          <div className="layout-centered" style={{ minHeight: 580 }}>
            <div style={{ maxWidth: 440, width: "100%" }}>
              <div style={{ marginBottom: 32 }}><Logo size={44} /></div>
              <div className="eyebrow">Welcome</div>
              <div className="heading-md">Let's get you set up</div>
              <p className="body-text" style={{ margin: "10px 0 28px" }}>This is your private space. Your partner will create their own.</p>
              {error && <div className="msg-error">{error}</div>}
              <div className="field"><label>Your first name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="How should we address you?" /></div>
              <div className="divider" />
              <p className="caption-text" style={{ marginBottom: 14 }}>Optional — invite your partner to connect their workbook.</p>
              <div className="field"><label>Partner's first name</label><input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Their name" /></div>
              <div className="field"><label>Partner's email</label><input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="their@email.com" /></div>
              <button className="btn btn-primary-wide" disabled={loading} onClick={submit} style={{ marginTop: 12 }}>
                {loading ? "Setting up…" : "Continue"}
              </button>
              <button className="btn btn-ghost btn-full" onClick={submit} disabled={loading} style={{ marginTop: 10 }}>
                Skip — I'll add this later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD SCREEN ──────────────────────────────────────────────────────────
function DashboardScreen({ partner, setup, logs, glimmers, partnerData, onNavigate }) {
  const last = logs?.[0];
  const setupDone = setup?.replacement_behavior && setup?.triggers?.length > 0;
  const recentGlimmers = glimmers?.slice(0, 3) || [];

  return (
    <AppScreen screen="dashboard" activeNav="dashboard" onNavClick={onNavigate} partnerData={partnerData}>
      {/* Header */}
      <div className="main-header fade-up">
        <div className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <div className="heading">{greeting()}, {partner?.name?.split(" ")[0]}.</div>
        <div className="subheading">What do you need right now?</div>
      </div>

      <div className="main-body">
        {/* Setup nudge */}
        {!setupDone && (
          <div className="nudge-card fade-up delay-1">
            <div className="nudge-text">
              <div className="eyebrow" style={{ marginBottom: 5 }}>Finish your setup</div>
              <div className="heading-sm">Your replacement behavior isn't defined yet</div>
              <p className="body-text">This is the most important part of the system. You'll want it ready before you need it.</p>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate("setup")}>Complete Setup →</button>
          </div>
        )}

        {/* Tools */}
        <div className="fade-up delay-2">
          <div className="section-label">Something happened</div>
          <div className="tools-grid">
            <div className="tool-card" onClick={() => handleNav("regulate")}>
              <span className="tool-icon">🌿</span>
              <span className="tool-name">Regulate</span>
              <span className="tool-desc">I'm activated right now</span>
            </div>
            <div className="tool-card" onClick={() => handleNav("repair")}>
              <span className="tool-icon">🤝</span>
              <span className="tool-name">Repair</span>
              <span className="tool-desc">We just had a fight</span>
            </div>
            <div className="tool-card" onClick={() => handleNav("reflect")}>
              <span className="tool-icon">🔍</span>
              <span className="tool-name">Reflect</span>
              <span className="tool-desc">I want to understand what happened</span>
            </div>
          </div>
        </div>

        {/* Bottom two-col — brighter surfaces */}
        <div className="two-col fade-up delay-3">
          {/* Last activation */}
          <div className="card-bright">
            <div className="eyebrow" style={{ marginBottom: 14 }}>My last logged state</div>
            {last ? (
              <>
                <div className="act-row">
                  <div className="act-track"><div className="act-fill" style={{ width: `${last.level * 10}%`, background: activationColor(last.level) }} /></div>
                  <div className="act-num">{last.level}</div>
                </div>
                <div className="act-meta">
                  <span className="act-state" style={{ color: activationColor(last.level) }}>{activationLabel(last.level)}</span>
                  <span className="act-tool">{fmtDate(last.created_at)}</span>
                </div>
                {last.note && <div className="act-note">"{last.note}"</div>}
              </>
            ) : (
              <p className="body-text" style={{ color: "var(--ink-faint)" }}>No logs yet.</p>
            )}
          </div>

          {/* Glimmers */}
          <div className="card-bright">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Recent glimmers</div>
            {recentGlimmers.length > 0 ? recentGlimmers.map(g => (
              <div className="glimmer-item" key={g.id}>
                <span className="g-star">✦</span>
                <span className="g-text">{g.text}</span>
                <span className="g-date">{fmtDate(g.created_at)}</span>
              </div>
            )) : (
              <p className="body-text" style={{ color: "var(--ink-faint)" }}>No glimmers yet.</p>
            )}
            <button className="btn btn-ghost" onClick={() => handleNav("glimmer")} style={{ marginTop: 14, width: "100%" }}>
              + Add a glimmer ✦
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

// ─── SETUP SCREEN ──────────────────────────────────────────────────────────────
function SetupScreen({ partner, setup, onComplete, onBack, onNavigate, partnerData }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    shared_goals:         setup?.shared_goals || "",
    window_low:           setup?.window_low || 3,
    window_high:          setup?.window_high || 7,
    triggers:             setup?.triggers || [],
    body_response:        setup?.body_response || "",
    default_behavior:     setup?.default_behavior || "",
    replacement_behavior: setup?.replacement_behavior || "",
    cycle_map_my_side:    setup?.cycle_map_my_side || "",
  });
  const STEPS = 5;
  function upd(k, v) { setData(d => ({ ...d, [k]: v })); }
  function toggleTrigger(t) { setData(d => ({ ...d, triggers: d.triggers.includes(t) ? d.triggers.filter(x => x !== t) : [...d.triggers, t] })); }

  async function next() {
    setSaving(true);
    try { await supabase.from("setup").update({ ...data, updated_at: new Date().toISOString() }).eq("partner_id", partner.id); }
    catch(e) { console.error(e); } finally { setSaving(false); }
    if (step < STEPS - 1) setStep(s => s + 1);
    else { await supabase.from("setup").update({ completed: true }).eq("partner_id", partner.id); onComplete(); }
  }

  const steps = [
    <div key="goals">
      <div className="eyebrow">Step 1 of 5</div>
      <div className="heading-md">What do we want to change?</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>Think about what you're hoping this work gives your relationship.</p>
      <div className="insight">You don't need to be specific. Even "I want us to fight less and feel more connected" is a complete answer.</div>
      <div className="field" style={{ marginTop: 18 }}>
        <label>Our shared goal</label>
        <textarea value={data.shared_goals} onChange={e => upd("shared_goals", e.target.value)} placeholder="What I want for us is…" rows={5} />
      </div>
    </div>,

    <div key="window">
      <div className="eyebrow">Step 2 of 5</div>
      <div className="heading-md">Your window of tolerance</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>The zone where you can think clearly. Outside it, your nervous system takes over.</p>
      <div className="insight">There's no right answer. This is just about knowing yourself.</div>
      <div className="field" style={{ marginTop: 20 }}>
        <label>I start getting activated around…</label>
        <div className="slider-wrap">
          <div className="slider-val">{data.window_low}/10</div>
          <input type="range" min="1" max="9" value={data.window_low} onChange={e => upd("window_low", parseInt(e.target.value))} />
          <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
        </div>
      </div>
      <div className="field">
        <label>I'm clearly outside my window above…</label>
        <div className="slider-wrap">
          <div className="slider-val">{data.window_high}/10</div>
          <input type="range" min={data.window_low + 1} max="10" value={data.window_high} onChange={e => upd("window_high", parseInt(e.target.value))} />
          <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
        </div>
      </div>
    </div>,

    <div key="triggers">
      <div className="eyebrow">Step 3 of 5</div>
      <div className="heading-md">What activates you?</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>Certain things reliably pull you outside your window. Name them now.</p>
      <div className="field">
        <label>My triggers</label>
        <div className="pills">{TRIGGERS.map(t => <button key={t} className={`pill${data.triggers.includes(t) ? " active" : ""}`} onClick={() => toggleTrigger(t)}>{t}</button>)}</div>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>What my body does first</label>
        <select value={data.body_response} onChange={e => upd("body_response", e.target.value)}>
          <option value="">Choose one…</option>
          {BODY_RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="insight">Your body gives you the signal before your mind does. That physical cue is your earliest intervention point.</div>
    </div>,

    <div key="replacement">
      <div className="eyebrow">Step 4 of 5</div>
      <div className="heading-md">Your replacement behavior</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>When activated, your default behavior kicks in automatically. You're going to choose something different to do instead.</p>
      <div className="insight">"Instead of [what I normally do], I will [what I'm choosing to do]."</div>
      <div className="field" style={{ marginTop: 18 }}>
        <label>Instead of…</label>
        <select value={data.default_behavior} onChange={e => upd("default_behavior", e.target.value)}>
          <option value="">What do you usually do when activated?</option>
          {DEFAULT_BEHAVIORS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="field">
        <label>I will say or do…</label>
        <textarea value={data.replacement_behavior} onChange={e => upd("replacement_behavior", e.target.value)} placeholder={`e.g. "I'm starting to feel overwhelmed. Can we take 20 minutes?"`} rows={4} />
      </div>
      {data.default_behavior && data.replacement_behavior && (
        <div className="replacement-card">
          <div className="rep-instead">Instead of</div>
          <div className="rep-old">{data.default_behavior}</div>
          <div className="rep-will">I will</div>
          <div className="rep-new">"{data.replacement_behavior}"</div>
        </div>
      )}
    </div>,

    <div key="cycle">
      <div className="eyebrow">Step 5 of 5</div>
      <div className="heading-md">Your side of the cycle</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>Every couple has a conflict cycle. Understanding your side is how you start to interrupt it.</p>
      <div className="insight">The cycle is never: "My partner is the problem." It's always: "We're both caught in a pattern."</div>
      <div className="field" style={{ marginTop: 18 }}>
        <label>When I feel threatened or disconnected, I tend to…</label>
        <textarea value={data.cycle_map_my_side} onChange={e => upd("cycle_map_my_side", e.target.value)} placeholder="Describe what happens on your end — what you feel, what you do, and what you're afraid of underneath it…" rows={6} />
      </div>
    </div>,
  ];

  return (
    <AppScreen screen="setup" layout="sidebar" activeNav="setup" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="caption-text">My Setup</span>
      </div>
      <div style={{ padding: "18px 44px 0" }} className="fade-up delay-1">
        <div className="step-dots">{Array.from({ length: STEPS }).map((_, i) => <div key={i} className={`step-dot${i < step ? " done" : i === step ? " active" : ""}`} />)}</div>
      </div>
      <div style={{ padding: "0 44px", flex: 1, overflowY: "auto" }} className="fade-up delay-2">
        {steps[step]}
        <div style={{ minHeight: 28 }} />
        <button className="btn btn-primary-wide" disabled={saving} onClick={next}>
          {saving ? "Saving…" : step < STEPS - 1 ? "Save & Continue" : "Complete My Setup"}
        </button>
        {step > 0 && <button className="btn btn-ghost btn-full" onClick={() => setStep(s => s - 1)} style={{ marginTop: 10 }}>Back</button>}
        <div style={{ height: 44 }} />
      </div>
    </AppScreen>
  );
}

// ─── REGULATE SCREEN ───────────────────────────────────────────────────────────
function RegulateScreen({ partner, setup, onBack, onLog, onNavigate, partnerData }) {
  const [phase, setPhase] = useState("check");
  const [activation, setActivation] = useState(5);
  const [tool, setTool] = useState(null);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [breathCount, setBreathCount] = useState(4);
  const [breathCycle, setBreathCycle] = useState(0);
  const [groundStep, setGroundStep] = useState(0);
  const [note, setNote] = useState("");
  const timerRef = useRef(null);

  const GROUND = [
    { n: 5, sense: "See",   prompt: "Look around. Name 5 things you can see right now." },
    { n: 4, sense: "Touch", prompt: "Name 4 things you can physically feel — your feet on the floor, the air, your clothes." },
    { n: 3, sense: "Hear",  prompt: "What 3 sounds can you hear? Don't judge them, just notice." },
    { n: 2, sense: "Smell", prompt: "Name 2 things you can smell — or notice the absence of smell." },
    { n: 1, sense: "Taste", prompt: "What's 1 thing you can taste right now?" },
  ];

  useEffect(() => {
    if (phase === "breathing") runBoxBreath();
    else if (phase === "sigh") runSigh();
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  function runBoxBreath() {
    const seq = [
      { p: "inhale", c: 4, d: 4000 }, { p: "hold", c: 4, d: 4000 },
      { p: "exhale", c: 4, d: 4000 }, { p: "hold", c: 4, d: 4000 },
    ];
    let i = 0, cycles = 0;
    function tick() {
      setBreathPhase(seq[i].p); setBreathCount(seq[i].c);
      let c = seq[i].c;
      const cd = setInterval(() => { c--; setBreathCount(c); if (c <= 0) clearInterval(cd); }, 1000);
      timerRef.current = setTimeout(() => {
        i = (i + 1) % seq.length;
        if (i === 0) { cycles++; setBreathCycle(cycles); if (cycles >= 4) { setPhase("replacement"); return; } }
        tick();
      }, seq[i].d);
    }
    tick();
  }

  function runSigh() {
    const seq = [{ p: "inhale", c: 2 }, { p: "inhale", c: 1 }, { p: "exhale", c: 6 }];
    let i = 0;
    function tick() {
      setBreathPhase(seq[i].p); setBreathCount(seq[i].c);
      let c = seq[i].c;
      const cd = setInterval(() => { c--; setBreathCount(c); if (c <= 0) clearInterval(cd); }, 1000);
      timerRef.current = setTimeout(() => {
        i++;
        if (i >= seq.length) {
          i = 0;
          setBreathCycle(prev => { const n = prev + 1; if (n >= 5) { setPhase("replacement"); return n; } return n; });
        }
        tick();
      }, seq[i].c * 1000 + 200);
    }
    tick();
  }

  async function logAndReturn() {
    try { await supabase.from("activation_logs").insert({ partner_id: partner.id, couple_id: partner.couple_id, level: activation, regulation_tool: tool, note: note.trim() || null }); }
    catch(e) { console.error(e); }
    onLog();
  }

  const breathLabel = { inhale: "Breathe in", hold: "Hold", exhale: "Breathe out" }[breathPhase];
  const breathInstr = { inhale: "Slow breath in through your nose…", hold: "Hold gently…", exhale: "Slow breath out through your mouth…" }[breathPhase];

  if (phase === "check") return (
    <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up"><button className="back-btn" onClick={onBack}>← Back</button></div>
      <div style={{ padding: "0 44px 44px", flex: 1, overflowY: "auto" }} className="fade-up delay-1">
        <div style={{ height: 20 }} />
        <div className="eyebrow">Regulate</div>
        <div className="heading-md">Where are you right now?</div>
        <p className="body-text" style={{ margin: "10px 0 24px" }}>Check in with your nervous system. There's no right answer — just honest.</p>
        <div className="field">
          <label>My activation level</label>
          <div className="slider-wrap">
            <div className="slider-val" style={{ color: activationColor(activation) }}>{activation}</div>
            <input type="range" min="1" max="10" value={activation} onChange={e => setActivation(parseInt(e.target.value))} />
            <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
          </div>
        </div>
        <div className="insight">
          {activation <= 4 && "You're in your window. You can think clearly right now."}
          {activation > 4 && activation <= 7 && "You're activated. Your nervous system is working hard. Let's help it slow down."}
          {activation > 7 && "You're flooded. Your thinking brain is offline right now. That's not a flaw — it's biology. Let's regulate first."}
        </div>
        <div style={{ height: 24 }} />
        <button className="btn btn-primary-wide" onClick={() => setPhase("tool-select")}>Choose a regulation tool</button>
      </div>
    </AppScreen>
  );

  if (phase === "tool-select") return (
    <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up"><button className="back-btn" onClick={() => setPhase("check")}>← Back</button></div>
      <div style={{ padding: "0 44px 44px", flex: 1, overflowY: "auto" }} className="fade-up delay-1">
        <div style={{ height: 20 }} />
        <div className="eyebrow">Choose a tool</div>
        <div className="heading-md">How do you want to regulate?</div>
        <p className="body-text" style={{ margin: "10px 0 24px" }}>All three work. Pick the one that feels right for right now.</p>
        {[
          { id: "breathing", icon: "⬜", title: "Box Breathing", desc: "Inhale 4 · Hold 4 · Exhale 4 · Hold 4. Four cycles.", action: () => { setTool("breathing"); setBreathPhase("inhale"); setBreathCount(4); setBreathCycle(0); setPhase("breathing"); } },
          { id: "sigh",      icon: "💨", title: "Physiological Sigh", desc: "Double inhale + long exhale. Fastest way to calm your nervous system.", action: () => { setTool("sigh"); setBreathPhase("inhale"); setBreathCount(2); setBreathCycle(0); setPhase("sigh"); } },
          { id: "grounding", icon: "🌿", title: "5-4-3-2-1 Grounding", desc: "Use your senses to come back to the present moment.", action: () => { setTool("grounding"); setGroundStep(0); setPhase("grounding"); } },
        ].map(opt => (
          <div key={opt.id} className="card card-hover" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }} onClick={opt.action}>
            <span style={{ fontSize: "1.3rem" }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div className="heading-sm" style={{ marginBottom: 3 }}>{opt.title}</div>
              <p className="body-text" style={{ margin: 0 }}>{opt.desc}</p>
            </div>
            <span style={{ color: "var(--ink-faint)" }}>→</span>
          </div>
        ))}
      </div>
    </AppScreen>
  );

  if (phase === "breathing" || phase === "sigh") return (
    <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "36px 44px 44px" }}>
        <div className="eyebrow fade-up">{phase === "breathing" ? "Box Breathing" : "Physiological Sigh"}</div>
        <div className="breathing-wrap">
          <div className={`breath-circle ${breathPhase}`}>
            <div style={{ textAlign: "center" }}>
              <div className="breath-count">{breathCount}</div>
              <div className="breath-phase">{breathLabel}</div>
            </div>
          </div>
          <div className="breath-instruction">{breathInstr}</div>
          {breathCycle > 0 && <p className="caption-text">Cycle {breathCycle} of {phase === "breathing" ? 4 : 5}</p>}
        </div>
        <button className="btn btn-ghost btn-full" onClick={() => setPhase("replacement")}>Skip to next step</button>
      </div>
    </AppScreen>
  );

  if (phase === "grounding") {
    const gs = GROUND[groundStep] || GROUND[GROUND.length - 1];
    return (
      <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "36px 44px 44px" }}>
          <div className="eyebrow fade-up">5-4-3-2-1 Grounding</div>
          <div className="breathing-wrap">
            <div className="grounding-num">{gs.n}</div>
            <div className="grounding-sense">{gs.sense}</div>
            <div className="grounding-prompt">{gs.prompt}</div>
          </div>
          {groundStep < GROUND.length - 1
            ? <button className="btn btn-primary-wide" onClick={() => setGroundStep(s => s + 1)}>Done — next sense</button>
            : <button className="btn btn-primary-wide" onClick={() => setPhase("replacement")}>I'm grounded — continue</button>
          }
          <button className="btn btn-ghost btn-full" onClick={() => setPhase("replacement")} style={{ marginTop: 10 }}>Skip</button>
        </div>
      </AppScreen>
    );
  }

  if (phase === "replacement") return (
    <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div style={{ padding: "36px 44px 44px", flex: 1 }} className="fade-up">
        <div className="eyebrow">Your plan for this moment</div>
        <div className="heading-md">You've regulated.<br/>Now what?</div>
        {setup?.replacement_behavior && setup?.default_behavior ? (
          <>
            <p className="body-text" style={{ margin: "10px 0" }}>You set this intention when you were calm. Here it is.</p>
            <div className="replacement-card">
              <div className="rep-instead">Instead of</div>
              <div className="rep-old">{setup.default_behavior}</div>
              <div className="rep-will">I will</div>
              <div className="rep-new">"{setup.replacement_behavior}"</div>
            </div>
            <p className="caption-text" style={{ textAlign: "center" }}>This was your choice when you were calm. It still is.</p>
          </>
        ) : (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="heading-sm">No replacement behavior set yet</div>
            <p className="body-text">You haven't defined your replacement behavior in Setup yet. Add it when you're calm — it's the missing piece.</p>
          </div>
        )}
        <div style={{ height: 24 }} />
        <button className="btn btn-primary-wide" onClick={() => setPhase("log")}>Log this moment</button>
        <button className="btn btn-ghost btn-full" onClick={onBack} style={{ marginTop: 10 }}>Return to dashboard</button>
      </div>
    </AppScreen>
  );

  if (phase === "log") return (
    <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div style={{ padding: "36px 44px 44px", flex: 1 }} className="fade-up">
        <div className="eyebrow">Log it</div>
        <div className="heading-md">One more thing</div>
        <p className="body-text" style={{ margin: "10px 0 20px" }}>Optional — add a note about what was happening.</p>
        <div className="field"><label>What was the context? (optional)</label><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What triggered you? What did you notice? What helped?" rows={5} /></div>
        <div style={{ height: 16 }} />
        <button className="btn btn-primary-wide" onClick={logAndReturn}>Save and return home</button>
      </div>
    </AppScreen>
  );

  return null;
}

// ─── REPAIR SCREEN ─────────────────────────────────────────────────────────────
function RepairScreen({ partner, setup, onBack, onLog, onNavigate, partnerData }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [activation, setActivation] = useState(5);
  const [selected, setSelected] = useState({});
  const [logData, setLogData] = useState({ what: "", underneath: "", worked: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slideDir, setSlideDir] = useState("forward");

  function toggleScript(phase, text) {
    setSelected(p => ({ ...p, [phase]: p[phase] === text ? null : text }));
  }

  function go(dir) {
    setSlideDir(dir > 0 ? "forward" : "back");
    setCardIndex(i => i + dir);
  }

  async function saveRepair() {
    setSaving(true);
    try {
      await supabase.from("conflict_logs").insert({
        couple_id: partner.couple_id,
        initiated_by: partner.id,
        what_happened: logData.what.trim() || null,
        underneath: logData.underneath.trim() || null,
        what_worked: logData.worked.trim() || null,
        repair_completed: true,
      });
      setSaved(true);
      setTimeout(() => onLog(), 1400);
    } catch(e) { console.error(e); setSaving(false); }
  }

  // ── Build the card deck ──────────────────────────────────────────────────────
  const SCRIPT_PHASES = [
    {
      id: "opening",
      label: "Start the conversation",
      scripts: REPAIR_SCRIPTS.opening,
    },
    {
      id: "accountability",
      label: "Take responsibility",
      scripts: REPAIR_SCRIPTS.accountability,
    },
    {
      id: "softening",
      label: "Share the softer emotion",
      scripts: REPAIR_SCRIPTS.softening,
    },
    {
      id: "request",
      label: "Make a request",
      scripts: REPAIR_SCRIPTS.request,
    },
  ];

  const FOUR_RS = [
    { r: "Regret", desc: "Express genuine remorse for the impact, regardless of intention.", example: `"I'm really sorry that what I said hurt you. That was not okay."` },
    { r: "Responsibility", desc: "Own what you did without minimizing or deflecting. Just the behavior.", example: `"I was sarcastic and I shut down the conversation. That's on me."` },
    { r: "Recognition", desc: "Acknowledge what your partner experienced — their feelings, their perspective.", example: `"I can see why you felt dismissed. Your point was valid."` },
    { r: "Remedy", desc: "Offer what you'll do differently. Make it concrete and small.", example: `"Next time I feel frustrated, I'm going to ask for a pause before I respond."` },
  ];

  const cards = [
    // ── Card 0: Activation gate ──
    {
      key: "check",
      render: () => (
        <div>
          <div className="eyebrow">Before we start</div>
          <div className="heading-md">Where are you right now?</div>
          <p className="body-text" style={{ margin: "10px 0 24px" }}>
            Repair only works when both partners are below a 5. If you're still flooded, regulate first.
          </p>
          <div className="field">
            <label>My activation level</label>
            <div className="slider-wrap">
              <div className="slider-val" style={{ color: activationColor(activation) }}>{activation}</div>
              <input type="range" min="1" max="10" value={activation}
                onChange={e => setActivation(parseInt(e.target.value))} />
              <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
            </div>
          </div>
          {activation > 5 ? (
            <>
              <div className="insight">At {activation}/10, repair is hard. Your nervous system is still in protect mode.</div>
              <div style={{ height: 16 }} />
              <button className="btn btn-outline btn-full" onClick={onBack}>Regulate first →</button>
              <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => go(1)}>I want to try anyway</button>
            </>
          ) : (
            <>
              <div className="insight">Good. At {activation}/10, real conversation is possible.</div>
              <div style={{ height: 20 }} />
              <button className="btn btn-primary-wide" onClick={() => go(1)}>Begin repair →</button>
            </>
          )}
        </div>
      ),
    },

    // ── Card 1: Why repair matters ──
    {
      key: "why",
      render: () => (
        <div>
          <div className="eyebrow">Repair Framework</div>
          <div className="heading-md">Why repair matters</div>
          <p className="body-text" style={{ margin: "12px 0 16px", lineHeight: 1.65 }}>
            Every relationship has ruptures. What separates secure couples from disconnected ones isn't the absence of conflict — it's the quality of repair.
          </p>
          <div className="insight">
            "Repair within 24 hours. The longer you wait, the more the narrative solidifies and resentment pools beneath the surface."
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>The 5-step process</div>
            {[
              { num: 1, title: "Name the behavior", desc: "Be specific — not 'I was rude' but 'I raised my voice and interrupted you.'" },
              { num: 2, title: "Take ownership", desc: "No justification. No 'but you…'. Ownership without conditions." },
              { num: 3, title: "Acknowledge the impact", desc: "Even if unintended — impact matters more than intention." },
              { num: 4, title: "Name the feeling underneath", desc: "What were you actually feeling? Fear? Rejection? Name the real thing." },
              { num: 5, title: "Offer reconnection", desc: "Not what you want to say — what your partner needs to receive right now." },
            ].map(r => (
              <div key={r.num} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: "var(--ink)",
                  color: "rgba(252,251,249,0.95)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--serif)", fontSize: "0.78rem", flexShrink: 0, marginTop: 1
                }}>{r.num}</div>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "0.95rem", fontWeight: 400, color: "var(--ink)", marginBottom: 3 }}>{r.title}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 300, color: "var(--ink-muted)", lineHeight: 1.55 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // ── Cards 2-5: Script phases (one per card) ──
    ...SCRIPT_PHASES.map((phase, pi) => ({
      key: `script_${phase.id}`,
      render: () => (
        <div>
          <div className="eyebrow">Step {pi + 2} of 6</div>
          <div className="heading-md">{phase.label}</div>
          <p className="body-text" style={{ margin: "8px 0 18px" }}>Choose the phrase that feels closest to true for you right now.</p>
          {phase.scripts.map(s => (
            <div
              key={s.text}
              className={`script-card${selected[phase.id] === s.text ? " selected" : ""}`}
              onClick={() => toggleScript(phase.id, s.text)}
            >
              <div className="script-text">"{s.text}"</div>
              <div className="script-ctx">{s.ctx}</div>
            </div>
          ))}
        </div>
      ),
    })),

    // ── Card 6: The 4 Rs ──
    {
      key: "fourRs",
      render: () => (
        <div>
          <div className="eyebrow">Deepen the repair</div>
          <div className="heading-md">The 4 Rs of Apology</div>
          <p className="body-text" style={{ margin: "10px 0 18px" }}>These are language builders — not a script. Use them to form your own words.</p>
          {FOUR_RS.map((item) => (
            <div key={item.r} style={{
              background: "rgba(252,251,249,0.65)", border: "1px solid rgba(255,255,255,0.65)",
              borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 10,
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(30,33,40,0.08)", border: "1px solid rgba(30,33,40,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--serif)", fontSize: "0.92rem", fontWeight: 400,
                  color: "var(--ink)", flexShrink: 0
                }}>{item.r[0]}</div>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "0.95rem", fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>{item.r}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 300, color: "var(--ink-muted)", lineHeight: 1.55, marginBottom: 6 }}>{item.desc}</div>
                  <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "0.82rem", color: "var(--ink-soft)", lineHeight: 1.5 }}>{item.example}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },

    // ── Card 7: Log it ──
    {
      key: "log",
      render: () => (
        <div>
          <div className="eyebrow">Log the repair</div>
          <div className="heading-md">Capture what happened</div>
          <p className="body-text" style={{ margin: "10px 0 22px" }}>Optional but powerful. Patterns only become visible when you name them.</p>
          <div className="field">
            <label>What was the conflict about?</label>
            <textarea value={logData.what} onChange={e => setLogData(d => ({ ...d, what: e.target.value }))}
              placeholder="What triggered it? What happened?" rows={3} />
          </div>
          <div className="field">
            <label>What was underneath it for you?</label>
            <textarea value={logData.underneath} onChange={e => setLogData(d => ({ ...d, underneath: e.target.value }))}
              placeholder="The real feeling beneath the reaction…" rows={3} />
          </div>
          <div className="field">
            <label>What helped?</label>
            <textarea value={logData.worked} onChange={e => setLogData(d => ({ ...d, worked: e.target.value }))}
              placeholder="What moved things toward safety?" rows={2} />
          </div>
          {saved ? (
            <div className="msg-success">Repair logged. Well done. ✦</div>
          ) : (
            <button className="btn btn-primary-wide" disabled={saving} onClick={saveRepair}>
              {saving ? "Saving…" : "Save and finish"}
            </button>
          )}
          <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={onLog}>Skip and return home</button>
        </div>
      ),
    },
  ];

  const total = cards.length;
  const card = cards[cardIndex];
  const isFirst = cardIndex === 0;
  const isLast = cardIndex === total - 1;

  return (
    <AppScreen screen="repair" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      {/* Top bar */}
      <div className="top-bar fade-up">
        <button className="back-btn" onClick={() => isFirst ? onBack() : go(-1)}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 300, color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
            {cardIndex + 1} / {total}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "10px 44px 0" }}>
        <div style={{ height: 3, background: "rgba(120,130,155,0.12)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2, background: "var(--ink)",
            width: `${((cardIndex + 1) / total) * 100}%`,
            transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)"
          }} />
        </div>
      </div>

      {/* Card area */}
      <div
        key={card.key}
        className="fade-up delay-1"
        style={{ padding: "20px 44px 44px", flex: 1, overflowY: "auto" }}
      >
        {card.render()}

        {/* Navigation footer — show Next on all non-check cards except the last */}
        {!isLast && cardIndex > 0 && (
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary-wide" onClick={() => go(1)}>
              {cardIndex === total - 2 ? "Log this repair →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </AppScreen>
  );
}

// ─── REFLECT SCREEN ────────────────────────────────────────────────────────────
function ReflectScreen({ partner, setup, onBack, onSave, onNavigate, partnerData }) {
  const [reflection, setReflection] = useState("");
  const [missed, setMissed] = useState("");
  const [cycleUpdate, setCycleUpdate] = useState(setup?.cycle_map_my_side || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await supabase.from("conflict_logs").insert({ couple_id: partner.couple_id, initiated_by: partner.id, what_happened: reflection.trim() || null, missed_moment: missed.trim() || null, repair_completed: false });
      if (cycleUpdate !== setup?.cycle_map_my_side) await supabase.from("setup").update({ cycle_map_my_side: cycleUpdate, updated_at: new Date().toISOString() }).eq("partner_id", partner.id);
      onSave();
    } catch(e) { console.error(e); } finally { setSaving(false); }
  }

  return (
    <AppScreen screen="reflect" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up"><button className="back-btn" onClick={onBack}>← Back</button></div>
      <div style={{ padding: "0 44px 44px", flex: 1, overflowY: "auto" }} className="fade-up delay-1">
        <div style={{ height: 20 }} />
        <div className="eyebrow">Reflect</div>
        <div className="heading-md">What happened, and what did you learn?</div>
        <p className="body-text" style={{ margin: "10px 0 14px" }}>Calm-moment work. You're looking at the pattern from the outside now.</p>
        <div className="insight">"The goal isn't to figure out who was right. It's to find where the pattern started."</div>
        <div style={{ height: 18 }} />
        <div className="field"><label>What happened?</label><textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="Describe the conflict as honestly as you can…" rows={4} /></div>
        <div className="field"><label>Where was the earliest intervention point?</label><textarea value={missed} onChange={e => setMissed(e.target.value)} placeholder="When did your body first signal you were getting activated?" rows={3} /></div>
        <div className="field"><label>Update your cycle map (optional)</label><textarea value={cycleUpdate} onChange={e => setCycleUpdate(e.target.value)} placeholder="Has your understanding of your side of the pattern changed?" rows={4} /></div>
        <div style={{ height: 16 }} />
        <button className="btn btn-primary-wide" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save reflection"}</button>
      </div>
    </AppScreen>
  );
}

// ─── GOALS SCREEN — multiple goals, proper sidebar nav ────────────────────────
function GoalsScreen({ partner, setup, onBack, onSave, onNavigate, partnerData }) {
  const [goals, setGoals] = useState(() => {
    // Support both old single-string format and new array format
    const raw = setup?.shared_goals;
    if (!raw) return [{ id: 1, text: "" }];
    if (typeof raw === "string") return raw ? [{ id: 1, text: raw }] : [{ id: 1, text: "" }];
    return raw.length > 0 ? raw : [{ id: 1, text: "" }];
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateGoal(id, text) { setGoals(g => g.map(x => x.id === id ? { ...x, text } : x)); }
  function addGoal() { setGoals(g => [...g, { id: Date.now(), text: "" }]); }
  function removeGoal(id) { if (goals.length === 1) return; setGoals(g => g.filter(x => x.id !== id)); }

  async function save() {
    setSaving(true);
    try {
      await supabase.from("setup").update({ shared_goals: goals, updated_at: new Date().toISOString() }).eq("partner_id", partner.id);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch(e) { console.error(e); } finally { setSaving(false); }
  }

  return (
    <AppScreen screen="goals" layout="sidebar" activeNav="goals" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="main-header fade-up">
        <div className="eyebrow">Our Goals</div>
        <div className="heading">What you're working toward.</div>
        <div className="subheading">The anchor. When things feel hard, this is why.</div>
      </div>
      <div className="main-body">
        {saved && <div className="msg-success fade-up">Goals saved.</div>}

        <div className="fade-up delay-1">
          <div className="section-label">Our shared goals</div>
          <p className="body-text" style={{ marginBottom: 16 }}>Add as many as you need. Be specific — not "communicate better" but what you actually want to stop happening.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {goals.map((g, i) => (
              <div key={g.id} className="card" style={{ position: "relative", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="eyebrow" style={{ marginBottom: 0 }}>Goal {i + 1}</div>
                  {goals.length > 1 && (
                    <button onClick={() => removeGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-faint)", fontSize: "0.78rem", padding: "2px 6px", transition: "color 0.15s" }}
                      onMouseEnter={e => e.target.style.color = "var(--ink-muted)"} onMouseLeave={e => e.target.style.color = "var(--ink-faint)"}>
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  style={{ width: "100%", background: "rgba(252,251,249,0.65)", border: "1px solid rgba(255,255,255,0.60)", borderRadius: "var(--radius-sm)", padding: "11px 14px", fontFamily: "var(--sans)", fontSize: "0.84rem", fontWeight: 300, color: "var(--ink)", outline: "none", resize: "vertical", minHeight: 80, lineHeight: 1.6 }}
                  value={g.text} rows={3}
                  placeholder="What we want for our relationship is…"
                  onChange={e => updateGoal(g.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={addGoal} style={{ marginTop: 10 }}>+ Add another goal</button>
        </div>

        <div className="fade-up delay-2">
          <button className="btn btn-primary-wide" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save goals"}
          </button>
        </div>

        <div className="divider fade-up delay-3" />

        <div className="fade-up delay-3">
          <div className="section-label">Glimmer journal</div>
          <p className="body-text" style={{ marginBottom: 16 }}>A glimmer is a small moment of connection or safety. Noticing them trains your nervous system to see more of them.</p>
          <GlimmerAdd partner={partner} />
        </div>
      </div>
    </AppScreen>
  );
}

// ─── GLIMMER SCREEN ────────────────────────────────────────────────────────────
function GlimmerScreen({ partner, onBack, onNavigate, partnerData }) {
  return (
    <AppScreen screen="goals" layout="sidebar" activeNav="goals" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up"><button className="back-btn" onClick={onBack}>← Back</button></div>
      <div style={{ padding: "0 44px 44px", flex: 1, overflowY: "auto" }} className="fade-up delay-1">
        <div style={{ height: 20 }} />
        <div className="eyebrow">Glimmer Journal</div>
        <div className="heading-md">Add a glimmer</div>
        <p className="body-text" style={{ margin: "10px 0 20px" }}>A glimmer is a small moment of connection, safety, or warmth. They're easy to miss. Naming them helps your nervous system register more of them.</p>
        <GlimmerAdd partner={partner} />
      </div>
    </AppScreen>
  );
}

function GlimmerAdd({ partner }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function add() {
    if (!text.trim()) return;
    setSaving(true);
    try { await supabase.from("glimmers").insert({ partner_id: partner.id, couple_id: partner.couple_id, text: text.trim() }); setText(""); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch(e) { console.error(e); } finally { setSaving(false); }
  }

  return (
    <>
      {saved && <div className="msg-success">Glimmer added ✦</div>}
      <div className="field"><label>What happened?</label><textarea value={text} onChange={e => setText(e.target.value)} placeholder="We laughed together today. They reached for my hand. I felt safe." rows={3} /></div>
      <button className="btn btn-outline btn-full" disabled={saving || !text.trim()} onClick={add}>{saving ? "Saving…" : "Add glimmer ✦"}</button>
    </>
  );
}

// ─── ESCALATE SCREEN (full STOP + 5-step + scripts) ───────────────────────────
function EscalateScreen({ partner, setup, onBack, onNavigate, partnerData }) {
  const [activation, setActivation] = useState(5);
  const [returnTime, setReturnTime] = useState("");
  const shouldPause = activation > 6;

  const STEPS = [
    { label: "Name It", text: "Say out loud: 'We're escalating.' No blame — just observation. Naming the pattern externalizes it.", phrase: '"We\'re escalating."' },
    { label: "Check Activation", text: "Rate 0–10. If either is above 6 → pause. If both below 6 → continue.", phrase: '"I\'m at a ___ right now."' },
    { label: "Upset or Triggered?", text: "Is this about something happening now — or is it touching an old wound? That answer changes everything.", phrase: '"Is this about now, or is this old?"' },
    { label: "Respond Intentionally", text: "One feeling. One need. One request. No history stacking. No character attacks.", phrase: '"I felt ___ when ___. I need ___. Can we ___?"' },
    { label: "Repair if Needed", text: "If escalation happened before you caught it — name what you did, take ownership, offer reconnection. Within 24 hours.", phrase: '"I don\'t like how that went. Can we reset?"' },
  ];

  return (
    <AppScreen screen="regulate" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up"><button className="back-btn" onClick={onBack}>← Back</button></div>
      <div style={{ padding: "0 44px 48px", flex: 1, overflowY: "auto" }} className="fade-up delay-1">
        <div style={{ height: 16 }} />
        <div className="eyebrow">We're escalating</div>
        <div className="heading-md">Stop here first.</div>
        <p className="body-text" style={{ margin: "10px 0 20px" }}>Before you say anything to your partner — interrupt yourself first.</p>

        {/* STOP skill */}
        <div className="card" style={{ marginBottom: 24, background: "rgba(255,254,252,0.85)", border: "1px solid rgba(255,255,255,0.80)" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>The STOP Skill — Internal, body-first</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {[
              { l: "S", w: "Stop", d: "Freeze. Don't act on the urge. Don't speak, text, or do anything yet." },
              { l: "T", w: "Take a Breath", d: "One slow breath. In through the nose, out through the mouth." },
              { l: "O", w: "Observe", d: "Notice what's happening inside. Body? Thoughts? Feelings? No judgment." },
              { l: "P", w: "Proceed Mindfully", d: "Now choose your next move consciously. What do you actually want?" },
            ].map(s => (
              <div key={s.l} style={{ background: "var(--surface-sm)", border: "1px solid var(--stroke-sm)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 300, color: "var(--ink)", lineHeight: 1, marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontSize: "0.76rem", fontWeight: 400, color: "var(--ink-soft)", marginBottom: 3 }}>{s.w}</div>
                <div className="caption-text">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="insight" style={{ marginTop: 14, marginBottom: 0 }}>"My body is activated right now. I'm going to stop and breathe before I do or say anything else."</div>
        </div>

        {/* Activation check */}
        <div className="section-label">Step 1 — Check your activation</div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="field">
            <label>My activation right now</label>
            <div className="slider-wrap">
              <div className="slider-val" style={{ color: activationColor(activation) }}>{activation}/10</div>
              <input type="range" min="1" max="10" value={activation} onChange={e => setActivation(parseInt(e.target.value))} />
              <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
            </div>
          </div>
          <div className="insight" style={{ marginBottom: 0 }}>
            {activation <= 6 ? "You can continue. Move to the 5-step protocol below." : "⚠ You're flooded. Pause before continuing — use Step 2."}
          </div>
        </div>

        {/* Pause */}
        {shouldPause && (
          <div className="card-bright fade-up" style={{ marginBottom: 20 }}>
            <div className="section-label">Step 2 — Pause & set a return time</div>
            <p className="body-text" style={{ marginBottom: 14 }}>The pause is not abandonment. It is stabilization. Say the return time out loud before you leave the room.</p>
            <div className="insight">"I'm coming back. I just need to reset. I'm not leaving — I need <strong>X minutes</strong> and then I'm back with you."</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {["20 min", "30 min", "1 hour", "After sleep", "Tomorrow morning"].map(t => (
                <button key={t} className={`pill${returnTime === t ? " active" : ""}`} onClick={() => setReturnTime(t)}>{t}</button>
              ))}
            </div>
            {returnTime && <p className="caption-text" style={{ marginTop: 10 }}>Returning at: {returnTime} from now. Stay in your own space until then.</p>}
          </div>
        )}

        {/* 5-step protocol */}
        <div className="section-label" style={{ marginTop: 8 }}>The 5-step protocol — when you return</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div key={i} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--ink-faint)", lineHeight: 1, flexShrink: 0, minWidth: 20, textAlign: "center" }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="heading-sm" style={{ marginBottom: 4 }}>{s.label}</div>
                <p className="body-text" style={{ margin: "0 0 6px" }}>{s.text}</p>
                <div className="insight" style={{ marginBottom: 0, padding: "8px 12px" }}>{s.phrase}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-bright" style={{ textAlign: "center", padding: "20px 24px", marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>The formula</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)" }}>
            <em>Feeling</em> &nbsp;+&nbsp; <em>Ownership</em> &nbsp;+&nbsp; <em>Request</em>
          </div>
        </div>

        <button className="btn btn-primary-wide" onClick={() => onNavigate("repair")}>Ready to repair →</button>
        <button className="btn btn-ghost btn-full" onClick={onBack} style={{ marginTop: 10 }}>Back to dashboard</button>
      </div>
    </AppScreen>
  );
}

// ─── LEARN SCREEN — 6 tabs ─────────────────────────────────────────────────────
const LEARN_TABS = [
  { id: "profile",  label: "Who Am I in Conflict" },
  { id: "window",   label: "Window of Tolerance" },
  { id: "cycle",    label: "Map Your Loop" },
  { id: "deeper",   label: "The Deeper Cycle" },
  { id: "practice", label: "Into Practice" },
  { id: "shared",   label: "👥 Our Shared View" },
];

function LearnScreen({ partner, setup, onBack, onNavigate, partnerData }) {
  const [tab, setTab] = useState("profile");
  const [learnData, setLearnData] = useState({});
  const [saving, setSaving] = useState(false);

  async function save(updates) {
    const merged = { ...learnData, ...updates };
    setLearnData(merged);
    setSaving(true);
    try { await supabase.from("setup").update({ learn_data: merged, updated_at: new Date().toISOString() }).eq("partner_id", partner.id); }
    catch(e) { console.error(e); } finally { setSaving(false); }
  }

  useEffect(() => {
    if (setup?.learn_data) setLearnData(setup.learn_data);
  }, [setup]);

  const TABS_LIST = LEARN_TABS;
  const idx = TABS_LIST.findIndex(t => t.id === tab);

  function next() {
    if (idx < TABS_LIST.length - 1) setTab(TABS_LIST[idx + 1].id);
  }

  return (
    <AppScreen screen="reflect" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="caption-text">{idx + 1} of {TABS_LIST.length}</span>
      </div>

      {/* Tab bar */}
      <div style={{ padding: "12px 44px 0", overflowX: "auto", display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.32)", flexShrink: 0 }} className="fade-up delay-1">
        {TABS_LIST.map((t, i) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--sans)", fontSize: "0.70rem", fontWeight: tab === t.id ? 400 : 300,
            color: tab === t.id ? "var(--ink)" : "var(--ink-muted)",
            padding: "8px 12px", borderBottom: tab === t.id ? "2px solid var(--ink)" : "2px solid transparent",
            whiteSpace: "nowrap", letterSpacing: "0.03em", transition: "all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 44px 48px", flex: 1, overflowY: "auto" }} className="fade-up delay-2">
        {tab === "profile"  && <ProfileTab  data={learnData} onSave={save} partner={partner} onNext={next} />}
        {tab === "window"   && <WindowTab   data={learnData} onSave={save} partner={partner} onNext={next} />}
        {tab === "cycle"    && <CycleTab    data={learnData} onSave={save} partner={partner} onNext={next} />}
        {tab === "deeper"   && <DeeperTab   data={learnData} onSave={save} partner={partner} onNext={next} />}
        {tab === "practice" && <PracticeTab data={learnData} onSave={save} partner={partner} onNext={next} />}
        {tab === "shared"   && <SharedView  data={learnData} onSave={save} partner={partner} onNavigate={onNavigate} />}
      </div>
    </AppScreen>
  );
}

// Chip component
function Chips({ fieldKey, options, data, onSave, color }) {
  const sel = data[fieldKey] || [];
  const toggle = v => onSave({ [fieldKey]: sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v] });
  return (
    <div className="pills" style={{ marginTop: 8 }}>
      {options.map(o => (
        <button key={o} className={`pill${sel.includes(o) ? " active" : ""}`} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

// Inline text input row
function LearnField({ label, fieldKey, data, onSave, placeholder, rows = 2 }) {
  const [val, setVal] = useState(data[fieldKey] || "");
  useEffect(() => setVal(data[fieldKey] || ""), [data[fieldKey]]);
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <textarea value={val} rows={rows} placeholder={placeholder}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { if (val !== (data[fieldKey] || "")) onSave({ [fieldKey]: val }); }} />
    </div>
  );
}

// ── TAB 1: WHO AM I IN CONFLICT ──
function ProfileTab({ data, onSave, partner, onNext }) {
  return (
    <div>
      <div className="heading-md">Who am I in conflict?</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>You can only control yourself. Before you can understand the cycle you create together, you have to understand what you do.</p>
      <div className="insight">Self-awareness before shared awareness. The more clearly you see your own pattern, the more choice you have in the moment.</div>
      <div style={{ height: 20 }} />

      <div className="field">
        <label>When conflict begins, I tend to…</label>
        <Chips fieldKey="profile_first_move" data={data} onSave={onSave} options={["Get louder", "Go quiet", "Explain myself", "Leave the room", "Cry", "Shut down", "Push back", "Try to fix it fast"]} />
      </div>
      <div className="field">
        <label>What I feel in my body when activated…</label>
        <Chips fieldKey="profile_body_signs" data={data} onSave={onSave} options={["Chest tightens", "Jaw clenches", "Heart races", "Stomach drops", "Go numb", "Shoulders tense", "Ears get hot", "Feel frozen"]} />
      </div>
      <div className="field">
        <label>What I tell myself during conflict…</label>
        <Chips fieldKey="profile_thoughts" data={data} onSave={onSave} options={["They don't care", "I'm being attacked", "I'm going to lose this", "Nothing I say matters", "This is hopeless", "I'm the problem", "They'll leave", "I have to fix this now"]} />
      </div>
      <div className="field">
        <label>What I actually feel underneath the reaction…</label>
        <Chips fieldKey="profile_underneath" data={data} onSave={onSave} options={["Scared", "Hurt", "Invisible", "Not enough", "Abandoned", "Trapped", "Overwhelmed", "Alone"]} />
      </div>
      <LearnField label="Anything else about how you show up in conflict?" fieldKey="profile_notes" data={data} onSave={onSave} placeholder="Write anything that doesn't fit above…" rows={3} />
      <div style={{ height: 20 }} />
      <button className="btn btn-primary-wide" onClick={onNext}>Next: Window of Tolerance →</button>
    </div>
  );
}

// ── TAB 2: WINDOW OF TOLERANCE ──
function WindowTab({ data, onSave, partner, onNext }) {
  return (
    <div>
      <div className="heading-md">Your window of tolerance</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>There's a zone where you can feel stressed, even angry — and still think clearly. Outside that window, your body takes over. You cannot resolve conflict outside your window.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {[
          { label: "↑ Above — Hyperarousal", desc: "Heart racing. Voice rising. Angry, reactive. You say things you don't mean.", bg: "rgba(192,88,72,0.07)", border: "rgba(192,88,72,0.18)" },
          { label: "↔ Inside — Regulated", desc: "You can feel upset and still stay present. Disagree without exploding. This is where real conversation happens.", bg: "rgba(122,158,142,0.08)", border: "rgba(122,158,142,0.22)" },
          { label: "↓ Below — Hypoarousal", desc: "System shuts down. Numb, foggy, frozen. You go quiet — not because you don't care, but because your body hit its limit.", bg: "rgba(100,115,150,0.07)", border: "rgba(100,115,150,0.18)" },
        ].map(z => (
          <div key={z.label} style={{ background: z.bg, border: `1px solid ${z.border}`, borderRadius: "var(--radius-sm)", padding: "12px 16px" }}>
            <div style={{ fontSize: "0.70rem", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 4 }}>{z.label}</div>
            <div className="body-text" style={{ margin: 0 }}>{z.desc}</div>
          </div>
        ))}
      </div>

      <LearnField label="Above my window, I notice:" fieldKey="window_above" data={data} onSave={onSave} placeholder="Physical signs, thoughts, behaviors…" />
      <LearnField label="Below my window, I notice:" fieldKey="window_below" data={data} onSave={onSave} placeholder="Signs of shutdown, numbness, going distant…" />
      <LearnField label="What helps me return to my window:" fieldKey="window_return" data={data} onSave={onSave} placeholder="Movement, breathing, grounding, space…" />

      <div className="insight">This is what the work is for. Not a perfect relationship — a regulated one.</div>
      <div style={{ height: 20 }} />
      <button className="btn btn-primary-wide" onClick={onNext}>Next: Map Your Loop →</button>
    </div>
  );
}

// ── TAB 3: MAP YOUR LOOP ──
function CycleTab({ data, onSave, partner, onNext }) {
  const cycleData = data.cycleMap || {};
  const updateCycle = (f, v) => onSave({ cycleMap: { ...cycleData, [f]: v } });

  return (
    <div>
      <div className="heading-md">How we create this together</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>Every couple stuck in the same fight has a loop. The topic changes, but the pattern stays the same. Map your side — then use the Shared View to see it together.</p>

      <div className="two-col" style={{ marginBottom: 20 }}>
        {[
          { title: "Pursue → Withdraw", desc: "One partner reaches for connection through intensity. The other pulls away.", note: "Pursuer feels abandoned. Withdrawer feels attacked. Both feel alone." },
          { title: "Attack → Defend", desc: "One partner leads with blame or accusation. The other defends or counterattacks.", note: "Neither feels heard. Conflict escalates without resolution." },
        ].map(p => (
          <div key={p.title} className="card" style={{ fontSize: "0.78rem" }}>
            <div style={{ fontWeight: 400, fontSize: "0.70rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>{p.title}</div>
            <p className="body-text" style={{ margin: "0 0 8px" }}>{p.desc}</p>
            <div className="insight" style={{ margin: 0, padding: "8px 10px", fontSize: "0.78rem" }}>{p.note}</div>
          </div>
        ))}
      </div>

      {[
        { key: "trigger",      label: "When I feel…",                        ph: "rejected / dismissed / controlled / invisible" },
        { key: "reaction",     label: "I tend to…",                          ph: "attack / go quiet / push / shut down / pursue" },
        { key: "partnerFeels", label: "Which makes my partner feel…",        ph: "attacked / alone / unsafe / smothered" },
        { key: "longFor",      label: "What I'm actually longing for…",      ph: "to feel safe / to matter / to feel close" },
      ].map(s => (
        <div key={s.key} className="field">
          <label>{s.label}</label>
          <input style={{ width: "100%", background: "rgba(252,251,249,0.65)", border: "1px solid rgba(255,255,255,0.60)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontFamily: "var(--sans)", fontSize: "0.84rem", color: "var(--ink)", outline: "none" }}
            placeholder={s.ph} value={cycleData[s.key] || ""} onChange={e => updateCycle(s.key, e.target.value)} />
        </div>
      ))}

      <div className="insight">↻ The enemy is the loop — not your partner.</div>
      <div style={{ height: 20 }} />
      <button className="btn btn-primary-wide" onClick={onNext}>Next: The Deeper Cycle →</button>
    </div>
  );
}

// ── TAB 4: THE DEEPER CYCLE (EFT) ──
const EFT_BEHAVIORS = { pursue: ["Criticize","Demand","Push to talk","Accuse","Protest","Chase"], withdraw: ["Go quiet","Shut down","Agree just to end it","Pull away","Become distant","Disappear"] };

function DeeperTab({ data, onSave, partner, onNext }) {
  const k = f => `eft_${f}`;
  const get = f => data[k(f)] || [];
  const getStr = f => data[k(f)] || "";
  const toggle = (field, val) => {
    const cur = get(field);
    onSave({ [k(field)]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] });
  };
  const move = getStr("move");
  const behaviorOptions = move === "pursue" ? EFT_BEHAVIORS.pursue : move === "withdraw" ? EFT_BEHAVIORS.withdraw : [...EFT_BEHAVIORS.pursue, ...EFT_BEHAVIORS.withdraw];

  return (
    <div>
      <div className="heading-md">What's actually happening underneath</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>What your partner sees during conflict is never the whole story. The behaviors on the surface are protective moves. Underneath every protective move is a feeling your partner can't see — and underneath that, something you're reaching for.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {[
          { label: "↑ Above the Line — What your partner can see", desc: "Your move (pursue, withdraw) and your protective emotions (anger, frustration). This is what lands on your partner.", bg: "rgba(192,88,72,0.07)", border: "rgba(192,88,72,0.16)" },
          { label: "— The Line of Consciousness —", desc: "What you can access when you slow down and look inward.", bg: "rgba(184,153,90,0.07)", border: "rgba(184,153,90,0.22)" },
          { label: "↓ Below the Line — What your partner can't see", desc: "Your vulnerable feelings (scared, hurt, alone) and your unmet need. This is the real message your protective move is trying to send.", bg: "rgba(122,158,142,0.08)", border: "rgba(122,158,142,0.20)" },
        ].map(z => (
          <div key={z.label} style={{ background: z.bg, border: `1px solid ${z.border}`, borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 3 }}>{z.label}</div>
            <div className="caption-text">{z.desc}</div>
          </div>
        ))}
      </div>

      <div className="insight" style={{ marginBottom: 20 }}>Your move is not the message. The cycle locks because the need stays hidden.</div>

      {/* Your move */}
      <div className="field">
        <label>Your move — what your partner sees</label>
        <div className="pills">
          {["pursue","withdraw","both"].map(v => (
            <button key={v} className={`pill${move === v ? " active" : ""}`} onClick={() => onSave({ [k("move")]: v })}>{v === "pursue" ? "I pursue" : v === "withdraw" ? "I withdraw" : "Both"}</button>
          ))}
        </div>
        {move && <div style={{ marginTop: 8 }}><Chips fieldKey={k("behaviors")} data={data} onSave={onSave} options={behaviorOptions} /></div>}
      </div>

      <div className="field">
        <label>Surface feelings — above the line</label>
        <Chips fieldKey={k("protective")} data={data} onSave={onSave} options={["Angry","Frustrated","Anxious","Resentful","Dismissed","Irritated","Jealous","Overwhelmed"]} />
      </div>
      <div className="field">
        <label>Vulnerable feelings — below the line</label>
        <Chips fieldKey={k("vulnerable")} data={data} onSave={onSave} options={["Scared","Hurt","Ashamed","Alone","Invisible","Not enough","Abandoned","Unloved","Longing","Hopeless"]} />
      </div>
      <div className="field">
        <label>What you're actually reaching for</label>
        <Chips fieldKey={k("needs")} data={data} onSave={onSave} options={["To know I matter","To feel close","To feel safe enough to open up","To feel seen","To feel like I'm enough","To not be alone in this"]} />
      </div>

      <div className="card-bright" style={{ textAlign: "center", padding: "18px 20px", marginTop: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>What you both share</div>
        <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "1rem", color: "var(--ink)", lineHeight: 1.6 }}>Underneath the cycle, you both want the same thing:<br />to feel safe, seen, and loved by each other.<br /><span style={{ color: "var(--ink-muted)", fontStyle: "normal", fontSize: "0.84rem" }}>The cycle is the obstacle — not your partner.</span></p>
      </div>

      <div style={{ height: 20 }} />
      <button className="btn btn-primary-wide" onClick={onNext}>Next: Into Practice →</button>
    </div>
  );
}

// ── TAB 5: INTO PRACTICE ──
function PracticeTab({ data, onSave, partner, onNext }) {
  const [triggers, setTriggers] = useState(data.myTriggers || [{ id: 1, trigger: "", tell: "", cope: "", need: "" }]);

  const updateTrigger = (id, field, val) => {
    const updated = triggers.map(t => t.id === id ? { ...t, [field]: val } : t);
    setTriggers(updated); onSave({ myTriggers: updated });
  };
  const addTrigger = () => {
    if (triggers.length >= 5) return;
    const updated = [...triggers, { id: Date.now(), trigger: "", tell: "", cope: "", need: "" }];
    setTriggers(updated); onSave({ myTriggers: updated });
  };

  return (
    <div>
      <div className="heading-md">From understanding to action</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>You now have a map. This section is where understanding becomes practice — specific enough to use in the actual moment.</p>

      <div className="section-label">My named triggers (3–5 max)</div>
      <p className="body-text" style={{ marginBottom: 14 }}>The more precisely you can name a trigger, the more quickly you'll recognize it — and catch yourself before the cycle engages.</p>

      {triggers.map((t, i) => (
        <div key={t.id} className="card" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.60rem", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-gold)", marginBottom: 12 }}>Trigger {i + 1}</div>
          {[
            { label: "The trigger", field: "trigger", ph: "When my partner says / does / doesn't do…" },
            { label: "What I tell myself", field: "tell", ph: "The story I run in my head…" },
            { label: "How I cope (what I actually do)", field: "cope", ph: "My automatic response…" },
            { label: "What I actually need", field: "need", ph: "The underlying need this trigger is touching…" },
          ].map(f => (
            <div key={f.field} className="field">
              <label>{f.label}</label>
              <input style={{ width: "100%", background: "rgba(252,251,249,0.65)", border: "1px solid rgba(255,255,255,0.60)", borderRadius: "var(--radius-sm)", padding: "11px 14px", fontFamily: "var(--sans)", fontSize: "0.84rem", color: "var(--ink)", outline: "none" }}
                placeholder={f.ph} value={t[f.field]} onChange={e => updateTrigger(t.id, f.field, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
      {triggers.length < 5 && (
        <button className="btn btn-ghost" onClick={addTrigger} style={{ marginBottom: 20 }}>+ Add another trigger ({triggers.length}/5)</button>
      )}

      <LearnField label="What pattern do I see across my triggers?" fieldKey="practice_observations" data={data} onSave={onSave} placeholder="What do they have in common? What does that tell you?" rows={3} />
      <LearnField label="My action items — what I'm going to do differently" fieldKey="practice_actions" data={data} onSave={onSave} placeholder="Specific, small, behavioral changes. Not 'be less reactive' — 'when I feel X, I will Y.'" rows={4} />
      <LearnField label="What I want my partner to know about my triggers" fieldKey="practice_share" data={data} onSave={onSave} placeholder="Context, background, or requests that would help them support you…" rows={3} />

      <div style={{ height: 20 }} />
      <button className="btn btn-primary-wide" onClick={onNext}>Next: Our Shared View →</button>
    </div>
  );
}

// ── TAB 6: SHARED VIEW ──
function SharedView({ data, onSave, partner, onNavigate }) {
  // Build bridge statement from EFT data
  const move = data["eft_move"] || "";
  const vulnerable = (data["eft_vulnerable"] || []).slice(0, 2).join(", ") || "_____";
  const need = (data["eft_needs"] || []).slice(0, 2).join(", ") || "_____";
  const hasEFT = !!(data["eft_move"] || (data["eft_vulnerable"] || []).length);
  const cycleData = data.cycleMap || {};
  const hasCycle = !!(cycleData.trigger || cycleData.reaction);

  return (
    <div>
      <div className="heading-md">Our shared view</div>
      <p className="body-text" style={{ margin: "10px 0 16px" }}>Both partners have completed their private sections. This is where you come together — to read each other's maps, see the combined cycle, and reflect. Sit together for this one.</p>
      <div className="insight" style={{ marginBottom: 20 }}>Only open this when both of you are regulated (below 5/10). This is not for conflict — it's for understanding.</div>

      {/* Combined cycle narrative */}
      <div className="section-label">Our combined cycle</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="caption-text" style={{ marginBottom: 12 }}>Read this aloud together. This is the cycle you create — not because you're bad at relationships, but because two nervous systems in threat mode lock into each other.</p>
        {hasCycle ? (
          <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "0.94rem", lineHeight: 2.2, color: "var(--ink-soft)" }}>
            <div>When I feel <strong>{cycleData.trigger || "___"}</strong>…</div>
            <div style={{ paddingLeft: 16 }}>I tend to <strong>{cycleData.reaction || "___"}</strong>.</div>
            <div style={{ paddingLeft: 16 }}>Which makes my partner feel <strong>{cycleData.partnerFeels || "___"}</strong>…</div>
            <div style={{ paddingLeft: 28 }}>And the loop starts again.</div>
          </div>
        ) : (
          <p className="caption-text" style={{ color: "var(--ink-faint)" }}>Complete Tab 3 (Map Your Loop) first.</p>
        )}
      </div>

      {/* Bridge statement */}
      <div className="section-label">My bridge statement</div>
      <p className="body-text" style={{ marginBottom: 12 }}>Share this with your partner when you're both calm. This is built from what you mapped in The Deeper Cycle.</p>
      {hasEFT ? (
        <div className="card" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "0.94rem", lineHeight: 2, color: "var(--ink)", marginBottom: 20 }}>
          "When I <strong>{move || "___"}</strong>, I'm not trying to hurt you.<br />
          I'm actually feeling <strong>{vulnerable}</strong>.<br />
          What I'm really reaching for is <strong>{need}</strong>.<br />
          <span style={{ fontStyle: "normal", color: "var(--ink-muted)", fontSize: "0.84rem" }}>The cycle is the problem — not you."</span>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="caption-text" style={{ color: "var(--ink-faint)" }}>Complete Tab 4 (The Deeper Cycle) first.</p>
        </div>
      )}

      {/* WOT side by side */}
      <div className="section-label">My window of tolerance</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {data.window_above ? (
          <div style={{ fontSize: "0.84rem", color: "var(--ink-soft)", lineHeight: 1.8 }}>
            {data.window_above && <div><strong>Above my window:</strong> {data.window_above}</div>}
            {data.window_below && <div><strong>Below my window:</strong> {data.window_below}</div>}
            {data.window_return && <div><strong>I return by:</strong> {data.window_return}</div>}
          </div>
        ) : (
          <p className="caption-text" style={{ color: "var(--ink-faint)" }}>Complete Tab 2 (Window of Tolerance) first.</p>
        )}
      </div>

      {/* Reflection fields */}
      <LearnField label="What do you notice about your combined loop? What surprised you?" fieldKey="shared_cycle_reflection" data={data} onSave={onSave} placeholder="What landed when you saw it together?" rows={4} />
      <LearnField label="What came up when you heard each other's bridge statement?" fieldKey="shared_eft_reflection" data={data} onSave={onSave} placeholder="What landed differently when you could see each other's hidden layer?" rows={4} />
      <LearnField label="Reflect together: what did you learn about each other?" fieldKey="shared_profile_reflect" data={data} onSave={onSave} placeholder="What surprised you? What do you want your partner to know you now understand?" rows={4} />

      <div style={{ height: 20 }} />
      <button className="btn btn-primary-wide" onClick={() => handleNav("agreement")}>Complete: Sign the Agreement →</button>
    </div>
  );
}

// ─── AGREEMENT SCREEN ──────────────────────────────────────────────────────────
function AgreementScreen({ partner, onBack, onNavigate, partnerData }) {
  const [sig, setSig] = useState("");
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);

  async function sign() {
    if (!sig.trim()) return;
    setSaving(true);
    try { await supabase.from("setup").update({ agreement_signed: true, agreement_sig: sig, updated_at: new Date().toISOString() }).eq("partner_id", partner.id); setSigned(true); }
    catch(e) { console.error(e); } finally { setSaving(false); }
  }

  const COMMITMENTS = [
    { num: 1, title: "We Commit to Safety First", text: "We will not use name-calling, character attacks, or threats during conflict. Emotional safety is the foundation of everything else." },
    { num: 2, title: "We Commit to the STOP Skill", text: "Before we say anything reactive, we will stop, breathe, and observe what's happening in our own bodies." },
    { num: 3, title: "We Commit to Pausing When Activated", text: "If either partner rates activation above 6/10, we will pause and name a return time. A pause is not abandonment — it is stabilization." },
    { num: 4, title: "We Commit to Present-Focused Conflict", text: "We will address one issue at a time. We will not stack past grievances onto current conversations." },
    { num: 5, title: "We Commit to Repair", text: "If escalation happens, we will attempt repair within 24 hours. We will name the behavior, take ownership, and offer reconnection." },
    { num: 6, title: "We Commit to Reinforcement", text: "We will actively look for glimmers and reinforce progress. Safety is built through repeated small shifts, not grand gestures." },
  ];

  return (
    <AppScreen screen="goals" layout="sidebar" activeNav="goals" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="top-bar fade-up"><button className="back-btn" onClick={onBack}>← Back</button></div>
      <div style={{ padding: "0 44px 48px", flex: 1, overflowY: "auto" }} className="fade-up delay-1">
        <div style={{ height: 16 }} />
        <div className="eyebrow">The Foundation Reset Agreement</div>
        <div className="heading-md">Your commitment to protecting the structure</div>
        <p className="body-text" style={{ margin: "10px 0 24px" }}>This is not a contract — it is a choice. A declaration that you are both willing to do something different.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {COMMITMENTS.map(c => (
            <div key={c.num} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--ink-faint)", lineHeight: 1, flexShrink: 0, minWidth: 20 }}>{c.num}</div>
              <div>
                <div className="heading-sm" style={{ marginBottom: 4 }}>{c.title}</div>
                <p className="body-text" style={{ margin: 0 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {!signed ? (
          <>
            <div className="field"><label>Sign with your name</label><input value={sig} onChange={e => setSig(e.target.value)} placeholder="Your first name…" /></div>
            <button className="btn btn-primary-wide" disabled={!sig.trim() || saving} onClick={sign}>{saving ? "Signing…" : "Sign the Agreement →"}</button>
          </>
        ) : (
          <div className="card-bright" style={{ textAlign: "center", padding: "22px" }}>
            <div style={{ fontSize: "0.60rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent-sage)", marginBottom: 8 }}>✓ Signed</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--ink)" }}>{sig}</div>
          </div>
        )}

        <div className="insight" style={{ marginTop: 24, textAlign: "center" }}>"It is not you vs. me. It is us protecting the structure."</div>
      </div>
    </AppScreen>
  );
}

// ─── UPDATED DASHBOARD — adds Learn tool card ──────────────────────────────────
function DashboardWithLearn({ partner, setup, logs, glimmers, partnerData, onNavigate }) {
  const last = logs?.[0];
  const setupDone = setup?.replacement_behavior && setup?.triggers?.length > 0;
  const recentGlimmers = glimmers?.slice(0, 3) || [];


  return (
    <AppScreen screen="dashboard" activeNav="dashboard" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="main-header fade-up">
        <div className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <div className="heading">{greeting()}, {partner?.name?.split(" ")[0]}.</div>
        <div className="subheading">What do you need right now?</div>
      </div>

      <div className="main-body">
        {!setupDone && (
          <div className="nudge-card fade-up delay-1">
            <div className="nudge-text">
              <div className="eyebrow" style={{ marginBottom: 5 }}>Finish your setup</div>
              <div className="heading-sm">Your replacement behavior isn't defined yet</div>
              <p className="body-text">This is the most important part of the system. You'll want it ready before you need it.</p>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate("setup")}>Complete Setup →</button>
          </div>
        )}

        {/* Heat tools */}
        <div className="fade-up delay-2">
          <div className="section-label">Something is happening right now</div>
          <div className="tools-grid">
            <div className="tool-card hot" onClick={() => onNavigate("escalate")}>
              <span className="tool-icon">🔥</span>
              <span className="tool-name">Escalating</span>
              <span className="tool-desc">We're in it right now</span>
            </div>
            <div className="tool-card hot" onClick={() => onNavigate("regulate")}>
              <span className="tool-icon">🌿</span>
              <span className="tool-name">Regulate</span>
              <span className="tool-desc">I need to calm my nervous system</span>
            </div>
            <div className="tool-card hot" onClick={() => onNavigate("repair")}>
              <span className="tool-icon">🤝</span>
              <span className="tool-name">Repair</span>
              <span className="tool-desc">After the fight</span>
            </div>
          </div>
        </div>

        {/* Learn tools */}
        <div className="fade-up delay-3">
          <div className="section-label">Understand & prevent</div>
          <div className="tools-grid">
            <div className="tool-card learn" onClick={() => onNavigate("learn")}>
              <span className="tool-icon">🏗️</span>
              <span className="tool-name">Learn the System</span>
              <span className="tool-desc">WOT · Cycle map · EFT · Shared view</span>
            </div>
            <div className="tool-card learn" onClick={() => onNavigate("reflect")}>
              <span className="tool-icon">🔍</span>
              <span className="tool-name">Reflect</span>
              <span className="tool-desc">Calm-moment pattern work</span>
            </div>
            <div className="tool-card learn" onClick={() => onNavigate("agreement")}>
              <span className="tool-icon">📜</span>
              <span className="tool-name">Agreement</span>
              <span className="tool-desc">Our shared commitments</span>
            </div>
          </div>
        </div>

        <div className="two-col fade-up delay-4">
          <div className="card-bright">
            <div className="eyebrow" style={{ marginBottom: 14 }}>My last logged state</div>
            {last ? (
              <>
                <div className="act-row">
                  <div className="act-track"><div className="act-fill" style={{ width: `${last.level * 10}%`, background: activationColor(last.level) }} /></div>
                  <div className="act-num">{last.level}</div>
                </div>
                <div className="act-meta">
                  <span className="act-state" style={{ color: activationColor(last.level) }}>{activationLabel(last.level)}</span>
                  <span className="act-tool">{fmtDate(last.created_at)}</span>
                </div>
                {last.note && <div className="act-note">"{last.note}"</div>}
              </>
            ) : <p className="body-text" style={{ color: "var(--ink-faint)" }}>No logs yet.</p>}
          </div>

          <div className="card-bright">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Recent glimmers</div>
            {recentGlimmers.length > 0 ? recentGlimmers.map(g => (
              <div className="glimmer-item" key={g.id}>
                <span className="g-star">✦</span>
                <span className="g-text">{g.text}</span>
                <span className="g-date">{fmtDate(g.created_at)}</span>
              </div>
            )) : <p className="body-text" style={{ color: "var(--ink-faint)" }}>No glimmers yet.</p>}
            <button className="btn btn-ghost" onClick={() => onNavigate("glimmer")} style={{ marginTop: 14, width: "100%" }}>+ Add a glimmer ✦</button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

// ─── TOOLS SCREEN ─────────────────────────────────────────────────────────────
function ToolsScreen({ partner, partnerData, onNavigate }) {
  const TOOLS = [
    {
      id: "escalate", icon: "🔥", name: "Escalating",
      desc: "We're in it right now. Get immediate support to stop the spiral.",
      type: "hot",
    },
    {
      id: "regulate", icon: "🌿", name: "Regulate",
      desc: "I need to calm my nervous system before I can do anything else.",
      type: "hot",
    },
    {
      id: "repair", icon: "🤝", name: "Repair",
      desc: "The fight is over. Now rebuild the bridge back to each other.",
      type: "hot",
    },
    {
      id: "learn", icon: "🏗️", name: "Learn the System",
      desc: "Window of tolerance · Cycle map · EFT · Shared view",
      type: "learn",
    },
    {
      id: "reflect", icon: "🔍", name: "Reflect",
      desc: "Calm-moment work. Look at the pattern from the outside.",
      type: "learn",
    },
    {
      id: "agreement", icon: "📜", name: "Agreement",
      desc: "Your shared commitments. The contract you both signed.",
      type: "learn",
    },
  ];

  return (
    <AppScreen screen="tools" layout="sidebar" activeNav="tools" onNavClick={onNavigate} partnerData={partnerData}>
      <div className="main-header fade-up">
        <div className="eyebrow">Tools</div>
        <div className="heading">What do you need?</div>
        <div className="subheading">Choose the right tool for the moment you're in.</div>
      </div>
      <div className="main-body">
        <div className="fade-up delay-1">
          <div className="section-label">Something is happening right now</div>
          <div className="tools-grid">
            {TOOLS.filter(t => t.type === "hot").map(t => (
              <div key={t.id} className="tool-card hot" onClick={() => onNavigate(t.id)}
                style={{ padding: "28px 18px 24px", cursor: "pointer" }}>
                <span className="tool-icon" style={{ fontSize: "1.8rem" }}>{t.icon}</span>
                <span className="tool-name" style={{ fontSize: "1.08rem" }}>{t.name}</span>
                <span className="tool-desc" style={{ fontSize: "0.70rem", lineHeight: 1.5 }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up delay-2" style={{ marginTop: 28 }}>
          <div className="section-label">Understand & prevent</div>
          <div className="tools-grid">
            {TOOLS.filter(t => t.type === "learn").map(t => (
              <div key={t.id} className="tool-card learn" onClick={() => onNavigate(t.id)}
                style={{ padding: "28px 18px 24px", cursor: "pointer" }}>
                <span className="tool-icon" style={{ fontSize: "1.8rem" }}>{t.icon}</span>
                <span className="tool-name" style={{ fontSize: "1.08rem" }}>{t.name}</span>
                <span className="tool-desc" style={{ fontSize: "0.70rem", lineHeight: 1.5 }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("dashboard");
  const [partner, setPartner] = useState(null);
  const [setup, setSetup] = useState(null);
  const [logs, setLogs] = useState([]);
  const [glimmers, setGlimmers] = useState([]);
  const [partnerData, setPartnerData] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = FONTS + CSS;
    document.head.appendChild(styleEl);
    document.title = "Rewire the Fight";
    return () => document.head.removeChild(styleEl);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) loadData(s.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadData(s.user);
      else { setLoading(false); setPartner(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadData(user) {
    setLoading(true);
    try {
      const { data: p } = await supabase.from("partners").select("*").eq("user_id", user.id).single();
      if (!p) { setNeedsOnboarding(true); setLoading(false); return; }
      setPartner(p);
      const { data: s } = await supabase.from("setup").select("*").eq("partner_id", p.id).single();
      setSetup(s);
      const { data: l } = await supabase.from("activation_logs").select("*").eq("partner_id", p.id).order("created_at", { ascending: false }).limit(10);
      setLogs(l || []);
      const { data: g } = await supabase.from("glimmers").select("*").eq("partner_id", p.id).order("created_at", { ascending: false }).limit(10);
      setGlimmers(g || []);
      if (p.partner_email) {
        const { data: pd } = await supabase.from("partners").select("*").eq("email", p.partner_email).eq("couple_id", p.couple_id).single();
        if (pd) setPartnerData(pd);
      }
      if (p.couple_id) {
        const ch = supabase.channel("couple-sync").on("postgres_changes", { event: "INSERT", schema: "public", table: "activation_logs", filter: `couple_id=eq.${p.couple_id}` }, () => loadData(user)).subscribe();
        return () => supabase.removeChannel(ch);
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }

  function refresh() { if (session?.user) loadData(session.user); setScreen("dashboard"); }

  const navActiveMap = {
    dashboard: "dashboard", setup: "setup",
    escalate: "tools", regulate: "tools", repair: "tools", reflect: "tools", learn: "tools",
    goals: "goals", glimmer: "goals", agreement: "goals",
  };

  function handleNav(id) {
    setScreen(id);
  }

  // Loading
  if (loading) return (
    <div style={{ background: SCREEN_GRADIENTS.dashboard, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <Logo size={48} />
        <div className="spinner" style={{ margin: "20px auto 0" }} />
      </div>
    </div>
  );

  if (!session) return <GateScreen />;
  if (needsOnboarding) return <OnboardingScreen user={session.user} onComplete={() => { setNeedsOnboarding(false); loadData(session.user); }} />;
  if (!partner) return (
    <div style={{ background: SCREEN_GRADIENTS.dashboard, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  const commonProps = { partner, setup, partnerData, onNavigate: handleNav };

  return (
    <>
      <style>{FONTS + CSS}</style>
      {screen === "dashboard" && <DashboardWithLearn {...commonProps} logs={logs} glimmers={glimmers} />}
      {screen === "tools"     && <ToolsScreen      {...commonProps} />}
      {screen === "setup"     && <SetupScreen     {...commonProps} onComplete={refresh} onBack={() => setScreen("dashboard")} />}
      {screen === "escalate"  && <EscalateScreen  {...commonProps} onBack={() => setScreen("dashboard")} />}
      {screen === "regulate"  && <RegulateScreen  {...commonProps} onBack={() => setScreen("dashboard")} onLog={refresh} />}
      {screen === "repair"    && <RepairScreen    {...commonProps} onBack={() => setScreen("dashboard")} onLog={refresh} />}
      {screen === "reflect"   && <ReflectScreen   {...commonProps} onBack={() => setScreen("dashboard")} onSave={refresh} />}
      {screen === "learn"     && <LearnScreen     {...commonProps} onBack={() => setScreen("dashboard")} />}
      {screen === "goals"     && <GoalsScreen     {...commonProps} onBack={() => setScreen("dashboard")} onSave={refresh} />}
      {screen === "glimmer"   && <GlimmerScreen   {...commonProps} onBack={() => setScreen("dashboard")} />}
      {screen === "agreement" && <AgreementScreen {...commonProps} onBack={() => setScreen("dashboard")} />}
    </>
  );
}
