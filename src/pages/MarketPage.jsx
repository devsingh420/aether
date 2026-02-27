import { useState, useMemo } from 'react';
import { T, CATEGORIES, GRADES } from '../data/constants';
import { Icon } from '../data/icons';
import { useStore } from '../store';
import { useMobile } from '../hooks/useWidth';
import { ProductCard } from '../components/product/ProductCard';
import { FeaturedBanner } from '../components/home/FeaturedBanner';
import { HotSales } from '../components/home/HotSales';
import { FeaturedProducts } from '../components/home/FeaturedProducts';

import { PRODUCTS, FARMS, PRICE_TRENDS, getFeaturedProducts, getHotSaleProducts, getProductsWithFarms } from '../data/mockData';

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

  // Get products with farm data
  const allProducts = useMemo(() => getProductsWithFarms(), []);
  const featuredProducts = useMemo(() => getFeaturedProducts(), []);
  const hotSaleProducts = useMemo(() => getHotSaleProducts(), []);

  const hasActiveFilters = filters.category || filters.grade || filters.farmId || search;

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (filters.category && product.cat !== filters.category) return false;
      if (filters.grade && product.grade !== filters.grade) return false;
      if (filters.farmId && product.farmId !== filters.farmId) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !product.name.toLowerCase().includes(q) &&
          !product.farm?.name?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allProducts, filters, search]);

  const activeFiltersCount =
    (filters.category ? 1 : 0) + (filters.grade ? 1 : 0) + (filters.farmId ? 1 : 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      {/* Featured sections (only when no filters) */}
      {!hasActiveFilters && (
        <>
          <FeaturedBanner />
          <HotSales products={hotSaleProducts} onSelect={onSelectProduct} />
          <FeaturedProducts products={featuredProducts} onSelect={onSelectProduct} />
        </>
      )}

      {/* Market Trends (wholesale only) */}
      {mode === 'wholesale' && !hasActiveFilters && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            Market Trends (7-day)
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
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: T.gray }}>{trend.name}</p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 18,
                    fontWeight: 700,
                    color: trend.change >= 0 ? T.green : T.error,
                  }}
                >
                  {trend.change >= 0 ? '↑' : '↓'} {Math.abs(trend.change)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Products Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {hasActiveFilters ? `Results (${filteredProducts.length})` : 'All Products'}
        </h2>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: T.white,
            padding: '10px 16px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <span style={{ color: T.gray }}>{Icon.search}</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontFamily: T.font,
              background: 'transparent',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            background: T.white,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div
          style={{
            background: T.white,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Categories */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilters(f => ({
                    ...f,
                    category: f.category === cat.id ? null : cat.id,
                  }))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: 'none',
                    background: filters.category === cat.id ? T.green : T.subtle,
                    color: filters.category === cat.id ? T.white : T.text,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grades */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Grade</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(GRADES).map(([key, grade]) => (
                <button
                  key={key}
                  onClick={() => setFilters(f => ({
                    ...f,
                    grade: f.grade === key ? null : key,
                  }))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `2px solid ${filters.grade === key ? grade.color : T.border}`,
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

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => setFilters({ category: null, grade: null, farmId: null })}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                color: T.error,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ color: T.gray, margin: 0 }}>No products found</p>
          <button
            onClick={() => {
              setFilters({ category: null, grade: null, farmId: null });
              setSearch('');
            }}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: T.green,
              color: T.white,
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, 1fr)'
              : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: isMobile ? 12 : 20,
          }}
        >
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketPage;
