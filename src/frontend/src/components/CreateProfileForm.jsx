// src/components/CreateProfileForm.jsx
import React, { useState } from 'react';
import { useAuth } from './AuthClientContext';

const CreateProfileForm = () => {
  const { actors, principal, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Worker');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!actors || !actors.identity_auth) {
      setMessage("Erro: Atores do canister não carregados.");
      setLoading(false);
      return;
    }

    try {
      let selectedRole;
      if (role === 'HR') selectedRole = { HR: null };
      else if (role === 'Worker') selectedRole = { Worker: null };
      else if (role === 'Establishment') selectedRole = { Establishment: null };
      else {
        setMessage("Erro: Tipo de cargo inválido.");
        setLoading(false);
        return;
      }

      // --- NOVA TENTATIVA DE CORREÇÃO PARA companyId ---
      let finalCompanyId; // Não inicialize com null
      if (role !== 'Establishment' && companyId.trim() !== '') {
          finalCompanyId = [companyId.trim()]; // Opção Some(Text)
      } else {
          finalCompanyId = []; // Opção None - Array vazio para representar null/None
      }
      // A representação de 'Option<T>' no agente às vezes aceita [] para 'None'
      // ao invés de 'null' ou 'undefined'. Vale a pena testar.


      const request = {
        name: name,
        role: selectedRole,
        companyId: finalCompanyId, // Usa a variável corrigida
      };

      const result = await actors.identity_auth.createProfile(request);

      if (result.ok) {
        setMessage("Perfil criado com sucesso!");
        await refreshProfile();
      } else {
        setMessage(`Erro ao criar perfil: ${result.err}`);
      }
    } catch (error) {
      console.error("Erro na criação do perfil:", error);
      setMessage(`Erro inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Criar Perfil</h2>
      <p>Seu Principal: {principal?.toString()}</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nome:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem' }}>Cargo:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value === 'Establishment') {
                    setCompanyId('');
                }
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="Worker">Trabalhador</option>
            <option value="HR">RH</option>
            <option value="Establishment">Estabelecimento</option>
          </select>
        </div>
        {role !== 'Establishment' && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="companyId" style={{ display: 'block', marginBottom: '0.5rem' }}>ID da Empresa (opcional):</label>
            <input
              type="text"
              id="companyId"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Ex: company-01"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Criando...' : 'Criar Perfil'}
        </button>
        {message && <p style={{ marginTop: '1rem', color: message.startsWith('Erro') ? 'red' : 'green' }}>{message}</p>}
      </form>
    </div>
  );
};

export default CreateProfileForm;