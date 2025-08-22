import { Button } from "../ui/button"
import { ArrowRight, Play } from "lucide-react"
import { useAuth } from "../../pages/auth/AuthClientContext"

export function HeroSection() {
  const { isAuthenticated, login } = useAuth()
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Revolutionize your{" "}
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Company Benefits
                </span>{" "}
                Management
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform corporate benefits management with blockchain, gamification, and token rewards. A modern platform for innovative companies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={login}
              >
                {isAuthenticated ? "Access Platform" : "Start for Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent backdrop-blur-sm border-primary/30 hover:bg-primary/5"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                <Play className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Secure Blockchain</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary/80 rounded-full animate-pulse delay-300"></div>
                <span>Advanced Gamification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-700"></div>
                <span>Reward Tokens</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <div className="p-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl backdrop-blur-sm">
                <img
                  src="/6.svg"
                  alt="BeneChain Dashboard"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
