import { T } from '../../data/constants';
import { fmt } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { GradeBadge, PriceChangeBadge } from '../ui/Badge';
import { useStore } from '../../store';

export function FeaturedProducts({ products, onSelect }) {
  const { addToCart } = useStore();

  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Featured</h2>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: T.green,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View All →
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {products.slice(0, 4).map((product) => (
          <FeaturedCard
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

function FeaturedCard({ product, onSelect, onQuickAdd }) {
  return (
    <div
      style={{
        background: T.white,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${T.border}`,
      }}
    >
      {/* Image */}
      <div
        onClick={onSelect}
        style={{
          position: 'relative',
          paddingTop: '70%',
          background: T.subtle,
          cursor: 'pointer',
        }}
      >
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
        {product.featured && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: T.warning,
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            FEATURED
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 12 }}>
        <div onClick={onSelect} style={{ cursor: 'pointer' }}>
          <h4
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </h4>
          <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
            {product.farm?.name || 'Local Farm'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.green }}>
              {fmt(product.retailPrice)}
            </span>
            <PriceChangeBadge change={product.priceChange} />
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
            marginTop: 10,
            fontSize: 12,
          }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
