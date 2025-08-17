// src/components/ProfileScreen.jsx

import { ChevronRight, UserCog, Bell, HelpCircle, Lock, FileText, LogOut } from 'lucide-react';

// Dados Mock
const menuOptionsGroup1 = [
  { id: 1, text: 'Meus Dados', icon: <UserCog size={22} className="text-gray-500" /> },
  { id: 2, text: 'Configurações de Notificação', icon: <Bell size={22} className="text-gray-500" /> },
];
const menuOptionsGroup2 = [
  { id: 1, text: 'Perguntas Frequentes', icon: <HelpCircle size={22} className="text-gray-500" /> },
  { id: 2, text: 'Privacidade', icon: <Lock size={22} className="text-gray-500" /> },
  { id: 3, text: 'Termos de Uso', icon: <FileText size={22} className="text-gray-500" /> },
];
const user = {
  name: 'Nome Sobrenome',
  email: 'email@dominio.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

export function NewProfileScreen() {
  return (
    <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold">Perfil</h1>
      </header>

      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center mb-8">
        <img src={user.avatarUrl} alt="Foto do perfil" className="w-24 h-24 rounded-full border-4 border-gray-200" />
        <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
        <button className="mt-4 bg-blue-100 text-blue-600 font-semibold py-2 px-5 rounded-lg hover:bg-blue-200 transition-colors">
          Editar Perfil
        </button>
      </section>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuOptionsGroup1.map((item, index) => (
            <a href="#" key={item.id} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${index < menuOptionsGroup1.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center space-x-4">
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuOptionsGroup2.map((item, index) => (
            <a href="#" key={item.id} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${index < menuOptionsGroup2.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center space-x-4">
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <a href="#" className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 text-red-500 font-semibold">
            <LogOut size={22} />
            <span>Sair</span>
          </a>
        </div>
      </div>
    </div>
  );
}