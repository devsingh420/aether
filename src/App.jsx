import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — Farm-to-table palette
═══════════════════════════════════════════════════════════ */
const T = {
  font: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
  fontDisplay: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
  black: "#000",
  text: "#1d1d1f",
  gray: "#86868b",
  subtle: "#f5f5f7",
  border: "#d2d2d7",
  green: "#2d6a4f",
  greenLight: "#d8f3dc",
  accent: "#52b788",
  white: "#fff",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  radius: 12,
  radiusFull: 980,
};

/* ═══════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════ */
const Icon = {
  back: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  close: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  check: <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cart: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 6H18L16.5 13H7.5L5 3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="15" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  inbox: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 10H7L8.5 12H11.5L13 10H17" stroke="currentColor" strokeWidth="1.5"/></svg>,
  user: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17C3 13.5 6 11 10 11C14 11 17 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  truck: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M1 3H11V11H1V3Z" stroke="currentColor" strokeWidth="1.3"/><path d="M11 6H14L16 9V11H11V6Z" stroke="currentColor" strokeWidth="1.3"/><circle cx="4" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  calendar: <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7H14M5 1V4M11 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  snowflake: <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1V15M1 8H15M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  shield: <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1L2 3V7C2 11 4.5 14 8 15C11.5 14 14 11 14 7V3L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  building: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M3 16V4H10V16M10 16H15V8H10M5 7H7M5 10H7M5 13H7M12 11H13M12 13H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  home: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M3 7L9 2L15 7V15H11V11H7V15H3V7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  plus: <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  minus: <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  line: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.03 2 1 5.37 1 9.5c0 3.04 2.36 5.64 5.62 6.53-.08.28-.5 1.82-.53 1.96-.04.2.07.4.26.47.14.05.31.02.42-.08.16-.14 2.34-1.57 3.28-2.2.31.03.63.05.95.05 4.97 0 9-3.37 9-7.5S14.97 2 10 2z"/></svg>,
};

/* ═══════════════════════════════════════════════════════════
   CONFIGURATION
═══════════════════════════════════════════════════════════ */
const CONFIG = {
  currency: "฿",
  minRetailOrder: 200,      // Minimum for household
  minWholesaleOrder: 5000,  // Minimum for business
  deliveryOptions: {
    standard: { name: "Standard", time: "2-3 days", price: 50 },
    express: { name: "Express", time: "Same day", price: 150 },
    coldChain: { name: "Cold Chain", time: "Next day", price: 200 },
    scheduled: { name: "Scheduled", time: "Pick a date", price: 100 },
  },
};

/* ═══════════════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { id: "fruits", name: "Fruits", icon: "🍎", subcats: ["Tropical", "Berries", "Citrus", "Stone Fruits"] },
  { id: "vegetables", name: "Vegetables", icon: "🥬", subcats: ["Leafy Greens", "Root", "Tomatoes", "Peppers"] },
  { id: "grains", name: "Grains & Rice", icon: "🌾", subcats: ["Thai Rice", "Organic Rice", "Cereals"] },
  { id: "herbs", name: "Herbs & Spices", icon: "🌿", subcats: ["Fresh Herbs", "Roots", "Dried Spices"] },
];

/* ═══════════════════════════════════════════════════════════
   FARMS DATA
═══════════════════════════════════════════════════════════ */
const FARMS = {
  kasem: {
    id: "kasem",
    name: "Kasem Farms",
    owner: "Uncle Somchai",
    loc: "Chiang Rai",
    rating: 4.97,
    reviews: 312,
    verified: true,
    established: 2008,
    size: "200 rai",
    delivery: { bangkok: "24-48h", regional: "48-72h" },
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80",
    desc: "Third-generation family farm in the highlands of Chiang Rai. We supply Bangkok's top hotels including Mandarin Oriental and Four Seasons. All produce is GAP certified and hand-picked at optimal ripeness.",
    certs: ["GlobalGAP", "Organic Thailand", "Thai Select"],
    coldChain: true,
    escrow: true,
  },
  sombat: {
    id: "sombat",
    name: "Sombat Organics",
    owner: "Khun Sombat",
    loc: "Chiang Mai",
    rating: 4.89,
    reviews: 187,
    verified: true,
    established: 2012,
    size: "150 rai",
    delivery: { bangkok: "24-48h", regional: "48-72h" },
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    desc: "USDA and EU certified organic farm in Mae Rim valley. We grow 40+ varieties using traditional methods. Trusted by Michelin-starred restaurants across Thailand.",
    certs: ["USDA Organic", "EU Organic", "Thai Organic"],
    coldChain: true,
    escrow: true,
  },
  niran: {
    id: "niran",
    name: "Niran Hill Growers",
    owner: "Khun Niran",
    loc: "Nan Province",
    rating: 4.94,
    reviews: 241,
    verified: true,
    established: 2015,
    size: "80 rai",
    delivery: { bangkok: "48-72h", regional: "24-48h" },
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
    desc: "High-altitude farm at 1,400m in Nan's pristine mountains. Part of the Royal Project Foundation. We employ local hill tribe communities and practice sustainable agriculture.",
    certs: ["Royal Project", "PGS Organic", "Fair Trade"],
    coldChain: true,
    escrow: false,
  },
  pracha: {
    id: "pracha",
    name: "Pracha Fresh",
    owner: "Khun Pracha",
    loc: "Rayong",
    rating: 4.82,
    reviews: 98,
    verified: false,
    established: 2018,
    size: "120 rai",
    delivery: { bangkok: "12-24h", regional: "24-48h" },
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80",
    desc: "Eastern Thailand's premier durian and tropical fruit supplier. Located in Rayong's famous fruit belt. We harvest at optimal ripeness and deliver within hours.",
    certs: ["GAP", "Food Safety"],
    coldChain: true,
    escrow: false,
  },
  arunee: {
    id: "arunee",
    name: "Arunee Gardens",
    owner: "Khun Arunee",
    loc: "Kanchanaburi",
    rating: 4.91,
    reviews: 156,
    verified: true,
    established: 2010,
    size: "50 rai",
    delivery: { bangkok: "4-6h", regional: "24h" },
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
    desc: "State-of-the-art hydroponic facility producing pesticide-free greens and herbs. Climate-controlled for 365-day consistency. We deliver fresh-cut to Bangkok within 4 hours.",
    certs: ["Hydroponic Certified", "Pesticide-Free", "HACCP"],
    coldChain: true,
    escrow: true,
  },
};

