"use client"

import { useState } from "react"
import { useAuth } from "./AuthClientContext"
import { Principal } from "@dfinity/principal"
import { QrReader } from "@blackbox-vision/react-qr-reader"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faQrcode,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons"

const QrPaymentScreen = () => {
  const { actors, principal } = useAuth()
  const navigate = useNavigate()

  const [qrCodeInput, setQrCodeInput] = useState("")
  const [qrPaymentLoading, setQrPaymentLoading] = useState(false)
  const [qrPaymentMessage, setQrPaymentMessage] = useState("")
  const [showQrScanner, setShowQrScanner] = useState(true)
  const [scanError, setScanError] = useState("")
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState(null)

  const formatAmount = (amount) => {
    const numAmount = typeof amount === "bigint" ? Number(amount) : Number(amount)
    return (numAmount / 10000).toFixed(2)
  }

  const handleConfirmPayment = (data) => {
    try {
      const parsedData = JSON.parse(data)
      if (
        !parsedData.establishmentId ||
        typeof parsedData.amount !== "number" ||
        !parsedData.benefitType ||
        !parsedData.description
      ) {
        setQrPaymentMessage("Error: Invalid or incomplete QR Code data.")
        return
      }
      setPaymentDetails({
        amount: parsedData.amount,
        establishment: parsedData.description,
        date: new Date().toLocaleString("en-US"),
        rawData: data,
      })
      setShowPaymentConfirmation(true)
      setShowQrScanner(false)
    } catch (err) {
      setQrPaymentMessage("Error parsing QR Code data. Check the format.")
      console.error("Parse error for confirmation:", err)
    }
  }

  const processPaymentFromData = async (data) => {
    setQrPaymentLoading(true)
    setQrPaymentMessage("")
    setShowPaymentConfirmation(false)

    if (!actors || !actors.wallets) {
      setQrPaymentMessage("Error: Wallet module not loaded.")
      setQrPaymentLoading(false)
      return
    }

    try {
      const parsedData = JSON.parse(data)
      const establishmentPrincipal = Principal.fromText(parsedData.establishmentId)
      const selectedBenefitType = { [parsedData.benefitType]: null }
      const amountInNats = BigInt(Math.floor(parsedData.amount * 10000))

      const walletDebitRequest = {
        workerId: principal,
        establishmentId: establishmentPrincipal,
        establishmentName: parsedData.description,
        benefitType: selectedBenefitType,
        amount: amountInNats,
        description: parsedData.description,
      }
      const debitResult = await actors.wallets.debitBalance(walletDebitRequest)

      if (debitResult.ok) {
        setQrPaymentMessage(`Payment of $ ${formatAmount(amountInNats)} processed successfully!`)
        setTimeout(() => {
          navigate("/carteira")
        }, 2000)
      } else {
        setQrPaymentMessage(`Payment failed: ${debitResult.err}`)
      }
    } catch (err) {
      console.error("Error processing payment:", err)
      setQrPaymentMessage(`Unexpected error processing payment: ${err.message}`)
    } finally {
      setQrPaymentLoading(false)
    }
  }

  const handleProcessQrInput = (e) => {
    e.preventDefault()
    handleConfirmPayment(qrCodeInput)
  }

  const handleScan = (result, error) => {
    if (result) {
      handleConfirmPayment(result.text)
      setScanError("")
    }
    if (error && error.name !== "NotFoundException") {
      setScanError(`Scanner error: ${error.name}`)
    }
  }

  return (
    <div className="mobile-qr-screen">
      {/* Mobile Header */}
      <div className="mobile-qr-header">
        <button onClick={() => navigate("/carteira")} className="mobile-back-button">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="mobile-qr-title">{showQrScanner ? "Point the camera at the QR Code" : "Enter the code"}</h1>
      </div>

      {qrPaymentMessage && (
        <div className={`mobile-message ${qrPaymentMessage.includes("successfully") ? "success" : "error"}`}>
          <FontAwesomeIcon icon={qrPaymentMessage.includes("successfully") ? faCheckCircle : faExclamationTriangle} />
          {qrPaymentMessage}
        </div>
      )}

      {showQrScanner ? (
        <div className="mobile-qr-scanner-section">
          {!showPaymentConfirmation && (
            <>
              <div className="mobile-qr-instructions">
                <p>Wait a moment and avoid moving for correct code reading</p>
              </div>

              {scanError && (
                <div className="mobile-message error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {scanError}
                </div>
              )}

              <div className="mobile-qr-scanner-container">
                <div className="mobile-qr-scanner-frame">
                  <QrReader
                    onResult={handleScan}
                    videoStyle={{ width: "100%", height: "100%" }}
                    constraints={{ facingMode: "environment" }}
                    scanDelay={500}
                  />
                </div>
              </div>

              <button onClick={() => setShowQrScanner(false)} className="mobile-manual-input-button">
                Enter Key
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mobile-qr-input-section">
          <div className="mobile-qr-instructions">
            <p>Paste the QR Code content below</p>
          </div>

          <form onSubmit={handleProcessQrInput} className="mobile-qr-input-form">
            <textarea
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              required
              rows="6"
              placeholder='{"establishmentId":"...","amount":...}'
              className="mobile-qr-textarea"
            />
            <button type="submit" disabled={qrPaymentLoading} className="mobile-confirm-button">
              {qrPaymentLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Confirm Payment
                </>
              )}
            </button>
          </form>

          <button onClick={() => setShowQrScanner(true)} className="mobile-back-to-scanner">
            <FontAwesomeIcon icon={faQrcode} />
            Back to Scanner
          </button>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && paymentDetails && (
        <div className="mobile-payment-modal">
          <div className="mobile-modal-content">
            <div className="mobile-modal-header">
              <h3>Confirm Payment</h3>
            </div>

            <div className="mobile-payment-details">
              <div className="mobile-payment-detail">
                <span className="mobile-detail-label">Amount</span>
                <span className="mobile-detail-value">$ {formatAmount(paymentDetails.amount * 10000)}</span>
              </div>
              <div className="mobile-payment-detail">
                <span className="mobile-detail-label">Establishment</span>
                <span className="mobile-detail-value">{paymentDetails.establishment}</span>
              </div>
              <div className="mobile-payment-detail">
                <span className="mobile-detail-label">Date</span>
                <span className="mobile-detail-value">{paymentDetails.date}</span>
              </div>
            </div>

            <div className="mobile-modal-actions">
              <button
                onClick={() => processPaymentFromData(paymentDetails.rawData)}
                disabled={qrPaymentLoading}
                className="mobile-pay-button"
              >
                {qrPaymentLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Confirming...
                  </>
                ) : (
                  "Pay"
                )}
              </button>
              <button onClick={() => setShowPaymentConfirmation(false)} className="mobile-cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QrPaymentScreen
