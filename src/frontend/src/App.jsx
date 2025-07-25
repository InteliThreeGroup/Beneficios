// src/BENEFICIOS_frontend/src/App.jsx - VERSÃO ATUALIZADA COM ROTAS
import React from 'react';
import { AuthProvider, useAuth } from './components/AuthClientContext';
import HRDashboard from './components/HRDashboard';
import EstablishmentDashboard from './components/EstablishmentDashboard';
import CreateProfileForm from './components/CreateProfileForm';
import ProfileScreen from './components/ProfileScreen'; // Import Profile Screen
import WalletScreen from './components/WalletScreen'; // Import Wallet Screen
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome for icons


// Componente para a Barra de Navegação Inferior
const BottomNavBar = () => {
  const location = useLocation(); // Get current location to set active link

  return (
    <nav className="bottom-nav">
      <Link to="/carteira" className={`nav-item ${location.pathname === '/carteira' ? 'active' : ''}`}>
        <i className="fas fa-wallet nav-item-icon"></i> {/* Wallet icon */}
        <span>Carteira</span>
      </Link>
      {/* You can make this button trigger a modal for QR scanner or a specific QR scan route */}
      <Link to="/carteira" className="nav-center-button"> {/* Temporarily link to carteira, you might want a dedicated QR scan page */}
        <i className="fas fa-qrcode"></i> {/* QR code icon */}
      </Link>
      <Link to="/perfil" className={`nav-item ${location.pathname === '/perfil' ? 'active' : ''}`}>
        <i className="fas fa-user nav-item-icon"></i> {/* Profile icon */}
        <span>Perfil</span>
      </Link>
    </nav>
  );
};

// Componente que representa o layout com a barra de navegação
const WorkerLayout = () => {
  const { principal, logout } = useAuth(); // Access principal and logout for the header

  return (
    <>
      <header>
        <h1>BeneChain</h1>
        <div>
          <p className="principal-text">Logado como: {principal?.toString()}</p>
          <button onClick={logout} className="danger">Logout</button>
        </div>
      </header>
      <hr style={{ marginBottom: '2rem' }}/>
      <Outlet /> {/* Conteúdo das rotas filhas */}
      <BottomNavBar />
    </>
  );
};


// Componente principal que usa o contexto de autenticação e roteamento
const AppContent = () => {
  const { isAuthenticated, principal, profile, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <main className="loading-state" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1>Carregando...</h1>
        <p>Por favor, aguarde.</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="welcome-screen" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h1>Bem-vindo(a) ao BeneChain</h1>
        <p>Sua plataforma descentralizada de benefícios corporativos.</p>
        <button onClick={login} className="primary" style={{ fontSize: '1.2rem', padding: '10px 20px', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Login com Internet Identity
        </button>
      </main>
    );
  }

  // Se autenticado, mas sem perfil, mostra o formulário de criação de perfil
  if (profile === null) {
    return (
      <main style={{ padding: '2rem' }}>
        <header>
          <h1>BeneChain</h1>
          <div>
            <p className="principal-text" style={{ fontSize: "0.8em", wordBreak: "break-all" }}>Logado como: {principal?.toString()}</p>
            <button onClick={logout} className="danger" style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
          </div>
        </header>
        <hr />
        <CreateProfileForm />
      </main>
    );
  }

  const role = Object.keys(profile.role)[0];

  // Render different dashboards or layouts based on role
  if (role === 'Worker') {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/carteira" replace />} /> {/* Redirect root to carteira */}
        <Route element={<WorkerLayout />}>
          <Route path="carteira" element={<WalletScreen />} />
          <Route path="perfil" element={<ProfileScreen profile={profile} principal={principal} logout={logout} />} />
          {/* Add more worker-specific routes here if needed */}
        </Route>
      </Routes>
    );
  } else {
    // For HR and Establishment roles, keep the original header and dashboard rendering
    let dashboardComponent;
    switch (role) {
      case 'HR':
        dashboardComponent = <HRDashboard />;
        break;
      case 'Establishment':
        dashboardComponent = <EstablishmentDashboard />;
        break;
      default:
        dashboardComponent = <div><h2>Erro: Cargo desconhecido.</h2><p>Por favor, entre em contato com o suporte.</p></div>;
        break;
    }
    return (
      <main style={{ padding: '2rem' }}>
        <header>
          <h1>BeneChain</h1>
          <div>
            <p className="principal-text" style={{ fontSize: "0.8em", wordBreak: "break-all" }}>Logado como: {principal?.toString()}</p>
            <button onClick={logout} className="danger" style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
          </div>
        </header>
        <hr style={{ marginBottom: '2rem' }}/>
        {dashboardComponent}
      </main>
    );
  }
};


// O componente App que engloba tudo com o AuthProvider e o Router
const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;