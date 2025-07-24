// src/components/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthClientContext';

const WorkerDashboard = () => {
  const { actors, principal, profile } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!actors || !principal) return;
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
        setBenefits(benefitsResult); // Este retorna um array direto

        // Fetch Transaction History
        const txHistoryResult = await actors.wallets.getTransactionHistory(principal, [10]); // Limit to 10
        setTransactions(txHistoryResult); // Este retorna um array direto
        
      } catch (err) {
        console.error("Erro ao buscar dados do trabalhador:", err);
        setError("Falha ao carregar dados da carteira ou benefícios.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [actors, principal]);

  const formatBenefitType = (type) => Object.keys(type)[0];
  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2); // Convert Nat to a readable decimal

  if (loading) return <p>Carregando dados da carteira...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Minha Carteira - Bem-vindo(a), {profile?.name}!</h2>
      <p>ID da Empresa: {profile?.companyId?.[0] || 'N/A'}</p>
      
      <h3>Saldos de Benefício</h3>
      {wallet?.balances && wallet.balances.length > 0 ? (
        <ul>
          {wallet.balances.map(b => (
            <li key={formatBenefitType(b.benefitType)}>
              {formatBenefitType(b.benefitType)}: {formatAmount(b.balance)} ICP
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum saldo de benefício encontrado.</p>
      )}
      <p><strong>Saldo Total: {wallet ? formatAmount(wallet.totalBalance) : '0.00'} ICP</strong></p>

      <h3>Seus Programas de Benefício</h3>
      {benefits.length > 0 ? (
        <ul>
          {benefits.map(program => (
            <li key={program.id}>
              {program.name} ({formatBenefitType(program.benefitType)}) - {formatAmount(program.amountPerWorker)} ICP
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não está associado a nenhum programa de benefício.</p>
      )}

      <h3>Histórico de Transações</h3>
      {transactions.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Quantia</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Descrição</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.id}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{Object.keys(tx.transactionType)[0]} - {formatBenefitType(tx.benefitType)}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', color: Object.keys(tx.transactionType)[0] === 'Credit' ? 'green' : 'red' }}>
                  {Object.keys(tx.transactionType)[0] === 'Credit' ? '+' : '-'} {formatAmount(tx.amount)} ICP
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.description}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(Number(tx.timestamp) / 1_000_000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhuma transação encontrada.</p>
      )}
    </div>
  );
};

export default WorkerDashboard;