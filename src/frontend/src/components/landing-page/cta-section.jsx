import { Button } from "../ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useAuth } from "../../pages/auth/AuthClientContext"

const benefits = [
  "Setup gratuito e sem compromisso",
  "Suporte técnico especializado",
  "Integração com sistemas existentes",
  "Treinamento completo da equipe",
]

export function CTASection() {
  const { isAuthenticated, login } = useAuth()
  return (
    <section
      id="cta"
      className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
              Pronto para Revolucionar seus Benefícios?
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Junte-se a centenas de empresas que já transformaram sua gestão de benefícios com o BeneChain. Comece hoje
              mesmo!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 text-primary-foreground/90">
                <CheckCircle className="h-5 w-5 text-green-300 animate-pulse" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={login}
            >
              {isAuthenticated ? "Acessar Plataforma" : "Começar Teste Gratuito"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              onClick={() => {
                const element = document.getElementById("contact");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Agendar Demonstração
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/70">
            Sem cartão de crédito • Cancelamento a qualquer momento • Suporte 24/7
          </p>
        </div>
      </div>
    </section>
  )
}
