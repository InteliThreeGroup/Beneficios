// src/components/QRCodeScannerScreen.jsx

import { X } from 'lucide-react'; // Ícone para fechar

export function QRCodeScannerScreen() {
  return (
    // Container principal que ocupa a tela inteira
    <div className="min-h-screen bg-white flex flex-col items-center p-6 font-sans">
      
      {/* Botão de Fechar (opcional, mas bom para usabilidade) */}
      <div className="w-full flex justify-end">
        <button className="p-2 text-gray-500 hover:text-gray-800">
          <X size={28} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {/* Textos de Instrução */}
        <h1 className="text-2xl font-bold text-gray-800">Aponte a câmera para o QR Code</h1>
        <p className="text-gray-500 mt-2 max-w-xs">
          Espere um pouco e evite mexer para leitura correta do código
        </p>

        {/* Mira do Scanner */}
        <div className="w-64 h-64 md:w-72 md:h-72 border-4 border-blue-500 rounded-3xl my-12 animate-pulse">
          {/* Em uma aplicação real, o feed da câmera apareceria aqui */}
        </div>
      </div>
      
      {/* Botão de Ação Alternativa */}
      <div className="w-full max-w-sm">
        <button className="w-full py-4 border-2 border-blue-500 text-blue-500 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-colors">
          Digite a Chave
        </button>
      </div>
    </div>
  );
}