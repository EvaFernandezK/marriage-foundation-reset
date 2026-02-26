import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// ─── STYLES ────────────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
`;

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #F4F1EC;
    --ink: #1C1C1C;
    --depth: #2C3540;
    --lavender: #E4E1F0;
    --steel: #C9D1DC;
    --blush: #C49A8A;
    --plum: #484659;
    --sage: #7A9E8E;
    --gold: #B8995A;
    --mist: #E8EBF0;
    --warm-gray: #8A8478;
    --serif: 'EB Garamond', Georgia, serif;
    --sans: 'Jost', system-ui, sans-serif;
  }

  html, body, #root {
    height: 100%;
    background: var(--cream);
    color: var(--ink);
    font-family: var(--sans);
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 480px;
    margin: 0 auto;
    background: var(--cream);
    position: relative;
  }

  /* ── SCREENS ── */
  .screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: 48px 28px 120px;
    animation: fadeUp 0.4s ease both;
  }
  .screen.centered {
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── TYPOGRAPHY ── */
  .eyebrow {
    font-family: var(--sans);
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 10px;
  }
  h1 {
    font-family: var(--serif);
    font-size: 2.2rem;
    font-weight: 400;
    line-height: 1.2;
    color: var(--ink);
    margin-bottom: 16px;
  }
  h2 {
    font-family: var(--serif);
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 1.25;
    color: var(--ink);
    margin-bottom: 12px;
  }
  h3 {
    font-family: var(--serif);
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--ink);
    margin-bottom: 8px;
  }
  p {
    font-size: 0.9rem;
    line-height: 1.7;
    color: #4A4540;
    margin-bottom: 12px;
  }
  .lead {
    font-size: 1rem;
    line-height: 1.65;
    color: #3A3530;
  }

  /* ── LOGO MARK ── */
  .logomark {
    width: 48px;
    height: 48px;
    margin-bottom: 24px;
  }
  .logomark-lg {
    width: 72px;
    height: 72px;
    margin-bottom: 32px;
  }

  /* ── INPUTS ── */
  .field {
    margin-bottom: 20px;
  }
  .field label {
    display: block;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 8px;
  }
  .field input, .field textarea, .field select {
    width: 100%;
    background: white;
    border: 1px solid var(--steel);
    border-radius: 10px;
    padding: 14px 16px;
    font-family: var(--sans);
    font-size: 0.9rem;
    font-weight: 300;
    color: var(--ink);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    appearance: none;
  }
  .field input:focus, .field textarea:focus, .field select:focus {
    border-color: var(--plum);
    box-shadow: 0 0 0 3px rgba(72,70,89,0.08);
  }
  .field textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
  }
  .field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A8478' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
    cursor: pointer;
  }

  /* ── BUTTONS ── */
  .btn {
    display: block;
    width: 100%;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: var(--sans);
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    text-align: center;
  }
  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .btn-primary {
    background: var(--ink);
    color: var(--cream);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--depth);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(28,28,28,0.18);
  }
  .btn-secondary {
    background: transparent;
    color: var(--ink);
    border: 1px solid var(--steel);
  }
  .btn-secondary:hover:not(:disabled) {
    border-color: var(--plum);
    color: var(--plum);
  }
  .btn-ghost {
    background: transparent;
    color: var(--warm-gray);
    font-weight: 400;
    font-size: 0.82rem;
    padding: 12px 24px;
  }
  .btn-ghost:hover {
    color: var(--ink);
  }
  .btn-plum {
    background: var(--plum);
    color: white;
  }
  .btn-plum:hover:not(:disabled) {
    background: #3a3848;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(72,70,89,0.25);
  }
  .btn-sage {
    background: var(--sage);
    color: white;
  }
  .btn-danger {
    background: #C0392B;
    color: white;
  }
  .btn + .btn { margin-top: 10px; }
  .btn-row {
    display: flex;
    gap: 10px;
  }
  .btn-row .btn { flex: 1; }

  /* ── CARDS ── */
  .card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 14px;
    border: 1px solid rgba(201,209,220,0.5);
  }
  .card-lavender {
    background: var(--lavender);
    border-color: rgba(72,70,89,0.1);
  }
  .card-blush {
    background: rgba(196,154,138,0.12);
    border-color: rgba(196,154,138,0.25);
  }
  .card-sage {
    background: rgba(122,158,142,0.1);
    border-color: rgba(122,158,142,0.2);
  }

  /* ── DIVIDER ── */
  .divider {
    height: 1px;
    background: var(--steel);
    opacity: 0.4;
    margin: 24px 0;
  }

  /* ── PILL TAGS ── */
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  .pill {
    background: var(--mist);
    border: 1px solid var(--steel);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.78rem;
    color: var(--depth);
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--sans);
  }
  .pill.active {
    background: var(--plum);
    border-color: var(--plum);
    color: white;
  }

  /* ── SLIDER ── */
  .slider-wrap {
    margin: 16px 0;
  }
  .slider-wrap input[type=range] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: linear-gradient(to right, var(--sage) 0%, var(--blush) 60%, #C0392B 100%);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  .slider-wrap input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    border: 2px solid var(--plum);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    cursor: pointer;
  }
  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--warm-gray);
    margin-top: 6px;
  }
  .slider-value {
    text-align: center;
    font-family: var(--serif);
    font-size: 2.4rem;
    color: var(--plum);
    margin: 8px 0;
  }

  /* ── PROGRESS BAR ── */
  .progress-bar {
    height: 2px;
    background: var(--steel);
    border-radius: 2px;
    margin-bottom: 40px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--plum);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  /* ── NAV ── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    background: rgba(244,241,236,0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(201,209,220,0.5);
    display: flex;
    padding: 8px 0 max(8px, env(safe-area-inset-bottom));
    z-index: 100;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all 0.2s;
  }
  .nav-icon {
    font-size: 1.3rem;
    line-height: 1;
  }
  .nav-label {
    font-family: var(--sans);
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--warm-gray);
    transition: color 0.2s;
  }
  .nav-item.active .nav-label {
    color: var(--plum);
  }
  .nav-item.active .nav-icon {
    transform: scale(1.1);
  }

  /* ── TOP BAR ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px 0;
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(244,241,236,0.95);
    backdrop-filter: blur(8px);
  }
  .back-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: var(--warm-gray);
    padding: 4px;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--sans);
    font-size: 0.82rem;
  }
  .back-btn:hover { color: var(--ink); }

  /* ── BREATHING ANIMATION ── */
  .breathing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 32px;
  }
  .breathing-circle {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 2px solid rgba(72,70,89,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .breathing-circle::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(72,70,89,0.15) 0%, transparent 70%);
    transition: all ease;
  }
  .breathing-circle.inhale::before {
    width: 160px;
    height: 160px;
    animation: expand 4s ease-in-out forwards;
  }
  .breathing-circle.hold::before {
    width: 160px;
    height: 160px;
  }
  .breathing-circle.exhale::before {
    animation: contract 4s ease-in-out forwards;
    width: 40px;
    height: 40px;
  }
  @keyframes expand {
    from { width: 40px; height: 40px; opacity: 0.4; }
    to { width: 160px; height: 160px; opacity: 1; }
  }
  @keyframes contract {
    from { width: 160px; height: 160px; opacity: 1; }
    to { width: 40px; height: 40px; opacity: 0.4; }
  }
  .breathing-instruction {
    font-family: var(--serif);
    font-size: 1.8rem;
    color: var(--plum);
    text-align: center;
    font-style: italic;
  }
  .breathing-count {
    font-family: var(--serif);
    font-size: 3.5rem;
    color: var(--ink);
    line-height: 1;
  }
  .breathing-phase {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--warm-gray);
  }

  /* ── GROUNDING ANIMATION ── */
  .grounding-sense {
    font-family: var(--serif);
    font-size: 1.4rem;
    font-style: italic;
    color: var(--plum);
    text-align: center;
    margin-bottom: 8px;
  }
  .grounding-count-display {
    font-size: 4rem;
    font-family: var(--serif);
    color: var(--ink);
    text-align: center;
  }
  .grounding-prompt {
    font-size: 0.9rem;
    color: var(--warm-gray);
    text-align: center;
    line-height: 1.6;
    padding: 0 20px;
  }

  /* ── REPLACEMENT BEHAVIOR CARD ── */
  .replacement-card {
    background: linear-gradient(135deg, var(--lavender) 0%, rgba(228,225,240,0.5) 100%);
    border: 1px solid rgba(72,70,89,0.15);
    border-radius: 20px;
    padding: 28px;
    text-align: center;
    animation: fadeUp 0.6s ease both;
  }
  .replacement-card .instead-of {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 8px;
  }
  .replacement-card .old-behavior {
    font-family: var(--serif);
    font-size: 1rem;
    font-style: italic;
    color: var(--plum);
    text-decoration: line-through;
    opacity: 0.7;
    margin-bottom: 16px;
  }
  .replacement-card .i-will {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sage);
    margin-bottom: 8px;
  }
  .replacement-card .new-behavior {
    font-family: var(--serif);
    font-size: 1.25rem;
    color: var(--ink);
    line-height: 1.5;
  }

  /* ── DASHBOARD ── */
  .dashboard-greeting {
    margin-bottom: 28px;
  }
  .dashboard-greeting .time {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 4px;
  }
  .partner-sync-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(122,158,142,0.12);
    border: 1px solid rgba(122,158,142,0.25);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.75rem;
    color: var(--sage);
    margin-bottom: 20px;
  }
  .partner-sync-badge.pending {
    background: rgba(184,153,90,0.1);
    border-color: rgba(184,153,90,0.25);
    color: var(--gold);
  }
  .sync-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .tool-btn {
    background: white;
    border: 1px solid rgba(201,209,220,0.6);
    border-radius: 16px;
    padding: 20px 16px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .tool-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    border-color: var(--plum);
  }
  .tool-btn.regulate { border-top: 3px solid var(--sage); }
  .tool-btn.repair { border-top: 3px solid var(--blush); }
  .tool-btn.reflect { border-top: 3px solid var(--plum); }
  .tool-btn .tool-icon { font-size: 1.6rem; }
  .tool-btn .tool-name {
    font-family: var(--serif);
    font-size: 1rem;
    color: var(--ink);
  }
  .tool-btn .tool-desc {
    font-size: 0.72rem;
    color: var(--warm-gray);
    line-height: 1.4;
  }
  .tool-btn-full {
    grid-column: 1 / -1;
  }

  .section-label {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--warm-gray);
    margin-bottom: 12px;
  }

  .activation-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .activation-bar {
    flex: 1;
    height: 4px;
    background: var(--steel);
    border-radius: 2px;
    overflow: hidden;
  }
  .activation-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }
  .activation-num {
    font-family: var(--serif);
    font-size: 1.1rem;
    color: var(--plum);
    min-width: 28px;
    text-align: right;
  }

  /* ── SETUP STEPS ── */
  .setup-step-indicator {
    display: flex;
    gap: 6px;
    margin-bottom: 32px;
  }
  .step-dot {
    height: 3px;
    flex: 1;
    background: var(--steel);
    border-radius: 2px;
    transition: background 0.3s;
  }
  .step-dot.done { background: var(--plum); }
  .step-dot.active { background: var(--plum); opacity: 0.5; }

  /* ── INSIGHT BOX ── */
  .insight {
    background: var(--lavender);
    border-left: 3px solid var(--plum);
    border-radius: 0 10px 10px 0;
    padding: 14px 16px;
    margin: 16px 0;
    font-family: var(--serif);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--plum);
    line-height: 1.6;
  }

  /* ── GLIMMER ── */
  .glimmer-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(201,209,220,0.3);
  }
  .glimmer-item:last-child { border-bottom: none; }
  .glimmer-star { font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
  .glimmer-text { font-size: 0.88rem; line-height: 1.5; color: #3A3530; }
  .glimmer-date { font-size: 0.7rem; color: var(--warm-gray); margin-top: 3px; }

  /* ── REPAIR SCRIPTS ── */
  .script-card {
    background: white;
    border: 1px solid var(--steel);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .script-card:hover {
    border-color: var(--blush);
    background: rgba(196,154,138,0.04);
  }
  .script-card.selected {
    border-color: var(--blush);
    background: rgba(196,154,138,0.08);
  }
  .script-text {
    font-family: var(--serif);
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--ink);
  }
  .script-context {
    font-size: 0.72rem;
    color: var(--warm-gray);
    margin-top: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── ERROR / SUCCESS ── */
  .msg-error {
    background: rgba(192,57,43,0.08);
    border: 1px solid rgba(192,57,43,0.2);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 0.82rem;
    color: #C0392B;
    margin-bottom: 16px;
  }
  .msg-success {
    background: rgba(122,158,142,0.1);
    border: 1px solid rgba(122,158,142,0.25);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 0.82rem;
    color: var(--sage);
    margin-bottom: 16px;
  }

  /* ── LOADING ── */
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    gap: 16px;
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--steel);
    border-top-color: var(--plum);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .spacer { flex: 1; }
`;

