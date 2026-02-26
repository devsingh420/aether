import { useState } from 'react';
import { T } from '../../data/constants';
import { useStore } from '../../store';
import { fmt } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

const SAVED_ADDRESSES = [
  {
    id: 'addr1',
    label: 'Home',
    name: 'John Doe',
    phone: '081-234-5678',
    address: '123 Sukhumvit Road',
    district: 'Klongtoey',
    province: 'Bangkok',
    postalCode: '10110',
  },
  {
    id: 'addr2',
    label: 'Office',
    name: 'John Doe',
    phone: '081-234-5678',
    address: '456 Silom Road, Floor 15',
    district: 'Bangrak',
    province: 'Bangkok',
    postalCode: '10500',
  },
];

const DELIVERY_OPTIONS = [
  { id: 'express', label: 'Express', time: '2-3 hours', fee: 80, icon: '⚡' },
  { id: 'standard', label: 'Standard', time: 'Next day', fee: 40, icon: '🚚' },
  { id: 'scheduled', label: 'Schedule', time: 'Pick time', fee: 60, icon: '📅' },
];

export function QuickCheckout({ isOpen, onClose, onComplete }) {
  const { cart, getCartTotals, clearCart } = useStore();
  const [step, setStep] = useState('address'); // address, delivery, confirm
  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0]?.id);
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [newAddress, setNewAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const totals = getCartTotals();
  const deliveryFee = DELIVERY_OPTIONS.find(d => d.id === selectedDelivery)?.fee || 40;
  const finalTotal = totals.total + deliveryFee;

  const handleConfirm = async () => {
    setLoading(true);
    // Simulate order creation
    await new Promise(r => setTimeout(r, 1500));
    clearCart();
    setLoading(false);
    onComplete?.({
      orderNumber: `AE${Date.now().toString(36).toUpperCase()}`,
      total: finalTotal,
    });
    onClose();
  };

  const currentAddress = newAddress || SAVED_ADDRESSES.find(a => a.id === selectedAddress);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'address' ? '📍 Delivery Address' :
        step === 'delivery' ? '🚚 Delivery Method' :
        '✅ Confirm Order'
      }
      width={420}
    >
      {/* Progress bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
        }}
      >
        {['address', 'delivery', 'confirm'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: ['address', 'delivery', 'confirm'].indexOf(step) >= i
                ? T.green
                : T.border,
            }}
          />
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 'address' && (
        <div>
          {/* Saved addresses */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 8 }}>
              Saved Addresses
            </div>
            {SAVED_ADDRESSES.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                selected={selectedAddress === addr.id && !newAddress}
                onSelect={() => {
                  setSelectedAddress(addr.id);
                  setNewAddress(null);
                }}
              />
            ))}
          </div>

          {/* Add new address */}
          {newAddress ? (
            <NewAddressForm
              value={newAddress}
              onChange={setNewAddress}
              onCancel={() => setNewAddress(null)}
            />
          ) : (
            <button
              onClick={() => setNewAddress({ name: '', phone: '', address: '', district: '', province: 'Bangkok', postalCode: '' })}
              style={{
                width: '100%',
                padding: 12,
                border: `2px dashed ${T.border}`,
                borderRadius: 8,
                background: 'none',
                color: T.green,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              + Add New Address
            </button>
          )}

          <Button
            onClick={() => setStep('delivery')}
            disabled={!currentAddress}
            style={{ width: '100%' }}
          >
            Continue →
          </Button>
        </div>
      )}

      {/* Step 2: Delivery */}
      {step === 'delivery' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            {DELIVERY_OPTIONS.map((opt) => (
              <DeliveryOption
                key={opt.id}
                option={opt}
                selected={selectedDelivery === opt.id}
                onSelect={() => setSelectedDelivery(opt.id)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => setStep('address')} style={{ flex: 1 }}>
              ← Back
            </Button>
            <Button onClick={() => setStep('confirm')} style={{ flex: 2 }}>
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div>
          {/* Order summary */}
          <div
            style={{
              background: T.subtle,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Order Summary
            </div>
            {cart.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  padding: '4px 0',
                }}
              >
                <span>{item.product.name} x{item.quantity}</span>
                <span>{fmt(item.product.retailPrice * item.quantity)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: `1px solid ${T.border}`,
                marginTop: 8,
                paddingTop: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Subtotal</span>
                <span>{fmt(totals.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Delivery</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 700,
                  marginTop: 8,
                  color: T.green,
                }}
              >
                <span>Total</span>
                <span>{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div
            style={{
              padding: 12,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              📍 {currentAddress?.label || 'Delivery'} Address
            </div>
            <div style={{ color: T.gray }}>
              {currentAddress?.name} • {currentAddress?.phone}<br />
              {currentAddress?.address}, {currentAddress?.district}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => setStep('delivery')} style={{ flex: 1 }}>
              ← Back
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

function AddressCard({ address, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: 12,
        border: `2px solid ${selected ? T.green : T.border}`,
        borderRadius: 8,
        marginBottom: 8,
        cursor: 'pointer',
        background: selected ? T.greenLight : T.white,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{address.label}</span>
        {selected && <span style={{ color: T.green }}>✓</span>}
      </div>
      <div style={{ fontSize: 13, color: T.gray }}>
        {address.name} • {address.phone}<br />
        {address.address}, {address.district}
      </div>
    </div>
  );
}

function DeliveryOption({ option, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        border: `2px solid ${selected ? T.green : T.border}`,
        borderRadius: 8,
        marginBottom: 8,
        cursor: 'pointer',
        background: selected ? T.greenLight : T.white,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{option.icon}</span>
        <div>
          <div style={{ fontWeight: 600 }}>{option.label}</div>
          <div style={{ fontSize: 12, color: T.gray }}>{option.time}</div>
        </div>
      </div>
      <div style={{ fontWeight: 600, color: T.green }}>
        {fmt(option.fee)}
      </div>
    </div>
  );
}

function NewAddressForm({ value, onChange, onCancel }) {
  return (
    <div
      style={{
        padding: 12,
        border: `2px solid ${T.green}`,
        borderRadius: 8,
        marginBottom: 16,
        background: T.greenLight,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
        New Address
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Input
          placeholder="Name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          style={{ marginBottom: 0 }}
        />
        <Input
          placeholder="Phone"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          style={{ marginBottom: 0 }}
        />
      </div>
      <Input
        placeholder="Address"
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Input
          placeholder="District"
          value={value.district}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
          style={{ marginBottom: 0 }}
        />
        <Input
          placeholder="Postal Code"
          value={value.postalCode}
          onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
          style={{ marginBottom: 0 }}
        />
      </div>
      <button
        onClick={onCancel}
        style={{
          marginTop: 8,
          background: 'none',
          border: 'none',
          color: T.gray,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
}
