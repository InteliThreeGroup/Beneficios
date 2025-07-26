"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCopy, faUser } from "@fortawesome/free-solid-svg-icons"

const ProfileScreen = ({ profile, principal, logout }) => {
  const userRole = profile?.role ? Object.keys(profile.role)[0] : "Undefined"

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principal?.toString())
    // You can add a notification here if you want
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case "Worker":
        return "Worker"
      case "HR":
        return "Human Resources"
      case "Establishment":
        return "Establishment"
      default:
        return role
    }
  }

  return (
    <div className="mobile-profile-screen">
      {/* Mobile Header */}
      <div className="mobile-profile-header">
        <h1 className="mobile-profile-title">Profile</h1>
      </div>

      {/* Profile Info Section */}
      <div className="mobile-profile-info-section">
        <div className="mobile-profile-avatar">
          <FontAwesomeIcon icon={faUser} />
        </div>
        <div className="mobile-profile-details">
          <h2 className="mobile-profile-name">{profile?.name || "User Name"}</h2>
          <p className="mobile-profile-subtitle">Identification Key</p>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="mobile-profile-cards">
        {/* Principal Card */}
        <div className="mobile-profile-card principal-card">
          <div className="mobile-card-content">
            <div className="mobile-principal-text">{principal?.toString()}</div>
            <button onClick={handleCopyPrincipal} className="mobile-copy-button">
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
          <div className="mobile-card-label">Public Key</div>
        </div>

        {/* Company Info Card */}
        <div className="mobile-profile-card company-card">
          <div className="mobile-card-row">
            <div className="mobile-card-left">
              <div className="mobile-card-title">{profile?.companyId?.[0] || "Company Name"}</div>
              <div className="mobile-card-subtitle">Current Company</div>
            </div>
            <div className="mobile-card-right">
              <div className="mobile-card-number">12</div>
              <div className="mobile-card-subtitle">Receipts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mobile-logout-section">
        <button onClick={logout} className="mobile-logout-button">
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfileScreen
