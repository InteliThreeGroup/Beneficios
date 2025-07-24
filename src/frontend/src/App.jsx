// src/BENEFICIOS_frontend/src/App.jsx - VERSÃO ATUALIZADA

import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

// Importa os atores de TODOS os seus canisters de backend
import { canisterId as identityCanisterId, createActor as createIdentityActor } from '../../declarations/identity_auth';
// Adicione aqui imports para outros atores se precisar usá-los diretamente no App.jsx
// import { canisterId as benefitsManagerCanisterId, createActor as createBenefitsManagerActor } from '../../declarations/benefits_manager';

const App = () => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [actors, setActors] = useState(null);
  const [profile, setProfile] = useState(null);

  // Inicializa o AuthClient quando o componente é montado
  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      if (authenticated) {
        handleAuthenticated(client);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!authClient) return;
    
    // URL do provedor de identidade local, conforme a documentação
    const identityProvider = `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/`;

    await authClient.login({
      identityProvider,
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  };

  const handleAuthenticated = (client) => {
    const identity = client.getIdentity();
    const userPrincipal = identity.getPrincipal();
    setPrincipal(userPrincipal);
    setIsAuthenticated(true);
    
    const agent = new HttpAgent({ identity });
    agent.fetchRootKey(); // Necessário para ambiente local
    
    // Cria um ator apenas para o canister de identidade por enquanto
    const identityActor = createIdentityActor(identityCanisterId, { agent });
    setActors({ identity_auth: identityActor });

    // Busca o perfil do usuário
    identityActor.getProfile().then(profileResult => {
      if (profileResult.ok) {
        setProfile(profileResult.ok);
      } else {
        console.log("Perfil não encontrado, precisa criar um.");
        // Futuramente, você pode mostrar um formulário para criar o perfil aqui
      }
    });
  };
  
  const handleLogout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setActors(null);
    setProfile(null);
  };

  if (!isAuthenticated) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1>Bem-vindo(a) ao BeneChain</h1>
        <button onClick={handleLogin} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
          Login com Internet Identity
        </button>
      </main>
    );
  }
  
  // Determina qual painel mostrar com base no cargo do usuário
  let userView;
  const role = profile ? Object.keys(profile.role)[0] : 'Unknown';

  if (role === 'HR') {
    userView = <div><h2>Painel do RH</h2><p>Bem-vinda, Carla!</p></div>;
  } else if (role === 'Worker') {
    userView = <div><h2>Minha Carteira</h2><p>Bem-vindo, Pedro!</p></div>;
  } else if (role === 'Establishment') {
    userView = <div><h2>Painel do Estabelecimento</h2><p>Bem-vinda, Mariana!</p></div>;
  } else {
    // Se o perfil ainda não foi buscado ou não existe
    userView = <div><h2>Carregando perfil...</h2><p>Se esta mensagem persistir, você pode precisar criar seu perfil.</p></div>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
        <h1>BeneChain</h1>
        <div>
          <p style={{ fontSize: "0.8em", wordBreak: "break-all" }}>Logado como: {principal?.toString()}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <hr />
      {userView}
    </main>
  );
};

export default App;