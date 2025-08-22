import { Shield, Zap, Users, TrendingUp, Wallet, QrCode } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Blockchain Security",
      description: "Your benefits protected by Internet Computer blockchain technology, ensuring maximum security and transparency."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Instant Payments",
      description: "Make real-time transactions with zero fees, providing a seamless experience for all users."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Centralized Management",
      description: "HR can manage all benefits, employees, and partner establishments on a single platform."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Detailed Reports",
      description: "Track benefit usage with intuitive dashboards and comprehensive real-time reports."
    },
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: "Digital Wallet",
      description: "Employees have access to a modern digital wallet to view balance and transaction history."
    },
    {
      icon: <QrCode className="w-8 h-8 text-primary" />,
      title: "QR Code Payment",
      description: "Establishments can generate QR codes to receive payments quickly and securely."
    }
  ]

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Innovative{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how BeneChain transforms corporate benefits management with cutting-edge technology
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
