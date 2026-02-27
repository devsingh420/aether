import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { T, GRADES, CONFIG } from '../data/constants';
import { Icon } from '../data/icons';
import { useStore } from '../store';
import { useMobile } from '../hooks/useWidth';
import { fmt, getWholesalePrice, pct } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Badge, GradeBadge } from '../components/ui/Badge';

// Mock data - will be replaced with API
import { PRODUCTS, FARMS } from '../data/mockData';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { mode, addToCart, setShowAuth, user } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Find product
  const product = useMemo(() => {
    const p = PRODUCTS.find((p) => p.id === id);
    if (p) {
      return { ...p, farm: FARMS[p.farmId] };
    }
    return null;
  }, [id]);

  if (!product) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Product not found</p>
        <Button onClick={() => navigate('/')}>Back to Market</Button>
      </div>
    );
  }

  const farm = product.farm;
  const grade = GRADES[product.grade] || GRADES.B;
  const isWholesale = mode === 'wholesale';
  const images = product.images || [product.img];

  // Pricing
  const retailPrice = Number(product.retailPrice);
  const wholesalePrice = getWholesalePrice(product, product.moqWholesale || 50);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleRequestQuote = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowQuoteModal(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 20 : 40,
        }}
      >
        {/* Images */}
        <div>
          <div
            style={{
              position: 'relative',
              paddingTop: '75%',
              borderRadius: T.radius * 1.5,
              overflow: 'hidden',
              background: T.white,
            }}
          >
            <img
              src={images[selectedImage]}
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
                top: 16,
                left: 16,
                padding: '6px 12px',
                borderRadius: 8,
                background: grade.bg,
                color: grade.color,
                fontWeight: 700,
              }}
            >
              Grade {grade.label} - {grade.desc}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: selectedImage === i ? `2px solid ${T.green}` : `2px solid transparent`,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Farm info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <img
              src={farm.image}
              alt={farm.name}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>{farm.name}</span>
                {farm.verified && (
                  <span style={{ color: T.green }}>{Icon.shield}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.gray }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Icon.mapPin} {farm.loc}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.warning }}>
                  {Icon.star} {farm.rating} ({farm.reviews})
                </span>
              </div>
            </div>
          </div>

          {/* Product name */}
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700 }}>
            {product.name}
          </h1>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {product.needsColdChain && (
              <Badge style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                {Icon.snowflake} Cold Chain
              </Badge>
            )}
            {farm.escrow && (
              <Badge variant="success">
                {Icon.shield} Escrow Available
              </Badge>
            )}
          </div>

          {/* Description */}
          <p style={{ color: T.gray, lineHeight: 1.6, marginBottom: 20 }}>
            {product.desc}
          </p>

          
          {/* Info grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <InfoCard label="Stock" value={`${(product.stock || 0).toLocaleString()} ${product.unit}`} />
            <InfoCard label="Min Order" value={`${product.moqRetail || 1} ${product.retailUnit}`} />
            {product.needsColdChain && <InfoCard icon={Icon.snowflake} label="Storage" value="Refrigerated" />}
            <InfoCard label="Grade" value={`${product.grade} - ${grade.desc}`} />
          </div>

          {/* Pricing */}
          <div
            style={{
              background: T.white,
              padding: 20,
              borderRadius: T.radius,
              border: `1px solid ${T.border}`,
              marginBottom: 20,
            }}
          >
            {isWholesale ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: T.gray }}>Wholesale Price</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: T.green }}>
                      {fmt(wholesalePrice)}
                    </span>
                    <span style={{ color: T.gray }}>/{product.unit}</span>
                    {wholesalePrice < retailPrice && (
                      <Badge variant="success">Save {pct(wholesalePrice, retailPrice)}%</Badge>
                    )}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: T.gray }}>
                    MOQ: {product.moqWholesale || product.moq?.wholesale} {product.unit}
                  </p>
                </div>

                {/* Pricing tiers */}
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Volume Pricing</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(product.pricingTiers || product.tiers).map((tier, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: T.subtle,
                          borderRadius: 6,
                          fontSize: 14,
                        }}
                      >
                        <span>{tier.min}-{tier.max} {product.unit}</span>
                        <span style={{ fontWeight: 600 }}>{fmt(tier.price)}/{product.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  fullWidth
                  onClick={handleRequestQuote}
                  style={{ marginTop: 16 }}
                >
                  Request Quote
                </Button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: T.gray }}>Retail Price</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: T.green }}>
                      {fmt(retailPrice)}
                    </span>
                    <span style={{ color: T.gray }}>/{product.retailUnit}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: T.gray }}>
                    ({product.retailQty}{product.unit} per {product.retailUnit})
                  </p>
                </div>

                {/* Quantity selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Quantity:</span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                    }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: 40,
                        height: 40,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {Icon.minus}
                    </button>
                    <span style={{ width: 48, textAlign: 'center', fontWeight: 600 }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{
                        width: 40,
                        height: 40,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {Icon.plus}
                    </button>
                  </div>
                  <span style={{ fontSize: 14, color: T.gray }}>
                    = {(product.retailQty * quantity).toFixed(1)}{product.unit}
                  </span>
                </div>

                <Button fullWidth onClick={handleAddToCart}>
                  Add to Cart - {fmt(retailPrice * quantity)}
                </Button>
              </>
            )}
          </div>

          {/* Certifications */}
          {farm.certs && farm.certs.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Certifications</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {farm.certs.map((cert, i) => (
                  <Badge key={i} variant="success">
                    {Icon.check} {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div
      style={{
        background: T.white,
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${T.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {icon && <span style={{ color: T.gray }}>{icon}</span>}
        <span style={{ fontSize: 12, color: T.gray }}>{label}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default ProductDetailPage;
