// src/components/WalletScreen.jsx

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthClientContext";
import { Link } from "react-router-dom";
import { Bell, Utensils, BookOpen, HeartPulse, Bus, GraduationCap, Building, Loader2, AlertTriangle, Trophy } from "lucide-react";
import { ConfirmPaymentModal } from '../../../components/ConfirmPaymentModal'; // Certifique-se que este componente existe

export function WalletScreen() {
  const { actors, principal, profile } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapeamento de tipos de benefício para ícones e nomes
  const benefitDetails = {
    Food: { icon: <Utensils size={24} className="text-blue-500" />, name: "Alimentação" },
    Culture: { icon: <BookOpen size={24} className="text-purple-500" />, name: "Cultura" },
    Health: { icon: <HeartPulse size={24} className="text-green-500" />, name: "Saúde" },
    Transport: { icon: <Bus size={24} className="text-orange-500" />, name: "Mobilidade" },
    Education: { icon: <GraduationCap size={24} className="text-red-500" />, name: "Educação" },
    Default: { icon: <Building size={24} className="text-gray-500" />, name: "Outros" }
  };

  const getBenefitDetails = (type) => {
    return benefitDetails[type] || benefitDetails.Default;
  };

  const formatBenefitType = (typeObj) => Object.keys(typeObj)[0] || "Default";
  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);
  const formatTime = (timestamp) => new Date(Number(timestamp) / 1_000_000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const fetchData = useCallback(async () => {
    if (!actors || !actors.wallets || !principal) {
      setError("Cliente de autenticação não está pronto.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Primeiro tenta obter a carteira, se não existir, cria uma nova
      let walletResult = await actors.wallets.getWallet();
      
      // Se a carteira não foi encontrada, cria uma nova
      if (walletResult.err === "Wallet not found") {
        console.log("Carteira não encontrada, criando nova carteira...");
        walletResult = await actors.wallets.getOrCreateWalletForUser();
      }
      
      if (walletResult.ok) {
        setWallet(walletResult.ok);
      } else {
        setError(`Erro ao buscar carteira: ${walletResult.err}`);
      }

      const txHistoryResult = await actors.wallets.getTransactions([BigInt(5)]); // Busca as últimas 5
      if(txHistoryResult){
        setTransactions(txHistoryResult);
      }
    } catch (err) {
      console.error("Erro ao buscar dados da carteira:", err);
      setError("Falha ao carregar os dados da carteira.");
    } finally {
      setLoading(false);
    }
  }, [actors, principal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 text-center">
        <AlertTriangle className="text-red-500" size={48} />
        <p className="mt-4 text-red-700">{error}</p>
        <button onClick={fetchData} className="mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg">Tentar Novamente</button>
      </div>
    );
  }

  const latestTransaction = transactions[0];

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
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=e5e7eb&color=374151`} alt="Foto do usuário" className="w-10 h-10 rounded-full bg-gray-200" />
          </div>
        </header>

        {/* <<< ADICIONE ESTE BLOCO DE CÓDIGO AQUI >>> */}
        <Link to="/desafios" className="block bg-blue-600 text-white p-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all mb-8">
            <div className="flex items-center space-x-4">
                <Trophy size={40}/>
                <div>
                    <h2 className="font-bold text-lg">Participe dos Desafios!</h2>
                    <p className="text-blue-100">Ganhe recompensas extras completando tarefas da sua empresa.</p>
                </div>
            </div>
        </Link>
        {/* <<< FIM DO BLOCO DE CÓDIGO >>> */}

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Meus Saldos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {wallet?.balances && wallet.balances.length > 0 ? (
              wallet.balances.map((b) => {
                const type = formatBenefitType(b.benefitType);
                const details = getBenefitDetails(type);
                return (
                  <div key={type} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">{details.icon}</div>
                      <span className="font-medium">{details.name}</span>
                    </div>
                    <span className="font-bold text-lg">$ {formatAmount(b.balance)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 col-span-full">Nenhum saldo encontrado.</p>
            )}
          </div>
        </section>

        <section className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Extrato Recente</h2>
            <Link to="/extrato" className="text-blue-500 font-semibold">Ver Mais</Link>
          </div>
          {latestTransaction ? (
             <div>
                <h3 className="text-gray-500 font-medium mb-3">Terça - Feira</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{latestTransaction.description}</p>
                    <p className="text-sm text-blue-500 font-medium">
                      {getBenefitDetails(formatBenefitType(latestTransaction.benefitType)).name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500">$ {formatAmount(latestTransaction.amount)}</p>
                    <p className="text-sm text-gray-400">{formatTime(latestTransaction.timestamp)}</p>
                  </div>
                </div>
              </div>
          ) : (
            <p className="text-gray-500">Nenhuma transação recente.</p>
          )}
        </section>
      </div>

      {isModalOpen && <ConfirmPaymentModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}