/* ═══════════════════════════════════════════════════════════
   PRODUCTS DATA
═══════════════════════════════════════════════════════════ */
const GRADES = {
  A: { label: "A", color: "#15803d", bg: "#dcfce7", desc: "Premium Export" },
  B: { label: "B", color: "#1d4ed8", bg: "#dbeafe", desc: "Standard" },
  C: { label: "C", color: "#a16207", bg: "#fef9c3", desc: "Economy" },
};

const PRODUCTS = [
  {
    id: "p1",
    farmId: "kasem",
    name: "Hass Avocados",
    cat: "fruits",
    subcat: "Tropical",
    img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80",
      "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=600&q=80",
    ],
    grade: "A",
    unit: "kg",
    retailUnit: "piece",
    retailQty: 3, // 3 pieces per retail unit
    moq: { retail: 1, wholesale: 50 },
    avail: 4200,
    harvest: "Daily 4am",
    shelf: "7-10 days",
    storage: "4-7°C",
    priceUpdated: "2024-02-25",
    desc: "Premium Hass avocados, cold-chain harvested at dawn. Hand-selected for size consistency (18-22 per 5kg tray). Supplied to leading hotel groups.",
    specs: ["Size: 180-220g", "Brix: 8-10°", "Oil: 18-22%"],
    batchId: "KF-AVO-20240225",
    inspectionPhotos: ["https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=400"],
    // Pricing: retail price, then tiers for wholesale
    retailPrice: 89, // per retail unit (3 pieces)
    tiers: [
      { min: 1, max: 49, price: 180 },      // per kg, below MOQ
      { min: 50, max: 200, price: 145 },    // MOQ tier
      { min: 201, max: 500, price: 125 },
      { min: 501, max: 2000, price: 105 },
    ],
    needsColdChain: true,
  },
  {
    id: "p2",
    farmId: "sombat",
    name: "Dok Mali Jasmine Rice",
    cat: "grains",
    subcat: "Thai Rice",
    img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80"],
    grade: "A",
    unit: "kg",
    retailUnit: "bag (1kg)",
    retailQty: 1,
    moq: { retail: 1, wholesale: 100 },
    avail: 38000,
    harvest: "Nov-Feb season",
    shelf: "12 months",
    storage: "Cool, dry",
    priceUpdated: "2024-02-24",
    desc: "GI-certified Thung Kula Rong Hai Jasmine Rice. Milled within 24 hours of order. The choice of Michelin-starred Thai restaurants.",
    specs: ["Dok Mali 105", "Moisture <14%", "100% pure"],
    batchId: "SO-RIC-20240220",
    retailPrice: 75,
    tiers: [
      { min: 1, max: 99, price: 65 },
      { min: 100, max: 500, price: 52 },
      { min: 501, max: 2000, price: 45 },
      { min: 2001, max: 10000, price: 38 },
    ],
    needsColdChain: false,
  },
  {
    id: "p3",
    farmId: "niran",
    name: "Royal Project Strawberries",
    cat: "fruits",
    subcat: "Berries",
    img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80",
      "https://images.unsplash.com/photo-1543528176-61b239494933?w=600&q=80",
    ],
    grade: "A",
    unit: "kg",
    retailUnit: "box (250g)",
    retailQty: 0.25,
    moq: { retail: 1, wholesale: 20 },
    avail: 1200,
    harvest: "Daily dawn",
    shelf: "5-7 days",
    storage: "2-4°C",
    priceUpdated: "2024-02-25",
    desc: "Sweet highland strawberries from Doi Inthanon (1,400m). Brix 12-14°. Zero pesticides. Hand-picked and sorted into 250g clamshells.",
    specs: ["Brix: 12-14°", "Size: 25-35mm", "Pharachatan 80"],
    batchId: "NH-STR-20240225",
    inspectionPhotos: ["https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=400"],
    retailPrice: 95,
    tiers: [
      { min: 1, max: 19, price: 380 },
      { min: 20, max: 100, price: 320 },
      { min: 101, max: 400, price: 280 },
      { min: 401, max: 800, price: 250 },
    ],
    needsColdChain: true,
  },
  {
    id: "p4",
    farmId: "pracha",
    name: "Monthong Durian",
    cat: "fruits",
    subcat: "Tropical",
    img: "https://images.unsplash.com/photo-1588411393236-d2524cca1196?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1588411393236-d2524cca1196?w=600&q=80"],
    grade: "B",
    unit: "kg",
    retailUnit: "piece (~3kg)",
    retailQty: 3,
    moq: { retail: 1, wholesale: 30 },
    avail: 2800,
    harvest: "Apr-Jul season",
    shelf: "3-5 days",
    storage: "Room temp",
    priceUpdated: "2024-02-23",
    desc: "Monthong from Rayong - Thailand's premier durian belt. Each fruit 2.5-3.5kg, tested for hollow seed. Harvested at 80% ripeness.",
    specs: ["2.5-3.5kg each", "Flesh >35%", "No hollow seeds"],
    batchId: "PF-DUR-20240223",
    retailPrice: 890,
    tiers: [
      { min: 1, max: 29, price: 380 },
      { min: 30, max: 100, price: 320 },
      { min: 101, max: 300, price: 280 },
      { min: 301, max: 600, price: 250 },
    ],
    needsColdChain: false,
  },
  {
    id: "p5",
    farmId: "arunee",
    name: "Hydroponic Baby Cos",
    cat: "vegetables",
    subcat: "Leafy Greens",
    img: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&q=80"],
    grade: "A",
    unit: "kg",
    retailUnit: "head",
    retailQty: 0.2,
    moq: { retail: 2, wholesale: 50 },
    avail: 5000,
    harvest: "Cut to order",
    shelf: "14 days",
    storage: "2-5°C",
    priceUpdated: "2024-02-25",
    desc: "Crisp baby cos from closed-loop hydroponics. Zero pesticides. Delivered to Bangkok within 4 hours of harvest. Trusted by Tops Market.",
    specs: ["150-200g/head", "15-20cm height", "NFT system"],
    batchId: "AG-COS-20240225",
    retailPrice: 35,
    tiers: [
      { min: 1, max: 49, price: 115 },
      { min: 50, max: 200, price: 95 },
      { min: 201, max: 500, price: 82 },
      { min: 501, max: 2000, price: 70 },
    ],
    needsColdChain: true,
  },
  {
    id: "p6",
    farmId: "kasem",
    name: "Nam Dok Mai Mangoes",
    cat: "fruits",
    subcat: "Tropical",
    img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80",
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600&q=80",
    ],
    grade: "A",
    unit: "kg",
    retailUnit: "piece",
    retailQty: 0.4,
    moq: { retail: 2, wholesale: 50 },
    avail: 6500,
    harvest: "Mar-Jun season",
    shelf: "5-7 days",
    storage: "Room temp",
    priceUpdated: "2024-02-24",
    desc: "Nam Dok Mai Si Thong - the queen of Thai mangoes. Fiber-free golden flesh, honey-sweet aroma. Export approved to Japan, Korea, EU.",
    specs: ["350-450g (Size 3)", "Brix: 18-22°", "Fiber-free"],
    batchId: "KF-MAN-20240224",
    retailPrice: 65,
    tiers: [
      { min: 1, max: 49, price: 160 },
      { min: 50, max: 200, price: 130 },
      { min: 201, max: 500, price: 115 },
      { min: 501, max: 2000, price: 98 },
    ],
    needsColdChain: true,
  },
  {
    id: "p7",
    farmId: "sombat",
    name: "Fresh Galangal",
    cat: "herbs",
    subcat: "Roots",
    img: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80"],
    grade: "B",
    unit: "kg",
    retailUnit: "pack (200g)",
    retailQty: 0.2,
    moq: { retail: 1, wholesale: 20 },
    avail: 3200,
    harvest: "Year-round",
    shelf: "2-3 weeks",
    storage: "Refrigerate",
    priceUpdated: "2024-02-22",
    desc: "Young galangal from Chiang Mai highlands. Tender inner rhizome ideal for Tom Kha. Vacuum-sealed in 5kg packs for wholesale.",
    specs: ["6-8 months age", "8-15cm length", "Vacuum sealed"],
    batchId: "SO-GAL-20240222",
    retailPrice: 29,
    tiers: [
      { min: 1, max: 19, price: 100 },
      { min: 20, max: 100, price: 82 },
      { min: 101, max: 500, price: 70 },
      { min: 501, max: 2000, price: 58 },
    ],
    needsColdChain: false,
  },
  {
    id: "p8",
    farmId: "niran",
    name: "Heirloom Cherry Tomatoes",
    cat: "vegetables",
    subcat: "Tomatoes",
    img: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80"],
    grade: "A",
    unit: "kg",
    retailUnit: "punnet (200g)",
    retailQty: 0.2,
    moq: { retail: 1, wholesale: 10 },
    avail: 900,
    harvest: "Daily pick",
    shelf: "7-10 days",
    storage: "Room temp",
    priceUpdated: "2024-02-25",
    desc: "Three heirloom varieties: Sweet 100, Yellow Pear, Black Cherry. Never refrigerated - picked to order. Brix 8-10°.",
    specs: ["3 varieties", "Brix: 8-10°", "15-25mm"],
    batchId: "NH-TOM-20240225",
    retailPrice: 45,
    tiers: [
      { min: 1, max: 9, price: 170 },
      { min: 10, max: 50, price: 145 },
      { min: 51, max: 200, price: 125 },
      { min: 201, max: 600, price: 108 },
    ],
    needsColdChain: false,
  },
];

