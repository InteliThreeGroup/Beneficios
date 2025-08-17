import { AuthProvider, useAuth } from "./pages/auth/AuthClientContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { Loader2, HandCoins } from "lucide-react";

// Layouts e Componentes de Roteamento
import CreateProfileForm from "./pages/auth/CreateProfileForm";
import EstablishmentDashboard from "./pages/establishment/_components/EstablishmentDashboard";
import EstablishmentLayout from "./pages/establishment/EstablishmentLayout";
import HRDashboardLayout from "./pages/hr/HRDashboardLayout";

// Novas Telas e Layout do Trabalhador (com design atualizado)
import { WorkerLayout } from "./pages/worker/WorkerLayout";
import { WalletScreen } from "./pages/worker/_components/WalletScreen";
import { QrPaymentScreen } from "./pages/worker/_components/QrPaymentScreen";
import { PaymentScreen } from "./pages/worker/_components/PaymentScreen";
import { ProfileScreen } from "./pages/worker/_components/ProfileScreen";

// Páginas do RH (permanecem as mesmas)
import HRMainDashboardPage from "./pages/hr/_components/pages/HRMainDashboardPage";
import HRProgramsPage from "./pages/hr/_components/pages/HRProgramsPage";
import HRWorkersPage from "./pages/hr/_components/pages/HRWorkersPage";
import HRReporting from "./pages/hr/_components/HRReporting";

// Componente que decide qual painel mostrar com base no perfil do usuário
const DashboardDispatcher = () => {
  const { profile } = useAuth();
  // Se o perfil ainda não carregou, espera.
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="mt-4 text-gray-600">Carregando perfil...</p>
      </div>
    );
  }

  const role = Object.keys(profile.role)[0];

  switch (role) {
    case "Worker":
      return (
        <Routes>
          {/* Todas as rotas do trabalhador usam o novo WorkerLayout */}
          <Route path="/" element={<WorkerLayout />}>
            {/* Redireciona a rota raiz para a carteira */}
            <Route index element={<Navigate to="/carteira" replace />} />
            <Route path="carteira" element={<WalletScreen />} />
            <Route path="pagar-qr" element={<QrPaymentScreen />} />
            {/* O ProfileScreen agora usa o hook useAuth, não precisa mais de props */}
            <Route path="perfil" element={<ProfileScreen />} />
          </Route>
          {/* Rota para pagamento via link (fora do layout do trabalhador) */}
          <Route path="/payment" element={<PaymentScreen />} />
          {/* Qualquer outra rota desconhecida redireciona para a carteira */}
          <Route path="*" element={<Navigate to="/carteira" replace />} />
        </Routes>
      );
    case "Establishment":
      return (
        <Routes>
          <Route path="/estabelecimento" element={<EstablishmentLayout />}>
            <Route index element={<EstablishmentDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/estabelecimento" replace />} />
        </Routes>
      );
    case "HR":
      return (
        <Routes>
          <Route path="/" element={<HRDashboardLayout />}>
            <Route index element={<Navigate to="/hr/painel" replace />} />
            <Route path="hr/painel" element={<HRMainDashboardPage />} />
            <Route path="hr/programas" element={<HRProgramsPage />} />
            <Route path="hr/trabalhadores" element={<HRWorkersPage />} />
            <Route path="hr/relatorios" element={<HRReporting />} />
          </Route>
          <Route path="*" element={<Navigate to="/hr/painel" replace />} />
        </Routes>
      );
    default:
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
          <h2 className="text-xl text-red-600">Erro: Perfil desconhecido ou não suportado.</h2>
        </div>
      );
  }
};

// Componente que gerencia os estados principais da aplicação (loading, login, criação de perfil)
const AppContent = () => {
  const { isAuthenticated, profile, loading, login, logout, principal } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="mt-4 text-gray-600">Autenticando...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 text-center">
        <HandCoins size={64} className="text-blue-600 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800">Bem-vindo ao BeneChain</h1>
        <p className="text-gray-600 mt-2 max-w-md">Sua plataforma descentralizada de benefícios corporativos na Internet Computer.</p>
        <button onClick={login} className="mt-8 bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
          Login com Internet Identity
        </button>
      </main>
    );
  }

  if (!profile) {
    return (
       <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <HandCoins size={32} className="text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">BeneChain</h1>
            </div>
            <button onClick={logout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">
              Logout
            </button>
          </div>
        </header>
        <div className="container mx-auto p-4 md:p-8">
            <p className="text-sm text-gray-500 mb-4 text-center">Logado como: <span className="font-mono break-all">{principal?.toString()}</span></p>
            <CreateProfileForm />
        </div>
      </main>
    );
  }

  return <DashboardDispatcher />;
};

// Componente raiz da aplicação
const App = () => (
  <AuthProvider>
    {/* Toaster é para as notificações do ProfileScreen */}
    <Toaster position="top-center" reverseOrder={false}/>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
