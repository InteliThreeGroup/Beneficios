
# Documentação Técnica do Backend: BeneChain

Este documento descreve a arquitetura, regras de negócio, fluxo de dados e a API do backend do projeto BeneChain. O objetivo é servir como um guia completo para testes e integração com o frontend.

[cite\_start]O sistema consiste em uma plataforma descentralizada construída no Internet Computer (ICP) que permite a empresas configurar, distribuir e monitorar benefícios corporativos de forma transparente e eficiente[cite: 179]. [cite\_start]Toda a lógica e dados operam diretamente no blockchain do ICP, caracterizando uma solução "Fully On-Chain"[cite: 181].

## 1\. Arquitetura e Fluxo Geral

[cite\_start]O backend é construído em uma arquitetura de microsserviços, utilizando quatro canisters (smart contracts) interconectados, cada um com uma responsabilidade específica[cite: 245].

  * [cite\_start]**`identity_auth.mo`**: Atua como o serviço de autenticação e autorização, gerenciando perfis e permissões de usuários[cite: 246].
  * [cite\_start]**`benefits_manager.mo`**: É a central de controle do RH para criar e gerenciar os programas de benefícios e distribuir os fundos[cite: 250].
  * [cite\_start]**`wallets.mo`**: Implementa a carteira digital de cada trabalhador, controlando saldos e o histórico de transações[cite: 251].
  * [cite\_start]**`establishment.mo`**: Gerencia o cadastro e o processamento de pagamentos para os estabelecimentos comerciais[cite: 252].

### Fluxo de Dados Principal

```
  +------------------+      1. Valida Permissão      +-------------------+
  |                  | ---------------------------> |                   |
  |  benefits_manager|      (É um RH válido?)       |   identity_auth   |
  | (Central do RH)  |                              |  (Controle Acesso)|
  |                  | <--------------------------- |                   |
  +--------+---------+      2. Resposta (Sim/Não)    +-------------------+
           |
           | 3. Credita Saldo
           |
           v
  +--------+---------+                              +-------------------+
  |                  |      5. Debita Saldo         |                   |
  |     wallets      | <--------------------------- |   establishment   |
  | (Carteira User)  |      (Processa Pagamento)    | (Terminal Loja)   |
  |                  | ---------------------------> |                   |
  +------------------+      6. Resposta (Ok/Erro)    +--------^----------+
                                                             |
                                                             | 4. Valida Permissão
                                                             |
                                                   +---------+---------+
                                                   |    identity_auth    |
                                                   +---------------------+
```

## 2\. Detalhamento dos Canisters

### `identity_auth.mo`

  * **Propósito:** Servir como o "porteiro" do sistema. Ele gerencia os perfis de todos os usuários e responde a perguntas sobre suas permissões.

  * **Regras de Negócio:**

      * Um usuário só pode se registrar uma vez com sua Internet Identity.
      * [cite\_start]Um perfil é composto por um `Principal` (ID único), nome, cargo (`#HR`, `#Worker`, `#Establishment`) e ID da empresa[cite: 191, 198, 205].
      * Fornece funções para outros canisters verificarem se um usuário pertence a uma empresa e se possui um cargo específico.

  * **Funções Públicas (API):**

| Função | Descrição | Quem Pode Chamar |
| :--- | :--- | :--- |
| `createProfile(request)` | Cria um perfil para o usuário que faz a chamada, associado à sua Internet Identity. | Qualquer novo usuário |
| `getProfile()` | Retorna o perfil do usuário que faz a chamada. | O próprio usuário |
| `hasRole(user, role)` | Verifica se um `user` específico possui um determinado `role`. | Outros canisters |
| `belongsToCompany(user, companyId)` | Verifica se um `user` específico pertence a uma `companyId`. | Outros canisters |

### `wallets.mo`

  * **Propósito:** Atuar como o "banco" de cada trabalhador, guardando seus saldos e registrando todas as movimentações.

  * **Regras de Negócio:**

      * [cite\_start]Cada trabalhador tem uma única carteira vinculada ao seu `Principal`[cite: 198].
      * [cite\_start]Os saldos são separados por tipo de benefício (`#Food`, `#Health`, etc.)[cite: 200].
      * O saldo não pode ficar negativo; uma tentativa de débito maior que o saldo falha.
      * [cite\_start]Toda transação (crédito ou débito) é registrada em um histórico[cite: 201].

  * **Funções Públicas (API):**

