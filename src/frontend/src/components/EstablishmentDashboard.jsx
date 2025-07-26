"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./AuthClientContext"
import { Principal } from "@dfinity/principal"
import QRCode from "react-qr-code"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBuilding,
  faGlobe,
  faHashtag,
  faWallet,
  faCoins,
  faReceipt,
  faMoneyBillWave,
  faUser,
  faQrcode,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faStore,
  faHistory,
  faUtensils,
  faGraduationCap,
  faHeartbeat,
  faBus,
  faPalette,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { faBtc } from "@fortawesome/free-brands-svg-icons"

const EstablishmentDashboard = () => {
  const { actors, principal, profile } = useAuth()
  const [establishmentProfile, setEstablishmentProfile] = useState(null)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("profile")

  // Estados do formulário de registro
  const [registerName, setRegisterName] = useState("")
  const [registerCountry, setRegisterCountry] = useState("")
  const [registerBusinessCode, setRegisterBusinessCode] = useState("")
  const [registerWalletPrincipal, setRegisterWalletPrincipal] = useState(principal ? principal.toText() : "")
  const [acceptedBenefitTypes, setAcceptedBenefitTypes] = useState(["Food"])
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerMessage, setRegisterMessage] = useState("")

  // Estados do pagamento
  const [workerPrincipalInput, setWorkerPrincipalInput] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [benefitType, setBenefitType] = useState("Food")
  const [description, setDescription] = useState("")
  const [paymentMessage, setPaymentMessage] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [qrCodeData, setQrCodeData] = useState("")
  const [showQrCode, setShowQrCode] = useState(false)
  // Estado para feedback de cópia do QR
  const [copyQrFeedback, setCopyQrFeedback] = useState("")

  // Estados do Bitcoin
  const [btcAddressLoading, setBtcAddressLoading] = useState(false)
  const [btcAddressMessage, setBtcAddressMessage] = useState("")
  const [btcBalance, setBtcBalance] = useState("N/A")
  const [btcBalanceLoading, setBtcBalanceLoading] = useState(false)
  const [btcBalanceMessage, setBtcBalanceMessage] = useState("")

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

  const fetchEstablishmentData = async () => {
    if (!actors || !actors.establishment || !principal) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      const estProfileResult = await actors.establishment.getEstablishment()
      if (estProfileResult.ok) {
        setEstablishmentProfile(estProfileResult.ok)
        const txHistoryResult = await actors.establishment.getTransactionHistory([BigInt(10)])
        setTransactionHistory(txHistoryResult)
      } else {
        setEstablishmentProfile(null)
        setTransactionHistory([])
        setError("You have not registered an establishment yet. Please fill out the form below.")
      }
    } catch (err) {
      console.error("Erro ao buscar dados do estabelecimento:", err)
      setError("Failed to load establishment data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (principal && !registerWalletPrincipal) {
      setRegisterWalletPrincipal(principal.toText())
    }
    fetchEstablishmentData()
  }, [actors, principal])

  useEffect(() => {
    const fetchBtcData = async () => {
      if (establishmentProfile && establishmentProfile.btcAddress && actors && actors.establishment) {
        setBtcBalanceLoading(true)
        setBtcBalanceMessage("")
        try {
          const btcBalanceResult = await actors.establishment.getBtcBalance({ regtest: null }, null)
          if (btcBalanceResult.ok) {
            setBtcBalance(`${(Number(btcBalanceResult.ok) / 100_000_000).toFixed(8)} BTC`)
          } else {
            setBtcBalanceMessage(`Failed to fetch BTC balance: ${btcBalanceResult.err}`)
            setBtcBalance("0.00000000 BTC")
          }
        } catch (err) {
          console.error("Erro ao buscar saldo BTC:", err)
          setBtcBalanceMessage(`Unexpected error fetching BTC balance: ${err.message}`)
          setBtcBalance("N/A")
        } finally {
          setBtcBalanceLoading(false)
        }
      } else {
        setBtcBalance("N/A")
      }
    }
    fetchBtcData()
  }, [establishmentProfile, actors])

  const handleRegisterEstablishment = async (e) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterMessage("")
    if (!actors || !actors.establishment) {
      setRegisterMessage("Error: Canister actors not loaded.")
      setRegisterLoading(false)
      return
    }
    try {
      const walletId = Principal.fromText(registerWalletPrincipal)
      const parsedAcceptedBenefitTypes = acceptedBenefitTypes.map((type) => ({ [type]: null })).filter(Boolean)
      const request = {
        name: registerName,
        country: registerCountry,
        businessCode: registerBusinessCode,
        walletPrincipal: walletId,
        acceptedBenefitTypes: parsedAcceptedBenefitTypes,
      }
      const result = await actors.establishment.registerEstablishment(request)
      if (result.ok) {
        setRegisterMessage("Establishment registered successfully!")
        await fetchEstablishmentData()
      } else {
        setRegisterMessage(`Failed to register establishment: ${result.err}`)
      }
    } catch (err) {
      console.error("Erro ao registrar estabelecimento:", err)
      setRegisterMessage(`Unexpected error registering: ${err.message}`)
    } finally {
      setRegisterLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setPaymentLoading(true)
    setPaymentMessage("")
    setQrCodeData("")
    setShowQrCode(false)

    if (!actors || !actors.establishment) {
      setPaymentMessage("Error: Canister actors not loaded.")
      setPaymentLoading(false)
      return
    }
    try {
      if (!workerPrincipalInput || !paymentAmount || !benefitType || !description) {
        setPaymentMessage("Please fill in all payment fields.")
        setPaymentLoading(false)
        return
      }

      const qrData = {
        establishmentId: principal.toText(),
        amount: Number.parseFloat(paymentAmount),
        benefitType: benefitType,
        description: description,
      }

      const qrCodeString = JSON.stringify(qrData)
      setQrCodeData(qrCodeString)
      setShowQrCode(true)
      setPaymentMessage("QR Code generated. Ask the worker to scan and confirm the payment.")
    } catch (err) {
      console.error("Erro ao gerar QR Code de pagamento:", err)
      setPaymentMessage(`Unexpected error generating QR Code: ${err.message}`)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleGenerateBtcAddress = async () => {
    setBtcAddressLoading(true)
    setBtcAddressMessage("")
    if (!actors || !actors.establishment) {
      setBtcAddressMessage("Error: Canister actors not loaded.")
      setBtcAddressLoading(false)
      return
    }
    try {
      const result = await actors.establishment.generateBtcAddress()
      if (result.ok) {
        setBtcAddressMessage("BTC address generated successfully!")
        await fetchEstablishmentData()
      } else {
        setBtcAddressMessage(`Failed to generate BTC address: ${result.err}`)
      }
    } catch (err) {
      console.error("Erro ao gerar endereço BTC:", err)
      setBtcAddressMessage(`Unexpected error: ${err.message}`)
    } finally {
      setBtcAddressLoading(false)
    }
  }

  const formatBenefitType = (type) => Object.keys(type)[0] || "Unknown"
  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2)
  const formatTimestamp = (ts) => (ts ? new Date(Number(ts) / 1_000_000).toLocaleString() : "N/A")

  const handleBenefitTypeChange = (e) => {
    const { value, checked } = e.target
    setAcceptedBenefitTypes((prev) => (checked ? [...prev, value] : prev.filter((t) => t !== value)))
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <FontAwesomeIcon icon={faSpinner} spin />
        Loading establishment dashboard...
      </div>
    )
  }

  return (
    <div className="establishment-screen">
      <div className="establishment-header">
        <h2>Establishment Dashboard</h2>
        <p>Welcome, {profile?.name}! Manage your establishment and receive payments.</p>
      </div>

      {error && !establishmentProfile && (
        <div className="message message-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}

      {establishmentProfile ? (
        <>
          {/* Tab Navigation */}
          <div className="establishment-tabs">
            <button
              className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Profile & Statement</span>
            </button>
            <button
              className={`tab-button ${activeTab === "payment" ? "active" : ""}`}
              onClick={() => setActiveTab("payment")}
            >
              <FontAwesomeIcon icon={faQrcode} />
              <span>Generate Payment</span>
            </button>
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="tab-content">
              <div className="establishment-profile-grid">
                {/* Establishment Info Card */}
                <div className="dashboard-card establishment-info-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <FontAwesomeIcon icon={faStore} />
                    </div>
                    <div>
                      <h3>Establishment Information</h3>
                      <p>Registration data and statistics</p>
                    </div>
                  </div>

                  <div className="establishment-details">
                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon={faBuilding} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Name</span>
                        <span className="detail-value">{establishmentProfile.name}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon={faGlobe} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Country</span>
                        <span className="detail-value">{establishmentProfile.country}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon={faHashtag} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Code</span>
                        <span className="detail-value">{establishmentProfile.businessCode}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon={faWallet} />
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Total Received</span>
                        <span className="detail-value total-received">
                          R$ {formatAmount(establishmentProfile.totalReceived)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions History Card */}
                <div className="dashboard-card transactions-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <FontAwesomeIcon icon={faHistory} />
                    </div>
                    <div>
                      <h3>Transaction History</h3>
                      <p>Latest payments received</p>
                    </div>
                  </div>

                  {transactionHistory.length > 0 ? (
                    <div className="transactions-list">
                      {transactionHistory.map((tx) => {
                        const benefitTypeKey = formatBenefitType(tx.benefitType)
                        return (
                          <div key={tx.id} className="transaction-item">
                            <div className="transaction-icon">
                              <FontAwesomeIcon icon={benefitIcons[benefitTypeKey] || faReceipt} />
                            </div>
                            <div className="transaction-details">
                              <div className="transaction-description">{tx.description}</div>
                              <div className="transaction-meta">
                                <span className="transaction-worker">
                                  From: {tx.workerId.toText().substring(0, 15)}...
                                </span>
                                <span className="transaction-type">
                                  {benefitLabels[benefitTypeKey] || benefitTypeKey}
                                </span>
                                <span className="transaction-time">{formatTimestamp(tx.createdAt)}</span>
                              </div>
                            </div>
                            <div className="transaction-amount credit">+ R$ {formatAmount(tx.amount)}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <FontAwesomeIcon icon={faReceipt} />
                      </div>
                      <p>No transactions received yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab Content */}
          {activeTab === "payment" && (
            <div className="tab-content">
              <div className="payment-grid">
                {/* Payment Generation Card */}
                <div className="dashboard-card payment-generation-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                    <div>
                      <h3>Generate Payment (ICP)</h3>
                      <p>Create a QR Code to receive payments</p>
                    </div>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="payment-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="workerPrincipal">
                          <FontAwesomeIcon icon={faUser} />
                          Worker's Principal (reference)
                        </label>
                        <input
                          type="text"
                          id="workerPrincipal"
                          value={workerPrincipalInput}
                          onChange={(e) => setWorkerPrincipalInput(e.target.value)}
                          placeholder="Worker's Principal"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="paymentAmount">
                          <FontAwesomeIcon icon={faCoins} />
                          Amount (ICP)
                        </label>
                        <input
                          type="number"
                          id="paymentAmount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          step="0.01"
                          required
                          placeholder="Ex: 25.50"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="benefitType">Benefit Type</label>
                      <select
                        id="benefitType"
                        value={benefitType}
                        onChange={(e) => setBenefitType(e.target.value)}
                        className="form-select"
                      >
                        <option value="Food">Food</option>
                        <option value="Culture">Culture</option>
                        <option value="Health">Health</option>
                        <option value="Transport">Transport</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">
                        <FontAwesomeIcon icon={faReceipt} />
                        Description
                      </label>
                      <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Lunch purchase"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={paymentLoading || showQrCode}
                        className="btn btn-primary generate-qr-button"
                      >
                        {paymentLoading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faQrcode} />
                            Generate Payment QR Code
                          </>
                        )}
                      </button>
                    </div>

                    {paymentMessage && (
                      <div
                        className={`message ${
                          paymentMessage.startsWith("Failed") ? "message-error" : "message-success"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={paymentMessage.startsWith("Failed") ? faExclamationTriangle : faCheckCircle}
                        />
                        {paymentMessage}
                      </div>
                    )}

                    {showQrCode && qrCodeData && (
                      <div className="qr-code-display">
                        <div className="qr-code-header">
                          <h4>Payment QR Code</h4>
                          <button type="button" onClick={() => setShowQrCode(false)} className="close-qr-button">
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                        <div className="qr-code-container">
                          <QRCode value={qrCodeData} size={200} />
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary copy-qr-button"
                          style={{ marginTop: "1rem" }}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(qrCodeData)
                              setCopyQrFeedback("QR code data copied to clipboard!")
                              setTimeout(() => setCopyQrFeedback(""), 2000)
                            } catch (err) {
                              setCopyQrFeedback("Failed to copy QR code data.")
                              setTimeout(() => setCopyQrFeedback(""), 2000)
                            }
                          }}
                        >
                          Copy QR Code Data
                        </button>
                        {copyQrFeedback && (
                          <div className={`message ${copyQrFeedback.startsWith("Failed") ? "message-error" : "message-success"}`} style={{ marginTop: "0.5rem" }}>
                            <FontAwesomeIcon icon={copyQrFeedback.startsWith("Failed") ? faExclamationTriangle : faCheckCircle} />
                            {copyQrFeedback}
                          </div>
                        )}
                        <p className="qr-instructions">Ask the worker to scan this code</p>
                      </div>
                    )}
                  </form>
                </div>

                {/* Bitcoin Card */}
                <div className="dashboard-card bitcoin-card">
                  <div className="card-header">
                    <div className="card-icon bitcoin-icon">
                      <FontAwesomeIcon icon={faBtc} />
                    </div>
                    <div>
                      <h3>Bitcoin (BTC) Integration</h3>
                      <p>Receive payments in Bitcoin</p>
                    </div>
                  </div>

                  {establishmentProfile.btcAddress ? (
                    <div className="bitcoin-info">
                      <div className="bitcoin-address">
                        <label>Bitcoin Address:</label>
                        <div className="address-display">
                          <span className="address-text">{establishmentProfile.btcAddress}</span>
                        </div>
                      </div>
                      <div className="bitcoin-balance">
                        <label>Bitcoin Balance:</label>
                        <div className="balance-display">
                          {btcBalanceLoading ? (
                            <span className="loading-text">
                              <FontAwesomeIcon icon={faSpinner} spin />
                              Loading...
                            </span>
                          ) : (
                            <span className="balance-amount">{btcBalance}</span>
                          )}
                        </div>
                      </div>
                      {btcBalanceMessage && (
                        <div className="message message-error">
                          <FontAwesomeIcon icon={faExclamationTriangle} />
                          {btcBalanceMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bitcoin-setup">
                      <p>To accept Bitcoin payments, generate a BTC address for your establishment.</p>
                      <button
                        onClick={handleGenerateBtcAddress}
                        disabled={btcAddressLoading}
                        className="btn btn-primary bitcoin-generate-button"
                      >
                        {btcAddressLoading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faBtc} />
                            Generate Bitcoin Address
                          </>
                        )}
                      </button>
                      {btcAddressMessage && (
                        <div
                          className={`message ${
                            btcAddressMessage.startsWith("Failed") ? "message-error" : "message-success"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={btcAddressMessage.startsWith("Failed") ? faExclamationTriangle : faCheckCircle}
                          />
                          {btcAddressMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Registration Form */
        <div className="dashboard-card registration-card">
          <div className="card-header">
            <div className="card-icon">
              <FontAwesomeIcon icon={faStore} />
            </div>
            <div>
              <h3>Register your Establishment</h3>
              <p>Complete the registration to start receiving payments</p>
            </div>
          </div>

          <form onSubmit={handleRegisterEstablishment} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registerName">
                  <FontAwesomeIcon icon={faBuilding} />
                  Establishment Name
                </label>
                <input
                  type="text"
                  id="registerName"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Ex: João's Restaurant"
                />
              </div>

              <div className="form-group">
                <label htmlFor="registerCountry">
                  <FontAwesomeIcon icon={faGlobe} />
                  Country
                </label>
                <input
                  type="text"
                  id="registerCountry"
                  value={registerCountry}
                  onChange={(e) => setRegisterCountry(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Ex: Brazil"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="registerBusinessCode">
                <FontAwesomeIcon icon={faHashtag} />
                Business Code
              </label>
              <input
                type="text"
                id="registerBusinessCode"
                value={registerBusinessCode}
                onChange={(e) => setRegisterBusinessCode(e.target.value)}
                required
                className="form-input"
                placeholder="Ex: REST001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerWalletPrincipal">
                <FontAwesomeIcon icon={faWallet} />
                Wallet Principal (auto-filled)
              </label>
              <input
                type="text"
                id="registerWalletPrincipal"
                value={registerWalletPrincipal}
                readOnly
                className="form-input readonly-input"
              />
            </div>

            <div className="form-group">
              <label>Accepted Benefit Types</label>
              <div className="benefit-types-grid">
                {["Food", "Culture", "Health", "Transport", "Education"].map((type) => (
                  <label key={type} className="benefit-type-checkbox">
                    <input
                      type="checkbox"
                      value={type}
                      checked={acceptedBenefitTypes.includes(type)}
                      onChange={handleBenefitTypeChange}
                    />
                    <div className="checkbox-content">
                      <FontAwesomeIcon icon={benefitIcons[type]} />
                      <span>{benefitLabels[type]}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={registerLoading} className="btn btn-primary register-button">
                {registerLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Registering...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faStore} />
                    Register Establishment
                  </>
                )}
              </button>
            </div>

            {registerMessage && (
              <div className={`message ${registerMessage.startsWith("Failed") ? "message-error" : "message-success"}`}>
                <FontAwesomeIcon icon={registerMessage.startsWith("Failed") ? faExclamationTriangle : faCheckCircle} />
                {registerMessage}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

export default EstablishmentDashboard
