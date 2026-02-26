import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import { Header } from './components/layout/Header';
import { CartPanel } from './components/cart/CartPanel';
import { AuthModal } from './components/cart/AuthModal';
import { QuickCheckout } from './components/checkout/QuickCheckout';
import { QuickUpload } from './components/farm/QuickUpload';

// Pages
import { MarketPage } from './pages/MarketPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { FarmDashboard, FarmOrders, FarmProducts } from './pages/farm';

// Store
import { useStore } from './store';

// Styles
import { T } from './data/constants';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const navigate = useNavigate();
  const { showCart, setShowCart, showAuth, setShowAuth, user, cart } = useStore();
  const [showQuickCheckout, setShowQuickCheckout] = useState(false);
  const [showQuickUpload, setShowQuickUpload] = useState(false);

  const isFarmer = user?.role === 'FARM_OWNER';

  const handleSelectProduct = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCheckout = () => {
    // Use quick checkout for faster experience
    setShowCart(false);
    setShowQuickCheckout(true);
  };

  const handleFullCheckout = () => {
    setShowQuickCheckout(false);
    navigate('/checkout');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.subtle,
        fontFamily: T.font,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <MarketPage onSelectProduct={handleSelectProduct} />
            </>
          }
        />
        <Route
          path="/product/:id"
          element={
            <>
              <Header showBack onBack={handleBack} />
              <ProductDetailPage />
            </>
          }
        />
        <Route
          path="/checkout"
          element={
            <>
              <Header showBack onBack={handleBack} />
              <CheckoutPage />
            </>
          }
        />
        <Route
          path="/orders"
          element={
            <>
              <Header showBack onBack={() => navigate('/')} />
              <OrdersPage />
            </>
          }
        />
        <Route
          path="/orders/:orderNumber"
          element={
            <>
              <Header showBack onBack={() => navigate('/orders')} />
              <OrdersPage />
            </>
          }
        />
        {/* Farm Dashboard Routes */}
        <Route
          path="/farm"
          element={
            <>
              <Header showBack onBack={() => navigate('/')} />
              <FarmDashboard />
            </>
          }
        />
        <Route
          path="/farm/orders"
          element={
            <>
              <Header showBack onBack={() => navigate('/farm')} />
              <FarmOrders />
            </>
          }
        />
        <Route
          path="/farm/orders/:id"
          element={
            <>
              <Header showBack onBack={() => navigate('/farm/orders')} />
              <FarmOrders />
            </>
          }
        />
        <Route
          path="/farm/products"
          element={
            <>
              <Header showBack onBack={() => navigate('/farm')} />
              <FarmProducts />
            </>
          }
        />
      </Routes>

      {/* Modals */}
      <CartPanel
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={handleCheckout}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <QuickCheckout
        isOpen={showQuickCheckout}
        onClose={() => setShowQuickCheckout(false)}
        onComplete={(order) => {
          navigate(`/orders/${order.orderNumber}`);
        }}
      />
      <QuickUpload
        isOpen={showQuickUpload}
        onClose={() => setShowQuickUpload(false)}
        onSubmit={(product) => {
          console.log('Quick upload:', product);
          // In real app, this would call API
        }}
      />

      {/* Floating Action Button for Farmers */}
      {isFarmer && (
        <button
          onClick={() => setShowQuickUpload(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: T.green,
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(45,106,79,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            zIndex: 100,
          }}
          title="Quick Sale"
        >
          +
        </button>
      )}

      {/* Quick checkout FAB when cart has items */}
      {cart.length > 0 && !showCart && !showQuickCheckout && (
        <button
          onClick={() => setShowQuickCheckout(true)}
          style={{
            position: 'fixed',
            bottom: isFarmer ? 90 : 24,
            right: 24,
            padding: '12px 20px',
            borderRadius: 28,
            background: T.green,
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(45,106,79,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 100,
          }}
        >
          <span>🛒</span>
          Quick Checkout ({cart.length})
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
