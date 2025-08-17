// src/components/AppLayout.jsx

import { Outlet, NavLink, Link } from 'react-router-dom';
import { Wallet, User, LayoutGrid, HandCoins } from 'lucide-react';

export function AppLayout() {
  const activeLinkClasses = "bg-blue-100 text-blue-600";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100";
  
  const activeMobileLinkClasses = "text-blue-500";
  const inactiveMobileLinkClasses = "text-gray-400 hover:text-blue-500";

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex">
        {/* Sidebar para Desktop */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-10">
            <HandCoins size={32} className="text-blue-600" />
            <h1 className="text-2xl font-bold">Benefícios</h1>
          </div>
          <nav className="flex flex-col space-y-2">
            <NavLink to="/" className={({ isActive }) => `${isActive ? activeLinkClasses : inactiveLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}>
              <Wallet size={20} />
              <span>Carteira</span>
            </NavLink>
            <NavLink to="/extrato" className={({ isActive }) => `${isActive ? activeLinkClasses : inactiveLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}>
              <Wallet size={20} />
              <span>Extrato</span>
            </NavLink>
            <NavLink to="/perfil" className={({ isActive }) => `${isActive ? activeLinkClasses : inactiveLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}>
              <User size={20} />
              <span>Perfil</span>
            </NavLink>
          </nav>
        </aside>

        {/* Conteúdo Principal Dinâmico */}
        <main className="flex-1">
          <Outlet /> {/* As páginas serão renderizadas aqui */}
        </main>
      </div>

      {/* Barra de Navegação Inferior para Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center">
        <NavLink to="/" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2`}>
          <Wallet size={28} />
        </NavLink>
        <Link to="/scan" className="bg-blue-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg -mt-8">
          <LayoutGrid size={32} />
        </Link>
        <NavLink to="/perfil" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2`}>
          <User size={28} />
        </NavLink>
      </nav>
    </div>
  );
}