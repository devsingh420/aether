import { useEffect } from 'react';
import { T } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useMobile } from '../../hooks/useWidth';
import { useLockScroll } from '../../hooks/useLockScroll';

export function Modal({ isOpen, onClose, title, children, width = 480 }) {
  const isMobile = useMobile();

  useLockScroll(isOpen);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          background: T.white,
          width: isMobile ? '100%' : width,
          maxWidth: '100%',
          maxHeight: isMobile ? '90vh' : '85vh',
          borderRadius: isMobile ? '24px 24px 0 0' : T.radius * 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: T.subtle,
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: T.gray,
              }}
            >
              {Icon.close}
            </button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 20,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Modal;
