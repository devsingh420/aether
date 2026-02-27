import { useState, useEffect } from 'react';
import { T } from '../../data/constants';
import { useStore } from '../../store';
import { fmt } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

const DELIVERY_OPTIONS = [
  { id: 'express', label: 'Express', time: '2-3 hours', fee: 80, icon: '⚡' },
  { id: 'standard', label: 'Standard', time: 'Tomorrow', fee: 40, icon: '🚚' },
];

export function QuickCheckout({ isOpen, onClose, onComplete }) {
  const { cart, getCartTotals, clearCart, user } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    district: '',
    postalCode: '',
  });

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoading(false);
      if (user) {
        setAddress(prev => ({ ...prev, name: user.name || '' }));
      }
    }
  }, [isOpen, user]);

  const totals = getCartTotals();
  const deliveryFee = DELIVERY_OPTIONS.find(d => d.id === selectedDelivery)?.fee || 40;
  const finalTotal = totals.subtotal + deliveryFee;

  const isAddressValid = address.name && address.phone && address.street;

  const handleConfirm = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1500));

    const orderNumber = `AE${Date.now().toString(36).toUpperCase()}`;
    clearCart();
    setLoading(false);
    onComplete?.({ orderNumber, total: finalTotal });
  };

  if (!isOpen || cart.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" width={400}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: step >= s ? T.green : T.border,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div>
          <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600 }}>
            Delivery Address
          </h2>

          <Input
            placeholder="Full Name"
            value={address.name}
            onChange={e => setAddress({ ...address, name: e.target.value })}
          />
          <Input
            placeholder="Phone Number"
            type="tel"
            value={address.phone}
            onChange={e => setAddress({ ...address, phone: e.target.value })}
          />
          <Input
            placeholder="Street Address"
            value={address.street}
            onChange={e => setAddress({ ...address, street: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              placeholder="District"
              value={address.district}
              onChange={e => setAddress({ ...address, district: e.target.value })}
              style={{ marginBottom: 0 }}
            />
            <Input
              placeholder="Postal Code"
              value={address.postalCode}
              onChange={e => setAddress({ ...address, postalCode: e.target.value })}
              style={{ marginBottom: 0 }}
            />
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!isAddressValid}
            style={{ width: '100%', marginTop: 20 }}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Delivery */}
      {step === 2 && (
        <div>
          <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600 }}>
            Delivery Method
          </h2>

          {DELIVERY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedDelivery(opt.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                marginBottom: 8,
                border: `2px solid ${selectedDelivery === opt.id ? T.green : T.border}`,
                borderRadius: 12,
                background: selectedDelivery === opt.id ? T.greenLight : T.white,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{opt.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: T.gray }}>{opt.time}</div>
                </div>
              </div>
              <div style={{ fontWeight: 600, color: T.green }}>
                {fmt(opt.fee)}
              </div>
            </button>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <Button variant="outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} style={{ flex: 2 }}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Pay */}
      {step === 3 && (
        <div>
          <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600 }}>
            Confirm Order
          </h2>

          {/* Order items */}
          <div
            style={{
              background: T.subtle,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {cart.map(item => (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img
                    src={item.product.images?.[0]}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.product.name}</div>
                    <div style={{ fontSize: 12, color: T.gray }}>x{item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>
                  {fmt(item.product.retailPrice * item.quantity)}
                </div>
              </div>
            ))}

            <div style={{ paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span style={{ color: T.gray }}>Subtotal</span>
                <span>{fmt(totals.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: T.gray }}>Delivery</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: T.green }}>{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address summary */}
          <div
            style={{
              padding: 12,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>📍 Delivering to</div>
            <div style={{ color: T.gray }}>
              {address.name} • {address.phone}<br />
              {address.street}{address.district ? `, ${address.district}` : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => setStep(2)} style={{ flex: 1 }}>
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? <Spinner size={18} color={T.white} /> : `Pay ${fmt(finalTotal)}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
