import { useState } from 'react';
import { T, GRADES, CONFIG } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useStore } from '../../store';
import { fmt, getWholesalePrice, pct } from '../../utils/helpers';

export function ProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { mode, addToCart } = useStore();

  const farm = product.farm || {};
  const grade = GRADES[product.grade] || GRADES.B;
  const isWholesale = mode === 'wholesale';

  // Get pricing based on mode
  const retailPrice = Number(product.retailPrice);
  const wholesalePrice = getWholesalePrice(product, product.moqWholesale || 50);
  const displayPrice = isWholesale ? wholesalePrice : retailPrice;
  const unit = isWholesale ? `/${product.unit}` : `/${product.retailUnit}`;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isWholesale) {
      addToCart(product, 1);
    }
  };

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        borderRadius: T.radius * 1.5,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? '0 12px 24px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          paddingTop: '75%',
          background: T.subtle,
        }}
      >
        <img
          src={product.images?.[0] || product.img}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Grade badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '4px 10px',
            borderRadius: 6,
            background: grade.bg,
            color: grade.color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Grade {grade.label}
        </div>

        {/* Wholesale savings badge */}
        {isWholesale && wholesalePrice < retailPrice && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '4px 8px',
              borderRadius: 6,
              background: T.green,
              color: T.white,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Save {pct(wholesalePrice, retailPrice)}%
          </div>
        )}

        {/* Quick add button (retail only) */}
        {!isWholesale && hovered && (
          <button
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: T.green,
              color: T.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(45,106,79,0.3)',
            }}
          >
            {Icon.plus}
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Farm info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
          }}
        >
          {farm.verified && (
            <span style={{ color: T.green }}>{Icon.shield}</span>
          )}
          <span style={{ fontSize: 12, color: T.gray }}>
            {farm.name || 'Farm'}
          </span>
          {farm.rating && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 12,
                color: T.warning,
              }}
            >
              {Icon.star} {Number(farm.rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* Product name */}
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: T.text,
            marginBottom: 4,
          }}
        >
          {product.name}
        </h3>

        {/* Stock info */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: T.gray,
            marginBottom: 12,
          }}
        >
          {product.stock || product.avail} {product.unit} available
        </p>

        {/* Price */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: T.green,
              }}
            >
              {fmt(displayPrice)}
            </span>
            <span style={{ fontSize: 13, color: T.gray }}>{unit}</span>
          </div>

          {/* Cold chain indicator */}
          {product.needsColdChain && (
            <span
              style={{
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
              }}
              title="Cold chain required"
            >
              {Icon.snowflake}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
