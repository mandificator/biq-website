import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   BIQ — 75/25 SPLIT LAYOUT (desktop) / stacked (mobile)
   ═══════════════════════════════════════════════════════════════ */

const CORAL = "#ffffff";
const DARK = "#202020";
const GRAY = "#e5e5e5";
const WHITE = "#ffffff";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MONO = '"SF Mono", "Fira Code", "Consolas", monospace';
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const DISPLAY = '"Grifter", "Helvetica Neue", Helvetica, Arial, sans-serif';
const BREAKPOINT = 1024;

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useIsMobile(breakpoint = BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < breakpoint : false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ═══════════════════════════════════════════
   GEOMETRIC LINE ART
   ═══════════════════════════════════════════ */

function useArtAnim(totalFrames: number, hovered: boolean, speed = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(totalFrames);
  const seen = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !seen.current) { seen.current = true; setFrame(0); } },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => { if (hovered && seen.current) setFrame(0); }, [hovered]);
  useEffect(() => {
    if (frame >= totalFrames) return;
    const t = setTimeout(() => setFrame(f => f + 1), speed);
    return () => clearTimeout(t);
  }, [frame, totalFrames, speed]);
  return { ref, frame };
}

const artBase: React.CSSProperties = {
  fontFamily: MONO, fontSize: "clamp(8px, 1.1vw, 14px)",
  lineHeight: 1.4, color: DARK, overflow: "hidden", width: "fit-content",
};

function artGrid(art: string, mod?: (r: number, c: number, ch: string) => string) {
  const lines = art.split("\n");
  const w = Math.max(...lines.map(l => [...l].length));
  return lines.map((line, r) => (
    <div key={r} style={{ display: "flex" }}>
      {[...line.padEnd(w)].map((ch, c) => (
        <span key={c} style={{ display: "inline-block", width: "1.7ch", textAlign: "center", flexShrink: 0 }}>
          {mod ? mod(r, c, ch) : ch}
        </span>
      ))}
    </div>
  ));
}

const ANALYTICS_ASCII = [
"┌──────────────────────────────────────┐",
"│                                      │",
"│  VISITORS                  ^ +127%   │",
"│  ═══════════════════════════════════ │",
"│                                      │",
"│  ##                                  │",
"│  ## ##                               │",
"│  ## ##                    ##         │",
"│  ## ## ##              ## ##         │",
"│  ## ## ##           ## ## ## ##      │",
"│  ## ## ## ##     ## ## ## ## ##      │",
"│  ## ## ## ##  ## ## ## ## ## ## ##   │",
"│  ## ## ## ## ## ## ## ## ## ## ## ## │",
"│  ── ── ── ── ── ── ── ── ── ── ──    │",
"│  JA FE MR AP MY JN JL AU SE OC NO    │",
"│                                      │",
"│  o visits   o returns   o unique     │",
"│  ── dwell ─── bounce ─── peak ──     │",
"│                                      │",
"│  avg session  ....  4m 32s           │",
"│  peak hour    ....  14:00            │",
"│  conversion   ....  23.7%            │",
"│                                      │",
"│                                      │",
"└──────────────────────────────────────┘",
].join("\n");

const LOYALTY_ASCII = [
"╔══════════════════════════════════════╗",
"║                                      ║",
"║  PRESENCE REWARDS CARD               ║",
"║                                      ║",
"║  ┌──┐ ┌──┐ ┌──┐ ┌──┐                 ║",
"║  │*·│ │*·│ │*·│ │*·│                 ║",
"║  └──┘ └──┘ └──┘ └──┘                 ║",
"║  ┌──┐ ┌──┐ ┌──┐ ┌──┐                 ║",
"║  │*·│ │*·│ │*·│ │  │                 ║",
"║  └──┘ └──┘ └──┘ └──┘                 ║",
"║                                      ║",
"║  7 / 8  ████████████████░░  87%      ║",
"║                                      ║",
"╠══════════════════════════════════════╣",
"║                                      ║",
"║  NEXT REWARD:                        ║",
"║  ┌────────────────────────────────┐  ║",
"║  │  *  GOLD STATUS                │  ║",
"║  │     + 500 TOKEN                │  ║",
"║  └────────────────────────────────┘  ║",
"║                                      ║",
"║  VISIT ──> STAMP ──> COLLECT ──>     ║",
"║  REDEEM                              ║",
"║                                      ║",
"╚══════════════════════════════════════╝",
].join("\n");

const TRAFFIC_ASCII = [
"┌──────────────────────────────────────┐",
"│           VENUE  HEATMAP             │",
"│                                      │",
"│  . . . . . . . . . . . . . . . .     │",
"│  . . . . . ░ ░ ░ . . . . . . . .     │",
"│  . . . ░ ░ ▒ ▒ ▒ ░ ░ . . . . . .     │",
"│  . . ░ ░ ▒ ▓ ▓ ▓ ▒ ░ ░ . . . . .     │",
"│  . . ░ ▒ ▓ █ █ █ ▓ ▒ ░ . . . . .     │",
"│  . . ░ ▒ ▓ █ @ █ ▓ ▒ ░ . . . . .     │",
"│  . . ░ ▒ ▓ █ █ █ ▓ ▒ ░ . . . . .     │",
"│  . . ░ ░ ▒ ▓ ▓ ▓ ▒ ░ ░ . . . . .     │",
"│  . . . ░ ░ ▒ ▒ ▒ ░ ░ . . . . . .     │",
"│  . . . . . ░ ░ ░ . . . . . . . .     │",
"│  . . . . . . . . . . . . . . . .     │",
"│                                      │",
"│  @ PEAK      ░ LOW    ▓ MEDIUM       │",
"│                                      │",
"│  06  08  10  12  14  16  18  20      │",
"│  ░░  ▒▒  ▓▓  ██  ██  ▓▓  ▒▒  ░░      │",
"│                                      │",
"│  847/hr peak  .  22min avg dwell     │",
"│                                      │",
"│                                      │",
"│                                      │",
"└──────────────────────────────────────┘",
].join("\n");

