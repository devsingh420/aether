import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useMobile } from '../../hooks/useWidth';
import { fmt, formatDate, formatRelativeTime } from '../../utils/helpers';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Select, Input } from '../../components/ui/Input';
import { LoadingOverlay, Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';

export function FarmOrders() {
  const navigate = useNavigate();
  const isMobile = useMobile();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    // This would be replaced with API call
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'AE240226ABC123',
        status: 'PAID',
        total: 2450,
        subtotal: 2250,
        deliveryFee: 150,
        platformFee: 50,
        createdAt: new Date(Date.now() - 3600000 * 2),
        user: { name: 'John Doe', email: 'john@example.com', phone: '081-234-5678' },
        items: [
          { productName: 'Hass Avocados', quantity: 10, unitPrice: 145, total: 1450 },
          { productName: 'Nam Dok Mai Mangoes', quantity: 5, unitPrice: 160, total: 800 },
        ],
        deliveryAddress: {
          name: 'John Doe',
          phone: '081-234-5678',
          address: '123 Sukhumvit Road',
          district: 'Klongtoey',
          province: 'Bangkok',
          postalCode: '10110',
        },
        deliveryMethod: 'express',
      },
      {
        id: '2',
        orderNumber: 'AE240226DEF456',
        status: 'CONFIRMED',
        total: 1890,
        subtotal: 1690,
        deliveryFee: 150,
        platformFee: 50,
        createdAt: new Date(Date.now() - 3600000 * 5),
        user: { name: 'Jane Smith', email: 'jane@example.com', phone: '089-876-5432' },
        items: [
          { productName: 'Jasmine Rice', quantity: 20, unitPrice: 52, total: 1040 },
          { productName: 'Fresh Galangal', quantity: 8, unitPrice: 82, total: 656 },
        ],
        deliveryAddress: {
          name: 'Jane Smith',
          phone: '089-876-5432',
          address: '456 Silom Road',
          district: 'Bangrak',
          province: 'Bangkok',
          postalCode: '10500',
        },
        deliveryMethod: 'standard',
      },
      {
        id: '3',
        orderNumber: 'AE240225GHI789',
        status: 'SHIPPED',
        total: 3200,
        subtotal: 2950,
        deliveryFee: 200,
        platformFee: 50,
        createdAt: new Date(Date.now() - 86400000),
        shippedAt: new Date(Date.now() - 3600000 * 12),
        user: { name: 'Bob Wilson', email: 'bob@example.com', phone: '082-345-6789' },
        items: [
          { productName: 'Royal Project Strawberries', quantity: 8, unitPrice: 320, total: 2560 },
        ],
        deliveryAddress: {
          name: 'Bob Wilson',
          address: '789 Rama 4 Road',
          district: 'Pathumwan',
          province: 'Bangkok',
          postalCode: '10330',
        },
        deliveryMethod: 'coldChain',
        delivery: { trackingNumber: 'TH1234567890' },
      },
    ];

    setOrders(mockOrders);
    setLoading(false);
  }, []);

  const filteredOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setShowUpdateModal(true);
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
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Orders</h1>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Orders' },
            { value: 'PAID', label: 'Paid (Awaiting Confirmation)' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PREPARING', label: 'Preparing' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'DELIVERED', label: 'Delivered' },
          ]}
          style={{ width: 200, marginBottom: 0 }}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div
          style={{
            background: T.white,
            padding: 40,
            borderRadius: T.radius,
            textAlign: 'center',
          }}
        >
          <p style={{ color: T.gray }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={() => handleUpdateStatus(order)}
            />
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateOrderModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdate={(newStatus, trackingNumber) => {
            // Update order in list
            setOrders((prev) =>
              prev.map((o) =>
                o.id === selectedOrder.id
                  ? {
                      ...o,
                      status: newStatus,
                      delivery: trackingNumber ? { trackingNumber } : o.delivery,
                    }
                  : o
              )
            );
            setShowUpdateModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);

  const nextStatus = {
    PAID: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'SHIPPED',
    SHIPPED: 'DELIVERED',
  }[order.status];

  return (
    <div
      style={{
        background: T.white,
        borderRadius: T.radius,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>#{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: 13, color: T.gray }}>
            {order.user.name} • {formatRelativeTime(order.createdAt)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, color: T.green }}>{fmt(order.total)}</span>
          <span
            style={{
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s',
              color: T.gray,
            }}
          >
            {Icon.chevronRight}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${T.border}` }}>
          {/* Items */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Items</h4>
            {order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: index < order.items.length - 1 ? `1px solid ${T.subtle}` : 'none',
                }}
              >
                <div>
                  <span>{item.productName}</span>
                  <span style={{ color: T.gray }}> x{item.quantity}</span>
                </div>
                <span>{fmt(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Customer info */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Customer</h4>
            <p style={{ margin: 0, fontSize: 14 }}>
              {order.user.name}<br />
              {order.user.phone}<br />
              {order.user.email}
            </p>
          </div>

          {/* Delivery address */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Delivery Address</h4>
            <p style={{ margin: 0, fontSize: 14, color: T.gray }}>
              {order.deliveryAddress.address}<br />
              {order.deliveryAddress.district}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}
            </p>
          </div>

          {/* Tracking */}
          {order.delivery?.trackingNumber && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Tracking</h4>
              <code style={{ color: T.green }}>{order.delivery.trackingNumber}</code>
            </div>
          )}

          {/* Actions */}
          {nextStatus && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Button onClick={onUpdateStatus}>
                {order.status === 'PAID' && 'Confirm Order'}
                {order.status === 'CONFIRMED' && 'Start Preparing'}
                {order.status === 'PREPARING' && 'Mark as Shipped'}
                {order.status === 'SHIPPED' && 'Mark as Delivered'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UpdateOrderModal({ isOpen, onClose, order, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const nextStatus = {
    PAID: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'SHIPPED',
    SHIPPED: 'DELIVERED',
  }[order.status];

  const handleSubmit = async () => {
    setLoading(true);
    // This would be replaced with API call
    setTimeout(() => {
      onUpdate(nextStatus, order.status === 'PREPARING' ? trackingNumber : null);
      setLoading(false);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Order Status" width={400}>
      <p style={{ margin: '0 0 16px' }}>
        Update order <strong>#{order.orderNumber}</strong> status to <strong>{nextStatus}</strong>?
      </p>

      {order.status === 'PREPARING' && (
        <Input
          label="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
          required
        />
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size={16} color={T.white} /> : 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}

export default FarmOrders;
