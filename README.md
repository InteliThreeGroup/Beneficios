# BeneChain

BeneChain is a fully on-chain corporate benefits platform built **exclusively on the Internet Computer Protocol (ICP)**. It empowers companies to create, distribute, and monitor employee benefit programs without intermediaries — using smart contracts (canisters) to ensure full transparency, automation, and auditability.

Traditional corporate benefits systems are plagued by inefficiencies:

* High transaction and processing fees
* Payment delays to merchants
* Lack of control and traceability for HR departments
* Inflexible benefit programs with low portability for employees

BeneChain offers a paradigm shift. By leveraging the **unique capabilities of ICP**, we’ve created a decentralized platform that connects HR managers, employees, and merchants directly through on-chain logic — with zero reliance on Web2 infrastructure or third-party processors.

### What’s New

BeneChain has evolved beyond the initial core to include powerful new modules, **all deployed on ICP mainnet**:

* **AI-powered Corporate Challenges (`challenge_ai.mo`)**
  Generates personalized wellness, productivity, and culture-building challenges for employees, with tokenized rewards.
* **Challenge Management (`challenges.mo`)**
  Supports submission, approval/rejection, and automatic reward distribution directly on-chain.
* **Worker & Merchant Wallets (`wallets.mo`, `establishments.mo`)**
  Enable instant, gas-free payments with real-time balances and auditable histories.
* **Automated Reporting (`reporting.rs`)**
  Generates structured benefit usage reports, enabling HR to track adoption, compliance, and ROI.
* **Identity & Role Control (`identity_auth.mo`)**
  Uses **Internet Identity** to securely manage HR, worker, and merchant roles with portability across companies.

> **Special Note**: The **Bitcoin integration (`bitcoin_manager.mo`)** is under active testing. Currently it runs in a local environment connected to the Bitcoin **regtest** network, before being migrated to mainnet.

### Why ICP Matters

None of this would be possible without ICP’s native stack:

* **Reverse Gas Model** → Companies sponsor transactions, ensuring **zero friction** for workers and merchants.
* **Internet Identity** → Secure, portable login with WebAuthn, without custodial wallets.
* **On-chain Timers** → Automated, deterministic benefit distributions.
* **HTTPS Outcalls** → Direct connection from canisters to external APIs (e.g., ERP sync, CNPJ validation).
* **Chain-key Cryptography** → Enables seamless authentication and cross-service integration.

By building **entirely on ICP**, BeneChain achieves:

* End-to-end decentralization
* Gasless UX for non-crypto users
* Fully auditable, transparent governance
* Real-time automation without Web2 servers

![image](./assets/Sol1.png)

**Business Plan:** [Link](./BusinessPlan.md)

