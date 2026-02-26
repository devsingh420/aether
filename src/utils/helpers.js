import { CONFIG } from '../data/constants';

// Format currency
export const fmt = (n) => `${CONFIG.currency}${n.toLocaleString()}`;

// Get tier price for wholesale
export const getTier = (product, qty) => {
  const tiers = product.pricingTiers || product.tiers;
  if (!tiers || !tiers.length) return null;
  return tiers.find((t) => qty >= t.min && qty <= t.max) || tiers[tiers.length - 1];
};

// Get wholesale price per kg
export const getWholesalePrice = (product, qty) => {
  const tier = getTier(product, qty);
  return tier ? tier.price : Number(product.retailPrice);
};

// Calculate percentage discount
export const pct = (a, b) => Math.round((1 - a / b) * 100);

// Local storage helpers
export const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

export const save = (key, val) => {
  if (val !== null && val !== undefined) {
    localStorage.setItem(key, JSON.stringify(val));
  } else {
    localStorage.removeItem(key);
  }
};

// Slugify text
export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

// Calculate cart totals
export const calculateCartTotals = (cart, mode = 'retail') => {
  let subtotal = 0;
  let totalKg = 0;

  cart.forEach((item) => {
    const product = item.product || item;
    const qty = item.quantity || item.qty;

    if (mode === 'retail') {
      subtotal += Number(product.retailPrice) * qty;
      totalKg += Number(product.retailQty) * qty;
    } else {
      const price = getWholesalePrice(product, qty);
      subtotal += price * qty;
      totalKg += qty;
    }
  });

  return {
    subtotal,
    totalKg,
    itemCount: cart.length,
  };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate phone (Thai format)
export const isValidPhone = (phone) => {
  return /^0[689]\d{8}$/.test(phone.replace(/[-\s]/g, ''));
};
