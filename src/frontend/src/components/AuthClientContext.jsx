// src/components/AuthClientContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal'; // Mantenha esta linha

// Importa os canister IDs e createActor para todos os seus canisters de backend
// Certifique-se de que os caminhos para 'declarations' estão corretos.
// Eles devem ser relativos à raiz onde 'declarations' está, que geralmente é um nível acima do 'src' do frontend.
import { canisterId as identityCanisterId, createActor as createIdentityActor } from "../../../declarations/identity_auth";
import { canisterId as benefitsManagerCanisterId, createActor as createBenefitsManagerActor } from "../../../declarations/benefits_manager";
import { canisterId as establishmentCanisterId, createActor as createEstablishmentActor } from "../../../declarations/establishment";
import { canisterId as walletsCanisterId, createActor as createWalletsActor } from "../../../declarations/wallets";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [actors, setActors] = useState(null);
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

  const _actors = {
    identity_auth: createIdentityActor(identityCanisterId, { agent }),
    benefits_manager: createBenefitsManagerActor(benefitsManagerCanisterId, { agent }),
    establishment: createEstablishmentActor(establishmentCanisterId, { agent }),
    wallets: createWalletsActor(walletsCanisterId, { agent }), // Adicionado
  };
  setActors(_actors);

 let fetchedProfile = null;
try {
  const profileResult = await _actors.identity_auth.getProfile();
  if (profileResult.ok) { // Se o perfil base do identity_auth existe
    fetchedProfile = profileResult.ok;
    setProfile(fetchedProfile);
  } else { // Se o perfil base do identity_auth NÃO existe
    console.log("Perfil não encontrado, precisa criar um.");
    setProfile(null); // Isso faz o App.jsx mostrar o CreateProfileForm
  }
} catch (error) {
  console.error("Erro ao buscar perfil:", error);
  setProfile(null);
}
  // --- NOVA LÓGICA: Tenta criar/obter a carteira após autenticação ---
  if (userPrincipal && _actors.wallets) {
      try {
          // Chame createWallet. Ele verificará se a carteira já existe.
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

    // Tenta buscar o perfil do usuário
    try {
      const profileResult = await _actors.identity_auth.getProfile();
      if (profileResult.ok) {
        setProfile(profileResult.ok);
      } else {
        console.log("Perfil não encontrado, precisa criar um.");
        setProfile(null); // Explicitamente null se não encontrar
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setProfile(null);
    }
  };

  const login = async () => {
    if (!authClient) return;
    const identityProvider = process.env.DFX_NETWORK === "ic"
      ? "https://identity.ic0.app"
      : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`; // Usando a porta 4943 conforme o log do dfx

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

  // Função para atualizar o perfil após a criação/edição
  const refreshProfile = async () => {
    if (actors && actors.identity_auth) {
      try {
        const profileResult = await actors.identity_auth.getProfile();
        if (profileResult.ok) {
          setProfile(profileResult.ok);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        setProfile(null);
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