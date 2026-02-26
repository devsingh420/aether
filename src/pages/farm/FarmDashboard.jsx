import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../data/constants';
import { Icon } from '../../data/icons';
import { useStore } from '../../store';
import { useMobile } from '../../hooks/useWidth';
import { fmt, formatRelativeTime } from '../../utils/helpers';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingOverlay } from '../../components/ui/Spinner';

export function FarmDashboard() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { user } = useStore();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with API call
    const mockStats = {
      totalProducts: 8,
      activeProducts: 6,
      totalOrders: 156,
      pendingOrders: 12,
      totalRevenue: 458750,
      monthlyRevenue: 85000,
      pendingInquiries: 5,
      averageRating: 4.92,
      pendingPayouts: 15000,
    };

    const mockOrders = [
      {
        id: '1',
        orderNumber: 'AE240226ABC123',
        status: 'PAID',
        total: 2450,
        createdAt: new Date(Date.now() - 3600000 * 2),
        user: { name: 'John Doe' },
        items: [{ productName: 'Hass Avocados', quantity: 10 }],
      },
      {
        id: '2',
        orderNumber: 'AE240226DEF456',
        status: 'CONFIRMED',
        total: 1890,
        createdAt: new Date(Date.now() - 3600000 * 5),
        user: { name: 'Jane Smith' },
        items: [{ productName: 'Jasmine Rice', quantity: 20 }],
      },
    ];

    const mockInquiries = [
      {
        id: '1',
        inquiryNumber: 'INQ240226001',
        status: 'PENDING',
        productName: 'Hass Avocados',
        quantity: 500,
        proposedPrice: 120,
        user: { name: 'ABC Restaurant', company: 'ABC Co.' },
        createdAt: new Date(Date.now() - 3600000),
      },
    ];

    setStats(mockStats);
    setRecentOrders(mockOrders);
    setRecentInquiries(mockInquiries);
    setLoading(false);
  }, []);

  if (!user || user.role !== 'FARM_OWNER') {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2>Farm Dashboard</h2>
        <p style={{ color: T.gray }}>You need to be a farm owner to access this page.</p>
        <Button onClick={() => navigate('/')}>Back to Market</Button>
      </div>
    );
  }

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 16 : 24 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700 }}>Farm Dashboard</h1>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders}
          icon={Icon.inbox}
          color={T.warning}
        />
        <StatCard
          label="Monthly Revenue"
          value={fmt(stats.monthlyRevenue)}
          icon="💰"
          color={T.green}
        />
        <StatCard
          label="Pending Inquiries"
          value={stats.pendingInquiries}
          icon={Icon.inbox}
          color={T.accent}
        />
        <StatCard
          label="Pending Payout"
          value={fmt(stats.pendingPayouts)}
          icon="🏦"
          color={T.green}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 24,
        }}
      >
        {/* Recent Orders */}
        <div
          style={{
            background: T.white,
            padding: 20,
            borderRadius: T.radius,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Recent Orders</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/farm/orders')}>
              View All
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: T.gray, textAlign: 'center', padding: 20 }}>No recent orders</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: 12,
                    background: T.subtle,
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/farm/orders/${order.id}`)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ fontSize: 13, color: T.gray }}>
                    {order.user.name} • {formatRelativeTime(order.createdAt)}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.green, marginTop: 4 }}>
                    {fmt(order.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div
          style={{
            background: T.white,
            padding: 20,
            borderRadius: T.radius,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Quote Requests</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/farm/inquiries')}>
              View All
            </Button>
          </div>

          {recentInquiries.length === 0 ? (
            <p style={{ color: T.gray, textAlign: 'center', padding: 20 }}>No pending inquiries</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  style={{
                    padding: 12,
                    background: T.subtle,
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/farm/inquiries/${inquiry.id}`)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{inquiry.productName}</span>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <div style={{ fontSize: 13, color: T.gray }}>
                    {inquiry.user.company || inquiry.user.name} • {inquiry.quantity}kg @ {fmt(inquiry.proposedPrice)}/kg
                  </div>
                  <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>
                    {formatRelativeTime(inquiry.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        <QuickAction
          label="Manage Products"
          icon="📦"
          onClick={() => navigate('/farm/products')}
        />
        <QuickAction
          label="View Orders"
          icon="📋"
          onClick={() => navigate('/farm/orders')}
        />
        <QuickAction
          label="Inquiries"
          icon="💬"
          onClick={() => navigate('/farm/inquiries')}
        />
        <QuickAction
          label="Payouts"
          icon="💰"
          onClick={() => navigate('/farm/payouts')}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        background: T.white,
        padding: 20,
        borderRadius: T.radius,
        border: `1px solid ${T.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color }}>{typeof icon === 'string' ? icon : icon}</span>
        <span style={{ fontSize: 13, color: T.gray }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function QuickAction({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = T.green;
        e.currentTarget.style.background = T.greenLight;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.background = T.white;
      }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontWeight: 600 }}>{label}</span>
    </button>
  );
}

export default FarmDashboard;
