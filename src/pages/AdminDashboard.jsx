import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Menu,
  DollarSign,
  Package,
  Clock,
  BarChart3,
  User,
  Home,
  Settings,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { MOCK_ORDERS, MOCK_FINANCE } from '../data/mockData';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/admin' },
    { id: 'produtos', icon: Package, label: 'Editar Produtos', path: '/admin/produtos' },
    { id: 'financeiro', icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro' },
    { id: 'pedidos', icon: Clock, label: 'Histórico de Pedidos', path: '/admin/pedidos' },
    { id: 'relatorios', icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
  ];

  useEffect(() => {
    const path = location.pathname;
    const tab = tabs.find((t) => path.startsWith(t.path));
    if (tab) {
      setActiveTab(tab.id);
    }
  }, [location.pathname]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'produtos':
        return <ProductsManagement />;
      case 'financeiro':
        return <FinanceOverview />;
      case 'pedidos':
        return <OrdersHistory />;
      case 'relatorios':
        return <ReportsOverview />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo_comidaria.png"
            alt="Comidaria IOS"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <h1 className="font-bold text-xl text-gray-900">Comidaria Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden w-64 bg-gray-900 text-gray-300 flex-col lg:flex border-r border-gray-800 shrink-0">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <img
                src="/logo_comidaria.png"
                alt="Comidaria IOS"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-bold text-white text-lg tracking-tight">Comidaria IOS</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tabs.find((t) => t.id === activeTab)?.label}</h2>
              <p className="text-gray-500 text-sm">Gerencie seu negócio com facilidade</p>
            </div>
            {activeTab === 'produtos' && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            )}
          </div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const statCards = [
    { label: 'Receita Hoje', value: 'R$ 1.245,50', icon: DollarSign, trend: '+12%', color: 'text-green-600 bg-green-50' },
    { label: 'Pedidos Hoje', value: '14', icon: Package, trend: '+5%', color: 'text-blue-600 bg-blue-50' },
    { label: 'Ticket Médio', value: 'R$ 68,45', icon: CreditCardIcon, trend: '-2%', color: 'text-purple-600 bg-purple-50' },
    { label: 'Avaliação', value: '4.8 ★', icon: StarIcon, trend: '+0.2', color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <span className={`text-xs font-medium ${stat.color === 'text-green-600 bg-green-50' ? 'text-green-600' : 'text-gray-600'}`}>
              {stat.trend} vs mês passado
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Pedidos Recentes</h3>
          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'entregue' ? 'bg-green-100 text-green-700' :
                    order.status === 'preparando' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'a caminho' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-[300px] flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900">Gráfico de Vendas</h3>
            <p className="text-sm text-gray-500">Análise detalhada disponível em Relatórios</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsManagement = () => {
  const { products, loading, refetch, createProduct, updateProduct, deleteProduct } = useProducts();
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', available: true });

  useEffect(() => {
    const p = editingId ? products.find((x) => x.id === editingId) : null;
    setForm({
      name: p?.name || '',
      description: p?.description || '',
      price: p?.price?.toString() || '',
      category_id: p?.category_id || '',
      image_url: p?.image_url || '',
      available: p?.available !== false,
    });
  }, [editingId, products]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      is_available: form.available,
    };
    if (editingId) {
      await updateProduct(editingId, payload);
      setEditingId(null);
    } else {
      await createProduct(payload);
    }
    setOpen(false);
    await refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await deleteProduct(id);
    await refetch();
  };

  const handleToggle = async (id, current) => {
    await updateProduct(id, { is_available: !current });
    await refetch();
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando produtos...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900">Catálogo de Produtos</h3>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {products.length} itens
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Produto</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Categoria</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Preço</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url && <img src={product.image_url} className="w-10 h-10 rounded-lg object-cover" alt={product.name} />}
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600">{product.category || '—'}</td>
                  <td className="py-4 text-right font-medium text-gray-900">R$ {Number(product.price || 0).toFixed(2)}</td>
                  <td className="py-4">
                    <button onClick={() => handleToggle(product.id, product.available)} className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.available ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => { setEditingId(product.id); setOpen(true); }} className="text-primary-600 hover:text-primary-700 mr-3"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <button onClick={() => { setEditingId(null); setOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"><Plus className="w-4 h-4" /> Novo Produto</button>
        </div>
      </div>
      {open && <ProductForm open={open} onClose={() => setOpen(false)} onSave={handleSave} form={form} setForm={setForm} editing={!!editingId} title={editingId ? 'Editar Produto' : 'Novo Produto'} />}
    </div>
  );
};

const ProductForm = ({ open, onClose, onSave, form, setForm, editing, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nhoque à Bolonhesa" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preço (R$)</label>
            <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoria ID</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} placeholder="UUID da categoria" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Imagem URL</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input id="available" type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
            <label htmlFor="available" className="text-sm text-gray-700">Disponível</label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FinanceOverview = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Receita Mensal</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">R$ 18.420,00</div>
        <p className="text-sm text-green-600 font-medium">+12% vs mês anterior</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Total de Pedidos</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">142</div>
        <p className="text-sm text-gray-500">Média de 4,7 pedidos/dia</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Cancelamentos</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">3</div>
        <p className="text-sm text-red-500 font-medium">-2% vs mês anterior</p>
      </div>
    </div>
  );
};

const OrdersHistory = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-6">Histórico Completo de Pedidos</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Pedido</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Cliente</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Data</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Valor</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 font-medium text-gray-900">{order.id}</td>
                <td className="py-4 text-gray-600">{order.customer}</td>
                <td className="py-4 text-gray-600">{order.createdAt}</td>
                <td className="py-4 text-right font-medium text-gray-900">R$ {order.total.toFixed(2)}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'entregue' ? 'bg-green-100 text-green-700' :
                    order.status === 'preparando' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'a caminho' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportsOverview = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center h-96">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <BarChart3 className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">Relatórios Avançados</h3>
      <p className="text-gray-500 text-sm text-center max-w-md">
        Acompanhe tendências de venda, produtos mais pedidos e desempenho de delivery.
      </p>
      <button className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
        Gerar Relatório
      </button>
    </div>
  );
};

// Fallback icons if not imported
const CreditCardIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 10a2 2 0 00-2 2v2a2 2 0 002 2h18a2 2 0 002-2v-2a2 2 0 00-2-2H3a2 2 0 00-2 2v2a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h1a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.91c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
