"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faListAlt,
  faUtensils,
  faGraduationCap,
  faHeartbeat,
  faBus,
  faPalette,
  faCoins,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"

const benefitIcons = {
  Food: faUtensils,
  Education: faGraduationCap,
  Health: faHeartbeat,
  Transport: faBus,
  Culture: faPalette,
}

const benefitLabels = {
  Food: "Food",
  Education: "Education",
  Health: "Health",
  Transport: "Transport",
  Culture: "Culture",
}

const HRProgramList = () => {
  const { actors, profile } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const formatBenefitType = (type) => Object.keys(type)[0] || "Unknown"
  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2)

  const fetchPrograms = useCallback(async () => {
    if (!actors?.benefits_manager || !profile?.companyId?.[0]) {
      setError("Incomplete profile or company information.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    try {
      const companyId = profile.companyId[0]
      const result = await actors.benefits_manager.getCompanyBenefitPrograms(companyId)
      setPrograms(result)
    } catch (err) {
      console.error("Error fetching programs:", err)
      setError("Failed to load benefit programs.")
    } finally {
      setLoading(false)
    }
  }, [actors, profile])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  if (loading) {
    return (
      <div className="dashboard-card programs-list-card">
        <div className="card-header">
          <div className="card-icon">
            <FontAwesomeIcon icon={faListAlt} />
          </div>
          <div>
            <h3>Existing Benefit Programs</h3>
            <p>View all programs created for your company</p>
          </div>
        </div>
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          Loading programs...
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card programs-list-card">
      <div className="card-header">
        <div className="card-icon">
          <FontAwesomeIcon icon={faListAlt} />
        </div>
        <div>
          <h3>Existing Benefit Programs</h3>
          <p>View all programs created for your company</p>
        </div>
      </div>

      {error && (
        <div className="message message-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}

      {!error && programs.length > 0 ? (
        <div className="programs-grid">
          {programs.map((program) => {
            const benefitTypeKey = formatBenefitType(program.benefitType)
            const icon = benefitIcons[benefitTypeKey] || faListAlt
            const label = benefitLabels[benefitTypeKey] || benefitTypeKey

            return (
              <div key={program.id} className="program-card">
                <div className="program-header">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <div className="program-info">
                    <h4 className="program-name">{program.name}</h4>
                    <span className="program-type">{label}</span>
                  </div>
                </div>
                <div className="program-amount">
                  <FontAwesomeIcon icon={faCoins} />
                  <span>{formatAmount(program.amountPerWorker)} ICP</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        !error && (
          <div className="empty-state">
            <div className="empty-icon">
              <FontAwesomeIcon icon={faListAlt} />
            </div>
            <h4>No programs found</h4>
            <p>No benefit programs have been created for this company yet.</p>
            <p className="empty-subtitle">Create your first program to get started!</p>
          </div>
        )
      )}
    </div>
  )
}

export default HRProgramList
