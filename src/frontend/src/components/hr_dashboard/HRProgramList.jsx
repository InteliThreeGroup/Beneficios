import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../AuthClientContext";
import { Loader2, AlertTriangle, List, Coins, Utensils, BookOpen, HeartPulse, Bus, GraduationCap, Building } from "lucide-react";

const benefitDetails = {
    Food: { icon: <Utensils className="text-blue-500" />, name: "Alimentação" },
    Culture: { icon: <BookOpen className="text-purple-500" />, name: "Cultura" },
    Health: { icon: <HeartPulse className="text-green-500" />, name: "Saúde" },
    Transport: { icon: <Bus className="text-orange-500" />, name: "Mobilidade" },
    Education: { icon: <GraduationCap className="text-red-500" />, name: "Educação" },
    Default: { icon: <Building className="text-gray-500" />, name: "Outros" }
};

export default function HRProgramList() {
  const { actors, profile } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatBenefitType = (type) => Object.keys(type)[0] || "Default";
  const formatAmount = (amount) => (Number(amount) / 10000).toFixed(2);

  const fetchPrograms = useCallback(async () => {
    if (!actors?.benefits_manager || !profile?.companyId?.[0]) {
      setError("Perfil ou informações da empresa incompletas.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const companyId = profile.companyId[0];
      const result = await actors.benefits_manager.getCompanyBenefitPrograms(companyId);
      setPrograms(result);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Falha ao carregar os programas.");
    } finally {
      setLoading(false);
    }
  }, [actors, profile]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Programas Ativos</h3>
      {loading && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" /></div>}
      {error && <div className="p-3 rounded-lg flex items-center gap-3 text-sm bg-red-100 text-red-800"><AlertTriangle size={16} /><span>{error}</span></div>}
      {!loading && !error && (
        programs.length > 0 ? (
          <div className="space-y-3">
            {programs.map((program) => {
              const benefitTypeKey = formatBenefitType(program.benefitType);
              const details = benefitDetails[benefitTypeKey] || benefitDetails.Default;
              return (
                <div key={program.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">{details.icon}</div>
                    <div>
                      <p className="font-semibold">{program.name}</p>
                      <p className="text-sm text-gray-500">{details.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 flex items-center gap-1"><Coins size={14}/> {formatAmount(program.amountPerWorker)}</p>
                    <p className="text-xs text-gray-500">Mensal</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <List size={40} className="mx-auto mb-2"/>
            <p>Nenhum programa encontrado.</p>
            <p className="text-sm">Crie seu primeiro programa para começar.</p>
          </div>
        )
      )}
    </div>
  );
}
