import { Card, CardContent } from "../ui/card"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Configuração Inicial",
    description: "Configure sua empresa na plataforma e defina os programas de benefícios desejados.",
    image: "/company-setup-dashboard.png",
  },
  {
    step: "02",
    title: "Criação de Desafios",
    description: "Crie desafios personalizados para engajar seus funcionários e definir recompensas.",
    image: "/gamification-challenge-interface.png",
  },
  {
    step: "03",
    title: "Participação dos Funcionários",
    description: "Funcionários participam dos desafios e acumulam tokens de recompensa.",
    image: "/employee-rewards-dashboard.png",
  },
  {
    step: "04",
    title: "Gestão e Relatórios",
    description: "Acompanhe o progresso, gerencie pagamentos e analise métricas de engajamento.",
    image: "/analytics-dashboard.png",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Como Funciona o BeneChain</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Um processo simples e intuitivo para revolucionar os benefícios da sua empresa.
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-primary hidden lg:block animate-pulse" />
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>

              <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                <Card className="overflow-hidden shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-0">
                    <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-64 object-cover" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
