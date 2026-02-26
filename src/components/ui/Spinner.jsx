import { T } from '../../data/constants';

export function Spinner({ size = 24, color = T.green }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${T.subtle}`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
      }}
    >
      <Spinner size={32} />
      <p style={{ margin: 0, color: T.gray, fontSize: 14 }}>{message}</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: T.white,
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Spinner size={40} />
        <p style={{ marginTop: 16, color: T.gray }}>Loading...</p>
      </div>
    </div>
  );
}

export default Spinner;
