import { useState } from 'react';
import { T } from '../../data/constants';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

const QUICK_CATEGORIES = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains & Rice' },
  { value: 'herbs', label: 'Herbs & Spices' },
];

export function QuickUpload({ isOpen, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'fruits',
    price: '',
    stock: '',
    urgentSale: true,
    discount: 15,
    daysToSell: 3,
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));

    onSubmit?.({
      ...form,
      image: imagePreview,
      id: `quick-${Date.now()}`,
    });

    setLoading(false);
    setForm({
      name: '',
      category: 'fruits',
      price: '',
      stock: '',
      urgentSale: true,
      discount: 15,
      daysToSell: 3,
    });
    setImagePreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Sale Listing"
      width={400}
    >
      <div
        style={{
          background: T.warningBg,
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <strong>⚡ Sell Fast:</strong> Products listed here get priority visibility
        and appear in Hot Sales section.
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quick Image Upload */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              width: '100%',
              paddingTop: '50%',
              position: 'relative',
              background: T.subtle,
              borderRadius: 12,
              border: `2px dashed ${T.border}`,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.gray,
                }}
              >
                <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
                <span style={{ fontSize: 13 }}>Tap to add photo</span>
              </div>
            )}
          </label>
        </div>

        {/* Product Name */}
        <Input
          label="Product Name"
          placeholder="e.g., Fresh Mangoes"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        {/* Category */}
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={QUICK_CATEGORIES}
        />

        {/* Price & Stock in row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Price (฿/kg)"
            type="number"
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <Input
            label="Stock (kg)"
            type="number"
            placeholder="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
        </div>

        {/* Urgent Sale Options */}
        <div
          style={{
            background: T.subtle,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>🔥 Flash Sale</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.urgentSale}
                onChange={(e) => setForm({ ...form, urgentSale: e.target.checked })}
              />
              <span style={{ fontSize: 13 }}>Enable</span>
            </label>
          </div>

          {form.urgentSale && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: T.gray }}>Discount %</label>
                <select
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: `1px solid ${T.border}`,
                    marginTop: 4,
                  }}
                >
                  <option value={10}>10% off</option>
                  <option value={15}>15% off</option>
                  <option value={20}>20% off</option>
                  <option value={25}>25% off</option>
                  <option value={30}>30% off</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.gray }}>Days to Sell</label>
                <select
                  value={form.daysToSell}
                  onChange={(e) => setForm({ ...form, daysToSell: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: `1px solid ${T.border}`,
                    marginTop: 4,
                  }}
                >
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !form.name || !form.price || !form.stock}
          style={{ width: '100%' }}
        >
          {loading ? (
            <Spinner size={18} color={T.white} />
          ) : (
            '🚀 List Product Now'
          )}
        </Button>
      </form>
    </Modal>
  );
}
