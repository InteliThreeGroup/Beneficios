// src/frontend/src/components/EstablishmentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthClientContext';
import { Principal } from '@dfinity/principal';
import QRCode from "react-qr-code";

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
  const [registerWalletPrincipal, setRegisterWalletPrincipal] = useState(principal ? principal.toText() : ''); 
  const [acceptedBenefitTypes, setAcceptedBenefitTypes] = useState(['Food']); 
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');

  // Estados para o formulário de PAGAMENTO
  const [workerPrincipalInput, setWorkerPrincipalInput] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [benefitType, setBenefitType] = useState('Food'); 
  const [paymentCurrency, setPaymentCurrency] = useState('ICP'); // Moeda de Pagamento
  const [description, setDescription] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Estados para Geração de QR Code
  const [qrCodeData, setQrCodeData] = useState(''); // String que será codificada no QR Code
  const [showQrCode, setShowQrCode] = useState(false); // Controla a exibição do QR Code

  // Estados para Bitcoin (seção de demonstração)
  const [btcAddressLoading, setBtcAddressLoading] = useState(false);
  const [btcAddressMessage, setBtcAddressMessage] = useState('');
  const [btcBalance, setBtcBalance] = useState('N/A');
  const [btcBalanceLoading, setBtcBalanceLoading] = useState(false);
  const [btcBalanceMessage, setBtcBalanceMessage] = useState('');


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
        const txHistoryResult = await actors.establishment.getTransactionHistory([BigInt(10)]); 
        setTransactionHistory(txHistoryResult);
      } else {
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

  // Efeito para buscar dados e atualizar o principal da carteira no carregamento
  useEffect(() => {
    if (principal && !registerWalletPrincipal) {
      setRegisterWalletPrincipal(principal.toText());
    }
    fetchEstablishmentData();
  }, [actors, principal]);

  // Efeito para buscar saldo BTC quando o perfil do estabelecimento é carregado/atualizado
  useEffect(() => {
    const fetchBtcData = async () => {
      if (establishmentProfile && establishmentProfile.btcAddress && actors && actors.establishment) {
        setBtcBalanceLoading(true);
        setBtcBalanceMessage('');
        try {
          // Hardcoding 'regtest' para ambiente local
          const btcBalanceResult = await actors.establishment.getBtcBalance({ regtest: null }, null); 
          if (btcBalanceResult.ok) {
            setBtcBalance(`${(Number(btcBalanceResult.ok) / 100_000_000).toFixed(8)} BTC`); // 1 BTC = 100,000,000 satoshis
          } else {
            setBtcBalanceMessage(`Falha ao buscar saldo BTC: ${btcBalanceResult.err}`);
            setBtcBalance('0.00000000 BTC');
          }
        } catch (err) {
          console.error("Erro ao buscar saldo BTC:", err);
          setBtcBalanceMessage(`Erro inesperado ao buscar saldo BTC: ${err.message}`);
          setBtcBalance('N/A');
        } finally {
          setBtcBalanceLoading(false);
        }
      } else {
        setBtcBalance('N/A');
      }
    };
    fetchBtcData();
  }, [establishmentProfile, actors]); 

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

      const parsedAcceptedBenefitTypes = acceptedBenefitTypes.map(type => {
        if (type === 'Food') return { Food: null };
        if (type === 'Culture') return { Culture: null };
        if (type === 'Health') return { Health: null };
        if (type === 'Transport') return { Transport: null };
        if (type === 'Education') return { Education: null };
        return null; 
      }).filter(Boolean);

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
        await fetchEstablishmentData(); 
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


  // Handler para o formulário de PAGAMENTO (MODIFICADO PARA GERAR QR CODE)
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentMessage('');
    setQrCodeData(''); // Limpa QR code anterior
    setShowQrCode(false); // Esconde QR code anterior

    if (!actors || !actors.establishment) {
      setPaymentMessage("Erro: Atores do canister não carregados.");
      setPaymentLoading(false);
      return;
    }

    // Lógica para Pagamento em BTC (apenas mensagem de placeholder para MVP)
    if (paymentCurrency === 'BTC') {
      setPaymentMessage("Pagamento em Bitcoin (BTC) selecionado. Esta funcionalidade de débito real ainda está em desenvolvimento!");
      setPaymentLoading(false);
      return; 
    }

    // Lógica para Pagamento em ICP / Geração de QR Code
    try {
      if (!workerPrincipalInput || !paymentAmount || !benefitType || !description) {
        setPaymentMessage("Por favor, preencha todos os campos do pagamento.");
        setPaymentLoading(false);
        return;
      }

      // Prepara dados para o QR Code (e para o processo real depois que o trabalhador escanear)
      const qrData = {
        establishmentId: principal.toText(), // Principal do estabelecimento
        amount: parseFloat(paymentAmount), // Valor em ICP (decimal)
        benefitType: benefitType,
        description: description,
        // Em um ambiente de produção, adicionaríamos um nonce ou transactionId para segurança
      };
      
      const qrCodeString = JSON.stringify(qrData); // Codifica os dados como JSON
      setQrCodeData(qrCodeString); // Atualiza o estado para o QR Code
      setShowQrCode(true); // Mostra o QR Code

      setPaymentMessage("QR Code gerado. Peça ao trabalhador para escanear e confirmar o pagamento.");
      setPaymentLoading(false);
      // A chamada ao canister establishment.processPayment não é feita aqui
      // Ela será feita pelo WorkerDashboard, através do wallets.debitBalance
      
    } catch (err) {
      console.error("Erro ao gerar QR Code de pagamento:", err);
      setPaymentMessage(`Erro inesperado ao gerar QR Code: ${err.message}`);
    } finally {
      // paymentLoading já está false aqui
    }
  };

  // Handler para Geração de Endereço BTC
  const handleGenerateBtcAddress = async () => {
    setBtcAddressLoading(true);
    setBtcAddressMessage('');
    if (!actors || !actors.establishment) {
      setBtcAddressMessage("Erro: Atores do canister não carregados.");
      setBtcAddressLoading(false);
      return;
    }
    try {
      const result = await actors.establishment.generateBtcAddress();
      if (result.ok) {
        setBtcAddressMessage(`Endereço BTC gerado: ${result.ok}`);
        await fetchEstablishmentData(); // Atualiza o perfil para mostrar o endereço
      } else {
        setBtcAddressMessage(`Falha ao gerar endereço BTC: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao gerar endereço BTC:", err);
      setBtcAddressMessage(`Erro inesperado: ${err.message}`);
    } finally {
      setBtcAddressLoading(false);
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
    return (Number(amount) / 10000).toFixed(2);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp === null) return 'N/A';
    return new Date(Number(timestamp) / 1_000_000).toLocaleString();
  };

  const handleBenefitTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAcceptedBenefitTypes([...acceptedBenefitTypes, value]);
    } else {
      setAcceptedBenefitTypes(acceptedBenefitTypes.filter(type => type !== value));
    }
  };

  if (loading) return <p>Carregando painel do estabelecimento...</p>;

  return (
    <div>
      <h2>Painel do Estabelecimento - Bem-vindo(a), {profile?.name}!</h2>
      {error && !establishmentProfile && <p className="message-error">{error}</p>}
      
      {establishmentProfile ? ( 
        <div>
          <p>Nome do Estabelecimento: {establishmentProfile.name}</p>
          <p>País: {establishmentProfile.country}</p>
          <p>Código de Negócio: {establishmentProfile.businessCode}</p>
          <p>Tipos de Benefício Aceitos: {establishmentProfile.acceptedBenefitTypes.map(formatBenefitType).join(', ')}</p>
          <p>Total Recebido: {formatAmount(establishmentProfile.totalReceived)} ICP</p>

          {/* Bloco de Integração Bitcoin */}
          <div className="btc-integration-block">
            <h3>Integração Bitcoin (BTC)</h3>
            {establishmentProfile.btcAddress ? (
              <div>
                <p><strong>Endereço Bitcoin:</strong> <span style={{ wordBreak: 'break-all' }}>{establishmentProfile.btcAddress}</span></p>
                <p><strong>Saldo Bitcoin:</strong> {btcBalanceLoading ? 'Carregando...' : btcBalance}</p>
                {btcBalanceMessage && <p className="message-error">{btcBalanceMessage}</p>}
                <small style={{ color: '#666' }}>* Saldo BTC é lido da rede Bitcoin via ICP. Em Regtest, você precisa minerar blocos para receber BTC.</small>
              </div>
            ) : (
              <div>
                <p>Para aceitar pagamentos em Bitcoin, gere um endereço BTC para o seu estabelecimento.</p>
                <button
                  onClick={handleGenerateBtcAddress}
                  disabled={btcAddressLoading}
                  style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ff9900', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {btcAddressLoading ? 'Gerando...' : 'Gerar Endereço Bitcoin'}
                </button>
                {btcAddressMessage && <p className={btcAddressMessage.startsWith('Falha') ? 'message-error' : 'message-success'}>{btcAddressMessage}</p>}
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>* Isso criará um endereço Bitcoin para este estabelecimento no canister.</small>
              </div>
            )}
          </div>


          <h3>Gerar QR Code de Pagamento (ICP)</h3>
          <form onSubmit={handlePaymentSubmit} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <p>Preencha os detalhes do pagamento e clique em "Gerar QR Code" para o trabalhador escanear e confirmar.</p>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="workerPrincipal" style={{ display: 'block', marginBottom: '0.5rem' }}>Principal do Trabalhador (para referência no QR Code):</label>
              <input
                type="text"
                id="workerPrincipal"
                value={workerPrincipalInput}
                onChange={(e) => setWorkerPrincipalInput(e.target.value)}
                placeholder="Obrigatório para processar o pagamento"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="paymentAmount" style={{ display: 'block', marginBottom: '0.5rem' }}>Quantia:</label>
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
              <label htmlFor="paymentCurrency" style={{ display: 'block', marginBottom: '0.5rem' }}>Moeda de Pagamento:</label>
              <select
                id="paymentCurrency"
                value={paymentCurrency}
                onChange={(e) => setPaymentCurrency(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="ICP">ICP (Benefício)</option>
                <option value="BTC">Bitcoin (BTC) - Futuro</option>
              </select>
            </div>
            {paymentCurrency === 'BTC' && (
                <p className="message-warning" style={{ fontSize: '0.9em', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    A integração direta com Bitcoin (BTC) é possível através do ICP como funcionalidade futura para pagamentos! (O débito real não está implementado neste MVP)
                </p>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="benefitType" style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Benefício (apenas para ICP):</label>
              <select
                id="benefitType"
                value={benefitType}
                onChange={(e) => setBenefitType(e.target.value)}
                disabled={paymentCurrency === 'BTC'}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: paymentCurrency === 'BTC' ? '#f0f0f0' : 'white' }}
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
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <button
              type="submit"
              disabled={paymentLoading || showQrCode}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {paymentLoading ? 'Gerando QR Code...' : 'Gerar QR Code de Pagamento'}
            </button>
            {paymentMessage && <p className={paymentMessage.startsWith('Falha') ? 'message-error' : 'message-success'}>{paymentMessage}</p>}

            {/* Exibição do QR Code */}
            {showQrCode && qrCodeData && (
              <div style={{ marginTop: '20px', textAlign: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                <h4>QR Code para Pagamento</h4>
                <QRCode value={qrCodeData} size={256} />
                <p style={{ wordBreak: 'break-all', fontSize: '0.8em', marginTop: '10px' }}>
                  **Conteúdo do QR Code:** `{qrCodeData}`
                  <button 
                    onClick={() => navigator.clipboard.writeText(qrCodeData)}
                    style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '0.7em', backgroundColor: '#6c757d', color: 'white' }}
                  >
                    Copiar
                  </button>
                </p>
                <p style={{ color: '#007bff' }}>Peça ao trabalhador para colar o conteúdo do QR Code em seu aplicativo para confirmar o pagamento.</p>
              </div>
            )}
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
        // Se o perfil do estabelecimento NÃO EXISTE (formulário de registro)
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
                readOnly
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipos de Benefício Aceitos:</label>
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
            {registerMessage && <p className={registerMessage.startsWith('Falha') ? 'message-error' : 'message-success'}>{registerMessage}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default EstablishmentDashboard;