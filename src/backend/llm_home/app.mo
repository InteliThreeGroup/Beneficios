import IC "ic:aaaaa-aa";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor {
  
  // Contexto completo sobre o projeto BeneChain
  private let BENECHAIN_CONTEXT = "
VOCÊ É O AGENTE OFICIAL DO BENECHAIN - Uma plataforma descentralizada de benefícios corporativos construída no Internet Computer Protocol (ICP).

INFORMAÇÕES PRINCIPAIS DO BENECHAIN:

VISÃO GERAL:
- BeneChain é uma plataforma 100% on-chain de benefícios corporativos
- Elimina intermediários financeiros tradicionais
- Reduz taxas de 3-14% para 0.5-1%
- Oferece pagamentos instantâneos e transparência total
- Construído inteiramente no Internet Computer Protocol (ICP)

PROBLEMAS QUE RESOLVE:
Para RH:
- Falta de controle sobre uso dos benefícios
- Dificuldade de personalização
- Relatórios descentralizados

Para Funcionários:
- Baixa flexibilidade
- Múltiplos cartões ao trocar de emprego
- Taxas ocultas que reduzem poder de compra

Para Estabelecimentos:
- Taxas abusivas (3% a 14%)
- Atraso na transferência de fundos
- Dependência de monopolios

ARQUITETURA TÉCNICA:
4 Canisters principais:
1. identity_auth.mo - Autenticação e autorização
2. benefits_manager.mo - Gestão de programas de benefícios
3. wallets.mo - Carteiras digitais dos trabalhadores
4. establishment.mo - Gestão de estabelecimentos comerciais

RECURSOS ICP UTILIZADOS:
- Internet Identity para autenticação
- Timers on-chain para distribuição automática
- HTTPS outcalls para integrações externas
- Reverse gas model (empresa paga as taxas)
- Asset canisters para frontend descentralizado

TIPOS DE BENEFÍCIOS SUPORTADOS:
- Alimentação (#Food)
- Saúde (#Health)
- Cultura (#Culture)
- Home Office (#HomeOffice)
- Transporte (#Transport)

FLUXO PRINCIPAL:
1. RH cria programa de benefícios
2. Associa funcionários ao programa
3. Sistema distribui automaticamente via timers
4. Funcionários usam benefícios em estabelecimentos
5. Pagamentos são processados instantaneamente

RESPONDA APENAS PERGUNTAS SOBRE O BENECHAIN. Se a pergunta não for relacionada ao projeto, responda educadamente que você só pode ajudar com questões sobre o BeneChain.
";

  // Função para extrair o texto da resposta JSON do Gemini (versão simplificada)
  private func extractTextFromGeminiResponse(jsonResponse: Text) : Text {
    // Procura pelo padrão "text": "..." na resposta JSON
    let textMarker = "\"text\": \"";
    let parts = Text.split(jsonResponse, #text textMarker);
    let iter = parts;
    
    switch (iter.next()) {
      case (null) { "Erro: Resposta não encontrada" };
      case (?_) {
        switch (iter.next()) {
          case (null) { "Erro: Formato inválido" };
          case (?textPart) {
            // Encontra o final da string (próximo \" que não seja \\\")
            let endMarker = "\"";
            let endParts = Text.split(textPart, #text endMarker);
            let endIter = endParts;
            
            switch (endIter.next()) {
              case (null) { "Erro: Texto não encontrado" };
              case (?extractedText) { 
                // Remove escape characters
                let cleaned = Text.replace(extractedText, #text "\\n", "\n");
                Text.replace(cleaned, #text "\\\"", "\"")
              };
            };
          };
        };
      };
    };
  };

  // Função principal do agente BeneChain
  public shared func askBeneChainAgent(userQuestion: Text) : async Text {
    // Cria o prompt com contexto específico do BeneChain
    let contextualPrompt = BENECHAIN_CONTEXT # "\n\nPERGUNTA DO USUÁRIO: " # userQuestion # "\n\nRESPONDA DE FORMA CLARA E OBJETIVA:";
    
    // Usa a mesma implementação da askGemini que funciona
    await callGeminiAPI(contextualPrompt)
  };

  // Função para perguntas gerais (mantida para compatibilidade)
  public shared func askGemini(prompt: Text) : async Text {
    await callGeminiAPI(prompt)
  };

  // Função interna para fazer a chamada à API do Gemini
  private func callGeminiAPI(prompt: Text) : async Text {
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    let apiKey = "AIzaSyBdmy5iUsE-8J_SsEtLhqfGkI3eLl90kcM";

    let body = 
      "{ \"contents\": [ { \"parts\": [ { \"text\": \"" # prompt # "\" } ] } ] }";

    let headers = [
      { name = "Content-Type"; value = "application/json" },
      { name = "X-goog-api-key"; value = apiKey }
    ];

    let request : IC.http_request_args = {
      url = url;
      method = #post;
      headers = headers;
      body = ?Text.encodeUtf8(body);
      max_response_bytes = null;
      transform = null;
      is_replicated = ?false;
    };

    // Adicione ciclos conforme necessário para pagar pela requisição HTTP
    Cycles.add<system>(25_000_000_000); // 25 bilhões de ciclos
    let response = await IC.http_request<system>(request);

    switch (Text.decodeUtf8(response.body)) {
      case (?text) { 
        // Extrai apenas o texto da resposta do JSON
        extractTextFromGeminiResponse(text)
      };
      case null { "Erro ao decodificar resposta" };
    }
  };

  // Função para obter informações rápidas sobre o BeneChain
  public query func getBeneChainInfo() : async Text {
    "BeneChain é uma plataforma descentralizada de benefícios corporativos construída no Internet Computer Protocol (ICP). Elimina intermediários, reduz custos e oferece transparência total. Para mais informações, use a função askBeneChainAgent() com sua pergunta específica."
  };
}