| Função | Descrição | Quem Pode Chamar |
| :--- | :--- | :--- |
| `createWallet(workerId)` | Cria uma carteira vazia para um trabalhador. Geralmente chamado internamente. | Outros canisters |
| `creditBalance(...)` | Adiciona fundos a um tipo de benefício específico na carteira de um trabalhador. | `benefits_manager` |
| `debitBalance(paymentRequest)` | Remove fundos de um tipo de benefício específico para pagar uma compra. | `establishment` |
| `getWallet(workerId)` | Retorna o estado completo da carteira de um trabalhador, incluindo todos os saldos. | O próprio trabalhador |
| `getTransactionHistory(workerId)`| Retorna o extrato de transações de um trabalhador. | O próprio trabalhador |

### `establishment.mo`

  * **Propósito:** Servir como o terminal de vendas e gerenciador de cadastros para os comerciantes.

  * **Regras de Negócio:**

      * [cite\_start]Um estabelecimento deve se cadastrar informando nome, país, código de negócio (ex: CNAE) e os tipos de benefício que aceita[cite: 205, 225].
      * Um pagamento (`processPayment`) só é válido se o estabelecimento estiver ativo e aceitar o tipo de benefício da compra.
      * Ao processar um pagamento, o canister orquestra a chamada para debitar o saldo da carteira do trabalhador.

  * **Funções Públicas (API):**

| Função | Descrição | Quem Pode Chamar |
| :--- | :--- | :--- |
| `registerEstablishment(request)`| Cadastra um novo estabelecimento comercial, vinculando-o ao `Principal` do chamador. | Dono do estabelecimento |
| `processPayment(request)` | Inicia o fluxo de pagamento de um trabalhador para o estabelecimento. | Dono do estabelecimento |
| `getEstablishment()` | Retorna os dados do perfil do estabelecimento que faz a chamada. | Dono do estabelecimento |
| `getTransactionHistory()` | Retorna o histórico de transações recebidas pelo estabelecimento. | Dono do estabelecimento |

### `benefits_manager.mo`

  * **Propósito:** É a ferramenta principal do RH para gerenciar todo o ciclo de vida dos benefícios.

  * **Regras de Negócio:**

      * [cite\_start]Apenas usuários com cargo `#HR` podem criar ou gerenciar programas de benefícios[cite: 191].
      * [cite\_start]Um programa de benefício define o valor, a frequência e o dia do pagamento automático[cite: 192, 212].
      * [cite\_start]Usa Timers (agendador on-chain) para executar a distribuição dos benefícios automaticamente[cite: 215].
      * Ao distribuir, ele busca todos os trabalhadores elegíveis e credita suas carteiras individualmente.

  * **Funções Públicas (API):**

| Função | Descrição | Quem Pode Chamar |
| :--- | :--- | :--- |
| `createBenefitProgram(...)` | Cria um novo programa de benefícios para uma empresa. | Usuário com cargo `#HR` |
| `assignWorkerToBenefit(...)` | Associa um trabalhador a um programa de benefícios existente. | Usuário com cargo `#HR` |
| `executeManualPayment(programId)`| Dispara manualmente a distribuição de um benefício (útil para testes ou pagamentos extras). | Usuário com cargo `#HR` |
| `getCompanyBenefitPrograms(companyId)`| Retorna todos os programas de benefício de uma empresa. | Qualquer um (consulta pública) |
| `getWorkerBenefits(workerId)` | Retorna os programas de benefício aos quais um trabalhador está associado. | O próprio trabalhador |

## 3\. Guia de Testes via Linha de Comando

Para validar todo o fluxo do backend, siga esta sequência de comandos. É necessário ter as identidades `hr_manager`, `clt_worker` e `restaurant_owner` criadas.

