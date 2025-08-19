import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthClientContext";
import { Loader2, AlertTriangle, Wallet, DollarSign, ArrowUp, CheckCircle } from "lucide-react";

export default function HRFundsManagement() {
  const { actors } = useAuth();
  const [availableFunds, setAvailableFunds] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMessage, setDepositMessage] = useState({ text: "", type: "" });
  const [depositLoading, setDepositLoading] = useState(false);
  const [isLoadingFunds, setIsLoadingFunds] = useState(true);

  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);

  const fetchFunds = useCallback(async () => {
    if (!actors?.benefits_manager) return;
    setIsLoadingFunds(true);
    try {
      const fundsResult = await actors.benefits_manager.getAvailableFunds();
      setAvailableFunds(Number(fundsResult));
    } catch (error) {
      console.error("Error fetching funds:", error);
      setDepositMessage({ text: "Failed to load available funds.", type: "error" });
    } finally {
      setIsLoadingFunds(false);
    }
  }, [actors]);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!actors?.benefits_manager) {
        setDepositMessage({ text: "Error: Benefits manager actor not available.", type: "error" });
        return;
    }
    setDepositLoading(true);
    setDepositMessage({ text: "", type: "" });
    try {
      const amountInNats = BigInt(Math.floor(parseFloat(depositAmount) * 10000));
      const result = await actors.benefits_manager.depositFunds(amountInNats);
      if (result.ok) {
        setDepositMessage({ text: `Successfully deposited $${depositAmount}.`, type: "success" });
        setDepositAmount("");
        fetchFunds(); // Refresh funds after deposit
      } else {
        setDepositMessage({ text: `Failed to deposit: ${result.err}`, type: "error" });
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      setDepositMessage({ text: "An unexpected error occurred during deposit.", type: "error" });
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-green-100 text-green-600 p-3 rounded-full">
          <Wallet size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Fundos da Empresa</h3>
          <p className="text-sm text-gray-500">Deposite e visualize os fundos disponíveis.</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Disponível</p>
        {isLoadingFunds ? (
          <Loader2 className="animate-spin text-blue-500 mx-auto" />
        ) : (
          <p className="text-3xl font-bold text-gray-800">${formatAmount(availableFunds)}</p>
        )}
      </div>

      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">
            Valor do Depósito (em ICP)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="depositAmount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              required
              disabled={depositLoading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={depositLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
        >
          {depositLoading ? <Loader2 className="animate-spin" /> : <ArrowUp size={16} />}
          {depositLoading ? "Processando..." : "Depositar Fundos"}
        </button>
      </form>

      {depositMessage.text && (
        <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
            depositMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {depositMessage.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span>{depositMessage.text}</span>
        </div>
      )}
    </div>
  );
}
