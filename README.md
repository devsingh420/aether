# Aether Produce

**Direct-to-farm B2B produce marketplace for Thailand**

Live: https://talaadnoi.netlify.app/

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Models](#data-models)
5. [Components](#components)
6. [Features](#features)
7. [Design System](#design-system)
8. [User Flows](#user-flows)
9. [API Integration Points](#api-integration-points)
10. [Future Development](#future-development)
11. [Running Locally](#running-locally)
12. [Deployment](#deployment)

---

## Overview

Aether is an inquiry-based B2B marketplace connecting buyers (hotels, restaurants, retailers) directly with Thai farms. Unlike traditional e-commerce with shopping carts, buyers submit inquiries specifying quantity and proposed price, then negotiate directly with farms.

### Key Value Propositions
- **Direct sourcing**: No middlemen, transparent pricing
- **Tiered pricing**: Volume discounts (Entry → Bulk → Trade)
- **Quality grading**: A/B/C grades with clear standards
- **Farm verification**: Verified farms with certifications
- **Cold-chain logistics**: Delivery time guarantees

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Inline CSS (CSS-in-JS) |
| State | React Hooks (useState, useEffect, useMemo) |
| Persistence | localStorage |
| Deployment | Netlify / GitHub Pages |
| Images | Unsplash CDN |

### Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.1.0"
}
```

---

## Project Structure

```
aether/
├── src/
│   ├── App.jsx          # Main application (all components)
│   └── main.jsx         # React entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
├── netlify.toml         # Netlify deployment config
└── .github/
    └── workflows/
        └── deploy.yml   # GitHub Pages deployment
```

### Single-File Architecture
Currently all components are in `App.jsx` (~1900 lines). For scaling, consider splitting into:

```
src/
├── components/
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── PriceChart.jsx
│   ├── FiltersPanel.jsx
│   └── ...
├── pages/
│   ├── MarketPage.jsx
│   └── ProductDetail.jsx
├── data/
│   ├── farms.js
│   ├── products.js
│   └── categories.js
├── hooks/
│   ├── useWidth.js
│   └── useLockScroll.js
├── utils/
│   └── helpers.js
└── App.jsx
```

---

## Data Models

### Farm
```javascript
{
  id: "kasem",                    // Unique identifier
  name: "Kasem Farms",            // Display name
  loc: "Chiang Rai",              // Location/province
  rating: 4.97,                   // Average rating (1-5)
  reviews: 312,                   // Number of reviews
  verified: true,                 // Platform verification status
  established: 2008,              // Year founded
  size: "200 rai",                // Farm size
  delivery: "24-48 hours to Bangkok",  // Delivery estimate
  image: "https://...",           // Farm hero image URL
  desc: "Family-owned farm...",   // Full description
  certs: ["GlobalGAP", "Organic"] // Certifications array
}
```

### Product
```javascript
{
  id: "p1",                       // Unique identifier
  farmId: "kasem",                // Reference to farm
  name: "Hass Avocados",          // Product name
  cat: "Fruit",                   // Category (Fruit/Veg/Grain/Herb/Berry/Greens)
  img: "https://...",             // Main image URL
  images: ["https://..."],        // Gallery images array
  avail: 4200,                    // Available stock (kg)
  grade: "A",                     // Quality grade (A/B/C)
  harvest: "Daily at 4am",        // Harvest schedule
  shelf: "7-10 days",             // Shelf life
  storage: "Store at 4-7°C",      // Storage instructions
  desc: "Premium grade...",       // Full description
  specs: ["Size: 180-220g"],      // Specifications array
  tiers: [                        // Pricing tiers
    { min: 1, max: 100, price: 180 },
    { min: 101, max: 500, price: 145 },
    { min: 501, max: 2000, price: 115 }
  ]
}
```

### Inquiry
```javascript
{
  id: 1708900000000,              // Timestamp-based ID
  product: { /* Product object */ },
  farm: { /* Farm object */ },
  qty: 500,                       // Requested quantity (kg)
  price: 145,                     // Proposed unit price (THB)
  total: 72500,                   // Total value (THB)
  msg: "Need delivery by...",     // Buyer message
  status: "pending",              // Status: pending/negotiating/accepted/closed
  date: "2024-02-25T08:00:00Z"    // ISO timestamp
}
```

### User
```javascript
{
  id: 1708900000000,              // Timestamp-based ID
  email: "buyer@company.com",
  name: "John Doe",
  company: "Hotel Group Co.",     // Optional
  phone: "+66812345678"           // Optional
}
```

### Category
```javascript
{
  id: "fruits",
  name: "Fruits",
  icon: "🍎",
  subcats: [
    { id: "tropical", name: "Tropical Fruits" },
    { id: "berries", name: "Berries" },
    { id: "citrus", name: "Citrus" }
  ]
}
```

### Grade
```javascript
{
  A: { label: "A", color: "#15803d", bg: "#dcfce7", desc: "Premium export quality" },
  B: { label: "B", color: "#1d4ed8", bg: "#dbeafe", desc: "Standard quality" },
  C: { label: "C", color: "#a16207", bg: "#fef9c3", desc: "Economy grade" }
}
```

### Price Trend
```javascript
{
  name: "Fruits",
  data: [142, 145, 148, 144, 150, 153, 155],  // Last 7 days
  change: +9.2                                  // % change
}
```

---

## Components

### Core Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `App` | Root component, routing, state | - |
| `MarketPage` | Product browsing, search, filters | `onSelect` |
| `ProductDetail` | Product page with pricing | `product`, `onBack`, `onInquiry`, `user`, `onShowAuth` |
| `Card` | Product card in grid | `product`, `onClick` |

### UI Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `Modal` | Overlay container | `children`, `onClose`, `wide` |
| `InquiryModal` | Submit inquiry form | `product`, `farm`, `qty`, `price`, `total`, `onClose`, `onSubmit` |
| `InquiriesPanel` | List of user inquiries | `inquiries`, `onClose` |
| `AuthModal` | Login/Register form | `onClose`, `onLogin` |
| `FiltersPanel` | Category/Grade/Farm filters | `filters`, `setFilters`, `products` |
| `MarketTrends` | Price trend charts | - |
| `PriceChart` | Sparkline SVG chart | `data`, `change`, `height`, `width` |

### Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useWidth` | Window width for responsive | `number` |
| `useLockScroll` | Lock body scroll for modals | - |

---

## Features

### Implemented ✅

| Feature | Description |
|---------|-------------|
| Product Browsing | Grid view with images, prices, grades |
| Search | Filter by name, farm, category |
| Category Filters | Fruits, Vegetables, Grains, Herbs |
| Grade Filters | A, B, C quality levels |
| Farm Filters | Filter by specific farm |
| Market Trends | 7-day price charts per category |
| Product Detail | Full specs, gallery, farm info |
| Tiered Pricing | Volume-based price calculator |
| Inquiry System | Submit price/quantity proposals |
| User Auth | Login/Register (localStorage) |
| Inquiry History | View past inquiries |
| Minimum Order | ฿1,000 minimum enforcement |
| Responsive Design | Mobile-first layout |
| Persistence | localStorage for user/inquiries |

### Not Implemented ❌

| Feature | Priority | Notes |
|---------|----------|-------|
| Backend API | High | Replace static data |
| Real Authentication | High | JWT/OAuth |
| Payment Integration | High | Stripe/PromptPay |
| Order Management | High | Track order status |
| Real-time Chat | Medium | Buyer-farm messaging |
| Notifications | Medium | Email/Line alerts |
| Admin Dashboard | Medium | Farm management |
| Reviews & Ratings | Medium | Post-transaction feedback |
| Favorites/Wishlist | Low | Save products |
| Multi-language | Low | Thai/English |
| Analytics | Low | Usage tracking |

---

## Design System

### Colors
```javascript
const T = {
  black: "#000",           // Primary text, buttons
  text: "#1d1d1f",         // Body text
  gray: "#86868b",         // Secondary text
  subtle: "#f5f5f7",       // Backgrounds
  border: "#d2d2d7",       // Borders
  green: "#34c759",        // Success, verified
  white: "#fff",           // Cards, modals
};
```

### Typography
```javascript
font: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif"
fontDisplay: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif"
```

### Spacing
- Border radius: `12px` (standard), `980px` (pills)
- Padding: `12-20px` (components), `20-40px` (page)
- Gap: `8-12px` (small), `20-32px` (sections)

### Breakpoints
- Mobile: `< 768px`
- Desktop: `≥ 768px`

### Grade Colors
| Grade | Background | Text |
|-------|------------|------|
| A | `#dcfce7` | `#15803d` |
| B | `#dbeafe` | `#1d4ed8` |
| C | `#fef9c3` | `#a16207` |

---

## User Flows

### 1. Browse & Inquiry Flow
```
Landing Page
    ↓
Browse Products (search, filter)
    ↓
Select Product → Product Detail
    ↓
Adjust Quantity (slider)
    ↓
Click "Request Inquiry"
    ↓
[Not logged in?] → Auth Modal → Login/Register
    ↓
Inquiry Modal → Enter offer price, message
    ↓
Submit → Confirmation
    ↓
View in Inquiries Panel
```

### 2. Authentication Flow
```
Click "Sign in" (header)
    ↓
Auth Modal opens
    ↓
Enter email, password
    ↓
[New user?] → Switch to Register
    ↓
Enter name, company, phone
    ↓
Submit → User saved to localStorage
    ↓
Header shows user name
```

### 3. Filter Flow
```
Click "Filters" button
    ↓
Filter Panel expands
    ↓
Select categories (Fruits, Vegetables...)
    ↓
Select grades (A, B, C)
    ↓
Select farms
    ↓
Products filtered in real-time
    ↓
"Clear all" to reset
```

---

## API Integration Points

When connecting to a backend, replace these areas:

### 1. Data Fetching
```javascript
// Current: Static data
const PRODUCTS = [...]
const FARMS = {...}

// Future: API calls
const [products, setProducts] = useState([]);
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setProducts);
}, []);
```

### 2. Authentication
```javascript
// Current: localStorage
const saveUser = user => localStorage.setItem(USER_KEY, JSON.stringify(user));

// Future: JWT tokens
const login = async (email, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const { token, user } = await res.json();
  localStorage.setItem('token', token);
  return user;
};
```

### 3. Inquiries
```javascript
// Current: localStorage
const saveInquiries = list => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// Future: API
const submitInquiry = async (inquiry) => {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(inquiry)
  });
  return res.json();
};
```

### 4. Price Trends
```javascript
// Current: Static mock data
const PRICE_TRENDS = {...}

// Future: Real-time API
const [trends, setTrends] = useState({});
useEffect(() => {
  fetch('/api/market/trends?period=7d').then(r => r.json()).then(setTrends);
}, []);
```

---

## Future Development

### Phase 1: Backend Integration
- [ ] Set up Node.js/Express or Python/FastAPI backend
- [ ] PostgreSQL database for products, farms, users
- [ ] JWT authentication
- [ ] REST API endpoints
- [ ] Image upload to S3/Cloudinary

### Phase 2: Core Features
- [ ] Real order/inquiry management
- [ ] Email notifications (SendGrid)
- [ ] Line notifications (@line/bot-sdk)
- [ ] Farm dashboard for managing inquiries
- [ ] Payment integration (Stripe/PromptPay)

### Phase 3: Enhancement
- [ ] Real-time chat (Socket.io)
- [ ] Review system after transactions
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Thai language support

### Phase 4: Scale
- [ ] CDN for images
- [ ] Redis caching
- [ ] Search with Elasticsearch
- [ ] Recommendation engine
- [ ] Multi-tenant for farm groups

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone repository
git clone https://github.com/devsingh420/aether.git
cd aether

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Build
```bash
npm run build
# Output in /dist folder
```

### Preview Production Build
```bash
npm run preview
```

---

## Deployment

### Netlify (Current)
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Auto-deploys on push to `main`

Config file: `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages
Uses GitHub Actions workflow in `.github/workflows/deploy.yml`

1. Push to `main` branch
2. Action builds and deploys to GitHub Pages
3. Available at `https://<username>.github.io/aether/`

Note: Update `vite.config.js` base path:
```javascript
base: '/aether/',  // For GitHub Pages
base: '/',         // For Netlify/custom domain
```

---

## Environment Variables

Currently none required. For production:

```env
VITE_API_URL=https://api.aether.com
VITE_STRIPE_KEY=pk_live_...
VITE_LINE_CHANNEL_ID=...
```

Access in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Open Pull Request

---

## License

MIT License - See LICENSE file

---

## Contact

- GitHub: [@devsingh420](https://github.com/devsingh420)
- Line: @aether
