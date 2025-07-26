import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "./AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTachometerAlt,
  faListAlt,
  faUsers,
  faChartLine,
  faSignOutAlt,
  faWallet,
  faUser,
} from "@fortawesome/free-solid-svg-icons"

const HRDashboardLayout = () => {
  const { principal, logout, profile } = useAuth()
  const location = useLocation()

  // New consolidated navigation structure
  const hrNavItems = [
    { path: "/hr/painel", icon: faTachometerAlt, label: "Dashboard & Funds" },
    { path: "/hr/programas", icon: faListAlt, label: "Programs" },
    { path: "/hr/trabalhadores", icon: faUsers, label: "Manage Workers" },
    { path: "/hr/relatorios", icon: faChartLine, label: "Reports" },
  ]

  return (
    <div className="hr-dashboard-wrapper">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <FontAwesomeIcon icon={faWallet} />
              </div>
              <h1 className="logo-text">BeneChain</h1>
            </div>
          </div>

          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="user-details">
                <p className="user-name">{profile?.name}</p>
                <p className="user-role">{profile?.companyId[0]} • Role: HR</p>
              </div>
            </div>
            <button onClick={logout} className="logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="hr-main-content">
        <div className="hr-dashboard-container">
          {/* Desktop Sidebar */}
          <nav className="hr-sidebar-nav">
            <div className="sidebar-header">
              <h3>Navigation</h3>
            </div>
            <div className="sidebar-menu">
              {hrNavItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Navigation (Tabs) */}
          <div className="hr-mobile-nav">
            {hrNavItems.map((item) => (
              <Link to={item.path} key={item.path}>
                <button className={`mobile-nav-button ${location.pathname === item.path ? "active" : ""}`}>
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <div className="hr-content-area">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default HRDashboardLayout
