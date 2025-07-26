"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthClientContext"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUtensils,
  faBookOpen,
  faHeartbeat,
  faBus,
  faGraduationCap,
  faQrcode,
  faSpinner,
  faExclamationTriangle,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons"

const WalletScreen = () => {
  const { actors, principal, profile } = useAuth()
  const navigate = useNavigate()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const getBenefitIcon = (type) => {
    switch (type) {
      case "Food":
        return faUtensils
      case "Culture":
        return faBookOpen
      case "Health":
        return faHeartbeat
      case "Transport":
        return faBus
      case "Education":
        return faGraduationCap
      default:
        return faQrcode
    }
  }

  const getBenefitLabel = (type) => {
    switch (type) {
      case "Food":
        return "Food"
      case "Culture":
        return "Culture"
      case "Health":
        return "Health"
      case "Transport":
        return "Mobility"
      case "Education":
        return "Education"
      default:
        return type
    }
  }

  const getBenefitColor = (type) => {
    switch (type) {
      case "Food":
        return "#2196F3"
      case "Culture":
        return "#9C27B0"
      case "Health":
        return "#4CAF50"
      case "Transport":
        return "#FF9800"
      case "Education":
        return "#F44336"
      default:
        return "#2196F3"
    }
  }

  const fetchData = useCallback(async () => {
    if (!actors || !actors.wallets || !principal) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      const walletResult = await actors.wallets.getWallet(principal)
      if (walletResult.ok) {
        setWallet(walletResult.ok)
      } else {
        setError(`Error fetching wallet: ${walletResult.err}`)
      }

      const txHistoryResult = await actors.wallets.getTransactionHistory(principal, [BigInt(10)])
      setTransactions(txHistoryResult)
    } catch (err) {
      console.error("Error fetching worker data:", err)
      setError("Failed to load wallet data.")
    } finally {
      setLoading(false)
    }
  }, [actors, principal])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatBenefitType = (type) => Object.keys(type)[0] || "Unknown"
  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2)
  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) / 1_000_000)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1_000_000)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    }
  }

  const groupTransactionsByDate = (txs) => {
    return txs.reduce((acc, tx) => {
      const dateKey = formatDate(tx.timestamp)
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(tx)
      return acc
    }, {})
  }

  if (loading) {
    return (
      <div className="mobile-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Loading wallet...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mobile-error">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <p>{error}</p>
      </div>
    )
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <div className="mobile-wallet-screen">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-top">
          <h1 className="mobile-title">Wallet</h1>
          <div className="mobile-header-actions">
            <button className="mobile-notification-btn">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <div className="mobile-avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
          </div>
        </div>
        <h2 className="mobile-subtitle">Benefits</h2>
        <p className="mobile-section-title">My Balances</p>
      </div>

      {/* Balance Cards */}
      <div className="mobile-balance-section">
        {wallet?.balances && wallet.balances.length > 0 ? (
          <div className="mobile-balance-cards">
            {wallet.balances.map((b) => {
              const benefitType = formatBenefitType(b.benefitType)
              const color = getBenefitColor(benefitType)
              return (
                <div key={benefitType} className="mobile-balance-card">
                  <div className="mobile-balance-icon" style={{ backgroundColor: color }}>
                    <FontAwesomeIcon icon={getBenefitIcon(benefitType)} />
                  </div>
                  <div className="mobile-balance-info">
                    <span className="mobile-balance-type">{getBenefitLabel(benefitType)}</span>
                    <span className="mobile-balance-amount">$ {formatAmount(b.balance)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mobile-empty-balances">
            <p>No benefit balance found.</p>
          </div>
        )}
      </div>

      {/* Extract Section */}
      <div className="mobile-extract-section">
        <div className="mobile-extract-header">
          <h3 className="mobile-extract-title">Statement</h3>
          <button className="mobile-see-more">See More</button>
        </div>

        {Object.keys(groupedTransactions).length > 0 ? (
          <div className="mobile-transactions">
            {Object.entries(groupedTransactions).map(([date, dailyTransactions]) => (
              <div key={date} className="mobile-transaction-group">
                <div className="mobile-transaction-date">{date}</div>
                {dailyTransactions.map((tx) => {
                  const benefitType = formatBenefitType(tx.benefitType)
                  const color = getBenefitColor(benefitType)
                  const isCredit = Object.keys(tx.transactionType)[0] === "Credit"
                  return (
                    <div key={tx.id} className="mobile-transaction-item">
                      <div className="mobile-transaction-icon" style={{ backgroundColor: color }}>
                        <FontAwesomeIcon icon={getBenefitIcon(benefitType)} />
                      </div>
                      <div className="mobile-transaction-details">
                        <div className="mobile-transaction-name">{tx.description}</div>
                        <div className="mobile-transaction-category">{getBenefitLabel(benefitType)}</div>
                      </div>
                      <div className="mobile-transaction-right">
                        <div className={`mobile-transaction-amount ${isCredit ? "credit" : "debit"}`}>
                          {isCredit ? "" : "-"} $ {formatAmount(tx.amount)}
                        </div>
                        <div className="mobile-transaction-time">{formatTime(tx.timestamp)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="mobile-empty-transactions">
            <p>No transactions found.</p>
          </div>
        )}
      </div>

      {/* QR Code Button */}
      <div className="mobile-qr-section">
        <button onClick={() => navigate("/pagar-qr")} className="mobile-qr-button">
          <FontAwesomeIcon icon={faQrcode} />
        </button>
      </div>
    </div>
  )
}

export default WalletScreen
