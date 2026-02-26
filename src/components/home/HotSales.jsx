import { T } from '../../data/constants';
import { Icon } from '../../data/icons';
import { fmt } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { GradeBadge } from '../ui/Badge';
import { useStore } from '../../store';

export function HotSales({ products, onSelect }) {
  const { addToCart } = useStore();

  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 20 }}>🔥</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Hot Sales</h2>
        <span
          style={{
            background: T.error,
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 10,
          }}
        >
          LIMITED
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollSnapType: 'x mandatory',
        }}
      >
        {products.map((product) => (
          <HotSaleCard
            key={product.id}
            product={product}
            onSelect={() => onSelect(product)}
            onQuickAdd={() => addToCart(product, product.moqRetail || 1)}
          />
        ))}
      </div>
    </div>
  );
}

function HotSaleCard({ product, onSelect, onQuickAdd }) {
  const discount = product.discount || Math.floor(Math.random() * 20 + 10);
  const originalPrice = Math.round(product.retailPrice * (1 + discount / 100));

  return (
    <div
      style={{
        flex: '0 0 160px',
        background: T.white,
        borderRadius: 12,
        overflow: 'hidden',
        scrollSnapAlign: 'start',
        border: `2px solid ${T.error}20`,
      }}
    >
      {/* Image */}
      <div
        onClick={onSelect}
        style={{
          position: 'relative',
          height: 100,
          background: T.subtle,
          cursor: 'pointer',
        }}
      >
        <img
          src={product.images?.[0]}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Discount badge */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: T.error,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          -{discount}%
        </div>
        {/* Urgency indicator */}
        {product.urgentSale && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: '#fff',
              fontSize: 10,
              padding: '8px 8px 4px',
              textAlign: 'center',
            }}
          >
            ⚡ Sell fast - {product.daysLeft || 2} days left
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 10 }}>
        <div
          onClick={onSelect}
          style={{ cursor: 'pointer' }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </h4>
          <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>
            {product.farm?.name || 'Local Farm'}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.error }}>
              {fmt(product.retailPrice)}
            </span>
            <span
              style={{
                fontSize: 11,
                color: T.gray,
                textDecoration: 'line-through',
              }}
            >
              {fmt(originalPrice)}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd();
          }}
          style={{
            width: '100%',
            marginTop: 8,
            fontSize: 12,
            padding: '6px 0',
          }}
        >
          + Quick Add
        </Button>
      </div>
    </div>
  );
}
