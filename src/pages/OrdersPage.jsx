import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { T } from '../data/constants';
import { Icon } from '../data/icons';
import { useStore } from '../store';
import { useMobile } from '../hooks/useWidth';
import { fmt, formatDate, formatRelativeTime } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingOverlay } from '../components/ui/Spinner';

export function OrdersPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { user, setShowAuth } = useStore();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2>Please sign in to view orders</h2>
        <Button onClick={() => setShowAuth(true)}>Sign In</Button>
      </div>
    );
  }

  // Mock orders for demo
  useEffect(() => {
    // This would be replaced with API call
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'AE240225ABC123',
        status: 'DELIVERED',
        total: 1250,
        createdAt: new Date(Date.now() - 86400000 * 3),
        deliveredAt: new Date(Date.now() - 86400000),
        items: [
          { productName: 'Hass Avocados', quantity: 2, unitPrice: 89, total: 178 },
          { productName: 'Jasmine Rice', quantity: 5, unitPrice: 75, total: 375 },
        ],
        farm: { name: 'Kasem Farms' },
      },
      {
        id: '2',
        orderNumber: 'AE240226DEF456',
        status: 'SHIPPED',
        total: 890,
        createdAt: new Date(Date.now() - 86400000),
        items: [
          { productName: 'Royal Project Strawberries', quantity: 4, unitPrice: 95, total: 380 },
        ],
        farm: { name: 'Niran Hill Growers' },
        delivery: { trackingNumber: 'TH1234567890' },
      },
    ];

    setOrders(mockOrders);

    if (orderNumber) {
      const order = mockOrders.find((o) => o.orderNumber === orderNumber);
      setSelectedOrder(order);
    }

    setLoading(false);
  }, [orderNumber]);

  if (loading) {
    return <LoadingOverlay />;
  }

  // Show order detail if orderNumber is provided
  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => navigate('/orders')} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div
          style={{
            background: T.white,
            padding: 40,
            borderRadius: T.radius,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ color: T.gray, marginBottom: 20 }}>No orders yet</p>
          <Button onClick={() => navigate('/')}>Start Shopping</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.orderNumber}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.white,
        padding: 20,
        borderRadius: T.radius,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>#{order.orderNumber}</div>
          <div style={{ fontSize: 13, color: T.gray }}>
            {formatRelativeTime(order.createdAt)}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ fontSize: 14, color: T.gray, marginBottom: 8 }}>
        {order.farm?.name} • {order.items.length} item(s)
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: T.green }}>{fmt(order.total)}</span>
        <span style={{ color: T.gray, display: 'flex', alignItems: 'center', gap: 4 }}>
          View details {Icon.chevronRight}
        </span>
      </div>
    </div>
  );
}

function OrderDetail({ order, onBack }) {
  const isMobile = useMobile();

  const statusSteps = [
    { status: 'PENDING', label: 'Order Placed' },
    { status: 'PAID', label: 'Payment Confirmed' },
    { status: 'CONFIRMED', label: 'Farm Confirmed' },
    { status: 'PREPARING', label: 'Preparing' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: T.green,
          }}
        >
          {Icon.back} Back
        </button>
      </div>

      <div
        style={{
          background: T.white,
          padding: 24,
          borderRadius: T.radius,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>
              Order #{order.orderNumber}
            </h1>
            <p style={{ margin: 0, color: T.gray }}>
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Status timeline */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '10%',
                right: '10%',
                height: 2,
                background: T.border,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '10%',
                width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 80)}%`,
                height: 2,
                background: T.green,
                transition: 'width 0.3s',
              }}
            />

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div
                  key={step.status}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: isCompleted ? T.green : T.white,
                      border: `2px solid ${isCompleted ? T.green : T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.white,
                    }}
                  >
                    {isCompleted && Icon.check}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: isCurrent ? T.green : T.gray,
                      fontWeight: isCurrent ? 600 : 400,
                      marginTop: 8,
                      textAlign: 'center',
                      width: 60,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking info */}
        {order.delivery?.trackingNumber && (
          <div
            style={{
              background: T.subtle,
              padding: 16,
              borderRadius: T.radius,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {Icon.truck}
              <span style={{ fontWeight: 600 }}>Tracking Number</span>
            </div>
            <code style={{ fontSize: 14, color: T.green }}>{order.delivery.trackingNumber}</code>
          </div>
        )}

        {/* Items */}
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {order.items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 12,
                background: T.subtle,
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                <div style={{ fontSize: 13, color: T.gray }}>
                  {item.quantity} x {fmt(item.unitPrice)}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>{fmt(item.total)}</div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${T.border}`,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span style={{ color: T.green }}>{fmt(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        {order.status === 'PENDING' && (
          <Button variant="danger">Cancel Order</Button>
        )}
        <Button variant="outline">Contact Farm</Button>
      </div>
    </div>
  );
}

export default OrdersPage;
