import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// ── Presentation Metadata ──
pptx.author = "SmartOrder AI Team";
pptx.title = "SmartOrder AI — Pitch Deck";
pptx.subject = "AI-Powered Order Automation for Supermarkets & Distributors";
pptx.company = "SmartOrder AI";
pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"

// ── Brand Colors ──
const C = {
  primary: "1E40AF",    // deep blue
  secondary: "3B82F6",  // bright blue
  accent: "D97706",     // amber
  bg: "F8FAFC",         // off-white
  dark: "1E3A8A",       // dark blue
  white: "FFFFFF",
  muted: "94A3B8",      // slate-400
  lightBlue: "DBEAFE",  // blue-100
  green: "10B981",
  red: "EF4444",
};

// ── Helpers ──
const titleBar = (slide, title) => {
  slide.bkgd = C.white;
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.primary } });
  slide.addText(title, {
    x: 0.8, y: 0.35, w: 11.7, h: 0.7,
    fontSize: 28, fontFace: "Plus Jakarta Sans", bold: true, color: C.dark,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.05, w: 2, h: 0.04, fill: { color: C.accent } });
};

const footer = (slide) => {
  slide.addText("SmartOrder AI  |  Confidential", {
    x: 0.8, y: 7.05, w: 5, h: 0.35,
    fontSize: 9, color: C.muted, fontFace: "Plus Jakarta Sans",
  });
};

const bulletSlide = (title, bullets, slideNum) => {
  const slide = pptx.addSlide();
  titleBar(slide, title);
  const items = bullets.map((b, i) => ({
    text: b, options: { bullet: true, fontSize: 16, color: "334155", fontFace: "Plus Jakarta Sans", breakLine: true, paraSpaceAfter: 8 },
  }));
  slide.addText(items, { x: 0.8, y: 1.4, w: 11.5, h: 5.2, valign: "top" });
  footer(slide);
  return slide;
};

// ────────────────────────────────────────
// SLIDE 1 — TITLE
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  s.bkgd = C.primary;
  // Decorative gradient shapes
  s.addShape(pptx.shapes.OVAL, { x: -1, y: -1, w: 4, h: 4, fill: { color: C.secondary, transparency: 80 } });
  s.addShape(pptx.shapes.OVAL, { x: 10.5, y: 4.5, w: 5, h: 5, fill: { color: C.accent, transparency: 80 } });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 5.9, w: 13.33, h: 0.06, fill: { color: C.accent, transparency: 40 } });

  s.addText("SmartOrder AI", {
    x: 1, y: 1.8, w: 11.3, h: 1.2,
    fontSize: 52, fontFace: "Plus Jakarta Sans", bold: true, color: C.white, align: "center",
  });
  s.addText("AI-Powered Order Automation for Supermarkets & Distributors", {
    x: 1.5, y: 3.2, w: 10.3, h: 0.8,
    fontSize: 22, fontFace: "Plus Jakarta Sans", color: "DBEAFE", align: "center",
  });
  s.addText("Turn a paper order sheet into an approved, transmitted order — in under 2 minutes.", {
    x: 2, y: 4.1, w: 9.3, h: 0.6,
    fontSize: 15, fontFace: "Plus Jakarta Sans", italic: true, color: "93C5FD", align: "center",
  });
  s.addText("Confidential  |  2026", {
    x: 0, y: 6.2, w: 13.33, h: 0.4,
    fontSize: 11, color: C.lightBlue, fontFace: "Plus Jakarta Sans", align: "center",
  });
})();

