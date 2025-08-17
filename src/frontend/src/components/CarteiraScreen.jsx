// src/components/CarteiraScreen.jsx

import { useState } from 'react';
import { Bell, ShoppingBasket, Utensils, Car, Clapperboard } from 'lucide-react';
import { ConfirmPaymentModal } from './ConfirmPaymentModal'; // Importe o modal

// Dados Mock
const saldos = [
  { id: 1, nome: 'Alimentação', valor: '432.90', icon: <ShoppingBasket size={24} className="text-blue-500" /> },
  { id: 2, nome: 'Refeição', valor: '500.30', icon: <Utensils size={24} className="text-blue-500" /> },
  { id: 3, nome: 'Mobilidade', valor: '200.35', icon: <Car size={24} className="text-blue-500" /> },
  { id: 4, nome: 'Cultura', valor: '116.50', icon: <Clapperboard size={24} className="text-blue-500" /> },
];
const transacaoRecente = {
  local: 'Restaurante A',
  categoria: 'Alimentação',
  valor: '50,95',
  hora: '13h33',
};

export function CarteiraScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
        <header className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500">Carteira</p>
            <h1 className="text-3xl font-bold">Benefícios</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2">
              <Bell size={24} className="text-gray-600" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-blue-500"></span>
            </button>
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Foto do usuário" className="w-10 h-10 rounded-full" />
          </div>
        </header>

        <section>
          <div className='flex justify-between items-center mb-4'>
            <h2 className="text-lg font-semibold text-gray-700">Meus Saldos</h2>
            <button onClick={() => setIsModalOpen(true)} className='bg-green-500 text-white text-sm font-bold py-2 px-3 rounded-lg'>Simular Pagamento</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {saldos.map((saldo) => (
              <div key={saldo.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">{saldo.icon}</div>
                  <span className="font-medium">{saldo.nome}</span>
                </div>
                <span className="font-bold text-lg">$ {saldo.valor}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Extrato</h2>
            <a href="#" className="text-blue-500 font-semibold">Veja Mais</a>
          </div>
          <div>
            <h3 className="text-gray-500 font-medium mb-3">Terça - Feira</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{transacaoRecente.local}</p>
                <p className="text-sm text-blue-500 font-medium">{transacaoRecente.categoria}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-500">$ {transacaoRecente.valor}</p>
                <p className="text-sm text-gray-400">{transacaoRecente.hora}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && <ConfirmPaymentModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}