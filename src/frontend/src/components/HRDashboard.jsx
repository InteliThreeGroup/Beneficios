// src/components/HRDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthClientContext';

const HRDashboard = () => {
  const { actors, profile } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!actors || !profile || !profile.companyId) return;
      setLoading(true);
      setError('');
      try {
        const result = await actors.benefits_manager.getCompanyBenefitPrograms(profile.companyId[0]); // companyId é um Option
        setPrograms(result);
      } catch (err) {
        console.error("Erro ao buscar programas:", err);
        setError("Falha ao carregar programas de benefício.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [actors, profile]);

  if (loading) return <p>Carregando programas do RH...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Painel do RH - Bem-vindo(a), {profile?.name}!</h2>
      <p>Gerenciando benefícios para a empresa: {profile?.companyId?.[0] || 'N/A'}</p>
      <h3>Programas de Benefício</h3>
      {programs.length === 0 ? (
        <p>Nenhum programa de benefício encontrado. Crie um novo!</p>
      ) : (
        <ul>
          {programs.map(program => (
            <li key={program.id}>
              {program.name} ({Object.keys(program.benefitType)[0]}) - {Number(program.amountPerWorker) / 10000} ICP por trabalhador
            </li>
          ))}
        </ul>
      )}
      {/* Aqui você adicionaria formulários para criar programas, adicionar trabalhadores, etc. */}
      <p>Funcionalidades futuras: Criar novo programa, atribuir trabalhadores, executar pagamentos manuais, ver relatórios.</p>
    </div>
  );
};

export default HRDashboard;