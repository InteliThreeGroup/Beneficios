import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthClientContext';
import { Principal } from '@dfinity/principal';
import { Loader2, AlertTriangle, CheckCircle, Banknote, User, Coins, FileText } from 'lucide-react';

const benefitOptions = [
    { key: "Food", label: "Food" },
    { key: "Culture", label: "Culture" },
    { key: "Health", label: "Health" },
    { key: "Transport", label: "Transport" },
    { key: "Education", label: "Education" },
];

export default function HRUpdateBenefitAmount() {
    const { actors } = useAuth();
    const [workerPrincipal, setWorkerPrincipal] = useState('');
    const [programId, setProgramId] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleUpdateAmount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const worker = Principal.fromText(workerPrincipal);
            const amountInNats = BigInt(Math.floor(parseFloat(newAmount) * 10000));
            const result = await actors.benefits_manager.updateWorkerBenefitAmount(worker, programId, amountInNats);
            if (result.ok) {
                setMessage({ text: `Amount updated to $${newAmount} for worker ${workerPrincipal.substring(0,10)}...`, type: 'success' });
                setWorkerPrincipal(''); setProgramId(''); setNewAmount('');
            } else {
                setMessage({ text: `Error: ${result.err}`, type: 'error' });
            }
        } catch (error) {
            console.error("Error updating benefit amount:", error);
            setMessage({ text: 'Invalid principal or unexpected error.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Benefit Amount</h3>
            <form onSubmit={handleUpdateAmount} className="space-y-4">
                <div>
                    <label htmlFor="workerPrincipal" className="block text-sm font-medium text-gray-700">Worker Principal</label>
                    <div className="mt-1 relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" id="workerPrincipal" value={workerPrincipal} onChange={(e) => setWorkerPrincipal(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="aaaaa-aaaaa-..." />
                    </div>
                </div>
                <div>
                    <label htmlFor="programId" className="block text-sm font-medium text-gray-700">Program ID</label>
                    <div className="mt-1 relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" id="programId" value={programId} onChange={(e) => setProgramId(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="program_1"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="newAmount" className="block text-sm font-medium text-gray-700">New Amount (ICP)</label>
                    <div className="mt-1 relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="number" id="newAmount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="0.00" step="0.01"/>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-orange-700 disabled:bg-orange-400 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Banknote size={16} />}
                    {loading ? "Updating..." : "Update Amount"}
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
