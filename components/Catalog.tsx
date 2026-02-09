
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (category === 'Favorites') return matchesSearch && favorites.includes(p.id);
      if (category === 'Catalog') return matchesSearch;
      if (category === 'Ofertas') return matchesSearch && (p.oldPrice !== null || p.category === 'Ofertas');
      return matchesSearch && p.category === category;
    });
  }, [category, searchTerm, favorites, products]);

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
        <div className="w-24 h-24 border-8 border-[#fadb31] border-t-transparent rounded-full animate-spin shadow-lg"></div>
        <p className="text-[#f6a118] font-bold animate-pulse text-4xl">Buscando tesoros... ✨</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      {/* Título Dinámico y Buscador */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <h2 className="text-6xl md:text-8xl font-matita font-bold text-[#f6a118] drop-shadow-sm">
          {category === 'Catalog' ? 'Mundo Matita' : category}
        </h2>
        <div className="relative max-w-2xl w-full">
          <input
            type="text"
            placeholder="¿Qué buscas hoy? 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-10 py-6 rounded-[2.5rem] border-4 border-[#fadb31] text-2xl font-matita shadow-xl focus:ring-[15px] focus:ring-[#fadb31]/10 outline-none transition-all placeholder:text-gray-200"
          />
        </div>
      </div>

      {/* BARRA DE CATEGORÍAS - DESLIZABLE */}
      <div className="w-full relative py-2">
        <div className="flex overflow-x-auto gap-6 py-4 px-2 scrollbar-hide snap-x items-center -mx-4">
           {/* Botón TODO */}
           <button 
             onClick={() => navigate('/catalog')}
             className={`snap-start px-10 py-5 rounded-full text-3xl font-bold transition-all whitespace-nowrap shadow-xl border-4 flex items-center gap-4 ${
               category === 'Catalog' 
               ? 'matita-gradient-orange text-white border-white scale-110' 
               : 'bg-white text-gray-400 border-transparent hover:border-[#fadb31] hover:text-[#f6a118]'
             }`}
           >
             <span className="text-4xl">🌈</span> Todo
           </button>

           {/* Categorías Iteradas */}
           {categoryList.map(item => (
             <button 
               key={item.cat}
               onClick={() => navigate(`/${item.cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`)}
               className={`snap-start px-10 py-5 rounded-full text-3xl font-bold transition-all whitespace-nowrap shadow-xl border-4 flex items-center gap-4 ${
                 category === item.cat 
                 ? 'matita-gradient-orange text-white border-white scale-110' 
                 : 'bg-white text-gray-400 border-transparent hover:border-[#fadb31] hover:text-[#f6a118]'
               }`}
             >
               <span className="text-4xl">{item.icon}</span> {item.label}
             </button>
           ))}
        </div>
        
        {/* Guía Visual Slider Móvil */}
        <div className="md:hidden flex justify-center mt-4">
           <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-[#fadb31] rounded-full animate-[shimmer_2s_infinite]"></div>
           </div>
        </div>
      </div>

      {/* Grilla de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-48 bg-white/40 rounded-[5rem] border-8 border-dashed border-white shadow-inner flex flex-col items-center">
          <div className="text-9xl mb-8 grayscale opacity-20">📦</div>
          <p className="text-5xl font-matita text-gray-300 italic">"No hay tesoros aquí... por ahora."</p>
          <button onClick={() => navigate('/catalog')} className="mt-10 px-12 py-5 bg-[#fadb31] text-white rounded-full text-2xl font-bold shadow-lg">Ver Todo</button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
