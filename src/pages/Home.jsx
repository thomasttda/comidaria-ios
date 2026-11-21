import { BannerRoll } from '../components/home/BannerRoll';
import { CategoryChips } from '../components/home/ProductGrid';
import { ProductGrid } from '../components/home/ProductGrid';

export const Home = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-4">
        <img
          src="/logo_comidaria.png"
          alt="Comidaria IOS"
          className="w-16 h-16 mx-auto mb-3 rounded-2xl object-cover border-2 border-primary-100 shadow-sm"
        />
        <h1 className="text-xl font-bold text-gray-900">Comidaria IOS</h1>
        <p className="text-gray-500 text-sm">Entrega rápida e comida deliciosa</p>
      </div>

      <BannerRoll />
      <CategoryChips />
      <ProductGrid />
    </div>
  );
};
