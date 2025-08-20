import React, { useState } from "react";
import { useAuth } from "../../pages/auth/AuthClientContext";

export default function NewChallengeForm({ onChallengeCreated }) {
  const { actors, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "", 
    reward: "",
    deadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validação básica
      if (!formData.title.trim() || !formData.description.trim() || !formData.reward || !formData.deadline) {
        throw new Error("Todos os campos são obrigatórios");
      }

      if (!actors?.challenges) {
        throw new Error("Sistema não conectado");
      }

      if (!profile?.companyId) {
        throw new Error("Perfil da empresa não encontrado");
      }

      // Preparar dados com conversão MUITO explícita
      const title = String(formData.title || "").trim();
      const description = String(formData.description || "").trim(); 
      
      // Extrair companyId corretamente
      let rawCompanyId = profile.companyId;
      if (Array.isArray(rawCompanyId)) {
        rawCompanyId = rawCompanyId[0];
      }
      const companyId = String(rawCompanyId || "").trim();
      
      // Validações adicionais
      if (!title || title.length < 2) {
        throw new Error("Título deve ter pelo menos 2 caracteres");
      }
      if (!description || description.length < 5) {
        throw new Error("Descrição deve ter pelo menos 5 caracteres");
      }
      if (!companyId || companyId.length < 1) {
        throw new Error("ID da empresa inválido");
      }
      
      const rewardNum = parseInt(formData.reward, 10);
      if (isNaN(rewardNum) || rewardNum <= 0) {
        throw new Error("Recompensa deve ser um número positivo");
      }
      const reward = BigInt(rewardNum);
      
      // Converter data para nanosegundos
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error("Data inválida");
      }
      if (deadlineDate <= new Date()) {
        throw new Error("Prazo deve ser no futuro");
      }
      const deadlineNs = BigInt(Math.floor(deadlineDate.getTime())) * BigInt(1000000);

      console.log("=== CRIANDO DESAFIO (VERIFICAÇÃO FINAL) ===");
      console.log("title:", JSON.stringify(title), "length:", title.length, "type:", typeof title);
      console.log("description:", JSON.stringify(description), "length:", description.length, "type:", typeof description);
      console.log("companyId:", JSON.stringify(companyId), "length:", companyId.length, "type:", typeof companyId);
      console.log("reward:", reward.toString(), "type:", typeof reward);
      console.log("deadline:", deadlineNs.toString(), "type:", typeof deadlineNs);
      console.log("deadline readable:", deadlineDate.toISOString());

      // Verificação final antes de enviar
      if (typeof title !== 'string' || typeof description !== 'string' || typeof companyId !== 'string') {
        throw new Error("Erro de tipagem nos parâmetros de texto");
      }
      if (typeof reward !== 'bigint' || typeof deadlineNs !== 'bigint') {
        throw new Error("Erro de tipagem nos parâmetros numéricos");
      }

      // Chamar o backend usando a função simplificada que funciona
      const result = await actors.challenges.createChallengeSimple(
        title,
        description, 
        companyId,
        reward,
        deadlineNs
      );

      console.log("=== RESULTADO ===", result);

      // Verificar se a resposta está no formato Result ou direta
      if ('ok' in result) {
        // Formato Result<Challenge, Text>
        setMessage(`Desafio criado com sucesso! ID: ${result.ok.id}`);
        setFormData({ title: "", description: "", reward: "", deadline: "" });
        
        // Notificar o componente pai que um desafio foi criado
        if (onChallengeCreated) {
          onChallengeCreated();
        }
      } else if (result && result.id) {
        // Formato direto (Challenge)
        setMessage(`Desafio criado com sucesso! ID: ${result.id}`);
        setFormData({ title: "", description: "", reward: "", deadline: "" });
        
        // Notificar o componente pai que um desafio foi criado
        if (onChallengeCreated) {
          onChallengeCreated();
        }
      } else if ('err' in result) {
        setMessage(`Erro: ${result.err}`);
      } else {
        setMessage("Resposta inesperada do servidor");
      }

    } catch (error) {
      console.error("Erro completo:", error);
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Criar Novo Desafio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do Desafio
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o título do desafio"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o desafio"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recompensa (tokens)
          </label>
          <input
            type="number"
            name="reward"
            value={formData.reward}
            onChange={handleInputChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prazo
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Criando..." : "Criar Desafio"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes("sucesso") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md text-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Profile loaded: {profile ? "Yes" : "No"}</p>
          <p>Company ID: {profile?.companyId || "N/A"}</p>
          <p>Actors loaded: {actors?.challenges ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}
