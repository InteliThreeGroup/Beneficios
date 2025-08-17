// src/components/ExtratoScreen.jsx

import { Search } from 'lucide-react';

// Dados Mock
const transacoesPorDia = [
  {
    data: 'Terça - Feira',
    transacoes: [
      { id: 1, local: 'Restaurante A', categoria: 'Refeição', valor: '50,95', hora: '13h33', corCategoria: 'text-blue-500' },
      { id: 2, local: 'Cinema B', categoria: 'Cultura', valor: '33,95', hora: '15h22', corCategoria: 'text-purple-500' },
      { id: 3, local: 'Restaurante C', categoria: 'Refeição', valor: '45,23', hora: '16h59', corCategoria: 'text-blue-500' },
      { id: 4, local: 'Supermercado A', categoria: 'Alimentação', valor: '100,12', hora: '19h25', corCategoria: 'text-green-500' },
    ]
  },
  {
    data: 'Segunda - Feira',
    transacoes: [
      { id: 5, local: 'Restaurante E', categoria: 'Refeição', valor: '42,35', hora: '12h30', corCategoria: 'text-blue-500' },
    ]
  }
];

export function ExtratoScreen() {
  const activeTab = 'Diário';

  return (
    <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold">Extrato</h1>
      </header>

      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        <button className={`py-2 font-semibold ${activeTab === 'Diário' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>Diário</button>
        <button className={`py-2 font-semibold ${activeTab === 'Mensal' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>Mensal</button>
        <button className={`py-2 font-semibold ${activeTab === 'Anual' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>Anual</button>
      </div>

      <div className="relative mb-6">
        <input type="text" placeholder="Buscar..." className="w-full bg-white border-gray-200 focus:border-blue-300 focus:ring-0 rounded-lg py-3 px-4"/>
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <div className="space-y-6">
        {transacoesPorDia.map((grupo) => (
          <div key={grupo.data}>
            <h3 className="text-gray-500 font-semibold mb-3">{grupo.data}</h3>
            <div className="bg-white rounded-xl shadow-sm">
              {grupo.transacoes.map((transacao, index) => (
                <div key={transacao.id} className={`flex justify-between items-center p-4 ${index < grupo.transacoes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <p className="font-semibold">{transacao.local}</p>
                    <p className={`text-sm font-medium ${transacao.corCategoria}`}>{transacao.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500">$ {transacao.valor}</p>
                    <p className="text-sm text-gray-400">{transacao.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}