// ─── LOGO SVG ──────────────────────────────────────────────────────────────────
function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#484659" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="24" cy="24" r="15" stroke="#484659" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="24" cy="24" r="8" stroke="#484659" strokeWidth="1.5" opacity="0.8"/>
      <circle cx="24" cy="24" r="2.5" fill="#484659"/>
    </svg>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function activationColor(level) {
  if (level <= 4) return "#7A9E8E";
  if (level <= 7) return "#B8995A";
  return "#C0392B";
}

function activationLabel(level) {
  if (level <= 3) return "Regulated";
  if (level <= 5) return "Activated";
  if (level <= 7) return "Escalating";
  return "Flooded";
}

const DEFAULT_BEHAVIORS = [
  "I go quiet and withdraw",
  "I escalate and pursue",
  "I get defensive and explain",
  "I shut down completely",
  "I deflect with humor",
  "I leave the room",
  "I become sarcastic",
  "I bring up past issues",
  "I say things I don't mean",
  "I give the silent treatment",
];

const TRIGGER_OPTIONS = [
  "Feeling unheard",
  "Feeling dismissed",
  "Feeling criticized",
  "Feeling controlled",
  "Feeling abandoned",
  "Feeling disrespected",
  "Feeling overwhelmed",
  "Feeling blamed",
  "Feeling invisible",
  "Tone of voice",
  "Being interrupted",
  "Feeling like a burden",
];

