// Design Tokens
export const T = {
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
  error: "#dc2626",
  errorBg: "#fee2e2",
  radius: 12,
  radiusFull: 980,
};

// Configuration
export const CONFIG = {
  currency: "฿",
  minRetailKg: 10,
  minWholesaleOrder: 5000,
  deliveryOptions: {
    standard: { name: "Standard", time: "2-3 days", price: 50 },
    express: { name: "Express", time: "Same day", price: 150 },
    coldChain: { name: "Cold Chain", time: "Next day", price: 200 },
    scheduled: { name: "Scheduled", time: "Pick a date", price: 100 },
  },
};

// Grades
export const GRADES = {
  A: { label: "A", color: "#15803d", bg: "#dcfce7", desc: "Premium Export" },
  B: { label: "B", color: "#1d4ed8", bg: "#dbeafe", desc: "Standard" },
  C: { label: "C", color: "#a16207", bg: "#fef9c3", desc: "Economy" },
};

// Categories (fallback if API fails)
export const CATEGORIES = [
  { id: "fruits", name: "Fruits", icon: "🍎", subcats: ["Tropical", "Berries", "Citrus", "Stone Fruits"] },
  { id: "vegetables", name: "Vegetables", icon: "🥬", subcats: ["Leafy Greens", "Root", "Tomatoes", "Peppers"] },
  { id: "grains", name: "Grains & Rice", icon: "🌾", subcats: ["Thai Rice", "Organic Rice", "Cereals"] },
  { id: "herbs", name: "Herbs & Spices", icon: "🌿", subcats: ["Fresh Herbs", "Roots", "Dried Spices"] },
];

// Storage keys
export const STORAGE_KEYS = {
  cart: "aether_cart",
  user: "aether_user",
  inquiries: "aether_inquiries",
  mode: "aether_mode",
  token: "aether_token",
};
