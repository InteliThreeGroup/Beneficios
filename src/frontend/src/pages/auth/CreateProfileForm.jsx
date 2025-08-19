"use client"

import { useState } from "react"
import { useAuth } from "./AuthClientContext"
import { User, UserCheck, Store, Building, Loader2, CheckCircle, AlertTriangle, ArrowRight, Shield } from "lucide-react"

const roleOptions = [
  {
    value: "Worker",
    label: "Trabalhador",
    icon: <User size={24} />,
    description: "Receba e utilize seus benefícios corporativos de forma segura",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    features: ["Receber benefícios", "Fazer pagamentos", "Acompanhar saldo"],
  },
  {
    value: "HR",
    label: "Recursos Humanos",
    icon: <UserCheck size={24} />,
    description: "Gerencie programas de benefícios e colaboradores",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    features: ["Gerenciar programas", "Controlar benefícios", "Relatórios detalhados"],
  },
  {
    value: "Establishment",
    label: "Estabelecimento",
    icon: <Store size={24} />,
    description: "Receba pagamentos através da plataforma de benefícios",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    features: ["Receber pagamentos", "Gestão de vendas", "Integração simples"],
  },
]

export default function CreateProfileForm() {
  const { actors, reloadProfile, principal } = useAuth()
  const [name, setName] = useState("")
  const [role, setRole] = useState("Worker")
  const [companyId, setCompanyId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [step, setStep] = useState(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    if (!actors || !actors.identity_auth) {
      setMessage({ text: "Erro: Atores do canister não carregados.", type: "error" })
      setLoading(false)
      return
    }

    try {
      let selectedRole
      if (role === "HR") selectedRole = { HR: null }
      else if (role === "Establishment") selectedRole = { Establishment: null }
      else selectedRole = { Worker: null }

      const profileData = {
        name: name,
        role: selectedRole,
        companyId: companyId ? [companyId] : [],
      }

      const result = await actors.identity_auth.createProfile(profileData)

      if (result.ok) {
        if (role === "Establishment") {
          try {
            const establishmentData = {
              name: name,
              country: "Brasil",
              businessCode: "GENERAL",
              walletPrincipal: principal,
              acceptedBenefitTypes: [
                { Food: null },
                { Culture: null },
                { Health: null },
                { Transport: null },
                { Education: null },
              ],
            }

            const establishmentResult = await actors.establishment.registerEstablishment(establishmentData)
            if (establishmentResult.ok) {
              console.log("Estabelecimento registrado com sucesso!")
            } else {
              console.warn("Erro ao registrar estabelecimento:", establishmentResult.err)
            }
          } catch (establishmentError) {
            console.error("Erro ao registrar estabelecimento:", establishmentError)
          }
        }

        setMessage({ text: "Perfil criado com sucesso! Redirecionando...", type: "success" })
        setTimeout(() => {
          reloadProfile()
        }, 1500)
      } else {
        setMessage({ text: `Erro ao criar perfil: ${result.err}`, type: "error" })
      }
    } catch (err) {
      console.error("Erro ao submeter o formulário:", err)
      setMessage({ text: "Ocorreu um erro inesperado.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const selectedRoleOption = roleOptions.find((option) => option.value === role)

  const handleNext = () => {
    if (step === 1 && role) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#00A5E6] to-blue-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
            <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">Bem-vindo ao BeneChain</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Crie seu perfil e comece a usar a plataforma de benefícios corporativos mais avançada do mercado
          </p>
        </div>

        <div className="flex items-center justify-center mb-6 sm:mb-8 px-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${step >= 1 ? "bg-[#00A5E6] text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <span className="text-xs sm:text-sm font-semibold">1</span>
            </div>
            <div className={`w-8 sm:w-16 h-1 ${step >= 2 ? "bg-[#00A5E6]" : "bg-gray-200"}`}></div>
            <div
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${step >= 2 ? "bg-[#00A5E6] text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <span className="text-xs sm:text-sm font-semibold">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden mx-2 sm:mx-0">
          {step === 1 && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Escolha seu tipo de perfil</h2>
                <p className="text-sm sm:text-base text-gray-600 px-2">Selecione a opção que melhor descreve como você usará a plataforma</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setRole(option.value)}
                    className={`cursor-pointer rounded-lg sm:rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      role === option.value
                        ? `${option.borderColor} ${option.bgColor} shadow-lg transform scale-105`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="p-4 sm:p-6">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-r ${option.color} mb-3 sm:mb-4 shadow-md`}
                      >
                        <div className="text-white">{option.icon}</div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{option.label}</h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm leading-relaxed">{option.description}</p>

                      <div className="space-y-1 sm:space-y-2">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs sm:text-sm text-gray-500">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {role === option.value && (
                        <div className="mt-3 sm:mt-4 flex items-center justify-center">
                          <div className="flex items-center text-[#00A5E6] font-medium text-xs sm:text-sm">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Selecionado
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center px-4">
                <button
                  onClick={handleNext}
                  disabled={!role}
                  className={`flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    role
                      ? "bg-[#00A5E6] hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Complete suas informações</h2>
                <p className="text-sm sm:text-base text-gray-600 px-2">Preencha os dados necessários para finalizar seu cadastro</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <div
                  className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${selectedRoleOption?.bgColor} ${selectedRoleOption?.borderColor} border-2`}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${selectedRoleOption?.color} mr-3 sm:mr-4 flex-shrink-0`}
                    >
                      <div className="text-white">{selectedRoleOption?.icon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedRoleOption?.label}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{selectedRoleOption?.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    {role === "Establishment" ? "Nome do Estabelecimento" : "Nome Completo"}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      role === "Establishment" ? "Digite o nome do estabelecimento" : "Digite seu nome completo"
                    }
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#00A5E6] focus:border-[#00A5E6] transition-all duration-300 text-base sm:text-lg"
                  />
                </div>

                {(role === "Worker" || role === "HR") && (
                  <div>
                    <label htmlFor="companyId" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      ID da Empresa
                    </label>
                    <input
                      id="companyId"
                      type="text"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      placeholder="Digite o nome da empresa"
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#00A5E6] focus:border-[#00A5E6] transition-all duration-300 text-base sm:text-lg"
                    />
                    <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-700 flex items-center">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        Este campo conecta você à sua empresa no sistema de forma segura
                      </p>
                    </div>
                  </div>
                )}

                {message.text && (
                  <div
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 ${
                      message.type === "error"
                        ? "bg-red-50 text-red-700 border-2 border-red-200"
                        : "bg-green-50 text-green-700 border-2 border-green-200"
                    }`}
                  >
                    {message.type === "error" ? (
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium text-sm sm:text-base leading-tight">{message.text}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="order-2 sm:order-1 flex-1 py-3 sm:py-4 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`order-1 sm:order-2 flex-1 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-[#00A5E6] hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Criando perfil...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span>Criar Perfil</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6 sm:mt-8 px-4">
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Ao criar seu perfil, você concorda com nossos termos de uso e política de privacidade
          </p>
        </div>
      </div>
    </div>
  )
}
