import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — Minimal palette, maximum clarity
═══════════════════════════════════════════════════════════ */
const T = {
  font: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
  fontDisplay: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
  black: "#000",
  text: "#1d1d1f",
  gray: "#86868b",
  subtle: "#f5f5f7",
  border: "#d2d2d7",
  green: "#34c759",
  white: "#fff",
  radius: 12,
  radiusFull: 980,
};

/* ═══════════════════════════════════════════════════════════
   ICONS — Minimal, purposeful
═══════════════════════════════════════════════════════════ */
const Icon = {
  back: (
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  close: (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
      <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  check: (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
      <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  inbox: (
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 10H7L8.5 12H11.5L13 10H17" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  user: (
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 17C3 13.5 6 11 10 11C14 11 17 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  line: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2C5.03 2 1 5.37 1 9.5c0 3.04 2.36 5.64 5.62 6.53-.08.28-.5 1.82-.53 1.96-.04.2.07.4.26.47.14.05.31.02.42-.08.16-.14 2.34-1.57 3.28-2.2.31.03.63.05.95.05 4.97 0 9-3.37 9-7.5S14.97 2 10 2zm-3.5 9a.75.75 0 110-1.5.75.75 0 010 1.5zm3.5 0a.75.75 0 110-1.5.75.75 0 010 1.5zm3.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
    </svg>
  ),
};

// Minimum order amount
const MIN_ORDER = 1000;

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const FARMS = {
  kasem:  { id:"kasem",  name:"Kasem Farms",       loc:"Chiang Rai",   rating:4.97, verified:true  },
  sombat: { id:"sombat", name:"Sombat Organics",   loc:"Chiang Mai",   rating:4.89, verified:true  },
  niran:  { id:"niran",  name:"Niran Hill",        loc:"Nan",          rating:4.94, verified:true  },
  pracha: { id:"pracha", name:"Pracha Fresh",      loc:"Rayong",       rating:4.82, verified:false },
  arunee: { id:"arunee", name:"Arunee Gardens",    loc:"Kanchanaburi", rating:4.91, verified:true  },
};

const GRADES = {
  A: { label: "A", color: "#15803d", bg: "#dcfce7", desc: "Premium quality" },
  B: { label: "B", color: "#1d4ed8", bg: "#dbeafe", desc: "Standard quality" },
  C: { label: "C", color: "#a16207", bg: "#fef9c3", desc: "Economy grade" },
};

const PRODUCTS = [
  { id:"p1", farmId:"kasem",  name:"Hass Avocados",        cat:"Fruit",  img:"🥑", avail:4200, grade:"A",
    desc:"Premium grade, cold-chain harvested. Zero middlemen.",
    tiers:[{min:1,max:100,price:180},{min:101,max:500,price:145},{min:501,max:2000,price:115}] },
  { id:"p2", farmId:"sombat", name:"Jasmine Rice",          cat:"Grain",  img:"🌾", avail:38000, grade:"A",
    desc:"GI-certified Dok Mali. Milled same-day.",
    tiers:[{min:1,max:500,price:65},{min:501,max:2000,price:52},{min:2001,max:10000,price:42}] },
  { id:"p3", farmId:"niran",  name:"Strawberries",          cat:"Berry",  img:"🍓", avail:1200, grade:"A",
    desc:"Royal Project. 1,400m altitude. Ships chilled.",
    tiers:[{min:1,max:50,price:340},{min:51,max:200,price:280},{min:201,max:800,price:230}] },
  { id:"p4", farmId:"pracha", name:"Monthong Durian",       cat:"Fruit",  img:"🥭", avail:2800, grade:"B",
    desc:"Standard grade. Hand-selected at 80% ripeness.",
    tiers:[{min:1,max:50,price:420},{min:51,max:200,price:340},{min:201,max:600,price:280}] },
  { id:"p5", farmId:"arunee", name:"Baby Cos Lettuce",      cat:"Greens", img:"🥬", avail:5000, grade:"A",
    desc:"Hydroponic. Zero pesticide. 14-day shelf life.",
    tiers:[{min:1,max:100,price:115},{min:101,max:500,price:95},{min:501,max:2000,price:75}] },
  { id:"p6", farmId:"kasem",  name:"Nam Dok Mai Mangoes",   cat:"Fruit",  img:"🥭", avail:6500, grade:"A",
    desc:"Thailand's golden mango. Export grade.",
    tiers:[{min:1,max:100,price:160},{min:101,max:500,price:130},{min:501,max:2000,price:105}] },
  { id:"p7", farmId:"sombat", name:"Galangal Root",         cat:"Herb",   img:"🌿", avail:3200, grade:"B",
    desc:"Young rhizome. Certified organic.",
    tiers:[{min:1,max:100,price:100},{min:101,max:500,price:80},{min:501,max:2000,price:62}] },
  { id:"p8", farmId:"niran",  name:"Cherry Tomatoes",       cat:"Veg",    img:"🍅", avail:900, grade:"A",
    desc:"3 heirloom varieties. Never cold-stored.",
    tiers:[{min:1,max:50,price:170},{min:51,max:200,price:140},{min:201,max:600,price:115}] },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const getTier = (p, q) => p.tiers.find(t => q >= t.min && q <= t.max) || p.tiers[p.tiers.length - 1];
const getMax = p => p.tiers[p.tiers.length - 1].max;
const fmt = n => `฿${n.toLocaleString()}`;
const pct = (a, b) => Math.round((1 - a / b) * 100);

// Persistence
const STORAGE_KEY = "aether_inquiries";
const USER_KEY = "aether_user";
const loadInquiries = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const saveInquiries = list => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
const loadUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
};
const saveUser = user => user ? localStorage.setItem(USER_KEY, JSON.stringify(user)) : localStorage.removeItem(USER_KEY);

// Responsive
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// Modal scroll lock
function useLockScroll(lock) {
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lock]);
}

/* ═══════════════════════════════════════════════════════════
   CARD — Clean, scannable
═══════════════════════════════════════════════════════════ */
function Card({ product, onClick }) {
  const farm = FARMS[product.farmId];
  const grade = GRADES[product.grade];
  const low = product.tiers[product.tiers.length - 1].price;
  const high = product.tiers[0].price;
  const save = pct(low, high);
  const [hover, setHover] = useState(false);

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
      }}
    >
      {/* Image */}
      <div style={{
        background: T.subtle,
        borderRadius: T.radius,
        aspectRatio: "4/3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 8,
        marginBottom: 0,
        position: "relative",
      }}>
        <span style={{ fontSize: 56, userSelect: "none" }}>{product.img}</span>
        {/* Grade badge */}
        <span style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: grade.bg,
          color: grade.color,
          fontSize: 11,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: T.radiusFull,
        }}>Grade {grade.label}</span>
        {save > 0 && (
          <span style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: T.black,
            color: T.white,
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: T.radiusFull,
          }}>Save {save}%</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 14px 16px" }}>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 4, fontWeight: 500 }}>
          {farm.name} · {farm.loc}
        </div>
        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          color: T.text,
          marginBottom: 8,
          letterSpacing: "-0.2px",
        }}>
          {product.name}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
            {fmt(low)}
          </span>
          <span style={{ fontSize: 13, color: T.gray }}>/kg</span>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL — Simple overlay
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
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: mobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: mobile ? 0 : 24,
      }}
    >
      <div style={{
        background: T.white,
        borderRadius: mobile ? "20px 20px 0 0" : T.radius + 8,
        width: "100%",
        maxWidth: mobile ? "100%" : (wide ? 560 : 440),
        maxHeight: mobile ? "92vh" : "85vh",
        overflow: "auto",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INQUIRY MODAL — Direct, purposeful
═══════════════════════════════════════════════════════════ */
function InquiryModal({ product, farm, qty, price, total, onClose, onSubmit }) {
  const [msg, setMsg] = useState("");
  const [offer, setOffer] = useState(price.toFixed(2));
  const [sent, setSent] = useState(false);

  const submit = () => {
    setSent(true);
    setTimeout(() => {
      onSubmit({
        id: Date.now(),
        product,
        farm,
        qty,
        price: parseFloat(offer) || price,
        total: qty * (parseFloat(offer) || price),
        msg,
        status: "pending",
        date: new Date().toISOString(),
      });
    }, 1500);
  };

  return (
    <Modal onClose={() => !sent && onClose()}>
      <div style={{ padding: 28 }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#dcfce7", margin: "0 auto 20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.green,
            }}>{Icon.check}</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Inquiry sent</h2>
            <p style={{ color: T.gray }}>
              {farm.name} typically responds within 2 hours.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Send inquiry to</div>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>{farm.name}</h2>
              </div>
              <button onClick={onClose} style={{
                width: 36, height: 36, borderRadius: "50%",
                background: T.subtle, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.gray,
              }}>{Icon.close}</button>
            </div>

            {/* Order summary */}
            <div style={{
              background: T.subtle,
              borderRadius: T.radius,
              padding: 16,
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
                <div style={{ fontSize: 14, color: T.gray }}>{qty.toLocaleString()} kg</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{fmt(total)}</div>
                <div style={{ fontSize: 14, color: T.gray }}>{fmt(price)}/kg</div>
              </div>
            </div>

            {/* Offer price */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Your offer price <span style={{ color: T.gray, fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{
                display: "flex",
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                overflow: "hidden",
              }}>
                <span style={{
                  padding: "12px 14px",
                  background: T.subtle,
                  borderRight: `1px solid ${T.border}`,
                  color: T.gray,
                }}>฿</span>
                <input
                  type="number"
                  step="0.01"
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    border: "none",
                    fontSize: 16,
                    fontWeight: 500,
                    outline: "none",
                  }}
                />
                <span style={{
                  padding: "12px 14px",
                  color: T.gray,
                }}>/kg</span>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Message
              </label>
              <textarea
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Delivery requirements, timeline, special requests..."
                rows={3}
                style={{
                  width: "100%",
                  padding: 14,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  fontSize: 15,
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} style={{
                flex: 1,
                padding: 14,
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}>Cancel</button>
              <button onClick={submit} style={{
                flex: 2,
                padding: 14,
                background: T.black,
                color: T.white,
                border: "none",
                borderRadius: T.radius,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}>Send Inquiry</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   INQUIRIES PANEL — Your threads
═══════════════════════════════════════════════════════════ */
const STATUS = {
  pending: { bg: "#fef9c3", color: "#a16207", label: "Pending" },
  negotiating: { bg: "#dbeafe", color: "#1d4ed8", label: "Negotiating" },
  accepted: { bg: "#dcfce7", color: "#15803d", label: "Accepted" },
  closed: { bg: T.subtle, color: T.gray, label: "Closed" },
};

function InquiriesPanel({ inquiries, onClose }) {
  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600 }}>Inquiries</h2>
            <p style={{ fontSize: 14, color: T.gray, marginTop: 4 }}>
              {inquiries.length} conversation{inquiries.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: T.subtle, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.gray,
          }}>{Icon.close}</button>
        </div>

        {inquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: T.gray }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📭</div>
            <div style={{ fontWeight: 500, color: T.text, marginBottom: 4 }}>No inquiries yet</div>
            <div>Browse products and send your first inquiry</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inquiries.map(inq => {
              const s = STATUS[inq.status] || STATUS.pending;
              return (
                <div key={inq.id} style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  padding: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{inq.product.name}</div>
                      <div style={{ fontSize: 13, color: T.gray }}>{inq.farm.name}</div>
                    </div>
                    <span style={{
                      background: s.bg,
                      color: s.color,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: T.radiusFull,
                      height: "fit-content",
                    }}>{s.label}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    gap: 16,
                    paddingTop: 12,
                    borderTop: `1px solid ${T.subtle}`,
                    fontSize: 14,
                  }}>
                    <div>
                      <span style={{ color: T.gray }}>Qty:</span>{" "}
                      <span style={{ fontWeight: 500 }}>{inq.qty.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span style={{ color: T.gray }}>Price:</span>{" "}
                      <span style={{ fontWeight: 500 }}>{fmt(inq.price)}/kg</span>
                    </div>
                    <div>
                      <span style={{ color: T.gray }}>Total:</span>{" "}
                      <span style={{ fontWeight: 500 }}>{fmt(inq.total)}</span>
                    </div>
                  </div>
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
   AUTH MODAL — Login / Register
═══════════════════════════════════════════════════════════ */
function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (mode === "register" && !name) {
      setError("Please enter your name");
      return;
    }
    // Simulate login/register
    const user = {
      id: Date.now(),
      email,
      name: name || email.split("@")[0],
      company: company || null,
      phone: phone || null,
    };
    onLogin(user);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600 }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p style={{ fontSize: 14, color: T.gray, marginTop: 4 }}>
              {mode === "login" ? "Sign in to manage inquiries" : "Start buying direct from farms"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: T.subtle, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.gray,
          }}>{Icon.close}</button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            color: "#dc2626",
            padding: 12,
            borderRadius: T.radius,
            fontSize: 14,
            marginBottom: 16,
          }}>{error}</div>
        )}

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name *"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                padding: 14,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                fontSize: 15,
                outline: "none",
              }}
            />
          )}
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: 14,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              fontSize: 15,
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: 14,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              fontSize: 15,
              outline: "none",
            }}
          />
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Company name (optional)"
                value={company}
                onChange={e => setCompany(e.target.value)}
                style={{
                  padding: 14,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  fontSize: 15,
                  outline: "none",
                }}
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  padding: 14,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </>
          )}
        </div>

        {/* Submit */}
        <button onClick={submit} style={{
          width: "100%",
          padding: 16,
          background: T.black,
          color: T.white,
          border: "none",
          borderRadius: T.radius,
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 20,
        }}>
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        {/* Toggle */}
        <p style={{ textAlign: "center", fontSize: 14, color: T.gray, marginTop: 16 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            style={{
              background: "none",
              border: "none",
              color: T.text,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        {/* Line contact */}
        <div style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: `1px solid ${T.subtle}`,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: T.gray, marginBottom: 12 }}>Or contact us via</p>
          <a
            href="https://line.me/R/ti/p/@aether"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#06c755",
              color: T.white,
              padding: "10px 20px",
              borderRadius: T.radiusFull,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {Icon.line}
            Line @aether
          </a>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT DETAIL — Focus on the transaction
═══════════════════════════════════════════════════════════ */
function ProductDetail({ product, onBack, onInquiry, user, onShowAuth }) {
  const farm = FARMS[product.farmId];
  const grade = GRADES[product.grade];
  const max = getMax(product);
  const [qty, setQty] = useState(product.tiers[0].min);
  const [showInquiry, setShowInquiry] = useState(false);

  const w = useWidth();
  const mobile = w < 768;

  const tier = getTier(product, qty);
  const total = qty * tier.price;
  const savings = pct(tier.price, product.tiers[0].price);

  return (
    <>
      {/* Back */}
      <button onClick={onBack} style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: T.gray,
        fontSize: 15,
        padding: 0,
        marginBottom: 32,
      }}>
        {Icon.back}
        <span>Back</span>
      </button>

      <div style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
        gap: mobile ? 32 : 64,
        alignItems: "start",
      }}>
        {/* Left — Product */}
        <div>
          {/* Hero image */}
          <div style={{
            background: T.subtle,
            borderRadius: T.radius + 8,
            aspectRatio: "4/3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            position: "relative",
          }}>
            <span style={{ fontSize: mobile ? 80 : 120, userSelect: "none" }}>{product.img}</span>
            {/* Grade badge */}
            <span style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: grade.bg,
              color: grade.color,
              fontSize: 13,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: T.radiusFull,
            }}>Grade {grade.label}</span>
          </div>

          {/* Farm */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 16,
            background: T.subtle,
            borderRadius: T.radius,
            marginBottom: 20,
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: T.white,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: T.text,
            }}>
              {farm.name.split(" ").map(w => w[0]).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{farm.name}</div>
              <div style={{ fontSize: 13, color: T.gray }}>
                {farm.loc} · ★ {farm.rating}
              </div>
            </div>
            {farm.verified && (
              <span style={{
                background: "#dcfce7",
                color: "#15803d",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: T.radiusFull,
              }}>Verified</span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: 15, color: T.gray, lineHeight: 1.6 }}>
            {product.desc}
          </p>
        </div>

        {/* Right — Pricing */}
        <div>
          <h1 style={{
            fontSize: mobile ? 28 : 36,
            fontWeight: 600,
            letterSpacing: "-0.5px",
            marginBottom: 8,
          }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 15, color: T.gray, marginBottom: 32 }}>
            {product.avail.toLocaleString()} kg available
          </p>

          {/* Tiers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${product.tiers.length}, 1fr)`,
            gap: 8,
            marginBottom: 32
          }}>
            {product.tiers.map((t, i) => {
              const active = tier === t;
              return (
                <div key={i} style={{
                  padding: 16,
                  borderRadius: T.radius,
                  background: active ? T.black : T.subtle,
                  color: active ? T.white : T.text,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8, fontWeight: 500 }}>
                    {t.min}–{t.max} kg
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {fmt(t.price)}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>/kg</div>
                </div>
              );
            })}
          </div>

          {/* Quantity */}
          <div style={{
            background: T.subtle,
            borderRadius: T.radius,
            padding: 20,
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Quantity</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {qty.toLocaleString()}
                  <span style={{ fontSize: 16, fontWeight: 400, color: T.gray, marginLeft: 6 }}>kg</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Unit price</div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>{fmt(tier.price)}</div>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={product.tiers[0].min}
              max={max}
              value={qty}
              onChange={e => setQty(parseInt(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.gray }}>
              <span>{product.tiers[0].min} kg</span>
              <span>{max.toLocaleString()} kg</span>
            </div>
          </div>

          {/* Total */}
          <div style={{
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: 20,
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: T.gray, marginBottom: 4 }}>Order total</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{fmt(total)}</div>
              </div>
              {savings > 0 && (
                <div style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "8px 14px",
                  borderRadius: T.radius,
                  fontWeight: 600,
                }}>
                  Save {savings}%
                </div>
              )}
            </div>
            {total < MIN_ORDER && (
              <div style={{
                marginTop: 12,
                padding: 12,
                background: "#fef9c3",
                borderRadius: T.radius - 4,
                fontSize: 13,
                color: "#a16207",
              }}>
                Minimum order: {fmt(MIN_ORDER)}. Add {fmt(MIN_ORDER - total)} more.
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => user ? setShowInquiry(true) : onShowAuth()}
            disabled={total < MIN_ORDER}
            style={{
              width: "100%",
              padding: 18,
              background: total < MIN_ORDER ? T.border : T.black,
              color: total < MIN_ORDER ? T.gray : T.white,
              border: "none",
              borderRadius: T.radius,
              fontSize: 17,
              fontWeight: 600,
              cursor: total < MIN_ORDER ? "not-allowed" : "pointer",
            }}
          >
            {user ? "Request Inquiry" : "Sign in to Inquire"}
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: T.gray, marginTop: 12 }}>
            {user ? `Connect directly with ${farm.name}` : "Create an account to start buying"}
          </p>
        </div>
      </div>

      {showInquiry && (
        <InquiryModal
          product={product}
          farm={farm}
          qty={qty}
          price={tier.price}
          total={total}
          onClose={() => setShowInquiry(false)}
          onSubmit={inq => {
            setShowInquiry(false);
            onInquiry(inq);
          }}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MARKET PAGE — Browse
═══════════════════════════════════════════════════════════ */
function MarketPage({ onSelect }) {
  const [search, setSearch] = useState("");
  const w = useWidth();
  const mobile = w < 768;

  const list = useMemo(() => {
    if (!search) return PRODUCTS;
    const q = search.toLowerCase();
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      FARMS[p.farmId].name.toLowerCase().includes(q) ||
      p.cat.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: 48, maxWidth: 600 }}>
        <h1 style={{
          fontSize: mobile ? 36 : 56,
          fontWeight: 600,
          letterSpacing: "-1.5px",
          lineHeight: 1.05,
          marginBottom: 16,
        }}>
          Buy direct from<br />Thailand's farms.
        </h1>
        <p style={{ fontSize: mobile ? 16 : 18, color: T.gray, lineHeight: 1.5 }}>
          No middlemen. Tiered pricing. Farm-verified produce.
        </p>
      </div>

      {/* Search */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: T.subtle,
        borderRadius: T.radiusFull,
        padding: "12px 20px",
        marginBottom: 40,
        maxWidth: 480,
      }}>
        <span style={{ color: T.gray, display: "flex" }}>{Icon.search}</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products or farms..."
          style={{
            flex: 1,
            border: "none",
            background: "none",
            fontSize: 16,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.gray,
              display: "flex",
              padding: 4,
            }}
          >{Icon.close}</button>
        )}
      </div>

      {/* Results */}
      {list.length > 0 && (
        <div style={{ fontSize: 14, color: T.gray, marginBottom: 20 }}>
          {list.length} product{list.length !== 1 ? "s" : ""}
          {search && ` for "${search}"`}
        </div>
      )}

      {/* Grid */}
      {list.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: mobile ? 12 : 20,
        }}>
          {list.map(p => <Card key={p.id} product={p} onClick={onSelect} />)}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "80px 0", color: T.gray }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔍</div>
          <div style={{ fontWeight: 500, color: T.text, marginBottom: 8 }}>No results</div>
          <button
            onClick={() => setSearch("")}
            style={{
              background: T.black,
              color: T.white,
              border: "none",
              borderRadius: T.radiusFull,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              marginTop: 8,
            }}
          >Clear search</button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP — Simple, focused
