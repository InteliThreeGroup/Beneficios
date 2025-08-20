import { Shield, Zap, Users, TrendingUp, Wallet, QrCode } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Segurança Blockchain",
      description: "Seus benefícios protegidos pela tecnologia blockchain da Internet Computer, garantindo máxima segurança e transparência."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Pagamentos Instantâneos",
      description: "Realize transações em tempo real com taxa zero, proporcionando uma experiência fluida para todos os usuários."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Gestão Centralizada",
      description: "RH pode gerenciar todos os benefícios, colaboradores e estabelecimentos parceiros em uma única plataforma."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Relatórios Detalhados",
      description: "Acompanhe o uso dos benefícios com dashboards intuitivos e relatórios completos em tempo real."
    },
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: "Carteira Digital",
      description: "Colaboradores têm acesso a uma carteira digital moderna para visualizar saldo e histórico de transações."
    },
    {
      icon: <QrCode className="w-8 h-8 text-primary" />,
      title: "Pagamento por QR Code",
      description: "Estabelecimentos podem gerar QR codes para receber pagamentos de forma rápida e segura."
    }
  ]

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Funcionalidades{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Inovadoras
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra como o BeneChain transforma a gestão de benefícios corporativos com tecnologia de ponta
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
