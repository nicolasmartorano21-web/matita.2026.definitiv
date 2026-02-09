
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category, User, Sale, ColorStock } from '../types';
import { useApp } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const getImgUrl = (id: string, w = 600) => {
  if (!id) return "https://via.placeholder.com/600x600?text=Matita";
  if (id.startsWith('data:') || id.startsWith('http')) return id;
  return `https://res.cloudinary.com/dllm8ggob/image/upload/q_auto,f_auto,w_${w}/${id}`;
};

const AdminPanel: React.FC = () => {
  const { supabase } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales' | 'socios' | 'ideas' | 'design'>('dashboard');

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'matita2026') setIsAuthenticated(true);
    else alert('Contraseña incorrecta ❌');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 animate-fadeIn">
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border-4 border-[#fadb31] text-center space-y-10">
          <div className="text-9xl mb-4">👑</div>
          <h2 className="text-5xl font-bold text-gray-800">Panel Maestro</h2>
          <form onSubmit={handleAdminAuth} className="space-y-8">
            <input 
              type="password" 
              placeholder="Clave Matita" 
              className="w-full text-3xl text-center shadow-inner py-5 bg-[#fef9eb] rounded-3xl outline-none" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-4xl font-bold shadow-lg hover:scale-105 transition-all">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10 animate-fadeIn px-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-4 border-[#fadb31]/20 pb-8">
        <div>
          <h2 className="text-5xl md:text-6xl font-bold text-[#f6a118]">Gestión Matita</h2>
          <p className="text-xl md:text-2xl text-gray-400 italic">Estadísticas y Control Real ✏️</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { id: 'dashboard', label: '📊 Stats' },
            { id: 'inventory', label: '📦 Stock' },
            { id: 'sales', label: '💸 Ventas' },
            { id: 'socios', label: '👥 Socios' },
            { id: 'ideas', label: '💡 Ideas' },
            { id: 'design', label: '🎨 Marca' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-5 py-2 md:px-8 md:py-3 rounded-[1.5rem] text-lg md:text-xl font-bold transition-all ${activeTab === tab.id ? 'matita-gradient-orange text-white shadow-lg scale-110' : 'bg-white text-gray-400 hover:text-[#f6a118]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-matita p-6 md:p-14 border-[8px] border-white min-h-[600px]">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'sales' && <SalesManager />}
        {activeTab === 'socios' && <SociosManager />}
        {activeTab === 'ideas' && <IdeasManager />}
        {activeTab === 'design' && <DesignManager />}
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
  const { supabase } = useApp();
  const [data, setData] = useState<any>({ 
    salesHistory: [], 
    categoryStats: [], 
    totals: { sales: 0, users: 0, products: 0 } 
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: true });
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      if (sales) {
        const history = sales.map((s:any) => ({ 
          date: new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          amount: s.total 
        }));
        
        const catMap: any = {};
        sales.forEach((s:any) => {
          const cat = s.category_summary || 'Varios';
          catMap[cat] = (catMap[cat] || 0) + s.total;
        });
        const categories = Object.keys(catMap).map(k => ({ name: k, total: catMap[k] }));

        setData({
          salesHistory: history,
          categoryStats: categories,
          totals: {
            sales: sales.reduce((a:number, b:any) => a + b.total, 0),
            users: usersCount || 0,
            products: prodCount || 0
          }
        });
      }
    };
    fetchDashboard();
  }, [supabase]);

  const COLORS = ['#f6a118', '#ea7e9c', '#fadb31', '#93c5fd', '#86efac'];

  return (
    <div className="space-y-16 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fef9eb] p-8 rounded-[2.5rem] text-center border-4 border-white shadow-sm overflow-hidden">
          <p className="text-xl text-gray-400 font-bold uppercase">Total Ventas</p>
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f6a118] truncate">${data.totals.sales.toLocaleString()}</p>
        </div>
        <div className="bg-[#fff1f2] p-8 rounded-[2.5rem] text-center border-4 border-white shadow-sm overflow-hidden">
          <p className="text-xl text-gray-400 font-bold uppercase">Socios</p>
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ea7e9c] truncate">{data.totals.users}</p>
        </div>
        <div className="bg-[#f0f9ff] p-8 rounded-[2.5rem] text-center border-4 border-white shadow-sm overflow-hidden">
          <p className="text-xl text-gray-400 font-bold uppercase">Productos</p>
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-400 truncate">{data.totals.products}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <h4 className="text-3xl font-bold text-gray-700 ml-4">Tendencia 💸</h4>
          <div className="h-[350px] w-full bg-[#fdfaf6] p-4 rounded-[2.5rem] border-2 border-white shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" stroke="#999" fontSize={10} />
                <YAxis stroke="#999" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#f6a118" strokeWidth={4} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-3xl font-bold text-gray-700 ml-4">Categorías 🏷️</h4>
          <div className="h-[350px] w-full bg-[#fdfaf6] p-4 rounded-[2.5rem] border-2 border-white shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" stroke="#999" fontSize={10} />
                <YAxis stroke="#999" fontSize={10} />
                <Tooltip />
                <Bar dataKey="total">
                  {data.categoryStats.map((entry:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- INVENTORY MANAGER COMPONENT ---
const InventoryManager: React.FC = () => {
  const { supabase } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formMode, setFormMode] = useState<'list' | 'edit'>('list');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data.map((p: any) => ({ 
      ...p, 
      oldPrice: p.old_price, 
      images: p.images || [], 
      colors: p.colors || [] 
    })));
  };

  useEffect(() => { fetchProducts(); }, [supabase]);

  const updateStock = (idx: number, change: number) => {
    if (!editingProduct?.colors) return;
    const next = [...editingProduct.colors];
    const currentStock = Number(next[idx].stock) || 0;
    next[idx].stock = Math.max(0, currentStock + change);
    setEditingProduct({ ...editingProduct, colors: next });
  };

  const handleSave = async () => {
    if (!editingProduct?.name) return alert('¡Escribe el nombre del tesoro!');
    
    const p = { 
      name: editingProduct.name,
      description: editingProduct.description || "",
      price: Number(editingProduct.price) || 0,
      old_price: Number(editingProduct.oldPrice) || 0,
      points: Number(editingProduct.points) || 0,
      category: editingProduct.category || "Escolar",
      images: editingProduct.images || [],
      colors: editingProduct.colors || [{color: 'Único', stock: 1}]
    };

    const { error } = editingProduct.id 
      ? await supabase.from('products').update(p).eq('id', editingProduct.id)
      : await supabase.from('products').insert(p);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert('✨ ¡Stock actualizado! Ya está en el catálogo.');
      setFormMode('list'); 
      fetchProducts();
    }
  };

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web"); 
    formData.append("folder", "matita2026");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.public_id;
    } catch (error) {
      console.error("Cloudinary error:", error);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...(editingProduct?.images || [])];
    
    for (let i = 0; i < files.length; i++) {
      const publicId = await uploadImageToCloudinary(files[i]);
      if (publicId) newImages.push(publicId);
    }
    
    setEditingProduct(prev => ({ ...prev!, images: newImages }));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (formMode === 'list') {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-bold text-gray-700">Inventario 📦</h3>
          <button 
            onClick={() => { 
              setEditingProduct({ name: '', price: 0, oldPrice: 0, points: 0, category: 'Escolar', colors: [{color: 'Único', stock: 10}], images: [] }); 
              setFormMode('edit'); 
            }} 
            className="px-6 py-3 bg-[#f6a118] text-white rounded-2xl font-bold text-xl shadow-md hover:scale-105 transition-all"
          >
            + Nuevo
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-gray-50 p-4 rounded-[2rem] border-2 border-white shadow-sm hover:border-[#fadb31] transition-all flex flex-col h-full">
              <img src={getImgUrl(p.images[0], 200)} className="w-full aspect-square object-cover rounded-2xl mb-3" />
              <h4 className="text-sm font-bold truncate text-gray-800">{p.name}</h4>
              <p className="text-lg font-bold text-[#f6a118] mb-3">${p.price}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => { setEditingProduct(p); setFormMode('edit'); }} className="flex-grow py-2 bg-white text-[#f6a118] rounded-xl font-bold border border-[#fadb31] text-xs">Editar</button>
                <button onClick={async () => { if(confirm('¿Borrar?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="text-red-200">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-6">
        <button onClick={() => setFormMode('list')} className="text-4xl hover:scale-110 transition-all">🔙</button>
        <h3 className="text-3xl font-bold text-gray-800">Editor de Stock</h3>
      </div>
      
      <div className="bg-gray-50 p-8 md:p-12 rounded-[3.5rem] border-4 border-white space-y-8 shadow-xl max-h-[85vh] overflow-y-auto scrollbar-hide">
        <div className="grid md:grid-cols-2 gap-6">
           <div className="space-y-1">
             <label className="text-sm font-bold text-gray-400 ml-4">Nombre del Tesoro</label>
             <input type="text" className="w-full text-2xl p-4 rounded-2xl outline-none shadow-inner" value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} />
           </div>
           <div className="space-y-1">
             <label className="text-sm font-bold text-gray-400 ml-4">Categoría</label>
             <select className="w-full text-2xl p-4 rounded-2xl outline-none shadow-inner" value={editingProduct?.category} onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}>
               {['Escolar', 'Regalaría', 'Oficina', 'Tecnología', 'Novedades', 'Ofertas'].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 ml-2">Precio ($)</label>
             <input type="number" className="w-full text-xl p-4 rounded-2xl outline-none shadow-inner" value={editingProduct?.price || ''} onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 ml-2">Antes ($)</label>
             <input type="number" className="w-full text-xl p-4 rounded-2xl outline-none shadow-inner" value={editingProduct?.oldPrice || ''} onChange={e => setEditingProduct({...editingProduct!, oldPrice: Number(e.target.value)})} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 ml-2">Puntos ✨</label>
             <input type="number" className="w-full text-xl p-4 rounded-2xl outline-none shadow-inner" value={editingProduct?.points || ''} onChange={e => setEditingProduct({...editingProduct!, points: Number(e.target.value)})} />
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center px-4">
             <h4 className="text-xl font-bold text-gray-400">Variantes</h4>
             <button onClick={() => setEditingProduct({...editingProduct!, colors: [...(editingProduct?.colors || []), {color: 'Nuevo', stock: 1}]})} className="text-[#f6a118] font-bold">+ Añadir</button>
           </div>
           <div className="grid gap-3">
             {editingProduct?.colors?.map((c, i) => (
               <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-white shadow-sm">
                  <input className="flex-grow border-none text-xl font-bold p-0 bg-transparent outline-none" value={c.color} onChange={e => {
                    const n = [...editingProduct.colors!]; n[i].color = e.target.value; setEditingProduct({...editingProduct, colors: n});
                  }} />
                  <div className="flex items-center gap-4 bg-gray-50 px-4 py-1 rounded-full border">
                    <button onClick={() => updateStock(i, -1)} className="text-3xl text-[#ea7e9c] font-bold">-</button>
                    <span className="text-xl font-bold min-w-[2rem] text-center">{c.stock}</span>
                    <button onClick={() => updateStock(i, 1)} className="text-3xl text-[#f6a118] font-bold">+</button>
                  </div>
                  <button onClick={() => setEditingProduct({...editingProduct, colors: editingProduct.colors?.filter((_, idx) => idx !== i)})} className="text-red-200">×</button>
               </div>
             ))}
           </div>
        </div>

        <div className="space-y-4">
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} multiple accept="image/*" />
           <button 
             onClick={() => fileInputRef.current?.click()} 
             disabled={isUploading}
             className="w-full py-8 bg-white border-4 border-dashed border-gray-200 text-gray-400 rounded-3xl text-xl font-bold hover:bg-gray-100 transition-all"
           >
             {isUploading ? '📤 Subiendo...' : '📸 Subir Fotos desde el Celular'}
           </button>
           
           <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
              {editingProduct?.images?.map((img, idx) => (
                <div key={idx} className="w-24 h-24 relative flex-shrink-0 group">
                   <img src={getImgUrl(img, 150)} className="w-full h-full object-cover rounded-xl shadow-md border-2 border-white" />
                   <button onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images?.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-md font-bold">×</button>
                </div>
              ))}
           </div>
        </div>

        <button onClick={handleSave} className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-3xl font-bold shadow-xl border-4 border-white hover:scale-[1.02] active:scale-95 transition-all">
          ¡Guardar Producto! ✨
        </button>
      </div>
    </div>
  );
};

// --- SALES MANAGER COMPONENT ---
const SalesManager: React.FC = () => {
  const { supabase } = useApp();
  const [sales, setSales] = useState<any[]>([]);
  fetchSales();
  async function fetchSales() {
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (data) setSales(data);
  };
  useEffect(() => { fetchSales(); }, [supabase]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <h3 className="text-3xl font-bold text-gray-700">Historial de Ventas 💸</h3>
      <div className="grid gap-4">
        {sales.map(s => (
          <div key={s.id} className="bg-gray-50 p-6 rounded-[2rem] border-2 border-white shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-800">{s.user_name || 'Invitado'}</p>
              <p className="text-sm text-gray-400">{new Date(s.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#f6a118]">${s.total}</p>
              <p className="text-xs text-gray-300 font-bold uppercase">{s.category_summary || 'Venta'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SOCIOS MANAGER COMPONENT (SELECTOR DE SOCIO Y EDICIÓN DE PUNTOS) ---
const SociosManager: React.FC = () => {
  const { supabase } = useApp();
  const [socios, setSocios] = useState<User[]>([]);
  const [editingPointsId, setEditingPointsId] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);

  const fetchSocios = async () => {
    const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
    if (data) setSocios(data.map((u:any) => ({ ...u, isSocio: u.is_socio, isAdmin: u.is_admin })));
  };

  useEffect(() => { fetchSocios(); }, [supabase]);

  const handleUpdatePoints = async (id: string) => {
    const { error } = await supabase.from('users').update({ points: newPoints }).eq('id', id);
    if (!error) {
      alert('¡Puntos actualizados con éxito! ✨');
      setEditingPointsId(null);
      fetchSocios();
    } else {
      alert('Error al actualizar puntos ❌');
    }
  };

  const handleDeleteSocio = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${name} del Club Matita? Esta acción no se puede deshacer.`)) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) {
        alert('Socio eliminado 🗑️');
        fetchSocios();
      } else {
        alert('No se pudo eliminar al socio ❌');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-700">Miembros del Club 👑</h3>
        <span className="bg-orange-50 text-[#f6a118] px-5 py-2 rounded-full font-bold text-sm uppercase tracking-widest">{socios.length} Socios</span>
      </div>
      
      <div className="grid gap-6">
        {socios.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border-4 border-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#fadb31] transition-all">
             <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-[#fef9eb] rounded-full flex items-center justify-center text-3xl shadow-inner border border-white shrink-0">
                  {s.isSocio ? '👑' : '👤'}
                </div>
                <div>
                   <h4 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                     {s.name}
                     {s.isAdmin && <span className="bg-blue-50 text-blue-400 text-[10px] px-2 py-1 rounded-md uppercase">Admin</span>}
                   </h4>
                   <p className="text-sm text-gray-400">{s.email}</p>
                </div>
             </div>

             <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                   {editingPointsId === s.id ? (
                     <div className="flex items-center gap-2 animate-fadeIn">
                       <input 
                         type="number" 
                         className="w-24 text-center p-2 rounded-xl border-2 border-[#fadb31] text-xl font-bold" 
                         value={newPoints} 
                         onChange={(e) => setNewPoints(Number(e.target.value))} 
                       />
                       <button onClick={() => handleUpdatePoints(s.id)} className="bg-[#25D366] text-white p-2 rounded-xl text-xs font-bold uppercase">OK</button>
                       <button onClick={() => setEditingPointsId(null)} className="bg-gray-100 text-gray-400 p-2 rounded-xl text-xs font-bold uppercase">×</button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-end cursor-pointer" onClick={() => { setEditingPointsId(s.id); setNewPoints(s.points); }}>
                        <p className="text-4xl font-bold text-[#f6a118] group-hover:scale-110 transition-transform">{s.points}</p>
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-1">
                          Puntos ✨ <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">(Editar)</span>
                        </p>
                     </div>
                   )}
                </div>

                <div className="flex gap-2">
                   <button 
                     onClick={() => handleDeleteSocio(s.id, s.name)}
                     className="w-12 h-12 rounded-2xl bg-red-50 text-red-200 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-xl shadow-sm"
                     title="Borrar Socio"
                   >
                     🗑️
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- IDEAS MANAGER COMPONENT ---
const IdeasManager: React.FC = () => {
  const { supabase } = useApp();
  const [ideas, setIdeas] = useState<any[]>([]);
  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      if (data) setIdeas(data);
    };
    f();
  }, [supabase]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <h3 className="text-3xl font-bold text-gray-700">Buzón de Ideas 💡</h3>
      <div className="grid gap-6">
        {ideas.map(i => (
          <div key={i.id} className="bg-[#fef9eb] p-8 rounded-[3rem] border-4 border-white shadow-md relative overflow-hidden">
             <p className="text-2xl font-bold text-gray-800 mb-4 underline decoration-[#fadb31] decoration-4 underline-offset-4 italic">"{i.title}"</p>
             <p className="text-xl text-gray-500 italic leading-relaxed">"{i.content}"</p>
             <div className="mt-6">
                <p className="text-base text-[#f6a118] font-bold">- Enviado por: {i.user_name}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- DESIGN MANAGER COMPONENT ---
const DesignManager: React.FC = () => {
  const { logoUrl, setLogoUrl, supabase } = useApp();
  const fRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  
  const uploadLogoToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Matita_web"); 
    formData.append("folder", "branding");
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dllm8ggob/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.public_id;
    } catch (error) {
      console.error("Error subiendo logo:", error);
      return null;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewFile(file);
  };

  const saveDesign = async () => {
    if (!previewFile && !logoUrl) return;
    setIsSaving(true);
    let finalLogoId = logoUrl;

    if (previewFile) {
      const uploadedId = await uploadLogoToCloudinary(previewFile);
      if (uploadedId) finalLogoId = uploadedId;
    }

    const { error } = await supabase.from('site_config').upsert({ id: 'global', logo_url: finalLogoId });
    
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      setLogoUrl(finalLogoId);
      setPreviewFile(null);
      alert('✨ ¡Logo Guardado Exitosamente! ✨');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 text-center py-6 animate-fadeIn">
      <h3 className="text-5xl font-bold text-[#f6a118] drop-shadow-md">Imagen de Marca 🎨</h3>
      <div className="bg-white p-12 rounded-[4rem] shadow-xl space-y-10 border-[10px] border-[#fef9eb]">
        <div className="w-60 h-60 bg-[#fef9eb] rounded-full mx-auto shadow-inner flex items-center justify-center p-8 border-4 border-white group relative overflow-hidden">
           <img 
             src={previewFile ? URL.createObjectURL(previewFile) : getImgUrl(logoUrl, 300)} 
             className="w-full h-full object-contain" 
             alt="Logo" 
           />
           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity" onClick={() => fRef.current?.click()}>
              <p className="text-white font-bold text-2xl">Cambiar</p>
           </div>
        </div>
        <input type="file" ref={fRef} className="hidden" onChange={handleLogoChange} accept="image/*" />
        
        <div className="space-y-6">
           <p className="text-xl text-gray-400 italic">"Este logo aparecerá en el inicio de la tienda." 🌸</p>
           <button 
              onClick={saveDesign} 
              disabled={isSaving}
              className="w-full py-6 matita-gradient-orange text-white rounded-[2rem] text-3xl font-bold shadow-xl border-4 border-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
           >
              {isSaving ? "Guardando..." : "Guardar Cambios ✨"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
