import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { Sun, Thermometer, MapPin, Truck, Users, Sprout, Phone, MessageSquare, CheckCircle2, ChevronRight, Gauge, Leaf, Building2 } from "lucide-react";

/* ---------------------------------------------------------
   DESIGN TOKENS
   Palette:
     --frost   #EEF3F0  (cold-room paper)
     --ink     #16241B  (deep field-ledger green-black)
     --solar   #E8A33D  (solar amber — primary accent)
     --tomato  #C1442D  (mandi crate red — secondary accent)
     --chill   #3D7A8C  (cold-chain blue — tertiary accent)
     --paper   #FAF8F2  (card surface)
     --line    #D8D2C2  (hairline)
   Type:
     Display: "Fraunces" (ledger/certificate character)
     Body:    "Inter"
     Utility/data: "IBM Plex Mono" (temperature & SMS readouts)
--------------------------------------------------------- */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`;

const TOKENS = {
  frost: "#EEF3F0",
  ink: "#16241B",
  solar: "#E8A33D",
  tomato: "#C1442D",
  chill: "#3D7A8C",
  paper: "#FAF8F2",
  line: "#D8D2C2",
  inkSoft: "#4C5B4F",
};

const UNITS = [
  { id: "U-SHR-01", village: "Sehore Cluster A", district: "Sehore, MP", capacityT: 8, tempC: 4, utilization: 0.78, crops: ["Tomato", "Onion"] },
  { id: "U-SHR-02", village: "Ashta Panchayat", district: "Sehore, MP", capacityT: 6, tempC: 5, utilization: 0.61, crops: ["Onion", "Leafy Greens"] },
  { id: "U-BHP-01", village: "Berasia Road", district: "Bhopal, MP", capacityT: 10, tempC: 3, utilization: 0.85, crops: ["Tomato", "Leafy Greens"] },
  { id: "U-VID-01", village: "Vidisha Cluster", district: "Vidisha, MP", capacityT: 5, tempC: 5, utilization: 0.42, crops: ["Onion"] },
];

const RATE_PER_TONNE_DAY = 22; // INR, pay-per-use

const PHASE_DATA = [
  { phase: "Pilot\n(M0–6)", units: 4, farmers: 260, districts: 1, spoilage: 21, utilization: 63, retention: 71 },
  { phase: "Expansion\n(M6–18)", units: 27, farmers: 3400, districts: 6, spoilage: 27, utilization: 68, retention: 76 },
  { phase: "Full-scale\n(M18–36)", units: 92, farmers: 14800, districts: 19, spoilage: 33, utilization: 74, retention: 81 },
];

const SPOILAGE_TREND = [
  { month: "M1", withoutKC: 24, withKC: 24 },
  { month: "M3", withoutKC: 25, withKC: 18 },
  { month: "M6", withoutKC: 23, withKC: 12 },
  { month: "M9", withoutKC: 26, withKC: 9 },
  { month: "M12", withoutKC: 24, withKC: 7 },
];

const CROP_SPLIT = [
  { name: "Tomato", value: 44, color: TOKENS.tomato },
  { name: "Onion", value: 33, color: TOKENS.solar },
  { name: "Leafy Greens", value: 15, color: "#5A8F5E" },
  { name: "Dairy (off-season)", value: 8, color: TOKENS.chill },
];

const USER_TYPES = [
  { icon: Sprout, label: "Smallholder Farmer", desc: "<2 ha, tomato/onion/leafy veg", tag: "Primary" },
  { icon: Building2, label: "FPO / Aggregator", desc: "Bulk produce for mandi", tag: "Secondary" },
  { icon: Users, label: "Unit Operator", desc: "Local franchise, rural livelihood", tag: "Enabling" },
];

function fmtINR(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/* ---------------------------------------------------------
   SHARED UI ATOMS
--------------------------------------------------------- */

function Eyebrow({ children, color = TOKENS.chill }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        fontWeight: 600,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function StatBadge({ value, label, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 600, color, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: TOKENS.inkSoft, maxWidth: 180 }}>
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   NAV
--------------------------------------------------------- */

function TopNav({ tab, setTab }) {
  const items = [
    { id: "overview", label: "Overview" },
    { id: "book", label: "Book a Slot" },
    { id: "dashboard", label: "Impact Dashboard" },
  ];
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(250,248,242,0.92)",
        backdropFilter: "blur(6px)",
        borderBottom: `1px solid ${TOKENS.line}`,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: TOKENS.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={16} color={TOKENS.solar} />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: TOKENS.ink, letterSpacing: "-0.01em" }}>
            KhetCool
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: TOKENS.inkSoft, border: `1px solid ${TOKENS.line}`, borderRadius: 20, padding: "2px 8px" }}>
            live demo
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, background: "#fff", border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 3 }}>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 14px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: tab === it.id ? TOKENS.ink : "transparent",
                color: tab === it.id ? TOKENS.paper : TOKENS.inkSoft,
                transition: "all 0.15s ease",
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   OVERVIEW TAB
--------------------------------------------------------- */

function TempDial({ tempC = 4 }) {
  // simple radial gauge from -2C to 10C
  const min = -2, max = 10;
  const pct = Math.max(0, Math.min(1, (tempC - min) / (max - min)));
  const angle = -120 + pct * 240;
  return (
    <svg viewBox="0 0 200 140" width="100%" height="100%">
      <path d="M 30 110 A 70 70 0 1 1 170 110" fill="none" stroke={TOKENS.line} strokeWidth="14" strokeLinecap="round" />
      <path
        d="M 30 110 A 70 70 0 1 1 170 110"
        fill="none"
        stroke={TOKENS.chill}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${pct * 314} 314`}
      />
      <g transform={`rotate(${angle} 100 110)`}>
        <line x1="100" y1="110" x2="100" y2="52" stroke={TOKENS.ink} strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="110" r="6" fill={TOKENS.ink} />
      <text x="100" y="95" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="22" fontWeight="600" fill={TOKENS.ink}>
        {tempC}°C
      </text>
    </svg>
  );
}

