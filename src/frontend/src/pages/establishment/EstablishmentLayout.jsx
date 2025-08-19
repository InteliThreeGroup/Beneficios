import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { HandCoins, LogOut, LayoutDashboard, Store, Bell, Menu, X } from "lucide-react";
import { useState } from "react";

export default function EstablishmentLayout() {
  const { logout, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeLinkClasses = "bg-blue-100 text-blue-600";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100";
  
  // Classes para navegação mobile
  const activeMobileLinkClasses = "text-blue-500";
  const inactiveMobileLinkClasses = "text-gray-400";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex">
        {/* --- Sidebar Desktop (Menu Lateral Esquerdo) --- */}
        <aside className="hidden md:block md:w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <div className="flex flex-col h-screen">
            {/* Header da Sidebar */}
            <div className="flex items-center space-x-2 p-4 border-b border-gray-200 min-h-[73px] flex-shrink-0">
              <HandCoins size={32} className="text-blue-600 flex-shrink-0" />
              <h1 className="text-2xl font-bold truncate min-w-0">BeneChain</h1>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex flex-col space-y-2 flex-1 p-4 overflow-y-auto">
              <NavLink 
                to="/estabelecimento" 
                end
                className={({ isActive }) => `${isActive ? activeLinkClasses : inactiveLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold min-w-0`}
              >
                <LayoutDashboard size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Painel</span>
              </NavLink>
            </nav>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
               <button 
                  onClick={logout} 
                  className="flex items-center space-x-3 w-full p-3 rounded-lg font-semibold text-red-500 hover:bg-red-50 min-w-0"
                >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* --- Menu Mobile Overlay --- */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <HandCoins size={28} className="text-blue-600" />
                    <h1 className="text-xl font-bold">BeneChain</h1>
                  </div>
                  <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                
                {/* Navigation */}
                <nav className="flex flex-col space-y-2 flex-1 p-4">
                  <NavLink 
                    to="/estabelecimento" 
                    end
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `${isActive ? activeLinkClasses : inactiveLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}
                  >
                    <LayoutDashboard size={20} />
                    <span>Painel</span>
                  </NavLink>
                </nav>
                
                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-200 space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'E')}&background=e5e7eb&color=374151`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{profile?.name || "Estabelecimento"}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Store size={12}/> Estabelecimento
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); closeMobileMenu(); }} 
                    className="flex items-center space-x-3 w-full p-3 rounded-lg font-semibold text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={20} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Conteúdo Principal (Direita) --- */}
        <div className="flex-1 flex flex-col">
          <header className="flex justify-between items-center bg-white border-b border-gray-200 p-4">
              {/* Menu Mobile & Logo */}
              <div className="flex items-center space-x-3 md:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-2">
                  <HandCoins size={28} className="text-blue-600" />
                  <h1 className="text-xl font-bold">BeneChain</h1>
                </div>
              </div>
              
              {/* User Info Desktop */}
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Bell size={22} />
                </button>
                <div className="text-right hidden md:block">
                  <p className="font-semibold">{profile?.name || "Estabelecimento"}</p>
                  <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
                    <Store size={14}/> Estabelecimento
                  </p>
                </div>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'E')}&background=e5e7eb&color=374151`} 
                  alt="Avatar do usuário" 
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
              </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 pb-24 md:pb-8">
            <Outlet /> 
          </main>
        </div>
      </div>

      {/* --- Barra de Navegação Inferior (Apenas Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center">
        <NavLink 
          to="/estabelecimento" 
          end
          className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs">Painel</span>
        </NavLink>

        {/* Espaço para futuras funcionalidades */}
        <div className="p-2 flex flex-col items-center gap-1 text-gray-300">
          <Store size={24} />
          <span className="text-xs">Em breve</span>
        </div>

        <div className="p-2 flex flex-col items-center gap-1 text-gray-300">
          <Bell size={24} />
          <span className="text-xs">Em breve</span>
        </div>

        <div className="p-2 flex flex-col items-center gap-1 text-gray-300">
          <LogOut size={24} />
          <span className="text-xs">Config</span>
        </div>
      </nav>
    </div>
  );
}
