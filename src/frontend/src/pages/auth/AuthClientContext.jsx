import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { canisterId as identityCanisterId, createActor as createIdentityActor } from "../../../../declarations/identity_auth";
import { createActor as createBenefitsManagerActor } from "../../../../declarations/benefits_manager";
import { createActor as createWalletsActor } from "../../../../declarations/wallets";
import { createActor as createEstablishmentActor } from "../../../../declarations/establishment";
import { createActor as createChallengesActor } from "../../../../declarations/challenges";

const AuthContext = createContext();

const canisterIds = {
  identity_auth: process.env.CANISTER_ID_IDENTITY_AUTH,
  benefits_manager: process.env.CANISTER_ID_BENEFITS_MANAGER,
  wallets: process.env.CANISTER_ID_WALLETS,
  establishment: process.env.CANISTER_ID_ESTABLISHMENT,
  challenges: process.env.CANISTER_ID_CHALLENGES, // <-- 2. ID DO NOVO CANISTER
};

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [profile, setProfile] = useState(null);
  const [actors, setActors] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      
      if (authenticated) {
        await handleAuthenticated(client);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro na inicialização do AuthClient:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleAuthenticated = async (client) => {
    const identity = client.getIdentity();
    const userPrincipal = identity.getPrincipal();

    setPrincipal(userPrincipal);
    setIsAuthenticated(true);

    const _actors = {
      identity_auth: createIdentityActor(canisterIds.identity_auth, { agentOptions: { identity } }),
      benefits_manager: createBenefitsManagerActor(canisterIds.benefits_manager, { agentOptions: { identity } }),
      wallets: createWalletsActor(canisterIds.wallets, { agentOptions: { identity } }),
      establishment: createEstablishmentActor(canisterIds.establishment, { agentOptions: { identity } }),
      challenges: createChallengesActor(canisterIds.challenges, { agentOptions: { identity } }), // <-- 3. ATOR DO CHALLENGES CRIADO
    };
    setActors(_actors);

    try {
      const profileResult = await _actors.identity_auth.getProfile();
      if ('ok' in profileResult) {
        setProfile(profileResult.ok);
      } else {
        console.log("Nenhum perfil encontrado para este principal, o usuário precisa criar um.");
        setProfile(null);
      }
      
      // REMOVIDO: A chamada para createWallet foi removida pois a carteira é criada sob demanda no backend.
      // try {
      //   await _actors.wallets.createWallet(); 
      // } catch (e) {
      //   console.log("Tentativa de criar carteira (pode já existir):", e);
      // }

    } catch (error) {
      console.error("Erro ao buscar perfil ou criar carteira:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) return;
    setLoading(true);
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app/#authorize"
        : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`,
      onSuccess: () => handleAuthenticated(authClient),
      onError: (error) => {
        console.error("Falha no login:", error);
        setLoading(false);
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setProfile(null);
    setActors(null);
  };

  const reloadProfile = async () => {
    if (actors?.identity_auth) {
      const profileResult = await actors.identity_auth.getProfile();
      if ('ok' in profileResult) {
        setProfile(profileResult.ok);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, principal, profile, actors, loading, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
