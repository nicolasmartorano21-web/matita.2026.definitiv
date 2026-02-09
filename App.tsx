
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import ClubView from './components/ClubView';
import LoginScreen from './components/LoginScreen';
import Ideas from './components/Ideas';
import Contact from './components/Contact';
import { Product, CartItem, User, Category } from './types';

const SUPABASE_URL = 'https://jjgvfzaxcxfgyziikybd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hNWUKMZrLljdMaVN8NgWcw_b9UR3nVS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  supabase: SupabaseClient;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>("https://i.ibb.co/L6v3X8G/matita-logo.png");

  useEffect(() => {
    const initApp = async () => {
      // Iniciamos carga
      setLoadingSession(true);
      
      try {
        // 1. Recuperación inmediata de caché para velocidad en móviles
        const savedUser = localStorage.getItem('matita_persisted_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const savedFavs = localStorage.getItem('matita_favs');
        if (savedFavs) setFavorites(JSON.parse(savedFavs));

        // 2. Verificación de sesión real de Supabase (con tiempo límite)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));

        // Intentamos obtener la sesión, pero no bloqueamos la app más de 3 segundos
        const sessionResult: any = await Promise.race([sessionPromise, timeoutPromise]).catch(() => null);
        
        if (sessionResult?.data?.session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionResult.data.session.user.id)
            .single();
          
          if (userData) {
            const fullUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              points: userData.points,
              isAdmin: userData.is_admin,
              isSocio: userData.is_socio,
            };
            setUser(fullUser);
            localStorage.setItem('matita_persisted_user', JSON.stringify(fullUser));
          }
        }

        // 3. Cargar Configuración Global
        const { data: configData } = await supabase
          .from('site_config')
          .select('logo_url')
          .eq('id', 'global')
          .single();
        
        if (configData) setLogoUrl(configData.logo_url);

      } catch (error) {
        console.error("Error en el arranque:", error);
      } finally {
        // Pase lo que pase, quitamos la pantalla de carga para que la web sea usable
        setTimeout(() => setLoadingSession(false), 500);
      }
    };

    initApp();

    // Listener de cambios de estado (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          const fullUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            points: userData.points,
            isAdmin: userData.is_admin,
            isSocio: userData.is_socio,
          };
          setUser(fullUser);
          localStorage.setItem('matita_persisted_user', JSON.stringify(fullUser));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('matita_persisted_user');
        clearCart();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Guardar favoritos cada vez que cambien
  useEffect(() => {
    localStorage.setItem('matita_favs', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // Pantalla de Carga "Splash" con diseño mejorado
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#fef9eb] flex flex-col items-center justify-center gap-8 font-matita overflow-hidden">
        <div className="relative scale-125 md:scale-150">
          <div className="w-32 h-32 border-[6px] border-[#fadb31]/20 border-t-[#f6a118] rounded-full animate-spin absolute inset-0"></div>
          <div className="w-32 h-32 flex items-center justify-center relative z-10 animate-float">
             <img src={logoUrl} className="w-20 h-20 object-contain drop-shadow-xl" alt="Matita Logo" />
          </div>
        </div>
        <div className="text-center space-y-2 animate-fadeIn mt-4">
          <h2 className="text-5xl font-logo text-[#f6a118]">Matita</h2>
          <div className="flex gap-1 justify-center">
            <span className="w-2 h-2 bg-[#fadb31] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-[#ea7e9c] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-[#f6a118] rounded-full animate-bounce"></span>
          </div>
          <p className="text-gray-300 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Preparando la magia</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      user, setUser, cart, addToCart, removeFromCart, clearCart, 
      favorites, toggleFavorite, logoUrl, setLogoUrl, supabase
    }}>
      <HashRouter>
        <Routes>
          {!user ? (
            <Route path="*" element={<LoginScreen />} />
          ) : (
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/catalog" />} />
              <Route path="catalog" element={<Catalog category="Catalog" />} />
              <Route path="escolar" element={<Catalog category="Escolar" />} />
              <Route path="regalaria" element={<Catalog category="Regalaría" />} />
              <Route path="oficina" element={<Catalog category="Oficina" />} />
              <Route path="tecnologia" element={<Catalog category="Tecnología" />} />
              <Route path="novelties" element={<Catalog category="Novedades" />} />
              <Route path="ofertas" element={<Catalog category="Ofertas" />} />
              <Route path="favorites" element={<Catalog category="Favorites" />} />
              <Route path="club" element={<ClubView />} />
              <Route path="ideas" element={<Ideas />} />
              <Route path="contact" element={<Contact />} />
              <Route path="admin" element={<AdminPanel />} />
            </Route>
          )}
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