```bash
# PASSO 1: CADASTRAR PERFIS
dfx --identity hr_manager canister call identity_auth createProfile '(record { name = "Carla Menezes"; role = variant { HR }; companyId = opt "company-01" })'
dfx --identity clt_worker canister call identity_auth createProfile '(record { name = "Pedro Lima"; role = variant { Worker }; companyId = opt "company-01" })'
dfx --identity restaurant_owner canister call identity_auth createProfile '(record { name = "Mariana Costa"; role = variant { Establishment }; companyId = null })'

# PASSO 2: CADASTRAR ESTABELECIMENTO
dfx --identity restaurant_owner canister call establishment registerEstablishment '(record { name = "Restaurante da Mariana"; country = "BR"; businessCode = "5611201"; walletPrincipal = principal "'$(dfx --identity restaurant_owner identity get-principal)'"; acceptedBenefitTypes = vec { variant { Food } } })'

# PASSO 3: CRIAR PROGRAMA DE BENEFÍCIO
dfx --identity hr_manager canister call benefits_manager createBenefitProgram '("Vale Refeição Mensal", variant { Food }, "company-01", 100000, variant { Monthly }, 5)'

# PASSO 4: ASSOCIAR TRABALHADOR
# Primeiro, pegue o Principal do trabalhador:
# dfx --identity clt_worker identity get-principal
# Depois, cole o Principal no comando abaixo:
dfx --identity hr_manager canister call benefits_manager assignWorkerToBenefit '(principal "<COLE_O_PRINCIPAL_DO_WORKER_AQUI>", "program_1", null)'

# PASSO 5: PAGAR O BENEFÍCIO
dfx --identity hr_manager canister call benefits_manager executeManualPayment '("program_1")'

# PASSO 6: VERIFICAR SALDO
dfx --identity clt_worker canister call wallets getWallet '(principal "'$(dfx --identity clt_worker identity get-principal)'")'

# PASSO 7: GASTAR O BENEFÍCIO
# Cole o Principal do trabalhador novamente:
dfx --identity restaurant_owner canister call establishment processPayment '(record { workerId = principal "<COLE_O_PRINCIPAL_DO_WORKER_AQUI>"; benefitType = variant { Food }; amount = 2500; description = "Almoço"})'

# PASSO 8: VERIFICAR SALDO FINAL
dfx --identity clt_worker canister call wallets getWallet '(principal "'$(dfx --identity clt_worker identity get-principal)'")'
```

## 4\. Guia de Integração para o Frontend

Para conectar o frontend (React/TypeScript) ao backend, o fluxo principal é:

1.  **Geração dos Tipos:** Após cada `dfx deploy`, uma pasta `src/declarations` é criada/atualizada. Ela contém os arquivos TypeScript que descrevem as funções dos seus canisters. Você irá importar os "atores" a partir desta pasta.

2.  **Autenticação:** Use a biblioteca `@dfinity/auth-client` para o login.

      * Crie uma instância de `AuthClient`.
      * Chame `authClient.login()` para redirecionar o usuário para a tela do Internet Identity.
      * Após o login, `authClient.getIdentity()` retornará a `identity` do usuário, que é a "chave" para fazer chamadas autenticadas.

3.  **Criação do Ator:** No seu código React, importe o ator do canister desejado e crie uma instância dele, passando a `identity` do usuário.

    ```typescript
    // Exemplo para o canister benefits_manager
    import { createActor as createBenefitsManagerActor, canisterId as benefitsManagerCanisterId } from "src/declarations/benefits_manager";
    import { AuthClient } from "@dfinity/auth-client";

    // Supondo que você tenha uma instância do authClient
    const authClient = await AuthClient.create();

    // Após o login
    const identity = authClient.getIdentity();

    const benefitsManager = createBenefitsManagerActor(benefitsManagerCanisterId, {
      agentOptions: {
        identity,
      },
    });
    ```

4.  **Chamando as Funções:** Agora você pode chamar as funções do backend como se fossem funções TypeScript normais.

    ```typescript
    async function carregarProgramas() {
      try {
        const programas = await benefitsManager.getCompanyBenefitPrograms("company-01");
        console.log("Programas da empresa:", programas);
        // Atualize o estado do seu componente React com os programas
      } catch (error) {
        console.error("Falha ao buscar programas:", error);
      }
    }
    ```

Este fluxo garante que cada chamada do frontend para o backend seja autenticada com a identidade do usuário logado, permitindo que as regras de negócio de segurança nos canisters funcionem corretamente.