const ADVERTISING_ASCII = [
"┌──────────────────────────────────────┐",
"│        PROXIMITY  BROADCAST          │",
"│                                      │",
"│              200m                    │",
"│         /─────────────\\              │",
"│        /    100m       \\             │",
"│       /  /─────────\\    \\            │",
"│      │  /   50m     \\    │           │",
"│      │ │  /───────\\  │   │           │",
"│      │ │  │       │  │   │           │",
"│      │ │  │  @ @  │  │   │           │",
"│      │ │  │  HERE │  │   │           │",
"│      │ │  \\───────/  │   │           │",
"│      │  \\           /    │           │",
"│       \\  \\─────────/   /             │",
"│        \\              /              │",
"│         \\─────────────/              │",
"│                                      │",
"│  @ presence                          │",
"│      \\──> intent                     │",
"│           \\──> offer                 │",
"│                \\──> convert          │",
"│                                      │",
"│                                      │",
"└──────────────────────────────────────┘",
].join("\n");

function AnalyticsArt({ hovered = false }: { hovered?: boolean }) {
  const { ref, frame } = useArtAnim(8, hovered, 100);
  return (
    <div ref={ref} style={artBase}>
      {artGrid(ANALYTICS_ASCII, (r, _c, ch) => {
        if (r >= 5 && r <= 12 && ch === "#") {
          return r >= 12 - Math.min(frame, 7) ? "#" : " ";
        }
        return ch;
      })}
    </div>
  );
}

function LoyaltyArt({ hovered = false }: { hovered?: boolean }) {
  const { ref, frame } = useArtAnim(16, hovered, 60);
  const barPositions = useRef<number[]>([]);
  if (barPositions.current.length === 0) {
    const lines = LOYALTY_ASCII.split("\n");
    if (lines[11]) {
      [...lines[11]].forEach((ch, c) => { if (ch === "\u2588") barPositions.current.push(c); });
    }
  }
  const barSet = new Set(barPositions.current.slice(frame));
  return (
    <div ref={ref} style={artBase}>
      {artGrid(LOYALTY_ASCII, (r, c, ch) => {
        if (r === 11 && barSet.has(c)) return "\u2591";
        return ch;
      })}
    </div>
  );
}

function TrafficArt({ hovered = false }: { hovered?: boolean }) {
  const { ref, frame } = useArtAnim(6, hovered, 200);
  const levels: Record<string, number> = { "@": 0, "\u2588": 1, "\u2593": 2, "\u2592": 3, "\u2591": 4 };
  return (
    <div ref={ref} style={artBase}>
      {artGrid(TRAFFIC_ASCII, (r, _c, ch) => {
        if (r >= 3 && r <= 13 && ch in levels) {
          return frame >= levels[ch] ? ch : ".";
        }
        return ch;
      })}
    </div>
  );
}

function AdvertisingArt({ hovered = false }: { hovered?: boolean }) {
  const { ref, frame } = useArtAnim(10, hovered, 100);
  const center = 10;
  return (
    <div ref={ref} style={artBase}>
      {artGrid(ADVERTISING_ASCII, (r, c, ch) => {
        if (r === 0 || r === 23) return ch;
        if ((c === 0 || c === 39) && ch !== " ") return ch;
        if (ch === " ") return ch;
        if (r >= 3 && r <= 16) {
          const dist = Math.abs(r - center);
          return dist <= frame * 1.5 ? ch : " ";
        }
        if (r >= 18 && r <= 21) {
          return frame >= 7 + (r - 18) ? ch : " ";
        }
        return ch;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >{children}</motion.div>
  );
}

/* ═══════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════ */

function useNavTheme(scrollContainer?: React.RefObject<HTMLElement | null>) {
  const [light, setLight] = useState(true); // start light (hero is dark bg)
  useEffect(() => {
    const check = () => {
      // Check what element is behind the nav button (top-right area)
      const x = window.innerWidth - 80;
      const y = 36;
      const navEls = document.querySelectorAll("[data-nav-theme]");
      let found = false;
      navEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= y && rect.bottom > y) {
          setLight(el.getAttribute("data-nav-theme") === "light");
          found = true;
        }
      });
      if (!found) setLight(false);
    };
    const target = scrollContainer?.current || window;
    target.addEventListener("scroll", check, { passive: true });
    check();
    return () => target.removeEventListener("scroll", check);
  }, [scrollContainer]);
  return light;
}

