import { useState, useEffect } from "react";
import { useAuth } from "./AuthClientContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Principal } from "@dfinity/principal";
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Store, Coins, Calendar, User } from "lucide-react";

export function PaymentScreen() {
  const { actors, principal } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [validating, setValidating] = useState(true);

  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setMessage({ text: "Link de pagamento inválido - dados não encontrados.", type: "error" });
      setValidating(false);
      return;
    }

    try {
      const decodedData = decodeURIComponent(data);
      const parsedData = JSON.parse(decodedData);
      
      // Validação básica dos dados
      if (!parsedData.establishmentId || typeof parsedData.amount !== "number" || !parsedData.benefitType) {
        setMessage({ text: "Dados de pagamento inválidos ou incompletos.", type: "error" });
        setValidating(false);
        return;
      }

      setPaymentData(parsedData);
      setValidating(false);
    } catch (error) {
      console.error("Erro ao processar dados do link:", error);
      setMessage({ text: "Erro ao processar o link de pagamento.", type: "error" });
      setValidating(false);
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!paymentData) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const establishmentPrincipal = Principal.fromText(paymentData.establishmentId);
      const amountInNats = BigInt(Math.floor(paymentData.amount * 10000));

      // Primeiro, valida se o estabelecimento existe e aceita este tipo de benefício
      try {
        const validation = await actors.establishment.validatePayment(
          establishmentPrincipal, 
          { [paymentData.benefitType]: null }, 
          amountInNats
        );
        
        if (!validation.isValid) {
          setMessage({ 
            text: `Pagamento não pode ser realizado: ${validation.reason?.[0] || "Estabelecimento inválido"}`, 
            type: "error" 
          });
          return;
        }
      } catch (validationError) {
        console.error("Erro na validação:", validationError);
        setMessage({ 
          text: "Erro ao validar estabelecimento. Verifique se está registrado no sistema.", 
          type: "error" 
        });
        return;
      }

      const debitRequest = {
        workerId: principal,
        establishmentId: establishmentPrincipal,
        establishmentName: paymentData.description || "Estabelecimento",
        benefitType: { [paymentData.benefitType]: null },
        amount: amountInNats,
        description: paymentData.description || "Pagamento via link",
      };

      const debitResult = await actors.wallets.debitBalance(debitRequest);

      if (debitResult.ok) {
        setMessage({ 
          text: `Pagamento de $ ${formatAmount(amountInNats)} realizado com sucesso!`, 
          type: "success" 
        });
        setTimeout(() => navigate("/carteira"), 3000);
      } else {
        setMessage({ 
          text: `Falha no pagamento: ${debitResult.err}`, 
          type: "error" 
        });
      }
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      setMessage({ 
        text: `Erro inesperado: ${err.message}`, 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Validando dados de pagamento...</p>
        </div>
      </div>
    );
  }

  if (!paymentData || message.type === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-4">Erro no Pagamento</h2>
          <p className="text-gray-600 mb-6">{message.text}</p>
          <button 
            onClick={() => navigate("/carteira")} 
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700"
          >
            Voltar à Carteira
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button 
            onClick={() => navigate("/carteira")} 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 ml-6">Confirmar Pagamento</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Estabelecimento Info */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Store className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{paymentData.description}</h2>
            <p className="text-gray-500 mt-1">Estabelecimento</p>
          </div>

          {/* Payment Details */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Coins className="text-green-600" size={20} />
                <span className="text-gray-700 font-medium">Valor do Pagamento</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                $ {formatAmount(paymentData.amount * 10000)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-gray-700 font-medium">Data</span>
              </div>
              <span className="text-gray-800">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="text-purple-600" size={20} />
                <span className="text-gray-700 font-medium">Tipo de Benefício</span>
              </div>
              <span className="text-gray-800 capitalize">
                {paymentData.benefitType}
              </span>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg flex items-center space-x-3 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message.type === 'success' ? 
                <CheckCircle size={20} /> : 
                <AlertTriangle size={20} />
              }
              <span>{message.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processando...</span>
                </>
              ) : (
                <span>Confirmar Pagamento</span>
              )}
            </button>
            
            <button 
              onClick={() => navigate("/carteira")} 
              disabled={loading}
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}