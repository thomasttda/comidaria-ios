import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Play, Pause, RefreshCw } from 'lucide-react';
import { useBanners } from '../../hooks/useBanners';

export const BannerRoll = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timer, setTimer] = useState(null);
  const { banners, loading, error, refetch } = useBanners();

  useEffect(() => {
    if (isPlaying && banners.length > 0) {
      setTimer(setInterval(() => setCurrentIndex((i) => (i + 1) % banners.length), 5000));
    }
    return () => clearInterval(timer);
  }, [isPlaying, banners.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden rounded-3xl bg-gray-100 mb-8 aspect-[16/6] lg:aspect-[16/7] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando banners...</p>
      </section>
    );
  }

  if (error || banners.length === 0) {
    return (
      <section className="relative w-full overflow-hidden rounded-3xl bg-gray-100 mb-8 aspect-[16/6] lg:aspect-[16/7] flex flex-col items-center justify-center p-8 text-center">
        {error ? (
          <>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
            </button>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Nenhum banner cadastrado</p>
        )}
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-gray-100 mb-8 aspect-[16/6] lg:aspect-[16/7]">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-end p-8 lg:p-16">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                  Oferta Especial
                </span>
                <h2 className="text-3xl lg:text-5xl font-bold text-white drop-shadow-lg mb-2">
                  {banner.title}
                </h2>
                <p className="text-lg lg:text-xl text-gray-100 drop-shadow-sm max-w-md">
                  {banner.subtitle}
                </p>
                {banner.link_url && (
                  <button
                    onClick={() => goToSlide(idx)}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Ver oferta
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => goToSlide((currentIndex - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => goToSlide((currentIndex + 1) % banners.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary-600 w-6' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
    </section>
  );
};
