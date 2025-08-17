import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthClientContext";
import QRCode from "react-qr-code";
import { Loader2, AlertTriangle, QrCode, History, Utensils, BookOpen, HeartPulse, Bus, GraduationCap, Building, Copy, Check, Link } from "lucide-react";

// Mapeamento de benefícios para ícones e nomes
const benefitDetails = {
    Food: { icon: <Utensils className="text-blue-500" />, name: "Alimentação" },
    Culture: { icon: <BookOpen className="text-purple-500" />, name: "Cultura" },
    Health: { icon: <HeartPulse className="text-green-500" />, name: "Saúde" },
    Transport: { icon: <Bus className="text-orange-500" />, name: "Mobilidade" },
    Education: { icon: <GraduationCap className="text-red-500" />, name: "Educação" },
    Default: { icon: <Building className="text-gray-500" />, name: "Outros" }
};
const getBenefitDetails = (type) => benefitDetails[type] || benefitDetails.Default;
const formatBenefitType = (typeObj) => Object.keys(typeObj)[0] || "Default";
const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);
const formatTime = (timestamp) => new Date(Number(timestamp) / 1_000_000).toLocaleString("pt-BR");

export default function EstablishmentDashboard() {
  const { actors, principal, profile } = useAuth();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("qrCode");

  // Estado para o gerador de QR Code
  const [qrAmount, setQrAmount] = useState("");
  const [qrBenefitType, setQrBenefitType] = useState("Food");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!actors || !actors.establishment || !principal) {
      setError("Cliente de autenticação não está pronto.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // --- CORREÇÃO APLICADA ---
      // Removemos a chamada para a função 'getEstablishment' que não existe.
      // Agora, buscamos apenas o histórico de transações.
      const historyResult = await actors.establishment.getTransactionHistory([]); // Passa um array vazio para o argumento opcional
      if (historyResult) {
        setTransactionHistory(historyResult);
      } else {
        setError("Não foi possível carregar o histórico de transações.");
      }
    } catch (err) {
      console.error("Erro ao buscar dados do painel:", err);
      setError("Falha ao carregar o histórico de transações. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }, [actors, principal]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleGenerateQrCode = (e) => {
    e.preventDefault();
    const amountNumber = parseFloat(qrAmount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }
    const qrData = {
      establishmentId: principal.toText(),
      description: profile?.name || "Estabelecimento",
      amount: amountNumber,
      benefitType: qrBenefitType,
    };
    
    const qrDataString = JSON.stringify(qrData);
    setQrCodeValue(qrDataString);
    
    // Gerar link de pagamento
    const encodedData = encodeURIComponent(qrDataString);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/payment?data=${encodedData}`;
    setPaymentLink(link);
    setCopied(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = paymentLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  }
  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center gap-3"><AlertTriangle /> {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Painel do Estabelecimento</h1>
        <p className="text-gray-500 mt-1">Gere cobranças e visualize seu histórico de transações.</p>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('qrCode')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'qrCode' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            <QrCode size={16}/> Gerar QR Code
          </button>
          <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            <History size={16}/> Histórico
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      <div>
        {activeTab === 'qrCode' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Formulário */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Gerar Cobrança</h2>
              <form onSubmit={handleGenerateQrCode} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                  <input type="number" id="amount" value={qrAmount} onChange={(e) => setQrAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00" step="0.01" min="0.01" required
                  />
                </div>
                <div>
                  <label htmlFor="benefitType" className="block text-sm font-medium text-gray-700">Tipo de Benefício</label>
                  <select id="benefitType" value={qrBenefitType} onChange={(e) => setQrBenefitType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    {Object.keys(benefitDetails).filter(k => k !== 'Default').map(key => (
                        <option key={key} value={key}>{benefitDetails[key].name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700">
                  Gerar QR Code
                </button>
              </form>
            </div>
            {/* Visualizador do QR Code */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[300px]">
              {qrCodeValue ? (
                <div className="space-y-6 w-full flex flex-col items-center">
                  <QRCode value={qrCodeValue} size={256} />
                  
                  {/* Link de pagamento */}
                  <div className="w-full max-w-md space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Link de Pagamento</h3>
                      <p className="text-sm text-gray-600">Compartilhe este link para pagamento direto:</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                      <Link size={20} className="text-gray-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={paymentLink}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          copied 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check size={16} />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                      O trabalhador pode escanear o QR Code ou usar o link para realizar o pagamento
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <QrCode size={64} className="mx-auto mb-4"/>
                  <p>O QR Code aparecerá aqui após preencher os dados e clicar em "Gerar".</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
             <h2 className="text-2xl font-semibold mb-4">Histórico de Transações</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefício</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabalhador</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactionHistory.length > 0 ? transactionHistory.map((tx, index) => {
                            const type = formatBenefitType(tx.benefitType);
                            const details = getBenefitDetails(type);
                            return (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(tx.timestamp)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">{details.icon} {details.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={tx.workerId.toText()}>{tx.workerId.toText().substring(0, 15)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">$ {formatAmount(tx.amount)}</td>
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500">Nenhuma transação encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
