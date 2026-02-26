import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import { Header } from './components/layout/Header';
import { CartPanel } from './components/cart/CartPanel';
import { AuthModal } from './components/cart/AuthModal';

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
  const { showCart, setShowCart, showAuth, setShowAuth } = useStore();

  const handleSelectProduct = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCheckout = () => {
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
