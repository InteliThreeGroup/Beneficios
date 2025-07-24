// src/frontend/src/components/EstablishmentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthClientContext';
import { Principal } from '@dfinity/principal';

const EstablishmentDashboard = () => {
  const { actors, principal, profile } = useAuth();
  const [establishmentProfile, setEstablishmentProfile] = useState(null); // Pode ser null
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o formulário de REGISTRO do estabelecimento
  const [registerName, setRegisterName] = useState('');
  const [registerCountry, setRegisterCountry] = useState('');
  const [registerBusinessCode, setRegisterBusinessCode] = useState('');
  // Sugere o próprio principal logado como principal da carteira do estabelecimento
  const [registerWalletPrincipal, setRegisterWalletPrincipal] = useState(principal ? principal.toText() : ''); 
  const [acceptedBenefitTypes, setAcceptedBenefitTypes] = useState(['Food']); // Array de strings para checkboxes, "Food" como default
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');

  // Estados para o formulário de PAGAMENTO (existente)
  const [workerPrincipalInput, setWorkerPrincipalInput] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [benefitType, setBenefitType] = useState('Food'); // "Food" como default
  const [description, setDescription] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Função para buscar os dados do estabelecimento e histórico
  const fetchEstablishmentData = async () => {
    if (!actors || !actors.establishment || !principal) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const estProfileResult = await actors.establishment.getEstablishment();
      if (estProfileResult.ok) {
        setEstablishmentProfile(estProfileResult.ok);
        // Se o perfil for encontrado, buscar histórico de transações
        // Passando BigInt(10) para o limite, pois 'Nat' no Motoko se traduz para 'BigInt' no JS.
        const txHistoryResult = await actors.establishment.getTransactionHistory([BigInt(10)]); 
        setTransactionHistory(txHistoryResult);
      } else {
        // Perfil não encontrado, então setamos como null e limpamos o histórico
        setEstablishmentProfile(null);
        setTransactionHistory([]);
        setError(`Erro ao buscar perfil do estabelecimento: ${estProfileResult.err}`);
      }
    } catch (err) {
      console.error("Erro ao buscar dados do estabelecimento:", err);
      setError("Falha ao carregar dados do estabelecimento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Atualiza o Principal sugerido para o campo de carteira quando o principal do AuthContext muda
    if (principal && !registerWalletPrincipal) {
      setRegisterWalletPrincipal(principal.toText());
    }
    fetchEstablishmentData();
  }, [actors, principal]); // Dependências para re-executar quando atores ou principal mudarem

  // Handler para o formulário de REGISTRO do estabelecimento
  const handleRegisterEstablishment = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage('');

    if (!actors || !actors.establishment) {
      setRegisterMessage("Erro: Atores do canister não carregados.");
      setRegisterLoading(false);
      return;
    }

    try {
      let walletId;
      try {
        walletId = Principal.fromText(registerWalletPrincipal);
      } catch (err) {
        setRegisterMessage("Erro: Principal da carteira inválido.");
        setRegisterLoading(false);
        return;
      }

      // Converte as strings dos tipos de benefício para o formato de variante do Motoko
      const parsedAcceptedBenefitTypes = acceptedBenefitTypes.map(type => {
        // Mapeia a string para o formato de variante Motoko (e.g., { Food: null })
        if (type === 'Food') return { Food: null };
        if (type === 'Culture') return { Culture: null };
        if (type === 'Health') return { Health: null };
        if (type === 'Transport') return { Transport: null };
        if (type === 'Education') return { Education: null };
        return null; // Caso um tipo inválido seja selecionado (deveria ser evitado pelo UI)
      }).filter(Boolean); // Filtra quaisquer valores nulos resultantes de tipos inválidos

      const request = {
        name: registerName,
        country: registerCountry,
        businessCode: registerBusinessCode,
        walletPrincipal: walletId,
        acceptedBenefitTypes: parsedAcceptedBenefitTypes,
      };

      const result = await actors.establishment.registerEstablishment(request);

      if (result.ok) {
        setRegisterMessage("Estabelecimento registrado com sucesso!");
        await fetchEstablishmentData(); // Recarrega os dados para exibir o dashboard completo
      } else {
        setRegisterMessage(`Falha ao registrar estabelecimento: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao registrar estabelecimento:", err);
      setRegisterMessage(`Erro inesperado ao registrar: ${err.message}`);
    } finally {
      setRegisterLoading(false);
    }
  };


  // Handler para o formulário de PAGAMENTO
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentMessage('');

    if (!actors || !actors.establishment) {
      setPaymentMessage("Erro: Atores do canister não carregados.");
      setPaymentLoading(false);
      return;
    }

    try {
      let workerId;
      try {
        workerId = Principal.fromText(workerPrincipalInput);
      } catch (err) {
        setPaymentMessage("Erro: Principal do trabalhador inválido.");
        setPaymentLoading(false);
        return;
      }

      // Converte a string do select para o formato de variante do Motoko
      let selectedBenefitType;
      if (benefitType === 'Food') selectedBenefitType = { Food: null };
      else if (benefitType === 'Culture') selectedBenefitType = { Culture: null };
      else if (benefitType === 'Health') selectedBenefitType = { Health: null };
      else if (benefitType === 'Transport') selectedBenefitType = { Transport: null };
      else if (benefitType === 'Education') selectedBenefitType = { Education: null };
      else {
        setPaymentMessage("Erro: Tipo de benefício inválido.");
        setPaymentLoading(false);
        return;
      }

      // Converte o valor decimal (string) para Nat (BigInt), multiplicando por 10000
      const amountInNats = BigInt(Math.floor(parseFloat(paymentAmount) * 10000)); 

      const request = {
        workerId: workerId,
        benefitType: selectedBenefitType,
        amount: amountInNats,
        description: description,
      };

      const result = await actors.establishment.processPayment(request);

      if (result.ok) {
        setPaymentMessage(`Pagamento processado com sucesso! ID: ${result.ok}`);
        await fetchEstablishmentData(); // Recarrega os dados após o sucesso
        // Limpa os campos do formulário
        setWorkerPrincipalInput('');
        setPaymentAmount('');
        setDescription('');
      } else {
        setPaymentMessage(`Falha no pagamento: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      setPaymentMessage(`Erro inesperado ao processar pagamento: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Funções utilitárias para formatação
  const formatBenefitType = (type) => {
    if (typeof type === 'object' && type !== null) {
      return Object.keys(type)[0];
    }
    return 'Unknown';
  };

  const formatPaymentStatus = (status) => {
    if (typeof status === 'object' && status !== null) {
      return Object.keys(status)[0];
    }
    return 'Unknown';
  };

  const formatAmount = (amount) => {
    // Converte Nat (BigInt) para número e formata para 2 casas decimais
    return (Number(amount) / 10000).toFixed(2);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp === null) return 'N/A';
    // Converte nanossegundos (Nat) para milissegundos para Date
    return new Date(Number(timestamp) / 1_000_000).toLocaleString();
  };

  // Handler para checkboxes de tipos de benefício aceitos
  const handleBenefitTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAcceptedBenefitTypes([...acceptedBenefitTypes, value]);
    } else {
      setAcceptedBenefitTypes(acceptedBenefitTypes.filter(type => type !== value));
    }
  };

  // Exibe "Carregando..." enquanto os dados estão sendo buscados
  if (loading) return <p>Carregando painel do estabelecimento...</p>;

  return (
    <div>
      <h2>Painel do Estabelecimento - Bem-vindo(a), {profile?.name}!</h2>
      {error && !establishmentProfile && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe o erro se não há perfil */}
      
      {establishmentProfile ? ( 
        // Se o perfil do estabelecimento EXISTE no canister `establishment.mo`
        <div>
          <p>Nome do Estabelecimento: {establishmentProfile.name}</p>
          <p>País: {establishmentProfile.country}</p>
          <p>Código de Negócio: {establishmentProfile.businessCode}</p>
          <p>Tipos de Benefício Aceitos: {establishmentProfile.acceptedBenefitTypes.map(formatBenefitType).join(', ')}</p>
          <p>Total Recebido: {formatAmount(establishmentProfile.totalReceived)} ICP</p>

          <h3>Processar Pagamento</h3>
          <form onSubmit={handlePaymentSubmit} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="workerPrincipal" style={{ display: 'block', marginBottom: '0.5rem' }}>Principal do Trabalhador:</label>
              <input
                type="text"
                id="workerPrincipal"
                value={workerPrincipalInput}
                onChange={(e) => setWorkerPrincipalInput(e.target.value)}
                required
                placeholder="Ex: <principal-do-trabalhador>"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="paymentAmount" style={{ display: 'block', marginBottom: '0.5rem' }}>Quantia (ICP):</label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                step="0.01"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="benefitType" style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Benefício:</label>
              <select
                id="benefitType"
                value={benefitType}
                onChange={(e) => setBenefitType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="Food">Alimentação</option>
                <option value="Culture">Cultura</option>
                <option value="Health">Saúde</option>
                <option value="Transport">Transporte</option>
                <option value="Education">Educação</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Descrição:</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Compra no supermercado"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <button
              type="submit"
              disabled={paymentLoading}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {paymentLoading ? 'Processando...' : 'Processar Pagamento'}
            </button>
            {paymentMessage && <p style={{ marginTop: '1rem', color: paymentMessage.startsWith('Falha') ? 'red' : 'green' }}>{paymentMessage}</p>}
          </form>

          <h3>Histórico de Transações Recebidas</h3>
          {transactionHistory.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ID Transação</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Trabalhador</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo Benefício</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Valor</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.id}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.workerId.toText()}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatBenefitType(tx.benefitType)}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatAmount(tx.amount)} ICP</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatPaymentStatus(tx.status)}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.description}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatTimestamp(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhuma transação recebida.</p>
          )}
        </div>
      ) : (
        // Se o perfil do estabelecimento NÃO EXISTE no canister `establishment.mo`, mostra o formulário de registro
         <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Registrar Estabelecimento</h3>
          <p>Seu Principal: {principal?.toString()}</p>
          <form onSubmit={handleRegisterEstablishment}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="registerName" style={{ display: 'block', marginBottom: '0.5rem' }}>Nome do Estabelecimento:</label>
              <input
                type="text"
                id="registerName"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="registerCountry" style={{ display: 'block', marginBottom: '0.5rem' }}>País:</label>
              <input
                type="text"
                id="registerCountry"
                value={registerCountry}
                onChange={(e) => setRegisterCountry(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="registerBusinessCode" style={{ display: 'block', marginBottom: '0.5rem' }}>Código de Negócio:</label>
              <input
                type="text"
                id="registerBusinessCode"
                value={registerBusinessCode}
                onChange={(e) => setRegisterBusinessCode(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="registerWalletPrincipal" style={{ display: 'block', marginBottom: '0.5rem' }}>Principal da Carteira para Recebimento:</label>
              <input
                type="text"
                id="registerWalletPrincipal"
                value={registerWalletPrincipal}
                onChange={(e) => setRegisterWalletPrincipal(e.target.value)}
                required
                readOnly // Geralmente, é o mesmo principal do usuário logado
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipos de Benefício Aceitos:</label>
              {/* O `acceptedBenefitTypes` permite Food, Culture, Health, Transport, Education. */}
              {['Food', 'Culture', 'Health', 'Transport', 'Education'].map(type => (
                <label key={type} style={{ marginRight: '1rem' }}>
                  <input
                    type="checkbox"
                    value={type}
                    checked={acceptedBenefitTypes.includes(type)}
                    onChange={handleBenefitTypeChange}
                  />
                  {type}
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={registerLoading}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {registerLoading ? 'Registrando...' : 'Registrar Estabelecimento'}
            </button>
            {registerMessage && <p style={{ marginTop: '1rem', color: registerMessage.startsWith('Falha') ? 'red' : 'green' }}>{registerMessage}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default EstablishmentDashboard;