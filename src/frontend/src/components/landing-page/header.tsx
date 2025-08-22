import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">BeneChain</h1>
            </div>
          </div>

          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("cta")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Get Started
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Contact
              </button>
            </div>
          </nav>

          <div className="hidden md:block">
            <Button variant="outline" className="mr-4 bg-transparent">
              Login
            </Button>
            <Button>Start Now</Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground hover:text-primary">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("cta")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                Get Started
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                Contact
              </button>
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full bg-transparent">
                  Login
                </Button>
                <Button className="w-full">Start Now</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