**Pitch Deck:** [Link](https://github.com/InteliThreeGroup/Beneficios/blob/main/assets/Pitch%20Deck%20BeneChain.pdf)

**Demo Video:** [Link](https://youtu.be/UYSJWSu4KBE)

## Core Value Proposition

* **HR Departments**
  Gain full control over benefit rules, real-time dashboards, automated reporting, and audit trails — reducing fraud, manual work, and bureaucracy. With the new **challenge management system**, HR can also launch **AI-powered engagement programs** to boost productivity and well-being.

* **Workers**
  Receive **portable, on-chain wallets** linked to their Internet Identity, with real-time balance tracking and zero gas fees. They also participate in **corporate challenges** (health, sustainability, learning, culture) and earn tokenized rewards — creating a new layer of motivation and recognition.

* **Merchants**
  Are paid instantly with minimal fees through a self-service dashboard and secure on-chain validation. By integrating with ICP canisters, merchants get full transparency and traceability of every transaction.

* **Corporate Culture & Engagement**
  Through `challenge_ai.mo` and `challenges.mo`, companies can gamify employee experience: workers join challenges, submit proofs, and earn rewards in tokens — all managed by smart contracts. This creates a **direct link between benefits and organizational values**, something not possible in Web2 benefit systems.

BeneChain ensures that benefits are distributed fairly, used according to company-defined rules, and traceable from origin to destination — all within the decentralized runtime of the ICP blockchain.


## Track: **Fully On-Chain**

BeneChain fits perfectly into the **Fully On-Chain** track of the WCHL 2025 Hackathon. All business logic, data storage, user authentication, and interface hosting are implemented within ICP canisters.

This guarantees:

* **Total decentralization** – No reliance on Web2 servers or middleware.
* **AI-powered automation** – Corporate challenges generated directly by smart contracts calling external APIs through **HTTPS outcalls**.
* **Deterministic scheduling** – Monthly distributions and challenge deadlines enforced with **on-chain timers**, without CRON jobs.
* **End-to-end identity & roles** – Workers, HRs, and merchants authenticated via **Internet Identity** with role-based permissions.
* **Cross-domain flexibility** – Workers can carry their wallet and reputation across employers, since everything lives **fully on-chain**.

**Deployment status**:

* All canisters (wallets, HR management, reporting, establishments, challenges, AI) are live on **ICP mainnet**.
* The **Bitcoin module (`bitcoin_manager.mo`)** is in **regtest phase**, running locally for validation before mainnet release.

BeneChain isn’t just another dApp with hybrid architecture. It is **100% on-chain by design**, leveraging ICP’s stack to replace the patchwork of off-chain APIs, databases, and custodial wallets that traditional systems depend on.

## Justification for the “Fully On-Chain” Track

BeneChain was purposefully built to fully align with the “Fully On-Chain” track of the WCHL 2025 Hackathon. All core logic, data storage, permission handling, user identities, and UI hosting are executed entirely inside ICP canisters, without any reliance on off-chain infrastructure. This architectural decision was not only intentional — it was essential to solving the challenges of the corporate benefits industry in a decentralized, scalable way.

## Why This Project Can Only Be Built on ICP (atualizado)

The Internet Computer Protocol (ICP) offers a unique set of capabilities that no other blockchain provides in a native, seamless environment. BeneChain is not just deployed on ICP — it is **architecturally dependent** on its features to exist as a fully on-chain corporate benefits platform.

### 1. Canisters as Full-Stack Smart Contracts

* **How we use it**:
  Every module is implemented as a dedicated canister:

  * `benefits_manager.mo` → manages benefit distribution and HR rules
  * `wallet.mo` → portable, on-chain employee wallets
  * `establishment.mo` → merchant validation and payments
  * `identity_auth.mo` → role-based access with Internet Identity
  * `reporting.rs` → advanced reporting engine
  * `challenges.mo` → challenge lifecycle (create, join, validate, reward)
  * `challenge_ai.mo` → AI-driven challenge generator via HTTPS outcalls
  * `bitcoin_manager.mo` → bridges ICP with Bitcoin (currently in regtest phase)

* **Why ICP**:
  Unlike EVM contracts, ICP canisters behave like **persistent microservices** with native state, APIs, and large storage — enabling us to build an entire HR platform fully on-chain, without external databases or servers.

### 2. Reverse Gas Model

* **How we use it**:

  * HR departments cover the cycles for distributions, challenge creation, and reward payments.
  * Workers and merchants **never pay fees**, which ensures mass adoption in non-crypto corporate environments.

* **Why ICP**:
  Only ICP natively supports this UX-critical model. In EVM-based blockchains, employees would need tokens to claim their benefits, creating adoption barriers.

### 3. Internet Identity (II)

* **How we use it**:
  Internet Identity handles authentication across **all canisters**. Workers, HR managers, and merchants are mapped to Principals with roles (`#Worker`, `#HR`, `#Establishment`).
  Even when workers change jobs, their benefits and challenge history remain portable since everything is bound to their II Principal.

* **Why ICP**:
  Secure, WebAuthn-based, and privacy-preserving authentication — something unmatched in traditional wallets or login systems.

### 4. On-Chain Timers

* **How we use it**:

  * `benefits_manager.mo` → executes monthly benefit distribution automatically.
  * `challenges.mo` → enforces challenge deadlines (e.g., 7-day wellness challenges, 30-day learning programs).

* **Why ICP**:
  No other blockchain has **deterministic, native scheduling** for smart contracts. ICP’s timers allow BeneChain to operate HR processes without external CRON jobs or off-chain bots.

### 5. HTTPS Outcalls

* **How we use it**:

  * `challenge_ai.mo` → calls Gemini API to **generate AI-powered corporate challenges** (JSON-structured, sector-specific).
  * `establishment.mo` and `reporting.rs` (planned) → will validate business identifiers (e.g., CNPJs) and sync ERP data directly from canisters.

* **Why ICP**:
  On ICP, smart contracts themselves perform HTTPS requests natively. No need for oracles like Chainlink. This makes **AI-driven engagement** and **ERP integrations** possible directly on-chain.

### 6. Chain Key Cryptography

* **How we use it**:

  * `bitcoin_manager.mo` signs Bitcoin transactions directly from ICP.
  * Currently, we run it in **regtest mode** for testing, but once stable, it will allow **direct Bitcoin benefit payments** without bridges or custodians.

* **Why ICP**:
  Only ICP can interact natively with Bitcoin and Ethereum via chain-key cryptography. This removes centralized bridges and opens the door for multichain benefits (e.g., paying part in BTC, part in ICP tokens).


### In-Code Evidence

* All core logic is stored on-chain, verifiable in the `dfx.json` file and deployed to the ICP mainnet.
* No backend service or database is required — each `Principal` and their associated data are stored and queried directly within canisters.
* The frontend is served from an `asset canister`, fully hosted on-chain via `icx-asset`, eliminating the need for any off-chain frontend deployment (e.g., IPFS, Vercel).
* Inter-canister calls enforce **role-based permissions** via the `identity_auth.mo` service, instead of relying on off-chain middleware or APIs.

### Conclusion

The “Fully On-Chain” nature of BeneChain is not a design preference, it is a technical necessity. Without the features provided by ICP, this platform would require complex off-chain orchestration, gas fee management, and third-party integrations. Instead, thanks to the ICP stack, BeneChain achieves:

* End-to-end decentralization
* Seamless UX for all user roles
* Deterministic automation
* Transparent governance and traceability

BeneChain doesn’t just run on the Internet Computer — it embodies the core vision of what a fully on-chain dApp should be.

## System Architecture

BeneChain is architected as a modular, decentralized system built entirely on the Internet Computer Protocol (ICP). Each component is deployed as a smart contract (canister), following a microservices pattern and strict separation of concerns. Even the frontend is hosted in an asset canister, ensuring 100% on-chain execution, with zero reliance on Web2 infrastructure.

All modules are already live on the ICP mainnet, with the exception of the Bitcoin payments canister, which is currently undergoing testing in regtest mode before mainnet rollout.

## 1. High-Level System Overview – Full Architecture

This diagram presents the complete application architecture of **BeneChain**, from the user interface to on-chain execution inside the Internet Computer Protocol.

![System Architecture](./assets/arquitetura.png)

### Layer-by-Layer Breakdown

#### **Frontend (Client-Side)**

Built using:

* **React**: Component-based UI
* **TypeScript**: Type safety across the application
* **TailwindCSS**: Fast and responsive styling

Deployed on an **ICP asset canister** via `icx-asset`, ensuring that the entire UI runs on-chain and requires no Web2 infrastructure.

#### **Authentication (Internet Identity)**

* **Internet Identity (II)** provides passwordless, WebAuthn-based authentication (biometrics or hardware keys).
* Each user receives a unique `Principal`, which acts as a persistent on-chain identity.
* Roles (`#HR`, `#Worker`, `#Establishment`) are enforced by the `identity_auth.mo` canister.


#### **Core Canisters (Smart Contracts)**

1. **`identity_auth.mo`**
   Role-based access control (HR, Worker, Merchant). Centralized identity authority.

2. **`benefits_manager.mo`**
   HR creates and manages benefit programs. Includes **on-chain timers** for automated monthly distributions.

3. **`wallets.mo`**
   Portable worker wallets, storing balances by benefit type. Manages credits, debits, and logs.

4. **`establishment.mo`**
   Merchant onboarding, transaction validation, and dashboard for payment history.

5. **`challenges.mo`** *(New)*
   Corporate challenges system. Supports creation, submission, approval/rejection, and tokenized rewards. Uses ICP timers for deadlines.

6. **`challenge_ai.mo`** *(New)*
   AI-driven challenge generator. Uses **HTTPS outcalls** to connect with Gemini API, returning structured challenges on-chain.

7. **`llm_home.mo`** *(New)*
   Specialized LLM agent that answers questions **strictly about BeneChain**, ensuring contextualized corporate Q\&A.

8. **`btc_payments.mo`** *(New — Testing Phase)*
   Direct Bitcoin integration via **Chain Key ECDSA**. Supports UTXO retrieval, SegWit transaction building, and signing. Currently running in **regtest mode**, with mainnet deployment planned after stability validation.

9. **`reporting.rs`** *(Planned)*
   Rust-based analytics and ERP integration, leveraging ICP HTTPS outcalls for external sync (e.g., CNPJs, HR data).


#### Internet Computer Features Used

BeneChain depends directly on exclusive ICP features:

* **Reverse Gas Model** → HR sponsors cycles, making the system **gasless for workers and merchants**.
* **On-Chain Timers** → Used in `benefits_manager.mo` (scheduled distributions) and `challenges.mo` (challenge deadlines).
* **HTTPS Outcalls** → Already live in `challenge_ai.mo`; planned for ERP integrations in `reporting.rs`.
* **Chain Key Cryptography** → Powers Bitcoin transactions in `btc_payments.mo`.
* **Asset Canister** → Fully on-chain frontend hosting.

#### Architectural Strengths

| Property              | Benefit                                                              |
| --------------------- | -------------------------------------------------------------------- |
| **Fully On-Chain**    | All logic, storage, and UI hosted natively on ICP                    |
| **Secure by Design**  | Access control via Internet Identity Principals                      |
| **AI-Integrated**     | On-chain LLM and AI challenge generation via HTTPS outcalls          |
| **Multichain Ready**  | Native Bitcoin support through ICP Chain Key Cryptography            |
| **Gasless UX**        | Workers and merchants never pay fees                                 |
| **Modular Canisters** | Clear separation of responsibilities by user role and business logic |
| **Auditable**         | All actions and transactions are persisted on-chain for traceability |


## 2. Interaction Flow – From Browser to Canisters

This diagram illustrates the **complete interaction pipeline** from end users to the decentralized backend of **BeneChain**, showcasing how the platform delivers a **Web2-like experience** while running **100% natively on the Internet Computer (ICP)**. Every interaction — from login to payments — is executed on-chain, with no reliance on off-chain servers or third-party infrastructure.

![User-to-Canister Flow](./assets/Frontend.png)


### Flow Description

#### User Entry Points

* **HR Departments**, **Workers**, and **Merchants** access BeneChain directly via a standard web browser (Chrome, Edge, Firefox).
* No extensions, wallet installations, or crypto onboarding are required — the UX is designed to feel **as simple as any Web2 SaaS application**.

#### Web Frontend

The entire frontend runs on-chain as an **ICP asset canister**, ensuring immutability and decentralization. It is built with:

* **React** – Component-driven, modular user interface
* **TypeScript** – Strong typing for reliable integration with ICP declarations
* **TailwindCSS** – Responsive, modern styling system
* **Internet Identity (II)** – Passwordless authentication using WebAuthn (fingerprint, FaceID, security keys)

Upon login, each user receives a unique **Principal**, which acts as their **persistent on-chain identity**. This Principal governs authorization and is used in every transaction and permission check across canisters.

#### Backend (ICP Canisters)

Once authenticated, all user actions are routed to modular smart contracts, each designed with a **single-responsibility principle** to maximize scalability and maintainability:

| Canister              | Purpose                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `identity_auth.mo`    | Role management (`HR`, `Worker`, `Merchant`), profile creation, and access control            |
| `benefits_manager.mo` | HR-driven benefit program creation, scheduling (on-chain timers), and automated distributions |
| `wallets.mo`          | Worker balances, deposits/withdrawals, and auditable transaction history                      |
| `establishment.mo`    | Merchant onboarding, payment acceptance, and settlement flows                                 |
| `challenges.mo`       | Creation, submission, and review of company-sponsored challenges with rewards                 |
| `challenge_ai.mo`     | AI-generated challenges powered by **HTTPS outcalls** to external LLMs (Gemini API)           |
| `llm_home.mo`         | On-chain LLM assistant for **BeneChain-specific knowledge and user support**                  |
| `btc_payments.mo`     | Bitcoin transactions using **Chain Key ECDSA**, enabling native cross-chain settlement        |
| `reporting.rs`        | (Planned) Advanced analytics and ERP integrations via **HTTPS outcalls**                      |

All logic, data, and UI live **exclusively on ICP**, ensuring **high availability, censorship resistance, auditability, and transparency**.


### Key Highlights

* **Frictionless UX** → Users log in with biometrics, no wallets or seed phrases required.
* **Reverse Gas Model** → Workers and merchants never pay fees; HR departments cover cycles.
* **Web2 Simplicity, Web3 Trust** → End-to-end decentralization without compromising usability.
* **Cross-Chain Ready** → Native Bitcoin support via Chain Key cryptography.
* **AI-Enhanced** → On-chain agents and AI challenge generation integrated natively into workflows.
* **Future-Proof** → Modular microservices architecture makes adding new features seamless.
* **Auditable & Secure** → Every transaction, action, and record is stored immutably on-chain.

## 3. Sequence Diagram – Dynamic Execution Flow

This diagram illustrates the dynamic flow of method calls between user actors (**HR, Worker, Merchant**) and the core canisters that orchestrate identity, benefits, wallets, and payment operations in **BeneChain**.

![Sequence Diagram](./assets/Diagrama%20de%20sequência%20básico.png)

### Step-by-Step Breakdown

1. **HRManager → `identity_auth.createProfile()`**
   Registers the HR manager with a company ID, role `#HR`, and unique `Principal`.

2. **Worker → `identity_auth.createProfile()`**
   Registers the employee under the same or another company, role `#Worker`.

3. **Merchant → `identity_auth.createProfile()`**
   Registers a merchant account with role `#Establishment`.

4. **HRManager → `benefits_manager.createBenefitProgram()`**
   Creates a benefit program by providing the company ID, frequency (e.g., monthly), and the benefit type (`#Food`, `#Culture`, etc.).

5. **`benefits_manager` → `identity_auth.hasRole(#HR)` + `belongsToCompany()`**
   Validates that the caller is an authorized HR manager.

6. **HRManager → `benefits_manager.assignWorkerToBenefit()`**
   Associates the worker (by `Principal`) to the created benefit program.

7. **`benefits_manager` → `wallets.createWallet(worker)`**
   Initializes a wallet entry for the worker if none exists.

8. **(Automated) `benefits_manager.executePayment()`**
   Triggered by **on-chain timers** at scheduled intervals.

9. **`benefits_manager` → `wallets.creditBalance()`**
   Credits the appropriate benefit amount into the worker’s wallet.

10. **Merchant → `establishment.processPayment()`**
    Initiates a transaction when the worker uses their wallet at a registered establishment.

11. **`establishment` → `identity_auth.hasRole(establishment)`**
    Ensures that the merchant is registered and authorized.

12. **`establishment` → `wallets.debitBalance()`**
    Debits the worker’s wallet by the benefit amount.

13. **`wallets` → `establishment.confirmPayment()`**
    Confirms the transaction status back to the merchant.

### Observations

* **Asynchronous calls** between canisters ensure scalability.
* **Reverse Gas Model** removes friction for workers and merchants (HR sponsors cycles).
* **Full auditability** through `getTransactionHistory()` endpoints in `wallets` and `establishment`.
* **Hybrid execution model** → user-triggered flows (enrollments, payments) + automated flows (scheduled benefit distributions).

To illustrate BeneChain’s evolution, the following sequence diagrams complement the core execution flow by covering **new canisters**:

## 3.1 Sequence Diagram – Challenges Canister (`challenges.mo`)

This diagram illustrates the lifecycle of a challenge, from creation by HR to submission and review by workers.

![Challenges Sequence](./assets/seq/challenges.png)

**Step-by-Step Breakdown:**

1. **HR → `challenges.createChallenge()`**
   HR registers a new challenge with `title`, `description`, `deadline`, and `reward`.
2. **Worker → `challenges.submitToChallenge()`**
   Worker submits content for a given challenge.
3. **HR → `challenges.approveOrRejectSubmission()`**
   HR evaluates the worker’s submission.
4. **System → `challenges.getActiveChallenges()`**
   Workers or HR can retrieve the list of open challenges.
5. **System → `challenges.getSubmissionsForChallenge()`**
   Retrieves all submissions for review.

**Observations:**

* Challenges incentivize participation with on-chain rewards.
* Submissions are fully auditable and linked to `Principal` IDs.

## 3.2 Sequence Diagram – AI-Powered Challenge Evaluation (`challenges_ai.mo`)

This diagram highlights how AI is leveraged to assist in evaluating submissions.

![Challenges AI Sequence](./assets/seq/challenge_ai.png)

**Step-by-Step Breakdown:**

1. **HR → `challenges_ai.evaluateSubmission()`**
   HR requests AI support to analyze worker submissions.
2. **`challenges_ai` → `llm_home.askGemini()`**
   The canister routes the request to the LLM service.
3. **`llm_home` → External LLM API**
   Executes semantic and qualitative evaluation of the content.
4. **Response → `challenges_ai`**
   The AI returns structured insights (scores, recommendations, or comments).
5. **HR → `challenges_ai.getEvaluationReport()`**
   HR retrieves the AI-generated evaluation report.

**Observations:**

* Enhances HR productivity by automating first-pass reviews.
* Ensures consistency and reduces bias in evaluation.

## 3.3 Sequence Diagram – Bitcoin Payments (`btc_payments.mo`)

This diagram explains the process of handling Bitcoin-based benefits distribution and merchant settlement.

![BTC Payments Sequence](./assets/seq/btc.png)

**Step-by-Step Breakdown:**

1. **HR → `btc_payments.get_balance()`**
   Queries available BTC balance in the company’s canister-managed wallet.
2. **HR → `btc_payments.send_btc(worker_address)`**
   Initiates a Bitcoin transfer to a worker’s BTC address.
3. **`btc_payments` → ICP Bitcoin API**
   Uses the IC Bitcoin integration to broadcast the transaction.
4. **Worker Wallet → Confirm Receipt**
   Worker receives BTC natively, no intermediaries.

**Observations:**

* Fully decentralized BTC handling via ICP Bitcoin integration.
* No custodial risk — funds move directly from canister to worker.


## 3.4 Sequence Diagram – LLM Home Integration (`llm_home.mo`)

This diagram showcases how the system integrates with external LLMs (e.g., Gemini) for contextual Q\&A and automation.

![LLM Home Sequence](./assets/seq/llm_home.png)

**Step-by-Step Breakdown:**

1. **User → `llm_home.askBeneChainAgent()`**
   Worker, HR, or Merchant asks a question or requests insights.
2. **`llm_home` → `getBeneChainInfo()`**
   Retrieves relevant on-chain data from other BeneChain canisters.
3. **`llm_home` → `callGeminiAPI()`**
   Sends enriched context to the Gemini API.
4. **Gemini → `llm_home.extractTextFromGeminiResponse()`**
   Processes and filters the LLM response.
5. **Response → User**
   User receives contextualized and trustworthy output.

**Observations:**

* Bridges on-chain BeneChain data with off-chain intelligence.
* Provides a natural language interface for querying the system.

## 4. User Flow Diagram – Experience Across Roles

This diagram outlines the high-level user experience for each main role in BeneChain. It showcases the simplicity of the onboarding and operational flow, leveraging Internet Identity and a streamlined UI for each user type.

![User Flow Diagram](./assets/4.png)


#### HR (Human Resources)

* **Login via Internet Identity**: No seed phrase or extension required. Identity is verified through WebAuthn.
* **Create Benefit Program**: Define type (e.g. #Food, #Culture), value, and frequency (e.g. monthly).
* **Assign Workers**: Add or remove participants from benefit programs.
* **View Reports**: Monitor usage, view transaction logs, and detect anomalies via on-chain queries.


#### Worker (Employee)

* **Login via Internet Identity**: Single identity across jobs, portable between employers.
* **View Wallet**: Displays categorized token balances (e.g. Food, Health).
* **Make Purchase via QR**: Interact with merchants directly using a QR code linked to their benefit wallet.


#### Merchant (Establishment)

* **Login via Internet Identity**: Onboards seamlessly, no need to manage private keys or wallets.
* **Register**: Provides business ID (e.g. CNAE) and defines accepted benefit types.
* **Accept Payment**: Authorizes and confirms transactions directly from worker wallets.

### 4.2 End-to-End Interaction Flow

This diagram highlights the **workflow between HR and Workers**, including benefit distribution, challenge creation, and worker engagement.

![User Flow Diagram – HR & Worker Interaction](./assets/fluxo2.png)

#### HR Perspective

* **Login via Internet Identity** → Accesses secure company dashboard.
* **Create Benefit Program** → Defines incentives and allocates funds.
* **Assign Workers** → Associates employees to programs.
* **Create Challenge** → Adds gamification elements to boost engagement.
* **Approve/Reject Submissions** → Reviews worker contributions to challenges.
* **View Reports** → Tracks benefit usage and challenge outcomes.

#### Worker Perspective

* **Login via Internet Identity** → Unified login experience.
* **View Wallet** → Sees real-time balances of benefits.
* **Make Purchase via QR** → Pays merchants seamlessly.
* **Submit to Challenge** → Engages with company challenges, potentially earning extra rewards.


### Highlights Across Flows

* **Unified login** – Internet Identity powers all roles with frictionless WebAuthn.
* **Gamified engagement** – Challenges increase adoption and employee participation.
* **Frictionless payments** – QR-based merchant payments, gasless, with HR sponsoring cycles.
* **Data transparency** – All actions recorded on-chain for auditability.
* **Mobile-first** – User interface designed for accessibility on-the-go.

## 5. Canister Responsibilities and Interfaces (UML View)

This section provides an updated static overview of the BeneChain architecture, focusing on the canisters (smart contracts) and service modules that compose the system. Each canister encapsulates its own state and exposes a well-defined public interface, ensuring separation of concerns, modularity, and scalability.

In addition to the original core (identity, benefits, wallets, establishments, reporting), the platform has evolved to integrate:

* Challenges Engine (challenges.mo): gamified incentives and worker engagement.

* AI Assistance (ChallengeAI and llm_home): automatic challenge generation, conversational guidance, and contextual support powered by LLMs.

* BTC Payments (btc_payments): Bitcoin-native transactions alongside benefit tokens, extending multi-asset capabilities.

This modular expansion demonstrates how BeneChain combines Web3 primitives (ICP canisters + Bitcoin integration) with AI-driven user experiences (LLM-powered automation and guidance). The design is prepared for future growth, while maintaining a gasless, user-friendly experience for HRs, workers, and merchants.

![Canister UML Diagram](./assets/contractUml.png)

### `identity_auth.mo`

**Purpose**: Manage user profiles and role-based access control.

**Data model:**

```motoko
Profile {
  principal: Principal,
  name: Text,
  role: Role,         // #HR | #Worker | #Establishment
  companyId: ?Text
}
```

**Public Functions:**

* `createProfile()`: Registers the caller with their name, role, and company.
* `getProfile()`: Returns the profile of the authenticated caller.
* `hasRole(principal, role)`: Checks if a principal has a specific role.
* `belongsToCompany(principal, companyId)`: Validates company affiliation.

###  `benefits_manager.mo`

**Purpose**: Handle creation, configuration, assignment, and distribution of benefit programs.

**Data model:**

```motoko
BenefitProgram {
  id: Text,
  type: BenefitType,     // #Food, #Culture, etc.
  companyId: Text,
  amount: Nat,
  frequency: Frequency,  // #Monthly, #Weekly, etc.
  day: Nat
}
```

**Public Functions:**

* `createBenefitProgram()`: Defines a new benefit rule for a company.
* `assignWorkerToBenefit()`: Associates a worker to a benefit program.
* `executeManualPayment()`: Triggers a distribution manually (also run via Timer).
* `getCompanyBenefitPrograms()`: Lists all programs linked to a company.


### `establishment.mo`

**Purpose**: Manage merchant registration and process payments from workers.

**Data model:**

```motoko
Establishment {
  principal: Principal,
  name: Text,
  country: Text,
  businessCode: Text,
  acceptedBenefits: [BenefitType]
}
```

**Public Functions:**

* `registerEstablishment()`: Registers a merchant and defines accepted benefit types.
* `processPayment()`: Validates and executes payments from workers.
* `getTransactionHistory()`: Returns the merchant’s payment history.


### `wallets.mo`

**Purpose**: Serve as the worker's on-chain wallet with multiple benefit balances.

**Data model:**

```motoko
balances: Principal -> BenefitType -> Nat
transactions: Principal -> [Transaction]
```

**Public Functions:**

* `createWallet()`: Initializes a new wallet for a worker.
* `creditBalance()`: Adds tokens for a specific benefit.
* `debitBalance()`: Removes tokens upon merchant payment.
* `getWallet()`: Returns all current balances by benefit type.
* `getTransactionHistory()`: Retrieves past operations for auditing.



### `reporting.rs`

**Purpose** *(Planned)*: Aggregate and export system-level analytics and metrics.

**Public Functions:**

* `generateReport(companyId)`: Produces a report with benefit usage per company.
* `callERPoutcall()`: Initiates a secure HTTP request to external ERP systems (via HTTPS Outcalls).

### The Second UML Diagram - With new Canisters

![Canister UML Diagram](./assets/uml2.png)


### `challenges.mo`

**Purpose**: Manage benefit-linked challenges and worker submissions.

**Data model:**

```motoko
Challenge {
  id: Text,
  title: Text,
  description: Text,
  companyId: Text,
  reward: Nat,
  deadline: Time,
  isActive: Bool,
  createdAt: Time,
  createdBy: Principal
}

Submission {
  id: Text,
  challengeId: Text,
  workerId: Principal,
  workerName: Text,
  submissionContent: Text,
  submittedAt: Time,
  status: SubmissionStatus // #Pending | #Approved | #Rejected
}
```

**Public Functions:**

* `createChallenge()`: HR creates a new challenge.
* `submitToChallenge()`: Worker submits proof of participation.
* `approveOrRejectSubmission()`: HR validates or rejects a submission.
* `getActiveChallenges()`: Lists currently active challenges.
* `getSubmissionsForChallenge()`: Returns all submissions for a challenge.
* `getSubmissionsForWorker()`: Lists all submissions by a specific worker.
* `getChallengeById()`: Retrieves challenge details by ID.

---

### `ChallengeAI` (Integration Module)

**Purpose**: Leverage LLMs (Gemini API) to auto-generate, validate, and customize challenges.

**Data model:**

```motoko
challenge_ia {
  url: Text = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  apiKey: Text
}
```

**Public Functions:**

* `generateChallenge()`: Creates a challenge draft.
* `generateMultipleChallenges()`: Suggests multiple variations.
* `customizeChallenge()`: Adapts a challenge to HR preferences.
* `suggestReward()`: Proposes appropriate incentives.
* `chatAboutChallenges()`: Provides conversational support.
* `validateChallenge()`: Validates clarity and fairness of a challenge.
* `getAssistantInfo()`: Returns context on AI suggestions.
* `callGeminiAPI()`: Direct API call to Gemini.
* `extractTextFromGeminiResponse()`: Cleans raw LLM response into structured text.

---

### `btc_payments`

**Purpose**: Enable BTC-based payments directly on-chain, expanding beyond benefit tokens.

**Data model:**

```motoko
BtcPayments {
  ic: Principal,
  keyId: Text,
  net: Text // #mainnet | #testnet
}
```

**Public Functions:**

* `get_own_pubkey_hash160()`: Returns public key hash for BTC payments.
* `get_balance()`: Fetches BTC balance.
* `send_btc()`: Sends Bitcoin to an address.
* `derivation()`: Handles key derivation.
* `hex()`: Converts data to hex.
* `reverseBytes()`: Utility for BTC operations.

---

### `llm_home`

**Purpose**: Provide conversational AI capabilities to workers, HR, and merchants through contextual prompts.

**Data model:**

```motoko
llm_home {
  BENECHAIN_CONTEXT: Text,
  url: Text,
  apiKey: Text
}
```

**Public Functions:**

* `askBeneChainAgent()`: Asks the AI agent about platform usage.
* `askGemini()`: General-purpose Q\&A via Gemini.
* `getBeneChainInfo()`: Returns contextual information about BeneChain.
* `callGeminiAPI()`: Calls Gemini directly.
* `extractTextFromGeminiResponse()`: Extracts structured answers from LLM output.

### **Highlights of the Updated UML**

* Expanded **challenge ecosystem** with AI support (`ChallengeAI`) for automatic generation and validation.
* Added **BTC Payments module**, enabling multi-asset financial flows.
* Integrated **LLM assistant** (`llm_home`) for conversational support inside the platform.
* Architecture remains modular and extensible, aligned with ICP’s **canister isolation** model.


## 6. Canister Responsibilities Table

The table below summarizes the responsibilities, access scope, and language implementation of each core and extended smart contract (canister) in the BeneChain system. This view reflects the modular expansion of the platform into **AI-powered workflows** and **Bitcoin-native transactions**, while maintaining separation of concerns.

| Canister / Module     | Description                                                                | Language | Accessed by                            | Key Methods                                                                        |
| --------------------- | -------------------------------------------------------------------------- | -------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `identity_auth.mo`    | Manages user identity, role-based access control, and company linkage      | Motoko   | All canisters, users                   | `createProfile()`, `hasRole()`, `belongsToCompany()`                               |
| `benefits_manager.mo` | Creates, schedules, and distributes benefit programs                       | Motoko   | HR, Timer, Wallets                     | `createBenefitProgram()`, `assignWorkerToBenefit()`, `executeManualPayment()`      |
| `wallets.mo`          | Stores balances and transaction logs per worker and benefit type           | Motoko   | BenefitsManager, Establishment, Worker | `creditBalance()`, `debitBalance()`, `getWallet()`                                 |
| `establishment.mo`    | Registers merchants, processes payments from workers                       | Motoko   | Merchants, Wallets                     | `registerEstablishment()`, `processPayment()`                                      |
| `challenges.mo`       | Manages gamified challenges, submissions, and approvals                    | Motoko   | HR, Workers                            | `createChallenge()`, `submitToChallenge()`, `approveOrRejectSubmission()`          |
| `ChallengeAI`         | AI service wrapper for challenge creation and customization (Gemini API)   | External | Challenges canister, HR UI             | `generateChallenge()`, `suggestReward()`, `validateChallenge()`, `callGeminiAPI()` |
| `btc_payments.mo`     | Provides Bitcoin-native balance, send, and address derivation functions    | Motoko   | Workers, Establishments                | `get_balance()`, `send_btc()`, `get_own_pubkey_hash160()`, `derivation()`          |
| `llm_home`            | Conversational AI assistant with BeneChain context (LLM integration layer) | External | Workers, HR, Admin                     | `askBeneChainAgent()`, `getBeneChainInfo()`, `extractTextFromGeminiResponse()`     |
| `reporting.rs`        | (Planned) Aggregates usage metrics, performs outcalls to ERPs              | Rust     | Internal/Analytics                     | `generateReport()`, `callERPoutcall()`                                             |
| `BENEFICIOS_frontend` | Serves the entire web UI as an asset canister                              | Asset    | End users (browser)                    | Static file hosting via `icx-asset`                                                |


### Observations

* Each canister follows the **Single Responsibility Principle**, enabling modularity.
* Core system logic resides fully on **ICP canisters**, while AI and LLM services integrate via HTTPS outcalls.
* Bitcoin integration (`btc_payments`) leverages **ICP’s Bitcoin API**, extending the wallet model with native BTC operations.
* Challenges and AI modules illustrate the **fusion of Web3 + AI**, providing gamified engagement and intelligent automation.
* All user-facing actions map directly to one or more canister methods, ensuring transparency and auditability.

## 7. Identity & Permissioning

BeneChain leverages the Internet Computer's native authentication system, **Internet Identity (II)**, to ensure secure, passwordless login and robust on-chain access control. Every authenticated user is assigned a **unique Principal** (identity key), which is stored and validated directly within the smart contract layer.

#### Identity Flow

1. **User logs in** via WebAuthn using Internet Identity (e.g. biometrics, security key, or browser credentials).
2. **II returns a `Principal`** — a globally unique, pseudonymous identifier.
3. The user’s Principal is stored and managed in the `identity_auth.mo` canister.
4. Role-based access (HR, Worker, Establishment) is enforced via internal checks on each call.
5. Extended canisters (Challenges, BTC Payments, LLM) **reuse the same identity primitives**, ensuring a unified permissioning model.

---

#### Data Model (`identity_auth.mo`)

```motoko
type Role = { #HR; #Worker; #Establishment };

type Profile = {
  principal: Principal;
  name: Text;
  role: Role;
  companyId: ?Text;
};
```

Each user has a profile stored on-chain that includes:

* Their unique **Principal** (returned from Internet Identity)
* A **display name**
* Their **role** (used for access control)
* An optional **company affiliation**


#### Access Control Logic

All sensitive functions in other canisters (e.g. `assignWorkerToBenefit`, `processPayment`, `submitToChallenge`, `send_btc`) **first validate**:

1. That the caller has a valid profile.
2. That the caller has the appropriate role for that action.
3. That they belong to the same company if required (e.g. HR ↔ Worker linkage).

Example validation flow in `benefits_manager.mo`:

```motoko
if (await IdentityAuth.hasRole(callerPrincipal, #HR) and
    await IdentityAuth.belongsToCompany(callerPrincipal, program.companyId)) {
  // Proceed with action
} else {
  // Reject unauthorized request
}
```

For **Challenges**, similar logic ensures that:

* Only HR can create challenges.
* Only Workers can submit solutions.
* Only authorized reviewers can approve/reject.

For **btc\_payments**, only wallet owners can invoke `send_btc()`.

For **llm\_home**, user queries are enriched with BeneChain context only if the user has a valid authenticated profile.


### Highlights

| Feature                              | Description                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| **Passwordless login**               | Powered by Internet Identity and WebAuthn                                    |
| **Per-user profile mapping**         | Stored in `identity_auth.mo`                                                 |
| **On-chain role validation**         | Used in all permissioned canisters (benefits, challenges, wallets, payments) |
| **Company-scoped access control**    | Ensures multi-tenant safety and data isolation                               |
| **Unified identity layer**           | Extended to AI (LLM), gamification (Challenges), and Bitcoin transactions    |
| **No custodial auth infrastructure** | Everything runs within ICP — no third-party auth needed                      |

---

## 8. Data Storage Strategy

All application state in BeneChain is stored **entirely on-chain**, inside each canister’s memory. The Internet Computer allows for **upgrade-safe persistence** through `stable` variables and data structures, ensuring no data is lost across deployments.

#### Upgrade-Safe Persistence

Each core canister declares its state using `stable var` or `stable`-wrapped collections like `TrieMap`, `Array`, or custom records. This enables:

* Durable data between upgrades
* Version-safe evolution of models
* Full decentralization (no off-chain DBs)

#### Wallet Balances (`wallets.mo`)

Worker balances are stored as a nested mapping:

```motoko
stable var balances: TrieMap<Principal, TrieMap<BenefitType, Nat>> = ...;
```

* The outer map links a user’s `Principal` to their personal wallet
* The inner map contains amounts for each benefit type (e.g., Food, Transport)
* Negative balances are explicitly rejected in logic

#### Transaction History

Each credit or debit generates a new transaction object, stored immutably in:

```motoko
stable var transactions: TrieMap<Principal, [Transaction]> = ...;

type Transaction = {
  timestamp: Time;
  benefit: BenefitType;
  amount: Nat;
  direction: { #credit; #debit };
  description: Text;
};
```

* Accessible to the user via `getTransactionHistory()`
* Ensures auditability and full traceability for each worker

#### Multi-Tenant Isolation

To support multiple companies on a single deployment:

* HR and Worker relationships are tied to `companyId`
* Benefit programs (`benefits_manager.mo`) are grouped by `companyId`
* Establishments can optionally register under a company or act independently

#### Other Canisters

| Canister              | Data Model                                                                   |
| --------------------- | ---------------------------------------------------------------------------- |
| `identity_auth.mo`    | Maps `Principal → Profile { name, role, companyId }`                         |
| `benefits_manager.mo` | Stores benefit programs by ID, company, frequency, and value                 |
| `establishment.mo`    | Maps `Principal → Establishment { name, types, status }`                     |
| `wallets.mo`          | Balances and transactions for each Worker                                    |
| `reporting.rs`        | (Planned) Cached reports and ERP sync results                                |
| `challenges.mo`       | `Challenge { id, title, desc, deadline, reward }` + `Submission { ... }`     |
| `ChallengeAI.mo`      | Transient configs (Gemini API URL, API key); minimal state, mostly stateless |
| `btc_payments.mo`     | Stores `keyId`, network configuration, UTXO-related info per wallet          |
| `llm_home.mo`         | Context constants (`BENECHAIN_CONTEXT`), API URL and key                     |


### Highlights

| Aspect               | Strategy                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| On-chain persistence | All data is stored in canisters using `stable` structures                  |
| Upgrade safety       | Compatible with `dfx deploy --upgrade`                                     |
| Role-based mapping   | Each `Principal` stores its own wallet, challenge submissions, and profile |
| Multi-tenant support | Each entity (HR, Worker, Establishment, Company) scoped by `companyId`     |
| Fully auditable      | All financial actions and submissions immutably recorded in logs           |
| Hybrid canisters     | Some (AI, LLM) are **stateless wrappers** around external APIs             |


## 9. Timer Automation Logic

BeneChain uses the **Internet Computer’s native timer API** to automate the execution of recurring benefit distributions without relying on external servers or schedulers. This ensures the system remains **autonomous, decentralized, and fully verifiable on-chain**.

#### Why On-Chain Timers Matter

* Eliminates dependency on cron jobs, bots, or off-chain daemons
* Reduces operational complexity and central points of failure
* Guarantees that automation is **transparent, deterministic, and auditable**
* Strengthens decentralization by ensuring logic execution is entirely canister-driven

#### Implementation

Timers are implemented inside the `benefits_manager.mo` canister using the `Timer.setTimer()` API.

Each `BenefitProgram` stores its own recurrence pattern:

```motoko
type Frequency = { #Monthly; #Weekly; #OneTime };

type BenefitProgram = {
  id: Text;
  type: BenefitType;
  companyId: Text;
  amount: Nat;
  frequency: Frequency;
  day: Nat; // Day of week or month depending on frequency
};
```

When a new benefit program is created, the system immediately schedules its first automated distribution:

```motoko
Timer.setTimer(
  Time.now() + computeDelay(program.frequency, program.day),
  distribute(program.id)
);
```

Each execution triggers worker payments and then automatically schedules the next run:

```motoko
func distribute(programId: Text): async () {
  // credit all assigned workers
  await creditBalance(programId);

  // reschedule next cycle
  Timer.setTimer(
    Time.now() + computeNextDelay(programId),
    distribute(programId)
  );
};
```

#### Key Functions

| Function                  | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `computeDelay()`          | Calculates delay in nanoseconds until the first execution    |
| `computeNextDelay()`      | Determines interval until the next cycle (weekly/monthly)    |
| `creditBalance()`         | Invokes `wallets.mo` to distribute benefit tokens to workers |
| `setTimer()`              | Registers an execution of `distribute()` with the Timer API  |
| `assignWorkerToBenefit()` | Maintains mapping of workers assigned to a benefit program   |

### Highlights

| Feature                  | Benefit                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| Fully on-chain scheduler | No off-chain infrastructure required for automation               |
| Resilient & predictable  | Executions tied to deterministic timestamps on-chain              |
| Auditable automation     | Past and future runs can be verified from canister state directly |
| Multi-program support    | Each benefit program has its own independent automated cycle      |
| Self-healing             | If upgraded, timers are re-computed safely via stable persistence |

---

## 10. Inter-Canister Communication

BeneChain leverages the Internet Computer’s support for **typed asynchronous inter-canister calls** to orchestrate logic between modular smart contracts. Each canister exposes a **public Candid interface (`.did`)**, enabling **secure, strongly-typed** invocations across services while maintaining full auditability.

### Example: Benefit Distribution

The `benefits_manager.mo` canister triggers periodic calls to the `wallets.mo` canister to credit workers’ balances:

```motoko
let wallet = actor "wallets-canister-id" : actor {
  creditBalance : (CreditRequest) -> async Result;
};

let result = await wallet.creditBalance({
  workerId = worker;
  benefitType = #Food;
  amount = 50000;
});
```

*The `wallets` canister executes the credit, persists the transaction, and returns a `Result` indicating success or failure.*


### Security: Role Validation Before Calls

Every inter-canister call first checks the **caller’s role and company affiliation** via the `identity_auth.mo` canister:

```motoko
if (await identityAuth.hasRole(caller, #HR) and
    await identityAuth.belongsToCompany(caller, program.companyId)) {
  // Authorized → proceed
} else {
  throw Error.reject("Unauthorized");
};
```

This guarantees that only authorized HRs, merchants, or workers can trigger sensitive cross-canister operations.


### Error Handling

Asynchronous calls use pattern matching to gracefully capture failures:

```motoko
switch (await wallet.creditBalance(...)) {
  case (#ok _)  { Debug.print("Credit successful"); };
  case (#err e) { Debug.print("Transfer failed: " # e); };
};
```

This ensures **robust fault tolerance**, preventing one failed call from halting the system.

### Canister Interaction Summary

| Caller Canister       | Target Canister | Purpose                          |
| --------------------- | --------------- | -------------------------------- |
| `benefits_manager`    | `wallets`       | Credit balances during payroll   |
| `establishment`       | `wallets`       | Debit balances for merchant use  |
| `benefits_manager`    | `identity_auth` | Validate HR role & company scope |
| `establishment`       | `identity_auth` | Validate merchant role           |
| `reporting` (planned) | All others      | Aggregate system-wide analytics  |


### Highlights

| Capability                  | Benefit                                                         |
| --------------------------- | --------------------------------------------------------------- |
| **Typed actor interfaces**  | Compile-time validation of all inter-canister signatures        |
| **Asynchronous execution**  | Non-blocking, resilient system operations                       |
| **Principal-based checks**  | Every call enforces identity- and company-aware permissions     |
| **Separation of concerns**  | Each canister handles one domain, simplifying testing & scaling |
| **Auditable communication** | All interactions can be logged and traced on-chain              |

---

## 10. Frontend Integration

The frontend of BeneChain is built using **React**, **TypeScript**, and **TailwindCSS**, and is deployed as a static asset canister on the Internet Computer (ICP), ensuring **fully on-chain delivery**. Authentication is handled via **Internet Identity**, which generates a unique principal used in all backend calls.

The user interface was designed to be clean, responsive, and optimized for HR managers, workers, and merchants. Below we describe the main flows and their technical correspondence with the backend.

### Authentication Flow

* All users authenticate using **Internet Identity**.
* Upon login, the frontend retrieves the user's `Principal` and instantiates the appropriate canister actors using `@dfinity/agent`.

```ts
const authClient = await AuthClient.create();
await authClient.login({ identityProvider });
const identity = authClient.getIdentity();
const actor = createActor(canisterId, { agentOptions: { identity } });
```


### HR Dashboard (benefits\_manager.mo)

#### Key Features:

* **Canister Balance Overview**: Simulates available ICP tokens for distribution.
* **Create Benefit Program**: Inputs name, type, amount, frequency.
* **Assign Workers**: Associates a Principal to a benefit program.
* **Execute Payment**: Manually trigger a benefit payment (via `executeManualPayment`).
* **Change Benefit Amount**: Allows adjustment of individual worker payments.

**Telas correspondentes**:

* `Create New Benefit Program`
* `Assign Worker to Program`
* `Dashboard & Funds`
* `Canister Funds Management`
* `Change Benefit Amount`

**Backend calls**:

* `createBenefitProgram`
* `assignWorkerToBenefit`
* `executeManualPayment`

### Merchant Dashboard (establishment.mo)

#### Key Features:

* **Register Establishment**: Inputs name, country, benefit types.
* **Generate Payment QR**: Includes amount, benefit type, and description.
* **Transaction History**: Shows the latest purchases with amounts and types.
* **Total Received**: Aggregates benefits received.

**Telas correspondentes**:

* `Generate Payment (ICP)`
* `Transaction History`
* `Establishment Info`

**Backend calls**:

* `registerEstablishment`
* `processPayment`
* `getTransactionHistory`

### Worker Wallet (wallets.mo)

#### Key Features:

* **My Balances**: Lists benefits and amounts per type.
* **Statement**: Shows benefit credits and purchase debits.
* **Visual Timeline**: Chronological transaction view.

**Telas correspondentes**:

* `Wallet / Benefits`
* `Statement` section

**Backend calls**:

* `getWallet`
* `getTransactionHistory`

### Technical Notes

* Interfaces are auto-generated via `dfx generate` and imported under `src/declarations`.
* All calls respect ICP’s security model: **calls are signed and validated using Internet Identity**.
* Tailwind was used for consistent and minimal styling.
* The QR payment generation can optionally include metadata and be converted to a payload for cross-canister payment flow.

Claro! A seção **12. Deployment Pipeline** deve explicar claramente como o projeto BeneChain é implantado no **Internet Computer**, desde a compilação dos canisters até o deploy dos assets estáticos do frontend. Também é importante destacar que **tudo roda 100% on-chain** – incluindo a UI.

Aqui está uma versão bem estruturada e completa para a documentação técnica:

---

## 11. Deployment Pipeline

BeneChain is designed for full on-chain deployment using the **Internet Computer’s native tooling**. The entire stack — frontend, backend logic, and authentication — is deployed as a collection of **canisters**, ensuring true decentralization without relying on off-chain services or infrastructure.

### Tooling Stack

* `dfx`: The DFINITY command-line tool for compiling, deploying, and managing canisters.
* `Motoko` and `Rust`: Used to build backend logic.
* `React + TypeScript`: Compiled into static assets for frontend delivery.
* `icx-asset`: Manages upload and versioning of frontend files inside asset canisters.

### Backend Canisters

Each functional module is a separate canister:

| Canister ID           | Role                           |
| --------------------- | ------------------------------ |
| `identity_auth.mo`    | Profile & access control       |
| `benefits_manager.mo` | HR logic, timers               |
| `wallets.mo`          | Worker balances & payments     |
| `establishment.mo`    | Merchant registration/payments |
| `reporting.rs`        | Reporting (via HTTPS outcalls) |

### Frontend Deployment

The frontend is compiled as static HTML, CSS, and JS files and deployed as an **asset canister**.

```bash
dfx deploy frontend --network ic
```

All assets are versioned and stored directly on-chain using the **reverse gas model**, meaning users do not pay gas to access the UI.

To sync and upload the assets:

```bash
dfx assets sync
```

### Authentication

No backend login services are needed. Authentication is managed by **Internet Identity**, which runs as a global canister maintained by the Internet Computer ecosystem.

### Deployment Steps Summary

```bash
# Compile all canisters
dfx build

# Deploy all canisters to IC network
dfx deploy --network ic

# Deploy frontend as asset canister
dfx deploy frontend --network ic

# Sync static assets
dfx assets sync
```

### Highlights

| Aspect              | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| Fully on-chain      | No off-chain servers or databases involved                                |
| One-click deploy    | `dfx` automates the full deploy lifecycle                                 |
| Upgrade-safe        | Canisters use `stable` variables to persist data across upgrades          |
| Composable pipeline | Each service is deployed independently for modularity and maintainability |

---

## 12. Architecture Summary

This section consolidates the **architectural principles** and **technical foundations** of BeneChain. Each decision is designed to maximize **security, modularity, and scalability**, while ensuring the platform runs **fully on-chain** and remains user-friendly for HRs, workers, and merchants.


### Core Principles

| **Aspect**                | **Description**                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Modular Canisters**     | Each domain (Identity, Wallets, Benefits, Establishments, Reporting) runs in an isolated canister.        |
| **Role-based Access**     | `identity_auth.mo` enforces HR, Worker, and Merchant permissions via principals and company scoping.      |
| **AI-Powered Validation** | Challenges and benefits can be programmatically validated using ICP canisters integrated with AI checks.  |
| **On-chain Scheduler**    | `Timer.setTimer()` automates recurring distributions (weekly, monthly) without off-chain schedulers.      |
| **Gasless UX**            | Workers and merchants interact seamlessly thanks to ICP’s Reverse Gas Model (no tokens required).         |
| **Internet Identity**     | WebAuthn-based, passwordless authentication; Principals uniquely map to profiles and roles.               |
| **Typed Interfaces**      | All inter-canister calls use typed actors, ensuring compile-time safety and maintainability.              |
| **Scalable Reporting**    | `reporting.rs` aggregates metrics and syncs with ERPs using HTTPS outcalls for compliance.                |
| **Multi-tenant Ready**    | Programs, wallets, and profiles are scoped by `companyId`, supporting many organizations on one instance. |
| **Auditability**          | All credits, debits, and challenge results are immutably recorded and queryable on-chain.                 |
| **Canisterized Frontend** | React + TypeScript UI deployed as an asset canister (`icx-asset`), fully hosted on-chain.                 |


### Technologies Used

| **Layer**            | **Stack / Tools**                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**          | [Motoko](https://internetcomputer.org/docs/current/motoko/) (benefits, wallets, identity), [Rust](https://www.rust-lang.org/) (reporting & AI ops) |
| **Frontend**         | [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [TailwindCSS](https://tailwindcss.com/)                              |
| **Authentication**   | [Internet Identity](https://identity.ic0.app/) with WebAuthn-based principals                                                                      |
| **Protocol Layer**   | [Internet Computer Protocol (ICP)](https://internetcomputer.org/)                                                                                  |
| **Integrations**     | HTTPS outcalls for ERP sync, registry validation, and optional AI services (challenge scoring)                                                     |
| **Tooling & DevOps** | `dfx` CLI, `icx-asset`, Vite, Next.js (optional), [PocketIC](https://github.com/dfinity/pocketic) for local simulation                             |

### ICP Native Features Utilized

| **Feature**                | **Description**                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **Canisters**              | Upgradeable smart contracts isolating identity, wallets, benefits, merchants, and reports. |
| **Reverse Gas Model**      | Users interact without tokens; execution costs are prepaid by the platform.                |
| **Internet Identity (II)** | Decentralized WebAuthn login issuing unique Principals for each user.                      |
| **HTTPS Outcalls**         | Enables integrations with ERPs, registries, and AI services for challenge validation.      |
| **On-chain Timers**        | Automates periodic benefit distributions natively on-chain.                                |
| **Chain Key Cryptography** | Future-proof integration with Bitcoin, Ethereum, and stablecoins.                          |
| **Asset Canisters**        | Frontend served fully on-chain, eliminating external hosting needs.                        |


### New Diagram (High-Level Architecture)

![Architecture Overview](./assets/diagra.png)

> Figure: BeneChain architecture showing modular canisters, identity/auth layer, wallets, benefits manager, establishments, reporting canister, frontend integration, and external ERP/AI services via HTTPS outcalls.*

---

## How to Run Locally

Follow the steps below to clone, configure, and run the BeneChain project locally using the DFINITY development stack.



### Prerequisites

* **[Node.js](https://nodejs.org/)** (v16 or higher)
* **[DFX CLI](https://smartcontracts.org/docs/cli-reference/dfx.html)** (latest version)
* **[Rust](https://www.rust-lang.org/tools/install)** (for `reporting.rs`)
* Optional: **[PocketIC](https://github.com/dfinity/pocketic)** for testing with multiple identities


### 1. Clone the Repository

```bash
git clone https://github.com/seu-usuario/benefichain.git
cd benefichain
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
cd frontend
npm install
```

Return to the root project folder:

```bash
cd ..
```

### 3. Start Local ICP Replica

```bash
dfx start --clean --background
```

### 4. Deploy All Canisters

This will compile and deploy both backend and frontend canisters locally:

```bash
dfx deploy
```

You can also deploy a specific canister (e.g., just the frontend):

```bash
dfx deploy frontend
```

### 5. Open the Frontend

The UI will be hosted on:

```
http://127.0.0.1:4943/?canisterId=$(dfx canister id frontend)
```

Or use this command to open it:

```bash
open $(dfx canister id frontend)
```

### 6. Authenticate with Internet Identity

> Internet Identity runs as a separate canister. When you access the frontend locally, it will prompt login via **[https://identity.ic0.app](https://identity.ic0.app)** using WebAuthn (e.g., device biometrics or FIDO key).

### Optional: Using PocketIC for Simulated Users

You can simulate multiple actors (HR, Worker, Merchant) without using real devices:

```bash
npm run simulate:pocketic
```

Configure identities and prefill benefit programs or balances using the internal dev tools exposed in the local build.


### 7. Reset Everything

To wipe local state and restart clean:

```bash
dfx stop
dfx start --clean
dfx deploy
```


### Tips

* You can inspect canister logs with `dfx canister log <canister-name>`.
* Use `dfx ping <canister-id>` to test endpoint responsiveness.
* For HTTPS outcalls, enable `--enable-features=HttpOutcalls` in your `dfx.json`.

## Frontend Documentation

### **Screen: Generate Payment (ICP)**

**User Role:** Merchant

**Purpose:** To allow a merchant to request a payment from a worker by generating a QR code that encodes the transaction details.

<div align="center">

![1](./assets/cel/1.jpeg)

</div>

#### **Functional Overview**

This screen enables merchants (e.g., restaurants, stores, service providers) to create a benefit-linked payment request. The transaction is initiated on-chain and is tightly bound to the specific worker and benefit type being used.



#### **UI Elements and Fields**

| Field                   | Description                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Worker’s Principal**  | The unique `Principal` of the worker making the payment. This ensures identity linkage and secure authorization. |
| **Amount (ICP)**        | The total amount to be charged, denominated in ICP tokens.                                                       |
| **Benefit Type**        | Specifies which benefit category (e.g., Food, Transport) the payment should be deducted from.                    |
| **Description**         | Optional note or label describing the purpose of the transaction (e.g., "Lunch purchase").                       |
| **Generate Payment QR** | Triggers a backend call to encode the transaction details and display a scannable QR code.                       |


#### **Technical Integration**

* Upon submission, the data is sent to the `establishment.mo` canister where the transaction is registered and validated.
* A secure QR code is generated representing the payment request, to be scanned by the worker's mobile device.
* All logic, from QR creation to balance deduction, is executed **fully on-chain**, with no reliance on third-party infrastructure.


#### **Strategic Role in the Platform**

This feature is critical for enabling **direct worker-to-merchant payments**, a core use case of BeneChain. It allows merchants to operate in the benefit ecosystem without needing to manage wallets, private keys, or traditional payment terminals.

The QR-based flow offers:

* Frictionless UX for unbanked or digitally inexperienced users.
* Strong compliance and traceability, as all transactions are tied to specific identities and benefit types.


---

### **Screen: Establishment Information**

**User Role:** Merchant

**Purpose:** To display the registration details and financial summary of the establishment.

<div align="center">

![2](./assets/cel/2.jpeg)

</div>

#### **Functional Overview**

This screen provides a merchant with a summary of their business information registered in the BeneChain system. It includes static details such as the business name and country, as well as dynamic financial indicators like the total amount of benefits received.


#### **UI Elements and Fields**

| Field              | Description                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**           | The name of the registered establishment. Pulled from `establishment.mo`.                                                                                       |
| **Country**        | The country in which the merchant operates. Used for geolocation and potential regulatory filtering.                                                            |
| **Code**           | A unique business code assigned to the establishment. It may represent a CNPJ, local registry ID, or internal platform code.                                    |
| **Total Received** | The cumulative amount of ICP received from benefit payments, across all benefit types. Calculated on-chain via `getTransactionHistory()` in `establishment.mo`. |

#### **Technical Integration**

* All fields are sourced from the merchant’s profile stored in the `establishment.mo` canister.
* The `Total Received` value is computed by aggregating successful `processPayment()` calls tied to the merchant’s Principal.
* The information is protected by access control: only authenticated merchants can view their own data (enforced by `hasRole(principal, #Establishment)`).


#### **Strategic Role in the Platform**

This screen strengthens the **transparency and accountability** pillar of BeneChain by offering merchants a clear and verifiable summary of their participation.

Key advantages:

* Reinforces trust by making all financial data queryable and auditable.
* Provides an intuitive overview of benefit utilization at the point of sale.
* Lays the foundation for future analytics or integrations with ERP systems via the `reporting.rs` canister.

---

### **Screen: HR Dashboard – Manager & Fund Overview**

**User Role:** HR Manager

**Purpose:** To provide the HR manager with visibility over their identity, company linkage, and the available balance for distributing benefits to workers.

<div align="center">

![3](./assets/cel/3.jpeg)

</div>

#### **Functional Overview**

This screen serves as the landing page for HR managers after authentication. It presents key information about their profile and shows the real-time on-chain balance available for benefit distributions. The interface ensures transparency and control over company-linked operations.


#### **UI Elements and Fields**

| Section                       | Field                              | Description                                                                                                                                             |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Manager Information**       | Name                               | The name of the logged-in HR manager, fetched from `identity_auth.mo`.                                                                                  |
|                               | Company                            | The company this HR manager belongs to. This value is cross-validated by `belongsToCompany()`.                                                          |
|                               | Role                               | Fixed as “Human Resources” (authorization is required to access this view).                                                                             |
| **Canister Funds Management** | Available Balance for Distribution | The current ICP balance available to the company for funding worker benefit programs. Sourced from `wallets.mo` and linked to the HR/company principal. |


#### **Technical Integration**

* The manager profile is loaded from the `identity_auth.mo` canister using `getProfile()` and rendered client-side after login.
* The ICP balance is fetched from the `wallets.mo` canister using `getWallet()` or `getCompanyWallet()` (depending on implementation).
* Access to this screen is protected by role-based validation (must be `#HR`) and company matching.

#### **Strategic Role in the Platform**

This dashboard supports the platform’s goal of **decentralized, auditable fund management**. Key highlights include:

* HR can view exactly how much ICP is available to assign or schedule to workers.
* All funds remain **100% on-chain**, and no off-platform banking or fiat accounts are involved.
* The dashboard UI helps bridge the familiarity gap for corporate users who are new to Web3 environments, while still maintaining decentralization.

---

### **Screen: Transaction History – Merchant View**

**User Role:** Merchant

**Purpose:** To allow establishments to view all received payments from benefit transactions, categorized by origin, amount, type, and timestamp.

<div align="center">

![4](./assets/cel/4.jpeg)

</div>

#### **Functional Overview**

This screen gives the merchant real-time access to their incoming transaction history. Each entry represents a benefit-based purchase initiated by a worker using BeneChain. This log helps establishments track performance and audit activity without relying on off-chain tools.


#### **UI Elements and Fields**

| Section                 | Field        | Description                                                                                                                                              |
| ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Total Received**      | Amount       | The sum of all benefits (in ICP) received by the merchant. Aggregated from on-chain calls to `creditBalance()` and exposed by `getTransactionHistory()`. |
| **Transaction History** | Entry Type   | Indicates the nature of the transaction (e.g., “Compra” = Purchase).                                                                                     |
|                         | From         | Displays a shortened principal ID of the worker who made the payment.                                                                                    |
|                         | Benefit Type | Category used for benefit (e.g., Food, Health).                                                                                                          |
|                         | Timestamp    | Precise date and time the transaction occurred.                                                                                                          |
|                         | Amount       | Payment value received (positive ICP amount).                                                                                                            |

#### **Technical Integration**

* Data is fetched from `establishment.mo` using `getTransactionHistory()` filtered by the merchant’s Principal ID.
* All transactions are stored as immutable structs within the canister, ensuring full traceability.
* The display format includes data formatting and string shortening for better UX on mobile.

#### **Strategic Role in the Platform**

This screen supports **financial transparency and self-verification** for merchants:

* Enables reconciliation with internal systems or point-of-sale data.
* Promotes confidence in the platform by surfacing all on-chain payment activity in a clean UI.
* Supports future features like exporting history, syncing with ERPs, or issuing digital receipts.

---

### **Screen: Program Management – HR Dashboard**

**User Role:** Human Resources (HR Manager)

**Purpose:** To enable HR teams to visualize, manage, and create benefit programs that will be distributed to their employees via the BeneChain platform.

<div align="center">

![5](./assets/cel/5.jpeg)

</div>

#### **Functional Overview**

This screen presents the HR user with a centralized interface for managing benefit allocations. It includes both a summary of existing benefit programs and a clear call-to-action to create new programs. All operations are fully on-chain, ensuring auditability and transparency.

#### **UI Elements and Fields**

| Section                        | Field                                       | Description                                                                                                                         |
| ------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Tabs**                       | Dashboard & Funds, Programs, Manage Workers | Navigation menu for switching between operational modules.                                                                          |
| **Program Management**         | Title and Description                       | Introduces the functionality of the page to the HR user.                                                                            |
| **Existing Benefit Programs**  | Program Name (e.g., Ifood)                  | The name of each existing benefit program configured by the company.                                                                |
|                                | Benefit Type (e.g., Food)                   | Indicates the type/category of the benefit.                                                                                         |
|                                | Amount Allocated                            | Shows total value allocated to the benefit in ICP.                                                                                  |
| **Create New Benefit Program** | Button CTA                                  | Leads to the form to define new benefit programs, triggering an on-chain call to `createBenefitProgram()` in `benefits_manager.mo`. |


#### **Technical Integration**

* Programs are fetched from `benefits_manager.mo` using `getCompanyBenefitPrograms()` filtered by the logged-in Principal’s `companyId`.
* Each benefit object includes fields such as `type`, `amount`, and `frequency`, which are stored in stable memory.
* React components are dynamically rendered from canister actor interfaces exposed via `@dfinity/agent`.


#### **Strategic Role in the Platform**

This screen empowers the HR department to:

* Transparently manage their benefits offering.
* Adjust allocations based on internal HR policies or financial planning.
* Comply with auditing requirements by relying solely on on-chain definitions.

By consolidating all benefit data into a single interface, BeneChain simplifies HR operations while maximizing trust and verifiability.


---

### **Screen: Create New Benefit Program**

**User Role:** Human Resources (HR Manager)

**Purpose:** To allow HR representatives to configure and register new benefit programs for their company’s workers. These programs define the distribution rules and eligibility for on-chain employee allowances.

<div align="center">

![6](./assets/cel/6.jpeg)

</div>

#### **Functional Overview**

This form-based interface guides HR managers through the process of registering a new benefit program. Once submitted, the program is persisted fully on-chain via the `benefits_manager.mo` canister and becomes eligible for assignment to employees.


#### **UI Elements and Fields**

| Field                       | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| **Program Name**            | Free-text input to define a user-friendly label for the benefit program. |
| **Amount per Worker (ICP)** | Defines the fixed value that will be distributed to each worker in ICP.  |
| **Benefit Type**            | Selection field with predefined categories (Food, Culture, Health, etc.) |
| **Create Program Button**   | Triggers a call to `createBenefitProgram()` with the entered parameters. |


#### **Technical Integration**

* On submission, the frontend uses `@dfinity/agent` to send an authenticated call to the `benefits_manager.mo` canister.
* The underlying Motoko type for benefit programs is:

```motoko
type BenefitProgram = {
  id: Text;
  type: BenefitType;
  companyId: Text;
  amount: Nat;
  frequency: Frequency;
  day: Nat;
};
```

* Benefit metadata is stored in stable memory and retrievable via `getCompanyBenefitPrograms()`.


#### **Strategic Role in the Platform**

This screen is central to the system's programmability. It allows companies to:

* Tailor employee incentives to different verticals (e.g., food or transport).
* Ensure reproducible, automated distributions via smart contracts.
* Maintain financial control and transparency through immutable program definitions.

By placing benefit creation directly in the hands of HR managers, BeneChain empowers organizations with on-chain flexibility while eliminating the need for intermediaries or external integrations.

---

### **Screen: Worker Management**

**User Role:** Human Resources (HR Manager)

**Purpose:** To assign workers to benefit programs and manage individual allocation adjustments, enabling personalized and controlled distribution of funds.

<div align="center">

![7](./assets/cel/7.jpeg)

</div>

#### **Functional Overview**

This interface supports two key operations:

1. Assigning workers to predefined benefit programs.
2. Updating benefit values individually for specific workers (e.g., bonuses, adjustments).

These functions connect directly to the `benefits_manager.mo` canister for persistent and auditable on-chain configuration.


#### **UI Elements and Functionalities**

| Section                         | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Worker Principal**            | Input field for the user’s Internet Identity (Principal ID).             |
| **Benefit Program**             | Dropdown populated with existing programs registered by the company.     |
| **Assign Worker Button**        | Calls `assignWorkerToBenefit()` to persist association on-chain.         |
| **Change Benefit Amount (CTA)** | Opens a modal or route to allow individual adjustment of benefit values. |


#### **Technical Integration**

* The `assignWorkerToBenefit(principal, programId)` function is invoked via the frontend using `@dfinity/agent`.
* Validations are done using helper calls to `hasRole(principal, #Worker)` and `belongsToCompany(principal, companyId)` from the `identity_auth.mo` canister.
* On successful assignment, the mapping is stored in `benefits_manager.mo` to be referenced during automated or manual distributions.


#### **Strategic Role in the Platform**

This interface embodies BeneChain’s commitment to **multi-tenant, granular control** over benefit flows:

* Enables HR managers to build dynamic and modular distribution schemes.
* Allows for exception handling and personalized adjustments.
* Ensures transparent, role-bound benefit management across the organization.

This flexibility is critical in enterprise-grade benefit systems where workers may have varying entitlements or operational roles.

---

### **Screen: Worker Wallet & Transaction Statement**

**User Role:** Worker

**Purpose:** To allow individual workers to view their current benefit balances, track their spending, and access their transaction history in a transparent and user-friendly interface.

<div align="center">

![8](./assets/cel/8.jpeg)

</div>

#### **Functional Overview**

This screen functions as the on-chain wallet interface for workers. It displays categorized balances and provides a detailed timeline of past transactions, including credits (from benefit programs) and debits (from purchases at registered merchants).

#### **UI Elements and Functionalities**

| Section                  | Field / Element               | Description                                                                                              |
| ------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **My Balances**          | Benefit Category (e.g., Food) | Shows the current balance for each benefit type in ICP. Pulled from `wallets.mo`.                        |
| **Statement**            | Transaction List              | Displays a chronological list of activity for the selected benefit type.                                 |
|                          | Credit Entry                  | Shows benefit top-ups (e.g., “VisaAlimentação”), with timestamp and value.                               |
|                          | Debit Entry                   | Shows purchases with value deduction and merchant name or tag (e.g., “Compra”).                          |
| **QR Button** (floating) | Action Button                 | Shortcut for generating a payment QR code or scanning to make a purchase (depending on the worker flow). |

#### **Technical Integration**

* Balances are fetched from `wallets.mo` via the `getWallet(principal)` method, using the logged-in Internet Identity.
* Each transaction is a record in a `[Transaction]` array stored in stable memory and queried using `getTransactionHistory()`.
* Data is filtered by `principal` and benefit `type`, ensuring strict isolation per user.
* All entries are immutable and cryptographically linked to on-chain activity.

#### **Strategic Role in the Platform**

This screen embodies BeneChain’s **end-user empowerment and transparency principles**:

* Workers can verify that they’ve received expected benefits.
* All spending is logged on-chain and visible without intermediaries.
* Promotes financial literacy and personal control over benefit usage.
* Builds trust through real-time, auditable information on mobile devices.

This mobile-first wallet is crucial for onboarding non-technical users and ensuring high usability across diverse worker profiles.

---

### **Screen: Canister Fund Management – Deposit Simulation**

**User Role:** Human Resources (HR Manager)

**Purpose:** To simulate the deposit of ICP funds into the company’s canister, which are later distributed to workers through scheduled or manual payments.

<div align="center">

![9](./assets/cel/9.jpeg)

</div>

#### **Functional Overview**

This screen enables HR users to manage the available ICP balance held in their organization’s canister. Although no real tokens are transferred in this version, the system simulates deposits to test and demonstrate the funding flow. It supports validation of logic, UI feedback, and backend state transitions without relying on a live wallet.


#### **UI Elements and Functionalities**

| Section                       | Description                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Available Balance**         | Displays the total ICP tokens currently simulated as deposited in the canister. |
| **Amount to Deposit (ICP)**   | Input field where the HR user defines how much ICP to simulate as deposited.    |
| **Deposit Funds Button**      | Triggers the simulated deposit by updating the backend’s canister balance.      |
| **Deposit Simulation Notice** | Informs the user that the deposit is only a simulation, not a live transaction. |

#### **Technical Integration**

* When the user submits the deposit form, a simulated backend method is called on the `benefits_manager.mo` or `wallets.mo` canister to increment the company’s available distribution balance.
* This design allows for testing of all downstream functionality (like crediting workers) without requiring a real wallet or transfer of ICP.
* The `Deposit Funds` button triggers internal state updates and renders the new available amount immediately.

#### **Strategic Role in the Platform**

This simulation is a **crucial usability and developer feature**:

* Allows HR teams to test workflows without needing live ICP tokens.
* Simplifies demos and hackathon testing without risking real funds.
* Supports future evolution to real wallet-based deposits via wallet integration or Chain Key Bitcoin/ICP bridge.

The simulation mode will later be swapped by live wallet deposits using a dedicated frontend bridge or through QR-based wallet scans.

### **Screen: QR Code Scanner – Payment Execution**

**User Role:** Worker

**Purpose:** Enables workers to scan a QR code presented by a merchant to initiate a payment using their on-chain benefits. This interface streamlines the purchase process using camera-based interaction.

<div align="center">

![10](./assets/cel/10.jpeg)

</div>

#### **Functional Overview**

This screen activates the device camera to scan QR codes generated by merchants. These codes contain payment instructions (worker principal, amount, benefit type), which are parsed and submitted as payment requests to the BeneChain backend.

If access to the camera is denied or unavailable, a fallback option allows workers to manually enter the payment key.


#### **UI Elements and Functionalities**

| Section              | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Scanner Area**     | The central bounding box activates the device’s camera to detect a QR code.           |
| **Error Message**    | Displays the current scanner status (e.g., `NotAllowedError` for denied permissions). |
| **Instruction Text** | Reminds the user to stay still while scanning.                                        |
| **Enter Key Button** | Redirects to a fallback screen where the user can manually input the payment key.     |


#### **Technical Integration**

* The camera is accessed via Web APIs (e.g., `navigator.mediaDevices.getUserMedia()`), typically wrapped by a frontend QR scanner library.
* Upon successful scan, the decoded payload is sent to `establishment.mo -> processPayment()` and `wallets.mo -> debitBalance()` based on authorization checks.
* All scanner logic runs client-side, and the result is verified server-side before funds are deducted or approved.


#### **Strategic Role in the Platform**

This interface is essential to **real-world usability and trustless commerce**:

* Provides a seamless, low-friction payment experience for workers using benefit tokens.
* Eliminates the need for usernames or manual address entry.
* Bridges the worker–merchant interaction with immediate feedback and clear fallback mechanisms.
* Encourages real adoption by mimicking familiar behavior from consumer wallets and payment apps.

The fallback mechanism ensures accessibility even in low-connectivity or permission-restricted contexts, making the solution robust for a diverse user base.

---

### **Screen: User Profile & Identification Key**

**User Role:** All (Worker, HR, Merchant)

**Purpose:** Provides users with a concise summary of their identity within the BeneChain platform, including their principal (public key), current organization, and role-specific metadata.

<div align="center">

![11](./assets/cel/11.jpeg)

</div>

#### **Functional Overview**

This screen displays a user’s decentralized identity, allowing them to verify their **Internet Identity–issued principal**, understand which organization they are associated with, and access logout functionality. It supports both transparency and accountability by making user identifiers explicitly visible.


#### **UI Elements and Functionalities**

| Section                              | Description                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| **User Info**                        | Displays the user's name and Internet Identity–derived principal (public key). |
| **Identification Key**               | A base32-encoded `Principal` that uniquely identifies the user on-chain.       |
| **Current Company**                  | Shows the company to which the user is currently linked, based on their role.  |
| **Receipts (if Worker or Merchant)** | Shows a count of receipts or transaction logs tied to that user’s principal.   |
| **Logout Button**                    | Clears the session and returns the user to the login/authentication screen.    |


#### **Technical Integration**

* User identity is managed via **Internet Identity**, and the returned `Principal` is used to map the user to a profile in `identity_auth.mo`.
* Profile data is fetched via `getProfile(principal)`, which returns structured metadata: name, role, and companyId.
* The “Receipts” count is derived from `getTransactionHistory()` and filtered by user and role.

#### **Strategic Role in the Platform**

This screen reinforces the platform’s commitment to **self-sovereign identity** and **on-chain traceability**:

* Makes users aware of their persistent on-chain identity.
* Facilitates debugging and user support by exposing their own public key.
* Establishes a single source of truth for role-based access and company linking.
* Prepares users for features like **portable benefit profiles**, multi-company linkage, or tokenized reputation scores.

This profile screen is particularly helpful for HR managers auditing employee data, and for workers who may use their principal in external integrations (e.g., wallet import, QR scan confirmation).

---

### **Screen: Manual QR Payload Submission**

**User Role:** Worker

**Purpose:** Allows workers to manually input the QR code payload if camera scanning fails or is unavailable, ensuring payment processing is still possible.

<div align="center">

![12](./assets/cel/12.jpeg)

</div>

#### **Functional Overview**

This screen provides a manual fallback for QR code scanning, enabling users to paste raw JSON data (containing `establishmentId`, `amount`, and optionally benefit type and description) into a text box. Once the payload is validated, a payment request is submitted.


#### **UI Elements and Functionalities**

| Section                    | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Instruction Header**     | Guides the user to paste the QR code content, typically a JSON string.               |
| **Text Area**              | Input field for the raw payload (e.g., `{"establishmentId": "...", "amount": ...}`). |
| **Confirm Payment Button** | Triggers the parsing and submission of the payment to the backend.                   |
| **Back to Scanner**        | Navigates the user back to the camera-based scanner for QR capture.                  |


#### **Technical Integration**

* The pasted JSON is parsed client-side and validated before sending a payment request to `establishment.mo -> processPayment()` and `wallets.mo -> debitBalance()`.
* Common validation includes structure, existence of keys, numeric value of amount, and proper principal formatting.
* On success, a `confirmPayment()` mutation is triggered with authentication scoped to the currently logged-in worker.


#### **Strategic Role in the Platform**

This fallback screen strengthens the **resilience and inclusivity** of the BeneChain platform:

* Ensures accessibility for users in environments with limited camera access, restricted permissions, or broken hardware.
* Avoids dead-ends in the payment flow by supporting manual override without compromising security.
* Aligns with Web3's principle of **trustless openness** by allowing the user to transparently inspect the payment payload.

The manual confirmation option is a key differentiator for field deployment, especially for industrial workers or lower-end device contexts.

---

### **Screen: Manual Payment Submission (HR Role)**

**User Role:** HR Manager

**Purpose:** Enables HR managers to directly issue benefit payments to workers on an ad-hoc basis.

<div align="center">

![13](./assets/cel/13.jpeg)

</div>

#### **Functional Overview**

This interface is designed for scenarios where HR needs to manually credit a worker’s wallet outside of scheduled programs—such as reimbursements, bonuses, or corrective actions. It allows full control over payment parameters, including benefit type and description.

#### **UI Elements and Functionalities**

| Element                 | Description                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Worker Principal**    | Input for the recipient's unique Internet Identity principal.                       |
| **Amount (ICP)**        | Specifies how much to transfer in ICP (token denomination).                         |
| **Benefit Type**        | Lets the manager categorize the nature of the benefit (Food, Health, etc).          |
| **Payment Description** | Optional free-text field for internal tracking (e.g., "Meal compensation").         |
| **Make Payment Button** | Submits the payment, invoking backend canisters (`wallets.mo`, `identity_auth.mo`). |


#### **Technical Workflow**

1. **Authorization**: Ensures the current user has HR role (`identity_auth.hasRole(principal, #HR)`).
2. **Validation**:

   * Confirms that `principal` exists and belongs to the HR’s company.
   * Checks worker enrollment in the selected benefit program.
3. **Execution**:

   * Invokes `wallets.mo -> creditBalance()` with typed payload including amount, benefit type, and memo.
   * Logs the transaction in the internal ledger (persistent stable var).
4. **Error Handling**:

   * Captures insufficient balance, invalid principal, or permission mismatches.


#### **Strategic Relevance**

* **Flexibility**: Supports unscheduled distributions and corrective entries that don’t require full benefit program creation.
* **Transparency**: Logged transactions maintain auditability and allow reconciliation in `reporting.rs`.
* **Usability**: Keeps HR autonomous by reducing reliance on technical workflows for one-off disbursements.

---

## Future Roadmap

BeneChain was designed with extensibility in mind. Beyond its current fully on-chain MVP, several impactful improvements are planned to enhance interoperability and usability:


### **Stablecoin & Fiat Bridge**

Enable workers and merchants to redeem benefits in fiat or stablecoins through integrations with bridges and custodians — reducing friction for real-world usage.


### **Bitcoin Integration via Chain Key BTC**

Enable workers and merchants to receive **native Bitcoin payouts directly from ICP**, using the **Chain Key Bitcoin integration**.

* No bridges or wrapped tokens required
* On-chain calls to the Bitcoin network using ICP’s chain key cryptography
* Improves accessibility and real-world adoption for unbanked users

Example use cases:

* Worker opts to receive a portion of their benefits directly in BTC
* Merchant converts benefit tokens to BTC at settlement

### **DAO Governance**
Transition program management to a decentralized autonomous organization (DAO), allowing participating companies, employees, and community members to vote on:

* Funding rules
* Platform upgrades
* Whitelisted benefit types or vendors

---

## Resources

* [ICP Developer Docs](https://internetcomputer.org/docs/current/)
* [Motoko Base Library](https://internetcomputer.org/docs/current/motoko/main/)
* [AuthClient + AgentJS](https://github.com/dfinity/agent-js/)
* [PocketIC](https://github.com/dfinity/pocketic)

---

## Team

| Member | Linkedin                       |
| ------ | --------------------------- |
| Giovanna Britto | [Linkedin Giovanna](https://www.linkedin.com/in/giovanna-britto/)   |
| Lucas Britto | [Linkedin Lucas](https://www.linkedin.com/in/lucas-vieira-376665208/)     |
| Marco Peixoto | [Linkedin Marco](https://www.linkedin.com/in/marcoruas/) |

---

## ⚖️ License

MIT © 2025 — BeneChain Project Team