// ────────────────────────────────────────
// SLIDE 2 — THE PROBLEM
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "The Problem");
  s.addText("Supermarkets still run on paper.", {
    x: 0.8, y: 1.4, w: 11.5, h: 0.8,
    fontSize: 22, fontFace: "Plus Jakarta Sans", bold: true, color: C.dark,
  });

  const problems = [
    { label: "Manual re-typing", desc: "Staff spend 10–20 minutes per order manually typing handwritten sheets into ordering portals.", icon: "⌨️" },
    { label: "Transcription errors", desc: "Illegible handwriting and data-entry mistakes cause wrong items, wrong quantities, and stockouts.", icon: "❌" },
    { label: "No audit trail", desc: "Paper sheets get lost. Managers have no visibility into who ordered what or when.", icon: "📄" },
    { label: "Slow distributor handoff", desc: "Orders sit in inboxes or fax machines. Distributors don't know about new orders until hours later.", icon: "⏳" },
  ];

  problems.forEach((p, i) => {
    const y = 2.5 + i * 1.15;
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y, w: 11.5, h: 0.95, fill: { color: C.bg }, rectRadius: 0.1 });
    s.addText(`${p.icon}  ${p.label}`, {
      x: 1.1, y: y + 0.08, w: 3, h: 0.4, fontSize: 14, bold: true, color: C.dark, fontFace: "Plus Jakarta Sans",
    });
    s.addText(p.desc, {
      x: 1.1, y: y + 0.48, w: 10.5, h: 0.38, fontSize: 12, color: "475569", fontFace: "Plus Jakarta Sans",
    });
  });
  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 3 — THE SOLUTION
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "The Solution");
  s.addText("SmartOrder AI automates the entire order lifecycle — from paper to distributor — with AI vision and intelligent defaults.", {
    x: 0.8, y: 1.4, w: 11.5, h: 0.9,
    fontSize: 18, fontFace: "Plus Jakarta Sans", color: "475569",
  });

  const steps = [
    { num: "1", title: "Capture", desc: "Staff snap a photo or upload a PDF of the paper order sheet — from any device, even a phone." },
    { num: "2", title: "Extract", desc: "AI Vision (GPT-4o) reads the document and pulls out every line item, quantity, and unit." },
    { num: "3", title: "Suggest", desc: "Smart defaults pre-fill quantities from your last order — just confirm or tweak, no guessing." },
    { num: "4", title: "Review & Approve", desc: "Staff review the draft; a manager approves with one click. Every order has a human gate." },
    { num: "5", title: "Deliver", desc: "The approved order is instantly transmitted to the distributor and they receive an email notification." },
  ];

  steps.forEach((step, i) => {
    const x = 0.8 + i * 2.4;
    const yBase = 2.8;
    // Circle with number
    s.addShape(pptx.shapes.OVAL, { x: x + 0.7, y: yBase, w: 0.6, h: 0.6, fill: { color: C.primary } });
    s.addText(step.num, { x: x + 0.7, y: yBase, w: 0.6, h: 0.6, fontSize: 22, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans" });
    // Title
    s.addText(step.title, { x, y: yBase + 0.75, w: 2.4, h: 0.4, fontSize: 14, bold: true, color: C.dark, align: "center", fontFace: "Plus Jakarta Sans" });
    // Description
    s.addText(step.desc, { x, y: yBase + 1.2, w: 2.4, h: 1.5, fontSize: 10.5, color: "475569", align: "center", fontFace: "Plus Jakarta Sans", valign: "top" });
    // Connecting arrow (except last)
    if (i < 4) {
      s.addText("→", { x: x + 2.0, y: yBase + 0.1, w: 0.4, h: 0.5, fontSize: 18, color: C.accent, align: "center", fontFace: "Plus Jakarta Sans" });
    }
  });

  s.addText("Paper → Approved Order in under 2 minutes.", {
    x: 0.8, y: 6.2, w: 11.5, h: 0.5,
    fontSize: 15, italic: true, color: C.primary, fontFace: "Plus Jakarta Sans", align: "center",
  });
  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 4 — THE AI PIPELINE (ARCHITECTURE)
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "AI Pipeline — How It Works");

  // Pipeline boxes
  const boxes = [
    { label: "Input\nPhoto / PDF", w: 1.8, fill: C.secondary },
    { label: "Vision AI\nGPT-4o OCR", w: 1.8, fill: C.primary },
    { label: "Suggestions\nLast-Order Heuristic", w: 2.1, fill: "6366F1" },
    { label: "Human Review\nEditable Draft", w: 2.0, fill: C.accent },
    { label: "Approval\nManager Gate", w: 1.8, fill: "16A34A" },
    { label: "Deliver\nEmail + Dashboard", w: 2.2, fill: C.dark },
  ];

  let xPos = 0.55;
  boxes.forEach((box, i) => {
    const rectH = 1.6;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 2.2, w: box.w, h: rectH,
      fill: { color: box.fill }, rectRadius: 0.15,
    });
    s.addText(box.label, {
      x: xPos, y: 2.2, w: box.w, h: rectH,
      fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans",
    });
    // Arrow
    if (i < boxes.length - 1) {
      const arrowX = xPos + box.w;
      s.addText("▸", { x: arrowX, y: 2.2, w: 0.35, h: rectH, fontSize: 22, color: C.muted, align: "center", valign: "middle" });
      xPos = arrowX + 0.35;
    }
  });

  // Detail rows
  const details = [
    { header: "OpenAI GPT-4o Vision", body: "Extracts line items with confidence scores. Structured JSON output — no parsing guesswork." },
    { header: "Smart Quantity Suggestions", body: "Matches products to the organization's last approved order. Pre-fills quantities so staff only review." },
    { header: "Human-in-the-Loop", body: "Every order requires explicit manager approval before reaching the distributor. AI assists, humans decide." },
    { header: "Resend Email Notifications", body: "Distributors receive an email the moment an order is approved, including a direct link to view it." },
  ];

  details.forEach((d, i) => {
    const y = 4.2 + i * 0.73;
    s.addText(d.header, {
      x: 0.8, y, w: 4.5, h: 0.35, fontSize: 12, bold: true, color: C.primary, fontFace: "Plus Jakarta Sans",
    });
    s.addText(d.body, {
      x: 5.5, y, w: 7, h: 0.35, fontSize: 11, color: "475569", fontFace: "Plus Jakarta Sans",
    });
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 5 — KEY FEATURES
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Key Features");

  const features = [
    { title: "📷 AI Vision Extraction", desc: "Supports photos, scans, PDFs. GPT-4o extracts items with product name, quantity, and unit automatically." },
    { title: "🧠 Smart Suggestions", desc: "Quantities pre-filled from order history. One-click confirm — no manual data entry for repeat items." },
    { title: "✅ Mandatory Human Approval", desc: "No order reaches a distributor without manager review. Full audit trail from draft to fulfillment." },
    { title: "📧 Instant Distributor Notification", desc: "Resend-powered email sent within seconds of approval, with a direct in-app link." },
    { title: "📱 Mobile-Ready", desc: "Responsive web app — staff capture order sheets with their phone camera right on the shop floor." },
    { title: "🔒 Multi-Tenant Security", desc: "Row-Level Security ensures supermarkets only see their own data. Distributors only see their assigned orders." },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.1;
    const y = 1.5 + row * 1.75;
    s.addShape(pptx.shapes.RECTANGLE, { x, y, w: 5.7, h: 1.45, fill: { color: C.bg }, rectRadius: 0.12 });
    s.addText(f.title, { x: x + 0.3, y: y + 0.1, w: 5.1, h: 0.35, fontSize: 14, bold: true, color: C.dark, fontFace: "Plus Jakarta Sans" });
    s.addText(f.desc, { x: x + 0.3, y: y + 0.55, w: 5.1, h: 0.75, fontSize: 11, color: "475569", fontFace: "Plus Jakarta Sans" });
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 6 — USER ROLES
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Built for Every Role");

  const roles = [
    { role: "Supermarket Staff", color: C.secondary, tasks: ["Snap a photo of the order sheet", "Review AI-extracted draft", "Edit items & submit for approval"] },
    { role: "Supermarket Manager", color: C.accent, tasks: ["Review pending orders", "Approve or reject with one click", "Full audit trail & order history"] },
    { role: "Distributor", color: "16A34A", tasks: ["Receive instant email notifications", "View all incoming orders in one dashboard", "Mark orders as fulfilled"] },
    { role: "Admin", color: C.dark, tasks: ["Link supermarkets to distributors", "Manage user roles & permissions", "System-wide oversight"] },
  ];

  roles.forEach((r, i) => {
    const x = 0.5 + i * 3.15;
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: 2.9, h: 5.0, fill: { color: C.bg }, rectRadius: 0.15 });
    // Header bar
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: 2.9, h: 0.7, fill: { color: r.color }, rectRadius: 0.15 });
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.85, w: 2.9, h: 0.35, fill: { color: r.color } }); // flatten bottom corners
    s.addText(r.role, { x, y: 1.5, w: 2.9, h: 0.7, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans" });
    // Tasks
    const taskItems = r.tasks.map((t) => ({ text: t, options: { bullet: { code: "2713" }, fontSize: 10.5, color: "334155", fontFace: "Plus Jakarta Sans", breakLine: true, paraSpaceAfter: 10 } }));
    s.addText(taskItems, { x: x + 0.2, y: 2.5, w: 2.5, h: 3.5, valign: "top" });
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 7 — MARKET OPPORTUNITY
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Market Opportunity");

  // Stat cards
  const stats = [
    { value: "40K+", label: "Supermarkets in the US", sub: "Independent & regional chains still reliant on manual processes" },
    { value: "70%", label: "Still use paper order sheets", sub: "Majority have no digital integration with distributors" },
    { value: "$12B", label: "Annual wasted productivity", sub: "Manual data entry, error correction, and order rework across grocery supply chain" },
  ];

  stats.forEach((st, i) => {
    const x = 0.8 + i * 4.05;
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: 3.7, h: 2.8, fill: { color: C.bg }, rectRadius: 0.12 });
    s.addText(st.value, { x, y: 1.7, w: 3.7, h: 0.8, fontSize: 36, bold: true, color: C.primary, align: "center", fontFace: "Plus Jakarta Sans" });
    s.addText(st.label, { x: x + 0.3, y: 2.5, w: 3.1, h: 0.5, fontSize: 13, bold: true, color: C.dark, align: "center", fontFace: "Plus Jakarta Sans" });
    s.addText(st.sub, { x: x + 0.3, y: 3.1, w: 3.1, h: 0.8, fontSize: 10.5, color: "475569", align: "center", fontFace: "Plus Jakarta Sans" });
  });

  // TAM / SAM / SOM
  s.addText("TAM: Global grocery supply chain automation ($45B+)", { x: 0.8, y: 4.8, w: 11.5, h: 0.35, fontSize: 12, color: "475569", fontFace: "Plus Jakarta Sans" });
  s.addText("SAM: US independent & regional supermarket ordering ($8B)", { x: 0.8, y: 5.15, w: 11.5, h: 0.35, fontSize: 12, color: "475569", fontFace: "Plus Jakarta Sans" });
  s.addText("SOM: Mid-Atlantic pilot → 50 supermarkets / $1.2M ARR Year 1", { x: 0.8, y: 5.5, w: 11.5, h: 0.35, fontSize: 12, color: C.accent, bold: true, fontFace: "Plus Jakarta Sans" });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 8 — COMPETITIVE LANDSCAPE
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Why SmartOrder AI Wins");

  // Table-like layout
  const headers = ["Capability", "SmartOrder AI", "Legacy EDI", "Manual Process"];
  const headerWidths = [4, 3, 3, 3];
  let hx = 0.8;
  headers.forEach((h, i) => {
    const isFirst = i === 0;
    s.addShape(pptx.shapes.RECTANGLE, { x: hx, y: 1.5, w: headerWidths[i], h: 0.55, fill: { color: isFirst ? C.primary : C.secondary } });
    s.addText(h, { x: hx, y: 1.5, w: headerWidths[i], h: 0.55, fontSize: 12, bold: true, color: C.white, align: isFirst ? "left" : "center", valign: "middle", fontFace: "Plus Jakarta Sans", inset: isFirst ? 0.3 : 0 });
    hx += headerWidths[i];
  });

  const rows = [
    ["AI Vision OCR (photo → data)",     "✓  GPT-4o powered",       "✗  Not available",      "✗  Manual typing"],
    ["Smart quantity suggestions",       "✓  Last-order heuristic", "✗  Not available",      "✗  None"],
    ["Human approval gate",              "✓  Built-in",             "✗  Not available",      "✗  None"],
    ["Instant distributor notification", "✓  Email + in-app",       "△  Batch only",         "✗  Phone/fax"],
    ["Mobile capture",                   "✓  Phone camera",         "✗  Desktop only",       "✗  Paper only"],
    ["Audit trail",                      "✓  Full history",         "△  Limited",            "✗  None"],
    ["Setup time",                       "< 1 day",                 "Weeks–months",          "N/A"],
  ];

  rows.forEach((row, ri) => {
    const y = 2.05 + ri * 0.62;
    const bgColor = ri % 2 === 0 ? C.white : C.bg;
    let rx = 0.8;
    row.forEach((cell, ci) => {
      const isFirst = ci === 0;
      s.addShape(pptx.shapes.RECTANGLE, { x: rx, y, w: headerWidths[ci], h: 0.58, fill: { color: bgColor } });
      s.addText(cell, { x: rx, y, w: headerWidths[ci], h: 0.58, fontSize: 10.5, color: isFirst ? C.dark : "334155", bold: isFirst, align: isFirst ? "left" : "center", valign: "middle", fontFace: "Plus Jakarta Sans", inset: isFirst ? 0.3 : 0 });
      rx += headerWidths[ci];
    });
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 9 — TECH STACK
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Technology Stack");

  const layers = [
    { layer: "Frontend", tech: "React + Vite · Tailwind CSS · shadcn/ui · Three.js · React Router", color: C.secondary },
    { layer: "Backend & Auth", tech: "Supabase — Auth (JWT + RBAC), Postgres (RLS), Storage, Edge Functions", color: C.primary },
    { layer: "AI Layer", tech: "OpenAI GPT-4o Vision — structured OCR extraction via Edge Function proxy", color: "6366F1" },
    { layer: "Notifications", tech: "Resend — transactional email to distributors on order approval", color: C.accent },
    { layer: "Hosting & Deploy", tech: "Supabase cloud · NativelyAI preview environments · Vite build pipeline", color: C.dark },
  ];

  layers.forEach((l, i) => {
    const y = 1.6 + i * 0.95;
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y, w: 0.18, h: 0.7, fill: { color: l.color } });
    s.addText(l.layer, {
      x: 1.3, y, w: 2.2, h: 0.35, fontSize: 13, bold: true, color: l.color, fontFace: "Plus Jakarta Sans", valign: "bottom",
    });
    s.addText(l.tech, {
      x: 1.3, y: y + 0.35, w: 10.5, h: 0.35, fontSize: 11, color: "475569", fontFace: "Plus Jakarta Sans", valign: "top",
    });
  });

  // Security callout
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 6.05, w: 11.5, h: 0.75, fill: { color: C.bg }, rectRadius: 0.1 });
  s.addText("🔒  Security-first: API keys never touch the browser. RLS at the database layer. JWT authentication for every request. Full audit trail.", {
    x: 1.1, y: 6.05, w: 11, h: 0.75, fontSize: 11, color: C.dark, fontFace: "Plus Jakarta Sans", valign: "middle",
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 10 — ROADMAP
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Product Roadmap");

  const phases = [
    {
      phase: "MVP (Current)",
      tag: "Q3 2026",
      color: C.green,
      items: [
        "AI Vision OCR via GPT-4o",
        "Last-order quantity suggestions",
        "Staff → Manager → Distributor flow",
        "Resend email notifications",
        "Multi-tenant RLS security",
      ],
    },
    {
      phase: "V1.1",
      tag: "Q4 2026",
      color: C.secondary,
      items: [
        "Bulk order upload (multiple sheets)",
        "Custom product catalog per supermarket",
        "Distributor order acknowledgment",
        "Rejection reason & resubmission flow",
        "Usage analytics dashboard",
      ],
    },
    {
      phase: "V2.0",
      tag: "Q1 2027",
      color: C.accent,
      items: [
        "ML-based demand forecasting",
        "Direct ERP/EDI integration for distributors",
        "Inventory-aware ordering suggestions",
        "Multi-level approval chains",
        "White-label distributor portal",
      ],
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.5 + i * 4.2;
    // Phase card
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: 3.85, h: 5.2, fill: { color: C.bg }, rectRadius: 0.15 });
    // Header
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: 3.85, h: 0.8, fill: { color: p.color }, rectRadius: 0.15 });
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.95, w: 3.85, h: 0.35, fill: { color: p.color } });
    s.addText(p.phase, { x, y: 1.55, w: 3.85, h: 0.45, fontSize: 14, bold: true, color: C.white, align: "center", fontFace: "Plus Jakarta Sans" });
    s.addText(p.tag, { x, y: 2.0, w: 3.85, h: 0.3, fontSize: 10, color: "BFDBFE", align: "center", fontFace: "Plus Jakarta Sans" });
    // Items
    p.items.forEach((item, ii) => {
      s.addShape(pptx.shapes.RECTANGLE, { x: x + 0.2, y: 2.55 + ii * 0.58, w: 0.5, h: 0.45, fill: { color: p.color, transparency: 85 }, rectRadius: 0.06 });
      s.addText("✓", { x: x + 0.2, y: 2.55 + ii * 0.58, w: 0.5, h: 0.45, fontSize: 11, color: p.color, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans" });
      s.addText(item, { x: x + 0.8, y: 2.55 + ii * 0.58, w: 2.8, h: 0.45, fontSize: 10.5, color: "334155", fontFace: "Plus Jakarta Sans", valign: "middle" });
    });
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 11 — BUSINESS MODEL
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  titleBar(s, "Business Model");

  const tiers = [
    { name: "Starter", price: "$299/mo", stores: "Up to 3 stores", desc: "AI extraction, basic suggestions, email notifications. Perfect for a single-location trial.", color: C.secondary },
    { name: "Growth", price: "$799/mo", stores: "Up to 15 stores", desc: "Everything in Starter, plus priority support, custom catalog, and bulk upload. For regional chains.", color: C.primary, highlight: true },
    { name: "Enterprise", price: "Custom", stores: "Unlimited", desc: "White-label portal, ERP integration, ML forecasting, dedicated support. For large distributors with 50+ supermarkets.", color: C.accent },
  ];

  tiers.forEach((t, i) => {
    const x = 0.5 + i * 4.2;
    const cardW = 3.85;
    s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: cardW, h: 4.4, fill: { color: t.highlight ? C.primary : C.bg }, rectRadius: 0.15 });
    if (t.highlight) {
      s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.5, w: cardW, h: 0.35, fill: { color: C.accent }, rectRadius: 0.15 });
      s.addShape(pptx.shapes.RECTANGLE, { x, y: 1.65, w: cardW, h: 0.2, fill: { color: C.accent } });
      s.addText("MOST POPULAR", { x, y: 1.5, w: cardW, h: 0.35, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans" });
    }
    const topY = t.highlight ? 1.85 : 1.5;
    s.addText(t.name, { x, y: topY + 0.25, w: cardW, h: 0.5, fontSize: 20, bold: true, color: t.highlight ? C.white : C.dark, align: "center", fontFace: "Plus Jakarta Sans" });
    s.addText(t.price, { x, y: topY + 0.75, w: cardW, h: 0.6, fontSize: 28, bold: true, color: t.highlight ? C.accent : C.primary, align: "center", fontFace: "Plus Jakarta Sans" });
    s.addText(t.stores, { x, y: topY + 1.35, w: cardW, h: 0.35, fontSize: 11, color: t.highlight ? "DBEAFE" : "475569", align: "center", fontFace: "Plus Jakarta Sans" });
    s.addText(t.desc, { x: x + 0.4, y: topY + 1.85, w: cardW - 0.8, h: 1.6, fontSize: 10.5, color: t.highlight ? "BFDBFE" : "475569", align: "center", fontFace: "Plus Jakarta Sans", valign: "top" });
    // CTA
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.6, y: topY + 3.2, w: cardW - 1.2, h: 0.55,
      fill: { color: t.highlight ? C.accent : C.primary }, rectRadius: 0.08,
    });
    s.addText("Get Started", {
      x: x + 0.6, y: topY + 3.2, w: cardW - 1.2, h: 0.55,
      fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans",
    });
  });

  footer(s);
})();

