import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../pages/auth/AuthClientContext";
import { Loader2, AlertTriangle, List, Trophy, ChevronDown, ChevronUp, Clock, Check, X, User, MessageSquare, Link as LinkIcon } from "lucide-react";

// Componente para uma única submissão (sem alterações)
const SubmissionItem = ({ submission, onReview }) => {
    const [loading, setLoading] = useState(false);

    const handleReview = async (approve) => {
        setLoading(true);
        await onReview(submission.id, approve);
        setLoading(false);
    };

    return (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold flex items-center gap-2"><User size={14}/> {submission.workerName}</p>
                    {submission.submissionContent && <p className="text-sm text-gray-600 mt-1 flex items-start gap-2"><MessageSquare size={14} className="mt-1"/> "{submission.submissionContent}"</p>}
                </div>
                <div className="flex items-center gap-2">
                    {submission.status && 'Pending' in submission.status && !loading && (
                        <>
                            <button onClick={() => handleReview(false)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><X size={16}/></button>
                            <button onClick={() => handleReview(true)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={16}/></button>
                        </>
                    )}
                    {loading && <Loader2 className="animate-spin text-gray-500" />}
                    {submission.status && 'Approved' in submission.status && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">APROVADO</span>}
                    {submission.status && 'Rejected' in submission.status && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">REJEITADO</span>}
                </div>
            </div>
        </div>
    );
};

// Componente para um único desafio na lista (sem alterações)
const ChallengeItem = ({ challenge, actors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSubmissions = useCallback(async () => {
        if (!isOpen) return;
        setLoading(true);
        try {
            const result = await actors.challenges.getSubmissionsForChallenge(challenge.id);
            setSubmissions(result);
        } catch (error) {
            console.error("Erro ao buscar submissões:", error);
        } finally {
            setLoading(false);
        }
    }, [isOpen, actors, challenge.id]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleReviewSubmission = async (submissionId, approve) => {
        try {
            console.log("=== DEBUG REVIEW SUBMISSION ===");
            console.log("submissionId:", JSON.stringify(submissionId), "type:", typeof submissionId);
            console.log("approve:", JSON.stringify(approve), "type:", typeof approve);
            
            // Garantir que submissionId é string e approve é boolean
            const cleanSubmissionId = String(submissionId || "").trim();
            const cleanApprove = Boolean(approve);
            
            if (!cleanSubmissionId) {
                throw new Error("ID da submissão inválido");
            }
            
            console.log("cleanSubmissionId:", JSON.stringify(cleanSubmissionId), "type:", typeof cleanSubmissionId);
            console.log("cleanApprove:", JSON.stringify(cleanApprove), "type:", typeof cleanApprove);
            
            const result = await actors.challenges.approveOrRejectSubmissionSimple(cleanSubmissionId, cleanApprove);
            if ('ok' in result) {
                fetchSubmissions(); 
                alert(`Submissão ${approve ? 'aprovada' : 'rejeitada'} com sucesso!`);
            } else {
                throw new Error(result.err);
            }
        } catch (error) {
            console.error("Erro ao revisar submissão:", error);
            alert(`Falha ao revisar: ${error.message}`);
        }
    };

    const deadline = new Date(Number(challenge.deadline / 1000000n));

    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full"><Trophy className="text-blue-500" /></div>
                    <div>
                        <p className="font-semibold">{challenge.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14}/> Termina em: {deadline.toLocaleDateString()} às {deadline.toLocaleTimeString()}</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {isOpen && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin"/></div>}
                    {!loading && submissions.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm mb-2">Submissões ({submissions.length})</h4>
                            {submissions.map(sub => <SubmissionItem key={sub.id} submission={sub} onReview={handleReviewSubmission} />)}
                        </div>
                    )}
                    {!loading && submissions.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhuma submissão ainda.</p>}
                </div>
            )}
        </div>
    );
};

// Componente principal que lista todos os desafios (COM ALTERAÇÕES)
export default function HRChallengeList() {
  const { actors, profile } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChallenges = useCallback(async () => {
    // --- LOGS DE DEPURAÇÃO ADICIONADOS ---
    console.log("--- Iniciando busca por desafios (fetchChallenges) ---");

    if (!actors?.challenges) {
      console.warn("LOG DE AVISO: O ator 'actors.challenges' ainda não está disponível.");
      setLoading(false);
      return;
    }
    if (!profile) {
      console.warn("LOG DE AVISO: O perfil do usuário (profile) ainda não foi carregado.");
      setLoading(false);
      return;
    }
    if (!profile.companyId || profile.companyId.length === 0) {
      console.error("LOG DE ERRO: O 'companyId' não foi encontrado no perfil do usuário.", profile);
      setError("ID da empresa não encontrado no seu perfil.");
      setLoading(false);
      return;
    }
    // --- FIM DOS LOGS DE DEPURAÇÃO ---

    setLoading(true);
    setError("");
    try {
      const companyId = profile.companyId[0];
      console.log(`%cBuscando desafios para a empresa: ${companyId}`, "color: blue; font-weight: bold;");

      const result = await actors.challenges.getActiveChallenges(companyId);
      console.log("Resultado recebido do backend:", result);

      setChallenges(result);
    } catch (error) {
      console.error("Erro crítico ao carregar desafios:", error);
      setError("Falha ao carregar desafios.");
    } finally {
      setLoading(false);
    }
  }, [actors, profile]);

  useEffect(() => {
    // Log para verificar se o componente está reagindo a mudanças no perfil
    console.log("useEffect do HRChallengeList foi disparado. Perfil atual:", profile);
    fetchChallenges();
  }, [fetchChallenges]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><List size={24} /></div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Desafios Ativos</h3>
          <p className="text-sm text-gray-500">Veja e gerencie os desafios em andamento.</p>
        </div>
      </div>
      {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-600"/></div>}
      {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-3"><AlertTriangle size={16}/> {error}</div>}
      {!loading && !error && (
        challenges.length > 0 ? (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <ChallengeItem key={challenge.id} challenge={challenge} actors={actors} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Trophy size={40} className="mx-auto mb-2"/>
            <p>Nenhum desafio ativo encontrado.</p>
            <p className="text-sm">Crie seu primeiro desafio para começar.</p>
          </div>
        )
      )}
    </div>
  );
}