function Nav({ menuOpen, setMenuOpen, light = false }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void; light?: boolean }) {
  const close = useCallback(() => setMenuOpen(false), [setMenuOpen]);
  const color = menuOpen ? DARK : light ? GRAY : DARK;
  const borderColor = menuOpen ? "none" : `1px solid ${color}`;

  return (
    <>
      <a href="/" style={{ position: "fixed", top: 20, left: 20, zIndex: 60, display: "flex", alignItems: "center", textDecoration: "none" }}>
        <img src="/logo_biq_64.png" alt="biq" style={{ height: 38, width: 38 }} />
      </a>
      <nav style={{ position: "fixed", top: 0, right: 0, zIndex: 50, padding: "0 clamp(1.5rem, 3vw, 3rem)", height: 72, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: borderColor,
          borderRadius: 24, padding: "8px 18px", cursor: "pointer",
          fontFamily: MONO, fontSize: 11, textTransform: "uppercase" as const,
          letterSpacing: "0.08em", color,
          position: "relative", zIndex: 60, minHeight: 40,
          transition: "color 0.3s, border-color 0.3s",
        }} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span style={{ display: "flex", flexDirection: "column", gap: menuOpen ? 0 : 4, width: 18, height: 14, justifyContent: "center", position: "relative" }}>
            <span style={{ width: 18, height: 1.5, background: color, borderRadius: 1, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translateY(0)" : "none", position: menuOpen ? "absolute" : "relative" }} />
            <span style={{ width: 18, height: 1.5, background: color, borderRadius: 1, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translateY(0)" : "none", position: menuOpen ? "absolute" : "relative" }} />
          </span>
          Menu
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ position: "fixed", inset: 0, zIndex: 46, background: "linear-gradient(180deg, #f7a027, #d946ef, #00c6ff)", padding: "clamp(6rem, 12vh, 10rem) clamp(2rem, 5vw, 5rem)", overflow: "auto", pointerEvents: "auto" }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
              <div>
                <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3rem)", fontWeight: 600, color: DARK, display: "block", marginBottom: 20 }}>Solutions</span>
                {["Presence Analytics", "Passive Loyalty", "Venue Intelligence", "Proximity Offers"].map(s => (
                  <a key={s} href="#solutions" onClick={close} style={{ display: "block", fontSize: "clamp(1.1rem, 2vw, 1.7rem)", color: DARK, textDecoration: "none", padding: "6px 0", opacity: 0.7 }}>↳ {s}</a>
                ))}
              </div>
              <div>
                <a href="#audience" onClick={close} style={{ fontSize: "clamp(2.25rem, 4.5vw, 3rem)", fontWeight: 600, color: DARK, textDecoration: "none", display: "block", marginBottom: 32 }}>Built for</a>
                <a href="#cta" onClick={close} style={{ fontSize: "clamp(2.25rem, 4.5vw, 3rem)", fontWeight: 600, color: DARK, textDecoration: "none", display: "block" }}>Contact</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */

function HeroMain() {
  return (
    <section data-nav-theme="light" style={{ background: "#000000", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", padding: "clamp(6rem, 12vh, 10rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vh, 5rem)" }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }}>
        <div style={{
          fontSize: "clamp(2.5rem, 12vw, 21rem)",
          fontWeight: 700, lineHeight: 0.85, letterSpacing: "0.02em",
          color: GRAY, fontFamily: DISPLAY,
        }}>
          The Presence Layer.
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        style={{
          fontSize: "clamp(1rem, 3vw, 2.4rem)",
          fontWeight: 400, lineHeight: 1.35, color: GRAY,
          marginTop: "clamp(2rem, 5vh, 4rem)", fontFamily: DISPLAY,
        }}
      >
        <div>Real-world presence data, captured wherever it happens.</div>
        <div>From physical space to on-chain proof.</div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SIDEBAR (desktop only)
   ═══════════════════════════════════════════ */

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const SOL_LEN = 44;
const PROOF_COUNT = 12;

function genStaticAddrs() {
  const addrs: string[] = [];
  for (let i = 0; i < PROOF_COUNT; i++) {
    let s = "";
    for (let j = 0; j < SOL_LEN; j++) s += BASE58[Math.floor(Math.random() * 58)];
    addrs.push(s);
  }
  return addrs;
}

function Sidebar() {
  const [proofAddrs, setProofAddrs] = useState(() => genStaticAddrs());
  const [newestIdx, setNewestIdx] = useState(-1);

  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      let s = "";
      for (let j = 0; j < SOL_LEN; j++) s += BASE58[Math.floor(Math.random() * 58)];
      setProofAddrs(prev => [s, ...prev.slice(0, PROOF_COUNT - 1)]);
      setNewestIdx(++tick);
      setTimeout(() => setNewestIdx(-1), 200);
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, minHeight: "100vh" }}>
      <div style={{ height: 72, flexShrink: 0 }} />
      <div style={{ background: GRAY, padding: "clamp(2rem, 3vw, 3rem) clamp(1.2rem, 2vw, 2rem)", flex: "1 1 auto", display: "flex", alignItems: "center" }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
          style={{ fontSize: "clamp(1.5rem, 2.1vw, 1.95rem)", fontWeight: 400, lineHeight: 1.4, color: DARK, fontFamily: DISPLAY }}>
          Powering verifiable presence proofs for communities, DAOs, and on-chain protocols.
        </motion.p>
      </div>
      <div style={{ background: DARK, padding: "clamp(1.5rem, 2.5vw, 2rem) clamp(1.2rem, 2vw, 2rem)", flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 16 }}>System Status</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(229,229,229,0.6)", lineHeight: 2, textTransform: "uppercase" as const, letterSpacing: "0.03em" }}>
          {["01. Bluetooth Mesh","02. Presence Engine","03. Signal Verify","04. Proof Generator","05. Chain Writer","06. Privacy Layer","07. Analytics Core","08. Venue Registry","09. Node Discovery","10. Reward Protocol"].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{item}</span>
              <motion.span animate={{ color: ["#ffffff", "#666666", "#ffffff"] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} style={{ fontSize: 7 }}>●</motion.span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: DARK, padding: "clamp(1.5rem, 2.5vw, 2rem) clamp(1.2rem, 2vw, 2rem)", flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 16 }}>Protocol Metrics</div>
        {[{ label: "Events", value: "30" },{ label: "Presence Proofs", value: "33,235" },{ label: "Venues Live", value: "2" },{ label: "Beacons Deployed", value: "69" },{ label: "Uptime", value: "99.9%" }].map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.03em", padding: "6px 0", borderBottom: "1px solid rgba(229,229,229,0.06)" }}>
            <span style={{ color: "rgba(229,229,229,0.45)" }}>{m.label}</span>
            <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 11 }}>{m.value}</span>
          </div>
        ))}
      </div>
      <div style={{ background: DARK, padding: "clamp(1.5rem, 2.5vw, 2rem) clamp(1.2rem, 2vw, 2rem)", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 16 }}>Presence Proofs</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, fontFamily: MONO, fontSize: 10, color: "rgba(229,229,229,0.6)", lineHeight: 1.7, letterSpacing: "0.12em", overflow: "hidden" }}>
          <div style={{ overflow: "hidden", textAlign: "left" }}>
            {proofAddrs.slice(0, PROOF_COUNT / 2).map((addr, i) => (
              <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: i === 0 && newestIdx !== -1 ? "#ffffff" : undefined, transition: "color 0.2s ease" }}>{addr}</div>
            ))}
          </div>
          <div style={{ overflow: "hidden", textAlign: "right" }}>
            {proofAddrs.slice(PROOF_COUNT / 2).map((addr, i) => (
              <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{addr}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: DARK, padding: "clamp(2rem, 3vw, 3rem) clamp(1.2rem, 2vw, 2rem)", flexShrink: 0 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(229,229,229,0.3)", lineHeight: 1.8 }}>
          Built for the physical world. Verified on-chain. Privacy by default.
        </p>
        <div style={{ marginTop: 16, fontFamily: MONO, fontSize: 9, color: "rgba(229,229,229,0.2)" }}>© 2026 biq protocol</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INSIGHTS
   ═══════════════════════════════════════════ */

function InsightsSection() {
  return (
    <section data-nav-theme="dark" style={{ background: "linear-gradient(180deg, #f7a027, #d946ef, #00c6ff)", position: "relative", overflow: "hidden" }}>
      {[
        { color: "#f7a027", size: "140%", x: "-20%", y: "-10%", dur: "8s", delay: "0s" },
        { color: "#ff47d1", size: "120%", x: "30%", y: "15%", dur: "10s", delay: "-3s" },
        { color: "#d946ef", size: "130%", x: "-10%", y: "40%", dur: "12s", delay: "-5s" },
        { color: "#00c6ff", size: "140%", x: "20%", y: "60%", dur: "9s", delay: "-2s" },
        { color: "#00d4aa", size: "110%", x: "-15%", y: "80%", dur: "11s", delay: "-7s" },
        { color: "#f7a027", size: "120%", x: "25%", y: "95%", dur: "10s", delay: "-4s" },
      ].map((blob, i) => (
        <motion.div key={i}
          animate={{ x: [blob.x, `${parseFloat(blob.x) + 30}%`, `${parseFloat(blob.x) - 15}%`, blob.x], y: [blob.y, `${parseFloat(blob.y) - 12}%`, `${parseFloat(blob.y) + 8}%`, blob.y], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: parseFloat(blob.dur), repeat: Infinity, ease: "easeInOut", delay: parseFloat(blob.delay) }}
          style={{ position: "absolute", width: blob.size, height: blob.size, borderRadius: "50%", background: `radial-gradient(circle, ${blob.color} 0%, transparent 60%)`, filter: "blur(20px)", opacity: 1 }}
        />
      ))}

      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr", gap: 1 }}>
        <div className="insights-featured" style={{ background: `linear-gradient(135deg, #666 0%, #999 100%)`, minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(1.5rem, 4vw, 3rem)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))" }} />
          <div style={{ position: "relative" }}>
            <h3 style={{ fontSize: "clamp(1.5rem, 3.3vw, 3rem)", fontWeight: 600, color: WHITE, lineHeight: 1.2, marginBottom: 16, fontFamily: DISPLAY }}>
              One app install. Every location. Forever.
            </h3>
            <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>March 2026</p>
            <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.03em", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: "100%" }}>
              Lightweight, always-on presence verification for every event, every venue, every time you show up.
            </p>
          </div>
        </div>

        <div className="insights-3-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          {[
            { title: "No Friction", desc: "No QR codes. No wristbands. No check-ins.\nJust show up and keep doing your thing — biq handles the rest in the background." },
            { title: "Tamper-Proof", desc: "Impossible to fake. Built to be trusted.\nPresence data verified through Bluetooth mesh — no spoofs, no workarounds, no bad data." },
            { title: "Privacy First", desc: "No GPS. No tracking. No identity exposed.\nZK-proven and cryptographically anonymized — your presence is verified, never your location." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ background: GRAY, padding: "clamp(3rem, 6vw, 8rem) clamp(1.5rem, 2.5vw, 2rem) clamp(1.5rem, 2.5vw, 2rem)", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                <h4 style={{ fontSize: "clamp(1.25rem, 2.1vw, 1.95rem)", fontWeight: 600, color: DARK, lineHeight: 1.25, marginBottom: 12, fontFamily: DISPLAY }}>{item.title}</h4>
                <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.03em", color: "rgba(32,32,32,0.45)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SOLUTIONS — 4 product cards
   Desktop: 4 in a row
   Tablet: 2×2
   Mobile: stacked vertically
   ═══════════════════════════════════════════ */

const solutions = [
  { title: "Presence\nAnalytics", desc: "Who shows up, when, how often.\nNo tracking, no surveillance.\nGoogle Analytics for the physical world.", detail: "Imagine having the same depth of insight you get from web analytics — but for the physical world. biq turns every venue into a data-rich environment where you can see how many people showed up, when they arrived, how long they stayed, and whether they came back. All without cameras, sign-ins, or surveillance. The Bluetooth mesh captures anonymous presence signals that are aggregated into clean, actionable dashboards. You see trends, not individuals. Patterns, not identities. It's Google Analytics — rebuilt from the ground up for real-world spaces, privacy-first, on-chain verified.", Art: AnalyticsArt, bg: WHITE },
  { title: "Passive\nLoyalty", desc: "Show up, get rewarded. Automatically.\nOn-chain loyalty without stamps or cards.\nNo friction, no extra steps.", detail: "Traditional loyalty programs are broken. Customers forget cards, delete apps, and lose points. biq flips the model: just show up. The Bluetooth mesh detects presence automatically, and smart contracts reward consistency on-chain. No app downloads. No QR scans. No friction. A coffee shop regular gets recognized after their fifth visit. A gym member earns tokens for consistent attendance. A festival-goer unlocks exclusive perks for being there every year. The rewards are composable — they can be traded, stacked, or used across any protocol that reads presence proofs.", Art: LoyaltyArt, bg: WHITE },
  { title: "Venue\nIntelligence", desc: "Peak hours, dwell time, heat maps.\nReal-time foot traffic insights.\nZero GPS, zero surveillance.", detail: "Understanding foot traffic has always required expensive hardware, invasive tracking, or unreliable estimates. biq changes that completely. Using the ambient Bluetooth mesh formed by smartphones, venues can measure peak hours, dwell time, repeat visit rates, and flow patterns — all with zero infrastructure cost. No beacons to install. No cameras to maintain. No GPS permissions to request. The data is anonymous by design: you see that 47 people were present between 2-4pm on Saturday, not who they were. Perfect for retail, events, urban planning, and any space where understanding human flow matters.", Art: TrafficArt, bg: WHITE },
  { title: "Proximity\nOffers", desc: "Presence means intent.\nOffers to people who are there.\nRight place, right moment.", detail: "Location-based advertising has always been creepy. GPS tracking, geofencing, persistent identifiers — users hate it, and regulations are catching up. biq offers something radically different: presence-based relevance without surveillance. When someone is physically present at a venue, they can opt into receiving contextual offers verified by on-chain presence proofs. A person at a music festival sees sponsor offers. A shopper in a mall district gets nearby deals. The proof of presence is anonymous and ephemeral — advertisers know someone is there, not who they are. Higher relevance, zero tracking, full compliance.", Art: AdvertisingArt, bg: WHITE },
];

function SolutionCard({ s, i, onClick }: { s: typeof solutions[number]; i: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={(e) => { e.preventDefault(); onClick(); }}
      style={{
        display: "flex", flexDirection: "column",
        background: s.bg, textDecoration: "none",
        transition: "opacity 0.3s",
        cursor: "pointer",
        borderRight: `1px solid rgba(0,0,0,0.1)`,
        padding: "clamp(1.5rem, 2vw, 2.5rem)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: "clamp(300px, 40vw, 550px)", marginBottom: "clamp(1rem, 2vw, 2rem)", display: "flex", alignItems: "flex-end" }}>
        <s.Art hovered={hovered} />
      </div>
      <h3 style={{ fontSize: "clamp(1.25rem, 2.4vw, 2.25rem)", fontWeight: 600, color: DARK, lineHeight: 1.2, marginBottom: 10, fontFamily: DISPLAY, whiteSpace: "pre-line", letterSpacing: "-0.01em" }}>
        {s.title}
      </h3>
      <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.03em", color: "rgba(32,32,32,0.45)", lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line" }}>
        {s.desc}
      </p>
      <span style={{
        display: "inline-block", width: "fit-content",
        fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        color: hovered ? WHITE : DARK,
        border: `1px solid ${DARK}`,
        borderRadius: 20, padding: "7px 18px",
        background: hovered ? DARK : "none",
        transition: "all 0.3s ease",
      }}>Explore</span>
    </div>
  );
}

function SolutionDetail({ solution, onClose }: { solution: typeof solutions[number]; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      const p = Math.max(0, Math.min(1, el.scrollTop / maxScroll));
      setProgress(p);
      if (p >= 0.98 && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onClose(), 800);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [onClose]);

  const words = solution.detail.split(" ");

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{ position: "fixed", inset: 0, background: WHITE, zIndex: 50, display: "flex", flexDirection: "column" }}
    >
      <div className="solution-detail-grid" style={{
        flex: 1,
        padding: "clamp(6rem, 10vw, 10rem) clamp(1.5rem, 3vw, 3rem) clamp(2rem, 4vw, 6rem)",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "clamp(2rem, 4vw, 4rem)", overflow: "hidden",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: "clamp(1.5rem, 3vw, 3rem)",
          background: "none", border: `1px solid ${DARK}`, borderRadius: 24,
          padding: "8px 18px", cursor: "pointer",
          fontFamily: MONO, fontSize: 11, textTransform: "uppercase" as const,
          letterSpacing: "0.08em", color: DARK, zIndex: 20, transition: "all 0.3s",
        }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = DARK; (e.target as HTMLElement).style.color = WHITE; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = "none"; (e.target as HTMLElement).style.color = DARK; }}
        >✕ Close</button>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 6vw, 4.8rem)", fontWeight: 600, color: DARK,
            lineHeight: 1.1, fontFamily: DISPLAY, letterSpacing: "-0.02em",
            marginBottom: "clamp(1.5rem, 3vw, 3rem)", whiteSpace: "pre-line",
          }}>
            {solution.title}
          </h2>
          <div style={{
            fontSize: "clamp(1rem, 2.5vw, 2.2rem)", fontWeight: 500, fontFamily: DISPLAY,
            lineHeight: 1.5, letterSpacing: "-0.01em",
          }}>
            {words.map((word, i) => (
              <span key={i} style={{ color: (i / words.length) < progress ? DARK : "rgba(32,32,32,0.15)", transition: "color 0.15s ease" }}>
                {word}{" "}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "clamp(4rem, 8vw, 10rem)" }}>
          <solution.Art hovered={true} />
        </div>
      </div>

      <div ref={scrollRef} style={{ position: "absolute", inset: 0, overflowY: "auto", scrollbarWidth: "none", zIndex: 12 }}>
        <div style={{ height: "400vh", pointerEvents: "none" }} />
      </div>
    </motion.div>
  );
}

function SolutionsSection() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section id="solutions" data-nav-theme="dark" style={{
      background: WHITE,
      padding: "clamp(3rem, 8vw, 10rem) clamp(1rem, 3vw, 3rem) clamp(2rem, 4vw, 6rem)",
    }}>
      <FadeIn>
        <h2 style={{ fontSize: "clamp(2rem, 6vw, 4.8rem)", fontWeight: 600, color: DARK, lineHeight: 1.1, fontFamily: DISPLAY, letterSpacing: "-0.02em", marginBottom: "clamp(1.5rem, 3vw, 3rem)" }}>
          What presence unlocks
        </h2>
      </FadeIn>

      {/* 4 separate divs in a CSS grid — responsive via index.css */}
      <div className="grid-4-col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
        {solutions.map((s, i) => (
          <SolutionCard key={s.title} s={s} i={i} onClick={() => setActiveIdx(i)} />
        ))}
      </div>

      <AnimatePresence>
        {activeIdx !== null && (
          <SolutionDetail key={activeIdx} solution={solutions[activeIdx]} onClose={() => setActiveIdx(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WHO IT'S FOR
   ═══════════════════════════════════════════ */

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";

function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (active) {
      const chars = [...text];
      const total = chars.length;
      const duration = 600;
      const start = performance.now();
      frameRef.current = 0;
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const resolved = Math.floor(progress * total);
        const result = chars.map((ch, i) => {
          if (ch === " ") return " ";
          if (i < resolved) return ch;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join("");
        setDisplay(result);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      setDisplay(text);
    }
  }, [active, text]);

  return <>{display}</>;
}

function AudienceRow({ segment, desc }: { segment: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="audience-row"
      style={{
        borderTop: `1px solid rgba(0,0,0,0.1)`,
        padding: "clamp(1rem, 1.5vw, 1.5rem) clamp(0.5rem, 1vw, 1rem)",
        display: "grid", gridTemplateColumns: "25% 1fr", gap: "0.5rem",
        alignItems: "baseline", cursor: "default",
        background: hovered ? "rgba(0,0,0,0.05)" : "transparent",
        transition: "background 0.3s ease",
      }}
    >
      <span style={{ fontSize: "clamp(1.1rem, 2.4vw, 1.95rem)", fontWeight: 600, color: DARK, fontFamily: DISPLAY }}>{segment}</span>
      <motion.span
        animate={{ fontSize: hovered ? 16 : 10, color: hovered ? "rgba(32,32,32,0.8)" : "rgba(32,32,32,0.45)" }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ fontFamily: MONO, textTransform: "uppercase" as const, letterSpacing: "0.03em", lineHeight: 1.6, textAlign: "left" }}
      ><ScrambleText text={desc} active={hovered} /></motion.span>
    </div>
  );
}

function AudienceSection() {
  const audiences = [
    { segment: "Communities", desc: "Reward the ones who keep showing up. Build on-chain proof of participation that grows with every meeting, every gathering, every event your community hosts." },
    { segment: "DAOs", desc: "Verify contributor attendance and let presence speak louder than votes. Govern by who actually shows up — and reward them for it." },
    { segment: "Events & Festivals", desc: "Frictionless proof-of-attendance for every stage, every talk, every afterparty. No QR codes, no wristbands, no interruptions — just verified presence." },
    { segment: "Smart Cities", desc: "Enable presence-based services, access control, and civic governance without cameras, GPS, or surveillance. Privacy-first infrastructure for public spaces." },
    { segment: "Next-Gen Commerce", desc: "Trigger discounts, unlocks, and loyalty rewards the moment someone walks in. No check-ins, no scans — just presence, verified and on-chain." },
  ];

  return (
    <section id="audience" data-nav-theme="dark" style={{ background: GRAY, padding: "clamp(3rem, 8vw, 10rem) clamp(1rem, 3vw, 3rem) clamp(2rem, 4vw, 6rem)" }}>
      <FadeIn>
        <h2 style={{ fontSize: "clamp(2rem, 6vw, 4.8rem)", fontWeight: 600, color: DARK, lineHeight: 1.1, fontFamily: DISPLAY, letterSpacing: "-0.02em", marginBottom: "clamp(1.5rem, 3vw, 3rem)" }}>
          Built for
        </h2>
      </FadeIn>
      {audiences.map((a, i) => (
        <FadeIn key={a.segment} delay={i * 0.06}>
          <AudienceRow segment={a.segment} desc={a.desc} />
        </FadeIn>
      ))}
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════ */

const INPUT_STYLE: React.CSSProperties = {
  background: GRAY, border: "none", outline: "none", borderRadius: 6,
  padding: "14px 16px", fontSize: 11, fontFamily: MONO,
  textTransform: "uppercase", letterSpacing: "0.06em", color: DARK,
  width: "100%",
};

function CtaSection() {
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", company: "", jobTitle: "", subject: "General Inquiry", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => { e.preventDefault(); if (email.trim()) setShowForm(true); };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${formData.firstName} ${formData.lastName}%0AEmail: ${email}%0ACompany: ${formData.company}%0AJob Title: ${formData.jobTitle}%0ASubject: ${formData.subject}%0A%0A${formData.message}`;
    window.location.href = `mailto:connect@biq.me?subject=${encodeURIComponent(formData.subject)}&body=${body}`;
    setFormSubmitted(true);
    setTimeout(() => { setFormSubmitted(false); setShowForm(false); setEmail(""); setFormData({ firstName: "", lastName: "", company: "", jobTitle: "", subject: "General Inquiry", message: "" }); }, 4000);
  };
  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <section id="cta" data-nav-theme="light" onClick={() => showForm && setShowForm(false)} style={{
      background: DARK, minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      padding: "clamp(3rem, 8vw, 10rem) clamp(1rem, 3vw, 3rem)",
      borderTop: `1px solid ${GRAY}`,
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%" }}>
        <FadeIn>
          <h2 style={{ fontSize: "clamp(1.8rem, 6.75vw, 5.25rem)", fontWeight: 600, color: GRAY, textAlign: "center", lineHeight: 1.1, fontFamily: DISPLAY, letterSpacing: "-0.03em" }}>
            Let's talk presence.
          </h2>
        </FadeIn>

        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div key="email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <FadeIn delay={0.15}>
                <form onSubmit={handleEmailSubmit} style={{ marginTop: "clamp(2rem, 5vh, 4rem)", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "clamp(1.5rem, 4vw, 3.4rem)", color: GRAY, fontWeight: 300, fontFamily: DISPLAY }}>
                    <span>(</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required aria-label="Email address"
                      style={{ background: "none", border: "none", outline: "none", fontSize: "clamp(0.9rem, 2.4vw, 1.8rem)", fontFamily: DISPLAY, fontWeight: 400, color: GRAY, width: "clamp(140px, 50vw, 300px)", textAlign: "center", borderBottom: `1px solid rgba(229,229,229,0.3)`, paddingBottom: 4 }}
                    />
                    <span>)</span>
                  </div>
                  <div style={{ marginTop: 28 }}>
                    <button type="submit" style={{
                      fontFamily: MONO, fontSize: 10, textTransform: "uppercase" as const,
                      letterSpacing: "0.08em", color: GRAY,
                      border: `1px solid ${GRAY}`, borderRadius: 20, padding: "9px 24px",
                      background: "none", cursor: "pointer", transition: "all 0.3s",
                    }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.background = GRAY; (e.target as HTMLElement).style.color = DARK; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.background = "none"; (e.target as HTMLElement).style.color = GRAY; }}
                    >Continue</button>
                  </div>
                </form>
              </FadeIn>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: EASE }}
              onClick={e => e.stopPropagation()}
              className="cta-form-container"
              style={{ marginTop: "clamp(2rem, 4vh, 3rem)", width: "min(50vw, 90%)", background: "rgba(229,229,229,0.08)", borderRadius: 12, padding: "clamp(1.5rem, 3vw, 3rem)" }}
            >
              <h3 style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 500, color: GRAY, fontFamily: DISPLAY, marginBottom: "clamp(1rem, 2vw, 2.5rem)", textAlign: "center" }}>
                Perfect. Just a few more questions so we can route your inquiry.
              </h3>
              {formSubmitted ? (
                <p style={{ textAlign: "center", color: GRAY, fontFamily: DISPLAY, fontSize: 24, padding: "3rem 0" }}>Sent! We'll be in touch.</p>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="cta-form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input style={INPUT_STYLE} placeholder="FIRST NAME" value={formData.firstName} onChange={e => updateField("firstName", e.target.value)} required />
                    <input style={INPUT_STYLE} placeholder="LAST NAME" value={formData.lastName} onChange={e => updateField("lastName", e.target.value)} required />
                  </div>
                  <div className="cta-form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input style={INPUT_STYLE} placeholder="COMPANY / AGENCY" value={formData.company} onChange={e => updateField("company", e.target.value)} />
                    <input style={INPUT_STYLE} placeholder="JOB TITLE" value={formData.jobTitle} onChange={e => updateField("jobTitle", e.target.value)} />
                  </div>
                  <select style={{ ...INPUT_STYLE, appearance: "auto" as any }} value={formData.subject} onChange={e => updateField("subject", e.target.value)}>
                    <option>General Inquiry</option><option>Partnership</option><option>Integration</option><option>Investment</option><option>Press</option>
                  </select>
                  <textarea style={{ ...INPUT_STYLE, minHeight: 120, resize: "vertical" as const }} placeholder="OPTIONAL MESSAGE" value={formData.message} onChange={e => updateField("message", e.target.value)} />
                  <button type="submit" style={{
                    background: GRAY, color: DARK, border: "none", borderRadius: 30,
                    padding: "14px 0", fontSize: 11, fontFamily: MONO,
                    textTransform: "uppercase" as const, letterSpacing: "0.08em",
                    cursor: "pointer", width: "100%", marginTop: 8, transition: "all 0.3s",
                  }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = WHITE; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = GRAY; }}
                  >Submit</button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="cta-contact-links" style={{ marginTop: "auto", paddingTop: "clamp(2rem, 4vw, 6rem)", width: "100%", borderTop: `1px solid rgba(229,229,229,0.15)`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "clamp(16px, 3vw, 40px)" }}>
        <a href="mailto:connect@biq.me" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none", color: GRAY }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(229,229,229,0.5)", marginBottom: 4 }}>Email</div>
            <span style={{ fontSize: "clamp(14px, 2.5vw, 24px)", fontWeight: 500, fontFamily: DISPLAY }}>connect@biq.me</span>
          </div>
        </a>
        <a href="https://x.com/biqProtocol" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none", color: GRAY }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(229,229,229,0.5)", marginBottom: 4 }}>X Official Account</div>
            <span style={{ fontSize: "clamp(14px, 2.5vw, 24px)", fontWeight: 500, fontFamily: DISPLAY }}>@biqProtocol</span>
          </div>
        </a>
        <a href="https://t.me/r0b0sapiens" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none", color: GRAY }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(229,229,229,0.5)", marginBottom: 4 }}>CEO Telegram</div>
            <span style={{ fontSize: "clamp(14px, 2.5vw, 24px)", fontWeight: 500, fontFamily: DISPLAY }}>@r0b0sapiens</span>
          </div>
        </a>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */

