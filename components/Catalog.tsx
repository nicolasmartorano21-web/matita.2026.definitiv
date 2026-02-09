
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product, Category } from '../types';
import { useApp } from '../App';

interface CatalogProps {
  category: Category | 'Catalog' | 'Favorites';
}

const Catalog: React.FC<CatalogProps> = ({ category }) => {
  const { favorites, supabase } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'priceLow' | 'priceHigh' | 'name'>('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          oldPrice: p.old_price,
          points: p.points,
          category: p.category,
          images: p.images || [],
          colors: p.colors || []
        })));
      }
    } catch (err: any) {
      console.error("Error cargando productos:", err);
      setError("No pudimos conectar con la tienda. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supabase]);

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (category === 'Favorites') return matchesSearch && favorites.includes(p.id);
      if (category === 'Catalog') return matchesSearch;
      if (category === 'Ofertas') return matchesSearch && (p.oldPrice !== null || p.category === 'Ofertas');
      return matchesSearch && p.category === category;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // 'recent' is default by fetch order
    });
  }, [category, searchTerm, favorites, products, sortBy]);

  const categoryList: {label: string, cat: Category, icon: string}[] = [
    { label: 'Escolar', cat: 'Escolar', icon: '✏️' },
    { label: 'Regalaría', cat: 'Regalaría', icon: '🎁' },
    { label: 'Oficina', cat: 'Oficina', icon: '💼' },
    { label: 'Tecnología', cat: 'Tecnología', icon: '🎧' },
    { label: 'Novedades', cat: 'Novedades', icon: '✨' },
    { label: 'Ofertas', cat: 'Ofertas', icon: '🏷️' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-transparent border-t-[#fadb31] rounded-full animate-spin"></div>
        </div>
        <p className="text-[#f6a118] font-bold animate-pulse text-3xl text-center px-6">Abriendo el mundo Matita... ✨</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      {/* Título y Buscador */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <h2 className="text-6xl md:text-8xl font-matita font-bold text-[#f6a118] drop-shadow-sm">
          {category === 'Catalog' ? 'Mundo Matita' : category}
        </h2>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="¿Qué buscamos hoy? 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-8 py-5 rounded-[2rem] border-4 border-[#fadb31] text-xl font-matita shadow-lg focus:ring-[15px] focus:ring-[#fadb31]/10 outline-none transition-all placeholder:text-gray-200"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-6 py-4 rounded-[2rem] border-4 border-[#fadb31]/30 text-lg font-bold text-gray-400 bg-white outline-none cursor-pointer hover:border-[#fadb31] transition-colors"
          >
            <option value="recent">Más recientes ✨</option>
            <option value="priceLow">Menor precio ⬇️</option>
            <option value="priceHigh">Mayor precio ⬆️</option>
            <option value="name">Nombre A-Z 📝</option>
          </select>
        </div>
      </div>

      {/* BARRA DE CATEGORÍAS */}
      <div className="w-full relative py-2">
        <div className="flex overflow-x-auto gap-6 py-4 px-2 scrollbar-hide snap-x items-center -mx-4">
           <button 
             onClick={() => navigate('/catalog')}
             className={`snap-start px-8 py-4 rounded-full text-2xl font-bold transition-all whitespace-nowrap shadow-md border-2 flex items-center gap-3 ${
               category === 'Catalog' 
               ? 'matita-gradient-orange text-white border-white scale-105' 
               : 'bg-white text-gray-400 border-transparent hover:border-[#fadb31]'
             }`}
           >
             <span className="text-3xl">🌈</span> Todo
           </button>

           {categoryList.map(item => (
             <button 
               key={item.cat}
               onClick={() => navigate(`/${item.cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)}
               className={`snap-start px-8 py-4 rounded-full text-2xl font-bold transition-all whitespace-nowrap shadow-md border-2 flex items-center gap-3 ${
                 category === item.cat 
                 ? 'matita-gradient-orange text-white border-white scale-105' 
                 : 'bg-white text-gray-400 border-transparent hover:border-[#fadb31]'
               }`}
             >
               <span className="text-3xl">{item.icon}</span> {item.label}
             </button>
           ))}
        </div>
      </div>

      {/* Grilla de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {sortedAndFilteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Sección de Comunidad / Testimonios */}
      {category === 'Catalog' && (
        <div className="mt-32 py-20 bg-white rounded-[4rem] shadow-xl border-8 border-[#fef9eb] relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-2 matita-gradient-orange opacity-20"></div>
           <h3 className="text-5xl font-logo text-[#ea7e9c] mb-12">Lo que dicen en el Club ✨</h3>
           <div className="grid md:grid-cols-3 gap-12 px-10">
              <div className="space-y-4">
                <div className="text-4xl">💖</div>
                <p className="text-xl text-gray-500 italic">"Los productos más lindos de La Calera. Cada detalle es amor puro."</p>
                <p className="font-bold text-[#f6a118]">- Sofi G.</p>
              </div>
              <div className="space-y-4 border-x-2 border-[#fef9eb] px-10">
                <div className="text-4xl">⭐</div>
                <p className="text-xl text-gray-500 italic">"Canjeé mis puntos por un cupón y me salvó el regalo de cumple."</p>
                <p className="font-bold text-[#f6a118]">- Martu P.</p>
              </div>
              <div className="space-y-4">
                <div className="text-4xl">🖋️</div>
                <p className="text-xl text-gray-500 italic">"Calidad increíble y la atención por WhatsApp es súper rápida."</p>
                <p className="font-bold text-[#f6a118]">- Facu L.</p>
              </div>
           </div>
        </div>
      )}

      {/* Empty State */}
      {sortedAndFilteredProducts.length === 0 && (
        <div className="text-center py-40 bg-white/40 rounded-[4rem] border-4 border-dashed border-white flex flex-col items-center">
          <div className="text-8xl mb-6 grayscale opacity-20">📦</div>
          <p className="text-4xl font-matita text-gray-300 italic px-6">"Aún no encontramos tesoros en esta búsqueda."</p>
          <button onClick={() => {setSearchTerm(''); setSortBy('recent')}} className="mt-8 px-10 py-4 bg-[#fadb31] text-white rounded-full text-xl font-bold shadow-md">Limpiar Filtros</button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
