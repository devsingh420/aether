import { T } from '../../data/constants';
import { fmt } from '../../utils/helpers';
import { useStore } from '../../store';

export function HotSales({ products, onSelect }) {
  const { addToCart } = useStore();

  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>🔥</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Hot Deals</h2>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map(product => {
          const originalPrice = Math.round(product.retailPrice * (1 + (product.discount || 15) / 100));

          return (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              style={{
                flex: '0 0 150px',
                background: T.white,
                borderRadius: 16,
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ position: 'relative', height: 100 }}>
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: T.error,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}
                >
                  -{product.discount}%
                </div>
              </div>

              <div style={{ padding: 12 }}>
                <h4 style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {product.name}
                </h4>
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.green }}>
                    {fmt(product.retailPrice)}
                  </span>
                  <span style={{
                    marginLeft: 6,
                    fontSize: 12,
                    color: T.gray,
                    textDecoration: 'line-through',
                  }}>
                    {fmt(originalPrice)}
                  </span>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    addToCart(product, product.moqRetail || 1);
                  }}
                  style={{
                    width: '100%',
                    marginTop: 10,
                    padding: '8px 0',
                    background: T.green,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
