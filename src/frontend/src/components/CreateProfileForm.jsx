import { useState } from "react";
import { useAuth } from "./AuthClientContext";
import { User, UserCheck, Store, Building, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const roleOptions = [
  { value: "Worker", label: "Trabalhador", icon: <User size={24} />, description: "Receber e usar benefícios corporativos" },
  { value: "HR", label: "Recursos Humanos", icon: <UserCheck size={24} />, description: "Gerenciar programas e trabalhadores" },
  { value: "Establishment", label: "Estabelecimento", icon: <Store size={24} />, description: "Receber pagamentos de benefícios" },
];

export default function CreateProfileForm() {
  const { actors, refreshProfile, principal } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Worker");
  const [companyId, setCompanyId] = useState(""); // Novo estado para o ID da empresa
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!actors || !actors.identity_auth) {
      setMessage({ text: "Erro: Atores do canister não carregados.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      let selectedRole;
      if (role === "HR") selectedRole = { HR: null };
      else if (role === "Establishment") selectedRole = { Establishment: null };
      else selectedRole = { Worker: null };

      // --- CORREÇÃO APLICADA ---
      // Monta o objeto (record) para enviar ao canister, agora incluindo o companyId.
      const profileData = {
        name: name,
        role: selectedRole,
        // Em Candid/JS, um array com um item representa o valor Some(Text),
        // e um array vazio `[]` representa o valor `null` para o tipo opcional `?Text`.
        companyId: companyId ? [companyId] : [],
      };

      const result = await actors.identity_auth.createProfile(profileData);

      if (result.ok) {
        // Se é um estabelecimento, registra também no canister de establishment
        if (role === "Establishment") {
          try {
            const establishmentData = {
              name: name,
              country: "Brasil", // Padrão por enquanto
              businessCode: "GENERAL", // Padrão por enquanto
              walletPrincipal: principal, // Usa o próprio principal como carteira
              acceptedBenefitTypes: [
                { Food: null },
                { Culture: null },
                { Health: null },
                { Transport: null },
                { Education: null }
              ], // Aceita todos os tipos por padrão
            };
            
            const establishmentResult = await actors.establishment.registerEstablishment(establishmentData);
            if (establishmentResult.ok) {
              console.log("Estabelecimento registrado com sucesso!");
            } else {
              console.warn("Erro ao registrar estabelecimento:", establishmentResult.err);
            }
          } catch (establishmentError) {
            console.error("Erro ao registrar estabelecimento:", establishmentError);
          }
        }
        
        setMessage({ text: "Perfil criado com sucesso! Redirecionando...", type: "success" });
        setTimeout(() => {
          refreshProfile();
        }, 1500);
      } else {
        setMessage({ text: `Erro ao criar perfil: ${result.err}`, type: "error" });
      }
    } catch (err) {
      console.error("Erro ao submeter o formulário:", err);
      setMessage({ text: "Ocorreu um erro inesperado.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8 bg-gray-50">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Crie seu Perfil</h2>
        <p className="text-center text-gray-500 mt-2 mb-8">Escolha seu tipo de perfil para começar a usar o BeneChain.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Perfil
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={`cursor-pointer p-4 border-2 rounded-lg text-center transition-all ${
                    role === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    role === option.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {option.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800">{option.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Seu Nome / Nome do Estabelecimento
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* --- CAMPO CONDICIONAL PARA ID DA EMPRESA --- */}
          {(role === "Worker" || role === "HR") && (
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                ID da Empresa (Nome da Empresa)
              </label>
              <div className="mt-1 relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="companyId"
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Digite o nome da empresa"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Criando Perfil...
              </>
            ) : (
              "Criar e Acessar"
            )}
          </button>

          {message.text && (
            <div className={`p-4 rounded-lg flex items-center gap-3 mt-4 ${
                message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {message.type === 'error' ? <AlertTriangle /> : <CheckCircle />}
              <span>{message.text}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
