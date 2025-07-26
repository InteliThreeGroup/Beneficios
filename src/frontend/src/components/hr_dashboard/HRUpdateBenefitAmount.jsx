"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../AuthClientContext"
import { Principal } from "@dfinity/principal"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExchangeAlt,
  faUser,
  faClipboardList,
  faCoins,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"

const HRUpdateBenefitAmount = () => {
  const { actors, profile } = useAuth()
  const [workerPrincipal, setWorkerPrincipal] = useState("")
  const [programId, setProgramId] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [availablePrograms, setAvailablePrograms] = useState([])
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [programsLoading, setProgramsLoading] = useState(true)

  const fetchPrograms = useCallback(async () => {
    if (!actors?.benefits_manager || !profile?.companyId?.[0]) return

    setProgramsLoading(true)
    try {
      const companyId = profile.companyId[0]
      const result = await actors.benefits_manager.getCompanyBenefitPrograms(companyId)
      setAvailablePrograms(result)
      if (result.length > 0) {
        setProgramId(result[0].id)
      }
    } catch (error) {
      console.error("Error loading programs for update:", error)
    } finally {
      setProgramsLoading(false)
    }
  }, [actors, profile])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  const handleUpdateAmount = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setUpdateMessage("")

    if (!workerPrincipal || !programId || !newAmount || isNaN(newAmount) || Number.parseFloat(newAmount) < 0) {
      setUpdateMessage("Please fill in all fields with valid values.")
      setUpdateLoading(false)
      return
    }

    try {
      const workerId = Principal.fromText(workerPrincipal)
      const amountInNats = BigInt(Math.floor(Number.parseFloat(newAmount) * 10000))
      const result = await actors.benefits_manager.updateWorkerBenefitAmount(workerId, programId, amountInNats)

      if (result.ok) {
        setUpdateMessage("Benefit amount updated successfully!")
        setWorkerPrincipal("")
        setNewAmount("")
      } else {
        setUpdateMessage(`Error updating amount: ${result.err}`)
      }
    } catch (error) {
      console.error("Error updating amount:", error)
      setUpdateMessage("An error occurred while processing the update.")
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div className="dashboard-card update-benefit-card">
      <div className="card-header">
        <div className="card-icon">
          <FontAwesomeIcon icon={faExchangeAlt} />
        </div>
        <div>
          <h3>Change Benefit Amount</h3>
          <p>Update the benefit amount for specific workers</p>
        </div>
      </div>

      <form onSubmit={handleUpdateAmount} className="update-form">
        <div className="form-group">
          <label htmlFor="updateWorkerPrincipal">
            <FontAwesomeIcon icon={faUser} />
            Worker Principal
          </label>
          <input
            type="text"
            id="updateWorkerPrincipal"
            value={workerPrincipal}
            onChange={(e) => setWorkerPrincipal(e.target.value)}
            required
            placeholder="Paste the worker's Principal ID"
            className="form-input"
            disabled={updateLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="updateProgramId">
            <FontAwesomeIcon icon={faClipboardList} />
            Benefit Program
          </label>
          {programsLoading ? (
            <div className="loading-select">
              <FontAwesomeIcon icon={faSpinner} spin />
              Loading programs...
            </div>
          ) : (
            <select
              id="updateProgramId"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              required
              disabled={availablePrograms.length === 0 || updateLoading}
              className="form-select"
            >
              <option value="">
                {availablePrograms.length === 0 ? "No programs available" : "Select a program"}
              </option>
              {availablePrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newAmount">
            <FontAwesomeIcon icon={faCoins} />
            New Amount (ICP)
          </label>
          <input
            type="number"
            id="newAmount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Ex: 550.00"
            step="0.01"
            required
            className="form-input"
            disabled={updateLoading}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary update-button"
            disabled={updateLoading || availablePrograms.length === 0 || programsLoading}
          >
            {updateLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Updating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faExchangeAlt} />
                Update Amount
              </>
            )}
          </button>
        </div>

        {updateMessage && (
          <div className={`message ${updateMessage.startsWith("Error") ? "message-error" : "message-success"}`}>
            <FontAwesomeIcon icon={updateMessage.startsWith("Error") ? faExclamationTriangle : faCheckCircle} />
            {updateMessage}
          </div>
        )}
      </form>
    </div>
  )
}

export default HRUpdateBenefitAmount
