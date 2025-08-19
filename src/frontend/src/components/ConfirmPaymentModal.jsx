// src/components/ConfirmPaymentModal.jsx

// O prop 'onClose' seria uma função para fechar o modal
export function ConfirmPaymentModal({ onClose }) {
  // Dados de exemplo que viriam do QR code ou de outra fonte
  const paymentDetails = {
    valor: '50,00',
    estabelecimento: 'Restaurante A',
    data: '17 Agosto 2025, 10:43' // Usando data atual para exemplo
  };

  return (
    // Backdrop: fundo escuro semi-transparente
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50">
      
      {/* Container do Modal */}
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
        
        {/* Alça (Handle) */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

        {/* Cabeçalho */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Confirmar Pagamento
        </h2>

        {/* Detalhes do Pagamento */}
        <div className="space-y-4 text-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Valor</span>
            <span className="font-bold text-gray-800">$ {paymentDetails.valor}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Estabelecimento</span>
            <span className="font-semibold text-gray-700">{paymentDetails.estabelecimento}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Data</span>
            <span className="font-semibold text-gray-700">{paymentDetails.data}</span>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-10">
          <button 
            className="w-full py-4 border-2 border-blue-500 text-blue-500 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-colors"
            onClick={onClose} // Fecha o modal ao clicar em pagar (para este exemplo)
          >
            Pagar
          </button>
        </div>

      </div>
    </div>
  );
}