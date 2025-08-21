// src/frontend/src/components/AuthClientContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent'; // Removed Actor as it's not directly used for agent creation
import { Principal } from '@dfinity/principal';

// Importa os canister IDs e createActor para todos os seus canisters de backend
import { canisterId as identityCanisterId, createActor as createIdentityActor } from '../../../../declarations/identity_auth';
import { canisterId as benefitsManagerCanisterId, createActor as createBenefitsManagerActor } from '../../../../declarations/benefits_manager';
import { canisterId as establishmentCanisterId, createActor as createEstablishmentActor } from '../../../../declarations/establishment';
import { canisterId as walletsCanisterId, createActor as createWalletsActor } from '../../../../declarations/wallets';
import { canisterId as reportingCanisterId, createActor as createReportingActor } from '../../../../declarations/reporting';
import { canisterId as challengeId, createActor as createChallengeActor } from "../../../../declarations/challenges";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [actors, setActors] = useState(null); // Pode ser null ou um objeto de atores
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      if (authenticated) {
        await handleAuthenticated(client);
      }
      setLoading(false);
    });
  }, []);

  const handleAuthenticated = async (client) => {
    const userIdentity = client.getIdentity();
    const userPrincipal = userIdentity.getPrincipal();
    setIdentity(userIdentity);
    setPrincipal(userPrincipal);
    setIsAuthenticated(true);

    const agent = new HttpAgent({ identity: userIdentity });
    if (process.env.DFX_NETWORK !== "ic") {
        agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }

    // Cria atores para TODOS os canisters de backend
    const _actors = {
      identity_auth: createIdentityActor(identityCanisterId, { agent }),
      benefits_manager: createBenefitsManagerActor(benefitsManagerCanisterId, { agent }),
      establishment: createEstablishmentActor(establishmentCanisterId, { agent }),
      wallets: createWalletsActor(walletsCanisterId, { agent }),
      reporting: createReportingActor(reportingCanisterId, { agent }),
      challenges: createChallengeActor(challengeId, { agent }), // <-- 3. ATOR DO CHALLENGES CRIADO
    };
    setActors(_actors);

    // Tenta buscar o perfil
    let fetchedProfile = null;
    try {
      const profileResult = await _actors.identity_auth.getProfile();
      if (profileResult.ok) {
        fetchedProfile = profileResult.ok;
        setProfile(fetchedProfile);
      } else {
        console.log("Perfil não encontrado, precisa criar um.");
        setProfile(null);
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setProfile(null); // Certifica que o perfil é null em caso de erro
    }

    // Se o perfil é nulo, refreshProfile é chamado para forçar a criação se o usuário precisar
    // if (fetchedProfile === null) { // <-- Removido, handleAuthenticated já chama refreshProfile se necessário
    //   await refreshProfile();
    // }

    // Cria/Verifica carteira (sempre para qualquer usuário autenticado)
    if (userPrincipal && _actors.wallets) {
        try {
            const walletCreationResult = await _actors.wallets.createWallet(userPrincipal);
            if (walletCreationResult.ok) {
                console.log("Carteira verificada/criada com sucesso para:", userPrincipal.toText());
            } else {
                console.error("Erro ao verificar/criar carteira:", walletCreationResult.err);
            }
        } catch (walletError) {
            console.error("Erro inesperado ao chamar createWallet:", walletError);
        }
    }
  };

  const login = async () => {
    if (!authClient) return;
    const identityProvider = process.env.DFX_NETWORK === "ic"
      ? "https://identity.ic0.app"
      : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`;

    await authClient.login({
      identityProvider,
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setIdentity(null);
    setActors(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (actors && actors.identity_auth) {
      try {
        const profileResult = await actors.identity_auth.getProfile();
        if (profileResult.ok) {
          setProfile(profileResult.ok);
        } else {
          setProfile(null); // Perfil não encontrado ou erro, define como null
        }
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        setProfile(null); // Em caso de erro, define como null
      }
    }
  };

  const contextValue = {
    authClient,
    isAuthenticated,
    principal,
    identity,
    actors,
    profile,
    loading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};