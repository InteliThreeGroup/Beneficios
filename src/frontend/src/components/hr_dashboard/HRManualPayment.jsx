import React, { useState } from 'react';
import { useAuth } from '../AuthClientContext';
import { Principal } from '@dfinity/principal';
import { Loader2, AlertTriangle, CheckCircle, Banknote, User, Coins, FileText } from 'lucide-react';

const benefitOptions = [
    { key: "Food", label: "Alimentação" },
    { key: "Culture", label: "Cultura" },
    { key: "Health", label: "Saúde" },
    { key: "Transport", label: "Transporte" },
    { key: "Education", label: "Educação" },
];

export default function HRManualPayment() {
    const { actors } = useAuth();
    const [workerPrincipal, setWorkerPrincipal] = useState('');
    const [amount, setAmount] = useState('');
    const [benefitType, setBenefitType] = useState('Food');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const worker = Principal.fromText(workerPrincipal);
            const amountInNats = BigInt(Math.floor(parseFloat(amount) * 10000));
            // Usando creditBalance que é a função correta para pagamentos manuais
            const result = await actors.wallets.creditBalance(
                worker,                    // workerId: Principal
                { [benefitType]: null },   // benefitType: BenefitType  
                amountInNats,             // amount: Nat
                "manual_payment",         // programId: Text
                description               // description: Text
            );
            if (result.ok) {
                setMessage({ text: `Pagamento de $${amount} para ${workerPrincipal.substring(0,10)}... realizado!`, type: 'success' });
                setWorkerPrincipal(''); setAmount(''); setDescription('');
            } else {
                setMessage({ text: `Erro: ${result.err}`, type: 'error' });
            }
        } catch (error) {
            console.error("Error making manual payment:", error);
            setMessage({ text: 'Principal inválido ou erro inesperado.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Pagamento Manual Avulso</h3>
            <form onSubmit={handlePayment} className="space-y-4">
                <div>
                    <label htmlFor="mpWorkerPrincipal" className="block text-sm font-medium text-gray-700">Principal do Trabalhador</label>
                    <div className="mt-1 relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" id="mpWorkerPrincipal" value={workerPrincipal} onChange={(e) => setWorkerPrincipal(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="aaaaa-aaaaa-..." />
                    </div>
                </div>
                <div>
                    <label htmlFor="mpAmount" className="block text-sm font-medium text-gray-700">Valor (ICP)</label>
                    <div className="mt-1 relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="number" id="mpAmount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="0.00" step="0.01"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="mpBenefitType" className="block text-sm font-medium text-gray-700">Tipo de Benefício</label>
                    <select id="mpBenefitType" value={benefitType} onChange={(e) => setBenefitType(e.target.value)} className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-lg">
                        {benefitOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="mpDescription" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <div className="mt-1 relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" id="mpDescription" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Bônus de performance"/>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Banknote size={16} />}
                    {loading ? "Enviando..." : "Enviar Pagamento"}
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
