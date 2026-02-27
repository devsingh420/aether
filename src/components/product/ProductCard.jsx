import { useState } from 'react';
import { T, GRADES } from '../../data/constants';
import { useStore } from '../../store';
import { fmt, getWholesalePrice, pct } from '../../utils/helpers';
import { PriceChangeBadge } from '../ui/Badge';

export function ProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { mode, addToCart } = useStore();

  const farm = product.farm || {};
  const grade = GRADES[product.grade] || GRADES.B;
  const isWholesale = mode === 'wholesale';

  const retailPrice = Number(product.retailPrice);
  const wholesalePrice = getWholesalePrice(product, product.moqWholesale || 50);
  const displayPrice = isWholesale ? wholesalePrice : retailPrice;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.moqRetail || 1);
  };

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '75%', background: T.subtle }}>
        <img
          src={product.images?.[0] || product.img}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Grade badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '4px 10px',
            borderRadius: 6,
            background: grade.bg,
            color: grade.color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {grade.label}
        </div>

        {/* Wholesale savings */}
        {isWholesale && wholesalePrice < retailPrice && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '4px 8px',
              borderRadius: 6,
              background: T.green,
              color: T.white,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            -{pct(wholesalePrice, retailPrice)}%
          </div>
        )}

        {/* Quick add */}
        {!isWholesale && hovered && (
          <button
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
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
              fontSize: 18,
              boxShadow: '0 4px 12px rgba(45,106,79,0.3)',
            }}
          >
            +
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 14 }}>
        {/* Farm */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          {farm.verified && <span style={{ color: T.green, fontSize: 12 }}>✓</span>}
          <span style={{ fontSize: 12, color: T.gray }}>{farm.name || 'Farm'}</span>
        </div>

        {/* Name */}
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text }}>
          {product.name}
        </h3>

        {/* Stock */}
        <p style={{ margin: '4px 0 10px', fontSize: 12, color: T.gray }}>
          {product.stock?.toLocaleString()} {product.unit} available
        </p>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.green }}>
            {fmt(displayPrice)}
          </span>
          <span style={{ fontSize: 12, color: T.gray, marginLeft: 4 }}>
            /{product.retailUnit}
          </span>
          <PriceChangeBadge change={product.priceChange} />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
