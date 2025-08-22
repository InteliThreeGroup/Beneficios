import IC "ic:aaaaa-aa";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";

actor {
  
  // Contexto específico para geração de desafios corporativos
  private let CHALLENGE_GENERATOR_CONTEXT = "
VOCÊ É O ASSISTENTE DE IA ESPECIALIZADO EM CRIAÇÃO DE DESAFIOS CORPORATIVOS para a plataforma BeneChain.

SEU PAPEL:
- Gerar desafios corporativos criativos e engajadores
- Adaptar desafios para diferentes setores e culturas empresariais
- Sugerir recompensas apropriadas em tokens
- Criar desafios que promovam bem-estar, produtividade e engajamento

TIPOS DE DESAFIOS QUE VOCÊ PODE CRIAR:

1. BEM-ESTAR E SAÚDE:
   - Desafios de atividade física
   - Mindfulness e meditação
   - Alimentação saudável
   - Ergonomia no trabalho
   - Descanso e qualidade do sono

2. PRODUTIVIDADE E DESENVOLVIMENTO:
   - Aprendizado de novas habilidades
   - Inovação e criatividade
   - Organização pessoal
   - Gestão de tempo
   - Colaboração em equipe

3. SUSTENTABILIDADE:
   - Práticas eco-friendly
   - Redução de desperdício
   - Transporte sustentável
   - Economia de energia
   - Reciclagem

4. CULTURA ORGANIZACIONAL:
   - Valores da empresa
   - Diversidade e inclusão
   - Networking interno
   - Reconhecimento de colegas
   - Participação em eventos

5. DESENVOLVIMENTO PESSOAL:
   - Leitura e educação
   - Hobbies e interesses
   - Voluntariado
   - Liderança
   - Comunicação

ESTRUTURA DOS DESAFIOS:
Cada desafio deve ter:
- Título atrativo e claro
- Descrição detalhada mas concisa
- Critérios de avaliação específicos
- Prazo adequado (sugestão em dias)
- Recompensa em tokens (baseada na dificuldade)
- Categoria do benefício relacionado

DIRETRIZES:
- Seja criativo mas realista
- Considere diferentes níveis de participação
- Promova inclusão (todos podem participar)
- Foque em resultados mensuráveis
- Mantenha o tom motivacional e positivo

FORMATO DE RESPOSTA:
Quando solicitado, responda APENAS com um JSON válido no seguinte formato:
{
  \"title\": \"Título do Desafio\",
  \"description\": \"Descrição completa do desafio com critérios claros\",
  \"reward\": numero_de_tokens,
  \"deadline_days\": numero_de_dias,
  \"category\": \"Food|Health|Culture|Transport|Education\"
}

Se a pergunta não for sobre geração de desafios, responda educadamente que você é especializado apenas em criar desafios corporativos para o BeneChain.
";

  // Função para extrair texto limpo da resposta JSON do Gemini
  private func extractTextFromGeminiResponse(jsonResponse: Text) : Text {
    // Procura por "text": " e extrai o conteúdo usando Text.split
    let startPattern = "\"text\": \"";
    
    // Divide a string pelo padrão inicial
    let parts1 = Text.split(jsonResponse, #text startPattern);
    let iter1 = parts1;
    
    // Pula a primeira parte (antes do padrão)
    switch (iter1.next()) {
      case (null) { return "Erro: Formato de resposta inválido" };
      case (?_) {
        // Pega a segunda parte (depois do padrão)
        switch (iter1.next()) {
          case (null) { return "Erro: Início da resposta não encontrado" };
          case (?afterStart) {
            // Agora procura pelo fim da string
            let endPattern = "\"}";
            let parts2 = Text.split(afterStart, #text endPattern);
            let iter2 = parts2;
            
            switch (iter2.next()) {
              case (null) { return "Erro: Fim da resposta não encontrado" };
              case (?extracted) {
                // Remove escapes básicos
                let cleaned1 = Text.replace(extracted, #text "\\n", "\n");
                let cleaned2 = Text.replace(cleaned1, #text "\\\"", "\"");
                let cleaned3 = Text.replace(cleaned2, #text "\\\\", "\\");
                return cleaned3;
              };
            };
          };
        };
      };
    };
  };

  // Função principal para gerar desafios corporativos
  public shared func generateChallenge(sector: Text, company_size: Text, focus_area: Text) : async Text {
    let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
      "CONTEXTO DA EMPRESA:\n" #
      "- Setor: " # sector # "\n" #
      "- Tamanho: " # company_size # "\n" #
      "- Área de foco: " # focus_area # "\n\n" #
      "Gere UM desafio corporativo criativo e engajador em formato JSON. " #
      "Certifique-se de que o desafio seja adequado para o setor e tamanho da empresa especificados.";
    
    await callGeminiAPI(prompt)
  };

  // Função para gerar múltiplos desafios
  public shared func generateMultipleChallenges(sector: Text, company_size: Text, quantity: Text) : async Text {
    let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
      "CONTEXTO DA EMPRESA:\n" #
      "- Setor: " # sector # "\n" #
      "- Tamanho: " # company_size # "\n\n" #
      "Gere " # quantity # " desafios corporativos diferentes e criativos. " #
      "Retorne uma lista em formato JSON com array de objetos. " #
      "Varie as categorias e dificuldades dos desafios.";
    
    await callGeminiAPI(prompt)
  };

  // Função para personalizar um desafio existente
  public shared func customizeChallenge(base_challenge: Text, customization_request: Text) : async Text {
    let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
      "DESAFIO BASE:\n" # base_challenge # "\n\n" #
      "PERSONALIZAÇÃO SOLICITADA:\n" # customization_request # "\n\n" #
      "Modifique o desafio base de acordo com a solicitação de personalização. " #
      "Retorne o desafio modificado em formato JSON.";
    
    await callGeminiAPI(prompt)
  };

  // Função para sugerir recompensas baseadas na dificuldade
  public shared func suggestReward(challenge_description: Text, difficulty_level: Text) : async Text {
    let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
      "DESAFIO: " # challenge_description # "\n" #
      "NÍVEL DE DIFICULDADE: " # difficulty_level # "\n\n" #
      "Analise o desafio e sugira uma recompensa apropriada em tokens considerando:\n" #
      "- Nível de esforço necessário\n" #
      "- Tempo estimado para completar\n" #
      "- Impacto nos objetivos da empresa\n" #
      "- Valor para o funcionário\n\n" #
      "Responda apenas com o número de tokens recomendado e uma breve justificativa.";
    
    await callGeminiAPI(prompt)
  };

  // Função para chat geral sobre desafios
  public shared func chatAboutChallenges(question: Text) : async Text {
    let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
      "PERGUNTA DO RH: " # question # "\n\n" #
      "Responda de forma útil e prática, focando em como criar desafios corporativos eficazes.";
    
    await callGeminiAPI(prompt)
  };

  // Função interna para fazer a chamada à API do Gemini
  private func callGeminiAPI(prompt: Text) : async Text {
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    let apiKey = "AIzaSyBdmy5iUsE-8J_SsEtLhqfGkI3eLl90kcM";

    // Escape do prompt para JSON
    let escapedPrompt = Text.replace(prompt, #text "\"", "\\\"");
    let body = 
      "{ \"contents\": [ { \"parts\": [ { \"text\": \"" # escapedPrompt # "\" } ] } ] }";

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

    // Adiciona ciclos para a requisição HTTP
    Cycles.add<system>(25_000_000_000);
    let response = await IC.http_request<system>(request);

    switch (Text.decodeUtf8(response.body)) {
      case (?text) { 
        extractTextFromGeminiResponse(text)
      };
      case null { "Erro ao decodificar resposta da API" };
    }
  };

  // Função de informações sobre o assistente
  public query func getAssistantInfo() : async Text {
    "Assistente de IA especializado em criação de desafios corporativos para o BeneChain. " #
    "Posso gerar desafios personalizados, sugerir recompensas e ajudar o RH a criar campanhas engajadoras. " #
    "Use as funções generateChallenge(), generateMultipleChallenges(), customizeChallenge() ou chatAboutChallenges()."
  };

  // Função para validar se um desafio está bem estruturado
  public shared func validateChallenge(challenge_json: Text) : async Text {
    let prompt = "Analise este JSON de desafio corporativo e verifique se está bem estruturado:\n\n" #
      challenge_json # "\n\n" #
      "Verifique:\n" #
      "1. Se todos os campos necessários estão presentes\n" #
      "2. Se a descrição é clara e acionável\n" #
      "3. Se a recompensa é apropriada\n" #
      "4. Se o prazo é realista\n\n" #
      "Responda com 'VÁLIDO' ou liste os problemas encontrados.";
    
    await callGeminiAPI(prompt)
  };
}
