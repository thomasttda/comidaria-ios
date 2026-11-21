import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProductOptions } from '../hooks/useProductOptions';
import { useCart } from '../context/CartContext';
import { Plus, Minus, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { optionCategories, loading: optionsLoading } = useProductOptions(id || null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState({}); // categoryId -> valueId | valueId[]
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Produto não encontrado');
        setLoading(false);
        return;
      }
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Valores selecionados normalizados (lista)
  const selectedValuesByCat = (catId) => {
    const val = selected[catId];
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const isSelected = (catId, valueId) => selectedValuesByCat(catId).includes(valueId);

  const toggleValue = (catId, valueId, allowMultiple) => {
    const current = selectedValuesByCat(catId);
    let next;
    if (allowMultiple) {
      next = current.includes(valueId) ? current.filter((v) => v !== valueId) : [...current, valueId];
    } else {
      next = current[0] === valueId ? [] : [valueId];
    }
    setSelected((prev) => ({ ...prev, [catId]: allowMultiple ? next : next[0] }));
  };

  // Monta array de opções selecionadas com nome e preço extra
  const buildSelectedOptions = () => {
    const result = [];
    for (const cat of optionCategories) {
      const valueIds = selectedValuesByCat(cat.id);
      for (const valueId of valueIds) {
        const v = (cat.product_option_values || []).find((x) => x.id === valueId);
        if (v) {
          result.push({
            categoryId: cat.id,
            categoryName: cat.name,
            valueId: v.id,
            valueName: v.name,
            priceExtra: Number(v.price_extra || 0),
          });
        }
      }
    }
    return result;
  };

  const optionsPrice = buildSelectedOptions().reduce((sum, o) => sum + o.priceExtra, 0);
  const unitPrice = product ? Number(product.price || 0) + optionsPrice : 0;

  // Validação de obrigatórios não preenchidos
  const missingRequired = optionCategories.some(
    (cat) => cat.is_required && selectedValuesByCat(cat.id).length === 0
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (missingRequired) {
      setError('Por favor, preencha as opções obrigatórias.');
      return;
    }
    if (!product) return;
    addItem(product, quantity, buildSelectedOptions());
    setAdded(true);
    setError('');
    setTimeout(() => {
      setAdded(false);
      navigate('/');
    }, 1400);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando produto...</div>;
  if (error || !product) return (
    <div className="flex items-center justify-center h-64 text-center">
      <div>
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 text-sm">{error || 'Produto não encontrado'}</p>
        <button onClick={() => navigate('/')} className="mt-3 text-primary-600 text-sm hover:underline">Voltar ao início</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-4">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-auto rounded-2xl object-cover" />
        ) : (
          <div className="aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sem imagem</span>
          </div>
        )}
        <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              product.is_available !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {product.is_available !== false ? 'Disponível' : 'Indisponível'}
            </span>
          <span className="text-xs text-gray-500">{product.preparation_time} min de preparo</span>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            {product.is_available === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Indisponível</span>}
          </div>
          <p className="text-gray-600 text-sm">{product.description}</p>
          {product.categories && (
            <p className="text-xs text-primary-600 font-semibold mt-1 uppercase tracking-wider">{product.categories.name}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-gray-500 text-xs">Preço base</span>
            <span className="text-lg font-bold text-gray-900">R$ {Number(product.price || 0).toFixed(2)}</span>
          </div>
          {optionsPrice > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Opções selecionadas</span>
              <span className="font-medium text-primary-600">+R$ {optionsPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Total por unidade</span>
            <span className="text-xl font-bold text-gray-900">R$ {unitPrice.toFixed(2)}</span>
          </div>
        </div>

        {optionCategories.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2">Escolha as opções</h3>
            {optionsLoading ? (
              <p className="text-sm text-gray-400">Carregando opções...</p>
            ) : (
              optionCategories.map((cat) => (
                <div key={cat.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-gray-900 text-sm">{cat.name}</label>
                    {cat.is_required && (
                      <span className="text-[10px] bg-red-100 text-red-700 rounded px-1.5 py-0.5 font-bold">Obrigatório</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(cat.product_option_values || []).map((v) => (
                      <label
                        key={v.id}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          isSelected(cat.id, v.id)
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type={cat.allow_multiple ? 'checkbox' : 'radio'}
                          name={`opt-${cat.id}`}
                          checked={isSelected(cat.id, v.id)}
                          onChange={() => toggleValue(cat.id, v.id, cat.allow_multiple)}
                          className="text-primary-600"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-800">{v.name}</span>
                            {v.price_extra > 0 && (
                              <span className="text-primary-600 font-medium">+R$ {Number(v.price_extra).toFixed(2)}</span>
                            )}
                          </div>
                          {v.is_default && (
                            <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0 font-bold">Padrão</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
            {missingRequired && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Preencha as opções obrigatórias.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.is_available === false || missingRequired}
          className={`w-full py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            product.is_available !== false && !missingRequired
              ? 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-4 h-4" /> Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Adicionar ao carrinho
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center">
          {product.is_available !== false && !missingRequired ? '' : 'Selecione as opções obrigatórias para adicionar.'}
        </p>
      </div>
    </div>
  );
};
