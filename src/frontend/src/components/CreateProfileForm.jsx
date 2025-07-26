"use client"

import { useState } from "react"
import { useAuth } from "./AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUser,
  faUserTie,
  faUsers,
  faStore,
  faBuilding,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"

const CreateProfileForm = () => {
  const { actors, principal, refreshProfile } = useAuth()
  const [name, setName] = useState("")
  const [role, setRole] = useState("Worker")
  const [companyId, setCompanyId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const roleOptions = [
    { value: "Worker", label: "Worker", icon: faUser, description: "Receive and use corporate benefits" },
    { value: "HR", label: "Human Resources", icon: faUserTie, description: "Manage programs and workers" },
    {
      value: "Establishment",
      label: "Establishment",
      icon: faStore,
      description: "Receive benefit payments",
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!actors || !actors.identity_auth) {
      setMessage("Error: Canister actors not loaded.")
      setLoading(false)
      return
    }

    try {
      let selectedRole
      if (role === "HR") selectedRole = { HR: null }
      else if (role === "Worker") selectedRole = { Worker: null }
      else if (role === "Establishment") selectedRole = { Establishment: null }
      else {
        setMessage("Error: Invalid role type.")
        setLoading(false)
        return
      }

      let finalCompanyId
      if (role !== "Establishment" && companyId.trim() !== "") {
        finalCompanyId = [companyId.trim()]
      } else {
        finalCompanyId = []
      }

      const request = {
        name: name,
        role: selectedRole,
        companyId: finalCompanyId,
      }

      const result = await actors.identity_auth.createProfile(request)

      if (result.ok) {
        setMessage("Profile created successfully!")
        await refreshProfile()
      } else {
        setMessage(`Error creating profile: ${result.err}`)
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      setMessage(`Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-profile-screen">
      <div className="create-profile-container">
        <div className="dashboard-card profile-creation-card">
          <div className="card-header">
            <div className="card-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div>
              <h3>Create Profile</h3>
              <p>Complete your registration to access the platform</p>
            </div>
          </div>

          <div className="principal-info">
            <div className="principal-display">
              <span className="principal-label">Your Principal ID:</span>
              <span className="principal-value">{principal?.toString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">
                <FontAwesomeIcon icon={faUser} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Account Type</label>
              <div className="role-selector">
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`role-option ${role === option.value ? "selected" : ""}`}
                    onClick={() => {
                      setRole(option.value)
                      if (option.value === "Establishment") {
                        setCompanyId("")
                      }
                    }}
                  >
                    <div className="role-icon">
                      <FontAwesomeIcon icon={option.icon} />
                    </div>
                    <div className="role-info">
                      <div className="role-title">{option.label}</div>
                      <div className="role-description">{option.description}</div>
                    </div>
                    <div className="role-radio">
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {role !== "Establishment" && (
              <div className="form-group">
                <label htmlFor="companyId">
                  <FontAwesomeIcon icon={faBuilding} />
                  Company ID (optional)
                </label>
                <input
                  type="text"
                  id="companyId"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Ex: company-01"
                  className="form-input"
                />
                <div className="field-help">Leave blank if you don't know or don't have a specific company ID</div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary create-profile-button">
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Create Profile
                  </>
                )}
              </button>
            </div>

            {message && (
              <div className={`message ${message.startsWith("Error") ? "message-error" : "message-success"}`}>
                <FontAwesomeIcon icon={message.startsWith("Error") ? faExclamationTriangle : faCheckCircle} />
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProfileForm
