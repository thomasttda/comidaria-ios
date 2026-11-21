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
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useFinance } from '../hooks/useFinance';
import { useProductOptions } from '../hooks/useProductOptions';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { finance, loading: financeLoading } = useFinance();
  const { orders, loading: ordersLoading } = useOrders();
  const loading = financeLoading || ordersLoading;

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
        return <DashboardOverview finance={finance} recentOrders={orders} loading={loading} />;
      case 'produtos':
        return <ProductsManagement />;
      case 'financeiro':
        return <FinanceOverview finance={finance} loading={loading} />;
      case 'pedidos':
        return <OrdersHistory orders={orders} loading={loading} />;
      case 'relatorios':
        return <ReportsOverview />;
      default:
        return <DashboardOverview finance={finance} recentOrders={orders} loading={loading} />;
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

const DashboardOverview = ({ finance, recentOrders, loading }) => {
  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  const todayRevenue = finance?.today_revenue || 0;
  const todayOrders = finance?.today_orders || 0;
  const avgTicket = finance?.avg_ticket || 0;

  const statCards = [
    { label: 'Receita Hoje', value: `R$ ${todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Pedidos Hoje', value: todayOrders, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Ticket Médio', value: `R$ ${avgTicket.toFixed(2)}`, icon: CreditCardIcon, color: 'text-purple-600 bg-purple-50' },
    { label: 'Avaliação', value: '— ★', icon: StarIcon, color: 'text-yellow-600 bg-yellow-50' },
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Pedidos Recentes</h3>
          <div className="space-y-4">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
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
                    <span className="text-sm font-bold text-gray-900">R$ {Number(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Nenhum pedido ainda</div>
            )}
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
  const [saveError, setSaveError] = useState('');

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
    setSaveError('');
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      is_available: form.available,
    };
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setEditingId(null);
      } else {
        const { data, error } = await createProduct(payload);
        if (error || !data) throw new Error(error?.message || 'Erro ao criar produto');
      }
      setOpen(false);
      await refetch();
    } catch (err) {
      setSaveError(err.message || 'Erro ao salvar produto');
    }
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
      {open && <ProductForm open={open} onClose={() => setOpen(false)} onSave={handleSave} form={form} setForm={setForm} editing={!!editingId} editingId={editingId} saveError={saveError} setSaveError={setSaveError} title={editingId ? 'Editar Produto' : 'Novo Produto'} />}
    </div>
  );
};

const ProductForm = ({ open, onClose, onSave, form, setForm, editing, editingId, saveError, setSaveError, title }) => {
  const {
    optionCategories,
    loading: optionsLoading,
    createOptionCategory,
    updateOptionCategory,
    deleteOptionCategory,
    createOptionValue,
    updateOptionValue,
    deleteOptionValue,
  } = useProductOptions(editingId || null);

  const [newCatName, setNewCatName] = useState('');
  const [newCatRequired, setNewCatRequired] = useState(false);
  const [newCatMultiple, setNewCatMultiple] = useState(false);

  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  const [newValueDrafts, setNewValueDrafts] = useState({});
  const [editingValueId, setEditingValueId] = useState(null);
  const [editValueName, setEditValueName] = useState('');
  const [editValuePrice, setEditValuePrice] = useState('');

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await createOptionCategory(newCatName.trim(), newCatRequired, newCatMultiple);
    setNewCatName('');
    setNewCatRequired(false);
    setNewCatMultiple(false);
  };

  const handleSaveCategory = async (cat) => {
    if (!editCatName.trim()) return;
    await updateOptionCategory(cat.id, { name: editCatName.trim() });
    setEditingCatId(null);
    setEditCatName('');
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Excluir esta categoria de opções e todos os seus valores?')) return;
    await deleteOptionCategory(id);
  };

  const handleAddValueDraft = (catId) => {
    setNewValueDrafts((prev) => ({ ...prev, [catId]: { name: '', priceExtra: '' } }));
  };

  const handleCancelValueDraft = (catId) => {
    setNewValueDrafts((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
  };

  const handleSaveValue = async (catId, draft = null) => {
    const d = draft || newValueDrafts[catId];
    if (!d || !d.name.trim()) return;
    await createOptionValue(catId, d.name.trim(), Number(d.priceExtra || 0), false);
    setNewValueDrafts((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
  };

  const handleStartValueEdit = (v) => {
    setEditingValueId(v.id);
    setEditValueName(v.name);
    setEditValuePrice((v.price_extra || 0).toString());
  };

  const handleSaveValueEdit = async (v) => {
    await updateOptionValue(v.id, {
      name: editValueName.trim(),
      price_extra: Number(editValuePrice || 0),
    });
    setEditingValueId(null);
    setEditValueName('');
    setEditValuePrice('');
  };

  const handleDeleteValue = async (id) => {
    await deleteOptionValue(id);
    if (editingValueId === id) {
      setEditingValueId(null);
      setEditValueName('');
      setEditValuePrice('');
    }
  };

  const optionExtra = (catId, valueId) => {
    const cat = optionCategories.find((c) => c.id === catId);
    const v = cat?.product_option_values?.find((x) => x.id === valueId);
    return v ? Number(v.price_extra || 0) : 0;
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {saveError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Preço base (R$)</label>
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

          {editing && (
            <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Sub-opções (Sabores, Tamanhos, Adicionais)</h3>
                <button
                  onClick={handleAddCategory}
                  className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded hover:bg-primary-200 transition-colors"
                >
                  + Nova categoria
                </button>
              </div>

              <div className="flex gap-2 items-end">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Tamanho"
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <div className="flex items-center gap-1 text-xs">
                  <input id="new-cat-required" type="checkbox" checked={newCatRequired} onChange={(e) => setNewCatRequired(e.target.checked)} className="rounded border-gray-300 text-primary-600" />
                  <label htmlFor="new-cat-required" className="text-gray-600">Obrigatório</label>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <input id="new-cat-multiple" type="checkbox" checked={newCatMultiple} onChange={(e) => setNewCatMultiple(e.target.checked)} className="rounded border-gray-300 text-primary-600" />
                  <label htmlFor="new-cat-multiple" className="text-gray-600">Múltipla</label>
                </div>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  className="px-2.5 py-1.5 bg-primary-600 text-white rounded text-xs font-medium disabled:opacity-50 hover:bg-primary-700"
                >
                  Adicionar
                </button>
              </div>

              {optionsLoading ? (
                <p className="text-sm text-gray-400 text-center">Carregando opções...</p>
              ) : optionCategories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center">Nenhuma sub-opção cadastrada ainda.</p>
              ) : (
                optionCategories.map((cat) => (
                  <div key={cat.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      {editingCatId === cat.id ? (
                        <>
                          <input
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="font-semibold text-gray-900 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveCategory(cat)}
                            className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => { setEditingCatId(null); setEditCatName(''); }}
                            className="text-xs text-gray-500 ml-1 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                          <div className="flex items-center gap-1.5">
                            {cat.is_required && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 font-bold">Obrigatório</span>
                            )}
                            {cat.allow_multiple && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-bold">Múltipla</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); }}
                              className="text-xs text-primary-600 hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(cat.product_option_values || []).map((v) => (
                        <div key={v.id} className="flex items-center gap-2">
                          {editingValueId === v.id ? (
                            <>
                              <input
                                value={editValueName}
                                onChange={(e) => setEditValueName(e.target.value)}
                                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                              />
                              <input
                                type="number"
                                step="0.01"
                                value={editValuePrice}
                                onChange={(e) => setEditValuePrice(e.target.value)}
                                placeholder="0,00"
                                className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                              />
                              <div className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  defaultChecked={v.is_default}
                                  className="rounded border-gray-300 text-primary-600"
                                />
                                <label className="text-gray-600">Padrão</label>
                              </div>
                              <button
                                onClick={() => handleSaveValueEdit(v)}
                                className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => { setEditingValueId(null); setEditValueName(''); setEditValuePrice(''); }}
                                className="text-xs text-gray-500 ml-1 hover:text-gray-700"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-sm text-gray-700">{v.name}</span>
                              <span className="w-16 text-right text-xs text-gray-500 font-mono">+R$ {(v.price_extra || 0).toFixed(2)}</span>
                              {v.is_default && (
                                <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-bold">Padrão</span>
                              )}
                              <button
                                onClick={() => handleStartValueEdit(v)}
                                className="text-xs text-primary-600 hover:underline"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteValue(v.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {newValueDrafts[cat.id] ? (
                        <div className="flex gap-2">
                          <input
                            value={newValueDrafts[cat.id].name}
                            onChange={(e) => setNewValueDrafts((prev) => ({ ...prev, [catId]: { ...prev[catId], name: e.target.value } }))}
                            placeholder="Nome da opção"
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={newValueDrafts[cat.id].priceExtra}
                            onChange={(e) => setNewValueDrafts((prev) => ({ ...prev, [catId]: { ...prev[catId], priceExtra: e.target.value } }))}
                            placeholder="Extra"
                            className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                          <button
                            onClick={() => handleSaveValue(cat.id)}
                            className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => handleCancelValueDraft(cat.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddValueDraft(cat.id)}
                          className="text-xs text-primary-600 hover:underline mt-1"
                        >
                          + Adicionar valor (ex: P, M, G)
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FinanceOverview = ({ finance, loading }) => {
  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  const monthlyRevenue = finance?.monthly_revenue || 0;
  const monthlyOrders = finance?.monthly_orders || 0;
  const cancellations = finance?.monthly_cancellations || 0;
  const avgTicket = finance?.avg_ticket || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Receita Mensal</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">R$ {monthlyRevenue.toFixed(2)}</div>
        <p className="text-sm text-gray-500">Média de R$ {avgTicket.toFixed(2)} por pedido</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Total de Pedidos</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">{monthlyOrders}</div>
        <p className="text-sm text-gray-500">Este mês</p>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Cancelamentos</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">{cancellations}</div>
        <p className="text-sm text-gray-500">Este mês</p>
      </div>
    </div>
  );
};

const OrdersHistory = ({ orders, loading }) => {
  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

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
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-4 text-gray-600">{order.customer}</td>
                  <td className="py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="py-4 text-right font-medium text-gray-900">R$ {Number(order.total || 0).toFixed(2)}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">Nenhum pedido ainda</td>
              </tr>
            )}
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h1a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 002 2v12a2 2 0 002 2z" />
  </svg>
);
const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.91c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
