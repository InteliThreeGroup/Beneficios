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
  const [programBenefitType, setProgramBenefitType] = useState('Food');
  const [programAmountPerWorker, setProgramAmountPerWorker] = useState('');
  const [programFrequency, setProgramFrequency] = useState('Monthly');
  const [programPaymentDay, setProgramPaymentDay] = useState('');
  const [createProgramLoading, setCreateProgramLoading] = useState(false);
  const [createProgramMessage, setCreateProgramMessage] = useState('');

  // Estados para o formulário de ATRIBUIÇÃO de trabalhador
  const [assignWorkerPrincipal, setAssignWorkerPrincipal] = useState('');
  const [assignProgramId, setAssignProgramId] = useState('');
  const [assignCustomAmount, setAssignCustomAmount] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');

  // Estados para o pagamento manual
  const [manualProgramId, setManualProgramId] = useState('');
  const [manualPaymentLoading, setManualPaymentLoading] = useState(false);
  const [manualPaymentMessage, setManualPaymentMessage] = useState('');

  // Estados para a consulta de histórico individual (via reporting canister)
  const [queryPrincipal, setQueryPrincipal] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryMessage, setQueryMessage] = useState('');
  const [queryType, setQueryType] = useState('worker'); // 'worker' ou 'establishment'

  // Estados para Alterar Valor de Benefício
  const [updateWorkerPrincipal, setUpdateWorkerPrincipal] = useState('');
  const [updateProgramId, setUpdateProgramId] = useState('');
  const [newBenefitAmount, setNewBenefitAmount] = useState('');
  const [updateBenefitLoading, setUpdateBenefitLoading] = useState(false);
  const [updateBenefitMessage, setUpdateBenefitMessage] = useState('');

  // NOVOS ESTADOS para Gestão de Fundos
  const [availableFunds, setAvailableFunds] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState('');


  // Função para buscar os programas de benefício da empresa
  const fetchProgramsAndFunds = async () => {
    if (!actors || !actors.benefits_manager || !profile || !profile.companyId || profile.companyId.length === 0) {
      setLoading(false); 
      return;
    }
    setLoading(true);
    setError('');
    try {
      const companyIdValue = profile.companyId[0];
      const programsResult = await actors.benefits_manager.getCompanyBenefitPrograms(companyIdValue);
      setPrograms(programsResult);
      if (programsResult.length > 0) {
        setAssignProgramId(programsResult[0].id);
        setManualProgramId(programsResult[0].id);
        setUpdateProgramId(programsResult[0].id);
      } else {
        setAssignProgramId('');
        setManualProgramId('');
        setUpdateProgramId('');
      }

      // NOVO: Busca fundos disponíveis
      const fundsResult = await actors.benefits_manager.getAvailableFunds();
      setAvailableFunds(Number(fundsResult)); // Converte BigInt para Number para exibição

    } catch (err) {
      console.error("Erro ao buscar programas ou fundos:", err);
      setError("Falha ao carregar programas ou fundos de benefício.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramsAndFunds(); // Chama a nova função combinada
  }, [actors, profile]);

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
        setProgramName('');
        setProgramAmountPerWorker('');
        setProgramPaymentDay('');
        await fetchProgramsAndFunds(); // Recarrega programas e fundos
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

  // Handler para o formulário de ATRIBUIÇÃO de trabalhador
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

      let customAmountOption;
      if (assignCustomAmount.trim() !== '') {
        customAmountOption = [BigInt(Math.floor(parseFloat(assignCustomAmount) * 10000))];
      } else {
        customAmountOption = [];
      }
      
      const result = await actors.benefits_manager.assignWorkerToBenefit(
        workerPrincipal,
        assignProgramId,
        customAmountOption
      );

      if (result.ok) {
        setAssignMessage("Trabalhador atribuído com sucesso ao programa!");
        setAssignWorkerPrincipal('');
        setAssignProgramId(programs.length > 0 ? programs[0].id : '');
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

  // Handler para EXECUTAR PAGAMENTO MANUAL
  const handleExecuteManualPayment = async (e) => {
    e.preventDefault();
    setManualPaymentLoading(true);
    setManualPaymentMessage('');

    if (!actors || !actors.benefits_manager || !manualProgramId) {
      setManualPaymentMessage("Erro: Selecione um programa e verifique os atores.");
      setManualPaymentLoading(false);
      return;
    }

    try {
      const result = await actors.benefits_manager.executeManualPayment(manualProgramId);

      if (result.ok) {
        setManualPaymentMessage(`Pagamento manual do programa '${manualProgramId}' executado com sucesso!`);
        await fetchProgramsAndFunds(); // Atualiza os fundos disponíveis
      } else {
        setManualPaymentMessage(`Falha ao executar pagamento manual: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao executar pagamento manual:", err);
      setManualPaymentMessage(`Erro inesperado ao executar pagamento manual: ${err.message}`);
    } finally {
      setManualPaymentLoading(false);
    }
  };

  // Handler para CONSULTA de HISTÓRICO INDIVIDUAL (VIA REPORTING CANISTER)
  const handleQueryHistory = async (e) => {
    e.preventDefault();
    setQueryLoading(true);
    setQueryMessage('');
    setQueryHistory([]);

    if (!actors || !actors.reporting) { // Agora chamamos o reporting canister
      setQueryMessage("Erro: Ator do canister de relatórios não carregado.");
      setQueryLoading(false);
      return;
    }

    try {
      let targetPrincipal;
      try {
        targetPrincipal = Principal.fromText(queryPrincipal);
      } catch (err) {
        setQueryMessage("Erro: Principal inválido.");
        setQueryLoading(false);
        return;
      }

      let result;
      if (queryType === 'worker') {
        const response = await actors.reporting.get_all_worker_transactions(targetPrincipal, [BigInt(50)]);
        if (response.ok) { 
          result = response.ok;
        } else {
          setQueryMessage(`Falha ao consultar histórico de trabalhador: ${response.err}`);
          setQueryLoading(false);
          return;
        }
      } else if (queryType === 'establishment') {
        const response = await actors.reporting.get_all_establishment_transactions(targetPrincipal, [BigInt(50)]);
        if (response.ok) { 
          result = response.ok;
        } else {
          setQueryMessage(`Falha ao consultar histórico de estabelecimento: ${response.err}`);
          setQueryLoading(false);
          return;
        }
      } else {
        setQueryMessage("Tipo de consulta inválido.");
        setQueryLoading(false);
        return;
      }
      
      setQueryHistory(result);
      if (result.length === 0) {
        setQueryMessage("Nenhum histórico encontrado para o Principal fornecido.");
      } else {
        setQueryMessage(`Histórico encontrado para ${targetPrincipal.toText()}.`);
      }

    } catch (err) {
      console.error("Erro ao consultar histórico:", err);
      setQueryMessage(`Erro inesperado ao consultar histórico: ${err.message}`);
    } finally {
      setQueryLoading(false);
    }
  };

  // NOVO HANDLER para ALTERAR VALOR DE BENEFÍCIO DO TRABALHADOR
  const handleUpdateBenefitAmount = async (e) => {
    e.preventDefault();
    setUpdateBenefitLoading(true);
    setUpdateBenefitMessage('');

    if (!actors || !actors.benefits_manager || !updateWorkerPrincipal || !updateProgramId || !newBenefitAmount) {
      setUpdateBenefitMessage("Erro: Preencha todos os campos.");
      setUpdateBenefitLoading(false);
      return;
    }

    try {
      let workerPrincipal;
      try {
        workerPrincipal = Principal.fromText(updateWorkerPrincipal);
      } catch (err) {
        setUpdateBenefitMessage("Erro: Principal do trabalhador inválido.");
        setUpdateBenefitLoading(false);
        return;
      }

      const amountInNats = BigInt(Math.floor(parseFloat(newBenefitAmount) * 10000));

      const result = await actors.benefits_manager.updateWorkerBenefitAmount(
        workerPrincipal,
        updateProgramId,
        amountInNats
      );

      if (result.ok) {
        setUpdateBenefitMessage("Valor do benefício atualizado com sucesso!");
        setUpdateWorkerPrincipal('');
        setNewBenefitAmount('');
        setUpdateProgramId(programs.length > 0 ? programs[0].id : '');
      } else {
        setUpdateBenefitMessage(`Falha ao atualizar valor: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao atualizar valor do benefício:", err);
      setUpdateBenefitMessage(`Erro inesperado ao atualizar valor: ${err.message}`);
    } finally {
      setUpdateBenefitLoading(false);
    }
  };

  // NOVO HANDLER para DEPOSITAR FUNDOS
  const handleDepositFunds = async (e) => {
    e.preventDefault();
    setDepositLoading(true);
    setDepositMessage('');

    if (!actors || !actors.benefits_manager || !depositAmount) {
      setDepositMessage("Erro: Preencha o valor do depósito.");
      setDepositLoading(false);
      return;
    }

    try {
      const amountInNats = BigInt(Math.floor(parseFloat(depositAmount) * 10000));
      const result = await actors.benefits_manager.depositFunds(amountInNats);

      if (result.ok) {
        setDepositMessage(`Depósito de ${formatAmount(amountInNats)} ICP realizado com sucesso! Novo saldo: ${formatAmount(result.ok)} ICP`);
        setDepositAmount('');
        await fetchProgramsAndFunds(); // Atualiza o saldo disponível
      } else {
        setDepositMessage(`Falha ao depositar fundos: ${result.err}`);
      }
    } catch (err) {
      console.error("Erro ao depositar fundos:", err);
      setDepositMessage(`Erro inesperado ao depositar fundos: ${err.message}`);
    } finally {
      setDepositLoading(false);
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

  const formatTransactionType = (type) => { // Para transações de carteira
    if (typeof type === 'object' && type !== null) {
      return Object.keys(type)[0];
    }
    return 'Unknown';
  };
  
  const formatPaymentStatus = (status) => { // Para transações de estabelecimento
    if (typeof status === 'object' && status !== null) {
      return Object.keys(status)[0];
    }
    return 'Unknown';
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp === null) return 'N/A';
    return new Date(Number(timestamp) / 1_000_000).toLocaleString();
  };


  if (loading) return <p>Carregando painel do RH...</p>;

  return (
    <div>
      <h2>Painel do RH - Bem-vindo(a), {profile?.name}!</h2>
      <p>Gerenciando benefícios para a empresa: {profile?.companyId?.[0] || 'N/A'}</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* NOVO BLOCO: GESTÃO DE FUNDOS */}
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '2rem' }}>
        <h3>Gestão de Fundos do Canister</h3>
        <p><strong>Saldo Disponível para Distribuição:</strong> {formatAmount(availableFunds)} ICP</p>
        <form onSubmit={handleDepositFunds} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="depositAmount" style={{ display: 'block', marginBottom: '0.5rem' }}>Valor a Depositar (ICP):</label>
            <input
              type="number"
              id="depositAmount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              step="0.01"
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <button
            type="submit"
            disabled={depositLoading}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {depositLoading ? 'Depositando...' : 'Depositar Fundos'}
          </button>
          {depositMessage && <p style={{ marginTop: '1rem', color: depositMessage.startsWith('Falha') ? 'red' : 'green' }}>{depositMessage}</p>}
        </form>
        <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
          * Este é um depósito simulado para o canister. Em uma aplicação real, você transferiria ICP ou um token para o Principal do canister.
        </small>
      </div>


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

      <hr style={{ margin: '2rem 0' }} />

      <h3>Executar Pagamento Manual de Benefício</h3>
      <form onSubmit={handleExecuteManualPayment} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="manualProgramId" style={{ display: 'block', marginBottom: '0.5rem' }}>Selecionar Programa:</label>
          {programs.length > 0 ? (
            <select
              id="manualProgramId"
              value={manualProgramId}
              onChange={(e) => setManualProgramId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Selecione um programa para pagar</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>{program.name} ({program.id})</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="manualProgramId"
              value={manualProgramId}
              onChange={(e) => setManualProgramId(e.target.value)}
              required
              placeholder="Digite o ID do programa (ex: program_1)"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          )}
          {programs.length === 0 && <small style={{ color: '#666' }}>Crie e atribua trabalhadores a um programa primeiro.</small>}
        </div>
        <button
          type="submit"
          disabled={manualPaymentLoading}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {manualPaymentLoading ? 'Executando...' : 'Pagar Agora'}
        </button>
        {manualPaymentMessage && <p style={{ marginTop: '1rem', color: manualPaymentMessage.startsWith('Falha') ? 'red' : 'green' }}>{manualPaymentMessage}</p>}
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Alterar Valor de Benefício do Trabalhador</h3>
      <form onSubmit={handleUpdateBenefitAmount} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="updateWorkerPrincipal" style={{ display: 'block', marginBottom: '0.5rem' }}>Principal do Trabalhador:</label>
          <input
            type="text"
            id="updateWorkerPrincipal"
            value={updateWorkerPrincipal}
            onChange={(e) => setUpdateWorkerPrincipal(e.target.value)}
            required
            placeholder="Ex: <principal-do-trabalhador>"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="updateProgramId" style={{ display: 'block', marginBottom: '0.5rem' }}>ID do Programa de Benefício:</label>
          {programs.length > 0 ? (
            <select
              id="updateProgramId"
              value={updateProgramId}
              onChange={(e) => setUpdateProgramId(e.target.value)}
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
              id="updateProgramId"
              value={updateProgramId}
              onChange={(e) => setUpdateProgramId(e.target.value)}
              required
              placeholder="Digite o ID do programa (ex: program_1)"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          )}
          {programs.length === 0 && <small style={{ color: '#666' }}>Crie um programa primeiro.</small>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="newBenefitAmount" style={{ display: 'block', marginBottom: '0.5rem' }}>Novo Valor do Benefício (ICP):</label>
          <input
            type="number"
            id="newBenefitAmount"
            value={newBenefitAmount}
            onChange={(e) => setNewBenefitAmount(e.target.value)}
            step="0.01"
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button
          type="submit"
          disabled={updateBenefitLoading}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {updateBenefitLoading ? 'Atualizando...' : 'Atualizar Valor'}
        </button>
        {updateBenefitMessage && <p style={{ marginTop: '1rem', color: updateBenefitMessage.startsWith('Falha') ? 'red' : 'green' }}>{updateBenefitMessage}</p>}
      </form>


      <hr style={{ margin: '2rem 0' }} />

      {/* BLOCO: Consulta de Histórico Individual */}
      <h3>Consultar Histórico Individual (via Reporting Canister)</h3>
      <form onSubmit={handleQueryHistory} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="queryType" style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Entidade:</label>
          <select
            id="queryType"
            value={queryType}
            onChange={(e) => {
              setQueryType(e.target.value);
              setQueryPrincipal(''); // Limpa o principal ao trocar o tipo
              setQueryHistory([]); // Limpa histórico ao trocar o tipo
              setQueryMessage('');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="worker">Trabalhador</option>
            <option value="establishment">Estabelecimento</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="queryPrincipal" style={{ display: 'block', marginBottom: '0.5rem' }}>Principal da Entidade:</label>
          <input
            type="text"
            id="queryPrincipal"
            value={queryPrincipal}
            onChange={(e) => setQueryPrincipal(e.target.value)}
            required
            placeholder={`Ex: <principal-do-${queryType}>`}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button
          type="submit"
          disabled={queryLoading}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {queryLoading ? 'Consultando...' : 'Consultar Histórico'}
        </button>
        {queryMessage && <p style={{ marginTop: '1rem', color: queryMessage.startsWith('Erro') ? 'red' : queryMessage.startsWith('Aviso') ? 'orange' : 'green' }}>{queryMessage}</p>}
      </form>

      {queryHistory.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4>Histórico de Transações Consultadas</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ID Transação</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Quantia</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Descrição</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Data</th>
                {queryType === 'establishment' && ( // Colunas extras para histórico de estabelecimento
                  <>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Trabalhador</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {queryHistory.map((tx, index) => (
                <tr key={tx.id || index}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.id || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {queryType === 'worker' ? `${formatTransactionType(tx.transactionType)} - ${formatBenefitType(tx.benefitType)}` : formatBenefitType(tx.benefitType)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', color: queryType === 'worker' && formatTransactionType(tx.transactionType) === 'Credit' ? 'green' : 'red' }}>
                    {queryType === 'worker' && formatTransactionType(tx.transactionType) === 'Credit' ? '+' : '-'} {formatAmount(tx.amount)} ICP
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.description}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatTimestamp(tx.timestamp || tx.createdAt)}</td>
                  {queryType === 'establishment' && (
                    <>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.workerId ? tx.workerId.toText() : 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatPaymentStatus(tx.status)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p>Funcionalidades futuras: Ver relatórios completos da empresa.</p>
    </div>
  );
};

export default HRDashboard;