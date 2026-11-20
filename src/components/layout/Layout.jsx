import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Menu,
  X,
  ShoppingCart,
  Home,
  User,
  Shield,
  Clock,
  BarChart3,
  CreditCard,
  LogOut,
  Mail,
  Package,
  Flame,
  Grid,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { items, count, total, clearCart, updateQuantity } = useCart();
  const location = useLocation();

  const navLinks = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Package, label: 'Meus Pedidos', path: '/pedidos' },
    { icon: CreditCard, label: 'Financeiro', path: '/financeiro' },
  ];

  const adminLinks = [
    { icon: Shield, label: 'Dashboard', path: '/admin' },
    { icon: Grid, label: 'Editar Produtos', path: '/admin/produtos' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
    { icon: Clock, label: 'Histórico de Pedidos', path: '/admin/pedidos' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo_comidaria.png"
              alt="Comidaria IOS"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-xl tracking-tight">Comidaria IOS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.path)
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3 cursor-pointer lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-700" />
            </div>

            <div className="flex-1 hidden lg:flex items-center justify-center max-w-md">
              <div className="relative w-full">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar restaurantes, pratos..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-primary-600" />
                {count > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-xs">
                    {user?.email?.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-sm font-medium text-gray-900">
                    Admin
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold">Carrinho</h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
                <ShoppingCart className="w-8 h-8 opacity-50 mb-2" />
                <p className="text-sm">Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="p-5 border-t border-gray-100 bg-white">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-4">
              <span>Entrega</span>
              <span>R$ 5,90</span>
            </div>
            <button
              disabled={items.length === 0}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 ${
                items.length > 0
                  ? 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              Finalizar Pedido
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 mt-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
