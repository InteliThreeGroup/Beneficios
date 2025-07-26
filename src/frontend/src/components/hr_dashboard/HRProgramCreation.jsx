"use client"

import { useState } from "react"
import { useAuth } from "../AuthClientContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlusCircle,
  faUtensils,
  faGraduationCap,
  faHeartbeat,
  faBus,
  faPalette,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faTag,
  faCoins,
  faCalendarAlt,
  faClock,
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
  Culture: "Culture",
  Health: "Health",
  Transport: "Transport",
  Education: "Education",
}

const HRProgramCreation = () => {
  const { actors, profile } = useAuth()
  const [programName, setProgramName] = useState("")
  const [benefitType, setBenefitType] = useState("Food")
  const [amountPerWorker, setAmountPerWorker] = useState("")
  const [frequency, setFrequency] = useState("Monthly")
  const [paymentDay, setPaymentDay] = useState("1")
  const [creationMessage, setCreationMessage] = useState("")
  const [creationLoading, setCreationLoading] = useState(false)

  const handleCreateProgram = async (e) => {
    e.preventDefault()
    setCreationLoading(true)
    setCreationMessage("")

    if (!programName || !amountPerWorker || !frequency || !paymentDay || !profile?.companyId?.[0]) {
      setCreationMessage("Please fill in all fields and make sure the HR profile is loaded.")
      setCreationLoading(false)
      return
    }

    try {
      if (actors && actors.benefits_manager) {
        
        // --- CORREÇÃO FINAL E DEFINITIVA ---
        // A função no backend espera 6 argumentos separados, e não um objeto.
        const result = await actors.benefits_manager.createBenefitProgram(
          programName,                              // 1. name: Text
          { [benefitType]: null },                   // 2. benefitType: BenefitType
          profile.companyId[0],                     // 3. companyId: Text
          BigInt(Math.floor(Number.parseFloat(amountPerWorker) * 10000)), // 4. amountPerWorker: Nat
          { [frequency]: null },                     // 5. frequency: PaymentFrequency
          BigInt(paymentDay)                          // 6. paymentDay: Nat
        );
        // --- FIM DA CORREÇÃO ---

        if (result.ok) {
          setCreationMessage(`Program "${programName}" created successfully!`)
          // Limpa o formulário
          setProgramName("")
          setAmountPerWorker("")
          setBenefitType("Food")
          setFrequency("Monthly")
          setPaymentDay("1")
        } else {
          setCreationMessage(`Error creating program: ${result.err}`)
        }
      } else {
        setCreationMessage("Error: Benefits management module not loaded.")
      }
    } catch (error) {
      console.error("Error creating program:", error)
      setCreationMessage(`Unexpected error creating program: ${error.message}`)
    } finally {
      setCreationLoading(false)
    }
  }

  // O restante do componente (JSX) permanece o mesmo...
  return (
    <div className="dashboard-card program-creation-card">
      <div className="card-header">
        <div className="card-icon">
          <FontAwesomeIcon icon={faPlusCircle} />
        </div>
        <div>
          <h3>Create New Benefit Program</h3>
          <p>Set up a new program for your workers</p>
        </div>
      </div>

      <form onSubmit={handleCreateProgram} className="program-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="programName">
              <FontAwesomeIcon icon={faTag} />
              Program Name
            </label>
            <input
              type="text"
              id="programName"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Ex: Meal Voucher 2024"
              required
              className="form-input"
              disabled={creationLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amountPerWorker">
              <FontAwesomeIcon icon={faCoins} />
              Amount per Worker (ICP)
            </label>
            <input
              type="number"
              id="amountPerWorker"
              value={amountPerWorker}
              onChange={(e) => setAmountPerWorker(e.target.value)}
              placeholder="Ex: 50.00"
              step="0.01"
              min="0"
              required
              className="form-input"
              disabled={creationLoading}
            />
          </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="frequency">
                    <FontAwesomeIcon icon={faClock} />
                    Payment Frequency
                </label>
                <select 
                    id="frequency" 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value)} 
                    className="form-input"
                    disabled={creationLoading}
                >
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="paymentDay">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Payment Day
                </label>
                <input 
                    type="number" 
                    id="paymentDay"
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(e.target.value)}
                    placeholder="Ex: 1"
                    min="1"
                    max="28"
                    required
                    className="form-input"
                    disabled={creationLoading}
                />
            </div>
        </div>

        <div className="form-group">
          <label>Benefit Type</label>
          <div className="benefit-type-selector">
            {Object.entries(benefitLabels).map(([key, label]) => (
              <div
                key={key}
                className={`benefit-option ${benefitType === key ? "selected" : ""}`}
                onClick={() => !creationLoading && setBenefitType(key)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === "Enter" && !creationLoading) { setBenefitType(key) } }}
              >
                <FontAwesomeIcon icon={benefitIcons[key]} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={creationLoading} className="btn btn-primary create-button">
            {creationLoading ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Creating...</>
            ) : (
              <><FontAwesomeIcon icon={faPlusCircle} /> Create Program</>
            )}
          </button>
        </div>

        {creationMessage && (
          <div className={`message ${creationMessage.includes("Error") || creationMessage.includes("error") ? "message-error" : "message-success"}`}>
            <FontAwesomeIcon icon={creationMessage.includes("Error") || creationMessage.includes("error") ? faExclamationTriangle : faCheckCircle} />
            {creationMessage}
          </div>
        )}
      </form>
    </div>
  )
}

export default HRProgramCreation;