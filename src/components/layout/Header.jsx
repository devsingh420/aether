import { T } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useStore } from '../../store';
import { useMobile } from '../../hooks/useWidth';

function ModeToggle() {
  const { mode, setMode } = useStore();

  return (
    <div
      style={{
        display: 'flex',
        background: T.subtle,
        borderRadius: T.radiusFull,
        padding: 4,
      }}
    >
      {[
        { id: 'retail', label: 'Household', icon: Icon.home },
        { id: 'wholesale', label: 'Business', icon: Icon.building },
      ].map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            border: 'none',
            borderRadius: T.radiusFull,
            background: mode === m.id ? T.white : 'transparent',
            color: mode === m.id ? T.green : T.gray,
            fontWeight: mode === m.id ? 600 : 500,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: mode === m.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Header({ onBack, showBack = false }) {
  const isMobile = useMobile();
  const { mode, cart, inquiries, user, setShowCart, setShowInquiries, setShowAuth } = useStore();

  const cartCount = cart.length;
  const inquiryCount = inquiries.length;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '12px 16px' : '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: Logo or Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && onBack ? (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: T.green,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {Icon.back}
              {!isMobile && 'Back'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${T.green}, ${T.accent})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.white,
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                A
              </div>
              {!isMobile && (
                <span
                  style={{
                    fontFamily: T.fontDisplay,
                    fontWeight: 700,
                    fontSize: 18,
                    color: T.text,
                  }}
                >
                  Aether
                </span>
              )}
            </div>
          )}
        </div>

        {/* Center: Mode Toggle */}
        <ModeToggle />

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Cart (Retail) or Inquiries (Wholesale) */}
          {mode === 'retail' ? (
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative',
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: T.subtle,
                color: T.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {Icon.cart}
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: T.green,
                    color: T.white,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowInquiries(true)}
              style={{
                position: 'relative',
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                background: T.subtle,
                color: T.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {Icon.inbox}
              {inquiryCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: T.green,
                    color: T.white,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {inquiryCount}
                </span>
              )}
            </button>
          )}

          {/* User */}
          <button
            onClick={() => (user ? null : setShowAuth(true))}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: user ? T.greenLight : T.subtle,
              color: user ? T.green : T.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              Icon.user
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