/* ═══════════════════════════════════════════════════════════
   PRICE TRENDS (Mock - would come from API)
═══════════════════════════════════════════════════════════ */
const PRICE_TRENDS = {
  fruits: { name: "Fruits", data: [142, 145, 148, 144, 150, 153, 155], change: +9.2 },
  vegetables: { name: "Vegetables", data: [95, 92, 94, 98, 96, 99, 102], change: +7.4 },
  grains: { name: "Grains", data: [58, 57, 58, 56, 55, 54, 55], change: -5.2 },
  herbs: { name: "Herbs", data: [88, 90, 92, 89, 91, 93, 95], change: +8.0 },
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt = n => `${CONFIG.currency}${n.toLocaleString()}`;
const getTier = (p, q) => p.tiers.find(t => q >= t.min && q <= t.max) || p.tiers[p.tiers.length - 1];
const getWholesalePrice = (p, q) => {
  const tier = getTier(p, q);
  return tier.price;
};
const pct = (a, b) => Math.round((1 - a / b) * 100);

// Persistence
const STORAGE_KEYS = {
  cart: "aether_cart",
  user: "aether_user",
  inquiries: "aether_inquiries",
  mode: "aether_mode",
};

const load = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const save = (key, val) => val ? localStorage.setItem(key, JSON.stringify(val)) : localStorage.removeItem(key);

// Hooks
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function useLockScroll(lock) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lock]);
}

