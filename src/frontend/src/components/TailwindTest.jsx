import React from 'react';

export function TailwindTest() {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg m-4">
      <h1 className="text-2xl font-bold mb-2">Teste do Tailwind CSS</h1>
      <p className="text-lg">Se você ver este texto com fundo azul, o Tailwind está funcionando!</p>
      <button className="bg-white text-blue-500 px-4 py-2 rounded mt-4 hover:bg-gray-100 transition-colors">
        Botão de Teste
      </button>
    </div>
  );
}
