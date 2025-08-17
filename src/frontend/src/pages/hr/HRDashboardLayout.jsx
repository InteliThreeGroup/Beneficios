import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { HandCoins, LogOut, LayoutDashboard, Briefcase, Users, FileText, Bell, UserCheck } from "lucide-react";

export default function HRDashboardLayout() {
  const { logout, profile } = useAuth();

  const navItems = [
    { path: "/hr/painel", label: "Painel e Fundos", icon: <LayoutDashboard size={20} /> },
    { path: "/hr/programas", label: "Programas", icon: <Briefcase size={20} /> },
    { path: "/hr/trabalhadores", label: "Gerir Trabalhadores", icon: <Users size={20} /> },
    { path: "/hr/relatorios", label: "Relatórios", icon: <FileText size={20} /> },
  ];

  const activeLinkClasses = "bg-blue-100 text-blue-600";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100";

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
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                className={({ isActive }) => `${isActive ? activeLinkClasses : inactiveLinkClasses} flex items-center space-x-3 p-3 rounded-lg font-semibold`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
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
        <div className="flex-1 flex flex-col h-screen">
          <header className="flex justify-between md:justify-end items-center bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-2 md:hidden">
                <HandCoins size={28} className="text-blue-600" />
                <h1 className="text-xl font-bold">BeneChain</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Bell size={22} />
                </button>
                <div className="text-right">
                  <p className="font-semibold">{profile?.name || "Usuário"}</p>
                  <p className="text-sm text-gray-500 flex items-center justify-end gap-1"><UserCheck size={14}/> Recursos Humanos</p>
                </div>
                <img 
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile?.name || 'HR'}`} 
                  alt="Avatar do usuário" 
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
              </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            {/* As páginas de RH (Painel, Programas, etc.) serão renderizadas aqui */}
            <Outlet /> 
          </main>
        </div>
      </div>
    </div>
  );
}