const BODY_RESPONSES = [
  "My chest tightens",
  "My heart races",
  "I feel heat in my face",
  "I go numb",
  "My stomach drops",
  "I feel frozen",
  "My throat tightens",
  "I start shaking",
  "I feel a wave of nausea",
  "I dissociate or zone out",
];

const REPAIR_SCRIPTS = {
  opening: [
    { text: "I know that didn't go well. I want to try again — when you're ready.", context: "To open repair" },
    { text: "I care more about us than about being right. Can we talk?", context: "To de-escalate" },
    { text: "I got activated back there. That wasn't the real conversation.", context: "To name what happened" },
    { text: "I'm not okay with how that went. And I don't want to leave it there.", context: "To reconnect" },
  ],
  accountability: [
    { text: "I said some things that weren't fair. I'm sorry for that.", context: "Accountability" },
    { text: "I went after you when I was scared. That wasn't right.", context: "Accountability" },
    { text: "I shut down when you needed me to stay. I see that now.", context: "Accountability" },
  ],
  softening: [
    { text: "What I was really trying to say underneath all of that was... I miss feeling close to you.", context: "Underneath the fight" },
    { text: "When I got angry, what I was actually feeling was scared.", context: "The softer emotion" },
    { text: "I need you to know that you matter to me — more than winning this.", context: "Reassurance" },
  ],
  request: [
    { text: "Can we slow down and start over? I want to actually hear you.", context: "Making a request" },
    { text: "Will you tell me what you needed from me in that moment?", context: "Curiosity" },
    { text: "I want to understand your side. Will you help me?", context: "Repair through curiosity" },
  ],
};

// ─── SCREENS ──────────────────────────────────────────────────────────────────

