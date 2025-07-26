"use client"

import { Outlet } from "react-router-dom"
import { useAuth } from "./AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStore, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons"

const EstablishmentLayout = () => {
  const { principal, logout, profile } = useAuth()

  return (
    <div className="establishment-dashboard-wrapper">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <FontAwesomeIcon icon={faStore} />
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
                <p className="user-role">Establishment</p>
              </div>
            </div>
            <button onClick={logout} className="logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="establishment-main-content">
        <div className="establishment-dashboard-container">
          <div className="establishment-content-area">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default EstablishmentLayout
