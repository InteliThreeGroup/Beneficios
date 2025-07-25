// src/BENEFICIOS_frontend/src/components/WalletScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthClientContext';
import { Principal } from '@dfinity/principal';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBookOpen, faHeartbeat, faBus, faGraduationCap, faShoppingBag, faCoins, faQrcode, faStickyNote } from '@fortawesome/free-solid-svg-icons';


const WalletScreen = () => {
  const { actors, principal, profile } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para Processamento de Pagamento via QR Code (mantidos)
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrPaymentLoading, setQrPaymentLoading] = useState(false);
  const [qrPaymentMessage, setQrPaymentMessage] = useState('');

  // NOVOS ESTADOS para o leitor de QR Code
  const [showQrScanner, setShowQrScanner] = useState(false); // Controla a visibilidade do scanner
  const [scanError, setScanError] = useState(''); // Mensagens de erro do scanner

  // State to control payment confirmation modal visibility (NEW)
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const getBenefitIcon = (type) => {
    switch (type) {
      case 'Food': return faUtensils;
      case 'Culture': return faBookOpen;
      case 'Health': return faHeartbeat;
      case 'Transport': return faBus;
      case 'Education': return faGraduationCap;
      default: return faShoppingBag; // Default icon
    }
  };


  const fetchData = useCallback(async () => {
    if (!actors || !actors.wallets || !actors.benefits_manager || !principal) {
        setLoading(false);
        return;
    }
    setLoading(true);
    setError('');
    try {
        // Fetch Wallet
        const walletResult = await actors.wallets.getWallet(principal);
        if (walletResult.ok) {
            setWallet(walletResult.ok);
        } else {
            setError(`Erro ao buscar carteira: ${walletResult.err}`);
        }

        // Fetch Benefits
        const benefitsResult = await actors.benefits_manager.getWorkerBenefits(principal);
        setBenefits(benefitsResult);

        // Fetch Transaction History
        const txHistoryResult = await actors.wallets.getTransactionHistory(principal, [BigInt(10)]);
        setTransactions(txHistoryResult);

    } catch (err) {
      console.error("Erro ao buscar dados do trabalhador:", err);
      setError("Falha ao carregar dados da carteira ou benefícios.");
    } finally {
      setLoading(false);
    }
  }, [actors, principal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmPayment = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (!parsedData.establishmentId || typeof parsedData.amount !== 'number' || !parsedData.benefitType || !parsedData.description) {
        setQrPaymentMessage("Erro: Dados do QR Code inválidos ou incompletos para confirmação.");
        return;
      }
      setPaymentDetails({
        amount: parsedData.amount,
        establishment: parsedData.description, // Using description as establishment name for display
        date: new Date().toLocaleString(), // Current date/time
        rawData: data // Keep raw data to process on final confirmation
      });
      setShowPaymentConfirmation(true);
      setShowQrScanner(false); // Hide scanner if confirmation modal is shown
    } catch (err) {
      setQrPaymentMessage("Erro ao analisar dados do QR Code para confirmação.");
      console.error("Parse error for confirmation:", err);
    }
  };


  // Handler para Processar Pagamento via QR Code (agora chamado por `onScan` ou `handleProcessQrInput`)
  const processPaymentFromData = async (data) => {
    setQrPaymentLoading(true);
    setQrPaymentMessage('');
    setShowPaymentConfirmation(false); // Close confirmation modal

    if (!actors || !actors.wallets) {
      setQrPaymentMessage("Erro: Ator do canister de carteira não carregado.");
      setQrPaymentLoading(false);
      return;
    }

    try {
      const parsedData = JSON.parse(data);

      if (!parsedData.establishmentId || typeof parsedData.amount !== 'number' || !parsedData.benefitType || !parsedData.description) {
        setQrPaymentMessage("Erro: Dados do QR Code inválidos ou incompletos.");
        setQrPaymentLoading(false);
        return;
      }

      let establishmentPrincipal;
      try {
        establishmentPrincipal = Principal.fromText(parsedData.establishmentId);
      } catch (err) {
        setQrPaymentMessage("Erro: Principal do estabelecimento no QR Code inválido.");
        setQrPaymentLoading(false);
        return;
      }

      let selectedBenefitType;
      if (parsedData.benefitType === 'Food') selectedBenefitType = { Food: null };
      else if (parsedData.benefitType === 'Culture') selectedBenefitType = { Culture: null };
      else if (parsedData.benefitType === 'Health') selectedBenefitType = { Health: null };
      else if (parsedData.benefitType === 'Transport') selectedBenefitType = { Transport: null };
      else if (parsedData.benefitType === 'Education') selectedBenefitType = { Education: null };
      else {
        setQrPaymentMessage("Erro: Tipo de benefício no QR Code inválido.");
        setQrPaymentLoading(false);
        return;
      }

      const amountInNats = BigInt(Math.floor(parsedData.amount * 10000));

      const walletDebitRequest = {
        workerId: principal,
        establishmentId: establishmentPrincipal,
        establishmentName: parsedData.description,
        benefitType: selectedBenefitType,
        amount: amountInNats,
        description: parsedData.description,
      };
      const debitResult = await actors.wallets.debitBalance(walletDebitRequest);

      if (debitResult.ok) {
        setQrPaymentMessage(`Pagamento de ${formatAmount(amountInNats)} ICP para ${parsedData.description} processado com sucesso!`);
        setQrCodeInput(''); // Limpa o input do QR code (se usado)
        await fetchData();
      } else {
        setQrPaymentMessage(`Falha no pagamento: ${debitResult.err}`);
      }

    } catch (err) {
      console.error("Erro ao processar pagamento do QR Code:", err);
      setQrPaymentMessage(`Erro inesperado ao processar pagamento do QR Code: ${err.message}`);
    } finally {
      setQrPaymentLoading(false);
    }
  };


  // Handler para o campo de input de QR Code (o "colar")
  const handleProcessQrInput = async (e) => {
    e.preventDefault();
    handleConfirmPayment(qrCodeInput); // Show confirmation first
  };

  // Handler para o scanner de QR Code (quando ele lê um código)
  const handleScan = (result, error) => {
    if (result) {
      setQrCodeInput(result.text); // Preenche o input com o que foi lido
      handleConfirmPayment(result.text); // Show confirmation and then process
      setScanError(''); // Limpa qualquer erro de scan anterior
    }
    if (error) {
      // console.error("Erro no scan:", error); // Debugging
      // Ignorar erros comuns como "NotFound" se nenhum QR code estiver à vista
      if (error.name !== "NotFoundException" && error.name !== "NotAllowedError") {
         setScanError(`Erro ao escanear: ${error.name}`);
      }
    }
  };

  // Funções utilitárias para formatação (sem mudanças)
  const formatBenefitType = (type) => {
    if (typeof type === 'object' && type !== null) {
      return Object.keys(type)[0];
    }
    return 'Unknown';
  };

  const formatTransactionType = (type) => {
    if (typeof type === 'object' && type !== null) {
      return Object.keys(type)[0];
    }
    return 'Unknown';
  };

  const formatAmount = (amount) => {
    // Ensure amount is BigInt before division for consistency
    const numAmount = typeof amount === 'bigint' ? Number(amount) : Number(amount);
    return (numAmount / 10000).toFixed(2);
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp === null) return 'N/A';
    // Convert nanoseconds to milliseconds
    return new Date(Number(timestamp) / 1_000_000).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    transactions.forEach(tx => {
      const date = new Date(Number(tx.timestamp) / 1_000_000).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(tx);
    });
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  if (loading) return <p>Carregando dados da carteira...</p>;
  if (error) return <p className="message-error">{error}</p>;

  return (
    <main>
      <div className="profile-header" style={{ marginBottom: '1rem', boxShadow: 'none', background: 'none', padding: '0 0 15px 0' }}>
        <div className="profile-avatar" style={{ border: 'none', width: 'auto', height: 'auto' }}>
            {/* Removed avatar here as per image, keeping just heading */}
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
            <h2>Benefícios</h2>
            <p>Meus Saldos</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <div className="card-icon" style={{ backgroundColor: '#e0f2f7', color: '#007bff', width: '36px', height: '36px', fontSize: '1.2rem' }}>
              <FontAwesomeIcon icon={faStickyNote} /> {/* Example icon */}
            </div>
            <div className="profile-avatar" style={{ width: '36px', height: '36px', border: 'none' }}>
              <img src="https://via.placeholder.com/150/007bff/ffffff?text=U" alt="User" />
            </div>
          </div>
      </div>

      <h3>Meus Saldos</h3>
      {wallet?.balances && wallet.balances.length > 0 ? (
        <ul style={{ padding: '0', listStyle: 'none' }}>
          {wallet.balances.map(b => (
            <li key={formatBenefitType(b.benefitType)} className="balance-card">
              <div className="balance-card-left">
                <div className="balance-card-icon">
                  <FontAwesomeIcon icon={getBenefitIcon(formatBenefitType(b.benefitType))} />
                </div>
                <span className="balance-card-type">{formatBenefitType(b.benefitType)}</span>
              </div>
              <span className="balance-card-amount">
                $ {formatAmount(b.balance)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum saldo de benefício encontrado.</p>
      )}
      <p className="total-balance">
        <strong>Saldo Total: $ {wallet ? formatAmount(wallet.totalBalance) : '0.00'}</strong>
      </p>

      {/* Seus Programas de Benefício - Kept for functionality, but not directly in screenshot design */}
      <h3 style={{ marginTop: '2rem' }}>Seus Programas de Benefício</h3>
      {benefits.length > 0 ? (
        <ul>
          {benefits.map(program => (
            <li key={program.id} className="card">
              <div className="card-content">
                <div className="card-title">{program.name} ({formatBenefitType(program.benefitType)})</div>
                <div className="card-value">{formatAmount(program.amountPerWorker)} ICP</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não está associado a nenhum programa de benefício.</p>
      )}

      {/* BLOCO: Opções de Pagamento com QR Code */}
      <hr style={{ margin: '2rem 0' }} />
      <div className="card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', border: '1px solid #3498db', backgroundColor: '#e8f4fb', marginBottom: '2rem' }}>
        <h3>Pagar com QR Code</h3>
        <p style={{ marginBottom: '1rem', color: '#555' }}>Escolha como deseja realizar o pagamento:</p>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', width: '100%' }}>
            <button
                onClick={() => { setShowQrScanner(true); setQrCodeInput(''); setQrPaymentMessage(''); setScanError(''); setShowPaymentConfirmation(false); }}
                disabled={showQrScanner}
                className="primary" style={{ flex: 1, backgroundColor: '#2ecc71' }}
            >
                <FontAwesomeIcon icon={faQrcode} /> {showQrScanner ? 'Scanner Ativo' : 'Escanear QR Code'}
            </button>
            <button
                onClick={() => { setShowQrScanner(false); setQrPaymentMessage(''); setScanError(''); setShowPaymentConfirmation(false); }}
                disabled={!showQrScanner && qrCodeInput === ''}
                className="secondary" style={{ flex: 1, backgroundColor: '#f39c12', color: 'white' }}
            >
                Colar Conteúdo do QR Code
            </button>
        </div>

        {scanError && <p className="message-error">{scanError}</p>}
        {qrPaymentMessage && <p className={qrPaymentMessage.startsWith('Falha') ? 'message-error' : 'message-success'}>{qrPaymentMessage}</p>}

        {showQrScanner ? (
          // Componente do Scanner de QR Code
          <div className="qr-scanner-frame" style={{ marginTop: '20px', maxWidth: '300px', height: '300px' }}>
            <p style={{ textAlign: 'center', margin: '10px 0', fontSize: '0.9em', color: '#555' }}>
              Aponte a câmera para o QR Code do estabelecimento.
            </p>
            <QrReader
              onResult={handleScan}
              videoStyle={{ width: '100%', height: '100%' }}
              constraints={{ facingMode: 'environment' }}
              scanDelay={500}
            />
             <button
                onClick={() => setShowQrScanner(false)}
                className="danger" style={{ width: '100%', borderRadius: '0 0 8px 8px' }}
            >
                Parar Scanner
            </button>
          </div>
        ) : (
          // Formulário para Colar o Conteúdo do QR Code
          <form onSubmit={handleProcessQrInput} style={{ width: '100%', padding: '0', background: 'none' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="qrCodeInput">Cole o Conteúdo do QR Code aqui:</label>
              <input
                type="text"
                id="qrCodeInput"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                required
                placeholder="Ex: {'establishmentId':'<principal>','amount':25.0,'benefitType':'Food','description':'Compra'}"
              />
            </div>
            <button
              type="submit"
              disabled={qrPaymentLoading}
              className="primary" style={{ backgroundColor: '#3498db' }}
            >
              {qrPaymentLoading ? 'Processando...' : 'Confirmar Pagamento do QR Code'}
            </button>
          </form>
        )}
      </div>

      {/* Histórico de Transações */}
      <div className="extract-section">
        <h3>Histórico de Transações <a href="#">Veja Mais</a></h3>
        {Object.keys(groupedTransactions).length > 0 ? (
          <div>
            {Object.entries(groupedTransactions).map(([date, dailyTransactions]) => (
              <div key={date}>
                <p className="transaction-group-day">{date}</p>
                <ul>
                  {dailyTransactions.map(tx => (
                    <li key={tx.id} className="transaction-item">
                      <div className="transaction-details">
                        <div className="transaction-establishment">{tx.description}</div>
                        <div className="transaction-type">{formatBenefitType(tx.benefitType)}</div>
                      </div>
                      <div className="transaction-amount-time">
                        <div className="transaction-amount" style={{ color: formatTransactionType(tx.transactionType) === 'Credit' ? 'green' : 'red' }}>
                          {formatTransactionType(tx.transactionType) === 'Credit' ? '+' : '-'} $ {formatAmount(tx.amount)}
                        </div>
                        <div className="transaction-time">{new Date(Number(tx.timestamp) / 1_000_000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma transação encontrada.</p>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && paymentDetails && (
        <div className="payment-confirmation-modal">
          <div className="modal-header">
            <h3>Confirmar Pagamento</h3>
          </div>
          <div className="modal-content">
            <div className="modal-content-row">
              <span className="modal-label">Valor</span>
              <span className="modal-value">$ {formatAmount(paymentDetails.amount * 10000)}</span> {/* Multiply by 10000 to convert back to Nats for formatting */}
            </div>
            <div className="modal-content-row">
              <span className="modal-label">Estabelecimento</span>
              <span className="modal-value">{paymentDetails.establishment}</span>
            </div>
            <div className="modal-content-row">
              <span className="modal-label">Data</span>
              <span className="modal-value">{paymentDetails.date}</span>
            </div>
          </div>
          <div className="modal-button-container">
            <button
              onClick={() => processPaymentFromData(paymentDetails.rawData)}
              disabled={qrPaymentLoading}
              className="primary"
            >
              {qrPaymentLoading ? 'Processando...' : 'Pagar'}
            </button>
            <button
              onClick={() => { setShowPaymentConfirmation(false); setQrPaymentMessage(''); setQrPaymentLoading(false); }}
              className="secondary"
              style={{marginTop: '10px'}}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default WalletScreen;