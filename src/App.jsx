import { useState, useEffect, useCallback } from "react";

// ─── STORAGE ───────────────────────────────────────────────────────────────────
// Private data: stays on this device only (window.storage personal)
// Shared data:  synced between both partners via couple code (window.storage shared)
const IDENTITY_KEY  = "mfr_identity_v4";
const PRIVATE_KEY   = "mfr_private_v4";

function loadIdentity() {
  try { const r = localStorage.getItem(IDENTITY_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveIdentity(id) {
  try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(id)); } catch {}
}
function loadPrivate() {
  try { const r = localStorage.getItem(PRIVATE_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
function savePrivate(d) {
  try { localStorage.setItem(PRIVATE_KEY, JSON.stringify(d)); } catch {}
}

// Shared data keys (namespaced by couple code so only linked partners share)
function sharedKey(coupleCode) { return `mfr_shared_${coupleCode}`; }

async function loadShared(coupleCode) {
  if (!coupleCode) return {};
  try {
    const result = await window.storage.get(sharedKey(coupleCode), true);
    return result ? JSON.parse(result.value) : {};
  } catch { return {}; }
}

async function saveShared(coupleCode, data) {
  if (!coupleCode) return;
  try {
    await window.storage.set(sharedKey(coupleCode), JSON.stringify(data), true);
  } catch(e) { console.warn("Shared save failed:", e); }
}

// Generate a short readable couple code: WORD-NNNN
function generateCoupleCode() {
  const words = ["ROSE","SAGE","OAK","TIDE","DAWN","MIST","GOLD","PINE","REED","CLAY","FERN","LARK"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `${word}-${num}`;
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream:          #F4F1EC;
    --ink:            #1C1C1C;
    --depth:          #2C3540;
    --lavender:       #E4E1F0;
    --steel:          #C9D1DC;
    --blush:          #C49A8A;
    --blush-light:    rgba(196,154,138,0.15);
    --blush-mid:      rgba(196,154,138,0.3);
    --plum:           #484659;
    --escalation-bg:  #F0EEF8;
    --rose:           #C4826A;
    --rose-light:     rgba(196,130,106,0.12);
    --rose-border:    rgba(196,130,106,0.3);
    --sage:           #7A9E8E;
    --sage-light:     rgba(122,158,142,0.12);
    --sage-border:    rgba(122,158,142,0.3);
    --gold:           #B8995A;
    --gold-light:     rgba(184,153,90,0.12);
    --gold-border:    rgba(184,153,90,0.3);
    --surface:        rgba(255,255,255,0.55);
    --surface-soft:   rgba(255,255,255,0.35);
    --surface-solid:  rgba(255,255,255,0.82);
    --sand:           rgba(234,228,216,0.7);
    --border:         rgba(200,192,178,0.5);
    --border-solid:   #D8D0C4;
    --charcoal:       var(--ink);
    --charcoal-mid:   #3A3A3A;
    --charcoal-light: #767676;
    --white:          rgba(255,255,255,0.82);
    --font-serif: 'EB Garamond', Georgia, serif;
    --font-sans:  'Jost', sans-serif;
    --radius:     10px;
    --radius-lg:  18px;
    --radius-xl:  28px;
    --shadow-sm: 0 2px 8px rgba(28,28,28,0.06);
    --shadow-md: 0 6px 24px rgba(28,28,28,0.10);
    --shadow-lg: 0 12px 40px rgba(28,28,28,0.13);
    --gradient-atm:
      radial-gradient(ellipse 80% 60% at 20% 20%, rgba(228,225,240,0.22) 0%, transparent 65%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(201,209,220,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 50% 70% at 60% 10%, rgba(196,154,138,0.08) 0%, transparent 55%);
  }

  /* ── BASE ── */
  html, body { height: 100%; background: var(--cream); color: var(--ink); font-family: var(--font-sans); font-weight: 400; -webkit-font-smoothing: antialiased; }
  #root { min-height: 100vh; }
  .app { min-height: 100vh; display: flex; flex-direction: column; background: var(--cream); background-image: var(--gradient-atm); background-attachment: fixed; }
  .app.mode-escalate { background: var(--escalation-bg); background-image: var(--gradient-atm); }
  .app.mode-escalate .nav { display: none; }

  /* ── NAV ── */
  .nav { background: rgba(244,241,236,0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 0 24px; height: 62px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
  .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-logo { width: 32px; height: 32px; }
  .nav-title { font-family: var(--font-serif); font-size: 1.15rem; color: var(--ink); }
  .nav-subtitle { font-size: 0.66rem; color: var(--charcoal-light); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .partner-badge { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em; }
  .partner-badge.p1 { background: var(--rose-light); color: var(--rose); border: 1px solid var(--rose-border); }
  .partner-badge.p2 { background: var(--sage-light); color: var(--sage); border: 1px solid var(--sage-border); }
  .progress-bar-track { width: 80px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--blush), var(--sage)); border-radius: 2px; transition: width 0.5s ease; }
  .nav-progress { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--charcoal-light); }

  /* ── LAYOUT ── */
  .main { flex: 1; padding: 32px 24px 64px; max-width: 800px; margin: 0 auto; width: 100%; }
  .footer { text-align: center; padding: 22px; border-top: 1px solid var(--border); font-size: 0.7rem; color: var(--charcoal-light); background: rgba(244,241,236,0.6); }

  /* ── ANIMATIONS ── */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.35s ease forwards; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes breathe { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.12); opacity: 0.9; } }

  /* ── GLASS SURFACE — the unified card language ── */
  .card {
    background: var(--surface);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px;
    box-shadow: var(--shadow-sm);
  }
  .card + .card { margin-top: 12px; }
  .card-soft {
    background: var(--surface-soft);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px;
  }

  /* ── HOME SCREEN ── */
  .entry-screen { text-align: center; padding: 52px 0 28px; }
  .entry-eyebrow { font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--charcoal-light); font-weight: 600; margin-bottom: 16px; font-family: var(--font-sans); }
  .entry-heading { font-family: var(--font-serif); font-size: clamp(2.4rem, 6vw, 3.2rem); font-weight: 500; color: var(--ink); line-height: 1.15; margin-bottom: 14px; }
  .entry-heading em { font-style: italic; color: var(--blush); }
  .entry-sub { font-size: 0.92rem; color: var(--charcoal-light); margin-bottom: 44px; line-height: 1.75; max-width: 460px; margin-left: auto; margin-right: auto; font-weight: 300; }
  .entry-divider { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
  .entry-footer { font-family: var(--font-serif); font-style: italic; font-size: 0.85rem; color: var(--charcoal-light); }

  /* ── PATH CARDS — 3-tier entry gate ── */
  .path-cards { display: grid; grid-template-columns: 1fr; gap: 10px; max-width: 520px; margin: 0 auto 32px; }
  .path-card {
    background: var(--surface);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px 26px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.22s ease;
    text-align: left;
    box-shadow: var(--shadow-sm);
  }
  .path-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .path-card.escalate { background: var(--depth); border-color: var(--depth); border-left: 4px solid var(--blush); }
  .path-card.escalate:hover { background: #36424F; box-shadow: 0 8px 28px rgba(44,53,64,0.32); }
  .path-card.escalate .path-card-title { color: #ffffff; }
  .path-card.escalate .path-card-desc { color: rgba(255,255,255,0.65); }
  .path-card.escalate .path-card-arrow { color: rgba(255,255,255,0.4); }
  .path-card.repair { background: var(--surface); border-color: var(--border); }
  .path-card.repair:hover { background: rgba(255,255,255,0.72); border-color: var(--sage-border); }
  .path-card.learn { background: var(--surface-soft); border-color: var(--border); }
  .path-card.learn:hover { background: var(--surface); border-color: var(--gold-border); }
  .path-card-text { flex: 1; }
  .path-card-title { font-family: var(--font-sans); font-weight: 600; font-size: 0.92rem; color: var(--ink); margin-bottom: 4px; letter-spacing: 0.01em; }
  .path-card-desc { font-size: 0.77rem; color: var(--charcoal-light); line-height: 1.6; font-weight: 300; }
  .path-card-arrow { color: var(--charcoal-light); font-size: 1rem; flex-shrink: 0; }

  .home-footer-links { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0 0 24px; font-size: 0.76rem; }
  .goals-quiet-link { background: none; border: none; color: var(--charcoal-light); font-size: 0.76rem; font-family: var(--font-sans); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; padding: 0; transition: color 0.15s; }
  .goals-quiet-link:hover { color: var(--ink); }
  .home-footer-divider { color: var(--border-solid); }
  .home-footer-code { color: var(--charcoal-light); letter-spacing: 0.06em; font-weight: 600; font-family: var(--font-sans); font-size: 0.73rem; }

  /* ── BUTTONS ── */
  .btn-primary { background: var(--ink); color: white; border: none; border-radius: 32px; padding: 11px 22px; font-size: 0.82rem; font-family: var(--font-sans); font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.04em; }
  .btn-primary:hover { background: var(--depth); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .btn-secondary {
    background: var(--surface);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: var(--ink);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 9px 20px;
    font-size: 0.8rem;
    font-family: var(--font-sans);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.75); box-shadow: var(--shadow-sm); }
  .btn-rose { background: var(--blush); color: white; border: none; border-radius: 32px; padding: 12px 24px; font-size: 0.86rem; font-family: var(--font-sans); font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%; letter-spacing: 0.02em; }
  .btn-rose:hover { background: #b8896f; transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .back-btn { margin-left: auto; font-size: 0.76rem; color: var(--charcoal-light); background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); padding: 6px 14px; border-radius: 20px; cursor: pointer; font-family: var(--font-sans); font-weight: 500; transition: all 0.15s; white-space: nowrap; }
  .back-btn:hover { background: rgba(255,255,255,0.75); color: var(--ink); }
  .back-btn-ghost { background: none; border: none; font-size: 0.78rem; color: var(--charcoal-light); cursor: pointer; font-family: var(--font-sans); font-weight: 500; padding: 0; transition: color 0.15s; }
  .back-btn-ghost:hover { color: var(--ink); }

  /* ── ONBOARDING ── */
  .onboard-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px 24px; background: var(--cream); background-image: var(--gradient-atm); }
  .onboard-card { background: var(--surface); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 44px 38px; max-width: 480px; width: 100%; box-shadow: var(--shadow-lg); }
  .onboard-logo { display: flex; justify-content: center; margin-bottom: 24px; }
  .onboard-eyebrow { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--charcoal-light); font-weight: 600; text-align: center; margin-bottom: 10px; }
  .onboard-heading { font-family: var(--font-serif); font-size: 2.2rem; font-weight: 500; color: var(--ink); line-height: 1.15; text-align: center; margin-bottom: 6px; }
  .onboard-heading em { font-style: italic; color: var(--blush); }
  .onboard-sub { font-size: 0.84rem; color: var(--charcoal-light); text-align: center; line-height: 1.75; margin-bottom: 32px; font-weight: 300; }
  .onboard-divider { border: none; border-top: 1px solid var(--border); margin: 22px 0; }
  .onboard-step-title { font-family: var(--font-serif); font-size: 1.1rem; color: var(--ink); margin-bottom: 4px; }
  .onboard-step-sub { font-size: 0.8rem; color: var(--charcoal-light); margin-bottom: 20px; line-height: 1.55; font-weight: 300; }
  .onboard-role-select { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .role-btn { padding: 14px 12px; border-radius: var(--radius-lg); border: 1.5px solid var(--border); cursor: pointer; font-family: var(--font-sans); font-size: 0.82rem; font-weight: 500; transition: all 0.15s; background: var(--surface-soft); backdrop-filter: blur(8px); color: var(--charcoal-mid); text-align: center; }
  .role-btn .role-label { font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
  .role-btn .role-name-preview { font-family: var(--font-serif); font-size: 0.95rem; color: var(--charcoal-light); font-style: italic; }
  .role-btn.selected-p1 { border-color: var(--rose-border); background: var(--rose-light); }
  .role-btn.selected-p1 .role-label { color: var(--rose); }
  .role-btn.selected-p2 { border-color: var(--sage-border); background: var(--sage-light); }
  .role-btn.selected-p2 .role-label { color: var(--sage); }
  .onboard-name-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .onboard-name-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--charcoal-light); }
  .onboard-name-input { border: 1px solid var(--border); border-radius: var(--radius); padding: 11px 14px; font-family: var(--font-serif); font-size: 1rem; color: var(--ink); background: var(--surface-solid); backdrop-filter: blur(8px); outline: none; transition: border-color 0.15s; width: 100%; }
  .onboard-name-input:focus { border-color: var(--blush); }
  .onboard-note { font-size: 0.74rem; color: var(--charcoal-light); line-height: 1.65; margin-bottom: 20px; font-weight: 300; }
  .onboard-submit { width: 100%; padding: 14px; border-radius: 32px; border: none; font-family: var(--font-sans); font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.04em; }
  .onboard-submit.ready { background: var(--ink); color: white; }
  .onboard-submit.ready:hover { background: var(--depth); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .onboard-submit:not(.ready) { background: var(--border); color: var(--charcoal-light); cursor: not-allowed; }
  .onboard-quote { text-align: center; font-family: var(--font-serif); font-style: italic; font-size: 0.82rem; color: var(--charcoal-light); margin-top: 22px; }
  .onboard-code-tabs { display: flex; margin-bottom: 20px; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--surface-soft); }
  .code-tab { flex: 1; padding: 10px; border: none; font-family: var(--font-sans); font-size: 0.78rem; font-weight: 500; cursor: pointer; color: var(--charcoal-light); transition: all 0.15s; background: transparent; }
  .code-tab.active { background: var(--surface-solid); color: var(--ink); font-weight: 700; }
  .couple-code-display { font-size: 2rem; font-weight: 700; letter-spacing: 0.15em; text-align: center; padding: 18px; background: var(--surface); border: 1.5px dashed var(--border); border-radius: var(--radius-lg); color: var(--ink); margin: 12px 0; font-family: var(--font-sans); }
  .code-regen-btn { display: block; margin: 0 auto 16px; background: none; border: none; font-size: 0.76rem; color: var(--charcoal-light); cursor: pointer; font-family: var(--font-sans); text-decoration: underline; }
  .join-error { color: var(--rose); font-size: 0.8rem; margin: 8px 0; text-align: center; }
  .back-link { display: block; text-align: center; background: none; border: none; color: var(--charcoal-light); font-size: 0.8rem; cursor: pointer; margin-top: 12px; font-family: var(--font-sans); text-decoration: underline; }
  .code-create-box, .code-join-box { display: flex; flex-direction: column; }
  .cc-label { color: var(--charcoal-light); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.72rem; }
  .cc-code { font-weight: 700; letter-spacing: 0.1em; color: var(--ink); font-family: var(--font-sans); font-size: 0.86rem; }
  .cc-hint { color: var(--charcoal-light); font-style: italic; font-size: 0.72rem; }

  /* ── SECTIONS — path inner screens ── */
  .section { margin-bottom: 34px; }
  .section-title { font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--ink); margin-bottom: 8px; }
  .section-desc { font-size: 0.83rem; color: var(--charcoal-light); margin-bottom: 18px; line-height: 1.72; font-weight: 300; }

  /* ── PATH HEADER (repair, learn, goals) ── */
  .path-header { display: flex; align-items: center; gap: 12px; margin-bottom: 34px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
  .path-header-icon { font-size: 1.5rem; }
  .path-header-title { font-family: var(--font-serif); font-size: 1.65rem; font-weight: 500; color: var(--ink); }
  .path-header-subtitle { font-size: 0.72rem; color: var(--charcoal-light); margin-top: 3px; letter-spacing: 0.05em; font-weight: 300; }

  /* ── ESCALATION EMERGENCY SCREEN ── */
  .escalate-screen { max-width: 560px; margin: 0 auto; }
  .escalate-top-bar { display: flex; align-items: center; justify-content: space-between; padding: 22px 0 14px; border-bottom: 1px solid var(--border); margin-bottom: 40px; }
  .escalate-eyebrow { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--plum); }
  .escalate-hero { text-align: center; margin-bottom: 48px; }
  .escalate-headline { font-family: var(--font-serif); font-size: clamp(2.4rem, 5vw, 3.2rem); font-weight: 500; color: var(--depth); line-height: 1.12; margin-bottom: 12px; }
  .escalate-sub { font-size: 0.88rem; color: var(--charcoal-light); font-weight: 300; }
  .escalate-breathe {
    width: 52px; height: 52px; border-radius: 50%; margin: 20px auto 0;
    background: radial-gradient(circle, var(--blush-mid) 0%, transparent 70%);
    animation: breathe 4s ease-in-out infinite;
  }

  /* ── FORMS ── */
  .textarea-field { width: 100%; min-height: 80px; padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-solid); backdrop-filter: blur(8px); font-family: var(--font-sans); font-size: 0.85rem; color: var(--ink); resize: vertical; line-height: 1.65; transition: border-color 0.15s; outline: none; }
  .textarea-field:focus { border-color: var(--blush); }
  .textarea-field.p1-field:focus { border-color: var(--rose); }
  .textarea-field.p2-field:focus { border-color: var(--sage); }
  .field-label { font-size: 0.74rem; font-weight: 600; color: var(--charcoal-light); margin-bottom: 6px; letter-spacing: 0.03em; font-family: var(--font-sans); }
  .field-label.p1 { color: var(--rose); }
  .field-label.p2 { color: var(--sage); }
  .field-group { margin-bottom: 16px; }
  .save-indicator { font-size: 0.7rem; color: var(--sage); margin-top: 3px; opacity: 0; transition: opacity 0.3s; }
  .save-indicator.visible { opacity: 1; }

  /* ── TABS ── */
  .tab-bar { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 26px; overflow-x: auto; scrollbar-width: none; background: transparent; }
  .tab-bar::-webkit-scrollbar { display: none; }
  .tab-btn { font-family: var(--font-sans); font-size: 0.74rem; font-weight: 600; letter-spacing: 0.04em; padding: 10px 16px; background: none; border: none; cursor: pointer; color: var(--charcoal-light); white-space: nowrap; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; }
  .tab-btn:hover { color: var(--ink); }
  .tab-btn.active { color: var(--ink); border-bottom-color: var(--blush); }
  .tab-check { font-size: 0.65rem; color: var(--sage); margin-left: 3px; }

  /* ── PARTNER SELECTOR ── */
  .partner-selector { display: flex; align-items: center; gap: 10px; background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 12px 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .partner-selector-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--charcoal-light); white-space: nowrap; }
  .partner-sel-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border); font-size: 0.8rem; font-family: var(--font-sans); font-weight: 600; cursor: pointer; transition: all 0.15s; background: transparent; color: var(--charcoal-mid); }
  .partner-sel-btn.p1.active { background: var(--rose-light); color: var(--rose); border-color: var(--rose-border); }
  .partner-sel-btn.p2.active { background: var(--sage-light); color: var(--sage); border-color: var(--sage-border); }
  .partner-selector-hint { font-size: 0.7rem; color: var(--charcoal-light); font-style: italic; margin-left: auto; }
  .private-banner { font-size: 0.74rem; font-weight: 600; padding: 8px 14px; border-radius: var(--radius); margin-bottom: 14px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .partner-col-header { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 7px 12px; border-radius: var(--radius); margin-bottom: 12px; }
  .partner-col-header.p1 { background: var(--rose-light); color: var(--rose); border: 1px solid var(--rose-border); }
  .partner-col-header.p2 { background: var(--sage-light); color: var(--sage); border: 1px solid var(--sage-border); }

  /* ── CALLOUTS ── */
  .callout { border-radius: var(--radius); padding: 13px 16px; font-size: 0.81rem; line-height: 1.65; margin: 12px 0; backdrop-filter: blur(8px); }
  .callout.sage { background: var(--sage-light); border: 1px solid var(--sage-border); color: var(--charcoal-mid); }
  .callout.rose { background: var(--rose-light); border: 1px solid var(--rose-border); color: var(--charcoal-mid); }
  .callout.gold { background: var(--gold-light); border: 1px solid var(--gold-border); color: var(--charcoal-mid); }
  .callout.purple { background: var(--blush-light); border: 1px solid var(--blush-mid); color: var(--charcoal-mid); }

  /* ── BRIDGE PROMPT ── */
  .bridge-prompt { border-radius: var(--radius-lg); padding: 20px 24px; margin-top: 36px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; backdrop-filter: blur(8px); }
  .bridge-prompt.blush { background: var(--blush-light); border: 1px solid var(--blush-mid); }
  .bridge-prompt.sage { background: var(--sage-light); border: 1px solid var(--sage-border); }
  .bridge-prompt-text { font-size: 0.83rem; color: var(--charcoal-mid); line-height: 1.6; font-weight: 300; }
  .bridge-btn { background: var(--blush); color: white; border: none; border-radius: 32px; padding: 10px 20px; font-family: var(--font-sans); font-size: 0.8rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
  .bridge-btn:hover { background: #b8896f; transform: translateY(-1px); box-shadow: var(--shadow-sm); }

  /* ── PROTOCOL STEPS ── */
  .protocol-steps { display: flex; flex-direction: column; gap: 10px; }
  .protocol-step { border-radius: var(--radius); padding: 14px 18px; display: flex; gap: 12px; align-items: flex-start; background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); }
  .protocol-step.step-1 { border-left: 3px solid var(--rose); }
  .protocol-step.step-2 { border-left: 3px solid var(--sage); }
  .protocol-step.step-3 { border-left: 3px solid var(--plum); }
  .protocol-step.step-4 { border-left: 3px solid var(--gold); }
  .protocol-step.step-5 { border-left: 3px solid var(--blush); }
  .step-num { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.76rem; flex-shrink: 0; background: var(--surface-solid); color: var(--ink); border: 1px solid var(--border); }
  .step-content { flex: 1; }
  .step-label { font-weight: 600; font-size: 0.86rem; color: var(--ink); margin-bottom: 3px; }
  .step-text { font-size: 0.8rem; color: var(--charcoal-mid); line-height: 1.6; font-weight: 300; }
  .step-phrase { margin-top: 8px; padding: 8px 12px; background: var(--surface-solid); border-radius: 6px; font-family: var(--font-serif); font-style: italic; font-size: 0.86rem; color: var(--ink); border: 1px solid var(--border); }

  /* ── STOP SKILL ── */
  .stop-card { background: var(--depth); border-radius: var(--radius-lg); padding: 26px; color: white; margin-bottom: 20px; box-shadow: var(--shadow-md); }
  .stop-title { font-family: var(--font-serif); font-size: 1.35rem; color: white; margin-bottom: 4px; }
  .stop-sub { font-size: 0.72rem; opacity: 0.55; margin-bottom: 22px; letter-spacing: 0.06em; text-transform: uppercase; }
  .stop-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .stop-step { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius); padding: 14px 10px; text-align: center; }
  .stop-letter { font-family: var(--font-serif); font-size: 2.2rem; font-weight: 500; margin-bottom: 4px; line-height: 1; }
  .stop-step:nth-child(1) .stop-letter { color: var(--blush); }
  .stop-step:nth-child(2) .stop-letter { color: rgba(122,158,142,0.9); }
  .stop-step:nth-child(3) .stop-letter { color: rgba(184,153,90,0.9); }
  .stop-step:nth-child(4) .stop-letter { color: rgba(228,225,240,0.9); }
  .stop-word { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.7; margin-bottom: 6px; }
  .stop-desc { font-size: 0.71rem; opacity: 0.6; line-height: 1.45; }
  .stop-cue { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius); padding: 14px 16px; margin-top: 18px; }
  .stop-cue-label { font-size: 0.64rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.45; margin-bottom: 6px; font-weight: 700; }
  .stop-cue-text { font-family: var(--font-serif); font-style: italic; font-size: 0.9rem; color: white; line-height: 1.65; opacity: 0.9; }

  /* ── ACTIVATION ── */
  .activation-check { background: var(--surface); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px; }
  .activation-partners { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .activation-name { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
  .activation-name.p1 { color: var(--rose); }
  .activation-name.p2 { color: var(--sage); }
  .activation-value { font-size: 1.5rem; font-weight: 600; color: var(--ink); font-family: var(--font-serif); }
  .activation-slider { width: 100%; accent-color: var(--blush); margin: 6px 0; cursor: pointer; }
  .slider-row { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--charcoal-light); }
  .activation-cue { margin-top: 14px; font-size: 0.8rem; border-radius: var(--radius); padding: 11px 14px; backdrop-filter: blur(8px); }
  .activation-cue.pause { background: var(--rose-light); color: var(--rose); border: 1px solid var(--rose-border); }
  .activation-cue.proceed { background: var(--sage-light); color: var(--sage); border: 1px solid var(--sage-border); }
  .return-time { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px 20px; margin: 16px 0; }
  .return-time-label { font-size: 0.76rem; font-weight: 600; color: var(--charcoal-light); margin-bottom: 12px; letter-spacing: 0.02em; }
  .return-time-options { display: flex; gap: 8px; flex-wrap: wrap; }
  .return-btn { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border); font-size: 0.76rem; font-family: var(--font-sans); font-weight: 500; cursor: pointer; transition: all 0.15s; background: var(--surface-soft); color: var(--ink); }
  .return-btn.selected { background: var(--depth); color: white; border-color: var(--depth); }
  .return-time-display { margin-top: 12px; font-family: var(--font-serif); font-style: italic; font-size: 0.9rem; color: var(--ink); }

  /* ── FORMULA ── */
  .formula-box { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 20px; text-align: center; margin: 14px 0; }
  .formula-label { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--charcoal-light); margin-bottom: 6px; font-weight: 600; }
  .formula-text { font-family: var(--font-serif); font-size: 1.05rem; color: var(--ink); }
  .formula-text span { color: var(--blush); }

  /* ── AUDIO ── */
  .audio-player { background: var(--depth); border-radius: var(--radius-lg); padding: 18px 22px; color: white; margin: 16px 0; box-shadow: var(--shadow-sm); }
  .audio-title { font-family: var(--font-serif); font-size: 0.95rem; font-style: italic; margin-bottom: 3px; }
  .audio-desc { font-size: 0.72rem; opacity: 0.55; margin-bottom: 14px; font-weight: 300; }
  .audio-controls { display: flex; align-items: center; gap: 10px; }
  .audio-btn { width: 38px; height: 38px; border-radius: 50%; background: var(--blush); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: white; transition: all 0.2s; flex-shrink: 0; }
  .audio-btn:hover { background: #b8896f; }
  .audio-track { flex: 1; height: 2px; background: rgba(255,255,255,0.18); border-radius: 2px; }
  .audio-track-fill { height: 100%; background: var(--blush); border-radius: 2px; transition: width 0.1s; }
  .audio-time { font-size: 0.7rem; opacity: 0.5; }
  .audio-placeholder { font-size: 0.68rem; opacity: 0.4; font-style: italic; margin-top: 8px; }

  /* ── SCRIPTS ── */
  .scripts-toggle { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 16px; width: 100%; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-sans); font-size: 0.84rem; color: var(--ink); font-weight: 500; transition: all 0.15s; }
  .scripts-toggle:hover { background: rgba(255,255,255,0.72); }
  .scripts-panel { border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--radius) var(--radius); background: var(--surface); backdrop-filter: blur(8px); overflow: hidden; }
  .script-item { padding: 14px 18px; border-bottom: 1px solid var(--border); }
  .script-item:last-child { border-bottom: none; }
  .script-situation { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--charcoal-light); margin-bottom: 8px; }
  .script-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 5px; }
  .script-icon { font-size: 0.82rem; flex-shrink: 0; margin-top: 2px; }
  .script-text { font-size: 0.82rem; line-height: 1.6; color: var(--charcoal-mid); font-family: var(--font-serif); font-style: italic; }
  .script-text.avoid { text-decoration: line-through; opacity: 0.4; font-style: normal; font-family: var(--font-sans); font-size: 0.78rem; }

  /* ── REPAIR ── */
  .repair-step { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .repair-step:last-child { border-bottom: none; }
  .repair-num { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: var(--blush); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.76rem; }
  .repair-title { font-weight: 600; font-size: 0.86rem; color: var(--ink); margin-bottom: 2px; }
  .repair-desc { font-size: 0.79rem; color: var(--charcoal-mid); line-height: 1.55; font-weight: 300; }

  /* ── DEAR MAN ── */
  .dear-man-grid { display: flex; flex-direction: column; gap: 8px; }
  .dear-step { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; }
  .dear-letter { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 500; color: var(--gold); flex-shrink: 0; width: 28px; line-height: 1; }
  .dear-word { font-weight: 600; font-size: 0.84rem; color: var(--ink); margin-bottom: 2px; }
  .dear-desc { font-size: 0.78rem; color: var(--charcoal-mid); line-height: 1.55; font-weight: 300; }
  .dear-example { font-family: var(--font-serif); font-style: italic; font-size: 0.82rem; color: var(--charcoal-light); margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border); }

  /* ── GOALS ── */
  .goals-banner { background: var(--surface); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; text-align: center; }
  .goals-banner-title { font-family: var(--font-serif); font-size: 1.3rem; color: var(--ink); margin-bottom: 6px; }
  .goals-banner-sub { font-size: 0.82rem; color: var(--charcoal-light); line-height: 1.65; font-weight: 300; }
  .goals-sync-note { display: flex; align-items: center; gap: 6px; font-size: 0.74rem; color: var(--sage); font-weight: 600; margin-bottom: 22px; }
  .goals-sync-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--sage); animation: pulse 2s infinite; }

  /* ── CONFLICT PROFILE ── */
  .profile-question { margin-bottom: 20px; }
  .profile-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .profile-chip { font-size: 0.74rem; padding: 5px 13px; border-radius: 20px; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s; font-family: var(--font-sans); user-select: none; background: var(--surface-soft); color: var(--charcoal-mid); }
  .profile-chip.selected-p1 { background: var(--rose-light); color: var(--rose); border-color: var(--rose-border); }
  .profile-chip.selected-p2 { background: var(--sage-light); color: var(--sage); border-color: var(--sage-border); }
  .profile-chip:hover { border-color: var(--charcoal-light); }

  /* ── WINDOW ZONES ── */
  .window-zones { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 18px; }
  .zone { padding: 13px 18px; backdrop-filter: blur(8px); }
  .zone.above { background: var(--rose-light); border-bottom: 1px solid var(--border); }
  .zone.inside { background: var(--sage-light); border-bottom: 1px solid var(--border); }
  .zone.below { background: var(--blush-light); }
  .zone-label { font-weight: 700; font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; }
  .zone.above .zone-label { color: var(--rose); }
  .zone.inside .zone-label { color: var(--sage); }
  .zone.below .zone-label { color: var(--plum); }
  .zone-desc { font-size: 0.79rem; color: var(--charcoal-mid); line-height: 1.55; font-weight: 300; }

  /* ── WOT RELATIONSHIP PANEL ── */
  .rel-wot { background: var(--surface); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 22px; margin-top: 16px; }
  .rel-wot-title { font-family: var(--font-serif); font-size: 1rem; color: var(--ink); margin-bottom: 4px; }
  .rel-wot-sub { font-size: 0.78rem; color: var(--charcoal-light); margin-bottom: 16px; line-height: 1.55; font-weight: 300; }
  .rel-wot-rows { display: flex; flex-direction: column; gap: 8px; }
  .rel-wot-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .rel-wot-cell { border-radius: var(--radius); padding: 10px 12px; }
  .rel-wot-cell.rose { background: var(--rose-light); border: 1px solid var(--rose-border); }
  .rel-wot-cell.sage { background: var(--sage-light); border: 1px solid var(--sage-border); }
  .rel-wot-cell-label { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 4px; }
  .rel-wot-cell.rose .rel-wot-cell-label { color: var(--rose); }
  .rel-wot-cell.sage .rel-wot-cell-label { color: var(--sage); }
  .rel-wot-cell-text { font-family: var(--font-serif); font-style: italic; font-size: 0.82rem; color: var(--charcoal-mid); line-height: 1.55; }
  .empty-wot { font-size: 0.78rem; color: var(--charcoal-light); font-style: italic; }

  /* ── CYCLE MAP ── */
  .cycle-step { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius); }
  .cycle-step + .cycle-step::before { content: "↓"; color: var(--charcoal-light); font-size: 1.1rem; display: block; text-align: center; padding: 3px 0; }
  .cycle-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--charcoal-light); margin-bottom: 3px; }
  .cycle-input { border: none; border-bottom: 1px solid var(--border); background: transparent; font-family: var(--font-serif); font-style: italic; font-size: 0.93rem; color: var(--ink); padding: 4px 0; width: 100%; outline: none; }
  .cycle-input:focus { border-bottom-color: var(--blush); }
  .cycle-loop-note { text-align: center; padding: 8px; font-size: 0.72rem; color: var(--charcoal-light); font-style: italic; }

  /* ── EFT ── */
  .eft-intro { font-family: var(--font-serif); font-style: italic; font-size: 0.93rem; color: var(--charcoal-mid); line-height: 1.8; margin-bottom: 18px; }
  .eft-partners { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 6px; }
  .eft-partner-col { display: flex; flex-direction: column; gap: 8px; }
  .eft-partner-header { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid var(--border); }
  .eft-partner-header.p1 { color: var(--rose); border-color: var(--rose-border); }
  .eft-partner-header.p2 { color: var(--sage); border-color: var(--sage-border); }
  .eft-layer { border-radius: var(--radius); padding: 12px 14px; backdrop-filter: blur(8px); }
  .eft-layer.behavior { background: var(--rose-light); border: 1px solid var(--rose-border); }
  .eft-layer.protective { background: var(--blush-light); border: 1px solid var(--blush-mid); }
  .eft-layer.vulnerable { background: var(--sage-light); border: 1px solid var(--sage-border); }
  .eft-layer.need { background: var(--gold-light); border: 1px solid var(--gold-border); }
  .eft-layer-label { font-size: 0.64rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
  .eft-layer.behavior .eft-layer-label { color: var(--rose); }
  .eft-layer.protective .eft-layer-label { color: var(--blush); }
  .eft-layer.vulnerable .eft-layer-label { color: var(--sage); }
  .eft-layer.need .eft-layer-label { color: var(--gold); }
  .eft-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
  .eft-chip { font-size: 0.7rem; padding: 3px 9px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; user-select: none; }
  .eft-chip.behavior-chip { background: var(--rose-light); color: var(--rose); border-color: var(--rose-border); }
  .eft-chip.behavior-chip.selected { background: var(--rose); color: white; border-color: var(--rose); }
  .eft-chip.protective-chip { background: var(--blush-light); color: var(--blush); border-color: var(--blush-mid); }
  .eft-chip.protective-chip.selected { background: var(--blush); color: white; }
  .eft-chip.vulnerable-chip { background: var(--sage-light); color: var(--sage); border-color: var(--sage-border); }
  .eft-chip.vulnerable-chip.selected { background: var(--sage); color: white; }
  .eft-chip.need-chip { background: var(--gold-light); color: var(--gold); border-color: var(--gold-border); }
  .eft-chip.need-chip.selected { background: var(--gold); color: white; }
  .eft-write-in { width: 100%; border: none; border-bottom: 1px dashed var(--border); background: transparent; font-family: var(--font-serif); font-style: italic; font-size: 0.8rem; color: var(--ink); padding: 4px 0; outline: none; }
  .eft-write-in:focus { border-bottom-color: var(--blush); }
  .eft-shared-core { background: var(--surface); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px 22px; text-align: center; margin: 14px 0; }
  .eft-core-label { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--charcoal-light); margin-bottom: 6px; }
  .eft-core-text { font-family: var(--font-serif); font-size: 0.98rem; color: var(--ink); line-height: 1.65; }
  .eft-core-text em { color: var(--sage); }
  .eft-bridge { background: var(--surface); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 22px; margin-top: 14px; }
  .eft-bridge-title { font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink); margin-bottom: 4px; }
  .eft-bridge-template { background: var(--blush-light); border: 1px solid var(--blush-mid); border-radius: var(--radius); padding: 14px 18px; font-family: var(--font-serif); font-style: italic; font-size: 0.87rem; color: var(--ink); line-height: 1.9; margin-bottom: 14px; }
  .eft-bridge-template span { color: var(--sage); text-decoration: underline dotted; }
  .move-selector { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .move-btn { padding: 7px 13px; border-radius: 20px; border: 1px solid var(--border); font-size: 0.76rem; font-family: var(--font-sans); font-weight: 500; cursor: pointer; transition: all 0.15s; background: var(--surface-soft); color: var(--charcoal-mid); }
  .move-btn.selected-pursue { background: var(--rose-light); color: var(--rose); border-color: var(--rose-border); }
  .move-btn.selected-withdraw { background: var(--blush-light); color: var(--plum); border-color: var(--blush-mid); }
  .move-btn.selected-both { background: var(--gold-light); color: var(--gold); border-color: var(--gold-border); }
  .line-of-consciousness { position: relative; margin: 20px 0; display: flex; align-items: center; gap: 10px; }
  .loc-line { flex: 1; height: 1px; background: var(--charcoal-light); opacity: 0.25; }
  .loc-label { font-size: 0.64rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--charcoal-light); white-space: nowrap; padding: 3px 10px; border: 1px solid var(--border); border-radius: 20px; background: var(--surface-solid); }

  /* ── PRACTICE TAB ── */
  .trigger-input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 12px; background: var(--surface-solid); font-family: var(--font-sans); font-size: 0.82rem; color: var(--ink); outline: none; transition: border-color 0.15s; }
  .trigger-input:focus { border-color: var(--gold); }
  .add-trigger-btn { background: transparent; border: 1px dashed var(--border); border-radius: var(--radius); padding: 8px 14px; font-size: 0.78rem; color: var(--charcoal-light); cursor: pointer; font-family: var(--font-sans); transition: all 0.15s; }
  .add-trigger-btn:hover { background: var(--surface); border-color: var(--charcoal-light); }

  /* ── CONFLICT LOG ── */
  .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .log-count { font-size: 0.74rem; color: var(--charcoal-light); }
  .log-entry { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 10px; }
  .log-entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .log-date { font-size: 0.7rem; color: var(--charcoal-light); font-weight: 600; letter-spacing: 0.04em; }
  .log-protocol-badge { font-size: 0.66rem; font-weight: 700; padding: 3px 8px; border-radius: 10px; letter-spacing: 0.04em; }
  .log-protocol-badge.yes { background: var(--sage-light); color: var(--sage); border: 1px solid var(--sage-border); }
  .log-protocol-badge.no { background: var(--rose-light); color: var(--rose); border: 1px solid var(--rose-border); }
  .log-field { margin-bottom: 8px; }
  .log-field-label { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--charcoal-light); margin-bottom: 3px; }
  .log-field-value { font-size: 0.82rem; color: var(--charcoal-mid); line-height: 1.6; font-family: var(--font-serif); font-style: italic; }
  .new-entry-form { background: var(--surface); backdrop-filter: blur(8px); border: 1.5px dashed var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 14px; }
  .new-entry-title { font-family: var(--font-serif); font-size: 1rem; color: var(--ink); margin-bottom: 14px; }
  .protocol-toggle { display: flex; gap: 8px; margin-bottom: 14px; }
  .toggle-btn { flex: 1; padding: 8px; border-radius: var(--radius); border: 1px solid var(--border); cursor: pointer; font-size: 0.78rem; font-family: var(--font-sans); font-weight: 500; transition: all 0.15s; background: var(--surface-soft); color: var(--charcoal-mid); }
  .toggle-btn.active-yes { background: var(--sage-light); border-color: var(--sage-border); color: var(--sage); font-weight: 700; }
  .toggle-btn.active-no { background: var(--rose-light); border-color: var(--rose-border); color: var(--rose); font-weight: 700; }
  .form-actions { display: flex; gap: 8px; margin-top: 14px; }

  /* ── GLIMMER ── */
  .glimmer-entry { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 8px; display: flex; gap: 10px; align-items: flex-start; }
  .glimmer-icon { font-size: 1.1rem; flex-shrink: 0; }
  .glimmer-text { font-family: var(--font-serif); font-style: italic; font-size: 0.88rem; color: var(--charcoal-mid); line-height: 1.6; }
  .glimmer-date { font-size: 0.66rem; color: var(--charcoal-light); margin-top: 3px; }
  .glimmer-input-area { display: flex; gap: 8px; margin-top: 10px; }
  .glimmer-input { flex: 1; padding: 10px 13px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-solid); font-family: var(--font-serif); font-style: italic; font-size: 0.86rem; color: var(--ink); outline: none; transition: border-color 0.15s; }
  .glimmer-input:focus { border-color: var(--sage); }
  .glimmer-add-btn { background: var(--sage); color: white; border: none; border-radius: var(--radius); padding: 10px 14px; font-size: 0.78rem; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .glimmer-add-btn:hover { background: #6A8E7E; }

  /* ── CHECKLIST ── */
  .checklist-item { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; }
  .checklist-cb { width: 16px; height: 16px; margin-top: 2px; accent-color: var(--blush); cursor: pointer; flex-shrink: 0; }
  .checklist-label { font-size: 0.83rem; color: var(--charcoal-mid); line-height: 1.55; cursor: pointer; font-weight: 300; }

  /* ── INSPECTION ── */
  .inspection-question { margin-bottom: 18px; }
  .inspection-slider { width: 100%; accent-color: var(--blush); margin: 4px 0; }
  .slider-value { font-weight: 600; font-size: 1.1rem; color: var(--blush); font-family: var(--font-serif); margin-bottom: 4px; }
  .daily-reset { background: var(--surface); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px 22px; }
  .daily-title { font-family: var(--font-serif); font-size: 1rem; margin-bottom: 3px; color: var(--ink); }
  .daily-sub { font-size: 0.76rem; color: var(--charcoal-light); margin-bottom: 14px; font-weight: 300; }
  .daily-prompt { background: var(--surface-solid); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 8px; border: 1px solid var(--border); }
  .daily-prompt-q { font-size: 0.8rem; font-weight: 600; color: var(--ink); margin-bottom: 5px; }

  /* ── AGREEMENT ── */
  .agreement-intro { font-family: var(--font-serif); font-style: italic; font-size: 0.93rem; color: var(--charcoal-mid); line-height: 1.75; margin-bottom: 22px; }
  .commitment { padding: 14px 0; border-bottom: 1px solid var(--border); display: flex; gap: 12px; align-items: flex-start; }
  .commitment:last-of-type { border-bottom: none; }
  .commitment-num { width: 24px; height: 24px; border-radius: 50%; background: var(--ink); color: white; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
  .commitment-title { font-weight: 600; font-size: 0.86rem; color: var(--ink); margin-bottom: 3px; }
  .commitment-text { font-size: 0.8rem; color: var(--charcoal-mid); line-height: 1.6; font-weight: 300; }
  .sig-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 22px 0; }
  .sig-field input { width: 100%; border: none; border-bottom: 2px solid var(--ink); padding: 8px 4px; background: transparent; font-family: var(--font-serif); font-size: 1rem; color: var(--ink); outline: none; }
  .sig-label { font-size: 0.66rem; color: var(--charcoal-light); margin-top: 5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  .agreement-tagline { text-align: center; font-family: var(--font-serif); font-style: italic; font-size: 1.05rem; color: var(--ink); margin-top: 20px; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); backdrop-filter: blur(8px); }
  .agreement-saved { text-align: center; margin-top: 14px; }
  .badge { display: inline-flex; align-items: center; gap: 6px; background: var(--sage-light); color: var(--sage); border: 1px solid var(--sage-border); padding: 7px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }

  /* ── ANTI-PATTERNS ── */
  .anti-pattern { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .anti-pattern:last-child { border-bottom: none; }
  .anti-icon { font-size: 0.95rem; flex-shrink: 0; margin-top: 2px; }
  .anti-name { font-weight: 600; font-size: 0.83rem; color: var(--ink); }
  .anti-desc { font-size: 0.78rem; color: var(--charcoal-light); margin-top: 1px; line-height: 1.55; font-weight: 300; }

  /* ── COMPARE ── */
  .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .compare-cell { border-radius: var(--radius); padding: 14px; backdrop-filter: blur(8px); }
  .compare-cell.left { background: var(--rose-light); border: 1px solid var(--rose-border); }
  .compare-cell.right { background: var(--sage-light); border: 1px solid var(--sage-border); }
  .compare-title { font-weight: 700; font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 6px; }
  .compare-cell.left .compare-title { color: var(--rose); }
  .compare-cell.right .compare-title { color: var(--sage); }
  .compare-item { font-size: 0.78rem; color: var(--charcoal-mid); line-height: 1.6; padding: 2px 0; font-weight: 300; }
  .compare-example { font-family: var(--font-serif); font-style: italic; font-size: 0.82rem; color: var(--ink); margin-top: 7px; padding-top: 7px; border-top: 1px solid var(--border); }

  /* ── COREG GRID ── */
  .coreg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
  .coreg-item { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--sage-border); border-radius: var(--radius); padding: 8px 10px; font-size: 0.76rem; color: var(--charcoal-mid); line-height: 1.55; display: flex; align-items: flex-start; gap: 5px; }
  .coreg-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--sage); flex-shrink: 0; margin-top: 5px; }

  /* ── CARD CHECK / MISC ── */
  .card-check { color: var(--sage); font-size: 0.85rem; margin-left: 5px; }
  .empty-state { text-align: center; padding: 28px 18px; border: 1px dashed var(--border); border-radius: var(--radius-lg); color: var(--charcoal-light); background: var(--surface-soft); }
  .empty-icon { font-size: 1.8rem; margin-bottom: 7px; }
  .empty-text { font-size: 0.83rem; line-height: 1.6; font-weight: 300; }
  .my-workbook-banner { display: flex; align-items: center; gap: 8px; background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 14px; font-size: 0.76rem; color: var(--charcoal-mid); margin-bottom: 6px; }
  .my-workbook-name { font-weight: 700; }
  .tab-shared { border-left: 1px solid var(--border); margin-left: 4px; padding-left: 14px !important; }
  .textarea { width: 100%; min-height: 70px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-solid); font-family: var(--font-sans); font-size: 0.84rem; color: var(--ink); resize: vertical; line-height: 1.6; outline: none; transition: border-color 0.15s; }
  .textarea:focus { border-color: var(--blush); }
  .partner-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .partner-input-group { display: flex; flex-direction: column; gap: 6px; }
  .partner-input-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .partner-input-label.p1 { color: var(--rose); }
  .partner-input-label.p2 { color: var(--sage); }
  .partner-input { border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink); background: var(--surface-solid); outline: none; transition: border-color 0.15s; width: 100%; }
  .partner-input.p1:focus { border-color: var(--rose); }
  .partner-input.p2:focus { border-color: var(--sage); }
  .path-nav { display: flex; gap: 8px; margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--border); }
  .path-nav-btn { flex: 1; padding: 12px; border-radius: var(--radius-lg); border: 1px solid var(--border); cursor: pointer; font-family: var(--font-sans); font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.15s; background: var(--surface); backdrop-filter: blur(8px); color: var(--ink); }
  .path-nav-btn:hover { box-shadow: var(--shadow-md); background: rgba(255,255,255,0.72); }
  .path-nav-btn.repair-nav { justify-content: flex-end; }
  .couple-code-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 12px 0 24px; padding: 10px 16px; background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.76rem; }

  /* ── RESPONSIVE ── */
  @media (max-width: 600px) {
    .compare-grid, .two-col, .eft-partners, .stop-steps { grid-template-columns: 1fr; }
    .sig-row { grid-template-columns: 1fr; }
    .nav-progress { display: none; }
    .main { padding: 20px 16px 48px; }
    .partner-inputs { grid-template-columns: 1fr; }
    .coreg-grid { grid-template-columns: 1fr; }
    .rel-wot-row { grid-template-columns: 1fr; }
    .activation-partners { grid-template-columns: 1fr; }
    .stop-steps { grid-template-columns: 1fr 1fr; }
  }
  /* ── HOME HERO ── */
  .home-hero { text-align: center; padding: 72px 0 48px; }
  .home-hero-eyebrow { font-size: 0.64rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--charcoal-light); font-weight: 700; margin-bottom: 18px; }
  .home-hero-heading { font-family: var(--font-serif); font-size: clamp(2.8rem, 7vw, 4rem); font-weight: 500; color: var(--ink); line-height: 1.12; margin-bottom: 22px; }
  .home-hero-heading em { font-style: italic; color: var(--blush); }
  .home-hero-sub { font-size: 1rem; color: var(--charcoal-light); margin-bottom: 48px; line-height: 1.75; max-width: 440px; margin-left: auto; margin-right: auto; font-weight: 300; }
  .btn-start-here {
    display: inline-block;
    background: var(--ink);
    color: white;
    border: none;
    border-radius: 40px;
    padding: 18px 52px;
    font-family: var(--font-sans);
    font-size: 0.96rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: var(--shadow-md);
    margin-bottom: 18px;
  }
  .btn-start-here:hover { background: var(--depth); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .btn-continue-quiet { display: block; background: none; border: none; color: var(--charcoal-light); font-size: 0.82rem; font-family: var(--font-sans); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; margin: 0 auto 44px; transition: color 0.15s; }
  .btn-continue-quiet:hover { color: var(--ink); }

  /* ── GATE SCREEN ── */
  .gate-screen { padding: 52px 0 32px; }
  .gate-eyebrow { font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 500; color: var(--ink); text-align: center; margin-bottom: 40px; }

  /* ── STRENGTHEN ── */
  .strengthen-locked { text-align: center; padding: 64px 24px; }
  .strengthen-lock-icon { font-size: 2.4rem; margin-bottom: 16px; opacity: 0.4; }
  .strengthen-lock-title { font-family: var(--font-serif); font-size: 1.5rem; color: var(--ink); margin-bottom: 10px; }
  .strengthen-lock-sub { font-size: 0.86rem; color: var(--charcoal-light); line-height: 1.75; max-width: 380px; margin: 0 auto 32px; font-weight: 300; }
  .strengthen-paths { display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto; }
  .strengthen-path-btn { background: var(--surface); backdrop-filter: blur(8px); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; cursor: pointer; text-align: left; font-family: var(--font-sans); transition: all 0.18s; }
  .strengthen-path-btn:hover { box-shadow: var(--shadow-md); background: rgba(255,255,255,0.72); }
  .strengthen-path-btn-title { font-weight: 600; font-size: 0.88rem; color: var(--ink); margin-bottom: 2px; }
  .strengthen-path-btn-sub { font-size: 0.75rem; color: var(--charcoal-light); font-weight: 300; }

  /* ── NAV TABS ── */
  .nav-tabs { display: flex; gap: 2px; }
  .nav-tab-btn { background: none; border: none; font-family: var(--font-sans); font-size: 0.74rem; font-weight: 600; letter-spacing: 0.04em; color: var(--charcoal-light); cursor: pointer; padding: 6px 12px; border-radius: 20px; transition: all 0.15s; white-space: nowrap; }
  .nav-tab-btn:hover { color: var(--ink); background: var(--surface); }
  .nav-tab-btn.active { color: var(--ink); background: var(--surface); }
  .nav-tab-btn.locked { color: var(--border-solid); cursor: not-allowed; opacity: 0.5; }

  /* ── REPAIR MODE — warm tonal overlay ── */
  .app.mode-repair { background: #F7F2EC; }
  .app.mode-repair .nav { background: rgba(247,242,236,0.92); }

  /* ── LEARN MODE — calm cool tonal overlay ── */
  .app.mode-learn { background: #F2F2F6; }
  .app.mode-learn .nav { background: rgba(242,242,246,0.92); }

  /* ── LEARN PROGRESS BAR ── */
  .learn-progress { display: flex; gap: 6px; margin-bottom: 28px; align-items: center; }
  .learn-progress-step { flex: 1; height: 4px; background: var(--border); border-radius: 2px; transition: background 0.3s; }
  .learn-progress-step.done { background: var(--blush); }
  .learn-progress-step.active { background: var(--ink); }
  .learn-progress-label { font-size: 0.7rem; color: var(--charcoal-light); font-weight: 600; white-space: nowrap; }

`;

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function today() { return new Date().toISOString(); }

function partnerName(data, p) {
  if (p === "p1") return data.name_p1 || "Partner 1";
  return data.name_p2 || "Partner 2";
}

// ─── LOGO ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <svg className="nav-logo" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="var(--depth)"/>
      <path d="M8 22 L16 10 L24 22" stroke="#C4826A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 18 L21 18" stroke="#7A9E8E" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 14 L19 14" stroke="#B8995A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── AUDIO PLAYER ──────────────────────────────────────────────────────────────
function AudioPlayer({ title, desc, duration }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let iv;
    if (playing) {
      iv = setInterval(() => {
        setProgress(p => { if (p >= 100) { setPlaying(false); return 0; } return p + (100 / (duration * 10)); });
      }, 100);
    }
    return () => clearInterval(iv);
  }, [playing, duration]);
  return (
    <div className="audio-player">
      <div className="audio-title">{title}</div>
      <div className="audio-desc">{desc}</div>
      <div className="audio-controls">
        <button className="audio-btn" onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"}</button>
        <div className="audio-track"><div className="audio-track-fill" style={{ width: `${progress}%` }} /></div>
        <span className="audio-time">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>
      </div>
      <div className="audio-placeholder">🎧 Audio coming soon — placeholder for therapist-voiced recording</div>
    </div>
  );
}

// ─── AUTO-SAVE TEXTAREA ────────────────────────────────────────────────────────
function AutoSave({ label, fieldKey, data, onSave, minHeight = 80, placeholder = "", partner }) {
  const [val, setVal] = useState(data[fieldKey] || "");
  const [saved, setSaved] = useState(false);
  const handleBlur = () => { onSave({ [fieldKey]: val }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const cls = partner === "p1" ? "p1-field" : partner === "p2" ? "p2-field" : "";
  const labelCls = partner === "p1" ? "p1" : partner === "p2" ? "p2" : "";
  return (
    <div className="field-group">
      {label && <div className={`field-label ${labelCls}`}>{label}</div>}
      <textarea className={`textarea-field ${cls}`} style={{ minHeight }} value={val}
        onChange={e => { setVal(e.target.value); setSaved(false); }}
        onBlur={handleBlur} placeholder={placeholder} />
      <div className={`save-indicator ${saved ? "visible" : ""}`}>✓ Saved</div>
    </div>
  );
}

// ─── SCRIPTS ACCORDION ─────────────────────────────────────────────────────────
function ScriptsAccordion() {
  const [open, setOpen] = useState(false);
  const scripts = [
    { situation: "When you notice escalation", avoid: ["Here we go again.", "You never listen.", "You're impossible."], try: ["I can feel myself getting activated.", "I don't want this to escalate.", "Can we slow this down for a minute?"] },
    { situation: "When you need a pause", avoid: ["I'm done.", "Forget it.", "Walking away without explanation."], try: ["I'm at about a 7 right now.", "I need time to regulate so I don't say something hurtful.", "I'm coming back. I just need a reset."] },
    { situation: "When you're triggered (past activated)", avoid: ["You're doing it again.", "You always make me feel this way."], try: ["This is touching something old for me.", "I know this isn't just about now.", "I'm feeling more than this situation alone."] },
    { situation: "When you want repair", avoid: ["Silence.", "Waiting for the other person to fix it."], try: ["I don't like how that went.", "Can we reset?", "I'm sorry for my tone.", "I want us to feel connected again."] },
  ];
  return (
    <div>
      <button className="scripts-toggle" onClick={() => setOpen(!open)}>
        <span>💬 Scripts: What to Say When Activated</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="scripts-panel">
          {scripts.map((s, i) => (
            <div key={i} className="script-item">
              <div className="script-situation">{s.situation}</div>
              {s.avoid.map((t, j) => <div key={j} className="script-row"><span className="script-icon">✗</span><span className="script-text avoid">{t}</span></div>)}
              {s.try.map((t, j) => <div key={j} className="script-row"><span className="script-icon">✓</span><span className="script-text">{t}</span></div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// GOALS PATH — shared, synced between both partners
// ════════════════════════════════════════════════════════════════════════════════
function SharedAutoSave({ label, fieldKey, sharedData, onSaveShared, placeholder, minHeight }) {
  const [val, setVal] = useState(sharedData[fieldKey] || "");
  useEffect(() => { setVal(sharedData[fieldKey] || ""); }, [sharedData[fieldKey]]);
  const handleBlur = () => { if (val !== (sharedData[fieldKey] || "")) onSaveShared({ [fieldKey]: val }); };
  return (
    <div className="field-group">
      {label && <div className="field-label">{label}</div>}
      <textarea className="textarea" style={{ minHeight: minHeight || 70 }}
        value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} placeholder={placeholder} />
    </div>
  );
}

function GoalsPath({ sharedData, onSaveShared, identity, onNavigate }) {
  const p1 = sharedData.name_p1 || "Partner 1";
  const p2 = sharedData.name_p2 || "Partner 2";
  const myName = identity.myName;
  const pName = identity.partnerName;

  return (
    <div className="fade-in">
      <div className="path-header">
        <span className="path-header-icon">🎯</span>
        <div>
          <div className="path-header-title">Our Goals</div>
          <div className="path-header-subtitle">Set together — shared between both workbooks</div>
        </div>
        <button className="back-btn" onClick={() => onNavigate("home")}>← Home</button>
      </div>

      <div className="goals-banner">
        <div className="goals-banner-title">Before the work begins, name what you're working toward.</div>
        <div className="goals-banner-sub">This is your shared intention — the reason you're doing this. It lives at the top of both workbooks and reminds you why on hard days.</div>
      </div>

      <div className="goals-sync-note">
        <div className="goals-sync-dot" />
        Shared — both {myName} and {pName} see and can edit this
      </div>

      <div className="section">
        <div className="section-title">What do we want to change?</div>
        <div className="section-desc">Be specific. Not "communicate better" — but what actually keeps happening that you want to stop. Name the pattern, not the person.</div>
        <SharedAutoSave fieldKey="goals_change" sharedData={sharedData} onSaveShared={onSaveShared}
          placeholder={"e.g. We want to stop the shutdown-and-silence cycle after disagreements. We want to stop bringing up old fights in new arguments..."}
          minHeight={90} />
      </div>

      <div className="section">
        <div className="section-title">What does success look like in 3–6 months?</div>
        <div className="section-desc">If this workbook does what it's designed to do, what will be different? Describe it concretely — what will you feel, what will you do differently, what will be possible that isn't now?</div>
        <SharedAutoSave fieldKey="goals_success" sharedData={sharedData} onSaveShared={onSaveShared}
          placeholder={"e.g. We can have a disagreement and return to each other within an hour. We feel safe enough to say what we actually need. Arguments don't carry over into the next day..."}
          minHeight={90} />
      </div>

      <div className="section">
        <div className="section-title">What has gotten in the way before?</div>
        <div className="section-desc">Naming your obstacles isn't pessimism — it's preparation. What patterns, beliefs, or circumstances have blocked progress in the past?</div>
        <SharedAutoSave fieldKey="goals_obstacles" sharedData={sharedData} onSaveShared={onSaveShared}
          placeholder={"e.g. One of us shuts down when things get intense. We've started things like this before and stopped. We struggle to find time to actually do the work..."}
          minHeight={90} />
      </div>

      <div className="section">
        <div className="section-title">What are we each willing to commit to?</div>
        <div className="section-desc">Each partner adds their own. What specific behavior or practice are you genuinely willing to show up for — even on hard days?</div>
        <div className="card" style={{ marginBottom: 10 }}>
          <div className="field-label" style={{ color: "var(--rose)", marginBottom: 6 }}>{p1} commits to:</div>
          <SharedAutoSave fieldKey="goals_commit_p1" sharedData={sharedData} onSaveShared={onSaveShared}
            placeholder={`${p1}'s specific commitment...`} minHeight={60} />
        </div>
        <div className="card">
          <div className="field-label" style={{ color: "var(--sage)", marginBottom: 6 }}>{p2} commits to:</div>
          <SharedAutoSave fieldKey="goals_commit_p2" sharedData={sharedData} onSaveShared={onSaveShared}
            placeholder={`${p2}'s specific commitment...`} minHeight={60} />
        </div>
      </div>

      <div className="callout gold">These goals are yours — come back to them when the work feels hard, or when you need a reminder of why you started.</div>

      <button className="btn-rose" style={{ marginTop: 20 }} onClick={() => onNavigate("home")}>
        ← Back to Workbook
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PATH A: ESCALATING
// ════════════════════════════════════════════════════════════════════════════════
function EscalatePath({ data, onSave, onNavigate }) {
  const [activation1, setActivation1] = useState(data.act1 || 5);
  const [activation2, setActivation2] = useState(data.act2 || 5);
  const [returnTime, setReturnTime] = useState(data.returnTime || "");
  const p1 = partnerName(data, "p1");
  const p2 = partnerName(data, "p2");
  const maxActivation = Math.max(activation1, activation2);
  const shouldPause = maxActivation > 6;

  const saveActivation = (a1, a2) => onSave({ act1: a1, act2: a2 });

  return (
    <div className="fade-in escalate-screen">
      <div className="escalate-top-bar">
        <button className="back-btn-ghost" onClick={() => onNavigate("home")}>← Exit</button>
        <div className="escalate-eyebrow">Escalation Protocol</div>
      </div>

      <div className="escalate-hero">
        <h2 className="escalate-headline">Let's slow this down.</h2>
        <p className="escalate-sub">One step at a time. Stay with this screen.</p>
        <div className="escalate-breathe" />
      </div>

      {/* STOP SKILL */}
      <div className="section">
        <div className="section-title">STOP — Before Anything Else</div>
        <div className="section-desc">Your body has already taken over. Before you can name it to your partner, you need to interrupt yourself. This is internal — do it alone, right now.</div>
        <div className="stop-card">
          <div className="stop-title">The STOP Skill</div>
          <div className="stop-sub">Internal • Body-first • Do this before Step 1</div>
          <div className="stop-steps">
            {[
              { letter: "S", word: "Stop", desc: "Freeze. Don't act on the urge. Don't speak, text, or do anything yet." },
              { letter: "T", word: "Take a Breath", desc: "One slow breath. In through the nose, out through the mouth. Just one." },
              { letter: "O", word: "Observe", desc: "Notice what's happening inside. Body? Thoughts? Feelings? No judgment — just witness." },
              { letter: "P", word: "Proceed Mindfully", desc: "Now choose your next move consciously. What do you actually want to happen here?" },
            ].map((s, i) => (
              <div key={i} className="stop-step">
                <div className="stop-letter">{s.letter}</div>
                <div className="stop-word">{s.word}</div>
                <div className="stop-desc">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="stop-cue">
            <div className="stop-cue-label">Internal Cue</div>
            <div className="stop-cue-text">"My body is activated right now. I'm going to stop and breathe before I do or say anything else."</div>
          </div>
        </div>
      </div>

      {/* Activation Check */}
      <div className="section">
        <div className="section-title">Step 1 — Check Your Activation</div>
        <div className="section-desc">Each partner rates their own activation. Be honest — not what you think you should feel, but what your body is actually doing.</div>
        <div className="activation-check">
          <div className="activation-partners">
            {[
              { key: "p1", name: p1, val: activation1, setVal: setActivation1 },
              { key: "p2", name: p2, val: activation2, setVal: setActivation2 },
            ].map(({ key, name, val, setVal }) => (
              <div key={key} className="activation-partner">
                <div className={`activation-name ${key}`}>{name}</div>
                <div className="activation-value">{val}/10</div>
                <input type="range" className="activation-slider" min={0} max={10} value={val}
                  onChange={e => { setVal(+e.target.value); saveActivation(key === "p1" ? +e.target.value : activation1, key === "p2" ? +e.target.value : activation2); }} />
                <div className="slider-row"><span>0</span><span>10</span></div>
              </div>
            ))}
          </div>
          <div className={`activation-cue ${shouldPause ? "pause" : "proceed"}`} style={{ marginTop: 12 }}>
            {shouldPause
              ? `⚠ Activation is above 6. Pause before continuing. Use Step 2 before attempting any conversation.`
              : `✓ Both partners are regulated enough to continue. Move to Step 3 — identify upset or triggered, then respond.`}
          </div>
        </div>
      </div>

      {/* Step 2: Pause + Return Time */}
      {shouldPause && (
        <div className="section fade-in">
          <div className="section-title">Step 2 — Pause & Set a Return Time</div>
          <div className="section-desc">The pause is not abandonment. It is stabilization. The only thing that makes a pause safe for an anxious nervous system is knowing when you're coming back. Say this before you leave the room.</div>
          <div className="callout rose">"I'm coming back. I just need to reset. I'm not leaving — I need <strong>X minutes/hours</strong> and then I'm back with you."</div>
          <div className="return-time">
            <div className="return-time-label">Choose a return time — say it out loud to your partner</div>
            <div className="return-time-options">
              {["20 min", "30 min", "1 hour", "After sleep", "Tomorrow morning"].map(t => (
                <button key={t} className={`return-btn ${returnTime === t ? "selected" : ""}`}
                  onClick={() => { setReturnTime(t); onSave({ returnTime: t }); }}>{t}</button>
              ))}
            </div>
            {returnTime && <div className="return-time-display">We're returning at: {returnTime} from now. Stay in your own space until then.</div>}
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 10 }}>Regulate During the Pause</div>
            {[
              "🌬 Breathe: inhale 4, hold 4, exhale 6 — repeat 5 times",
              "👁 Ground: name 5 things you see, 4 you can touch, 3 you hear",
              "🚶 Move: walk, stretch, cold water on your wrists or face",
              "📵 No review: do not rehearse your argument or text your partner",
            ].map((item, i) => <div key={i} style={{ fontSize: "0.82rem", color: "var(--charcoal-mid)", lineHeight: 1.7, padding: "4px 0" }}>{item}</div>)}
          </div>
        </div>
      )}

      {/* The 5-Step Protocol */}
      <div className="section">
        <div className="section-title">The 5-Step Protocol — When You Return</div>
        <div className="section-desc">Once both partners are below 6, run through these steps together.</div>
        <div className="protocol-steps">
          {[
            { label: "Name It", text: "Say out loud: 'We're escalating.' No blame — just observation. Naming the pattern externalizes it.", phrase: '"We\'re escalating."' },
            { label: "Check Activation", text: "Rate 0–10. If either is above 6 → return to Step 2 (pause). If both below 6 → continue.", phrase: '"I\'m at a ___ right now."' },
            { label: "Upset or Triggered?", text: "Is this about something happening now — or is it touching an old wound? That answer changes your tone, pace, and repair path.", phrase: '"Is this about now, or is this old?"' },
            { label: "Respond Intentionally", text: "One feeling. One need. One request. No history stacking. No character attacks.", phrase: '"I felt ___ when ___. I need ___. Can we ___?"' },
            { label: "Repair if Needed", text: "If escalation happened before you caught it — name what you did, take ownership, offer reconnection. Within 24 hours.", phrase: '"I don\'t like how that went. Can we reset?"' },
          ].map((s, i) => (
            <div key={i} className={`protocol-step step-${i + 1}`}>
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <div className="step-label">{s.label}</div>
                <div className="step-text">{s.text}</div>
                <div className="step-phrase">{s.phrase}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="formula-box">
        <div className="formula-label">The Formula</div>
        <div className="formula-text"><span>Feeling</span> + <span>Ownership</span> + <span>Request</span></div>
      </div>

      <AudioPlayer title="The Escalation Reset" desc="A guided regulation tool for the pause. Use during Step 2." duration={210} />
      <ScriptsAccordion />

      <div className="bridge-prompt blush" style={{ marginTop: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--ink)", marginBottom: 4 }}>Ready to repair?</div>
          <div className="bridge-prompt-text">Use the After the Fight path when both partners are below 6.</div>
        </div>
        <button className="bridge-btn" onClick={() => onNavigate("repair")}>Go to Repair →</button>
      </div>
      <div className="bridge-prompt sage" style={{ marginTop: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--ink)", marginBottom: 4 }}>Want to understand why this keeps happening?</div>
          <div className="bridge-prompt-text">The Understand Us path maps the cycle underneath.</div>
        </div>
        <button className="bridge-btn" style={{ background: "var(--sage)" }} onClick={() => onNavigate("learn")}>Understand the Pattern →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PATH B: REPAIR
// ════════════════════════════════════════════════════════════════════════════════
function RepairPath({ data, onSave, onNavigate }) {
  const [entries, setEntries] = useState(data.conflictLog || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ what: "", escalated: "", underneath: "", usedProtocol: null, worked: "", change: "" });
  const [glimmers, setGlimmers] = useState(data.glimmers || []);
  const [glimmerInput, setGlimmerInput] = useState("");
  const [repairTab, setRepairTab] = useState("framework");

  const saveEntry = () => {
    if (!formData.what.trim()) return;
    const updated = [{ ...formData, date: today(), id: Date.now() }, ...entries];
    setEntries(updated); onSave({ conflictLog: updated });
    setFormData({ what: "", escalated: "", underneath: "", usedProtocol: null, worked: "", change: "" });
    setShowForm(false);
  };

  const addGlimmer = () => {
    if (!glimmerInput.trim()) return;
    const updated = [{ text: glimmerInput, date: today(), id: Date.now() }, ...glimmers];
    setGlimmers(updated); onSave({ glimmers: updated }); setGlimmerInput("");
  };

  return (
    <div className="fade-in">
      <div className="path-header">
        <div>
          <div className="path-header-title">After the Conflict</div>
          <div className="path-header-subtitle">Repair · Revisit · Reconnect</div>
        </div>
        <button className="back-btn" onClick={() => onNavigate("home")}>← Home</button>
      </div>

      <div className="tab-bar">
        {[["framework","Repair Framework"],["dearm","D.E.A.R. M.A.N."]].map(([id, label]) => (
          <button key={id} className={`tab-btn ${repairTab === id ? "active" : ""}`} onClick={() => setRepairTab(id)}>{label}</button>
        ))}
      </div>

      {repairTab === "framework" && (
        <div className="fade-in">
          <div className="section">
            <div className="section-title">Why Repair Matters</div>
            <div className="section-desc">Every relationship has ruptures. What separates secure couples from disconnected ones is not the absence of conflict — it's the quality of repair. Repair is what rebuilds the trust that escalation erodes.</div>
            <div className="callout sage">Repair within 24 hours. The longer you wait, the more the narrative solidifies and resentment pools beneath the surface.</div>
          </div>

          <div className="section">
            <div className="section-title">The Rupture-to-Repair Process</div>
            <div className="section-desc">Repair isn't just an apology. It's a structured return to safety. Both partners should know these steps and be willing to initiate them — regardless of who escalated.</div>
            <div className="card">
              {[
                { num: 1, title: "Name the behavior", desc: "Be specific — not 'I was rude' but 'I raised my voice and interrupted you.'" },
                { num: 2, title: "Take ownership", desc: "No justification. No 'but you…'. Ownership without conditions." },
                { num: 3, title: "Acknowledge the impact", desc: "Even if unintended — the impact matters more than the intention." },
                { num: 4, title: "Name the feeling underneath", desc: "What were you actually feeling? Fear? Rejection? Powerlessness? Name the real thing." },
                { num: 5, title: "Offer reconnection", desc: "Not what you want to say — what your partner needs to receive right now." },
              ].map(r => (
                <div key={r.num} className="repair-step">
                  <div className="repair-num">{r.num}</div>
                  <div><div className="repair-title">{r.title}</div><div className="repair-desc">{r.desc}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">The 4 Rs of Apology</div>
            <div className="section-desc">These are language builders — not a script. Use them to form your own words.</div>
            <div className="card">
              {[
                { r: "Regret", desc: "Express genuine remorse for the impact of your behavior, regardless of your intention.", example: "\u201cI\u2019m really sorry that what I said hurt you. That was not okay.\u201d" },
                { r: "Responsibility", desc: "Own what you did without minimizing, explaining, or deflecting. Just the behavior.", example: "\u201cI was sarcastic and I shut down the conversation. That\u2019s on me.\u201d" },
                { r: "Recognition", desc: "Acknowledge what the other person experienced — their feelings, their perspective.", example: "\u201cI can see why you felt dismissed. Your point was valid and I didn\u2019t treat it that way.\u201d" },
                { r: "Remedy", desc: "Offer what you'll do differently. Make it concrete and small — not a grand promise.", example: "\u201cNext time I feel frustrated, I\u2019m going to ask for a pause before I respond.\u201d" },
              ].map((item, i) => (
                <div key={i} className="repair-step">
                  <div className="repair-num">{item.r[0]}</div>
                  <div>
                    <div className="repair-title">{item.r}</div>
                    <div className="repair-desc">{item.desc}</div>
                    <div style={{ marginTop: 5, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.82rem", color: "var(--charcoal-light)" }}>{item.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AudioPlayer title="Repair Re-Entry" desc="Guided support for returning to your partner after a pause." duration={180} />
        </div>
      )}

      {repairTab === "dearm" && (
        <div className="fade-in">
          <div className="section">
            <div className="section-title">Coming Back to the Conversation</div>
            <div className="section-desc">Once you've repaired the rupture and both partners feel regulated and safe, you can revisit the original issue. D.E.A.R. M.A.N. gives you a structure that's both clear and non-escalating.</div>
            <div className="callout gold">Only use this when both partners are below a 5/10 activation and when the repair step is complete. This is not for the heat of the moment — it's for returning to a topic once safety is restored.</div>
          </div>

          <div className="section">
            <div className="section-title">D.E.A.R. M.A.N.</div>
            <div className="section-desc">A DBT-based framework for effective communication — especially useful for revisiting difficult topics without re-escalating.</div>
            <div className="dear-man-grid">
              {[
                { letter: "D", word: "Describe", desc: "State the situation factually and objectively. Stick to what actually happened — no interpretations, no emotions yet.", example: "\u201cWhen we were talking last night and I walked away without saying anything...\u201d" },
                { letter: "E", word: "Express", desc: "Share your feelings clearly and gently. Use \u2018I feel\u2019 — not \u2018you made me feel.\u2019 Own the emotion.", example: "\u201cI felt scared and ashamed right after, because I knew I\u2019d shut down again.\u201d" },
                { letter: "A", word: "Assert", desc: "Ask for what you need or say no clearly. Don\u2019t assume your partner knows. Be direct without being aggressive.", example: "\u201cWhat I need is to try again with this conversation \u2014 calmly.\u201d" },
                { letter: "R", word: "Reinforce", desc: "Tell your partner how meeting this need benefits both of you. Connect the ask to the relationship.", example: "\u201cIf we can have this conversation, I think we\u2019ll both feel closer and less stuck.\u201d" },
                { letter: "M", word: "Mindful", desc: "Stay focused on the goal of the conversation. Don't let yourself be pulled into side arguments or past issues.", example: 'If they deflect: "I hear that. Can we come back to what I just shared for a moment?"' },
                { letter: "A", word: "Appear Confident", desc: "Use a calm, even tone. Eye contact. Open body language. Even if you're nervous inside — a grounded presence helps your partner feel safe.", example: "Take a breath before you speak. Pause if your voice starts to shake." },
                { letter: "N", word: "Negotiate", desc: "Be willing to give to get. Ask what they need too. Look for the overlap.", example: "\u201cWhat would make this easier for you? I want us both to feel okay about this.\u201d" },
              ].map((s, i) => (
                <div key={i} className="dear-step">
                  <div className="dear-letter">{s.letter}</div>
                  <div>
                    <div className="dear-word">{s.word}</div>
                    <div className="dear-desc">{s.desc}</div>
                    <div className="dear-example">{s.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AutoSave label="What topic do we need to revisit?" fieldKey="dearm_topic" data={data} onSave={onSave} minHeight={60} placeholder="Describe the issue you're coming back to..." />
          <AutoSave label="What do I want to Describe (facts only)?" fieldKey="dearm_describe" data={data} onSave={onSave} minHeight={60} />
          <AutoSave label="What do I want to Express (my feeling)?" fieldKey="dearm_express" data={data} onSave={onSave} minHeight={60} />
          <AutoSave label="What do I need to Assert (my ask)?" fieldKey="dearm_assert" data={data} onSave={onSave} minHeight={60} />
        </div>
      )}

      <div className="bridge-prompt blush" style={{ marginTop: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--ink)", marginBottom: 4 }}>Would you like to understand why this keeps happening?</div>
          <div className="bridge-prompt-text">The Understand Us path maps the cycle underneath the fights.</div>
        </div>
        <button className="bridge-btn" onClick={() => onNavigate("learn")}>Understand the Pattern →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PATH C: UNDERSTAND & PREVENT — 5 Sections + Shared Dashboard
// ════════════════════════════════════════════════════════════════════════════════

const LEARN_TABS = ["profile", "window", "cycle", "deeper", "practice", "shared"];
const TAB_LABELS = { profile: "Who Am I in Conflict", window: "Window of Tolerance", cycle: "Map Your Loop", deeper: "The Deeper Cycle", practice: "Putting It Into Practice", shared: "Our Shared View" };

function LearnPath({ data, onSave, onSaveShared, sharedData, onNavigate, identity }) {
  const [tab, setTab] = useState("profile");
  const completed = data.learnCompleted || {};
  const markComplete = (t) => onSave({ learnCompleted: { ...completed, [t]: true } });
  const progressCount = LEARN_TABS.filter(t => completed[t]).length;

  return (
    <div className="fade-in">
      <div className="path-header">
        <div>
          <div className="path-header-title">Understand & Prevent</div>
          <div className="path-header-subtitle">{progressCount}/{LEARN_TABS.length} sections complete</div>
        </div>
        <button className="back-btn" onClick={() => onNavigate("home")}>← Home</button>
      </div>

      <div className="learn-progress">
        {LEARN_TABS.map((t, i) => (
          <div key={t} className={`learn-progress-step ${completed[t] ? "done" : tab === t ? "active" : ""}`} />
        ))}
        <span className="learn-progress-label">{progressCount}/{LEARN_TABS.length}</span>
      </div>

      <div className="tab-bar">
        {LEARN_TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""} ${t === "shared" ? "tab-shared" : ""}`} onClick={() => setTab(t)}>
            {completed[t] && <span className="tab-check">✓</span>}
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab data={data} onSave={onSave} identity={identity} onDone={() => { markComplete("profile"); setTab("window"); }} />}
      {tab === "window" && <WindowTab data={data} onSave={onSave} identity={identity} onDone={() => { markComplete("window"); setTab("cycle"); }} />}
      {tab === "cycle" && <CycleTab data={data} onSave={onSave} identity={identity} onDone={() => { markComplete("cycle"); setTab("deeper"); }} />}
      {tab === "deeper" && <DeeperCycleTab data={data} onSave={onSave} identity={identity} onDone={() => { markComplete("deeper"); setTab("practice"); }} />}
      {tab === "practice" && <PracticeTab data={data} onSave={onSave} identity={identity} onNavigate={onNavigate} onDone={() => { markComplete("practice"); setTab("shared"); }} />}
      {tab === "shared" && <SharedDashboard data={data} onSave={onSave} sharedData={sharedData} onSaveShared={onSaveShared} identity={identity} onNavigate={onNavigate} onDone={() => { markComplete("shared"); onNavigate("agreement"); }} />}
    </div>
  );
}

// ── SECTION 1: WHO AM I IN CONFLICT ──────────────────────────────────────────
function ProfileChips({ fieldKey, options, data, onSave, partner }) {
  const selected = data[fieldKey] || [];
  const toggle = (v) => {
    const updated = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v];
    onSave({ [fieldKey]: updated });
  };
  return (
    <div className="profile-chips">
      {options.map(o => (
        <span key={o} className={`profile-chip ${selected.includes(o) ? `selected-${partner}` : ""}`} onClick={() => toggle(o)}>{o}</span>
      ))}
    </div>
  );
}

function PartnerPrivateSection({ prefix, data, onSave }) {
  const p = prefix;
  const k = (f) => `profile_${p}_${f}`;
  const pName = partnerName(data, p);
  return (
    <div className="fade-in">
      <div className="private-banner" style={{ background: p === "p1" ? "var(--rose-light)" : "var(--sage-light)", color: p === "p1" ? "var(--rose)" : "var(--sage)" }}>
        🔒 Private — {pName}'s section. Complete on your own first.
      </div>
      <div className="profile-question">
        <div className="field-label">When conflict begins, I tend to...</div>
        <ProfileChips fieldKey={k("first_move")} partner={p} data={data} onSave={onSave}
          options={["Get louder", "Go quiet", "Explain myself", "Leave the room", "Cry", "Shut down", "Push back", "Try to fix it fast"]} />
      </div>
      <div className="profile-question">
        <div className="field-label">What I feel in my body when activated...</div>
        <ProfileChips fieldKey={k("body_signs")} partner={p} data={data} onSave={onSave}
          options={["Chest tightens", "Jaw clenches", "Heart races", "Stomach drops", "Go numb", "Tension in shoulders", "Ears get hot", "Feel frozen"]} />
      </div>
      <div className="profile-question">
        <div className="field-label">What I tell myself during conflict...</div>
        <ProfileChips fieldKey={k("thoughts")} partner={p} data={data} onSave={onSave}
          options={["They don't care", "I'm being attacked", "I'm going to lose this", "Nothing I say matters", "This is hopeless", "I'm the problem", "They'll leave", "I have to fix this now"]} />
      </div>
      <div className="profile-question">
        <div className="field-label">What I actually feel underneath the reaction...</div>
        <ProfileChips fieldKey={k("underneath")} partner={p} data={data} onSave={onSave}
          options={["Scared", "Hurt", "Invisible", "Not enough", "Abandoned", "Trapped", "Overwhelmed", "Alone"]} />
      </div>
      <AutoSave label="Anything else about how you show up in conflict?" fieldKey={k("notes")} data={data} onSave={onSave} minHeight={60} partner={p} placeholder="Write anything that doesn't fit above..." />
    </div>
  );
}

function ProfileTab({ data, onSave, identity, onDone }) {
  const active = identity?.role || "p1";
  return (
    <div className="fade-in">
      <div className="section">
        <div className="section-title">Who Am I in Conflict?</div>
        <div className="section-desc">This entire system is built on one premise: you can only control yourself. Before you can understand the cycle you create together, you have to understand what you do. Each partner completes this privately — then you share in the Shared View.</div>
        <div className="callout sage">Self-awareness before shared awareness. The more clearly you see your own pattern, the more choice you have in the moment.</div>
      </div>
      <PartnerPrivateSection prefix={active} data={data} onSave={onSave} />
      <button className="btn-rose" style={{ marginTop: 24 }} onClick={onDone}>Next: Window of Tolerance →</button>
    </div>
  );
}

// ── SECTION 2: WINDOW OF TOLERANCE ───────────────────────────────────────────
function WindowTab({ data, onSave, identity, onDone }) {
  const active = identity?.role || "p1";
  const p = active;

  return (
    <div className="fade-in">
      <div className="section">
        <div className="section-title">Your Window of Tolerance</div>
        <div className="section-desc">There's a zone where you can feel stressed, even angry — and still think clearly and stay connected. Outside that window, your body takes over. You cannot resolve conflict outside your window. You must regulate before you repair.</div>
        <div className="window-zones">
          <div className="zone above">
            <div className="zone-label">↑ Above — Hyperarousal</div>
            <div className="zone-desc">Heart racing. Jaw clenched. Voice rising. Angry, reactive. You say things you don't mean.</div>
          </div>
          <div className="zone inside">
            <div className="zone-label">↔ Inside — Regulated</div>
            <div className="zone-desc">You can feel upset and still stay present. Disagree without exploding. Listen without shutting down. This is where real conversation happens.</div>
          </div>
          <div className="zone below">
            <div className="zone-label">↓ Below — Hypoarousal</div>
            <div className="zone-desc">System shuts down. Numb, foggy, frozen. You go quiet — not because you don't care, but because your body hit its limit.</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="private-banner" style={{ background: p === "p1" ? "var(--rose-light)" : "var(--sage-light)", color: p === "p1" ? "var(--rose)" : "var(--sage)" }}>
          🔒 Private — {partnerName(data, p)}'s window. Complete on your own first.
        </div>
        <AutoSave label="Above my window, I notice:" fieldKey={`window_${p}_above`} data={data} onSave={onSave} partner={p} placeholder="Physical signs, thoughts, behaviors..." />
        <AutoSave label="Below my window, I notice:" fieldKey={`window_${p}_below`} data={data} onSave={onSave} partner={p} placeholder="Signs of shutdown, numbness, going distant..." />
        <AutoSave label="What helps me return to my window:" fieldKey={`window_${p}_return`} data={data} onSave={onSave} partner={p} placeholder="Movement, breathing, grounding, space..." />
      </div>

      <div className="section">
        <div className="section-title">What You're Working Toward</div>
        <div className="coreg-grid">
          {["Feeling safer to share what you actually feel", "Less reactive when tension rises", "Feeling closer and more trusting", "Working through disagreements without shutting down", "Asking for what you need without it becoming a fight", "More forgiving — letting things go faster", "Feeling like you're on the same team", "More emotional presence with each other"].map((item, i) => (
            <div key={i} className="coreg-item"><div className="coreg-dot" />{item}</div>
          ))}
        </div>
        <div className="callout sage" style={{ marginTop: 12 }}>This is what the work is for. Not a perfect relationship — a regulated one.</div>
      </div>

      <button className="btn-rose" onClick={onDone}>Next: Map Your Loop →</button>
    </div>
  );
}

// ── SECTION 3: MAP YOUR LOOP ──────────────────────────────────────────────────
function CycleTab({ data, onSave, identity, onDone }) {
  const active = identity?.role || "p1";
  const p = active;
  const cycleKey = `cycleP${p === "p1" ? "1" : "2"}`;
  const cycleData = data[cycleKey] || {};
  const updateCycle = (f, v) => onSave({ [cycleKey]: { ...cycleData, [f]: v } });

  return (
    <div className="fade-in">
      <div className="section">
        <div className="section-title">How We Create This Together</div>
        <div className="section-desc">Every couple stuck in the same fight has a loop. The topic changes, but the pattern underneath stays the same. Map your side privately — then use the Shared View to see it together.</div>
        <div className="compare-grid">
          <div className="compare-cell left">
            <div className="compare-title">Pursue → Withdraw</div>
            <div className="compare-item">One partner reaches for connection through criticism or intensity.</div>
            <div className="compare-item">The other pulls away or avoids.</div>
            <div className="compare-example">Pursuer feels abandoned. Withdrawer feels attacked. Both feel alone.</div>
          </div>
          <div className="compare-cell right">
            <div className="compare-title">Attack → Defend</div>
            <div className="compare-item">One partner leads with blame or accusation.</div>
            <div className="compare-item">The other defends, deflects, or counterattacks.</div>
            <div className="compare-example">Neither feels heard. Conflict escalates without resolution.</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="private-banner" style={{ background: p === "p1" ? "var(--rose-light)" : "var(--sage-light)", color: p === "p1" ? "var(--rose)" : "var(--sage)" }}>
          🔒 Private — {partnerName(data, p)}'s loop. Complete on your own first.
        </div>
        {[
          { key: "trigger", label: "When I feel...", placeholder: "rejected / dismissed / controlled / invisible" },
          { key: "reaction", label: "I tend to...", placeholder: "attack / go quiet / push / shut down / pursue" },
          { key: "partnerFeels", label: "Which makes my partner feel...", placeholder: "attacked / alone / unsafe / smothered" },
          { key: "longFor", label: "What I'm actually longing for...", placeholder: "to feel safe / to matter / to feel close" },
        ].map(s => (
          <div key={s.key} className="cycle-step">
            <div className="cycle-label">{s.label}</div>
            <input className="cycle-input" placeholder={s.placeholder} value={cycleData[s.key] || ""} onChange={e => updateCycle(s.key, e.target.value)} />
          </div>
        ))}
        <div className="cycle-loop-note">↻ The enemy is the loop — not your partner.</div>
      </div>

      <div className="section">
        <div className="section-title">What's Underneath My Reaction</div>
        <div className="card">
          {["Fear of rejection", "Fear of abandonment", "Feeling unseen", "Not good enough", "Feeling controlled", "Unloved or undesired"].map(item => {
            const fk = `check_${p}_${item}`;
            return (
              <div key={item} className="checklist-item">
                <input type="checkbox" className="checklist-cb" id={fk} checked={!!data[fk]} onChange={e => onSave({ [fk]: e.target.checked })} />
                <label className="checklist-label" htmlFor={fk}>{item}</label>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn-rose" onClick={onDone}>Next: The Deeper Cycle →</button>
    </div>
  );
}

// ── SECTION 4: THE DEEPER CYCLE (EFT) ────────────────────────────────────────
function EFTChips({ type, options, selected, onToggle }) {
  return (
    <div className="eft-chips">
      {options.map(o => (
        <span key={o} className={`eft-chip ${type}-chip ${selected.includes(o) ? "selected" : ""}`} onClick={() => onToggle(o)}>{o}</span>
      ))}
    </div>
  );
}

function EFTPartnerColumn({ prefix, data, onSave }) {
  const k = (f) => `eft_${prefix}_${f}`;
  const get = (f) => data[k(f)] || [];
  const getStr = (f) => data[k(f)] || "";
  const toggle = (field, val) => {
    const cur = get(field);
    onSave({ [k(field)]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] });
  };
  const BEHAVIORS = { pursue: ["Criticize","Demand","Push to talk","Accuse","Protest","Chase"], withdraw: ["Go quiet","Shut down","Agree just to end it","Pull away","Become distant","Disappear"] };
  const selectedMove = getStr("move");
  const behaviorOptions = selectedMove === "pursue" ? BEHAVIORS.pursue : selectedMove === "withdraw" ? BEHAVIORS.withdraw : [...BEHAVIORS.pursue, ...BEHAVIORS.withdraw];
  const name = partnerName(data, prefix);

  return (
    <div className="eft-partner-col">
      <div className={`eft-partner-header ${prefix}`}>{name}</div>

      <div className="eft-layer behavior">
        <div className="eft-layer-label">Your move — what your partner sees</div>
        <div className="move-selector">
          {[["pursue","I pursue"], ["withdraw","I withdraw"], ["both","Both"]].map(([val, label]) => (
            <button key={val} className={`move-btn ${getStr("move") === val ? `selected-${val}` : ""}`} onClick={() => onSave({ [k("move")]: val })}>{label}</button>
          ))}
        </div>
        {selectedMove && <EFTChips type="behavior" options={behaviorOptions} selected={get("behaviors")} onToggle={v => toggle("behaviors", v)} />}
      </div>

      <div className="eft-layer protective">
        <div className="eft-layer-label">Surface feelings — above the line</div>
        <EFTChips type="protective" options={["Angry","Frustrated","Anxious","Resentful","Dismissed","Irritated","Jealous","Overwhelmed"]} selected={get("protective")} onToggle={v => toggle("protective", v)} />
        <input className="eft-write-in" placeholder="write your own..." value={getStr("protective_other")} onChange={e => onSave({ [k("protective_other")]: e.target.value })} />
      </div>

      <div className="eft-layer vulnerable">
        <div className="eft-layer-label">Vulnerable feelings — below the line</div>
        <EFTChips type="vulnerable" options={["Scared","Hurt","Ashamed","Alone","Invisible","Not enough","Abandoned","Unloved","Longing","Hopeless"]} selected={get("vulnerable")} onToggle={v => toggle("vulnerable", v)} />
        <input className="eft-write-in" placeholder="write your own..." value={getStr("vulnerable_other")} onChange={e => onSave({ [k("vulnerable_other")]: e.target.value })} />
      </div>

      <div className="eft-layer need">
        <div className="eft-layer-label">What you're actually reaching for</div>
        <EFTChips type="need" options={["To know I matter","To feel close","To feel safe enough to open up","To feel seen","To feel like I'm enough","To not be alone in this"]} selected={get("needs")} onToggle={v => toggle("needs", v)} />
        <input className="eft-write-in" placeholder="write your own..." value={getStr("need_other")} onChange={e => onSave({ [k("need_other")]: e.target.value })} />
      </div>
    </div>
  );
}

function DeeperCycleTab({ data, onSave, identity, onDone }) {
  const active = identity?.role || "p1";
  const p = active;
  const pName = partnerName(data, p);

  return (
    <div className="fade-in">
      <div className="section">
        <div className="section-title">What's Actually Happening Underneath</div>
        <p className="eft-intro">What your partner sees during conflict is never the whole story. The behaviors on the surface — the criticism, the silence, the pushing away — are protective moves. Underneath every protective move is a feeling your partner can't see. And underneath that feeling is something you're reaching for.</p>
        <div className="window-zones">
          <div className="zone above">
            <div className="zone-label">↑ Above the Line — What Your Partner Can See</div>
            <div className="zone-desc">Your <strong>move</strong> (pursue, withdraw) and your <strong>protective emotions</strong> (anger, frustration, anxiety). This is what lands on your partner and triggers their reaction.</div>
          </div>
          <div className="zone inside" style={{ background: "var(--gold-light)" }}>
            <div className="zone-label" style={{ color: "var(--gold)" }}>— The Line of Consciousness —</div>
            <div className="zone-desc">What you can access when you slow down and look inward.</div>
          </div>
          <div className="zone below" style={{ background: "var(--blush-light)" }}>
            <div className="zone-label" style={{ color: "var(--sage)" }}>↓ Below the Line — What Your Partner Can't See</div>
            <div className="zone-desc">Your <strong>vulnerable feelings</strong> (scared, hurt, alone) and your <strong>unmet need</strong> (to feel safe, to matter, to be close). This is the real message your protective move is trying to send.</div>
          </div>
        </div>
        <div className="callout rose">Your move is not the message. The cycle locks because the need stays hidden.</div>
      </div>

      <div className="section">
        <div className="private-banner" style={{ background: p === "p1" ? "var(--rose-light)" : "var(--sage-light)", color: p === "p1" ? "var(--rose)" : "var(--sage)" }}>
          🔒 Private — {pName}'s deeper cycle. Complete on your own first.
        </div>
        <div style={{ marginTop: 12 }}>
          <EFTPartnerColumn prefix={p} data={data} onSave={onSave} />
        </div>
        <div className="line-of-consciousness">
          <div className="loc-line" /><div className="loc-label">line of consciousness</div><div className="loc-line" />
        </div>
        <div className="eft-shared-core">
          <div className="eft-core-label">What You Both Share</div>
          <div className="eft-core-text">Underneath the cycle, you both want the same thing:<br /><em>to feel safe, seen, and loved by each other.</em><br />The cycle is the obstacle — not your partner.</div>
        </div>
      </div>

      <button className="btn-rose" onClick={onDone}>Next: Putting It Into Practice →</button>
    </div>
  );
}

// ── SHARED DASHBOARD ──────────────────────────────────────────────────────────
function SharedDashboard({ data, onSave, sharedData, onSaveShared, identity, onNavigate, onDone }) {
  const p1 = partnerName(data, "p1");
  const p2 = partnerName(data, "p2");

  // WOT data
  const p1Above = data.window_p1_above || "";
  const p1Below = data.window_p1_below || "";
  const p1Return = data.window_p1_return || "";
  const p2Above = data.window_p2_above || "";
  const p2Below = data.window_p2_below || "";
  const p2Return = data.window_p2_return || "";

  // Cycle data
  const cycleP1 = data.cycleP1 || {};
  const cycleP2 = data.cycleP2 || {};

  // EFT data
  const p1Move = data["eft_p1_move"] || "";
  const p2Move = data["eft_p2_move"] || "";
  const p1Vulnerable = (data["eft_p1_vulnerable"] || []).join(", ") || "_____";
  const p2Vulnerable = (data["eft_p2_vulnerable"] || []).join(", ") || "_____";
  const p1Need = (data["eft_p1_needs"] || []).join(", ") || "_____";
  const p2Need = (data["eft_p2_needs"] || []).join(", ") || "_____";

  const hasP1WOT = !!(p1Above || p1Below);
  const hasP2WOT = !!(p2Above || p2Below);
  const hasP1Cycle = !!(cycleP1.trigger || cycleP1.reaction);
  const hasP2Cycle = !!(cycleP2.trigger || cycleP2.reaction);
  const hasP1EFT = !!(data["eft_p1_move"] || (data["eft_p1_vulnerable"] || []).length);
  const hasP2EFT = !!(data["eft_p2_move"] || (data["eft_p2_vulnerable"] || []).length);

  return (
    <div className="fade-in">
      <div className="section">
        <div className="section-title">Our Shared View</div>
        <div className="section-desc">Both partners have completed their private sections. This is where you come together — to read each other's maps, see the combined cycle, and reflect as a couple. Sit together for this one.</div>
        <div className="callout gold">Only open this when both of you are regulated (both below 5/10). This is not for conflict — it's for understanding. If it starts to activate either partner, pause and use Path A first.</div>
      </div>

      {/* Goals reminder */}
      {(sharedData.goals_change || sharedData.goals_success) && (
        <div className="card" style={{ marginBottom: 24, borderLeft: "3px solid var(--gold)" }}>
          <div style={{ fontWeight: 700, fontSize: "0.76rem", color: "var(--gold)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>🎯 Why we're doing this</div>
          {sharedData.goals_change && <div style={{ fontSize: "0.84rem", color: "var(--charcoal-mid)", marginBottom: 6 }}><strong>What we want to change:</strong> {sharedData.goals_change}</div>}
          {sharedData.goals_success && <div style={{ fontSize: "0.84rem", color: "var(--charcoal-mid)" }}><strong>What success looks like:</strong> {sharedData.goals_success}</div>}
        </div>
      )}

      <div className="goals-sync-note">
        <div className="goals-sync-dot" />
        Shared — updates from either partner appear here automatically
      </div>

      {/* Relationship WOT */}
      <div className="section">
        <div className="section-title">Our Relationship Window of Tolerance</div>
        <div className="section-desc">What each of you mapped privately — now visible side by side.</div>
        <div className="rel-wot">
          <div className="rel-wot-rows">
            <div className="rel-wot-row">
              <div className="rel-wot-cell rose">
                <div className="rel-wot-cell-label">{p1} — Above the window</div>
                <div className="rel-wot-cell-text">{hasP1WOT ? p1Above || p1Below : <span className="empty-wot">{p1} hasn't completed this yet</span>}</div>
              </div>
              <div className="rel-wot-cell sage">
                <div className="rel-wot-cell-label">{p2} — Above the window</div>
                <div className="rel-wot-cell-text">{hasP2WOT ? p2Above || p2Below : <span className="empty-wot">{p2} hasn't completed this yet</span>}</div>
              </div>
            </div>
            <div className="rel-wot-row">
              <div className="rel-wot-cell rose">
                <div className="rel-wot-cell-label">{p1} — Returns by</div>
                <div className="rel-wot-cell-text">{p1Return || <span className="empty-wot">—</span>}</div>
              </div>
              <div className="rel-wot-cell sage">
                <div className="rel-wot-cell-label">{p2} — Returns by</div>
                <div className="rel-wot-cell-text">{p2Return || <span className="empty-wot">—</span>}</div>
              </div>
            </div>
          </div>
          <SharedAutoSave label="What does our combined dysregulation look like? What's the tell?" fieldKey="shared_window_combined" sharedData={sharedData} onSaveShared={onSaveShared} minHeight={70} placeholder="The pattern we both recognize as: we're both outside our windows..." />
        </div>
      </div>

      {/* Combined Loop Narrative */}
      <div className="section">
        <div className="section-title">Our Combined Cycle</div>
        <div className="section-desc">Read this aloud together. This is the cycle you create — not because you're bad at relationships, but because two nervous systems in threat mode lock into each other.</div>
        <div className="card">
          {(hasP1Cycle || hasP2Cycle) ? (
            <div style={{ lineHeight: 2.2 }}>
              {[
                `When ${p1} feels ${cycleP1.trigger || "___"}...`,
                `...they tend to ${cycleP1.reaction || "___"}.`,
                `This makes ${p2} feel ${cycleP2.trigger || "___"}...`,
                `...so they ${cycleP2.reaction || "___"}.`,
                `Which confirms ${p1}\u2019s fear: ${cycleP1.partnerFeels || "___"}.`,
                `And the loop starts again.`,
              ].map((line, i) => (
                <div key={i} style={{ fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontStyle: i < 5 ? "italic" : "normal", color: i === 5 ? "var(--charcoal-light)" : "var(--charcoal-mid)", paddingLeft: i > 0 && i < 5 ? "14px" : "0" }}>
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-wot">Both partners need to complete Section 3 (Map Your Loop) first.</div>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: "0.78rem", color: "var(--charcoal-light)", fontStyle: "italic" }}>↻ The enemy is the loop — not your partner.</div>
        <SharedAutoSave label="What do you notice about your combined loop? What surprised you?" fieldKey="shared_cycleReflection" sharedData={sharedData} onSaveShared={onSaveShared} minHeight={70} placeholder="What landed when you saw it together?" />
      </div>

      {/* Bridge Statements */}
      <div className="section">
        <div className="section-title">Bridge Statements</div>
        <div className="section-desc">Say these to each other when you're calm. These are built from what each of you mapped in Section 4 — The Deeper Cycle.</div>
        <div className="callout sage" style={{ marginBottom: 14 }}>⚠ Only share these when both partners are below 5/10 activation. If either partner floods while reading, pause. Use Path A first.</div>
        <div className="eft-bridge">
          {[
            { name: p1, move: p1Move, vulnerable: p1Vulnerable, need: p1Need, hasData: hasP1EFT },
            { name: p2, move: p2Move, vulnerable: p2Vulnerable, need: p2Need, hasData: hasP2EFT },
          ].map(({ name, move, vulnerable, need, hasData }) => (
            <div key={name}>
              <div className="eft-bridge-title">{name}'s Bridge Statement</div>
              {hasData ? (
                <div className="eft-bridge-template">
                  "When I <span>{move || "___"}</span>, I'm not trying to hurt you.<br />
                  I'm actually feeling <span>{vulnerable}</span>.<br />
                  What I'm really reaching for is <span>{need}</span>.<br />
                  The cycle is the problem — not you."
                </div>
              ) : (
                <div style={{ padding: "12px 16px", background: "var(--sand)", borderRadius: "var(--radius)", marginBottom: 14, fontSize: "0.82rem", color: "var(--charcoal-light)", fontStyle: "italic" }}>
                  {name} needs to complete Section 4 first.
                </div>
              )}
            </div>
          ))}
        </div>
        <SharedAutoSave label="What came up when you heard each other's bridge statement?" fieldKey="shared_eftReflection" sharedData={sharedData} onSaveShared={onSaveShared} placeholder="What landed differently when you could see each other's hidden layer?" />
      </div>

      {/* Profile side-by-side */}
      <div className="section">
        <div className="section-title">How Each of Us Shows Up</div>
        <div className="section-desc">What each partner mapped in Section 1 — Who Am I in Conflict.</div>
        <div className="rel-wot">
          <div className="rel-wot-rows">
            {[["p1", p1], ["p2", p2]].map(([key, name]) => {
              const k = (f) => `profile_${key}_${f}`;
              const moves = (data[k("first_move")] || []).join(", ");
              const body = (data[k("body_signs")] || []).join(", ");
              const thoughts = (data[k("thoughts")] || []).join(", ");
              const underneath = (data[k("underneath")] || []).join(", ");
              const notes = data[k("notes")] || "";
              const hasData = moves || body;
              return (
                <div key={key} className={`rel-wot-cell ${key === "p1" ? "rose" : "sage"}`} style={{ marginBottom: 8 }}>
                  <div className="rel-wot-cell-label">{name}</div>
                  {hasData ? (
                    <div style={{ fontSize: "0.8rem", color: "var(--charcoal-mid)", lineHeight: 1.8 }}>
                      {moves && <div><strong>Moves:</strong> {moves}</div>}
                      {body && <div><strong>Body:</strong> {body}</div>}
                      {thoughts && <div><strong>Tells self:</strong> {thoughts}</div>}
                      {underneath && <div><strong>Underneath:</strong> {underneath}</div>}
                      {notes && <div><strong>Also:</strong> {notes}</div>}
                    </div>
                  ) : (
                    <div className="empty-wot">{name} hasn't completed Section 1 yet.</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <SharedAutoSave label="Reflect together: what did you learn about each other?" fieldKey="shared_profile_reflect" sharedData={sharedData} onSaveShared={onSaveShared} minHeight={70} placeholder="What surprised you? What do you want your partner to know you now understand?" />
      </div>

      <button className="btn-rose" onClick={onDone}>Complete: Sign the Agreement →</button>
    </div>
  );
}

// ── SECTION 5: PUTTING IT INTO PRACTICE ──────────────────────────────────────
function PracticeTab({ data, onSave, identity, onNavigate, onDone }) {
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
    <div className="fade-in">
      <div className="section">
        <div className="section-title">From Understanding to Action</div>
        <div className="section-desc">You now have a map. The question is what you'll do with it. This section is where understanding becomes practice — specific enough to use in the actual moment.</div>
      </div>

      <div className="section">
        <div className="section-title">My Named Triggers (3–5 max)</div>
        <div className="section-desc">Name the specific situations that reliably push you outside your window. The more precisely you can name a trigger, the more quickly you'll recognize it — and catch yourself before the cycle engages.</div>
        {triggers.map((t, i) => (
          <div key={t.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--gold)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>Trigger {i + 1}</div>
            <div className="field-group">
              <div className="field-label">The trigger</div>
              <input className="trigger-input" placeholder="When my partner says / does / doesn't do..." value={t.trigger} onChange={e => updateTrigger(t.id, "trigger", e.target.value)} />
            </div>
            <div className="field-group">
              <div className="field-label">What I tell myself in that moment</div>
              <input className="trigger-input" placeholder="The story I run in my head..." value={t.tell} onChange={e => updateTrigger(t.id, "tell", e.target.value)} />
            </div>
            <div className="field-group">
              <div className="field-label">How I cope (what I actually do)</div>
              <input className="trigger-input" placeholder="My automatic response..." value={t.cope} onChange={e => updateTrigger(t.id, "cope", e.target.value)} />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <div className="field-label">What I actually need in that moment</div>
              <input className="trigger-input" placeholder="The underlying need this trigger is touching..." value={t.need} onChange={e => updateTrigger(t.id, "need", e.target.value)} />
            </div>
          </div>
        ))}
        {triggers.length < 5 && (
          <button className="add-trigger-btn" onClick={addTrigger}>+ Add another trigger ({triggers.length}/5)</button>
        )}
      </div>

      <div className="section">
        <div className="section-title">Observations & Action Items</div>
        <AutoSave label="What pattern do I see across my triggers?" fieldKey="practice_observations" data={data} onSave={onSave} minHeight={70} placeholder="What do they have in common? What does that tell you?" />
        <AutoSave label="My action items — what I'm going to do differently" fieldKey="practice_actions" data={data} onSave={onSave} minHeight={80} placeholder="Specific, small, behavioral changes. Not 'be less reactive' — 'when I feel X, I will Y.'" />
        <AutoSave label="What I want my partner to know about my triggers" fieldKey="practice_share" data={data} onSave={onSave} minHeight={70} placeholder="Context, background, or requests that would help them support you..." />
      </div>

      <div className="bridge-prompt sage" style={{ marginTop: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--ink)", marginBottom: 4 }}>Ready to put this into practice?</div>
          <div className="bridge-prompt-text">Strengthen unlocks your Conflict Log, Glimmer Journal, Weekly Inspection, and Daily Reset.</div>
        </div>
        <button className="bridge-btn" style={{ background: "var(--sage)" }} onClick={() => onNavigate("strengthen")}>Go to Strengthen →</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn-rose" onClick={onDone}>Complete: Sign the Agreement →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PATH: STRENGTHEN (V3 — unlocks after one path completed)
// ════════════════════════════════════════════════════════════════════════════════
function StrengthenPath({ data, onSave, identity }) {
  const [tab, setTab] = useState("log");
  const [entries, setEntries] = useState(data.conflictLog || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ what: "", escalated: "", underneath: "", usedProtocol: null, worked: "", change: "" });
  const [glimmers, setGlimmers] = useState(data.glimmers || []);
  const [glimmerInput, setGlimmerInput] = useState("");
  const [inspection, setInspection] = useState(data.weeklyInspection || {});
  const [safetyA, setSafetyA] = useState(data.weeklyInspection?.safetyA || 5);
  const [safetyB, setSafetyB] = useState(data.weeklyInspection?.safetyB || 5);
  const p1 = partnerName(data, "p1");
  const p2 = partnerName(data, "p2");

  const saveEntry = () => {
    if (!formData.what.trim()) return;
    const updated = [{ ...formData, date: today(), id: Date.now() }, ...entries];
    setEntries(updated); onSave({ conflictLog: updated });
    setFormData({ what: "", escalated: "", underneath: "", usedProtocol: null, worked: "", change: "" });
    setShowForm(false);
  };

  const addGlimmer = () => {
    if (!glimmerInput.trim()) return;
    const updated = [{ text: glimmerInput, date: today(), id: Date.now() }, ...glimmers];
    setGlimmers(updated); onSave({ glimmers: updated }); setGlimmerInput("");
  };

  const saveInspection = (updates) => {
    const updated = { ...inspection, ...updates, date: today() };
    setInspection(updated); onSave({ weeklyInspection: updated });
  };

  return (
    <div className="fade-in">
      <div className="path-header">
        <div>
          <div className="path-header-title">Strengthen</div>
          <div className="path-header-subtitle">Maintenance tools · Conflict Log · Glimmer Journal · Weekly Inspection</div>
        </div>
      </div>

      <div className="tab-bar">
        {[["log","Conflict Log"],["glimmers","Glimmer Journal"],["inspection","Weekly Inspection"],["daily","Daily Reset"]].map(([id, label]) => (
          <button key={id} className={`tab-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "log" && (
        <div className="fade-in">
          <div className="section">
            <div className="section-desc">Track conflicts over time to identify patterns. Each entry builds your collective understanding of what triggers the cycle and what helps repair it.</div>
            <div className="log-header">
              <div>
                <div className="section-title" style={{ marginBottom: 2 }}>Conflict Log</div>
                <div className="log-count">{entries.length} {entries.length === 1 ? "entry" : "entries"}</div>
              </div>
              <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New Entry"}</button>
            </div>

            {showForm && (
              <div className="new-entry-form fade-in">
                <div className="new-entry-title">Log this conflict</div>
                {[
                  { label: "What happened (factually)", key: "what", placeholder: "Describe what occurred without interpretation..." },
                  { label: "What escalated it", key: "escalated", placeholder: "What specific moment turned the heat up?" },
                  { label: "What I was feeling underneath", key: "underneath", placeholder: "Beneath the reaction, what was the real feeling?" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="field-group">
                    <div className="field-label">{label}</div>
                    <textarea className="textarea-field" style={{ minHeight: 60 }} placeholder={placeholder} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="field-group">
                  <div className="field-label">Did we use the protocol?</div>
                  <div className="protocol-toggle">
                    <button className={`toggle-btn ${formData.usedProtocol === true ? "active-yes" : ""}`} onClick={() => setFormData({ ...formData, usedProtocol: true })}>✓ Yes</button>
                    <button className={`toggle-btn ${formData.usedProtocol === false ? "active-no" : ""}`} onClick={() => setFormData({ ...formData, usedProtocol: false })}>✗ No</button>
                  </div>
                </div>
                {[
                  { label: "What worked", key: "worked" },
                  { label: "What we'd do differently", key: "change" },
                ].map(({ label, key }) => (
                  <div key={key} className="field-group">
                    <div className="field-label">{label}</div>
                    <textarea className="textarea-field" style={{ minHeight: 55 }} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveEntry}>Save Entry</button>
                </div>
              </div>
            )}

            {entries.length === 0 && !showForm && (
              <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">No entries yet. Log your first conflict to start tracking patterns over time.</div></div>
            )}
            {entries.map(e => (
              <div key={e.id} className="log-entry">
                <div className="log-entry-header">
                  <div className="log-date">{formatDate(e.date)}</div>
                  {e.usedProtocol !== null && <div className={`log-protocol-badge ${e.usedProtocol ? "yes" : "no"}`}>{e.usedProtocol ? "✓ Protocol Used" : "✗ Protocol Skipped"}</div>}
                </div>
                {e.what && <div className="log-field"><div className="log-field-label">What happened</div><div className="log-field-value">{e.what}</div></div>}
                {e.underneath && <div className="log-field"><div className="log-field-label">Underneath</div><div className="log-field-value">{e.underneath}</div></div>}
                {e.worked && <div className="log-field"><div className="log-field-label">What worked</div><div className="log-field-value">{e.worked}</div></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "glimmers" && (
        <div className="fade-in">
          <div className="section">
            <div className="section-title">Glimmer Journal</div>
            <div className="section-desc">Glimmers are micro-moments that say: "I'm trying." "I see you." Small moments repeated consistently become structural reinforcement. The 3:1 Rule — for every stress fracture you name, name three reinforcements.</div>
            <div className="glimmer-input-area">
              <input className="glimmer-input" placeholder="This week I noticed my partner..." value={glimmerInput} onChange={e => setGlimmerInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addGlimmer(); }} />
              <button className="glimmer-add-btn" onClick={addGlimmer}>Add</button>
            </div>
            {glimmers.length === 0 && <div className="empty-state" style={{ marginTop: 16 }}><div className="empty-icon">✦</div><div className="empty-text">No glimmers yet. What small moment of effort or safety have you noticed this week?</div></div>}
            {glimmers.map(g => (
              <div key={g.id} className="glimmer-entry">
                <span className="glimmer-icon">✦</span>
                <div><div className="glimmer-text">{g.text}</div><div className="glimmer-date">{formatDate(g.date)}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "inspection" && (
        <div className="fade-in">
          <div className="section">
            <div className="section-title">Weekly Structural Inspection</div>
            <div className="section-desc">15 minutes. No screens. Both partners answer honestly. A foundation that isn't maintained develops new stress fractures.</div>
            <div className="card">
              {[
                { name: p1, key: "safetyA", val: safetyA, setVal: setSafetyA },
                { name: p2, key: "safetyB", val: safetyB, setVal: setSafetyB },
              ].map(({ name, key, val, setVal }) => (
                <div key={key} className="inspection-question">
                  <div className="field-label">Foundation Safety — {name}</div>
                  <div className="slider-value">{val}/10</div>
                  <input type="range" className="inspection-slider" min={0} max={10} value={val}
                    onChange={e => setVal(+e.target.value)}
                    onMouseUp={() => saveInspection({ [key]: val })} onTouchEnd={() => saveInspection({ [key]: val })} />
                  <div className="slider-row"><span>0 — Critical</span><span>10 — Strong</span></div>
                </div>
              ))}
              <AutoSave label="Where did we reinforce the foundation this week?" fieldKey="insp_reinforce" data={data} onSave={onSave} placeholder="Moments of repair, effort, connection..." />
              <AutoSave label="Where did stress fractures appear?" fieldKey="insp_fractures" data={data} onSave={onSave} placeholder="Patterns that came up, difficult moments..." />
              <AutoSave label="What needs reinforcement this week?" fieldKey="insp_needs" data={data} onSave={onSave} placeholder="Intentions for the coming week..." />
            </div>
          </div>
        </div>
      )}

      {tab === "daily" && (
        <div className="fade-in">
          <div className="section">
            <div className="section-title">The Daily 60-Second Reset</div>
            <div className="section-desc">Each night. Tiny. Consistent. Neural rewiring happens through repetition, not intensity.</div>
            <div className="daily-reset">
              <div className="daily-prompt"><div className="daily-prompt-q">One thing I appreciated today</div><AutoSave fieldKey="daily_appreciate" data={data} onSave={onSave} minHeight={45} /></div>
              <div className="daily-prompt"><div className="daily-prompt-q">One thing my partner did well</div><AutoSave fieldKey="daily_partner" data={data} onSave={onSave} minHeight={45} /></div>
              <div className="daily-prompt"><div className="daily-prompt-q">One effort I noticed</div><AutoSave fieldKey="daily_effort" data={data} onSave={onSave} minHeight={45} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// AGREEMENT
// ════════════════════════════════════════════════════════════════════════════════
function AgreementPath({ data, sharedData, onSaveShared, onNavigate }) {
  const [sig1, setSig1] = useState((sharedData && sharedData.sig1) || "");
  const [sig2, setSig2] = useState((sharedData && sharedData.sig2) || "");
  const [signed, setSigned] = useState(!!(sharedData && sharedData.agreementSigned));

  const handleSign = () => {
    if (!sig1.trim() || !sig2.trim()) return;
    onSaveShared({ sig1, sig2, agreementSigned: today() }); setSigned(true);
  };

  return (
    <div className="fade-in">
      <div className="path-header">
        <span className="path-header-icon">🤝</span>
        <div>
          <div className="path-header-title">The Foundation Reset Agreement</div>
          <div className="path-header-subtitle">Your commitment to protecting the structure</div>
        </div>
        <button className="back-btn" onClick={() => onNavigate("home")}>← Home</button>
      </div>

      <p className="agreement-intro">Before you close this toolkit, read these commitments together. This is not a contract — it is a choice. A declaration that you are both willing to do something different.</p>

      <div className="card">
        {[
          { num: 1, title: "We Commit to Safety First", text: "We will not use name-calling, character attacks, or threats during conflict. Emotional safety is the foundation of everything else." },
          { num: 2, title: "We Commit to the STOP Skill", text: "Before we say anything reactive, we will stop, breathe, and observe what's happening in our own bodies. We commit to catching ourselves first." },
          { num: 3, title: "We Commit to Pausing When Activated", text: "If either partner rates activation above 6/10, we will pause and name a return time. A pause is not abandonment — it is stabilization." },
          { num: 4, title: "We Commit to Present-Focused Conflict", text: "We will address one issue at a time. We will not stack past grievances onto current conversations." },
          { num: 5, title: "We Commit to Repair", text: "If escalation happens, we will attempt repair within 24 hours. We will name the behavior, take ownership, and offer reconnection." },
          { num: 6, title: "We Commit to Reinforcement", text: "We will actively look for glimmers and reinforce progress. Safety is built through repeated small shifts, not grand gestures." },
        ].map(c => (
          <div key={c.num} className="commitment">
            <div className="commitment-num">{c.num}</div>
            <div><div className="commitment-title">{c.title}</div><div className="commitment-text">{c.text}</div></div>
          </div>
        ))}
      </div>

      {!signed ? (
        <>
          <div className="sig-row">
            <div className="sig-field">
              <input placeholder={(sharedData && sharedData.name_p1) || "Partner 1 name"} value={sig1} onChange={e => setSig1(e.target.value)} />
              <div className="sig-label">Partner 1</div>
            </div>
            <div className="sig-field">
              <input placeholder={(sharedData && sharedData.name_p2) || "Partner 2 name"} value={sig2} onChange={e => setSig2(e.target.value)} />
              <div className="sig-label">Partner 2</div>
            </div>
          </div>
          <button className="btn-rose" onClick={handleSign} disabled={!sig1.trim() || !sig2.trim()}>Sign the Agreement →</button>
        </>
      ) : (
        <div className="agreement-saved">
          <div className="badge">✓ Signed — {formatDate(sharedData && sharedData.agreementSigned)}</div>
          <div style={{ marginTop: 8, fontSize: "0.82rem", color: "var(--charcoal-light)" }}>{(sharedData && sharedData.sig1) || ""} & {(sharedData && sharedData.sig2) || ""}</div>
        </div>
      )}

      <div className="agreement-tagline">"It is not you vs. me. It is us protecting the structure."</div>

      <div style={{ textAlign: "center", marginTop: 28, padding: "22px", background: "var(--sand)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "0.98rem", color: "var(--charcoal)", marginBottom: 7 }}>This Is the Foundation. Not the Finish Line.</div>
        <div style={{ fontSize: "0.8rem", color: "var(--charcoal-light)", lineHeight: 1.7, marginBottom: 14 }}>When you're ready to go deeper — into the patterns beneath the patterns, the attachment wounds driving the loop — that's where clinical work begins.</div>
        <a href="https://innerpathwaysmft.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "var(--charcoal)", color: "white", padding: "10px 22px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em" }}>Book a Free Consultation →</a>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ONBOARDING — runs once per device. Step 1: names + role. Step 2: couple code.
// ════════════════════════════════════════════════════════════════════════════════
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [myName, setMyName] = useState("");
  const [partnerName_, setPartnerName_] = useState("");
  const [role, setRole] = useState("p1");
  const [codeMode, setCodeMode] = useState("create"); // "create" | "join"
  const [coupleCode, setCoupleCode] = useState(() => generateCoupleCode());
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const step1Ready = myName.trim().length > 0 && partnerName_.trim().length > 0;

  const handleStep1 = () => { if (step1Ready) setStep(2); };

  const handleCreate = () => {
    const identity = {
      role, myName: myName.trim(), partnerName: partnerName_.trim(),
      coupleCode, createdAt: new Date().toISOString(),
    };
    const initialPrivate = {};
    // Seed shared data with partner names
    const initialShared = role === "p1"
      ? { name_p1: myName.trim(), name_p2: partnerName_.trim() }
      : { name_p1: partnerName_.trim(), name_p2: myName.trim() };
    saveIdentity(identity);
    savePrivate(initialPrivate);
    saveShared(coupleCode, initialShared);
    onComplete(identity, initialPrivate, initialShared);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    setJoinError("");
    try {
      const existing = await loadShared(code);
      const identity = {
        role, myName: myName.trim(), partnerName: partnerName_.trim(),
        coupleCode: code, createdAt: new Date().toISOString(),
      };
      const initialPrivate = {};
      // Merge our names into shared
      const merged = {
        ...existing,
        ...(role === "p1"
          ? { name_p1: myName.trim(), name_p2: partnerName_.trim() }
          : { name_p1: partnerName_.trim(), name_p2: myName.trim() })
      };
      saveIdentity(identity);
      savePrivate(initialPrivate);
      await saveShared(code, merged);
      onComplete(identity, initialPrivate, merged);
    } catch(e) {
      setJoinError("Could not connect. Check the code and try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="onboard-screen">
      <div className="onboard-card">
        <div className="onboard-logo"><Logo /></div>
        <div className="onboard-eyebrow">A Therapist-Designed Escalation Interruption System</div>
        <h1 className="onboard-heading">Rewire<br /><em>the Fight</em></h1>

        {step === 1 && (
          <>
            <p className="onboard-sub">This is your private copy. Your partner sets up their own — then you connect with a couple code to sync your shared work.</p>
            <hr className="onboard-divider" />
            <div className="onboard-step-title">What's your name?</div>
            <div className="onboard-name-row">
              <label className="onboard-name-label">Your first name</label>
              <input className="onboard-name-input" placeholder="e.g. Jamie" value={myName}
                onChange={e => setMyName(e.target.value)} autoFocus
                onKeyDown={e => { if (e.key === "Enter" && step1Ready) handleStep1(); }} />
            </div>
            <div className="onboard-name-row" style={{ marginTop: 12 }}>
              <label className="onboard-name-label">Your partner's first name</label>
              <input className="onboard-name-input" placeholder="e.g. Alex" value={partnerName_}
                onChange={e => setPartnerName_(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && step1Ready) handleStep1(); }} />
            </div>
            <hr className="onboard-divider" />
            <div className="onboard-step-title">Which partner are you?</div>
            <div className="onboard-step-sub">Sets your color coding. Either is fine.</div>
            <div className="onboard-role-select">
              {[["p1","Partner 1"],["p2","Partner 2"]].map(([key, label]) => (
                <button key={key} className={`role-btn ${role === key ? `selected-${key}` : ""}`} onClick={() => setRole(key)}>
                  <div className="role-label">{label}</div>
                  <div className="role-name-preview">{myName || "—"}</div>
                </button>
              ))}
            </div>
            <button className={`onboard-submit ${step1Ready ? "ready" : ""}`} onClick={handleStep1} disabled={!step1Ready}>
              Next: Connect with {partnerName_.trim() || "your partner"} →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="onboard-sub">Connect your workbook with {partnerName_.trim()}'s so your shared work — goals, shared views, the agreement — stays in sync.</p>
            <hr className="onboard-divider" />
            <div className="onboard-code-tabs">
              <button className={`code-tab ${codeMode === "create" ? "active" : ""}`} onClick={() => setCodeMode("create")}>
                I'm setting up first
              </button>
              <button className={`code-tab ${codeMode === "join" ? "active" : ""}`} onClick={() => setCodeMode("join")}>
                My partner already set up
              </button>
            </div>

            {codeMode === "create" && (
              <div className="code-create-box">
                <div className="onboard-step-title">Your couple code</div>
                <div className="onboard-step-sub">Share this code with {partnerName_.trim()}. They'll enter it when they set up their workbook. Keep it somewhere easy to find.</div>
                <div className="couple-code-display">{coupleCode}</div>
                <button className="code-regen-btn" onClick={() => setCoupleCode(generateCoupleCode())}>Generate new code ↺</button>
                <div className="onboard-note">Your private reflections never leave this device. Only the shared view (goals, combined cycle, agreement) syncs between you.</div>
                <button className="onboard-submit ready" onClick={handleCreate}>Open My Workbook →</button>
              </div>
            )}

            {codeMode === "join" && (
              <div className="code-join-box">
                <div className="onboard-step-title">Enter your couple code</div>
                <div className="onboard-step-sub">Ask {partnerName_.trim()} for the code they generated during their setup.</div>
                <input className="onboard-name-input" placeholder="e.g. ROSE-4829"
                  value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === "Enter" && joinCode.trim()) handleJoin(); }}
                  style={{ textAlign: "center", letterSpacing: "0.12em", fontWeight: 700, fontSize: "1.1rem" }} />
                {joinError && <div className="join-error">{joinError}</div>}
                <div className="onboard-note">Your private reflections never leave this device. Only the shared view syncs between you.</div>
                <button className={`onboard-submit ${joinCode.trim() ? "ready" : ""}`}
                  onClick={handleJoin} disabled={!joinCode.trim() || joining}>
                  {joining ? "Connecting…" : "Connect & Open My Workbook →"}
                </button>
              </div>
            )}

            <button className="back-link" onClick={() => setStep(1)}>← Back</button>
          </>
        )}

        <div className="onboard-quote">"It is not you vs. me. It is us protecting the structure."</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [identity, setIdentity] = useState(() => loadIdentity());
  const [screen, setScreen] = useState("home");
  const [lastPath, setLastPath] = useState(null); // last non-home/gate screen visited
  // Private data: this person's workbook
  const [privateData, setPrivateData] = useState(() => loadPrivate());
  // Shared data: synced between both partners via couple code
  const [sharedData, setSharedData] = useState({});
  const [sharedLoading, setSharedLoading] = useState(false);

  // Load shared data on mount and periodically refresh (every 30s)
  useEffect(() => {
    if (!identity?.coupleCode) return;
    const fetch = async () => {
      setSharedLoading(true);
      const s = await loadShared(identity.coupleCode);
      setSharedData(s);
      setSharedLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [identity?.coupleCode]);

  // Save private data
  const savePrivateField = useCallback((updates) => {
    setPrivateData(prev => {
      const next = { ...prev, ...updates };
      savePrivate(next);
      return next;
    });
  }, []);

  // Save shared data (persists + syncs)
  const saveSharedField = useCallback(async (updates) => {
    const next = { ...sharedData, ...updates };
    setSharedData(next);
    if (identity?.coupleCode) await saveShared(identity.coupleCode, next);
  }, [sharedData, identity?.coupleCode]);

  const navigate = (dest) => {
    setScreen(dest);
    if (!["home", "gate"].includes(dest)) setLastPath(dest);
    window.scrollTo(0, 0);
  };

  const handleOnboardComplete = async (id, initPrivate, initShared) => {
    setIdentity(id);
    setPrivateData(initPrivate);
    setSharedData(initShared);
  };

  // If no identity set, show onboarding
  if (!identity) {
    return (
      <>
        <style>{styles}</style>
        <OnboardingScreen onComplete={handleOnboardComplete} />
      </>
    );
  }

  const myName = identity.myName;
  const pName = identity.partnerName;
  const myRole = identity.role;
  const accentClass = myRole === "p1" ? "p1" : "p2";
  const coupleCode = identity.coupleCode;

  // Merge private + shared into a single data object for components that need both
  // Private fields take precedence for this user's own data
  const data = { ...sharedData, ...privateData };

  // Has user started any path?
  const hasStarted = !!(lastPath || privateData.act1 || privateData.conflictLog?.length || 
    privateData[`profile_${myRole}_first_move`] || privateData.learnCompleted);

  // Path completed — unlock Strengthen after any one path has meaningful content
  const pathCompleted = !!(
    (privateData.returnTime) || // completed escalation
    (privateData.dearm_topic || privateData.dearm_describe) || // completed repair
    (privateData.learnCompleted && Object.keys(privateData.learnCompleted).length > 0) // started learn
  );

  // Learn path progress
  const learnCompleted = privateData.learnCompleted || {};
  const learnCount = Object.keys(learnCompleted).length;
  const LEARN_TOTAL = 6;

  const goalsSet = !!(sharedData.goals_change || sharedData.goals_success);

  // Mode-based class for state visual environments
  const modeClass = screen === "escalate" ? "mode-escalate"
    : screen === "repair" ? "mode-repair"
    : screen === "learn" ? "mode-learn"
    : "";

  return (
    <>
      <style>{styles}</style>
      <div className={`app${modeClass ? " " + modeClass : ""}`}>
        {screen !== "escalate" && (
          <nav className="nav">
            <div className="nav-brand" onClick={() => navigate("home")}>
              <Logo />
              <div>
                <div className="nav-title">Rewire the Fight</div>
                <div className="nav-subtitle">Eva K. Fernandez, LMFT</div>
              </div>
            </div>
            <div className="nav-right">
              <div className="nav-tabs">
                <button className={`nav-tab-btn ${screen === "home" || screen === "gate" ? "active" : ""}`} onClick={() => navigate("home")}>Home</button>
                {hasStarted && (
                  <button className={`nav-tab-btn ${["escalate","repair","learn"].includes(screen) ? "active" : ""}`} onClick={() => navigate(lastPath || "gate")}>Continue</button>
                )}
                <button
                  className={`nav-tab-btn ${screen === "strengthen" ? "active" : ""} ${!pathCompleted ? "locked" : ""}`}
                  onClick={() => pathCompleted ? navigate("strengthen") : null}
                  title={!pathCompleted ? "Complete a path to unlock Strengthen" : ""}
                >
                  {pathCompleted ? "Strengthen" : "🔒 Strengthen"}
                </button>
              </div>
              <span className={`partner-badge ${accentClass}`}>{myName}</span>
            </div>
          </nav>
        )}

        <main className="main">
          {screen === "home" && (
            <div className="home-hero fade-in">
              <div className="home-hero-eyebrow">Eva K. Fernandez, LMFT · Inner Pathways MFT</div>
              <h1 className="home-hero-heading">Stop the fight.<br /><em>Repair the damage.</em><br />Prevent the next one.</h1>
              <p className="home-hero-sub">A therapist-designed escalation interruption system. Built for the moment you need it most.</p>
              <button className="btn-start-here" onClick={() => navigate("gate")}>Start Here</button>
              {hasStarted && (
                <button className="btn-continue-quiet" onClick={() => navigate(lastPath || "gate")}>
                  Already started? Continue →
                </button>
              )}
              <hr className="entry-divider" style={{ maxWidth: 520, margin: "48px auto 24px" }} />
              <div className="entry-footer">"It is not you vs. me. It is us protecting the structure."</div>
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 16 }}>
                <button className="goals-quiet-link" onClick={() => navigate("goals")}>
                  {goalsSet ? "↺ Revisit Your Why" : "Set your goals →"}
                </button>
                <span className="home-footer-divider">·</span>
                <span className="home-footer-code">{coupleCode}</span>
              </div>
            </div>
          )}

          {screen === "gate" && (
            <div className="gate-screen fade-in">
              <div className="gate-eyebrow">Where are you right now?</div>
              <div className="path-cards" style={{ maxWidth: 560, margin: "0 auto" }}>
                <button className="path-card escalate" onClick={() => navigate("escalate")}>
                  <div className="path-card-text">
                    <div className="path-card-title">🔥 We're escalating right now</div>
                    <div className="path-card-desc">Stop the cycle before it causes damage. Body-first. One step at a time.</div>
                  </div>
                  <span className="path-card-arrow">→</span>
                </button>
                <button className="path-card repair" onClick={() => navigate("repair")}>
                  <div className="path-card-text">
                    <div className="path-card-title">🔧 We just had a fight</div>
                    <div className="path-card-desc">Repair the rupture and find your way back to each other.</div>
                  </div>
                  <span className="path-card-arrow">→</span>
                </button>
                <button className="path-card learn" onClick={() => navigate("learn")}>
                  <div className="path-card-text">
                    <div className="path-card-title">🧠 We're calm — I want to understand us</div>
                    <div className="path-card-desc">Map the pattern. Understand the cycle underneath. Break it.</div>
                  </div>
                  <span className="path-card-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {screen === "goals" && <GoalsPath sharedData={sharedData} onSaveShared={saveSharedField} identity={identity} onNavigate={navigate} />}
          {screen === "escalate" && <EscalatePath data={data} onSave={savePrivateField} onNavigate={navigate} />}
          {screen === "repair" && <RepairPath data={data} onSave={savePrivateField} onNavigate={navigate} />}
          {screen === "learn" && <LearnPath data={data} onSave={savePrivateField} onSaveShared={saveSharedField} sharedData={sharedData} onNavigate={navigate} identity={identity} />}
          {screen === "strengthen" && <StrengthenPath data={data} onSave={savePrivateField} identity={identity} />}
          {screen === "agreement" && <AgreementPath data={data} sharedData={sharedData} onSaveShared={saveSharedField} onNavigate={navigate} />}
        </main>

        {screen !== "escalate" && (
          <footer className="footer">
            <span>Inner Pathways MFT, PLLC · Rewire the Fight™</span>
            <span style={{ margin: "0 8px" }}>·</span>
            <button className="goals-quiet-link" onClick={() => navigate("goals")} style={{ display: "inline" }}>
              {goalsSet ? "↺ Revisit Your Why" : "Set your goals →"}
            </button>
          </footer>
        )}
      </div>
    </>
  );
}
