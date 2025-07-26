import { AuthProvider, useAuth } from "./components/AuthClientContext"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "@fortawesome/fontawesome-free/css/all.min.css"

// Main Components and Layouts
import CreateProfileForm from "./components/CreateProfileForm"
import ProfileScreen from "./components/ProfileScreen"
import WalletScreen from "./components/WalletScreen"
import QrPaymentScreen from "./components/QrPaymentScreen"
import EstablishmentDashboard from "./components/EstablishmentDashboard"
import WorkerLayout from "./components/WorkerLayout"
import EstablishmentLayout from "./components/EstablishmentLayout"
import HRDashboardLayout from "./components/HRDashboardLayout"

// New Consolidated HR Pages
import HRMainDashboardPage from "./components/hr_dashboard/pages/HRMainDashboardPage"
import HRProgramsPage from "./components/hr_dashboard/pages/HRProgramsPage"
import HRWorkersPage from "./components/hr_dashboard/pages/HRWorkersPage"
import HRReporting from "./components/hr_dashboard/HRReporting"

const DashboardDispatcher = () => {
  const { profile, principal, logout } = useAuth()
  const role = Object.keys(profile.role)[0]

  switch (role) {
    case "Worker":
      return (
        <Routes>
          <Route path="/" element={<WorkerLayout />}>
            <Route index element={<Navigate to="/carteira" replace />} />
            <Route path="carteira" element={<WalletScreen />} />
            <Route path="pagar-qr" element={<QrPaymentScreen />} />
            <Route path="perfil" element={<ProfileScreen profile={profile} principal={principal} logout={logout} />} />
          </Route>
          <Route path="*" element={<Navigate to="/carteira" replace />} />
        </Routes>
      )
    case "Establishment":
      return (
        <Routes>
          <Route path="/estabelecimento" element={<EstablishmentLayout />}>
            <Route index element={<EstablishmentDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/estabelecimento" replace />} />
        </Routes>
      )
    case "HR":
      return (
        <Routes>
          <Route path="/" element={<HRDashboardLayout />}>
            <Route index element={<Navigate to="/hr/painel" replace />} />
            <Route path="hr/painel" element={<HRMainDashboardPage />} />
            <Route path="hr/programas" element={<HRProgramsPage />} />
            <Route path="hr/trabalhadores" element={<HRWorkersPage />} />
            <Route path="hr/relatorios" element={<HRReporting />} />
            <Route path="hr/*" element={<div className="message-error">HR page not found.</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/hr/painel" replace />} />
        </Routes>
      )
    default:
      return (
        <main className="loading-state">
          <h2>Error: Unknown or unsupported role.</h2>
        </main>
      )
  }
}

const AppContent = () => {
  const { isAuthenticated, principal, profile, loading, login, logout } = useAuth()

  if (loading) {
    return (
      <main className="loading-state">
        <div className="loading-spinner">Loading...</div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="welcome-screen">
        <h1>Welcome to BeneChain</h1>
        <p>Your decentralized corporate benefits platform.</p>
        <button onClick={login} className="btn btn-primary">
          Login with Internet Identity
        </button>
      </main>
    )
  }

  if (!profile) {
    return (
      <main>
        <header className="modern-header">
          <div className="header-content">
            <h1 className="logo-text">BeneChain</h1>
            <div>
              <p className="principal-text" style={{ fontSize: "0.8em", wordBreak: "break-all" }}>
                Logged in as: {principal?.toString()}
              </p>
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        </header>
        <div style={{ padding: "2rem" }}>
          <CreateProfileForm />
        </div>
      </main>
    )
  }

  return <DashboardDispatcher />
}

const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
)

export default App
