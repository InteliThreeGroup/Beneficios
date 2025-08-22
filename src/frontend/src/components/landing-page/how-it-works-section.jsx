import { Card, CardContent } from "../ui/card"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Initial Setup",
    description: "Set up your company on the platform and define the desired benefits programs.",
    image: "/1.png",
  },
  {
    step: "02",
    title: "Challenge Creation",
    description: "Create personalized challenges to engage your employees and set rewards.",
    image: "/2.png",
  },
  {
    step: "03",
    title: "Employee Participation",
    description: "Employees participate in challenges and accumulate reward tokens.",
    image: "/3.png",
  },
  {
    step: "04",
    title: "Management & Reports",
    description: "Track progress, manage payments, and analyze engagement metrics.",
    image: "/5.png",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">How BeneChain Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A simple and intuitive process to revolutionize your company's benefits.
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
                <Card className="overflow-hidden shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 max-w-md mx-auto">
                  <CardContent className="p-0">
                    <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-96 object-contain bg-gray-50" />
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
