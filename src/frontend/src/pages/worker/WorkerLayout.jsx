import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { Wallet, User, QrCode, HandCoins, LogOut, Bell, Trophy } from "lucide-react";

export function WorkerLayout() {
  const { logout, profile } = useAuth();

  // Classes for sidebar links on desktop
  const activeDesktopLinkClasses = "bg-blue-100 text-blue-600";
  const inactiveDesktopLinkClasses = "text-gray-600 hover:bg-gray-100";

  // Classes for navigation bar links on mobile
  const activeMobileLinkClasses = "text-blue-500";
  const inactiveMobileLinkClasses = "text-gray-400";  

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex">
        {/* --- Sidebar (Left Side Menu) --- */}
        <aside className="hidden md:block md:w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <div className="flex flex-col h-screen">
            {/* Sidebar Header */}
            <div className="flex items-center space-x-2 p-4 border-b border-gray-200 min-h-[73px] flex-shrink-0">
              <HandCoins size={32} className="text-blue-600 flex-shrink-0" />
              <h1 className="text-2xl font-bold truncate min-w-0">BeneChain</h1>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex flex-col space-y-2 flex-1 p-4 overflow-y-auto">
              <NavLink 
                to="/carteira" 
                className={({ isActive }) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold min-w-0`}
              >
                <Wallet size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Wallet</span>
              </NavLink>
              
              <NavLink 
                to="/desafios" 
                className={({isActive}) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold min-w-0`}
              >
                <Trophy size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Challenges</span>
              </NavLink>
              
              <NavLink 
                to="/submissoes" 
                className={({isActive}) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold min-w-0`}
              >
                <Bell size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Submissions</span>
              </NavLink>
        
              <NavLink 
                to="/pagar-qr" 
                className={({ isActive }) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold min-w-0`}
              >
                <QrCode size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Pay</span>
              </NavLink>
              
              <NavLink 
                to="/perfil" 
                className={({ isActive }) => `${isActive ? activeDesktopLinkClasses : inactiveDesktopLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold min-w-0`}
              >
                <User size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Profile</span>
              </NavLink>
            </nav>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
               <button 
                  onClick={logout} 
                  className="flex items-center space-x-3 w-full p-3 rounded-lg font-semibold text-red-500 hover:bg-red-50 min-w-0"
                >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="truncate min-w-0">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* --- Main Content (Right) --- */}
        <div className="flex-1 flex flex-col">
          {/* Main Content Header (Desktop Only) */}
          <header className="hidden md:flex justify-end items-center bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Bell size={22} />
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-blue-500"></span>
                </button>
                <div className="text-right">
                  <p className="font-semibold">{profile?.name || "User"}</p>
                  <p className="text-sm text-gray-500">Worker</p>
                </div>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=e5e7eb&color=374151`} 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
              </div>
          </header>
          
          {/* Outlet renders the current page (WalletScreen, ProfileScreen, etc.) */}
          <main className="flex-1 overflow-y-auto">
            <Outlet /> 
          </main>
        </div>
      </div>

      {/* --- Bottom Navigation Bar (Mobile Only) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center">
        <NavLink to="/carteira" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}>
          <Wallet size={24} />
          <span className="text-xs">Wallet</span>
        </NavLink>

        <NavLink to="/desafios" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}>
        <Trophy size={24} />
        <span className="text-xs">Challenges</span>
        </NavLink>

        <NavLink to="/submissoes" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}>
        <Bell size={24} />
        <span className="text-xs">Submissions</span>
        </NavLink>

        <Link to="/pagar-qr" className="bg-blue-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg -mt-8">
          <QrCode size={32} />
        </Link>
        <NavLink to="/perfil" className={({isActive}) => `${isActive ? activeMobileLinkClasses : inactiveMobileLinkClasses} p-2 flex flex-col items-center gap-1`}>
          <User size={24} />
          <span className="text-xs">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
