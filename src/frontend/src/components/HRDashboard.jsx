// src/frontend/src/components/HRDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthClientContext';
import { Principal } from '@dfinity/principal';

const HRDashboard = () => {
  const { actors, principal, profile } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o formulário de CRIAÇÃO de programa de benefício
  const [programName, setProgramName] = useState('');
  const [programBenefitType, setProgramBenefitType] = useState('Food'); // Default
  const [programAmountPerWorker, setProgramAmountPerWorker] = useState('');
  const [programFrequency, setProgramFrequency] = useState('Monthly'); // Default
  const [programPaymentDay, setProgramPaymentDay] = useState('');
  const [createProgramLoading, setCreateProgramLoading] = useState(false);
  const [createProgramMessage, setCreateProgramMessage] = useState('');

  // NOVOS ESTADOS para o formulário de ATRIBUIÇÃO de trabalhador
   const [assignWorkerPrincipal, setAssignWorkerPrincipal] = useState('');
  const [assignProgramId, setAssignProgramId] = useState(''); // ID do programa a ser atribuído
  const [assignCustomAmount, setAssignCustomAmount] = useState(''); // Opcional
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');

  // Função para buscar os programas de benefício da empresa
  const fetchPrograms = async () => {
    // Certifique-se de que actors está carregado e profile.companyId é um array com pelo menos um elemento
    if (!actors || !actors.benefits_manager || !profile || !profile.companyId || profile.companyId.length === 0) {
      setLoading(false); 
      return;
    }
    setLoading(true);
    setError('');
    try {
      const companyIdValue = profile.companyId[0]; // Pega o primeiro ID da empresa
      const result = await actors.benefits_manager.getCompanyBenefitPrograms(companyIdValue);
      setPrograms(result);
    } catch (err) {
      console.error("Erro ao buscar programas:", err);
      setError("Falha ao carregar programas de benefício.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [actors, profile]); // Dependências para re-executar quando atores ou profile mudarem

  
  // Handler para o formulário de CRIAÇÃO de programa de benefício
  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setCreateProgramLoading(true);
    setCreateProgramMessage('');

    if (!actors || !actors.benefits_manager || !profile || !profile.companyId || profile.companyId.length === 0) {
      setCreateProgramMessage("Erro: Atores ou informações da empresa não carregados.");
      setCreateProgramLoading(false);
      return;
    }

    try {
      // Converte strings para os tipos de variante Motoko
      let selectedBenefitType;
      if (programBenefitType === 'Food') selectedBenefitType = { Food: null };
      else if (programBenefitType === 'Culture') selectedBenefitType = { Culture: null };
      else if (programBenefitType === 'Health') selectedBenefitType = { Health: null };
      else if (programBenefitType === 'Transport') selectedBenefitType = { Transport: null };
      else if (programBenefitType === 'Education') selectedBenefitType = { Education: null };
      else {
        setCreateProgramMessage("Erro: Tipo de benefício inválido.");
        setCreateProgramLoading(false);
        return;
      }

      let selectedFrequency;
      if (programFrequency === 'Monthly') selectedFrequency = { Monthly: null };
      else if (programFrequency === 'Weekly') selectedFrequency = { Weekly: null };
      else if (programFrequency === 'Biweekly') selectedFrequency = { Biweekly: null };
      else {
        setCreateProgramMessage("Erro: Frequência de pagamento inválida.");
        setCreateProgramLoading(false);
        return;
      }

      // Converte o valor do benefício para Nat (BigInt)
      const amountPerWorkerInNats = BigInt(Math.floor(parseFloat(programAmountPerWorker) * 10000));
      const paymentDayNat = BigInt(parseInt(programPaymentDay, 10));

      const companyIdValue = profile.companyId[0];

      const result = await actors.benefits_manager.createBenefitProgram(
        programName,
        selectedBenefitType,
        companyIdValue,
        amountPerWorkerInNats,
        selectedFrequency,
        paymentDayNat
      );

      if (result.ok) {
        setCreateProgramMessage("Programa de benefício criado com sucesso!");
        // Limpa o formulário
        setProgramName('');
        setProgramAmountPerWorker('');
        setProgramPaymentDay('');
        await fetchPrograms(); // Recarrega a lista de programas
      } else {
        setCreateProgramMessage(`Falha ao criar programa: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao criar programa:", err);
      setCreateProgramMessage(`Erro inesperado ao criar programa: ${err.message}`);
    } finally {
      setCreateProgramLoading(false);
    }
  };

  // NOVO HANDLER para o formulário de ATRIBUIÇÃO de trabalhador
   const handleAssignWorker = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    setAssignMessage('');

    if (!actors || !actors.benefits_manager) {
      setAssignMessage("Erro: Atores do canister não carregados.");
      setAssignLoading(false);
      return;
    }

    try {
      let workerPrincipal;
      try {
        workerPrincipal = Principal.fromText(assignWorkerPrincipal);
      } catch (err) {
        setAssignMessage("Erro: Principal do trabalhador inválido.");
        setAssignLoading(false);
        return;
      }

      // customAmount é um ?Nat no Motoko, que é representado como [BigInt] ou null/[]
      // --- CORREÇÃO AQUI para customAmount ---
      let customAmountOption; // Não inicialize com null
      if (assignCustomAmount.trim() !== '') {
        // Se o campo não estiver vazio, converte para BigInt e empacota em um array
        customAmountOption = [BigInt(Math.floor(parseFloat(assignCustomAmount) * 10000))];
      } else {
        // Se o campo estiver vazio (representando None), use um array vazio
        customAmountOption = []; // <-- MUDANÇA IMPORTANTE AQUI!
      }
      // --- FIM DA CORREÇÃO ---
      
      const result = await actors.benefits_manager.assignWorkerToBenefit(
        workerPrincipal,
        assignProgramId,
        customAmountOption // Usa a variável corrigida
      );

      if (result.ok) {
        setAssignMessage("Trabalhador atribuído com sucesso ao programa!");
        // Limpa o formulário
        setAssignWorkerPrincipal('');
        setAssignProgramId('');
        setAssignCustomAmount('');
      } else {
        setAssignMessage(`Falha ao atribuir trabalhador: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao atribuir trabalhador:", err);
      setAssignMessage(`Erro inesperado ao atribuir trabalhador: ${err.message}`);
    } finally {
      setAssignLoading(false);
    }
  };

  // Funções utilitárias para formatação
  const formatBenefitType = (type) => {
    if (typeof type === 'object' && type !== null) {
      return Object.keys(type)[0];
    }
    return 'Unknown';
  };

  const formatAmount = (amount) => {
    return (Number(amount) / 10000).toFixed(2);
  };

  const formatFrequency = (freq) => {
    if (typeof freq === 'object' && freq !== null) {
      return Object.keys(freq)[0];
    }
    return 'Unknown';
  };


  if (loading) return <p>Carregando programas do RH...</p>;

  return (
    <div>
      <h2>Painel do RH - Bem-vindo(a), {profile?.name}!</h2>
      <p>Gerenciando benefícios para a empresa: {profile?.companyId?.[0] || 'N/A'}</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe o erro se houver */}

      <h3>Criar Novo Programa de Benefício</h3>
      <form onSubmit={handleCreateProgram} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="programName" style={{ display: 'block', marginBottom: '0.5rem' }}>Nome do Programa:</label>
          <input
            type="text"
            id="programName"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="programBenefitType" style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Benefício:</label>
          <select
            id="programBenefitType"
            value={programBenefitType}
            onChange={(e) => setProgramBenefitType(e.target.value)}
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
          <label htmlFor="programAmountPerWorker" style={{ display: 'block', marginBottom: '0.5rem' }}>Valor por Trabalhador (ICP):</label>
          <input
            type="number"
            id="programAmountPerWorker"
            value={programAmountPerWorker}
            onChange={(e) => setProgramAmountPerWorker(e.target.value)}
            step="0.01"
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="programFrequency" style={{ display: 'block', marginBottom: '0.5rem' }}>Frequência de Pagamento:</label>
          <select
            id="programFrequency"
            value={programFrequency}
            onChange={(e) => setProgramFrequency(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="Monthly">Mensal</option>
            <option value="Weekly">Semanal</option>
            <option value="Biweekly">Quinzenal</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="programPaymentDay" style={{ display: 'block', marginBottom: '0.5rem' }}>Dia do Pagamento (1-31):</label>
          <input
            type="number"
            id="programPaymentDay"
            value={programPaymentDay}
            onChange={(e) => setProgramPaymentDay(e.target.value)}
            min="1"
            max="31"
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button
          type="submit"
          disabled={createProgramLoading}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {createProgramLoading ? 'Criando...' : 'Criar Programa'}
        </button>
        {createProgramMessage && <p style={{ marginTop: '1rem', color: createProgramMessage.startsWith('Falha') ? 'red' : 'green' }}>{createProgramMessage}</p>}
      </form>

      <h3>Programas de Benefício Existentes</h3>
      {programs.length === 0 ? (
        <p>Nenhum programa de benefício encontrado para esta empresa. Crie um novo acima.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Valor/Trab.</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Frequência</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Dia Pag.</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Ativo</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Criado Em</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(program => (
              <tr key={program.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{program.id}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{program.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatBenefitType(program.benefitType)}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatAmount(program.amountPerWorker)} ICP</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatFrequency(program.frequency)}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{program.paymentDay.toString()}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{program.isActive ? 'Sim' : 'Não'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(Number(program.createdAt) / 1_000_000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr style={{ margin: '2rem 0' }} />

      {/* NOVO FORMULÁRIO: ATRIBUIR TRABALHADOR A UM PROGRAMA */}
      <h3>Atribuir Trabalhador a um Programa</h3>
      <form onSubmit={handleAssignWorker} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="assignWorkerPrincipal" style={{ display: 'block', marginBottom: '0.5rem' }}>Principal do Trabalhador:</label>
          <input
            type="text"
            id="assignWorkerPrincipal"
            value={assignWorkerPrincipal}
            onChange={(e) => setAssignWorkerPrincipal(e.target.value)}
            required
            placeholder="Ex: <principal-do-trabalhador>"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="assignProgramId" style={{ display: 'block', marginBottom: '0.5rem' }}>ID do Programa de Benefício:</label>
          {programs.length > 0 ? (
            <select
              id="assignProgramId"
              value={assignProgramId}
              onChange={(e) => setAssignProgramId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Selecione um programa</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>{program.name} ({program.id})</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="assignProgramId"
              value={assignProgramId}
              onChange={(e) => setAssignProgramId(e.target.value)}
              required
              placeholder="Digite o ID do programa (ex: program_1)"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          )}
          {programs.length === 0 && <small style={{ color: '#666' }}>Crie um programa primeiro para vê-lo na lista.</small>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="assignCustomAmount" style={{ display: 'block', marginBottom: '0.5rem' }}>Valor Personalizado (ICP - Opcional):</label>
          <input
            type="number"
            id="assignCustomAmount"
            value={assignCustomAmount}
            onChange={(e) => setAssignCustomAmount(e.target.value)}
            step="0.01"
            placeholder="Deixe em branco para usar o valor do programa"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button
          type="submit"
          disabled={assignLoading}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {assignLoading ? 'Atribuindo...' : 'Atribuir Trabalhador'}
        </button>
        {assignMessage && <p style={{ marginTop: '1rem', color: assignMessage.startsWith('Falha') ? 'red' : 'green' }}>{assignMessage}</p>}
      </form>

      <p>Funcionalidades futuras: Executar pagamentos manuais, ver relatórios.</p>
    </div>
  );
};

export default HRDashboard;