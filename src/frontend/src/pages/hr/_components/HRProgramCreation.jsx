import { useState } from "react";
import { useAuth } from "../../auth/AuthClientContext";
import { Loader2, AlertTriangle, CheckCircle, PlusCircle, Tag, Coins, Calendar, Clock } from "lucide-react";

const benefitOptions = [
  { key: "Food", label: "Food" },
  { key: "Culture", label: "Culture" },
  { key: "Health", label: "Health" },
  { key: "Transport", label: "Transport" },
  { key: "Education", label: "Education" },
];

export default function HRProgramCreation() {
  const { actors, profile } = useAuth();
  const [programName, setProgramName] = useState("");
  const [benefitType, setBenefitType] = useState("Food");
  const [amountPerWorker, setAmountPerWorker] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [paymentDay, setPaymentDay] = useState("1");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleCreateProgram = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage({ text: "", type: "" });
  
  if (!profile?.companyId?.[0]) {
    setMessage({ text: "Error: Company ID not found in profile.", type: "error" });
    setLoading(false);
    return;
  }
  
  try {
    // Fixing parameter order according to backend signature:
    // createBenefitProgram(name, benefitType, companyId, amountPerWorker, frequency, paymentDay)
    const result = await actors.benefits_manager.createBenefitProgram(
    programName,                                              // name: Text
    { [benefitType]: null },                                 // benefitType: BenefitType
    profile.companyId[0],                                    // companyId: Text
    BigInt(Math.floor(parseFloat(amountPerWorker) * 10000)), // amountPerWorker: Nat
    { [frequency]: null },                                   // frequency: PaymentFrequency
    BigInt(paymentDay)                                       // paymentDay: Nat
    );

    if (result.ok) {
    setMessage({ text: "Program created successfully!", type: "success" });
    setProgramName("");
    setAmountPerWorker("");
    } else {
    setMessage({ text: `Error: ${result.err}`, type: "error" });
    }
  } catch (error) {
    console.error("Error creating program:", error);
    setMessage({ text: "An unexpected error occurred.", type: "error" });
  } finally {
    setLoading(false);
  }
  };

  return (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Program</h3>
    <form onSubmit={handleCreateProgram} className="space-y-4">
    <div>
      <label htmlFor="programName" className="block text-sm font-medium text-gray-700">Program Name</label>
      <div className="mt-1 relative">
      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input type="text" id="programName" value={programName} onChange={(e) => setProgramName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="E.g.: Food Benefit"/>
      </div>
    </div>
    <div>
      <label htmlFor="benefitType" className="block text-sm font-medium text-gray-700">Benefit Type</label>
      <select id="benefitType" value={benefitType} onChange={(e) => setBenefitType(e.target.value)} className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-lg">
      {benefitOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
      </select>
    </div>
    <div>
      <label htmlFor="amountPerWorker" className="block text-sm font-medium text-gray-700">Amount per Worker</label>
      <div className="mt-1 relative">
      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input type="number" id="amountPerWorker" value={amountPerWorker} onChange={(e) => setAmountPerWorker(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="0.00" step="0.01"/>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
      <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
      <div className="mt-1 relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg">
        <option value="Monthly">Monthly</option>
        </select>
      </div>
      </div>
      <div>
      <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700">Payment Day</label>
      <div className="mt-1 relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input type="number" id="paymentDay" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" min="1" max="28"/>
      </div>
      </div>
    </div>
    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2">
      {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={16} />}
      {loading ? "Creating..." : "Create Program"}
    </button>
    {message.text && (
      <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
        message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}>
      {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
      <span>{message.text}</span>
      </div>
    )}
    </form>
  </div>
  );
}
