import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import { Header } from './components/layout/Header';
import { CartPanel } from './components/cart/CartPanel';
import { AuthModal } from './components/cart/AuthModal';
import { QuickCheckout } from './components/checkout/QuickCheckout';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppContent() {
  const navigate = useNavigate();
  const { showCart, setShowCart, showAuth, setShowAuth, cart, clearCart } = useStore();
  const [showQuickCheckout, setShowQuickCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const handleSelectProduct = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowQuickCheckout(true);
  };

  const handleOrderComplete = (order) => {
    setOrderComplete(order);
    setShowQuickCheckout(false);
    // Show success briefly then navigate
    setTimeout(() => {
      setOrderComplete(null);
      navigate('/orders');
    }, 2000);
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
        onComplete={handleOrderComplete}
      />

      {/* Order Success Toast */}
      {orderComplete && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: T.green,
            color: '#fff',
            padding: '16px 24px',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>✓</span>
          <div>
            <div style={{ fontWeight: 600 }}>Order Placed!</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>#{orderComplete.orderNumber}</div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (when items in cart and cart not visible) */}
      {cart.length > 0 && !showCart && !showQuickCheckout && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: '14px 24px',
            borderRadius: 50,
            background: T.green,
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 20px rgba(45,106,79,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 15,
            fontWeight: 600,
            zIndex: 100,
          }}
        >
          <span>🛒</span>
          View Cart ({cart.length})
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
