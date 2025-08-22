import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthClientContext";
import QRCode from "react-qr-code";
import { Loader2, AlertTriangle, QrCode, History, Utensils, BookOpen, HeartPulse, Bus, GraduationCap, Building, Copy, Check, Link } from "lucide-react";

// Mapping of benefits to icons and names
const benefitDetails = {
  Food: { icon: <Utensils className="text-blue-500" />, name: "Food" },
  Culture: { icon: <BookOpen className="text-purple-500" />, name: "Culture" },
  Health: { icon: <HeartPulse className="text-green-500" />, name: "Health" },
  Transport: { icon: <Bus className="text-orange-500" />, name: "Transport" },
  Education: { icon: <GraduationCap className="text-red-500" />, name: "Education" },
  Default: { icon: <Building className="text-gray-500" />, name: "Other" }
};
const getBenefitDetails = (type) => benefitDetails[type] || benefitDetails.Default;
const formatBenefitType = (typeObj) => Object.keys(typeObj)[0] || "Default";
const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);
const formatTime = (timestamp) => new Date(Number(timestamp) / 1_000_000).toLocaleString("en-US");

export default function EstablishmentDashboard() {
  const { actors, principal, profile } = useAuth();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("qrCode");

  // State for QR Code generator
  const [qrAmount, setQrAmount] = useState("");
  const [qrBenefitType, setQrBenefitType] = useState("Food");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchDashboardData = useCallback(async () => {
  if (!actors || !actors.establishment || !principal) {
    setError("Authentication client is not ready.");
    setLoading(false);
    return;
  }
  setLoading(true);
  setError("");
  try {
    // --- FIX APPLIED ---
    // Removed call to 'getEstablishment' which does not exist.
    // Now, only fetch transaction history.
    const historyResult = await actors.establishment.getTransactionHistory([]); // Pass empty array for optional argument
    if (historyResult) {
    setTransactionHistory(historyResult);
    } else {
    setError("Could not load transaction history.");
    }
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    setError("Failed to load transaction history. Try reloading the page.");
  } finally {
    setLoading(false);
  }
  }, [actors, principal]);

  useEffect(() => {
  fetchDashboardData();
  }, [fetchDashboardData]);

  const handleGenerateQrCode = (e) => {
  e.preventDefault();
  const amountNumber = parseFloat(qrAmount);
  if (isNaN(amountNumber) || amountNumber <= 0) {
    alert("Please enter a valid amount.");
    return;
  }
  const qrData = {
    establishmentId: principal.toText(),
    description: profile?.name || "Establishment",
    amount: amountNumber,
    benefitType: qrBenefitType,
  };
  
  const qrDataString = JSON.stringify(qrData);
  setQrCodeValue(qrDataString);
  
  // Generate payment link
  const encodedData = encodeURIComponent(qrDataString);
  const baseUrl = window.location.origin;
  const link = `${baseUrl}/payment?data=${encodedData}`;
  setPaymentLink(link);
  setCopied(false);
  };

  const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Error copying link:', err);
    // Fallback for browsers that do not support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = paymentLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  };

  if (loading) {
  return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  }
  if (error) {
  return <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center gap-3"><AlertTriangle /> {error}</div>;
  }

  return (
  <div className="space-y-8">
    <div>
    <h1 className="text-4xl font-bold text-gray-800">Establishment Dashboard</h1>
    <p className="text-gray-500 mt-1">Generate charges and view your transaction history.</p>
    </div>

    {/* Navigation Tabs */}
    <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
      <button onClick={() => setActiveTab('qrCode')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'qrCode' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
      <QrCode size={16}/> Generate QR Code
      </button>
      <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
      <History size={16}/> History
      </button>
    </nav>
    </div>

    {/* Tab Content */}
    <div>
    {activeTab === 'qrCode' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Generate Charge</h2>
        <form onSubmit={handleGenerateQrCode} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (R$)</label>
          <input type="number" id="amount" value={qrAmount} onChange={(e) => setQrAmount(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00" step="0.01" min="0.01" required
          />
        </div>
        <div>
          <label htmlFor="benefitType" className="block text-sm font-medium text-gray-700">Benefit Type</label>
          <select id="benefitType" value={qrBenefitType} onChange={(e) => setQrBenefitType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
          {Object.keys(benefitDetails).filter(k => k !== 'Default').map(key => (
            <option key={key} value={key}>{benefitDetails[key].name}</option>
          ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700">
          Generate QR Code
        </button>
        </form>
      </div>
      {/* QR Code Viewer */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[300px]">
        {qrCodeValue ? (
        <div className="space-y-6 w-full flex flex-col items-center">
          <QRCode value={qrCodeValue} size={256} />
          
          {/* Payment Link */}
          <div className="w-full max-w-md space-y-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Link</h3>
            <p className="text-sm text-gray-600">Share this link for direct payment:</p>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
            <Link size={20} className="text-gray-500 flex-shrink-0" />
            <input
            type="text"
            value={paymentLink}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
            <button
            onClick={handleCopyLink}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              copied 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            >
            {copied ? (
              <>
              <Check size={16} />
              <span>Copied!</span>
              </>
            ) : (
              <>
              <Copy size={16} />
              <span>Copy</span>
              </>
            )}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            The worker can scan the QR Code or use the link to make the payment
          </div>
          </div>
        </div>
        ) : (
        <div className="text-center text-gray-500">
          <QrCode size={64} className="mx-auto mb-4"/>
          <p>The QR Code will appear here after filling in the data and clicking "Generate".</p>
        </div>
        )}
      </div>
      </div>
    )}

    {activeTab === 'history' && (
      <div className="bg-white p-6 rounded-xl shadow-md">
       <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactionHistory.length > 0 ? transactionHistory.map((tx, index) => {
              const type = formatBenefitType(tx.benefitType);
              const details = getBenefitDetails(type);
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(tx.timestamp)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">{details.icon} {details.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={tx.workerId.toText()}>{tx.workerId.toText().substring(0, 15)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">$ {formatAmount(tx.amount)}</td>
                </tr>
              )
            }) : (
              <tr><td colSpan="4" className="text-center py-10 text-gray-500">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
       </div>
      </div>
    )}
    </div>
  </div>
  );
}
