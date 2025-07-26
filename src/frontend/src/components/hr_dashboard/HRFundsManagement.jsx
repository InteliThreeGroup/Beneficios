"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWallet,
  faDollarSign,
  faArrowUp,
  faInfo,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"

const HRFundsManagement = () => {
  const { actors } = useAuth()
  const [availableFunds, setAvailableFunds] = useState(0)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositMessage, setDepositMessage] = useState("")
  const [depositLoading, setDepositLoading] = useState(false)
  const [isLoadingFunds, setIsLoadingFunds] = useState(true)
  const [fundsError, setFundsError] = useState("")

  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2)

  const fetchFunds = useCallback(async () => {
    if (!actors?.benefits_manager) {
      return
    }

    setIsLoadingFunds(true)
    setFundsError("")

    try {
      const fundsResult = await actors.benefits_manager.getAvailableFunds()
      if (typeof fundsResult !== "undefined") {
        setAvailableFunds(Number(fundsResult))
      } else {
        if (fundsResult.ok) {
          setAvailableFunds(Number(fundsResult.ok))
        } else {
          throw new Error(fundsResult.err || "Unknown error fetching funds.")
        }
      }
    } catch (err) {
      console.error("Error fetching funds:", err)
      setFundsError("Failed to load available balance.")
    } finally {
      setIsLoadingFunds(false)
    }
  }, [actors])

  useEffect(() => {
    fetchFunds()
  }, [fetchFunds])

  const handleDeposit = async (e) => {
    e.preventDefault()
    setDepositLoading(true)
    setDepositMessage("")

    if (!actors?.benefits_manager || !depositAmount) {
      setDepositMessage("Error: Please enter the deposit amount.")
      setDepositLoading(false)
      return
    }

    try {
      const amountInNats = BigInt(Math.floor(Number.parseFloat(depositAmount) * 10000))
      const result = await actors.benefits_manager.depositFunds(amountInNats)

      if (result.ok) {
        setDepositMessage(`Deposit of ${formatAmount(amountInNats)} ICP completed successfully!`)
        setDepositAmount("")
        await fetchFunds()
      } else {
        setDepositMessage(`Failed to deposit funds: ${result.err}`)
      }
    } catch (err) {
      console.error("Error depositing funds:", err)
      setDepositMessage(`Unexpected error depositing funds: ${err.message}`)
    } finally {
      setDepositLoading(false)
    }
  }

  const renderFundsDisplay = () => {
    if (isLoadingFunds) {
      return (
        <div className="funds-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading balance...</span>
        </div>
      )
    }

    if (fundsError) {
      return (
        <div className="funds-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{fundsError}</span>
        </div>
      )
    }

    return (
      <div className="funds-amount">
        <FontAwesomeIcon icon={faDollarSign} />
        <span>{formatAmount(availableFunds)} ICP</span>
      </div>
    )
  }

  return (
    <div className="dashboard-card funds-management-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-icon">
          <FontAwesomeIcon icon={faWallet} />
        </div>
        <div className="card-title-section">
          <h3>Canister Funds Management</h3>
          <p>Manage and distribute funds to your workers</p>
        </div>
      </div>

      {/* Available Balance Section */}
      <div className="funds-balance-section">
        <div className="balance-card">
          <div className="balance-header">
            <div className="balance-label">
              <FontAwesomeIcon icon={faWallet} />
              <span>Available Balance for Distribution</span>
            </div>
            <div className="balance-display">{renderFundsDisplay()}</div>
          </div>
        </div>
      </div>

      {/* Deposit Section */}
      <div className="deposit-section">
        <div className="section-header">
          <h4>
            <FontAwesomeIcon icon={faArrowUp} />
            Add Funds
          </h4>
          <p>Deposit funds into the canister to distribute to workers</p>
        </div>

        <form onSubmit={handleDeposit} className="deposit-form">
          <div className="form-group">
            <label htmlFor="depositAmount">
              <FontAwesomeIcon icon={faDollarSign} />
              Amount to Deposit (ICP)
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Ex: 100.00"
                step="0.01"
                required
                className="form-input deposit-input"
                min="0"
              />
              <div className="input-suffix">ICP</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={depositLoading || !depositAmount || isLoadingFunds}
            className="btn btn-primary deposit-button"
          >
            {depositLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Processing Deposit...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faArrowUp} />
                Deposit Funds
              </>
            )}
          </button>

          {depositMessage && (
            <div
              className={`message ${
                depositMessage.startsWith("Failed") || depositMessage.startsWith("Error")
                  ? "message-error"
                  : "message-success"
              }`}
            >
              <FontAwesomeIcon
                icon={
                  depositMessage.startsWith("Failed") || depositMessage.startsWith("Error")
                    ? faExclamationTriangle
                    : faCheckCircle
                }
              />
              <span>{depositMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Info Note */}
      <div className="info-note">
        <div className="info-icon">
          <FontAwesomeIcon icon={faInfo} />
        </div>
        <div className="info-content">
          <h5>Deposit Simulation</h5>
          <p>
            This is a simulated deposit for the canister. In a real application, you would transfer ICP or tokens to the
            canister's Principal through a connected wallet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HRFundsManagement