function Footer() {
  return (
    <footer style={{ background: CORAL, paddingBottom: 20, borderTop: `1px solid ${GRAY}` }} role="contentinfo">
      <div style={{ lineHeight: 1.1, paddingTop: 30, textAlign: "center", overflow: "visible" }}>
        <div className="footer-brand" style={{
          fontSize: "clamp(2rem, 11.5vw, 20rem)",
          fontWeight: 800, fontFamily: DISPLAY,
          letterSpacing: "0.05em", userSelect: "none",
          background: "linear-gradient(90deg, #f7a027, #d946ef, #00c6ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", color: "transparent",
          display: "inline-block",
        } as React.CSSProperties}>
          BIQ PROTOCOL
        </div>
      </div>

      {/* Legal */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", padding: "12px clamp(1rem, 3vw, 3rem) 0", fontFamily: MONO, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: DARK }}>
        <span>© 2026 biq protocol</span>
        <a href="#" style={{ color: DARK, textDecoration: "none" }}>Privacy Policy</a>
        <a href="#" style={{ color: DARK, textDecoration: "none" }}>Terms of Use</a>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   MOBILE SIDEBAR
   ═══════════════════════════════════════════ */

function MobileSidebarInline() {
  return (
    <div data-nav-theme="light" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ background: DARK, padding: "clamp(1.5rem, 4vw, 2rem)" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 16 }}>System Status</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(229,229,229,0.6)", lineHeight: 2, textTransform: "uppercase" as const, letterSpacing: "0.03em", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          {["01. Bluetooth Mesh","02. Presence Engine","03. Signal Verify","04. Proof Generator","05. Chain Writer","06. Privacy Layer","07. Analytics Core","08. Venue Registry"].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{item}</span>
              <span style={{ color: CORAL, fontSize: 7 }}>●</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: DARK, padding: "clamp(1.5rem, 4vw, 2rem)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[{ label: "Active Nodes", value: "12,847" },{ label: "Proofs / 24h", value: "1.2M" },{ label: "Venues Live", value: "3,219" }].map((m, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.03em", color: "rgba(229,229,229,0.4)", marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: CORAL }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   Desktop: 75/25 split with custom scroll container
   Mobile: simple stacked page with native scroll
   ═══════════════════════════════════════════ */

export function Solutions() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const pageRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const navLight = useNavTheme(isMobile ? undefined : pageRef);

  useEffect(() => {
    document.body.style.margin = "0";
  }, []);

  // Sync sidebar scroll (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const pageEl = pageRef.current;
    const sideEl = sideRef.current;
    const splitEl = splitRef.current;
    if (!pageEl || !sideEl || !splitEl) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const sideMax = sideEl.scrollHeight - sideEl.clientHeight;
        if (sideMax <= 0) return;
        const scrollableInSplit = splitEl.offsetHeight - window.innerHeight;
        if (scrollableInSplit <= 0) { sideEl.scrollTop = 0; return; }
        const progress = Math.min(Math.max(pageEl.scrollTop / scrollableInSplit, 0), 1);
        sideEl.scrollTop = Math.round(progress * sideMax);
      });
    };
    pageEl.addEventListener("scroll", onScroll, { passive: true });
    return () => pageEl.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  /* ── MOBILE: normal page, native browser scroll ── */
  if (isMobile) {
    return (
      <div style={{ background: CORAL, fontFamily: DISPLAY, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" } as React.CSSProperties}>
        <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} light={navLight} />
        <HeroMain />
        <InsightsSection />
        <SolutionsSection />
        <AudienceSection />
        <CtaSection />
        <Footer />
      </div>
    );
  }

  /* ── DESKTOP: custom scroll container with 75/25 split ── */
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div ref={pageRef} style={{
        flex: 1, height: "100vh", overflowY: "auto", overflowX: "hidden",
        scrollbarWidth: "none", fontFamily: DISPLAY,
        WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
      } as React.CSSProperties}>
        <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} light={navLight} />
        <div ref={splitRef} style={{ display: "flex", background: "linear-gradient(180deg, #f7a027, #d946ef, #00c6ff)", gap: 1 }}>
          <div style={{ width: "75%", flexShrink: 0 }}>
            <HeroMain />
            <InsightsSection />
          </div>
          <div ref={sideRef} style={{ width: "25%", position: "sticky", top: 0, height: "100vh", alignSelf: "flex-start", overflowY: "hidden", overflowX: "hidden", scrollbarWidth: "none" }}>
            <Sidebar />
          </div>
        </div>
        <SolutionsSection />
        <AudienceSection />
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}
