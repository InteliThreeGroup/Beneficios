import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthClientContext';
import { Principal } from '@dfinity/principal';
import { Loader2, AlertTriangle, CheckCircle, UserPlus, User, ClipboardList } from 'lucide-react';

export default function HRAssignWorker() {
    const { actors, profile } = useAuth();
    const [workerPrincipal, setWorkerPrincipal] = useState('');
    const [programId, setProgramId] = useState('');
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [programsLoading, setProgramsLoading] = useState(true);

    const fetchPrograms = useCallback(async () => {
        if (!actors?.benefits_manager || !profile?.companyId?.[0]) return;
        setProgramsLoading(true);
        try {
            const companyId = profile.companyId[0];
            const result = await actors.benefits_manager.getCompanyBenefitPrograms(companyId);
            setAvailablePrograms(result);
            if (result.length > 0) setProgramId(result[0].id);
        } catch (error) {
            console.error("Error loading programs:", error);
            setMessage({ text: "Falha ao carregar programas.", type: "error" });
        } finally {
            setProgramsLoading(false);
        }
    }, [actors, profile]);

    useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const worker = Principal.fromText(workerPrincipal);
            const result = await actors.benefits_manager.assignWorkerToBenefit(worker, programId, []);
            if (result.ok) {
                setMessage({ text: 'Trabalhador atribuído com sucesso!', type: 'success' });
                setWorkerPrincipal('');
            } else {
                setMessage({ text: `Erro: ${result.err}`, type: 'error' });
            }
        } catch (error) {
            console.error("Error assigning worker:", error);
            setMessage({ text: 'Principal inválido ou erro inesperado.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Atribuir Trabalhador a Programa</h3>
            <form onSubmit={handleAssign} className="space-y-4">
                <div>
                    <label htmlFor="workerPrincipal" className="block text-sm font-medium text-gray-700">Principal do Trabalhador</label>
                    <div className="mt-1 relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" id="workerPrincipal" value={workerPrincipal} onChange={(e) => setWorkerPrincipal(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="aaaaa-aaaaa-..." />
                    </div>
                </div>
                <div>
                    <label htmlFor="programId" className="block text-sm font-medium text-gray-700">Programa de Benefício</label>
                    <div className="mt-1 relative">
                        <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select id="programId" value={programId} onChange={(e) => setProgramId(e.target.value)} required disabled={programsLoading || availablePrograms.length === 0} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none">
                            {programsLoading ? <option>Carregando programas...</option> :
                             availablePrograms.length > 0 ?
                             availablePrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>) :
                             <option>Nenhum programa disponível</option>
                            }
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={loading || availablePrograms.length === 0} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={16} />}
                    {loading ? "Atribuindo..." : "Atribuir Trabalhador"}
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
