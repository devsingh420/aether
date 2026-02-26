import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { T, GRADES } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useMobile } from '../../hooks/useWidth';
import { fmt } from '../../utils/helpers';
import { Button } from '../../components/ui/Button';
import { GradeBadge } from '../../components/ui/Badge';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { LoadingOverlay, Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';

export function FarmProducts() {
  const navigate = useNavigate();
  const isMobile = useMobile();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // This would be replaced with API call
    const mockProducts = [
      {
        id: 'p1',
        name: 'Hass Avocados',
        category: 'fruits',
        grade: 'A',
        retailPrice: 89,
        stock: 4200,
        active: true,
        images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600'],
      },
      {
        id: 'p2',
        name: 'Nam Dok Mai Mangoes',
        category: 'fruits',
        grade: 'A',
        retailPrice: 65,
        stock: 6500,
        active: true,
        images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600'],
      },
      {
        id: 'p3',
        name: 'Jasmine Rice',
        category: 'grains',
        grade: 'A',
        retailPrice: 75,
        stock: 38000,
        active: true,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
      },
    ];

    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const handleToggleActive = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, active: !p.active } : p))
    );
  };

  const handleUpdateStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Products</h1>
        <Button onClick={() => setShowAddModal(true)}>
          {Icon.plus} Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            background: T.white,
            padding: 40,
            borderRadius: T.radius,
            textAlign: 'center',
          }}
        >
          <p style={{ color: T.gray, marginBottom: 20 }}>No products yet</p>
          <Button onClick={() => setShowAddModal(true)}>Add Your First Product</Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditingProduct(product)}
              onToggleActive={() => handleToggleActive(product.id)}
              onUpdateStock={(stock) => handleUpdateStock(product.id, stock)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={(productData) => {
          if (editingProduct) {
            setProducts((prev) =>
              prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productData } : p))
            );
          } else {
            setProducts((prev) => [
              ...prev,
              { ...productData, id: `p${Date.now()}`, active: true },
            ]);
          }
          setShowAddModal(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}

function ProductCard({ product, onEdit, onToggleActive, onUpdateStock }) {
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStock, setNewStock] = useState(product.stock);

  return (
    <div
      style={{
        background: T.white,
        borderRadius: T.radius,
        overflow: 'hidden',
        opacity: product.active ? 1 : 0.6,
      }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          paddingTop: '60%',
          background: T.subtle,
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
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
          }}
        >
          <GradeBadge grade={product.grade} />
        </div>
        {!product.active && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '4px 8px',
              background: T.gray,
              color: T.white,
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Inactive
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>{product.name}</h3>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: T.green }}>
              {fmt(product.retailPrice)}
            </span>
            <span style={{ fontSize: 13, color: T.gray }}> / unit</span>
          </div>
          <div style={{ fontSize: 14 }}>
            <span style={{ color: T.gray }}>Stock: </span>
            <span style={{ fontWeight: 600 }}>{product.stock.toLocaleString()}kg</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={onEdit} style={{ flex: 1 }}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStockModal(true)}
            style={{ flex: 1 }}
          >
            Update Stock
          </Button>
          <Button
            variant={product.active ? 'ghost' : 'secondary'}
            size="sm"
            onClick={onToggleActive}
          >
            {product.active ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {/* Stock Update Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title="Update Stock"
        width={320}
      >
        <Input
          label="Current Stock (kg)"
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(Number(e.target.value))}
          min={0}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button variant="outline" onClick={() => setShowStockModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onUpdateStock(newStock);
              setShowStockModal(false);
            }}
          >
            Update
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ProductModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'fruits',
    description: '',
    grade: 'A',
    retailPrice: '',
    stock: '',
    unit: 'kg',
    retailUnit: 'piece',
    retailQty: '',
    ...product,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // This would be replaced with API call
    setTimeout(() => {
      onSave(formData);
      setLoading(false);
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add Product'}
      width={500}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'fruits', label: 'Fruits' },
              { value: 'vegetables', label: 'Vegetables' },
              { value: 'grains', label: 'Grains & Rice' },
              { value: 'herbs', label: 'Herbs & Spices' },
            ]}
          />
          <Select
            label="Grade"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            options={[
              { value: 'A', label: 'Grade A - Premium' },
              { value: 'B', label: 'Grade B - Standard' },
              { value: 'C', label: 'Grade C - Economy' },
            ]}
          />
        </div>

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Retail Price (฿)"
            type="number"
            value={formData.retailPrice}
            onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
            min={0}
            required
          />
          <Input
            label="Stock (kg)"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            min={0}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Retail Unit"
            value={formData.retailUnit}
            onChange={(e) => setFormData({ ...formData, retailUnit: e.target.value })}
            placeholder="e.g., piece, box, bag"
          />
          <Input
            label="Qty per Unit (kg)"
            type="number"
            step="0.01"
            value={formData.retailQty}
            onChange={(e) => setFormData({ ...formData, retailQty: Number(e.target.value) })}
            min={0}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size={16} color={T.white} /> : product ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FarmProducts;
