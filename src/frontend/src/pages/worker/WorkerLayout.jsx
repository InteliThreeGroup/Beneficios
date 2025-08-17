import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { Wallet, User, QrCode, HandCoins, LogOut, Bell } from "lucide-react";

export function WorkerLayout() {
  const { logout, profile } = useAuth();

  // Classes para os links da sidebar no desktop
  const activeDesktopLinkClasses = "bg-blue-100 text-blue-600";
  const inactiveDesktopLinkClasses = "text-gray-600 hover:bg-gray-100";

  // Classes para os links da barra de navegação no mobile
  const activeMobileLinkClasses = "text-blue-500";
  const inactiveMobileLinkClasses = "text-gray-400";  

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex">
        {/* --- Sidebar (Menu Lateral Esquerdo) --- */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
          <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
            <HandCoins size={32} className="text-blue-600" />
            <h1 className="text-2xl font-bold">BeneChain</h1>
          </div>
          <nav className="flex flex-col space-y-2 flex-1 p-4">
            <NavLink 
              to="/carteira" 
              className={({ isActive }) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}
            >
              <Wallet size={20} />
              <span>Carteira</span>
            </NavLink>
            <NavLink 
              to="/pagar-qr" 
              className={({ isActive }) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}
            >
              <QrCode size={20} />
              <span>Pagar</span>
            </NavLink>
            <NavLink 
              to="/perfil" 
              className={({ isActive }) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}
            >
              <User size={20} />
              <span>Perfil</span>
            </NavLink>
          </nav>
          <div className="p-4 border-t border-gray-200">
             <button 
                onClick={logout} 
                className="flex items-center space-x-3 w-full p-3 rounded-lg font-semibold text-red-500 hover:bg-red-50"
              >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* --- Conteúdo Principal (Direita) --- */}
        <div className="flex-1 flex flex-col">
          {/* Cabeçalho do Conteúdo Principal (Apenas Desktop) */}
          <header className="hidden md:flex justify-end items-center bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Bell size={22} />
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-blue-500"></span>
                </button>
                <div className="text-right">
                  <p className="font-semibold">{profile?.name || "Usuário"}</p>
                  <p className="text-sm text-gray-500">Trabalhador</p>
                </div>
                <img 
                  src={`https://avatars.dicebear.com/api/initials/${profile?.name || 'U'}.svg`} 
                  alt="Avatar do usuário" 
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
              </div>
          </header>
          
          {/* O Outlet renderiza a página atual (WalletScreen, ProfileScreen, etc.) */}
          <main className="flex-1 overflow-y-auto">
            <Outlet /> 
          </main>
        </div>
      </div>

      {/* --- Barra de Navegação Inferior (Apenas Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center">
        <NavLink to="/carteira" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}>
          <Wallet size={24} />
          <span className="text-xs">Carteira</span>
        </NavLink>
        <Link to="/pagar-qr" className="bg-blue-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg -mt-8">
          <QrCode size={32} />
        </Link>
        <NavLink to="/perfil" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}>
          <User size={24} />
          <span className="text-xs">Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
}
