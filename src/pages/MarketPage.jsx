import { useState, useMemo } from 'react';
import { T, CATEGORIES, GRADES } from '../data/constants';
import { Icon } from '../data/icons';
import { useStore } from '../store';
import { useMobile } from '../hooks/useWidth';
import { ProductCard } from '../components/product/ProductCard';

// Mock data for now - will be replaced with API calls
import { PRODUCTS, FARMS, PRICE_TRENDS } from '../data/mockData';

function MarketTrends() {
  const { mode } = useStore();
  if (mode !== 'wholesale') return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        Market Trends (7-day avg)
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {Object.entries(PRICE_TRENDS).map(([key, trend]) => (
          <div
            key={key}
            style={{
              background: T.white,
              padding: 16,
              borderRadius: T.radius,
              border: `1px solid ${T.border}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: T.gray }}>{trend.name}</p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 16,
                fontWeight: 600,
                color: trend.change >= 0 ? T.green : T.error,
              }}
            >
              {trend.change >= 0 ? '+' : ''}
              {trend.change}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FiltersPanel({ filters, setFilters, isOpen, onClose }) {
  const isMobile = useMobile();

  if (!isOpen && isMobile) return null;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Categories */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Category</h3>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                category: f.category === cat.id ? null : cat.id,
              }))
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 12px',
              marginBottom: 4,
              border: 'none',
              borderRadius: 8,
              background: filters.category === cat.id ? T.greenLight : 'transparent',
              color: filters.category === cat.id ? T.green : T.text,
              cursor: 'pointer',
              fontSize: 14,
              textAlign: 'left',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Grades */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Grade</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(GRADES).map(([key, grade]) => (
            <button
              key={key}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  grade: f.grade === key ? null : key,
                }))
              }
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1.5px solid ${filters.grade === key ? grade.color : T.border}`,
                borderRadius: 8,
                background: filters.grade === key ? grade.bg : T.white,
                color: filters.grade === key ? grade.color : T.gray,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Farms */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Farm</h3>
        {Object.values(FARMS).map((farm) => (
          <button
            key={farm.id}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                farmId: f.farmId === farm.id ? null : farm.id,
              }))
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 12px',
              marginBottom: 4,
              border: 'none',
              borderRadius: 8,
              background: filters.farmId === farm.id ? T.greenLight : 'transparent',
              color: filters.farmId === farm.id ? T.green : T.text,
              cursor: 'pointer',
              fontSize: 14,
              textAlign: 'left',
            }}
          >
            {farm.verified && <span style={{ color: T.green }}>{Icon.shield}</span>}
            <span>{farm.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
        }}
      >
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 280,
            background: T.white,
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Filters</h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {Icon.close}
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        background: T.white,
        padding: 20,
        borderRadius: T.radius,
        border: `1px solid ${T.border}`,
        height: 'fit-content',
        position: 'sticky',
        top: 80,
      }}
    >
      {content}
    </div>
  );
}

export function MarketPage({ onSelectProduct }) {
  const isMobile = useMobile();
  const { mode } = useStore();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: null,
    grade: null,
    farmId: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (filters.category && product.cat !== filters.category) return false;
      if (filters.grade && product.grade !== filters.grade) return false;
      if (filters.farmId && product.farmId !== filters.farmId) return false;
      if (search) {
        const q = search.toLowerCase();
        const farm = FARMS[product.farmId];
        if (
          !product.name.toLowerCase().includes(q) &&
          !farm?.name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    }).map((p) => ({
      ...p,
      farm: FARMS[p.farmId],
    }));
  }, [filters, search]);

  const activeFiltersCount =
    (filters.category ? 1 : 0) + (filters.grade ? 1 : 0) + (filters.farmId ? 1 : 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      {/* Market Trends (wholesale only) */}
      <MarketTrends />

      {/* Search & Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: T.white,
            padding: '12px 16px',
            borderRadius: T.radiusFull,
            border: `1px solid ${T.border}`,
          }}
        >
          <span style={{ color: T.gray }}>{Icon.search}</span>
          <input
            type="text"
            placeholder="Search products or farms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontFamily: T.font,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}
            >
              {Icon.close}
            </button>
          )}
        </div>

        {isMobile && (
          <button
            onClick={() => setShowFilters(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 16px',
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusFull,
              cursor: 'pointer',
            }}
          >
            {Icon.filter}
            {activeFiltersCount > 0 && (
              <span
                style={{
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
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Filters sidebar (desktop) */}
        {!isMobile && (
          <FiltersPanel filters={filters} setFilters={setFilters} isOpen />
        )}

        {/* Product grid */}
        <div style={{ flex: 1 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: T.gray }}>No products found</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(2, 1fr)'
                  : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: isMobile ? 12 : 20,
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters panel */}
      {isMobile && (
        <FiltersPanel
          filters={filters}
          setFilters={setFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

export default MarketPage;