// Gate: Enter confirmation code + email
function GateScreen({ onSuccess }) {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const VALID_CODE_PATTERN = /^[A-Za-z0-9]{6,12}$/;

  async function handleSubmit() {
    setError("");
    if (!VALID_CODE_PATTERN.test(code.trim())) {
      setError("Please enter a valid confirmation code (6–12 characters).");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
          data: { confirmation_code: code.trim().toUpperCase() },
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="screen centered">
        <Logo size={56} />
        <div className="eyebrow">Check your inbox</div>
        <h2>We sent you a link</h2>
        <p className="lead">We sent a sign-in link to <strong>{email}</strong>. Click it to open your workbook.</p>
        <p style={{ fontSize: "0.8rem", color: "var(--warm-gray)", marginTop: 24 }}>
          Didn't get it? Check your spam folder or{" "}
          <span style={{ color: "var(--plum)", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setSent(false)}>try again.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="screen centered">
      <Logo size={64} />
      <div className="eyebrow">Inner Pathways MFT</div>
      <h1>Rewire the Fight</h1>
      <p className="lead" style={{ marginBottom: 32 }}>
        A therapist-designed system for interrupting the patterns that keep you stuck.
      </p>
      {error && <div className="msg-error">{error}</div>}
      <div className="field" style={{ width: "100%", textAlign: "left" }}>
        <label>Confirmation Code</label>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. RTF2024"
          maxLength={12}
          autoCapitalize="characters"
        />
      </div>
      <div className="field" style={{ width: "100%", textAlign: "left" }}>
        <label>Your Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
        />
      </div>
      <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
        {loading ? "Sending link..." : "Send My Sign-In Link"}
      </button>
      <p style={{ fontSize: "0.75rem", color: "var(--warm-gray)", marginTop: 20, textAlign: "center" }}>
        We'll email you a secure link — no password needed.
      </p>
    </div>
  );
}

// Onboarding: Name + partner email
function OnboardingScreen({ user, onComplete }) {
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmationCode = user?.user_metadata?.confirmation_code || "DEFAULT";

  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setError("");
    setLoading(true);
    try {
      // 1. Find or create couple
      let coupleId;
      const { data: existingCouple } = await supabase
        .from("couples")
        .select("id")
        .eq("confirmation_code", confirmationCode)
        .single();

      if (existingCouple) {
        coupleId = existingCouple.id;
      } else {
        const { data: newCouple, error: coupleErr } = await supabase
          .from("couples")
          .insert({ confirmation_code: confirmationCode })
          .select("id")
          .single();
        if (coupleErr) throw coupleErr;
        coupleId = newCouple.id;
      }

      // 2. Create partner profile
      const { error: partnerErr } = await supabase
        .from("partners")
        .insert({
          couple_id: coupleId,
          user_id: user.id,
          name: name.trim(),
          email: user.email,
          partner_email: partnerEmail.trim().toLowerCase() || null,
        });
      if (partnerErr) throw partnerErr;

      // 3. Create empty setup
      const { data: partnerData } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (partnerData) {
        await supabase.from("setup").insert({
          partner_id: partnerData.id,
          couple_id: coupleId,
        });
      }

      onComplete();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div style={{ marginBottom: 40 }}>
        <Logo size={40} />
      </div>
      <div className="eyebrow">Welcome</div>
      <h2>Let's get you set up</h2>
      <p style={{ marginBottom: 32 }}>
        This is your private space inside the workbook. Your partner will set up their own.
      </p>
      {error && <div className="msg-error">{error}</div>}
      <div className="field">
        <label>Your first name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="How should we address you?" />
      </div>
      <div className="divider" />
      <p style={{ fontSize: "0.85rem", color: "var(--warm-gray)", marginBottom: 16 }}>
        Optional — add your partner's email so they can connect their workbook to yours.
      </p>
      <div className="field">
        <label>Partner's first name</label>
        <input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Their name" />
      </div>
      <div className="field">
        <label>Partner's email</label>
        <input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="their@email.com" />
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
        {loading ? "Setting up..." : "Continue"}
      </button>
      <button className="btn btn-ghost" onClick={handleSubmit} disabled={loading}>
        Skip for now — I'll add this later
      </button>
    </div>
  );
}

// Dashboard — home base
function DashboardScreen({ partner, setup, activationLogs, glimmers, partnerData, onNavigate }) {
  const lastActivation = activationLogs?.[0];
  const recentGlimmers = glimmers?.slice(0, 3) || [];
  const setupComplete = setup?.replacement_behavior && setup?.triggers?.length > 0;

  return (
    <div className="screen" style={{ paddingTop: 28 }}>
      {/* Greeting */}
      <div className="dashboard-greeting">
        <div className="time">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <h2 style={{ marginBottom: 8 }}>{getTimeGreeting()}, {partner?.name?.split(" ")[0]}.</h2>

        {partnerData ? (
          <div className="partner-sync-badge">
            <div className="sync-dot" />
            Connected with {partnerData.name}
          </div>
        ) : (
          <div className="partner-sync-badge pending">
            <div className="sync-dot" />
            Waiting for partner to connect
          </div>
        )}
      </div>

      {/* Setup nudge */}
      {!setupComplete && (
        <div className="card card-lavender" style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Finish your setup</div>
          <p style={{ fontSize: "0.85rem", marginBottom: 12 }}>
            Your replacement behavior isn't defined yet. You'll want this ready before you need it.
          </p>
          <button className="btn btn-plum" style={{ padding: "12px 20px" }} onClick={() => onNavigate("setup")}>
            Complete My Setup
          </button>
        </div>
      )}

      {/* Tools */}
      <div className="section-label">Something happened</div>
      <div className="tools-grid">
        <button className="tool-btn regulate" onClick={() => onNavigate("regulate")}>
          <div className="tool-icon">🌿</div>
          <div className="tool-name">Regulate</div>
          <div className="tool-desc">I'm activated right now</div>
        </button>
        <button className="tool-btn repair" onClick={() => onNavigate("repair")}>
          <div className="tool-icon">🤝</div>
          <div className="tool-name">Repair</div>
          <div className="tool-desc">We just had a fight</div>
        </button>
        <button className="tool-btn reflect tool-btn-full" onClick={() => onNavigate("reflect")}>
          <div className="tool-icon">🔍</div>
          <div className="tool-name">Reflect</div>
          <div className="tool-desc">I want to understand what happened</div>
        </button>
      </div>

      {/* My last activation */}
      {lastActivation && (
        <>
          <div className="section-label" style={{ marginTop: 8 }}>My last logged state</div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="activation-indicator" style={{ marginBottom: 8 }}>
              <div className="activation-bar">
                <div className="activation-fill" style={{
                  width: `${lastActivation.level * 10}%`,
                  background: activationColor(lastActivation.level)
                }} />
              </div>
              <div className="activation-num">{lastActivation.level}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: activationColor(lastActivation.level), fontWeight: 500 }}>
                {activationLabel(lastActivation.level)}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--warm-gray)" }}>
                {formatDate(lastActivation.created_at)}
              </span>
            </div>
            {lastActivation.note && (
              <p style={{ fontSize: "0.82rem", marginTop: 8, marginBottom: 0, fontStyle: "italic" }}>
                "{lastActivation.note}"
              </p>
            )}
          </div>
        </>
      )}

      {/* Partner's state */}
      {partnerData && (
        <>
          <div className="section-label">{partnerData.name}'s last logged state</div>
          <div className="card" style={{ marginBottom: 14 }}>
            <p style={{ fontSize: "0.82rem", color: "var(--warm-gray)", marginBottom: 0 }}>
              No recent logs from {partnerData.name} yet.
            </p>
          </div>
        </>
      )}

      {/* Glimmers */}
      {recentGlimmers.length > 0 && (
        <>
          <div className="section-label">Recent glimmers</div>
          <div className="card">
            {recentGlimmers.map(g => (
              <div className="glimmer-item" key={g.id}>
                <div className="glimmer-star">✦</div>
                <div>
                  <div className="glimmer-text">{g.text}</div>
                  <div className="glimmer-date">{formatDate(g.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => onNavigate("glimmer")}>
        + Add a glimmer
      </button>
    </div>
  );
}

// Setup — 5-step flow
function SetupScreen({ partner, setup, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    shared_goals: setup?.shared_goals || "",
    window_low: setup?.window_low || 3,
    window_high: setup?.window_high || 7,
    triggers: setup?.triggers || [],
    body_response: setup?.body_response || "",
    default_behavior: setup?.default_behavior || "",
    replacement_behavior: setup?.replacement_behavior || "",
    cycle_map_my_side: setup?.cycle_map_my_side || "",
  });

  const STEPS = 5;

  function update(key, val) {
    setData(d => ({ ...d, [key]: val }));
  }

  function toggleTrigger(t) {
    setData(d => ({
      ...d,
      triggers: d.triggers.includes(t)
        ? d.triggers.filter(x => x !== t)
        : [...d.triggers, t]
    }));
  }

  async function saveStep() {
    setSaving(true);
    try {
      await supabase.from("setup").update({
        ...data,
        updated_at: new Date().toISOString(),
      }).eq("partner_id", partner.id);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  async function nextStep() {
    await saveStep();
    if (step < STEPS - 1) setStep(s => s + 1);
    else {
      await supabase.from("setup").update({ completed: true }).eq("partner_id", partner.id);
      onComplete();
    }
  }

  const stepContent = [
    // Step 0: Shared Goals
    <div key="goals">
      <div className="eyebrow">Step 1 of 5</div>
      <h2>What do we want to change?</h2>
      <p>Take a moment to think about what you're hoping this work gives your relationship. What does success look like for you?</p>
      <div className="insight">
        You don't need to be specific. Even "I want us to fight less and feel more connected" is a complete answer.
      </div>
      <div className="field">
        <label>Our shared goal</label>
        <textarea
          value={data.shared_goals}
          onChange={e => update("shared_goals", e.target.value)}
          placeholder="What I want for us is..."
          rows={5}
        />
      </div>
    </div>,

    // Step 1: Window of Tolerance
    <div key="window">
      <div className="eyebrow">Step 2 of 5</div>
      <h2>Your window of tolerance</h2>
      <p>Your window of tolerance is the zone where you can think clearly, communicate, and stay present. Outside of it, your nervous system takes over.</p>
      <div className="insight">
        There's no right answer here. This is just about knowing yourself.
      </div>
      <div className="field" style={{ marginTop: 24 }}>
        <label>I start getting activated around...</label>
        <div className="slider-wrap">
          <div className="slider-value">{data.window_low}/10</div>
          <input type="range" min="1" max="9" value={data.window_low}
            onChange={e => update("window_low", parseInt(e.target.value))} />
          <div className="slider-labels">
            <span>Calm (1)</span><span>Flooded (10)</span>
          </div>
        </div>
      </div>
      <div className="field">
        <label>I'm clearly outside my window above...</label>
        <div className="slider-wrap">
          <div className="slider-value">{data.window_high}/10</div>
          <input type="range" min={data.window_low + 1} max="10" value={data.window_high}
            onChange={e => update("window_high", parseInt(e.target.value))} />
          <div className="slider-labels">
            <span>Calm (1)</span><span>Flooded (10)</span>
          </div>
        </div>
      </div>
      <div className="card card-sage">
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Your window: <strong>{data.window_low} – {data.window_high}</strong>. Below {data.window_low}, you're regulated. Above {data.window_high}, meaningful conversation isn't possible yet.
        </p>
      </div>
    </div>,

    // Step 2: Triggers + Body
    <div key="triggers">
      <div className="eyebrow">Step 3 of 5</div>
      <h2>What activates you?</h2>
      <p>When conflict starts, certain things reliably pull you outside your window. Naming them now means you can recognize them in the moment.</p>
      <div className="field">
        <label>My triggers (select all that apply)</label>
        <div className="pills">
          {TRIGGER_OPTIONS.map(t => (
            <button key={t} className={`pill ${data.triggers.includes(t) ? "active" : ""}`}
              onClick={() => toggleTrigger(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginTop: 8 }}>
        <label>What my body does first</label>
        <select value={data.body_response} onChange={e => update("body_response", e.target.value)}>
          <option value="">Choose one...</option>
          {BODY_RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="insight">
        Your body gives you the signal before your mind does. That physical cue is your earliest intervention point.
      </div>
    </div>,

    // Step 3: Replacement Behavior
    <div key="replacement">
      <div className="eyebrow">Step 4 of 5</div>
      <h2>Your replacement behavior</h2>
      <p>This is the most important part. When you're activated, your default behavior kicks in automatically — and it usually makes things worse. You're going to choose something different to do instead.</p>
      <div className="insight">
        "Instead of [what I normally do], I will [what I'm choosing to do]."
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label>Instead of...</label>
        <select value={data.default_behavior} onChange={e => update("default_behavior", e.target.value)}>
          <option value="">What do you usually do when activated?</option>
          {DEFAULT_BEHAVIORS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="field">
        <label>I will say or do...</label>
        <textarea
          value={data.replacement_behavior}
          onChange={e => update("replacement_behavior", e.target.value)}
          placeholder={`e.g. "I'm starting to feel overwhelmed. Can we take 20 minutes and come back to this?"`}
          rows={4}
        />
      </div>
      {data.default_behavior && data.replacement_behavior && (
        <div className="replacement-card">
          <div className="instead-of">Instead of</div>
          <div className="old-behavior">{data.default_behavior}</div>
          <div className="i-will">I will</div>
          <div className="new-behavior">"{data.replacement_behavior}"</div>
        </div>
      )}
    </div>,

    // Step 4: Cycle Map
    <div key="cycle">
      <div className="eyebrow">Step 5 of 5</div>
      <h2>Your side of the cycle</h2>
      <p>Every couple has a conflict cycle — a loop that both partners are caught in. Understanding your side of it is how you start to interrupt it.</p>
      <div className="insight">
        The cycle is never: "My partner is the problem." It's always: "We're both caught in a pattern."
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label>When I feel threatened or disconnected, I tend to...</label>
        <textarea
          value={data.cycle_map_my_side}
          onChange={e => update("cycle_map_my_side", e.target.value)}
          placeholder="Describe what happens on your end — what you feel, what you do, and what you're afraid of underneath it..."
          rows={6}
        />
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--warm-gray)" }}>
        Your partner is completing their own version of this separately. Together, your two sides form the shared cycle.
      </p>
    </div>,
  ];

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span style={{ fontSize: "0.75rem", color: "var(--warm-gray)" }}>My Setup</span>
      </div>

      <div className="setup-step-indicator">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`} />
        ))}
      </div>

      {stepContent[step]}

      <div className="spacer" style={{ minHeight: 32 }} />

      <button className="btn btn-primary" disabled={saving} onClick={nextStep}>
        {saving ? "Saving..." : step < STEPS - 1 ? "Save & Continue" : "Complete My Setup"}
      </button>
      {step > 0 && (
        <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
          Back
        </button>
      )}
    </div>
  );
}

// Regulate — solo regulation tool
function RegulateScreen({ partner, setup, onBack, onLog }) {
  const [phase, setPhase] = useState("check"); // check | tool-select | breathing | sigh | grounding | replacement | log
  const [activation, setActivation] = useState(5);
  const [tool, setTool] = useState(null);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [breathCount, setBreathCount] = useState(4);
  const [breathCycle, setBreathCycle] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);
  const [note, setNote] = useState("");
  const timerRef = useRef(null);

  const GROUNDING_STEPS = [
    { count: 5, sense: "See", prompt: "Look around. Name 5 things you can see right now." },
    { count: 4, sense: "Touch", prompt: "Name 4 things you can physically feel — your feet on the floor, the air, your clothes." },
    { count: 3, sense: "Hear", prompt: "What 3 sounds can you hear? Don't judge them, just notice." },
    { count: 2, sense: "Smell", prompt: "Name 2 things you can smell — or notice the absence of smell." },
    { count: 1, sense: "Taste", prompt: "What's 1 thing you can taste right now?" },
  ];

  function startBreathing(type) {
    setTool(type);
    setBreathPhase("inhale");
    setBreathCount(4);
    setBreathCycle(0);
    setPhase(type);
  }

  useEffect(() => {
    if (phase === "breathing") {
      runBoxBreath();
    } else if (phase === "sigh") {
      runSigh();
    }
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  function runBoxBreath() {
    const sequence = [
      { phase: "inhale", label: "Breathe in", count: 4, duration: 4000 },
      { phase: "hold", label: "Hold", count: 4, duration: 4000 },
      { phase: "exhale", label: "Breathe out", count: 4, duration: 4000 },
      { phase: "hold", label: "Hold", count: 4, duration: 4000 },
    ];
    let i = 0;
    let cycles = 0;
    function tick() {
      setBreathPhase(sequence[i].phase);
      setBreathCount(sequence[i].count);
      let c = sequence[i].count;
      const countdown = setInterval(() => {
        c--;
        setBreathCount(c);
        if (c <= 0) clearInterval(countdown);
      }, 1000);
      timerRef.current = setTimeout(() => {
        i = (i + 1) % sequence.length;
        if (i === 0) {
          cycles++;
          setBreathCycle(cycles);
          if (cycles >= 4) { setPhase("replacement"); return; }
        }
        tick();
      }, sequence[i].duration);
    }
    tick();
  }

  function runSigh() {
    const sequence = [
      { phase: "inhale", label: "First inhale", count: 2 },
      { phase: "inhale", label: "Second inhale", count: 1 },
      { phase: "exhale", label: "Long exhale", count: 6 },
    ];
    let i = 0;
    function tick() {
      setBreathPhase(sequence[i].phase);
      setBreathCount(sequence[i].count);
      let c = sequence[i].count;
      const countdown = setInterval(() => {
        c--;
        setBreathCount(c);
        if (c <= 0) clearInterval(countdown);
      }, 1000);
      timerRef.current = setTimeout(() => {
        i++;
        if (i >= sequence.length) {
          i = 0;
          setBreathCycle(prev => {
            const next = prev + 1;
            if (next >= 5) { setPhase("replacement"); return next; }
            return next;
          });
        }
        tick();
      }, sequence[i].count * 1000 + 200);
    }
    tick();
  }

  async function logAndReturn() {
    try {
      await supabase.from("activation_logs").insert({
        partner_id: partner.id,
        couple_id: partner.couple_id,
        level: activation,
        regulation_tool: tool,
        note: note.trim() || null,
      });
    } catch (e) { console.error(e); }
    onLog();
  }

  // Screens
  if (phase === "check") return (
    <div className="screen">
      <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>
      <div className="eyebrow">Regulate</div>
      <h2>Where are you right now?</h2>
      <p>Check in with your nervous system. There's no right answer — just honest.</p>
      <div className="field" style={{ marginTop: 24 }}>
        <label>My activation level</label>
        <div className="slider-wrap">
          <div className="slider-value" style={{ color: activationColor(activation) }}>{activation}</div>
          <input type="range" min="1" max="10" value={activation}
            onChange={e => setActivation(parseInt(e.target.value))} />
          <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ fontSize: "0.85rem", color: activationColor(activation), fontWeight: 500 }}>
            {activationLabel(activation)}
          </span>
        </div>
      </div>
      <div className="insight">
        {activation <= 4 && "You're in your window. You can think clearly right now."}
        {activation > 4 && activation <= 7 && "You're activated. Your nervous system is working hard. Let's help it slow down."}
        {activation > 7 && "You're flooded. Your thinking brain is offline right now. That's not a flaw — it's biology. Let's regulate first."}
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" onClick={() => setPhase("tool-select")}>
        Choose a regulation tool
      </button>
    </div>
  );

  if (phase === "tool-select") return (
    <div className="screen">
      <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
        <button className="back-btn" onClick={() => setPhase("check")}>← Back</button>
      </div>
      <div className="eyebrow">Choose a tool</div>
      <h2>How do you want to regulate?</h2>
      <p>All three of these work. Pick the one that feels right for right now.</p>
      <div style={{ marginTop: 24 }}>
        <button className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid var(--steel)" }}
          onClick={() => startBreathing("breathing")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>Box Breathing</h3>
              <p style={{ margin: 0, fontSize: "0.82rem" }}>Inhale 4 · Hold 4 · Exhale 4 · Hold 4. Four cycles.</p>
            </div>
            <span style={{ fontSize: "1.4rem" }}>⬜</span>
          </div>
        </button>
        <button className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid var(--steel)" }}
          onClick={() => startBreathing("sigh")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>Physiological Sigh</h3>
              <p style={{ margin: 0, fontSize: "0.82rem" }}>Double inhale + long exhale. Fastest way to calm your nervous system.</p>
            </div>
            <span style={{ fontSize: "1.4rem" }}>💨</span>
          </div>
        </button>
        <button className="card" style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid var(--steel)" }}
          onClick={() => { setTool("grounding"); setPhase("grounding"); }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>5-4-3-2-1 Grounding</h3>
              <p style={{ margin: 0, fontSize: "0.82rem" }}>Use your senses to come back to the present moment.</p>
            </div>
            <span style={{ fontSize: "1.4rem" }}>🌿</span>
          </div>
        </button>
      </div>
    </div>
  );

  if (phase === "breathing" || phase === "sigh") return (
    <div className="screen centered" style={{ padding: "48px 28px" }}>
      <div className="eyebrow">{phase === "breathing" ? "Box Breathing" : "Physiological Sigh"}</div>
      <div className="breathing-container">
        <div className={`breathing-circle ${breathPhase}`}>
          <div style={{ textAlign: "center" }}>
            <div className="breathing-count">{breathCount}</div>
            <div className="breathing-phase">
              {breathPhase === "inhale" ? "Breathe in" : breathPhase === "hold" ? "Hold" : "Breathe out"}
            </div>
          </div>
        </div>
        <div className="breathing-instruction">
          {breathPhase === "inhale" && "Slow breath in through your nose..."}
          {breathPhase === "hold" && "Hold gently..."}
          {breathPhase === "exhale" && "Slow breath out through your mouth..."}
        </div>
        {breathCycle > 0 && (
          <div style={{ fontSize: "0.75rem", color: "var(--warm-gray)" }}>
            Cycle {breathCycle} of {phase === "breathing" ? 4 : 5}
          </div>
        )}
      </div>
      <button className="btn btn-ghost" onClick={() => setPhase("replacement")}>
        Skip to next step
      </button>
    </div>
  );

  if (phase === "grounding") {
    const step = GROUNDING_STEPS[groundingStep] || GROUNDING_STEPS[GROUNDING_STEPS.length - 1];
    return (
      <div className="screen centered" style={{ padding: "48px 28px" }}>
        <div className="eyebrow">5-4-3-2-1 Grounding</div>
        <div className="breathing-container">
          <div className="grounding-count-display">{step.count}</div>
          <div className="grounding-sense">{step.sense}</div>
          <div className="grounding-prompt">{step.prompt}</div>
        </div>
        {groundingStep < GROUNDING_STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setGroundingStep(s => s + 1)}>
            Done — next sense
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setPhase("replacement")}>
            I'm grounded — continue
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => setPhase("replacement")}>Skip</button>
      </div>
    );
  }

  if (phase === "replacement") {
    const hasReplacement = setup?.replacement_behavior && setup?.default_behavior;
    return (
      <div className="screen" style={{ paddingTop: 48 }}>
        <div className="eyebrow">Your plan for this moment</div>
        <h2>You've regulated.<br />Now what?</h2>
        {hasReplacement ? (
          <>
            <p>You set this intention for yourself during setup. Here it is.</p>
            <div className="replacement-card" style={{ marginTop: 24, marginBottom: 32 }}>
              <div className="instead-of">Instead of</div>
              <div className="old-behavior">{setup.default_behavior}</div>
              <div className="i-will">I will</div>
              <div className="new-behavior">"{setup.replacement_behavior}"</div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--warm-gray)", textAlign: "center" }}>
              This was your choice when you were calm. It still is.
            </p>
          </>
        ) : (
          <div className="card card-lavender" style={{ marginTop: 24 }}>
            <h3>No replacement behavior set yet</h3>
            <p style={{ fontSize: "0.85rem" }}>You haven't defined your replacement behavior in Setup yet. That's the missing piece — add it when you're calm.</p>
          </div>
        )}
        <div className="spacer" />
        <button className="btn btn-primary" onClick={() => setPhase("log")}>
          Log this moment
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          Return to dashboard
        </button>
      </div>
    );
  }

  if (phase === "log") return (
    <div className="screen">
      <div className="eyebrow">Log it</div>
      <h2>One more thing</h2>
      <p>Optional — add a note about what was happening. Your future self (and your therapist) will thank you.</p>
      <div className="field" style={{ marginTop: 20 }}>
        <label>What was the context? (optional)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="What triggered you? What did you notice? What helped?"
          rows={5} />
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" onClick={logAndReturn}>
        Save and return home
      </button>
    </div>
  );

  return null;
}

// Repair screen
function RepairScreen({ partner, setup, onBack, onLog }) {
  const [phase, setPhase] = useState("check"); // check | scripts | dear | log
  const [activation, setActivation] = useState(5);
  const [scriptPhase, setScriptPhase] = useState("opening");
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [conflictNote, setConflictNote] = useState("");
  const [missedMoment, setMissedMoment] = useState("");

  const SCRIPT_PHASES = ["opening", "accountability", "softening", "request"];
  const SCRIPT_LABELS = {
    opening: "Start the conversation",
    accountability: "Take responsibility",
    softening: "Share the softer emotion",
    request: "Make a request",
  };

  function toggleScript(text) {
    setSelectedScripts(prev =>
      prev.includes(text) ? prev.filter(s => s !== text) : [...prev, text]
    );
  }

  async function logRepair() {
    try {
      await supabase.from("conflict_logs").insert({
        couple_id: partner.couple_id,
        initiated_by: partner.id,
        what_happened: conflictNote.trim() || null,
        missed_moment: missedMoment.trim() || null,
        repair_completed: true,
      });
    } catch (e) { console.error(e); }
    onLog();
  }

  if (phase === "check") return (
    <div className="screen">
      <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>
      <div className="eyebrow">Repair</div>
      <h2>Before we start —<br />where are you?</h2>
      <p>Repair only works when both partners are below a 5. If either of you is still flooded, regulate first.</p>
      <div className="field" style={{ marginTop: 24 }}>
        <label>My activation right now</label>
        <div className="slider-wrap">
          <div className="slider-value" style={{ color: activationColor(activation) }}>{activation}</div>
          <input type="range" min="1" max="10" value={activation}
            onChange={e => setActivation(parseInt(e.target.value))} />
          <div className="slider-labels"><span>Calm (1)</span><span>Flooded (10)</span></div>
        </div>
      </div>
      {activation > 5 ? (
        <>
          <div className="card card-blush">
            <h3 style={{ marginBottom: 6 }}>You're still activated</h3>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>
              At {activation}/10, meaningful repair is hard. Your nervous system is still protective.
              Try regulating first, then come back here.
            </p>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={onBack}>
            Regulate first
          </button>
          <button className="btn btn-ghost" onClick={() => setPhase("scripts")}>
            I want to try anyway
          </button>
        </>
      ) : (
        <>
          <div className="card card-sage">
            <p style={{ fontSize: "0.85rem", margin: 0 }}>
              Good. At {activation}/10, you're in a place where real conversation is possible.
            </p>
          </div>
          <div className="spacer" />
          <button className="btn btn-primary" onClick={() => setPhase("scripts")}>
            Start the repair process
          </button>
        </>
      )}
    </div>
  );

  if (phase === "scripts") {
    const phaseIdx = SCRIPT_PHASES.indexOf(scriptPhase);
    return (
      <div className="screen">
        <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
          <button className="back-btn" onClick={() => phaseIdx === 0 ? setPhase("check") : setScriptPhase(SCRIPT_PHASES[phaseIdx - 1])}>← Back</button>
          <span style={{ fontSize: "0.75rem", color: "var(--warm-gray)" }}>
            {phaseIdx + 1} of {SCRIPT_PHASES.length}
          </span>
        </div>
        <div className="setup-step-indicator">
          {SCRIPT_PHASES.map((p, i) => (
            <div key={p} className={`step-dot ${i < phaseIdx ? "done" : i === phaseIdx ? "active" : ""}`} />
          ))}
        </div>
        <div className="eyebrow">{SCRIPT_LABELS[scriptPhase]}</div>
        <h2 style={{ marginBottom: 20 }}>Choose a phrase that feels true</h2>
        <p style={{ marginBottom: 20 }}>You don't have to find perfect words. These are starting points. Use the one that feels closest.</p>
        {REPAIR_SCRIPTS[scriptPhase].map(s => (
          <div key={s.text}
            className={`script-card ${selectedScripts.includes(s.text) ? "selected" : ""}`}
            onClick={() => toggleScript(s.text)}>
            <div className="script-text">"{s.text}"</div>
            <div className="script-context">{s.context}</div>
          </div>
        ))}
        <div className="spacer" />
        {phaseIdx < SCRIPT_PHASES.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setScriptPhase(SCRIPT_PHASES[phaseIdx + 1])}>
            Continue
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setPhase("log")}>
            Log this repair
          </button>
        )}
      </div>
    );
  }

  if (phase === "log") return (
    <div className="screen">
      <div className="eyebrow">Log the conflict</div>
      <h2>What happened?</h2>
      <p>This is for you and your therapist. The more honest, the more useful.</p>
      <div className="field" style={{ marginTop: 16 }}>
        <label>What was the conflict about?</label>
        <textarea value={conflictNote} onChange={e => setConflictNote(e.target.value)}
          placeholder="What triggered it? What happened? How did it end?"
          rows={4} />
      </div>
      <div className="field">
        <label>Where was the missed intervention moment?</label>
        <textarea value={missedMoment} onChange={e => setMissedMoment(e.target.value)}
          placeholder="When could you have caught it earlier? What did you notice in your body?"
          rows={4} />
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" onClick={logRepair}>
        Save and return home
      </button>
    </div>
  );

  return null;
}

// Reflect screen
function ReflectScreen({ partner, setup, onBack, onSave }) {
  const [reflection, setReflection] = useState("");
  const [missedMoment, setMissedMoment] = useState("");
  const [cycleUpdate, setCycleUpdate] = useState(setup?.cycle_map_my_side || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from("conflict_logs").insert({
        couple_id: partner.couple_id,
        initiated_by: partner.id,
        what_happened: reflection.trim() || null,
        missed_moment: missedMoment.trim() || null,
        repair_completed: false,
      });
      if (cycleUpdate !== setup?.cycle_map_my_side) {
        await supabase.from("setup").update({
          cycle_map_my_side: cycleUpdate,
          updated_at: new Date().toISOString()
        }).eq("partner_id", partner.id);
      }
      onSave();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="screen">
      <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>
      <div className="eyebrow">Reflect</div>
      <h2>What happened, and what did you learn?</h2>
      <p>This is calm-moment work. You're not in the fight anymore — you're looking at it from the outside.</p>
      <div className="insight">
        "The goal isn't to figure out who was right. It's to find where the pattern started."
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label>What happened?</label>
        <textarea value={reflection} onChange={e => setReflection(e.target.value)}
          placeholder="Describe the conflict as honestly as you can..."
          rows={4} />
      </div>
      <div className="field">
        <label>Where was the earliest intervention point?</label>
        <textarea value={missedMoment} onChange={e => setMissedMoment(e.target.value)}
          placeholder="When did your body first signal you were getting activated? What happened right before?"
          rows={3} />
      </div>
      <div className="field">
        <label>Update your cycle map (optional)</label>
        <textarea value={cycleUpdate} onChange={e => setCycleUpdate(e.target.value)}
          placeholder="Has your understanding of your side of the pattern changed?"
          rows={4} />
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save reflection"}
      </button>
    </div>
  );
}

// Goals screen
function GoalsScreen({ partner, setup, onBack, onSave }) {
  const [goals, setGoals] = useState(setup?.shared_goals || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from("setup").update({
        shared_goals: goals,
        updated_at: new Date().toISOString()
      }).eq("partner_id", partner.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="screen">
      <div className="eyebrow">Our Goals</div>
      <h2>What you're working toward</h2>
      <p>This is the anchor. When things feel hard, this is why you're doing the work.</p>
      {saved && <div className="msg-success">Goals saved.</div>}
      <div className="field" style={{ marginTop: 20 }}>
        <label>Our shared goal</label>
        <textarea value={goals} onChange={e => setGoals(e.target.value)}
          placeholder="What we want for our relationship is..."
          rows={6} />
      </div>
      <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save"}
      </button>
      <div className="divider" />
      <h3>Add a glimmer</h3>
      <p style={{ fontSize: "0.85rem" }}>A glimmer is a small moment of connection or safety. Noticing them trains your nervous system to see more of them.</p>
      <GlimmerAdd partner={partner} />
    </div>
  );
}

function GlimmerAdd({ partner }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function addGlimmer() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await supabase.from("glimmers").insert({
        partner_id: partner.id,
        couple_id: partner.couple_id,
        text: text.trim(),
      });
      setText("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <>
      {saved && <div className="msg-success">Glimmer added ✦</div>}
      <div className="field">
        <label>What happened?</label>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="We laughed together today. They reached for my hand. I felt safe."
          rows={3} />
      </div>
      <button className="btn btn-secondary" disabled={saving || !text.trim()} onClick={addGlimmer}>
        {saving ? "Saving..." : "Add glimmer ✦"}
      </button>
    </>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("dashboard"); // dashboard | setup | regulate | repair | reflect | goals | glimmer
  const [partner, setPartner] = useState(null);
  const [setup, setSetup] = useState(null);
  const [activationLogs, setActivationLogs] = useState([]);
  const [glimmers, setGlimmers] = useState([]);
  const [partnerData, setPartnerData] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Inject styles
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = FONTS + css;
    document.head.appendChild(styleEl);
    document.title = "Rewire the Fight";
    return () => document.head.removeChild(styleEl);
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserData(session.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserData(session.user);
      else { setLoading(false); setPartner(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(user) {
    setLoading(true);
    try {
      // Load partner profile
      const { data: partnerRow } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!partnerRow) {
        setNeedsOnboarding(true);
        setLoading(false);
        return;
      }

      setPartner(partnerRow);

      // Load setup
      const { data: setupRow } = await supabase
        .from("setup")
        .select("*")
        .eq("partner_id", partnerRow.id)
        .single();
      setSetup(setupRow);

      // Load activation logs
      const { data: logs } = await supabase
        .from("activation_logs")
        .select("*")
        .eq("partner_id", partnerRow.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setActivationLogs(logs || []);

      // Load glimmers
      const { data: glimmerRows } = await supabase
        .from("glimmers")
        .select("*")
        .eq("partner_id", partnerRow.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setGlimmers(glimmerRows || []);

      // Try to find partner (by email match)
      if (partnerRow.partner_email) {
        const { data: otherPartner } = await supabase
          .from("partners")
          .select("*")
          .eq("email", partnerRow.partner_email)
          .eq("couple_id", partnerRow.couple_id)
          .single();
        if (otherPartner) setPartnerData(otherPartner);
      }

      // Realtime: listen for partner activation logs
      if (partnerRow.couple_id) {
        const channel = supabase
          .channel("couple-updates")
          .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "activation_logs",
            filter: `couple_id=eq.${partnerRow.couple_id}`
          }, () => loadUserData(user))
          .subscribe();
        return () => supabase.removeChannel(channel);
      }

    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  }

  function refreshData() {
    if (session?.user) loadUserData(session.user);
    setScreen("dashboard");
  }

  if (loading) return (
    <div className="app">
      <div className="loading-screen">
        <Logo size={48} />
        <div className="spinner" />
      </div>
    </div>
  );

  if (!session) return (
    <div className="app">
      <GateScreen onSuccess={() => {}} />
    </div>
  );

  if (needsOnboarding) return (
    <div className="app">
      <OnboardingScreen
        user={session.user}
        onComplete={() => { setNeedsOnboarding(false); loadUserData(session.user); }}
      />
    </div>
  );

  if (!partner) return (
    <div className="app">
      <div className="loading-screen">
        <Logo size={48} />
        <div className="spinner" />
      </div>
    </div>
  );

  const NAV_ITEMS = [
    { id: "dashboard", icon: "⌂", label: "Home" },
    { id: "setup", icon: "◎", label: "My Setup" },
    { id: "tools", icon: "✦", label: "Tools" },
    { id: "goals", icon: "◇", label: "Goals" },
  ];

  // Tools is a sub-navigation — clicking it goes to the tools entry in dashboard
  function handleNavClick(id) {
    if (id === "tools") {
      setScreen("dashboard");
      setTimeout(() => {
        document.querySelector(".tools-grid")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      setScreen(id);
    }
  }

  const activeNav = ["regulate", "repair", "reflect"].includes(screen)
    ? "tools"
    : screen === "setup" ? "setup"
    : screen === "goals" || screen === "glimmer" ? "goals"
    : "dashboard";

  return (
    <div className="app">
      {screen === "dashboard" && (
        <DashboardScreen
          partner={partner}
          setup={setup}
          activationLogs={activationLogs}
          glimmers={glimmers}
          partnerData={partnerData}
          onNavigate={setScreen}
        />
      )}
      {screen === "setup" && (
        <SetupScreen
          partner={partner}
          setup={setup}
          onComplete={refreshData}
          onBack={() => setScreen("dashboard")}
        />
      )}
      {screen === "regulate" && (
        <RegulateScreen
          partner={partner}
          setup={setup}
          onBack={() => setScreen("dashboard")}
          onLog={refreshData}
        />
      )}
      {screen === "repair" && (
        <RepairScreen
          partner={partner}
          setup={setup}
          onBack={() => setScreen("dashboard")}
          onLog={refreshData}
        />
      )}
      {screen === "reflect" && (
        <ReflectScreen
          partner={partner}
          setup={setup}
          onBack={() => setScreen("dashboard")}
          onSave={refreshData}
        />
      )}
      {screen === "goals" && (
        <GoalsScreen
          partner={partner}
          setup={setup}
          onBack={() => setScreen("dashboard")}
          onSave={refreshData}
        />
      )}
      {screen === "glimmer" && (
        <div className="screen">
          <div className="top-bar" style={{ padding: "0 0 16px", position: "relative", background: "transparent" }}>
            <button className="back-btn" onClick={() => setScreen("dashboard")}>← Back</button>
          </div>
          <div className="eyebrow">Glimmer Journal</div>
          <h2>Add a glimmer</h2>
          <p>A glimmer is a small moment of connection, safety, or warmth. They're easy to miss. Naming them helps your nervous system register more of them.</p>
          <GlimmerAdd partner={partner} />
        </div>
      )}

      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