function Overview({ goBook }) {
  return (
    <div>
      {/* HERO */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 20px 40px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "center" }}
        className="hero-grid">
        <div>
          <Eyebrow color={TOKENS.tomato}>Project → Portfolio · Innovation Journey</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.04, color: TOKENS.ink, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Cold storage that meets the farmer at the village gate.
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16.5, lineHeight: 1.6, color: TOKENS.inkSoft, maxWidth: 480, margin: "0 0 26px" }}>
            A decentralized network of solar-powered, pay-per-use cold rooms placed at village-cluster level —
            so smallholder farmers can hold perishable produce instead of selling in distress right after harvest.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={goBook} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, background: TOKENS.ink, color: TOKENS.paper, border: "none", borderRadius: 9, padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              Book a storage slot <ChevronRight size={15} />
            </button>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: TOKENS.inkSoft, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${TOKENS.line}`, borderRadius: 9, padding: "0 14px" }}>
              <Phone size={13} /> Also bookable via SMS / IVR — no smartphone needed
            </div>
          </div>
        </div>

        {/* signature: live unit gauge card */}
        <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 16, padding: 20, boxShadow: "0 1px 0 rgba(22,36,27,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <Eyebrow>Unit U-BHP-01 · Berasia Road</Eyebrow>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: TOKENS.ink, fontWeight: 600 }}>Live cold-room status</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 8, background: "#5A8F5E", marginTop: 6, boxShadow: "0 0 0 4px rgba(90,143,94,0.15)" }} />
          </div>
          <div style={{ height: 130 }}><TempDial tempC={4} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 6 }}>
            <MiniStat icon={Gauge} label="Capacity used" value="85%" />
            <MiniStat icon={Sun} label="Solar uptime" value="98%" />
            <MiniStat icon={Truck} label="Slots today" value="6/8" />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 20px 10px" }}>
        <Eyebrow color={TOKENS.tomato}>The problem</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="two-col">
          <ProblemCard big="86%" text="of India's farmers are smallholders (<2 ha) growing tomato, onion and leafy vegetables — with no cold storage near the farm gate." color={TOKENS.tomato} />
          <ProblemCard big="15–30%" text="of harvested produce is lost to spoilage within 48 hours, forcing distress sales at whatever price a trader offers." color={TOKENS.solar} />
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px 10px" }}>
        <Eyebrow color={TOKENS.chill}>The solution</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="three-col">
          <SolutionCard icon={Sun} title="Modular solar cold rooms" text="5–10 tonne units at panchayat/cluster level. No grid dependency, low running cost." />
          <SolutionCard icon={MessageSquare} title="Pay-per-day, SMS/IVR booking" text="No smartphone or literacy barrier. No upfront capex for the farmer." />
          <SolutionCard icon={Thermometer} title="IoT temperature + FPO linkage" text="Hold stock and sell into better mandi prices instead of selling on day one." />
        </div>
      </section>

      {/* USERS */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px 60px" }}>
        <Eyebrow>Who it's built for</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="three-col">
          {USER_TYPES.map((u) => (
            <div key={u.label} style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: TOKENS.frost, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <u.icon size={17} color={TOKENS.ink} />
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: TOKENS.inkSoft, textTransform: "uppercase", letterSpacing: "0.08em" }}>{u.tag}</span>
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: TOKENS.ink, marginBottom: 4 }}>{u.label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: TOKENS.inkSoft }}>{u.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div style={{ background: TOKENS.frost, borderRadius: 9, padding: "8px 8px", textAlign: "center" }}>
      <Icon size={13} color={TOKENS.chill} style={{ marginBottom: 3 }} />
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, color: TOKENS.ink }}>{value}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, color: TOKENS.inkSoft }}>{label}</div>
    </div>
  );
}

function ProblemCard({ big, text, color }) {
  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 22, display: "flex", gap: 18, alignItems: "center" }}>
      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 42, color, lineHeight: 1 }}>{big}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: TOKENS.inkSoft, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function SolutionCard({ icon: Icon, title, text }) {
  return (
    <div style={{ background: TOKENS.ink, borderRadius: 14, padding: 20 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(232,163,61,0.16)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={16} color={TOKENS.solar} />
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: TOKENS.paper, marginBottom: 6 }}>{title}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(250,248,242,0.7)", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   BOOKING TAB — modeled as the real channel: SMS / IVR thread
--------------------------------------------------------- */

function BookingFlow() {
  const [step, setStep] = useState(0); // 0 unit, 1 crop/qty, 2 duration, 3 confirm
  const [unitId, setUnitId] = useState(UNITS[0].id);
  const [crop, setCrop] = useState("Tomato");
  const [qty, setQty] = useState(2);
  const [days, setDays] = useState(5);
  const [confirmed, setConfirmed] = useState(false);
  const threadEndRef = useRef(null);

  const unit = UNITS.find((u) => u.id === unitId);
  const cost = qty * days * RATE_PER_TONNE_DAY;
  const bookingCode = useMemo(() => "KC" + Math.floor(1000 + Math.random() * 9000), [confirmed]);

  const messages = useMemo(() => {
    const m = [
      { from: "kc", text: "KHETCOOL: Reply with your VILLAGE CODE to check nearest cold-room slot. Free service, no data needed." },
    ];
    if (step >= 0) m.push({ from: "farmer", text: unit ? `${unit.village.split(" ")[0].toUpperCase()}` : "..." });
    if (step >= 1) m.push({ from: "kc", text: `Nearest unit: ${unit.id} (${unit.district}). ${Math.round((1 - unit.utilization) * unit.capacityT * 10) / 10}T free today. Reply CROP + QTY(tonnes), e.g. TOMATO 2` });
    if (step >= 1) m.push({ from: "farmer", text: `${crop.toUpperCase()} ${qty}` });
    if (step >= 2) m.push({ from: "kc", text: `Rate: ₹${RATE_PER_TONNE_DAY}/tonne/day. Reply number of DAYS to store.` });
    if (step >= 2) m.push({ from: "farmer", text: `${days}` });
    if (step >= 3) m.push({ from: "kc", text: `Total: ${fmtINR(cost)} for ${qty}T × ${days} days. Reply YES to confirm booking.` });
    if (confirmed) m.push({ from: "farmer", text: "YES" });
    if (confirmed) m.push({ from: "kc", text: `Booked ✅ Code ${bookingCode}. Bring produce to ${unit.id} anytime today. Show code at drop-off. No app needed.` });
    return m;
  }, [step, unit, crop, qty, days, confirmed, cost, bookingCode]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function reset() {
    setStep(0); setConfirmed(false); setUnitId(UNITS[0].id); setCrop("Tomato"); setQty(2); setDays(5);
  }

  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 20px 70px" }}>
      <Eyebrow color={TOKENS.chill}>Book a slot</Eyebrow>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, color: TOKENS.ink, margin: "0 0 6px" }}>
        Booking is built for a feature phone, not an app.
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: TOKENS.inkSoft, maxWidth: 560, margin: "0 0 30px" }}>
        This is the actual channel a farmer uses in the field — SMS or an IVR call, no login and no data plan.
        Use the controls to build a booking; the thread on the right updates exactly like the real service would.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }} className="book-grid">
        {/* controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <FieldBlock n={1} title="Choose your nearest unit" done={step >= 0}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {UNITS.map((u) => (
                <button key={u.id} onClick={() => { setUnitId(u.id); setStep(1); setConfirmed(false); }}
                  style={{
                    textAlign: "left", cursor: "pointer", borderRadius: 11, padding: 12,
                    border: `1.5px solid ${unitId === u.id ? TOKENS.chill : TOKENS.line}`,
                    background: unitId === u.id ? "rgba(61,122,140,0.06)" : "#fff",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: TOKENS.chill, marginBottom: 4 }}>
                    <MapPin size={11} /> {u.id}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: TOKENS.ink }}>{u.village}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: TOKENS.inkSoft }}>{u.district} · {Math.round((1 - u.utilization) * 100)}% free</div>
                </button>
              ))}
            </div>
          </FieldBlock>

          <FieldBlock n={2} title="Crop & quantity" done={step >= 1}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {unit.crops.map((c) => (
                <button key={c} onClick={() => { setCrop(c); setStep(2); setConfirmed(false); }}
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                    border: `1.5px solid ${crop === c ? TOKENS.tomato : TOKENS.line}`,
                    background: crop === c ? "rgba(193,68,45,0.07)" : "#fff",
                    color: TOKENS.ink,
                  }}>{c}</button>
              ))}
            </div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: TOKENS.inkSoft, display: "block", marginBottom: 6 }}>
              Quantity: <b style={{ color: TOKENS.ink }}>{qty} tonne{qty > 1 ? "s" : ""}</b>
            </label>
            <input type="range" min={1} max={Math.max(2, Math.round(unit.capacityT * (1 - unit.utilization)))} value={qty}
              onChange={(e) => { setQty(Number(e.target.value)); setStep(2); setConfirmed(false); }}
              style={{ width: "100%", accentColor: TOKENS.tomato }} />
          </FieldBlock>

          <FieldBlock n={3} title="Storage duration" done={step >= 2}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: TOKENS.inkSoft, display: "block", marginBottom: 6 }}>
              Duration: <b style={{ color: TOKENS.ink }}>{days} day{days > 1 ? "s" : ""}</b>
            </label>
            <input type="range" min={1} max={21} value={days}
              onChange={(e) => { setDays(Number(e.target.value)); setStep(3); setConfirmed(false); }}
              style={{ width: "100%", accentColor: TOKENS.chill }} />
          </FieldBlock>

          <FieldBlock n={4} title="Confirm booking" done={confirmed}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: TOKENS.inkSoft }}>Estimated cost</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 20, color: TOKENS.ink }}>{fmtINR(cost)}</span>
            </div>
            {!confirmed ? (
              <button onClick={() => setConfirmed(true)} disabled={step < 3}
                style={{
                  width: "100%", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, padding: "12px 0",
                  borderRadius: 10, border: "none", cursor: step < 3 ? "not-allowed" : "pointer",
                  background: step < 3 ? TOKENS.line : TOKENS.solar, color: step < 3 ? TOKENS.inkSoft : TOKENS.ink,
                }}>
                Confirm via SMS reply “YES”
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(90,143,94,0.1)", borderRadius: 10, padding: "10px 12px" }}>
                  <CheckCircle2 size={16} color="#3E7A43" />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: "#2C5A30" }}>Booked · Code {bookingCode}</span>
                </div>
                <button onClick={reset} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: TOKENS.inkSoft, background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
                  New booking
                </button>
              </div>
            )}
          </FieldBlock>
        </div>

        {/* phone / thread */}
        <div style={{ position: "sticky", top: 90, alignSelf: "start" }}>
          <div style={{ background: TOKENS.ink, borderRadius: 22, padding: "14px 10px", boxShadow: "0 12px 30px rgba(22,36,27,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px 10px", borderBottom: "1px solid rgba(250,248,242,0.12)", marginBottom: 10 }}>
              <MessageSquare size={13} color={TOKENS.solar} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: TOKENS.paper }}>SMS thread · KHETCOOL</span>
            </div>
            <div style={{ height: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "2px 4px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.from === "kc" ? "flex-start" : "flex-end" }}>
                  <div style={{
                    maxWidth: "84%", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, lineHeight: 1.5,
                    background: m.from === "kc" ? "rgba(250,248,242,0.09)" : TOKENS.solar,
                    color: m.from === "kc" ? TOKENS.paper : TOKENS.ink,
                    borderRadius: m.from === "kc" ? "3px 12px 12px 12px" : "12px 3px 12px 12px",
                    padding: "8px 10px",
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: TOKENS.inkSoft, textAlign: "center", marginTop: 10 }}>
            Same flow works as a voice IVR call for farmers who prefer not to read SMS.
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldBlock({ n, title, done, children }) {
  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 20, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: done ? "#3E7A43" : TOKENS.line, color: done ? "#fff" : TOKENS.inkSoft,
        }}>
          {done ? "✓" : n}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13.5, color: TOKENS.ink }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD TAB
--------------------------------------------------------- */

function CustomTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: TOKENS.ink, borderRadius: 8, padding: "8px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: TOKENS.paper }}>
      <div style={{ opacity: 0.7, marginBottom: 3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}{suffix}</div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASE_DATA[phaseIdx];

  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 20px 80px" }}>
      <Eyebrow color={TOKENS.tomato}>Impact dashboard</Eyebrow>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, color: TOKENS.ink, margin: "0 0 6px" }}>
        What scaling looks like, phase by phase.
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: TOKENS.inkSoft, maxWidth: 600, margin: "0 0 26px" }}>
        Modeled from the implementation plan's trigger metrics — pilot, expansion, full-scale.
        Select a phase to see projected numbers.
      </p>

      {/* phase selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {PHASE_DATA.map((p, i) => (
          <button key={p.phase} onClick={() => setPhaseIdx(i)}
            style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5, padding: "8px 16px", borderRadius: 20, cursor: "pointer",
              border: `1.5px solid ${phaseIdx === i ? TOKENS.ink : TOKENS.line}`,
              background: phaseIdx === i ? TOKENS.ink : "#fff",
              color: phaseIdx === i ? TOKENS.paper : TOKENS.inkSoft,
            }}>
            {p.phase.replace("\n", " ")}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }} className="four-col">
        <KpiCard icon={Truck} label="Cold-room units live" value={phase.units} color={TOKENS.chill} />
        <KpiCard icon={Users} label="Farmers onboarded" value={phase.farmers.toLocaleString("en-IN")} color={TOKENS.tomato} />
        <KpiCard icon={MapPin} label="Districts covered" value={phase.districts} color={TOKENS.solar} />
        <KpiCard icon={Leaf} label="Spoilage reduction" value={`${phase.spoilage}%`} color="#3E7A43" />
      </div>

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }} className="two-col">
        <ChartCard title="Spoilage rate: with vs. without KhetCool" sub="% of harvested produce lost, over first year of a cluster">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SPOILAGE_TREND} margin={{ left: -18, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="withKC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3E7A43" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3E7A43" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={TOKENS.line} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: TOKENS.inkSoft }} axisLine={{ stroke: TOKENS.line }} tickLine={false} />
              <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip suffix="%" />} />
              <Line type="monotone" dataKey="withoutKC" name="Without KhetCool" stroke={TOKENS.tomato} strokeWidth={2} dot={false} strokeDasharray="4 3" />
              <Area type="monotone" dataKey="withKC" name="With KhetCool" stroke="#3E7A43" fill="url(#withKC)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Produce mix in storage" sub="Share of tonnage across crop types">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CROP_SPLIT} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                {CROP_SPLIT.map((c, i) => <Cell key={i} fill={c.color} stroke={TOKENS.paper} strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip suffix="%" />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", marginTop: 4 }}>
            {CROP_SPLIT.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: c.color, display: "inline-block" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: TOKENS.inkSoft }}>{c.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Units, farmers & utilization across phases" sub="Bars: unit count · Line: utilization rate">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={PHASE_DATA} margin={{ left: -18, right: 10, top: 10 }}>
            <CartesianGrid stroke={TOKENS.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="phase" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10.5, fill: TOKENS.inkSoft }} axisLine={{ stroke: TOKENS.line }} tickLine={false} />
            <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="units" name="Units live" fill={TOKENS.chill} radius={[6, 6, 0, 0]} barSize={46} />
            <Line type="monotone" dataKey="retention" name="Farmer retention %" stroke={TOKENS.tomato} strokeWidth={2.5} dot={{ r: 4, fill: TOKENS.tomato }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: "16px 16px" }}>
      <Icon size={16} color={color} style={{ marginBottom: 10 }} />
      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 24, color: TOKENS.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13.5, color: TOKENS.ink, marginBottom: 2 }}>{title}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: TOKENS.inkSoft, marginBottom: 8 }}>{sub}</div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT
--------------------------------------------------------- */

export default function KhetCoolApp() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ background: TOKENS.frost, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        input[type="range"] { height: 4px; border-radius: 4px; }
        @media (max-width: 760px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .two-col, .three-col, .four-col { grid-template-columns: 1fr !important; }
          .book-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <TopNav tab={tab} setTab={setTab} />
      {tab === "overview" && <Overview goBook={() => setTab("book")} />}
      {tab === "book" && <BookingFlow />}
      {tab === "dashboard" && <Dashboard />}
      <footer style={{ borderTop: `1px solid ${TOKENS.line}`, padding: "20px", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: TOKENS.inkSoft }}>
        KhetCool — Project to Portfolio · Innovation Journey
      </footer>
    </div>
  );
}
