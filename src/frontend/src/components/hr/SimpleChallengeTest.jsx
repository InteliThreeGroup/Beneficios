import React, { useState } from "react";
import { useAuth } from "../../pages/auth/AuthClientContext";

export default function SimpleChallengeTest() {
  const { actors, profile } = useAuth();
  const [status, setStatus] = useState("");
  const [result1, setResult1] = useState("");
  const [result2, setResult2] = useState("");
  const [result3, setResult3] = useState("");

  const testSimpleCall = async () => {
    try {
      console.log("=== TESTING SIMPLE TEXT ARGS ===");
      
      if (!actors?.challenges) {
        throw new Error("Actors não disponível");
      }

      console.log("Chamando testTextArgs...");
      const result = await actors.challenges.testTextArgs(
        "test title",
        "test description", 
        "test-company-123"
      );
      
      console.log("Resultado testTextArgs:", result);
      setResult1(`testTextArgs: ${result}`);
    } catch (error) {
      console.log("Erro:", error);
      setResult1(`Erro: ${error.message}`);
    }
  };

  const testCreateChallenge = async () => {
    try {
      console.log("=== TESTING CREATE CHALLENGE ===");
      
      // Usar valores hardcoded para eliminar qualquer problema de conversão
      const title = "Teste Hardcoded";
      const description = "Descricao hardcoded";
      const companyId = "empresa-teste";
      const reward = BigInt(100);
      const deadline = BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000) * BigInt(1000000); // 7 dias em nanosegundos
      
      console.log("Parâmetros:");
      console.log("title:", JSON.stringify(title), typeof title);
      console.log("description:", JSON.stringify(description), typeof description);
      console.log("companyId:", JSON.stringify(companyId), typeof companyId);
      console.log("reward:", reward.toString(), typeof reward);
      console.log("deadline:", deadline.toString(), typeof deadline);
      
      console.log("Chamando createChallenge...");
      const result = await actors.challenges.createChallenge(
        title,
        description,
        companyId,
        reward,
        deadline
      );
      
      console.log("Resultado createChallenge:", result);
      setResult2(`createChallenge: ${JSON.stringify(result)}`);
    } catch (error) {
      console.log("Erro:", error);
      setResult2(`Erro: ${error.message}`);
    }
  };

  const testCreateChallengeSimple = async () => {
    try {
      console.log("=== TESTING CREATE CHALLENGE SIMPLE ===");
      
      // Usar valores hardcoded para eliminar qualquer problema de conversão
      const title = "Teste Simple";
      const description = "Descricao simple";
      const companyId = "empresa-simple";
      const reward = BigInt(100);
      const deadline = BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000) * BigInt(1000000); // 7 dias em nanosegundos
      
      console.log("Parâmetros Simple:");
      console.log("title:", JSON.stringify(title), typeof title);
      console.log("description:", JSON.stringify(description), typeof description);
      console.log("companyId:", JSON.stringify(companyId), typeof companyId);
      console.log("reward:", reward.toString(), typeof reward);
      console.log("deadline:", deadline.toString(), typeof deadline);
      
      console.log("Chamando createChallengeSimple...");
      const result = await actors.challenges.createChallengeSimple(
        title,
        description,
        companyId,
        reward,
        deadline
      );
      
      console.log("Resultado createChallengeSimple:", result);
      setResult3(`createChallengeSimple: ${JSON.stringify(result)}`);
    } catch (error) {
      console.log("Erro Simple:", error);
      setResult3(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🧪 Teste Simples de Criação</h3>
      
      <button
        onClick={testSimpleCall}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
      >
        Testar testTextArgs
      </button>

      <button
        onClick={testCreateChallenge}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        Testar createChallenge (Original)
      </button>

      <button
        onClick={testCreateChallengeSimple}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
      >
        Testar createChallengeSimple (Sem Calls Externas)
      </button>
      
      {status && (
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm">{status}</p>
        </div>
      )}

      {result1 && (
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm">{result1}</p>
        </div>
      )}

      {result2 && (
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm">{result2}</p>
        </div>
      )}

      {result3 && (
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm">{result3}</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Profile: {profile ? "Carregado" : "Não carregado"}</p>
        <p>Actors: {actors?.challenges ? "Carregado" : "Não carregado"}</p>
        <p>CompanyId: {JSON.stringify(profile?.companyId)}</p>
      </div>
    </div>
  );
}
