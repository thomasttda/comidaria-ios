import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { ImageUploader } from '../components/common/ImageUploader';

export const CategoryManagement = () => {
  const { categories, loading, refetch, createCategory, updateCategory, deleteCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true });
  const [saveError, setSaveError] = useState('');

  useEffectFetch();

  function useEffectFetch() {}

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando categorias...</div>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active,
    };
    if (!payload.name) { setSaveError('Nome é obrigatório'); return; }
    try {
      if (editingId) {
        const { error } = await updateCategory(editingId, payload);
        if (error) throw new Error(error.message);
        setEditingId(null);
      } else {
        const { error } = await createCategory(payload);
        if (error) throw new Error(error.message);
      }
      setOpen(false);
      setForm({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true });
      await refetch();
    } catch (err) {
      setSaveError(err.message || 'Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    const { error } = await deleteCategory(id);
    if (error) alert(error.message);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorias de Produtos</h2>
          <p className="text-gray-500 text-sm">Gerencie as categorias exibidas na página inicial</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true }); setOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {saveError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{saveError}</div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Nome</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-center">Slug</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-center">Ordem</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-center">Ativa</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="py-4 text-center text-gray-600 text-sm font-mono">{cat.slug}</td>
                <td className="py-4 text-center text-gray-600 text-sm">{cat.sort_order}</td>
                <td className="py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingId(cat.id);
                      setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '', sort_order: String(cat.sort_order || 0), is_active: cat.is_active });
                      setOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-700 mr-3"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nhoque" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug (URL amigável)</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Ex: nhoque" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL da Imagem</label>
                <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ordem de Exibição</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input id="is_active" type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="is_active" className="text-sm text-gray-700">Categoria ativa?</label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
