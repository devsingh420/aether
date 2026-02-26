import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T, CONFIG } from '../data/constants';
import { Icon } from '../data/icons';
import { useStore } from '../store';
import { useMobile } from '../hooks/useWidth';
import { fmt } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { cart, user, setShowAuth, getCartTotals, getCartKg, clearCart } = useStore();

  const [step, setStep] = useState(1); // 1: Address, 2: Delivery, 3: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    subdistrict: '',
    district: '',
    province: 'Bangkok',
    postalCode: '',
    notes: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('promptpay');

  const { subtotal } = getCartTotals();
  const totalKg = getCartKg();
  const deliveryFee = CONFIG.deliveryOptions[deliveryMethod]?.price || 50;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + platformFee;

  // Check if user is logged in
  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2>Please sign in to checkout</h2>
        <p style={{ color: T.gray, marginBottom: 20 }}>
          You need to be logged in to place an order.
        </p>
        <Button onClick={() => setShowAuth(true)}>Sign In</Button>
      </div>
    );
  }

  // Check if cart is valid
  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: T.gray, marginBottom: 20 }}>Add some products to continue.</p>
        <Button onClick={() => navigate('/')}>Browse Products</Button>
      </div>
    );
  }

  if (totalKg < CONFIG.minRetailKg) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2>Minimum order not met</h2>
        <p style={{ color: T.gray, marginBottom: 20 }}>
          Minimum order is {CONFIG.minRetailKg}kg. You have {totalKg.toFixed(1)}kg.
        </p>
        <Button onClick={() => navigate('/')}>Add More Items</Button>
      </div>
    );
  }

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryMethod,
        deliveryAddress: address,
      };

      const response = await api.createOrder(orderData);

      if (response.success) {
        clearCart();
        navigate(`/orders/${response.data.orderNumber}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700 }}>Checkout</h1>

      {error && (
        <div
          style={{
            background: T.errorBg,
            color: T.error,
            padding: 16,
            borderRadius: T.radius,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 360px',
          gap: 24,
        }}
      >
        {/* Main form */}
        <div>
          {/* Step 1: Address */}
          <div
            style={{
              background: T.white,
              padding: 20,
              borderRadius: T.radius,
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
              Delivery Address
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Full Name"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="08X-XXX-XXXX"
                required
              />
            </div>

            <Input
              label="Address"
              value={address.address}
              onChange={(e) => setAddress({ ...address, address: e.target.value })}
              placeholder="Street address, building, floor"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Subdistrict"
                value={address.subdistrict}
                onChange={(e) => setAddress({ ...address, subdistrict: e.target.value })}
                required
              />
              <Input
                label="District"
                value={address.district}
                onChange={(e) => setAddress({ ...address, district: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select
                label="Province"
                value={address.province}
                onChange={(e) => setAddress({ ...address, province: e.target.value })}
                options={[
                  { value: 'Bangkok', label: 'Bangkok' },
                  { value: 'Nonthaburi', label: 'Nonthaburi' },
                  { value: 'Pathum Thani', label: 'Pathum Thani' },
                  { value: 'Samut Prakan', label: 'Samut Prakan' },
                ]}
              />
              <Input
                label="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Delivery Notes (optional)"
              value={address.notes}
              onChange={(e) => setAddress({ ...address, notes: e.target.value })}
              placeholder="Gate code, landmarks, etc."
              rows={2}
            />
          </div>

          {/* Step 2: Delivery Method */}
          <div
            style={{
              background: T.white,
              padding: 20,
              borderRadius: T.radius,
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
              Delivery Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(CONFIG.deliveryOptions).map(([key, option]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    borderRadius: T.radius,
                    border: `2px solid ${deliveryMethod === key ? T.green : T.border}`,
                    cursor: 'pointer',
                    background: deliveryMethod === key ? T.greenLight : T.white,
                  }}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === key}
                    onChange={() => setDeliveryMethod(key)}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${deliveryMethod === key ? T.green : T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {deliveryMethod === key && (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: T.green,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{option.name}</div>
                    <div style={{ fontSize: 13, color: T.gray }}>{option.time}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{fmt(option.price)}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Payment */}
          <div
            style={{
              background: T.white,
              padding: 20,
              borderRadius: T.radius,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
              Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PaymentOption
                selected={paymentMethod === 'promptpay'}
                onClick={() => setPaymentMethod('promptpay')}
                label="PromptPay"
                description="Scan QR code to pay"
                icon="🏦"
              />
              <PaymentOption
                selected={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
                label="Credit/Debit Card"
                description="Visa, Mastercard, JCB"
                icon="💳"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div
            style={{
              background: T.white,
              padding: 20,
              borderRadius: T.radius,
              position: 'sticky',
              top: 80,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
              Order Summary
            </h2>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <img
                    src={item.product.images?.[0] || item.product.img}
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.product.name}</div>
                    <div style={{ fontSize: 13, color: T.gray }}>
                      x{item.quantity} {item.product.retailUnit}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {fmt(Number(item.product.retailPrice) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: T.gray }}>Subtotal ({totalKg.toFixed(1)}kg)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: T.gray }}>Delivery</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: T.gray }}>Platform Fee (5%)</span>
                <span>{fmt(platformFee)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: `1px solid ${T.border}`,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span style={{ color: T.green }}>{fmt(total)}</span>
              </div>
            </div>

            <Button
              fullWidth
              disabled={loading}
              onClick={handleSubmitOrder}
              style={{ marginTop: 20 }}
            >
              {loading ? <Spinner size={20} color={T.white} /> : `Place Order - ${fmt(total)}`}
            </Button>

            <p style={{ margin: '12px 0 0', fontSize: 12, color: T.gray, textAlign: 'center' }}>
              By placing this order, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ selected, onClick, label, description, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: T.radius,
        border: `2px solid ${selected ? T.green : T.border}`,
        cursor: 'pointer',
        background: selected ? T.greenLight : T.white,
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 13, color: T.gray }}>{description}</div>
      </div>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `2px solid ${selected ? T.green : T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: T.green,
            }}
          />
        )}
      </div>
    </button>
  );
}

export default CheckoutPage;