// ────────────────────────────────────────
// SLIDE 12 — CLOSE / CTA
// ────────────────────────────────────────
(() => {
  const s = pptx.addSlide();
  s.bkgd = C.primary;
  s.addShape(pptx.shapes.OVAL, { x: -1.5, y: -1.5, w: 5, h: 5, fill: { color: C.secondary, transparency: 80 } });
  s.addShape(pptx.shapes.OVAL, { x: 9.5, y: 4, w: 6, h: 6, fill: { color: C.accent, transparency: 80 } });

  s.addText("Ready to eliminate paper orders?", {
    x: 1, y: 1.5, w: 11.3, h: 1,
    fontSize: 38, fontFace: "Plus Jakarta Sans", bold: true, color: C.white, align: "center",
  });
  s.addText("Let's run a pilot with 3 supermarkets. See the results in under 2 weeks.", {
    x: 1.5, y: 2.7, w: 10.3, h: 0.7,
    fontSize: 18, fontFace: "Plus Jakarta Sans", color: "DBEAFE", align: "center",
  });

  // CTA shape
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 4.5, y: 3.8, w: 4.3, h: 0.8, fill: { color: C.accent }, rectRadius: 0.12,
  });
  s.addText("Schedule a Demo", {
    x: 4.5, y: 3.8, w: 4.3, h: 0.8, fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Plus Jakarta Sans",
  });

  s.addText("hello@smartorder.ai  |  smartorder.ai", {
    x: 0, y: 5.5, w: 13.33, h: 0.5,
    fontSize: 16, color: "93C5FD", fontFace: "Plus Jakarta Sans", align: "center",
  });

  s.addText("SmartOrder AI  —  AI-powered order automation, human-approved.", {
    x: 0, y: 6.5, w: 13.33, h: 0.4,
    fontSize: 11, color: C.lightBlue, fontFace: "Plus Jakarta Sans", align: "center",
  });
})();

// ── Save ──
await pptx.writeFile({ fileName: "SmartOrder_AI_Pitch_Deck.pptx" });
console.log("✅ Pitch deck generated: SmartOrder_AI_Pitch_Deck.pptx");
