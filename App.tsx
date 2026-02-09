
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
      setLoadingSession(true);
      
      // 1. Intentar recuperar usuario persistido (Invitado o Auth)
      const savedUser = localStorage.getItem('matita_persisted_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // 2. Verificar sesión real de Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
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
      }

      // 3. Cargar Favoritos y Config
      const savedFavs = localStorage.getItem('matita_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      
      const { data: configData } = await supabase
        .from('site_config')
        .select('logo_url')
        .eq('id', 'global')
        .single();
      
      if (configData) setLogoUrl(configData.logo_url);
      
      // Pequeño delay para que la transición sea suave
      setTimeout(() => setLoadingSession(false), 800);
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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

  // Pantalla de Carga "Splash"
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#fef9eb] flex flex-col items-center justify-center gap-8 font-matita animate-fadeIn">
        <div className="relative">
          <div className="w-32 h-32 border-t-4 border-[#f6a118] rounded-full animate-spin absolute inset-0"></div>
          <img src={logoUrl} className="w-32 h-32 object-contain p-4 relative z-10 animate-pulse" alt="Cargando" />
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-logo text-[#f6a118] animate-bounce">Matita</h2>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Abriendo la tienda...</p>
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
