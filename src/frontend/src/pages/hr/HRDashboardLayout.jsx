import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { HandCoins, LogOut, LayoutDashboard, Briefcase, Users, FileText, Bell, UserCheck, Trophy, Menu, X } from "lucide-react";
import { useState } from "react";

export default function HRDashboardLayout() {
  const { logout, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/hr/painel", label: "Painel e Fundos", icon: <LayoutDashboard size={20} /> },
    { path: "/hr/programas", label: "Programas", icon: <Briefcase size={20} /> },
    // NOVA LINHA ADICIONADA AQUI
    { path: "/hr/desafios", label: "Desafios", icon: <Trophy size={20} /> },
    { path: "/hr/trabalhadores", label: "Gerir Trabalhadores", icon: <Users size={20} /> },
    { path: "/hr/relatorios", label: "Relatórios", icon: <FileText size={20} /> },
  ];

  const activeLinkClasses = "bg-blue-100 text-blue-600";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex">
        {/* --- Sidebar Desktop (Menu Lateral Esquerdo) --- */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:min-w-64 md:max-w-64 bg-white border-r border-gray-200 md:fixed md:h-full md:z-30">
          <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
            <HandCoins size={32} className="text-blue-600" />
            <h1 className="text-2xl font-bold truncate">BeneChain</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors duration-200 group ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  }`
                }
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className="truncate text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg font-medium text-red-500 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut size={20} />
              <span className="truncate text-sm">Sair</span>
            </button>
          </div>
        </aside>

        {/* --- Sidebar Mobile (Menu Overlay) --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Overlay de fundo */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50" 
              onClick={closeMobileMenu}
            ></div>
            
            {/* Menu sidebar móvel */}
            <aside className="relative bg-white w-64 h-full shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <HandCoins size={28} className="text-blue-600" />
                  <h1 className="text-xl font-bold">BeneChain</h1>
                </div>
                <button 
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors duration-200 ${
                        isActive ? activeLinkClasses : inactiveLinkClasses
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg font-medium text-red-500 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut size={20} />
                  <span>Sair</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* --- Conteúdo Principal (Direita) --- */}
        <div className="flex-1 flex flex-col h-screen md:ml-64">
          <header className="flex justify-between items-center bg-white border-b border-gray-200 p-4">
              {/* Mobile: Botão de menu + Logo */}
              <div className="flex items-center space-x-3 md:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={24} className="text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <HandCoins size={24} className="text-blue-600" />
                  <h1 className="text-lg font-bold">BeneChain</h1>
                </div>
              </div>

              {/* Desktop: Apenas informações do usuário */}
              <div className="flex items-center space-x-4 ml-auto">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Bell size={22} />
                </button>
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm">{profile?.name || "Usuário"}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                    <UserCheck size={12}/> 
                    <span className="hidden md:inline">Recursos Humanos</span>
                    <span className="md:hidden">RH</span>
                  </p>
                </div>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'HR')}&background=e5e7eb&color=374151`} 
                  alt="Avatar do usuário" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200"
                />
              </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            {/* As páginas de RH (Outlet) serão renderizadas aqui */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
