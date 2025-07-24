// src/BENEFICIOS_frontend/src/App.jsx - VERSÃO ATUALIZADA
import React from 'react';
import { AuthProvider, useAuth } from './components/AuthClientContext';
import HRDashboard from './components/HRDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import EstablishmentDashboard from './components/EstablishmentDashboard';
import CreateProfileForm from './components/CreateProfileForm';

// Componente principal que usa o contexto de autenticação
const AppContent = () => {
  const { isAuthenticated, principal, profile, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1>Carregando...</h1>
        <p>Por favor, aguarde.</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1>Bem-vindo(a) ao BeneChain</h1>
        <p>Sua plataforma descentralizada de benefícios corporativos.</p>
        <button onClick={login} style={{ fontSize: '1.2rem', padding: '10px 20px', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Login com Internet Identity
        </button>
      </main>
    );
  }

  // Se autenticado, mas sem perfil, mostra o formulário de criação de perfil
  if (profile === null) {
    return (
      <main style={{ padding: '2rem' }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: '2rem' }}>
          <h1>BeneChain</h1>
          <div>
            <p style={{ fontSize: "0.8em", wordBreak: "break-all" }}>Logado como: {principal?.toString()}</p>
            <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
          </div>
        </header>
        <hr />
        <CreateProfileForm />
      </main>
    );
  }
  
  // Determina qual painel mostrar com base no cargo do usuário
  let userView;
  const role = Object.keys(profile.role)[0]; // Pega o nome da variante, ex: "HR"

  switch (role) {
    case 'HR':
      userView = <HRDashboard />;
      break;
    case 'Worker':
      userView = <WorkerDashboard />;
      break;
    case 'Establishment':
      userView = <EstablishmentDashboard />;
      break;
    default:
      userView = <div><h2>Erro: Cargo desconhecido.</h2><p>Por favor, entre em contato com o suporte.</p></div>;
      break;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: '2rem' }}>
        <h1>BeneChain</h1>
        <div>
          <p style={{ fontSize: "0.8em", wordBreak: "break-all" }}>Logado como: {principal?.toString()}</p>
          <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>
      <hr style={{ marginBottom: '2rem' }}/>
      {userView}
    </main>
  );
};

// O componente App que engloba tudo com o AuthProvider
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;