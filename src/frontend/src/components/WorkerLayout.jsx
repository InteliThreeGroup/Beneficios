"use client"

import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "./AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faWallet, faQrcode, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons"

const WorkerLayout = () => {
  const { principal, logout, profile } = useAuth()
  const location = useLocation()

  const workerNavItems = [
    { path: "/carteira", icon: faWallet, label: "Wallet" },
    { path: "/pagar-qr", icon: faQrcode, label: "Pay QR" },
    { path: "/perfil", icon: faUser, label: "Profile" },
  ]

  return (
    <div className="worker-dashboard-wrapper">
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
                <p className="user-role">Worker</p>
              </div>
            </div>
            <button onClick={logout} className="logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="worker-main-content">
        <div className="worker-dashboard-container">
          {/* Mobile Navigation (Tabs) */}
          <div className="worker-mobile-nav">
            {workerNavItems.map((item) => (
              <Link to={item.path} key={item.path}>
                <button className={`mobile-nav-button ${location.pathname === item.path ? "active" : ""}`}>
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <div className="worker-content-area">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default WorkerLayout
