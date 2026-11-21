import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { OrderMonitoring } from './pages/OrderMonitoring';
import { CategoryManagement } from './pages/CategoryManagement';
import { BannerManagement } from './pages/BannerManagement';
import { Checkout } from './pages/Checkout';

// Componente wrapper para proteger rotas de admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/produto/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout><AdminDashboard /></Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <AdminRoute>
                  <Layout><OrderMonitoring /></Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/monitoramento"
              element={
                <AdminRoute>
                  <Layout><OrderMonitoring /></Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categorias"
              element={
                <AdminRoute>
                  <Layout><CategoryManagement /></Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/banners"
              element={
                <AdminRoute>
                  <Layout><BannerManagement /></Layout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <Layout><AdminDashboard /></Layout>
                </AdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
