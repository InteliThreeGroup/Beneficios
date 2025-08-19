import { useState } from "react";
import { useAuth } from "../../pages/auth/AuthClientContext";
import { Loader2, AlertTriangle, CheckCircle, PlusCircle, Trophy, FileText, Calendar, Coins } from "lucide-react";

export default function HRChallengeCreation({ onChallengeCreated }) {
  const { actors, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const validateAndPrepareData = () => {
    // 1. Validate required fields
    if (!title?.trim() || !description?.trim() || !rewardAmount?.trim() || !deadline?.trim()) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // 2. Validate auth context
    if (!actors?.challenges) {
      throw new Error("Conexão com backend não disponível");
    }

    if (!profile?.companyId) {
      throw new Error("ID da empresa não encontrado no perfil");
    }

    // 3. Prepare and validate title (must be valid Text)
    const cleanTitle = String(title).trim();
    if (cleanTitle.length < 3 || cleanTitle.length > 100) {
      throw new Error("Título deve ter entre 3 e 100 caracteres");
    }

    // 4. Prepare and validate description (must be valid Text)
    const cleanDescription = String(description).trim();
    if (cleanDescription.length < 10 || cleanDescription.length > 500) {
      throw new Error("Descrição deve ter entre 10 e 500 caracteres");
    }

    // 5. Prepare and validate companyId (must be valid Text)
    const cleanCompanyId = String(profile.companyId).trim();
    if (!cleanCompanyId) {
      throw new Error("ID da empresa inválido");
    }

    // 6. Validate and convert reward (must be Nat/bigint)
    const rewardNum = parseInt(rewardAmount, 10);
    if (isNaN(rewardNum) || rewardNum <= 0 || rewardNum > 1000000) {
      throw new Error("Recompensa deve ser um número entre 1 e 1.000.000");
    }

    // 7. Validate and convert deadline (must be Time/bigint in nanoseconds)
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error("Data/hora inválida");
    }
    
    const now = new Date();
    if (deadlineDate <= now) {
      throw new Error("Prazo deve ser no futuro");
    }

    // Convert to nanoseconds as expected by Motoko Time.Time
    const deadlineNs = BigInt(deadlineDate.getTime()) * BigInt(1000000);

    return {
      title: cleanTitle,
      description: cleanDescription,
      companyId: cleanCompanyId,
      reward: BigInt(rewardNum),
      deadline: deadlineNs,
      deadlineReadable: deadlineDate.toISOString()
    };
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Validate and prepare all data
      const challengeData = validateAndPrepareData();

      console.log("[CHALLENGE CREATION] Sending data to backend:");
      console.log("- title:", typeof challengeData.title, `"${challengeData.title}"`);
      console.log("- description:", typeof challengeData.description, `"${challengeData.description}"`);
      console.log("- companyId:", typeof challengeData.companyId, `"${challengeData.companyId}"`);
      console.log("- reward:", typeof challengeData.reward, challengeData.reward.toString());
      console.log("- deadline:", typeof challengeData.deadline, challengeData.deadline.toString());
      console.log("- deadline readable:", challengeData.deadlineReadable);

      // Call the backend with exactly the right types
      const result = await actors.challenges.createChallenge(
        challengeData.title,
        challengeData.description,
        challengeData.companyId,
        challengeData.reward,
        challengeData.deadline
      );

      console.log("[CHALLENGE CREATION] Backend response:", result);

      if ('ok' in result) {
        setMessage({ 
          text: `Desafio "${result.ok.title}" criado com sucesso!`, 
          type: "success" 
        });
        
        // Clear form
        setTitle("");
        setDescription("");
        setRewardAmount("");
        setDeadline("");
        
        // Notify parent component
        if (onChallengeCreated) {
          onChallengeCreated();
        }
      } else {
        throw new Error(result.err || "Erro desconhecido do backend");
      }

    } catch (error) {
      console.error("[CHALLENGE CREATION] Error:", error);
      setMessage({ 
        text: `Erro: ${error.message}`, 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation helpers
  const getTitleError = () => {
    if (!title) return "";
    if (title.trim().length < 3) return "Mínimo 3 caracteres";
    if (title.trim().length > 100) return "Máximo 100 caracteres";
    return "";
  };

  const getDescriptionError = () => {
    if (!description) return "";
    if (description.trim().length < 10) return "Mínimo 10 caracteres";
    if (description.trim().length > 500) return "Máximo 500 caracteres";
    return "";
  };

  const getRewardError = () => {
    if (!rewardAmount) return "";
    const num = parseInt(rewardAmount, 10);
    if (isNaN(num) || num <= 0) return "Deve ser um número positivo";
    if (num > 1000000) return "Máximo 1.000.000 tokens";
    return "";
  };

  const getDeadlineError = () => {
    if (!deadline) return "";
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return "Data inválida";
    if (date <= new Date()) return "Deve ser no futuro";
    return "";
  };

  const hasErrors = getTitleError() || getDescriptionError() || getRewardError() || getDeadlineError();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
          <Trophy size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Criar Novo Desafio</h3>
          <p className="text-sm text-gray-500">Preencha os detalhes para criar um desafio para sua equipe.</p>
        </div>
      </div>
      
      <form onSubmit={handleCreateChallenge} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="chal-title" className="block text-sm font-medium text-gray-700 mb-1">
            Título do Desafio
          </label>
          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              id="chal-title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              maxLength={100}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors ${
                getTitleError() ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Ex: Desafio de bem-estar mensal"
            />
          </div>
          {getTitleError() && (
            <p className="text-red-500 text-xs mt-1">{getTitleError()}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">{title.length}/100 caracteres</p>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="chal-desc" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea 
              id="chal-desc" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              rows={4} 
              maxLength={500}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors resize-none ${
                getDescriptionError() ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Descreva claramente o que o colaborador deve fazer para completar este desafio..."
            />
          </div>
          {getDescriptionError() && (
            <p className="text-red-500 text-xs mt-1">{getDescriptionError()}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">{description.length}/500 caracteres</p>
        </div>

        {/* Reward and Deadline Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reward Field */}
          <div>
            <label htmlFor="chal-reward" className="block text-sm font-medium text-gray-700 mb-1">
              Recompensa (Tokens)
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="number" 
                id="chal-reward" 
                value={rewardAmount} 
                onChange={(e) => setRewardAmount(e.target.value)} 
                required 
                min="1" 
                max="1000000"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors ${
                  getRewardError() ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="100"
              />
            </div>
            {getRewardError() && (
              <p className="text-red-500 text-xs mt-1">{getRewardError()}</p>
            )}
          </div>

          {/* Deadline Field */}
          <div>
            <label htmlFor="chal-deadline" className="block text-sm font-medium text-gray-700 mb-1">
              Prazo Final
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="datetime-local" 
                id="chal-deadline" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
                required 
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} // At least 1 minute from now
                className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors ${
                  getDeadlineError() ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>
            {getDeadlineError() && (
              <p className="text-red-500 text-xs mt-1">{getDeadlineError()}</p>
            )}
          </div>
        </div>

        {/* Debug Info (only show in development) */}
        {process.env.NODE_ENV === 'development' && (profile || actors) && (
          <div className="bg-gray-50 p-3 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Profile: {profile ? 'Loaded' : 'Not loaded'}</p>
            <p>Company ID: {profile?.companyId || 'Not available'}</p>
            <p>Actors: {actors?.challenges ? 'Ready' : 'Not ready'}</p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || hasErrors || !title || !description || !rewardAmount || !deadline} 
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <PlusCircle size={16} />
          )}
          {loading ? "Criando Desafio..." : "Criar Desafio"}
        </button>

        {/* Message Display */}
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