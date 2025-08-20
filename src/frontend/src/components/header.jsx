"use client"

import { Button } from "./ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../pages/auth/AuthClientContext"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, login, logout, profile } = useAuth()

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
    setIsMenuOpen(false) // Fecha o menu mobile após clicar
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
                Recursos
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection("cta")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Começar
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Contato
              </button>
            </div>
          </nav>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=0ea5e9&color=ffffff`} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {profile?.name || "Usuário"}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="bg-transparent"
                >
                  <LogOut size={16} className="mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="mr-4 bg-transparent"
                  onClick={login}
                >
                  Login
                </Button>
                <Button onClick={login}>Começar Agora</Button>
              </>
            )}
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
                Recursos
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection("cta")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                Começar
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
              >
                Contato
              </button>
              <div className="px-3 py-2 space-y-2">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'U')}&background=0ea5e9&color=ffffff`} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {profile?.name || "Usuário"}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent"
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent"
                      onClick={() => { login(); setIsMenuOpen(false); }}
                    >
                      Login
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => { login(); setIsMenuOpen(false); }}
                    >
                      Começar Agora
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