═══════════════════════════════════════════════════════════ */
export default function App() {
  const w = useWidth();
  const mobile = w < 768;

  const [view, setView] = useState("market");
  const [product, setProduct] = useState(null);
  const [inquiries, setInquiries] = useState(loadInquiries);
  const [showInquiries, setShowInquiries] = useState(false);
  const [user, setUser] = useState(loadUser);
  const [showAuth, setShowAuth] = useState(false);

  // Persist inquiries and user
  useEffect(() => { saveInquiries(inquiries); }, [inquiries]);
  useEffect(() => { saveUser(user); }, [user]);

  const select = p => {
    setProduct(p);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setView("market");
    setProduct(null);
  };

  const addInquiry = inq => {
    setInquiries(prev => [inq, ...prev]);
  };

  return (
    <div style={{ fontFamily: T.font, background: T.white, minHeight: "100vh", color: T.text }}>
      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.subtle}`,
      }}>
        <div style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: mobile ? "0 20px" : "0 40px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <button onClick={back} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2d6a4f, #52b788)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ color: T.white, fontSize: 14 }}>✦</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px" }}>
              Aether
            </span>
          </button>

          {/* Right side actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Inquiries */}
            <button onClick={() => setShowInquiries(true)} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: T.subtle,
              border: "none",
              borderRadius: T.radiusFull,
              padding: "8px 14px",
              cursor: "pointer",
            }}>
              <span style={{ color: T.gray, display: "flex" }}>{Icon.inbox}</span>
              {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>Inquiries</span>}
              {inquiries.length > 0 && (
                <span style={{
                  background: T.green,
                  color: T.white,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: T.radiusFull,
                  minWidth: 20,
                  textAlign: "center",
                }}>{inquiries.length}</span>
              )}
            </button>

            {/* User */}
            {user ? (
              <button
                onClick={() => setUser(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: T.black,
                  color: T.white,
                  border: "none",
                  borderRadius: T.radiusFull,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex" }}>{Icon.user}</span>
                {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</span>}
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: T.black,
                  color: T.white,
                  border: "none",
                  borderRadius: T.radiusFull,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex" }}>{Icon.user}</span>
                {!mobile && <span style={{ fontSize: 14, fontWeight: 500 }}>Sign in</span>}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: mobile ? "32px 20px 80px" : "48px 40px 100px",
      }}>
        {view === "market" && <MarketPage onSelect={select} />}
        {view === "detail" && product && (
          <ProductDetail
            product={product}
            onBack={back}
            onInquiry={addInquiry}
            user={user}
            onShowAuth={() => setShowAuth(true)}
          />
        )}
      </main>

      {/* Modals */}
      {showInquiries && (
        <InquiriesPanel inquiries={inquiries} onClose={() => setShowInquiries(false)} />
      )}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={u => { setUser(u); setShowAuth(false); }}
        />
      )}

      {/* Global styles */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #d2d2d7;
          border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        input[type=range]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
