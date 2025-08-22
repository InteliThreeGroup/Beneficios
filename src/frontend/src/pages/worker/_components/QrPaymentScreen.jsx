// src/components/QrPaymentScreen.jsx

import { useState } from "react";
import { useAuth } from "../../auth/AuthClientContext";
import { Principal } from "@dfinity/principal";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { useNavigate } from "react-router-dom";
import { X, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export function QrPaymentScreen() {
  const { actors, principal } = useAuth();
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' or 'error'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualLink, setManualLink] = useState(""); // For pasting link on desktop

  const handleManualLink = () => {
    if (!manualLink.trim()) {
      setMessage({ text: "Please paste the payment link.", type: "error" });
      return;
    }

    try {
      // Extract data from link
      const url = new URL(manualLink);
      const data = url.searchParams.get('data');
      
      if (!data) {
        setMessage({ text: "Invalid link - data not found.", type: "error" });
        return;
      }

      const decodedData = decodeURIComponent(data);
      const parsedData = JSON.parse(decodedData);
      
      // Basic link validation
      if (!parsedData.establishmentId || typeof parsedData.amount !== "number" || !parsedData.benefitType) {
        setMessage({ text: "Invalid or incomplete link.", type: "error" });
        return;
      }
      
      setScanResult(parsedData);
      setIsModalOpen(true);
      setManualLink(""); // Clear field after processing
    } catch (error) {
      setMessage({ text: "Error processing the link. Please check if it is correct.", type: "error" });
    }
  };

  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);

  const handleScan = (result) => {
    if (result) {
      try {
        const data = JSON.parse(result.text);
        // Basic QR code validation
        if (!data.establishmentId || typeof data.amount !== "number" || !data.benefitType) {
          setMessage({ text: "Invalid or incomplete QR Code.", type: "error" });
          return;
        }
        setScanResult(data);
        setIsModalOpen(true);
      } catch (error) {
        setMessage({ text: "Error reading QR Code. Invalid format.", type: "error" });
      }
    }
  };

  const handlePayment = async () => {
    if (!scanResult) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    setIsModalOpen(false); // Close modal when starting payment

    try {
      const establishmentPrincipal = Principal.fromText(scanResult.establishmentId);
      const amountInNats = BigInt(Math.floor(scanResult.amount * 10000));

      // First, validate if the establishment exists and accepts this benefit type
      try {
        const validation = await actors.establishment.validatePayment(
          establishmentPrincipal, 
          { [scanResult.benefitType]: null }, 
          amountInNats
        );
        
        if (!validation.isValid) {
          setMessage({ 
            text: `Payment cannot be processed: ${validation.reason?.[0] || "Invalid establishment"}`, 
            type: "error" 
          });
          return;
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        setMessage({ 
          text: "Error validating establishment. Check if it is registered in the system.", 
          type: "error" 
        });
        return;
      }

      const debitRequest = {
        workerId: principal,
        establishmentId: establishmentPrincipal,
        establishmentName: scanResult.description || "Establishment",
        benefitType: { [scanResult.benefitType]: null },
        amount: amountInNats,
        description: scanResult.description || "Payment via QR Code",
      };

      const debitResult = await actors.wallets.debitBalance(debitRequest);

      if (debitResult.ok) {
        setMessage({ text: `Payment of $ ${formatAmount(amountInNats)} completed successfully!`, type: "success" });
        setTimeout(() => navigate("/carteira"), 2000); // Go back to wallet after success
      } else {
        setMessage({ text: `Payment failed: ${debitResult.err}`, type: "error" });
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setMessage({ text: `Unexpected error: ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
      setScanResult(null); // Clear result after attempt
    }
  };

  // If modal is open, do not show scanner
  if (isModalOpen && scanResult) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Confirm Payment</h2>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-800">$ {formatAmount(scanResult.amount * 10000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Establishment</span>
                <span className="font-semibold text-gray-700">{scanResult.description}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-700">{new Date().toLocaleDateString('en-US')}</span>
              </div>
            </div>
            <div className="mt-10 space-y-3">
              <button onClick={handlePayment} disabled={loading} className="w-full py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center">
                {loading ? <Loader2 className="animate-spin" /> : "Pay"}
              </button>
               <button onClick={() => { setIsModalOpen(false); setScanResult(null); }} disabled={loading} className="w-full py-4 border-2 border-gray-300 text-gray-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 font-sans">
      <div className="w-full flex justify-end">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-800">
          <X size={28} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800">Make Payment</h1>
        <p className="text-gray-500 mt-2">Scan the QR Code or paste the payment link</p>
        
        {message.text && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                <span>{message.text}</span>
            </div>
        )}

        {/* QR Scanner - Mobile only */}
        <div className="md:hidden">
          <div className="w-64 h-64 border-4 border-blue-500 rounded-3xl my-8 overflow-hidden">
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: "environment" }}
              videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Manual link field - Desktop and Mobile */}
        <div className="w-full max-w-md mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {window.innerWidth >= 768 ? "Paste the payment link:" : "Or paste the link here:"}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
                placeholder="http://localhost:3000/payment?data=..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleManualLink}
                disabled={!manualLink.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Pay
              </button>
            </div>
          </div>
        </div>

        {/* Additional instructions for desktop */}
        <div className="hidden md:block mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 On desktop, you can directly paste the payment link generated by the establishment
          </p>
        </div>
      </div>
    </div>
  );
}