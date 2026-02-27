import { T } from '../../data/constants';
import { fmt } from '../../utils/helpers';
import { useStore } from '../../store';
import { PriceChangeBadge, GradeBadge } from '../ui/Badge';

export function FeaturedProducts({ products, onSelect }) {
  const { addToCart } = useStore();

  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>⭐</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Top Picks</h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {products.slice(0, 4).map(product => (
          <div
            key={product.id}
            onClick={() => onSelect(product)}
            style={{
              background: T.white,
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ position: 'relative', paddingTop: '65%' }}>
              <img
                src={product.images?.[0]}
                alt={product.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div style={{ position: 'absolute', top: 8, left: 8 }}>
                <GradeBadge grade={product.grade} />
              </div>
            </div>

            <div style={{ padding: 12 }}>
              <h4 style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {product.name}
              </h4>
              <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
                {product.farm?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.green }}>
                  {fmt(product.retailPrice)}
                </span>
                <PriceChangeBadge change={product.priceChange} />
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  addToCart(product, product.moqRetail || 1);
                }}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 0',
                  background: T.green,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