/* ═══════════════════════════════════════════════════════════
   MODE TOGGLE — Household / Business
═══════════════════════════════════════════════════════════ */
function ModeToggle({ mode, setMode }) {
  return (
    <div style={{
      display: "flex",
      background: T.subtle,
      borderRadius: T.radiusFull,
      padding: 4,
    }}>
      {[
        { id: "retail", label: "Household", icon: Icon.home },
        { id: "wholesale", label: "Business", icon: Icon.building },
      ].map(m => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: T.radiusFull,
            border: "none",
            background: mode === m.id ? T.white : "transparent",
            color: mode === m.id ? T.text : T.gray,
            fontSize: 13,
            fontWeight: mode === m.id ? 600 : 400,
            cursor: "pointer",
            boxShadow: mode === m.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s",
          }}
        >
          <span style={{ display: "flex", opacity: mode === m.id ? 1 : 0.6 }}>{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICE CHART — Sparkline
═══════════════════════════════════════════════════════════ */
function PriceChart({ data, change, height = 40, width = 100 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");
  const color = change >= 0 ? "#22c55e" : "#ef4444";

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MARKET TRENDS PANEL
═══════════════════════════════════════════════════════════ */
function MarketTrends({ mode }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${T.green}08, ${T.accent}08)`,
      border: `1px solid ${T.green}20`,
      borderRadius: T.radius + 4,
      padding: 20,
      marginBottom: 28,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>Today's Market</h2>
          <p style={{ fontSize: 12, color: T.gray }}>Average prices · Updated hourly</p>
        </div>
        <span style={{ fontSize: 11, color: T.gray, background: T.subtle, padding: "4px 10px", borderRadius: T.radiusFull }}>
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {Object.entries(PRICE_TRENDS).map(([key, trend]) => (
          <div key={key} style={{
            background: T.white,
            borderRadius: T.radius,
            padding: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 12, color: T.gray, marginBottom: 4 }}>{trend.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{fmt(trend.data[trend.data.length - 1])}</span>
                <span style={{ fontSize: 11, color: T.gray }}>/{mode === "retail" ? "unit" : "kg"}</span>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: trend.change >= 0 ? "#22c55e" : "#ef4444",
              }}>
                {trend.change >= 0 ? "↑" : "↓"} {Math.abs(trend.change)}%
              </span>
            </div>
            <PriceChart data={trend.data} change={trend.change} width={60} height={30} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════ */
function Card({ product, mode, onClick, onAddToCart }) {
  const farm = FARMS[product.farmId];
  const grade = GRADES[product.grade];
  const [hover, setHover] = useState(false);

  const displayPrice = mode === "retail" ? product.retailPrice : getWholesalePrice(product, product.moq.wholesale);
  const displayUnit = mode === "retail" ? product.retailUnit : product.unit;
  const moq = mode === "wholesale" ? product.moq.wholesale : null;

  // Calculate savings for wholesale
  const retailEquiv = mode === "wholesale" ? (product.retailPrice / product.retailQty) : null;
  const savings = retailEquiv ? pct(displayPrice, retailEquiv) : 0;

  return (
    <article
      onClick={() => onClick(product)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: T.white,
        borderRadius: T.radius + 4,
        border: `1px solid ${hover ? T.border : "transparent"}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hover ? "translateY(-2px)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
        <img
          src={product.img}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
            transform: hover ? "scale(1.05)" : "scale(1)",
          }}
        />
        {/* Grade badge */}
        <span style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: grade.bg,
          color: grade.color,
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: T.radiusFull,
        }}>Grade {grade.label}</span>

        {/* MOQ badge for wholesale */}
        {moq && (
          <span style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: T.warningBg,
            color: "#92400e",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: T.radiusFull,
          }}>MOQ: {moq}{product.unit}</span>
        )}

        {/* Cold chain indicator */}
        {product.needsColdChain && (
          <span style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            background: "rgba(0,0,0,0.7)",
            color: "#93c5fd",
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: T.radius - 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            {Icon.snowflake} Cold Chain
          </span>
        )}

        {/* Savings badge */}
        {mode === "wholesale" && savings > 0 && (
          <span style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: T.green,
            color: T.white,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: T.radiusFull,
          }}>Save {savings}%</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
          {farm.name}
          {farm.verified && <span style={{ color: T.green }}>{Icon.shield}</span>}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6, letterSpacing: "-0.2px" }}>
          {product.name}
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{fmt(displayPrice)}</span>
              <span style={{ fontSize: 12, color: T.gray }}>/{displayUnit}</span>
            </div>
            <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>
              {product.avail.toLocaleString()} {product.unit} available
            </div>
          </div>

          {/* Quick add button for retail */}
          {mode === "retail" && (
            <button
              onClick={e => { e.stopPropagation(); onAddToCart(product, 1); }}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: T.green,
                color: T.white,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icon.plus}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
function Modal({ children, onClose, wide }) {
  useLockScroll(true);
  const w = useWidth();
  const mobile = w < 768;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: mobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: mobile ? 0 : 20,
      }}
    >
      <div style={{
        background: T.white,
        borderRadius: mobile ? "20px 20px 0 0" : T.radius + 8,
        width: "100%",
        maxWidth: mobile ? "100%" : (wide ? 640 : 480),
        maxHeight: mobile ? "94vh" : "90vh",
        overflow: "auto",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CART PANEL (Retail)
═══════════════════════════════════════════════════════════ */
function CartPanel({ cart, setCart, onClose, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + (item.product.retailPrice * item.qty), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Your Cart</h2>
            <p style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: T.subtle, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: T.gray,
          }}>{Icon.close}</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: T.gray }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {cart.map(item => (
                <div key={item.product.id} style={{
                  display: "flex",
                  gap: 12,
                  padding: 12,
                  background: T.subtle,
                  borderRadius: T.radius,
                }}>
                  <img src={item.product.img} alt="" style={{
                    width: 60, height: 60, borderRadius: T.radius - 4, objectFit: "cover",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.product.name}</div>
                    <div style={{ fontSize: 13, color: T.gray }}>{fmt(item.product.retailPrice)}/{item.product.retailUnit}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateQty(item.product.id, -1)} style={{
                      width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.border}`,
                      background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{Icon.minus}</button>
                    <span style={{ fontWeight: 600, width: 24, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} style={{
                      width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.border}`,
                      background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{Icon.plus}</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery options */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Delivery</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(CONFIG.deliveryOptions).slice(0, 2).map(([key, opt]) => (
                  <div key={key} style={{
                    padding: 12,
                    border: `1px solid ${T.border}`,
                    borderRadius: T.radius,
                    cursor: "pointer",
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{opt.name}</div>
                    <div style={{ fontSize: 12, color: T.gray }}>{opt.time} · +{fmt(opt.price)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              background: T.subtle,
              borderRadius: T.radius,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 15 }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{fmt(total)}</span>
            </div>

            {total < CONFIG.minRetailOrder && (
              <div style={{
                padding: 12,
                background: T.warningBg,
                borderRadius: T.radius,
                marginBottom: 16,
                fontSize: 13,
                color: "#92400e",
              }}>
                Minimum order: {fmt(CONFIG.minRetailOrder)}. Add {fmt(CONFIG.minRetailOrder - total)} more.
              </div>
            )}

            <button
              onClick={onCheckout}
              disabled={total < CONFIG.minRetailOrder}
              style={{
                width: "100%",
                padding: 16,
                background: total >= CONFIG.minRetailOrder ? T.green : T.border,
                color: total >= CONFIG.minRetailOrder ? T.white : T.gray,
                border: "none",
                borderRadius: T.radius,
                fontSize: 16,
                fontWeight: 600,
                cursor: total >= CONFIG.minRetailOrder ? "pointer" : "not-allowed",
              }}
            >
              Checkout
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUOTE REQUEST MODAL (Wholesale)
═══════════════════════════════════════════════════════════ */
function QuoteModal({ product, farm, onClose, onSubmit }) {
  const [qty, setQty] = useState(product.moq.wholesale);
  const [deliveryType, setDeliveryType] = useState("standard");
  const [recurring, setRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState("monday");
  const [message, setMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [sent, setSent] = useState(false);

  const tier = getTier(product, qty);
  const total = qty * tier.price;

  const submit = () => {
    setSent(true);
    setTimeout(() => {
      onSubmit({
        id: Date.now(),
        product,
        farm,
        qty,
        price: parseFloat(proposedPrice) || tier.price,
        total: qty * (parseFloat(proposedPrice) || tier.price),
        deliveryType,
        recurring,
        recurringDay: recurring ? recurringDay : null,
        message,
        status: "pending",
        date: new Date().toISOString(),
      });
    }, 1500);
  };

  return (
    <Modal onClose={() => !sent && onClose()} wide>
      <div style={{ padding: 24 }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: T.greenLight, margin: "0 auto 20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.green,
            }}>{Icon.check}</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Quote Request Sent</h2>
            <p style={{ color: T.gray }}>{farm.name} will respond within 2 hours.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: T.gray, marginBottom: 2 }}>Request Quote</div>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>{product.name}</h2>
              </div>
              <button onClick={onClose} style={{
                width: 36, height: 36, borderRadius: "50%",
                background: T.subtle, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", color: T.gray,
              }}>{Icon.close}</button>
            </div>

            {/* Farm info */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: 12, background: T.subtle, borderRadius: T.radius, marginBottom: 20,
            }}>
              <img src={farm.image} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {farm.name}
                  {farm.verified && <span style={{ color: T.green }}>{Icon.shield}</span>}
                </div>
                <div style={{ fontSize: 12, color: T.gray }}>{farm.loc} · {farm.owner}</div>
              </div>
              {farm.escrow && (
                <span style={{ fontSize: 11, background: T.greenLight, color: T.green, padding: "4px 10px", borderRadius: T.radiusFull }}>
                  Escrow Available
                </span>
              )}
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>
                Quantity ({product.unit})
                <span style={{ fontWeight: 400, color: T.gray }}> · MOQ: {product.moq.wholesale}{product.unit}</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(Math.max(product.moq.wholesale, parseInt(e.target.value) || 0))}
                  style={{
                    flex: 1, padding: 12, border: `1px solid ${T.border}`, borderRadius: T.radius,
                    fontSize: 16, fontWeight: 600, outline: "none",
                  }}
                />
                <div style={{
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: "0 16px", background: T.subtle, borderRadius: T.radius,
                }}>
                  <div style={{ fontSize: 11, color: T.gray }}>Unit Price</div>
                  <div style={{ fontWeight: 700 }}>{fmt(tier.price)}/{product.unit}</div>
                </div>
              </div>
            </div>

            {/* Tier indicator */}
            <div style={{
              display: "flex", gap: 6, marginBottom: 20,
              overflowX: "auto", paddingBottom: 4,
            }}>
              {product.tiers.map((t, i) => {
                const active = tier === t;
                return (
                  <button
                    key={i}
                    onClick={() => setQty(t.min)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: T.radius,
                      border: active ? `2px solid ${T.green}` : `1px solid ${T.border}`,
                      background: active ? T.greenLight : T.white,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ fontSize: 12, color: active ? T.green : T.gray }}>{t.min}-{t.max}{product.unit}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: active ? T.green : T.text }}>{fmt(t.price)}</div>
                  </button>
                );
              })}
            </div>

            {/* Delivery */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>Delivery Method</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {Object.entries(CONFIG.deliveryOptions).map(([key, opt]) => (
                  <button
                    key={key}
                    onClick={() => setDeliveryType(key)}
                    style={{
                      padding: 12,
                      border: deliveryType === key ? `2px solid ${T.green}` : `1px solid ${T.border}`,
                      borderRadius: T.radius,
                      background: deliveryType === key ? T.greenLight : T.white,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {key === "coldChain" && <span style={{ color: "#3b82f6" }}>{Icon.snowflake}</span>}
                      {key === "scheduled" && <span style={{ color: T.gray }}>{Icon.calendar}</span>}
                      <span style={{ fontWeight: 500 }}>{opt.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.gray }}>{opt.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring delivery */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={e => setRecurring(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14 }}>
                  <strong>Schedule recurring delivery</strong>
                  <span style={{ color: T.gray }}> (weekly)</span>
                </span>
              </label>
              {recurring && (
                <select
                  value={recurringDay}
                  onChange={e => setRecurringDay(e.target.value)}
                  style={{
                    marginTop: 10, padding: 10, border: `1px solid ${T.border}`,
                    borderRadius: T.radius, fontSize: 14, width: "100%",
                  }}
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                    <option key={day} value={day.toLowerCase()}>{day} morning delivery</option>
                  ))}
                </select>
              )}
            </div>

            {/* Proposed price */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>
                Propose a price <span style={{ fontWeight: 400, color: T.gray }}>(optional)</span>
              </label>
              <div style={{
                display: "flex", border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden",
              }}>
                <span style={{ padding: "12px 14px", background: T.subtle, borderRight: `1px solid ${T.border}`, color: T.gray }}>
                  {CONFIG.currency}
                </span>
                <input
                  type="number"
                  placeholder={tier.price.toString()}
                  value={proposedPrice}
                  onChange={e => setProposedPrice(e.target.value)}
                  style={{ flex: 1, padding: "12px 14px", border: "none", fontSize: 15, outline: "none" }}
                />
                <span style={{ padding: "12px 14px", color: T.gray }}>/{product.unit}</span>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Special requirements, packaging needs, delivery location details..."
                rows={3}
                style={{
                  width: "100%", padding: 12, border: `1px solid ${T.border}`,
                  borderRadius: T.radius, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit",
                }}
              />
            </div>

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: 16, background: T.subtle, borderRadius: T.radius, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 13, color: T.gray }}>Estimated Total</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(total)}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: T.gray }}>
                {qty.toLocaleString()} {product.unit} × {fmt(tier.price)}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, background: T.white, border: `1px solid ${T.border}`,
                borderRadius: T.radius, fontSize: 15, fontWeight: 500, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={submit} style={{
                flex: 2, padding: 14, background: T.green, color: T.white, border: "none",
                borderRadius: T.radius, fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>Send Quote Request</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
function AuthModal({ onClose, onLogin, mode }) {
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!email || !password) { setError("Please fill required fields"); return; }
    if (authMode === "register" && !name) { setError("Please enter your name"); return; }
    onLogin({
      id: Date.now(),
      email,
      name: name || email.split("@")[0],
      company,
      phone,
      type: mode === "wholesale" ? "business" : "individual",
    });
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>{authMode === "login" ? "Welcome back" : "Create account"}</h2>
            <p style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>
              {mode === "wholesale" ? "Business account" : "Personal account"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%", background: T.subtle, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: T.gray,
          }}>{Icon.close}</button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", padding: 12, borderRadius: T.radius, fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {authMode === "register" && (
            <input type="text" placeholder="Full name *" value={name} onChange={e => setName(e.target.value)}
              style={{ padding: 14, border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: 15, outline: "none" }} />
          )}
          <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)}
            style={{ padding: 14, border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: 15, outline: "none" }} />
          <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)}
            style={{ padding: 14, border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: 15, outline: "none" }} />
          {authMode === "register" && mode === "wholesale" && (
            <>
              <input type="text" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)}
                style={{ padding: 14, border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: 15, outline: "none" }} />
              <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)}
                style={{ padding: 14, border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: 15, outline: "none" }} />
            </>
          )}
        </div>

        <button onClick={submit} style={{
          width: "100%", padding: 16, background: T.green, color: T.white, border: "none",
          borderRadius: T.radius, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 20,
        }}>{authMode === "login" ? "Sign in" : "Create account"}</button>

        <p style={{ textAlign: "center", fontSize: 14, color: T.gray, marginTop: 16 }}>
          {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            style={{ background: "none", border: "none", color: T.text, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            {authMode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.subtle}`, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: T.gray, marginBottom: 12 }}>Or contact us</p>
          <a href="https://line.me/R/ti/p/@aether" target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, background: "#06c755", color: T.white,
              padding: "10px 20px", borderRadius: T.radiusFull, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
            {Icon.line} Line @aether
          </a>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   INQUIRIES PANEL
═══════════════════════════════════════════════════════════ */
const STATUS_COLORS = {
  pending: { bg: "#fef9c3", color: "#a16207" },
  negotiating: { bg: "#dbeafe", color: "#1d4ed8" },
  accepted: { bg: "#dcfce7", color: "#15803d" },
  closed: { bg: T.subtle, color: T.gray },
};

function InquiriesPanel({ inquiries, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Quote Requests</h2>
            <p style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>{inquiries.length} request{inquiries.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%", background: T.subtle, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: T.gray,
          }}>{Icon.close}</button>
        </div>

        {inquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: T.gray }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>📋</div>
            <p>No quote requests yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inquiries.map(inq => {
              const s = STATUS_COLORS[inq.status] || STATUS_COLORS.pending;
              return (
                <div key={inq.id} style={{ border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{inq.product.name}</div>
                      <div style={{ fontSize: 13, color: T.gray }}>{inq.farm.name}</div>
                    </div>
                    <span style={{
                      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
                      padding: "4px 10px", borderRadius: T.radiusFull, textTransform: "capitalize",
                    }}>{inq.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                    <span><strong>{inq.qty.toLocaleString()}</strong> {inq.product.unit}</span>
                    <span>{fmt(inq.price)}/{inq.product.unit}</span>
                    <span style={{ fontWeight: 600, color: T.green }}>{fmt(inq.total)}</span>
                  </div>
                  {inq.recurring && (
                    <div style={{ marginTop: 8, fontSize: 12, color: T.gray }}>
                      🔄 Recurring: Every {inq.recurringDay}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT DETAIL
═══════════════════════════════════════════════════════════ */
function ProductDetail({ product, mode, onBack, onAddToCart, onQuote, user, onShowAuth }) {
  const farm = FARMS[product.farmId];
  const grade = GRADES[product.grade];
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(mode === "retail" ? 1 : product.moq.wholesale);
  const [showQuote, setShowQuote] = useState(false);

  const w = useWidth();
  const mobile = w < 768;

  const tier = getTier(product, qty);
  const total = mode === "retail" ? product.retailPrice * qty : qty * tier.price;

  return (
    <>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
        cursor: "pointer", color: T.gray, fontSize: 15, padding: 0, marginBottom: 24,
      }}>
        {Icon.back} Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 24 : 48, alignItems: "start" }}>
        {/* Left */}
        <div>
          <div style={{ borderRadius: T.radius + 8, overflow: "hidden", marginBottom: 12, position: "relative" }}>
            <img src={product.images[selectedImg]} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
            <span style={{
              position: "absolute", top: 12, left: 12, background: grade.bg, color: grade.color,
              fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: T.radiusFull,
            }}>Grade {grade.label} · {grade.desc}</span>
            {product.needsColdChain && (
              <span style={{
                position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.7)", color: "#93c5fd",
                fontSize: 12, padding: "6px 12px", borderRadius: T.radius, display: "flex", alignItems: "center", gap: 6,
              }}>{Icon.snowflake} Requires Cold Chain</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)} style={{
                  width: 64, height: 64, borderRadius: T.radius - 4, overflow: "hidden", padding: 0, cursor: "pointer",
                  border: selectedImg === i ? `2px solid ${T.green}` : `2px solid transparent`,
                  opacity: selectedImg === i ? 1 : 0.6,
                }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          {/* Quick info */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Harvest", value: product.harvest },
              { label: "Shelf Life", value: product.shelf },
              { label: "Delivery", value: farm.delivery.bangkok },
            ].map(item => (
              <div key={item.label} style={{ background: T.subtle, borderRadius: T.radius, padding: 12 }}>
                <div style={{ fontSize: 11, color: T.gray, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>About this product</h3>
            <p style={{ fontSize: 14, color: T.gray, lineHeight: 1.7 }}>{product.desc}</p>
          </div>

          {/* Specs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {product.specs.map((spec, i) => (
              <span key={i} style={{ background: T.subtle, padding: "6px 12px", borderRadius: T.radiusFull, fontSize: 12 }}>{spec}</span>
            ))}
          </div>

          {/* Batch info */}
          {product.batchId && (
            <div style={{ background: T.subtle, borderRadius: T.radius, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: T.gray, marginBottom: 4 }}>Batch ID</div>
              <div style={{ fontFamily: "monospace", fontWeight: 600 }}>{product.batchId}</div>
              {product.inspectionPhotos && (
                <button style={{
                  marginTop: 10, fontSize: 13, color: T.green, background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
                }}>View inspection photos →</button>
              )}
            </div>
          )}

          {/* Farm card */}
          <div style={{ border: `1px solid ${T.border}`, borderRadius: T.radius + 4, overflow: "hidden" }}>
            <img src={farm.image} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{farm.name}</span>
                {farm.verified && <span style={{ color: T.green }}>{Icon.shield}</span>}
                {farm.escrow && <span style={{ fontSize: 10, background: T.greenLight, color: T.green, padding: "2px 8px", borderRadius: T.radiusFull }}>Escrow</span>}
              </div>
              <div style={{ fontSize: 13, color: T.gray, marginBottom: 8 }}>{farm.loc} · {farm.owner} · Est. {farm.established}</div>
              <p style={{ fontSize: 13, color: T.gray, lineHeight: 1.6, marginBottom: 10 }}>{farm.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {farm.certs.map((cert, i) => (
                  <span key={i} style={{ background: "#dbeafe", color: "#1d4ed8", padding: "3px 8px", borderRadius: T.radiusFull, fontSize: 10, fontWeight: 600 }}>{cert}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <h1 style={{ fontSize: mobile ? 26 : 32, fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 8 }}>{product.name}</h1>
          <p style={{ fontSize: 14, color: T.gray, marginBottom: 24 }}>
            {product.avail.toLocaleString()} {product.unit} available · Updated {product.priceUpdated}
          </p>

          {mode === "retail" ? (
            /* RETAIL MODE */
            <>
              <div style={{ background: T.subtle, borderRadius: T.radius, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{fmt(product.retailPrice)}</div>
                    <div style={{ fontSize: 13, color: T.gray }}>per {product.retailUnit}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
                      width: 36, height: 36, borderRadius: "50%", border: `1px solid ${T.border}`,
                      background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{Icon.minus}</button>
                    <span style={{ fontSize: 20, fontWeight: 600, width: 40, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => setQty(qty + 1)} style={{
                      width: 36, height: 36, borderRadius: "50%", border: `1px solid ${T.border}`,
                      background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{Icon.plus}</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
                  <span>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{fmt(total)}</span>
                </div>
              </div>

              <button onClick={() => onAddToCart(product, qty)} style={{
                width: "100%", padding: 16, background: T.green, color: T.white, border: "none",
                borderRadius: T.radius, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 12,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {Icon.cart} Add to Cart
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: T.gray }}>
                Need bulk quantities? <button onClick={() => {}} style={{ background: "none", border: "none", color: T.green, cursor: "pointer", textDecoration: "underline" }}>Switch to Business mode</button>
              </p>
            </>
          ) : (
            /* WHOLESALE MODE */
            <>
              {/* Tier pricing */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Volume Pricing (per {product.unit})</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(product.tiers.length, 4)}, 1fr)`, gap: 8 }}>
                  {product.tiers.map((t, i) => {
                    const active = tier === t;
                    const savingsVsRetail = pct(t.price, product.retailPrice / product.retailQty);
                    return (
                      <div key={i} style={{
                        padding: 14, borderRadius: T.radius, textAlign: "center",
                        background: active ? T.green : T.subtle,
                        color: active ? T.white : T.text,
                        border: active ? "none" : `1px solid ${T.border}`,
                      }}>
                        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>{t.min}–{t.max}{product.unit}</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(t.price)}</div>
                        {savingsVsRetail > 0 && <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>Save {savingsVsRetail}%</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MOQ notice */}
              <div style={{
                background: T.warningBg, borderRadius: T.radius, padding: 12, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#92400e",
              }}>
                <span style={{ fontWeight: 600 }}>MOQ: {product.moq.wholesale} {product.unit}</span>
                <span>Minimum order for wholesale pricing</span>
              </div>

              {/* Quantity calculator */}
              <div style={{ background: T.subtle, borderRadius: T.radius, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Quantity</div>
                    <input type="number" value={qty} onChange={e => setQty(Math.max(product.moq.wholesale, parseInt(e.target.value) || 0))}
                      style={{ fontSize: 28, fontWeight: 700, border: "none", background: "transparent", width: 120, outline: "none" }} />
                    <span style={{ color: T.gray }}>{product.unit}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Unit Price</div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{fmt(tier.price)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
                  <span>Estimated Total</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: T.green }}>{fmt(total)}</span>
                </div>
              </div>

              <button onClick={() => user ? setShowQuote(true) : onShowAuth()} style={{
                width: "100%", padding: 16, background: T.green, color: T.white, border: "none",
                borderRadius: T.radius, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 12,
              }}>
                {user ? "Request Quote" : "Sign in to Request Quote"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: T.gray }}>
                Farm responds within 2 hours · Escrow payment available
              </p>
            </>
          )}
        </div>
      </div>

      {showQuote && (
        <QuoteModal
          product={product}
          farm={farm}
          onClose={() => setShowQuote(false)}
          onSubmit={inq => { setShowQuote(false); onQuote(inq); }}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FILTERS
═══════════════════════════════════════════════════════════ */
function FiltersPanel({ filters, setFilters, mode }) {
  const grades = ["A", "B", "C"];
  const farms = Object.values(FARMS);

  const toggle = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      return { ...prev, [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const clear = () => setFilters({});
  const hasFilters = Object.values(filters).some(arr => arr?.length > 0);

  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 20, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Filters</h3>
        {hasFilters && <button onClick={clear} style={{ background: "none", border: "none", color: T.gray, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Clear all</button>}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CATEGORIES.map(cat => {
            const active = filters.category?.includes(cat.id);
            return (
              <button key={cat.id} onClick={() => toggle("category", cat.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: T.radiusFull,
                border: `1px solid ${active ? T.green : T.border}`, background: active ? T.greenLight : T.white,
                color: active ? T.green : T.text, fontSize: 13, cursor: "pointer",
              }}>
                <span>{cat.icon}</span>{cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grades */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Grade</div>
        <div style={{ display: "flex", gap: 8 }}>
          {grades.map(g => {
            const grade = GRADES[g];
            const active = filters.grade?.includes(g);
            return (
              <button key={g} onClick={() => toggle("grade", g)} style={{
                padding: "8px 16px", borderRadius: T.radius,
                border: active ? `2px solid ${grade.color}` : `1px solid ${T.border}`,
                background: active ? grade.bg : T.white, color: active ? grade.color : T.text,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Grade {g}</button>
            );
          })}
        </div>
      </div>

      {/* Farms */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Farm</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {farms.map(farm => {
            const active = filters.farm?.includes(farm.id);
            return (
              <button key={farm.id} onClick={() => toggle("farm", farm.id)} style={{
                padding: "6px 12px", borderRadius: T.radiusFull,
                border: `1px solid ${active ? T.green : T.border}`, background: active ? T.greenLight : T.white,
                color: active ? T.green : T.text, fontSize: 12, cursor: "pointer",
              }}>{farm.name} {farm.verified && "✓"}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MARKET PAGE
═══════════════════════════════════════════════════════════ */
function MarketPage({ mode, onSelect, onAddToCart }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const w = useWidth();
  const mobile = w < 768;

  const list = useMemo(() => {
    let filtered = PRODUCTS;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || FARMS[p.farmId].name.toLowerCase().includes(q));
    }
    if (filters.category?.length) filtered = filtered.filter(p => filters.category.includes(p.cat));
    if (filters.grade?.length) filtered = filtered.filter(p => filters.grade.includes(p.grade));
    if (filters.farm?.length) filtered = filtered.filter(p => filters.farm.includes(p.farmId));
    return filtered;
  }, [search, filters]);

  const activeFilterCount = Object.values(filters).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: 28, maxWidth: 560 }}>
        <h1 style={{ fontSize: mobile ? 28 : 40, fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 10 }}>
          {mode === "retail" ? "Fresh from Thailand's farms" : "Wholesale produce, direct pricing"}
        </h1>
        <p style={{ fontSize: mobile ? 15 : 16, color: T.gray, lineHeight: 1.5 }}>
          {mode === "retail"
            ? "Quality produce delivered to your door. No middlemen."
            : "Volume pricing for restaurants, hotels & resellers. MOQ discounts."}
        </p>
      </div>

      <MarketTrends mode={mode} />

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10,
          background: T.subtle, borderRadius: T.radiusFull, padding: "10px 16px",
        }}>
          <span style={{ color: T.gray, display: "flex" }}>{Icon.search}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, farms..."
            style={{ flex: 1, border: "none", background: "none", fontSize: 15, outline: "none", fontFamily: "inherit" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray, display: "flex" }}>{Icon.close}</button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: T.radiusFull,
          border: `1px solid ${showFilters ? T.green : T.border}`, background: showFilters ? T.greenLight : T.white,
          color: showFilters ? T.green : T.text, fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>
          Filters
          {activeFilterCount > 0 && <span style={{
            background: T.green, color: T.white, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: T.radiusFull,
          }}>{activeFilterCount}</span>}
        </button>
      </div>

      {showFilters && <FiltersPanel filters={filters} setFilters={setFilters} mode={mode} />}

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {CATEGORIES.map(cat => {
          const active = filters.category?.includes(cat.id);
          return (
            <button key={cat.id} onClick={() => {
              setFilters(prev => ({
                ...prev,
                category: active ? prev.category?.filter(c => c !== cat.id) : [...(prev.category || []), cat.id]
              }));
            }} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: T.radius,
              border: `1px solid ${active ? T.green : T.border}`, background: active ? T.greenLight : T.white,
              color: active ? T.green : T.text, fontSize: 14, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>{cat.name}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div style={{ fontSize: 14, color: T.gray, marginBottom: 16 }}>
        {list.length} product{list.length !== 1 ? "s" : ""} {search && `for "${search}"`}
      </div>

      {/* Grid */}
      {list.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: mobile ? 12 : 20 }}>
          {list.map(p => <Card key={p.id} product={p} mode={mode} onClick={onSelect} onAddToCart={onAddToCart} />)}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "64px 0", color: T.gray }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔍</div>
          <p>No products found</p>
          <button onClick={() => { setSearch(""); setFilters({}); }} style={{
            marginTop: 16, padding: "10px 24px", background: T.green, color: T.white, border: "none",
            borderRadius: T.radiusFull, fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>Clear filters</button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const w = useWidth();
  const mobile = w < 768;

  const [mode, setMode] = useState(() => load(STORAGE_KEYS.mode) || "retail");
  const [view, setView] = useState("market");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState(() => load(STORAGE_KEYS.cart) || []);
  const [inquiries, setInquiries] = useState(() => load(STORAGE_KEYS.inquiries) || []);
  const [user, setUser] = useState(() => load(STORAGE_KEYS.user));
  const [showCart, setShowCart] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Persist
  useEffect(() => { save(STORAGE_KEYS.mode, mode); }, [mode]);
  useEffect(() => { save(STORAGE_KEYS.cart, cart); }, [cart]);
  useEffect(() => { save(STORAGE_KEYS.inquiries, inquiries); }, [inquiries]);
  useEffect(() => { save(STORAGE_KEYS.user, user); }, [user]);

  const select = p => { setProduct(p); setView("detail"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => { setView("market"); setProduct(null); };

  const addToCart = (product, qty) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
  };

  const addInquiry = inq => setInquiries(prev => [inq, ...prev]);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div style={{ fontFamily: T.font, background: T.white, minHeight: "100vh", color: T.text }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.subtle}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: mobile ? "0 16px" : "0 32px",
          height: mobile ? 56 : 64, display: "flex", alignItems: "center", gap: 16,
        }}>
          {/* Logo */}
          <button onClick={back} style={{
            display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.green}, ${T.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: T.white, fontSize: 14 }}>✦</span>
            </div>
            {!mobile && <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px" }}>Aether</span>}
          </button>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} setMode={setMode} />

          <div style={{ flex: 1 }} />

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {mode === "retail" ? (
              <button onClick={() => setShowCart(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: T.radiusFull,
                background: T.subtle, border: "none", cursor: "pointer", position: "relative",
              }}>
                <span style={{ color: T.gray, display: "flex" }}>{Icon.cart}</span>
                {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>Cart</span>}
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4, background: T.green, color: T.white,
                    fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: T.radiusFull, minWidth: 18, textAlign: "center",
                  }}>{cartCount}</span>
                )}
              </button>
            ) : (
              <button onClick={() => setShowInquiries(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: T.radiusFull,
                background: T.subtle, border: "none", cursor: "pointer",
              }}>
                <span style={{ color: T.gray, display: "flex" }}>{Icon.inbox}</span>
                {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>Quotes</span>}
                {inquiries.length > 0 && (
                  <span style={{ background: T.green, color: T.white, fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: T.radiusFull }}>{inquiries.length}</span>
                )}
              </button>
            )}

            {user ? (
              <button onClick={() => setUser(null)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: T.radiusFull,
                background: T.green, color: T.white, border: "none", cursor: "pointer",
              }}>
                <span style={{ display: "flex" }}>{Icon.user}</span>
                {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name.split(" ")[0]}</span>}
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: T.radiusFull,
                background: T.green, color: T.white, border: "none", cursor: "pointer",
              }}>
                <span style={{ display: "flex" }}>{Icon.user}</span>
                {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>Sign in</span>}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: mobile ? "24px 16px 80px" : "40px 32px 100px" }}>
        {view === "market" && <MarketPage mode={mode} onSelect={select} onAddToCart={addToCart} />}
        {view === "detail" && product && (
          <ProductDetail
            product={product} mode={mode} onBack={back}
            onAddToCart={addToCart} onQuote={addInquiry}
            user={user} onShowAuth={() => setShowAuth(true)}
          />
        )}
      </main>

      {/* Modals */}
      {showCart && <CartPanel cart={cart} setCart={setCart} onClose={() => setShowCart(false)} onCheckout={() => {}} />}
      {showInquiries && <InquiriesPanel inquiries={inquiries} onClose={() => setShowInquiries(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => { setUser(u); setShowAuth(false); }} mode={mode} />}

      {/* Styles */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: #d2d2d7; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${T.green}; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
