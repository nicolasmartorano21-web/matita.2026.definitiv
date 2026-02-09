
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useApp } from '../App';

const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, favorites, toggleFavorite } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.color || '');
  const [activeImage, setActiveImage] = useState(0);

  const isFavorite = favorites.includes(product.id);
  const currentStock = useMemo(() => product.colors.find(c => c.color === selectedColor)?.stock || 0, [selectedColor, product.colors]);
  const isGlobalOutOfStock = product.colors.every(c => c.stock <= 0);

  const handleAddToCart = () => {
    if (currentStock > 0) {
      addToCart({ product, quantity: 1, selectedColor });
      setShowModal(false);
      alert(`¡${product.name} (${selectedColor}) añadido! 🌸`);
    }
  };

  return (
    <>
      {/* CARD MINIATURA */}
      <div 
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border-4 border-transparent hover:border-[#fadb31] flex flex-col h-full relative"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-125"
        >
          <svg className={`w-6 h-6 ${isFavorite ? 'text-[#ea7e9c] fill-current' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="relative aspect-[4/5] overflow-hidden bg-[#fdfaf6] flex items-center justify-center p-4">
          <img src={getImgUrl(product.images[0], 400)} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" alt={product.name} />
          {isGlobalOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-800 text-white text-lg px-6 py-2 rounded-2xl rotate-12 shadow-2xl font-bold tracking-widest">SIN STOCK</span>
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-grow gap-3 bg-white">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.category}</p>
            <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#f6a118] transition-colors">{product.name}</h3>
          </div>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-2xl font-bold text-[#f6a118]">${product.price.toLocaleString()}</span>
            <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center border border-gray-100 hover:bg-[#fadb31] hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5}/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETALLADO */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fdfaf6] rounded-[3.5rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col md:flex-row border-4 border-white">
            
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:rotate-90 transition-transform">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
            </button>

            {/* IZQUIERDA: IMAGEN Y BOTÓN AÑADIR */}
            <div className="md:w-1/2 p-8 bg-white flex flex-col items-center gap-6">
              <div className="w-full aspect-square bg-[#fdfaf6] rounded-[2.5rem] p-6 flex items-center justify-center overflow-hidden border-2 border-gray-50 relative">
                <img src={getImgUrl(product.images[activeImage], 800)} className="max-w-full max-h-full object-contain" alt={product.name} />
                {/* Selector de Imagen integrado en la foto */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`w-3 h-3 rounded-full transition-all ${activeImage === i ? 'bg-[#f6a118] w-8' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-6 rounded-[2.5rem] text-2xl font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${currentStock <= 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'matita-gradient-pink text-white hover:scale-105'}`}
              >
                <span>{currentStock <= 0 ? 'Sin Stock' : 'Añadir al Carrito ✨'}</span>
              </button>
            </div>

            {/* DERECHA: DETALLES Y VARIANTES (SELECTOR DE COLOR REDISEÑADO) */}
            <div className="md:w-1/2 p-10 flex flex-col justify-between space-y-6 overflow-y-auto scrollbar-hide">
              <div className="space-y-6">
                <div>
                   <p className="text-[#ea7e9c] font-bold tracking-[0.2em] uppercase text-sm mb-1">{product.category}</p>
                   <h2 className="text-4xl md:text-5xl font-bold text-gray-800">{product.name}</h2>
                </div>
                
                <p className="text-xl text-gray-500 italic leading-relaxed bg-white/40 p-6 rounded-[2rem]">
                  "{product.description || 'Un producto mágico seleccionado especialmente para ti.'}"
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Elige tu variante</p>
                    <span className="text-xs font-bold text-[#f6a118] bg-orange-50 px-3 py-1 rounded-full">{product.colors.length} opciones</span>
                  </div>
                  
                  {/* NUEVO DISEÑO DE SELECTOR DE COLORES TÁCTIL */}
                  <div className="grid grid-cols-2 gap-3">
                    {product.colors.map(c => (
                      <button 
                        key={c.color} 
                        onClick={() => c.stock > 0 && setSelectedColor(c.color)} 
                        className={`group relative p-4 rounded-3xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${
                          c.stock <= 0 
                            ? 'bg-gray-50 text-gray-300 border-gray-100 opacity-40 cursor-not-allowed' 
                            : selectedColor === c.color 
                              ? 'bg-white border-[#f6a118] shadow-lg scale-[1.02]' 
                              : 'bg-white border-transparent hover:border-gray-100'
                        }`}
                      >
                        {selectedColor === c.color && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#f6a118] rounded-full flex items-center justify-center text-white text-[10px] animate-scaleIn">✓</div>
                        )}
                        <span className={`text-lg font-bold transition-colors ${selectedColor === c.color ? 'text-[#f6a118]' : 'text-gray-500'}`}>{c.color}</span>
                        <span className="text-[10px] font-bold uppercase opacity-50">Stock: {c.stock}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t-4 border-dashed border-white flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-5xl font-bold text-[#f6a118]">${product.price.toLocaleString()}</span>
                  <span className="text-sm font-bold text-[#ea7e9c] uppercase">+ {product.points} pts club ✨</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Selección</p>
                  <p className="text-2xl font-bold text-gray-800 truncate max-w-[150px]">{selectedColor || '---'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
