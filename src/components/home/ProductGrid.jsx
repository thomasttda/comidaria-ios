import { Link } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { useCart } from '../../context/CartContext';

export const ProductGrid = () => {
  const { addItem } = useCart();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Mais Pedidos</h2>
        <Link
          to="/cardapio"
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Ver todos os produtos
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRODUCTS.slice(0, 8).map((product) => (
          <Link
            key={product.id}
            to={`/produto/${product.id}`}
            className="group relative block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {!product.available && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-medium bg-black/60 px-3 py-1 rounded-full">
                    Indisponível
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-gray-200">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-gray-900">{product.rating}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <span className="font-bold text-primary-600">R$ {product.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  {product.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(product);
                  }}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const CategoryChips = () => {
  return (
    <section className="mb-8">
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm transition-all shadow-sm"
          >
            {cat.name}
          </button>
        ))}
      </div>
    </section>
  );
};
