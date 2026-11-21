import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useBanners } from '../hooks/useBanners';
import { ImageUploader } from '../components/common/ImageUploader';
import { supabase } from '../lib/supabase';

export const BannerManagement = () => {
  const { banners, loading, refetch } = useBanners();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', active: true, sort_order: '0' });
  const [saveError, setSaveError] = useState('');

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando banners...</div>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image_url: form.image_url.trim(),
      link_url: form.link_url.trim() || null,
      active: form.active,
      sort_order: Number(form.sort_order || 0),
    };
    if (!payload.title) { setSaveError('Título é obrigatório'); return; }
    if (!payload.image_url) { setSaveError('URL da imagem é obrigatória'); return; }
    try {
      if (editingId) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
        if (error) throw new Error(error.message);
        setEditingId(null);
      } else {
        const { error } = await supabase.from('banners').insert(payload);
        if (error) throw new Error(error.message);
      }
      setOpen(false);
      setForm({ title: '', subtitle: '', image_url: '', link_url: '', active: true, sort_order: '0' });
      await refetch();
    } catch (err) {
      setSaveError(err.message || 'Erro ao salvar banner');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) alert(error.message);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banners da Página Inicial</h2>
          <p className="text-gray-500 text-sm">Gerencie os banners exibidos no topo da loja</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ title: '', subtitle: '', image_url: '', link_url: '', active: true, sort_order: '0' }); setOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Banner
        </button>
      </div>

      {saveError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{saveError}</div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Título</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Subtítulo</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-center">Ativo</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-center">Ordem</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 font-medium text-gray-900">{banner.title}</td>
                <td className="py-4 text-gray-600">{banner.subtitle}</td>
                <td className="py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${banner.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="py-4 text-center text-gray-600 text-sm">{banner.sort_order}</td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingId(banner.id);
                      setForm({ title: banner.title, subtitle: banner.subtitle || '', image_url: banner.image_url, link_url: banner.link_url || '', active: banner.active, sort_order: String(banner.sort_order || 0) });
                      setOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-700 mr-3"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="font-bold text-gray-900">{editingId ? 'Editar Banner' : 'Novo Banner'}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Segunda com Desconto" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtítulo</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Ex: 20% OFF em todos os hambúrgueres" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL da Imagem</label>
                <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link (opcional)</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/categoria/hamburgueres" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ordem de Exibição</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <label htmlFor="active" className="text-sm text-gray-700">Banner ativo?</label>
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
