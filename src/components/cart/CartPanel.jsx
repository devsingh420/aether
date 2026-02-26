import { T, CONFIG } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useStore } from '../../store';
import { fmt } from '../../utils/helpers';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function CartPanel({ isOpen, onClose, onCheckout }) {
  const { cart, updateCartQuantity, removeFromCart, clearCart, getCartKg, getCartTotals } =
    useStore();

  const totalKg = getCartKg();
  const { subtotal } = getCartTotals();
  const canCheckout = totalKg >= CONFIG.minRetailKg;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shopping Cart" width={440}>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <p style={{ color: T.gray, margin: 0 }}>Your cart is empty</p>
        </div>
      ) : (
        <>
          {/* Minimum order notice */}
          {totalKg < CONFIG.minRetailKg && (
            <div
              style={{
                background: T.warningBg,
                padding: 12,
                borderRadius: T.radius,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <span style={{ color: T.warning }}>{Icon.truck}</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: T.warning,
                  }}
                >
                  Minimum order: {CONFIG.minRetailKg}kg
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: T.gray }}>
                  Add {(CONFIG.minRetailKg - totalKg).toFixed(1)}kg more to checkout
                </p>
              </div>
            </div>
          )}

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={(qty) => updateCartQuantity(item.productId, qty)}
                onRemove={() => removeFromCart(item.productId)}
              />
            ))}
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <span style={{ color: T.gray }}>Total Weight</span>
              <span style={{ fontWeight: 600 }}>{totalKg.toFixed(1)}kg</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
              }}
            >
              <span style={{ fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 700, color: T.green }}>{fmt(subtotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button
              fullWidth
              disabled={!canCheckout}
              onClick={() => {
                onClose();
                onCheckout?.();
              }}
            >
              Checkout
            </Button>
            <Button variant="ghost" fullWidth onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const product = item.product;
  const retailQty = product.retailQty || 1;
  const itemKg = retailQty * item.quantity;
  const itemTotal = Number(product.retailPrice) * item.quantity;

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        background: T.subtle,
        borderRadius: T.radius,
      }}
    >
      <img
        src={product.images?.[0] || product.img}
        alt={product.name}
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          objectFit: 'cover',
        }}
      />

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{product.name}</h4>
        <p style={{ margin: '4px 0', fontSize: 13, color: T.gray }}>
          {fmt(product.retailPrice)} / {product.retailUnit}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: T.white,
              borderRadius: 6,
              border: `1px solid ${T.border}`,
            }}
          >
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              style={{
                width: 28,
                height: 28,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: T.gray,
              }}
            >
              {Icon.minus}
            </button>
            <span style={{ width: 32, textAlign: 'center', fontWeight: 600 }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              style={{
                width: 28,
                height: 28,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: T.gray,
              }}
            >
              {Icon.plus}
            </button>
          </div>

          <span style={{ fontSize: 12, color: T.gray }}>{itemKg.toFixed(1)}kg</span>

          <button
            onClick={onRemove}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: T.gray,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Remove
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span style={{ fontWeight: 600, color: T.green }}>{fmt(itemTotal)}</span>
      </div>
    </div>
  );
}

export default CartPanel;
