# BeneChain

BeneChain is a fully on-chain corporate benefits platform built on the Internet Computer Protocol (ICP). It empowers companies to create, distribute, and monitor employee benefit programs without intermediaries — using smart contracts (canisters) to ensure full transparency, automation, and auditability.

Traditional corporate benefits systems are plagued by inefficiencies:

* High transaction and processing fees
* Payment delays to merchants
* Lack of control and traceability for HR departments
* Inflexible benefit programs with low portability for employees

BeneChain offers a paradigm shift. By leveraging the unique capabilities of ICP, we’ve created a decentralized platform that connects HR managers, employees, and merchants directly through on-chain logic — with zero reliance on Web2 infrastructure or third-party processors.

![](https://github.com/InteliThreeGroup/Beneficios/blob/main/assets/Sol1.png)

**Business Plan:** [Link](https://github.com/InteliThreeGroup/Beneficios/blob/main/BusinessPlan.md)

**Technical Documentation:** [Link](https://github.com/InteliThreeGroup/Beneficios/blob/main/docs.md)

**Pitch Deck:** [Link](https://github.com/InteliThreeGroup/Beneficios/blob/main/assets/Pitch%20Deck%20BeneChain.pdf)

### Core Value Proposition

* **HR Departments** gain full control over benefit rules, real-time dashboards, and audit trails — reducing fraud and manual work.
* **Workers** receive portable, on-chain wallets linked to their Internet Identity, with real-time balance tracking and zero gas fees.
* **Merchants** are paid instantly with minimal fees, using a self-service dashboard and secure on-chain validation.

BeneChain ensures that benefits are distributed fairly, used according to company-defined rules, and traceable from origin to destination — all within the decentralized runtime of the ICP blockchain.


### Track: **Fully On-Chain**

BeneChain fits perfectly into the Fully On-Chain track of the WCHL 2025 Hackathon. All business logic, data storage, user authentication, and interface hosting are implemented within ICP canisters.

This guarantees:

* Total decentralization
* No need for off-chain APIs, storage, or servers
* Native use of advanced ICP features like:

  * Reverse Gas Model
  * Internet Identity (WebAuthn)
  * HTTPS Outcalls
  * Chain Key Cryptography
  * On-chain Timers


### Social and Economic Impact

By reducing cost and complexity for employers, increasing transparency and control for HR teams, and improving flexibility and purchasing power for workers, BeneChain has the potential to:

* Support financial inclusion of underserved workers
* Improve cash flow and independence for small businesses
* Reduce bureaucracy and dependency on legacy benefit providers
* Contribute to UN Sustainable Development Goals (SDGs) such as decent work, reduced inequalities, and industry innovation

---

## Justification for the “Fully On-Chain” Track

BeneChain was purposefully built to fully align with the “Fully On-Chain” track of the WCHL 2025 Hackathon. All core logic, data storage, permission handling, user identities, and UI hosting are executed entirely inside ICP canisters, without any reliance on off-chain infrastructure. This architectural decision was not only intentional — it was essential to solving the challenges of the corporate benefits industry in a decentralized, scalable way.

### Why This Project Can Only Be Built on ICP

The Internet Computer Protocol offers a unique set of capabilities that no other blockchain provides in a native, seamless environment:

### 1. Canisters as Full-Stack Smart Contracts

* **How we use it**: Every module (HR management, wallet system, merchant validation, reporting, and authentication) is implemented as a dedicated canister (`benefits_manager.mo`, `wallet.mo`, `establishment.mo`, `identity_auth.mo`, and `reporting.rs`).
* **Why ICP**: Unlike EVM-based chains where smart contracts are limited in logic and storage, ICP canisters behave like persistent microservices with native state, HTTP APIs, and near-unlimited logic.

### 2. Reverse Gas Model

* **How we use it**: All transactions (e.g., wallet top-ups, payments, report generation) are paid by the company, not by the workers or merchants.
* **Why ICP**: Only ICP natively supports the reverse gas model, enabling zero-friction UX for non-crypto users — which is critical for adoption in HR environments where users are not crypto-savvy.

### 3. Internet Identity (II)

* **How we use it**: Authentication is handled via Internet Identity, allowing users to log in using secure WebAuthn (e.g., FaceID, fingerprint, security key) without custodial credentials. Each user is mapped to a `Principal`, which is used to define roles and permissions (`#HR`, `#Worker`, `#Establishment`) in `identity_auth.mo`.
* **Why ICP**: Internet Identity ensures both security and user portability across organizations — crucial for workers who switch jobs or companies that manage multiple tenants.

### 4. On-Chain Timers

* **How we use it**: Monthly benefit distributions are automatically scheduled using ICP’s on-chain Timer API. This logic is implemented in `benefits_manager.mo` and ensures that funds are distributed exactly on the configured date, without external triggers or CRON jobs.
* **Why ICP**: Most blockchains lack deterministic native scheduling. ICP’s timers allow trustless, programmable automation inside the canister itself.

### 5. HTTPS Outcalls

* **How we use it** (planned in `reporting.rs` and `establishment.mo`): BeneChain will validate external business identifiers (e.g., CNPJs) and sync data with ERPs using HTTPS requests **directly from smart contracts**.
* **Why ICP**: This is **exclusive to ICP**. No other blockchain can natively perform HTTPS calls from within smart contracts without needing oracles like Chainlink or external bridges.

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


---

## System Architecture
BeneChain is architected as a modular, decentralized system built entirely on the Internet Computer Protocol (ICP). Each component is deployed as a smart contract (canister), following a microservices pattern and full separation of concerns. The frontend is also hosted in an **asset canister**, ensuring 100% on-chain execution — no reliance on Web2 infrastructure.

## 1. High-Level System Overview – Full Architecture

This diagram presents the complete application architecture of **BeneChain**, from the user interface to on-chain execution inside the Internet Computer Protocol.

![System Architecture](./assets/arquitetura.png)

####  Layer-by-Layer Breakdown

#### Frontend (Client-Side)

Built using:

* **React**: Component-based UI
* **TypeScript**: Type safety across the application
* **TailwindCSS**: Fast and responsive styling

Deployed on an **ICP asset canister** via `icx-asset`, ensuring that the entire UI runs on-chain and requires no Web2 infrastructure.

#### Authentication (Internet Identity)

* **Internet Identity** (WebAuthn) allows users to log in using biometrics or hardware keys, without needing wallets or passwords.
* Upon login, each user receives a unique `Principal`, which is used as a persistent on-chain identifier and authorization handle.
* This `Principal` is then passed to canisters to define and enforce access control (e.g., HR, Worker, Merchant roles).

#### Core Canisters (Smart Contracts)

1. **`identity_auth.mo`**
   Handles registration, profile management, role assignment, and access control for each user (`#HR`, `#Worker`, `#Establishment`).

2. **`benefits_manager.mo`**
   Allows HR to create and manage benefit programs, including scheduled distributions using on-chain timers.

3. **`wallets.mo`**
   Stores each worker's on-chain balances per benefit type. Handles credit/debit operations and transaction logs.

4. **`establishment.mo`**
   Allows merchants to register, receive payments from worker wallets, and view transaction history.

5. **`reporting.rs`** *(Planned)*
   Built in Rust for performance and outcall support, this canister will generate detailed usage reports and connect to external ERPs using HTTPS outcalls.


#### Internet Computer Features Used

This infrastructure layer enables BeneChain’s unique advantages:

* **Reverse Gas Model**: Workers and merchants do not pay transaction fees. HR sponsors cycles.
* **On-Chain Timers**: Used for monthly/weekly automatic benefit distributions.
* **HTTPS Outcalls**: Future integrations with ERPs and CNPJ validation services.
* **Asset Canister**: Enables a decentralized frontend UI with no dependency on IPFS or third-party hosts.


#### Architectural Strengths

| Property              | Benefit                                                        |
| --------------------- | -------------------------------------------------------------- |
| **Fully On-Chain**    | No off-chain APIs or storage; full ICP-native stack            |
| **Secure by Design**  | Access control enforced via `Principal` and Internet Identity  |
| **Modular Canisters** | Clear separation of logic by user role and function            |
| **User-Friendly UX**  | Login with WebAuthn; no wallet or gas required for interaction |
| **Auditable**         | Transaction logs and actions persist on-chain for traceability |

## 2. Interaction Flow – From Browser to Canisters

This diagram showcases the full interaction pipeline from end users to the decentralized backend of BeneChain, emphasizing the simplicity and Web2-like UX, built entirely on top of the Internet Computer (ICP).

![User-to-Canister Flow](./assets/Frontend%20(1).png)

### Flow Description

#### User Entry Points

* **HR Departments**, **Workers**, and **Merchants** all access the application through a standard web browser (Chrome, Edge, Firefox).
* No extensions, wallet installations, or onboarding friction are required.

#### Web Frontend

The frontend is built using:

* **React** – Component-driven user interface
* **TypeScript** – Strongly typed logic and integration with ICP declarations
* **TailwindCSS** – Lightweight and responsive styling system
* **Internet Identity** – Used for passwordless authentication via WebAuthn (fingerprint, facial recognition, security keys)

After login, each user receives a unique **Principal**, used as an on-chain identity for all transactions and permission checks.

#### Backend (ICP Canisters)

Once authenticated, all user actions are routed to decentralized smart contracts:

| Canister              | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `identity_auth.mo`    | Role registration and permission mapping             |
| `benefits_manager.mo` | Benefit program creation, assignment, and automation |
| `wallets.mo`          | Balance management and transaction logs              |
| `establishment.mo`    | Merchant registration and payment flow               |
| `reporting.mo`        | Analytics, reporting and ERP integrations (planned)  |

All logic, state, and frontend are hosted **natively on ICP**, ensuring high availability, auditability, and zero off-chain dependencies.

### Key Highlights

* **No wallets or gas fees** for users — experience is frictionless
* **Full decentralization** from login to logic
* **ICP-native** architecture using Principal-based permissioning
* Ensures **Web2-level usability** with **Web3-level trust and transparency**


## 3. Sequence Diagram – Dynamic Execution Flow  
This diagram illustrates the dynamic flow of method calls between user actors (HR, Worker, Merchant) and the canisters that orchestrate identity, benefits, wallets, and payment operations in BeneChain.

![Sequence Diagram](./assets/Diagrama%20de%20sequência%20básico.png)

#### Step-by-Step Breakdown:

1. **HRManager → `identity_auth.createProfile()`**
   Registers the HR manager with a company ID, role `#HR`, and unique `Principal`.

2. **Worker → `identity_auth.createProfile()`**
   Registers the employee under the same or another company, role `#Worker`.

3. **Merchant → `identity_auth.createProfile()`**
   Registers a merchant account with role `#Establishment`.

4. **HRManager → `benefits_manager.createBenefitProgram()`**
   Creates a benefit program by providing the company ID, frequency (e.g., monthly), and the benefit type (`#Food`, `#Culture`, etc.).

5. **`benefits_manager` → `identity_auth.hasRole(#HR)` + `belongsToCompany()`**
   Verifies that the caller is an authorized HR manager from the specified company.

6. **HRManager → `benefits_manager.assignWorkerToBenefit()`**
   Associates the worker (by `Principal`) to the created benefit program.

7. **`benefits_manager` → `wallets.createWallet(worker)`**
   Initializes a wallet canister entry for the worker if it does not exist.

8. **(Automated) `benefits_manager.executePayment()`**
   Periodic execution triggered by **on-chain timers**, based on the benefit frequency.

9. **`benefits_manager` → `wallets.creditBalance()`**
   Credits the correct benefit amount to each eligible worker’s wallet.

10. **Merchant → `establishment.processPayment()`**
    Initiates a payment request when the worker scans and authorizes a transaction.

11. **`establishment` → `identity_auth.hasRole(establishment)`**
    Verifies that the merchant has the appropriate permissions.

12. **`establishment` → `wallets.debitBalance()`**
    Debits the amount from the worker’s wallet for the benefit type being used.

13. **`wallets` → `establishment.confirmPayment()`**
    Confirms the success or failure of the payment to the merchant.


### Observations:

* All inter-canister communication is asynchronous and permission-checked.
* Worker and merchant interactions are gasless, enabled by the Reverse Gas Model.
* All actions are auditable via `getTransactionHistory()` in the `wallets` and `establishment` canisters.
* The flow is triggered both by user actions and scheduled automation via ICP Timers.

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

### Highlights

* Fully **gasless experience**: all costs sponsored by HR, enabling frictionless adoption.
* **No crypto knowledge required** for any role.
* **Single flow** for each persona, mapped to clear UI screens and canister calls.
* Designed for mobile-first usability with React + Tailwind.

Ótimo! Esse diagrama representa uma **visão UML de canisters**, detalhando os dados internos e as funções públicas de cada contrato inteligente do projeto **BeneChain**.


## 5. Canister Responsibilities and Interfaces (UML View)

This diagram provides a static overview of all the main canisters (smart contracts) in the BeneChain system. Each canister encapsulates its own state and exposes a limited, well-defined public interface. This modular architecture enforces clear separation of concerns and enhances scalability and security.

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

---

## 6. Canister Responsibilities Table

The table below summarizes the responsibilities, access scope, and language implementation of each core smart contract (canister) in the BeneChain system.

| Canister              | Description                                                           | Language | Accessed by                            | Key Methods                                                                   |
| --------------------- | --------------------------------------------------------------------- | -------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `identity_auth.mo`    | Manages user identity, role-based access control, and company linkage | Motoko   | All canisters, users                   | `createProfile()`, `hasRole()`, `belongsToCompany()`                          |
| `benefits_manager.mo` | Creates, schedules, and distributes benefit programs                  | Motoko   | HR, Timer, Wallets                     | `createBenefitProgram()`, `assignWorkerToBenefit()`, `executeManualPayment()` |
| `wallets.mo`          | Stores balances and transaction logs per worker and benefit type      | Motoko   | BenefitsManager, Establishment, Worker | `creditBalance()`, `debitBalance()`, `getWallet()`                            |
| `establishment.mo`    | Registers merchants, processes payments from workers                  | Motoko   | Merchants, Wallets                     | `registerEstablishment()`, `processPayment()`                                 |
| `reporting.rs`        | (Planned) Aggregates usage metrics, performs outcalls to ERPs         | Rust     | Internal/Analytics                     | `generateReport()`, `callERPoutcall()`                                        |
| `BENEFICIOS_frontend` | Serves the entire web UI as an asset canister                         | Asset    | End users (browser)                    | Static file hosting via `icx-asset`                                           |


### Observations

* Each canister follows **Single Responsibility Principle**.
* Canisters communicate asynchronously using **typed actor interfaces**.
* All user-facing actions map directly to one or more canister methods.


## 7. Identity & Permissioning

BeneChain leverages the Internet Computer's native authentication system, **Internet Identity (II)**, to ensure secure, passwordless login and robust on-chain access control. Every authenticated user is assigned a **unique Principal** (identity key), which is stored and validated directly within the smart contract layer.

#### Identity Flow

1. **User logs in** via WebAuthn using Internet Identity (e.g. biometrics, security key, or browser credentials).
2. **II returns a `Principal`** — a globally unique, pseudonymous identifier.
3. The user’s Principal is stored and managed in the `identity_auth.mo` canister.
4. Role-based access (HR, Worker, Establishment) is enforced via internal checks on each call.

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

* Their unique Principal (returned from Internet Identity)
* A display name
* Their role (used for access control)
* An optional company affiliation

#### Access Control Logic

All sensitive functions in other canisters (e.g. `assignWorkerToBenefit`, `processPayment`, `creditBalance`) **first validate**:

1. That the caller has a valid profile
2. That the caller has the appropriate role for that action
3. That they belong to the same company if required (e.g. HR and Worker linkage)

Example validation flow in `benefits_manager.mo`:

```motoko
if (await IdentityAuth.hasRole(callerPrincipal, #HR) and
    await IdentityAuth.belongsToCompany(callerPrincipal, program.companyId)) {
  // Proceed with action
} else {
  // Reject unauthorized request
}
```

### Highlights

| Feature                              | Description                                             |
| ------------------------------------ | ------------------------------------------------------- |
| **Passwordless login**               | Powered by Internet Identity and WebAuthn               |
| **Per-user profile mapping**         | Stored in `identity_auth.mo`                            |
| **On-chain role validation**         | Used in all permissioned canisters                      |
| **Company-scoped access control**    | Ensures multi-tenant safety and data isolation          |
| **No custodial auth infrastructure** | Everything runs within ICP — no third-party auth needed |

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

| Canister              | Data Model                                               |
| --------------------- | -------------------------------------------------------- |
| `identity_auth.mo`    | Maps `Principal → Profile { name, role, companyId }`     |
| `benefits_manager.mo` | Stores programs by ID, company, frequency, and value     |
| `establishment.mo`    | Maps `Principal → Establishment { name, types, status }` |
| `reporting.rs`        | (Planned) Will store cached reports and ERP sync results |


### Highlights

| Aspect               | Strategy                                                         |
| -------------------- | ---------------------------------------------------------------- |
| On-chain persistence | All data is stored in canisters using stable structures          |
| Upgrade safety       | Compatible with `dfx deploy --upgrade`                           |
| Role-based mapping   | Each `Principal` stores its own wallet, history, and profile     |
| Multi-tenant support | Each entity is scoped by `companyId`                             |
| Fully auditable      | All financial actions are immutably recorded in transaction logs |

---

## 9. Timer Automation Logic

BeneChain uses the **Internet Computer’s native timer API** to automate the execution of recurring benefit distributions without any external triggers or schedulers. This ensures a truly decentralized, self-operating system.

#### Why On-Chain Timers Matter

* No need for cron jobs, bots or backend servers
* Reduces operational complexity and central points of failure
* All automation is **verifiable and auditable** on-chain

#### Implementation

Timers are managed in the `benefits_manager.mo` canister using the `Timer.setTimer()` API.

Each `BenefitProgram` contains a defined frequency and day:

```motoko
type Frequency = { #Monthly; #Weekly; #OneTime };

type BenefitProgram = {
  id: Text;
  type: BenefitType;
  companyId: Text;
  amount: Nat;
  frequency: Frequency;
  day: Nat; // Day of week or month
};
```

When a benefit program is created, the system schedules its first execution based on its frequency:

```motoko
Timer.setTimer(Time.now() + computeDelay(program.frequency, program.day), distribute(program.id));
```

After each execution, the next run is re-scheduled:

```motoko
func distribute(programId: Text): async () {
  // credit all assigned workers
  await creditBalance(programId);

  // reschedule next cycle
  Timer.setTimer(Time.now() + computeNextDelay(...), distribute(programId));
};
```

#### Key Functions

| Function                  | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `computeDelay()`          | Calculates delay in nanoseconds until next execution |
| `creditBalance()`         | Calls `wallets.mo` to distribute amounts             |
| `setTimer()`              | Schedules the execution of `distribute()`            |
| `assignWorkerToBenefit()` | Keeps an internal mapping of workers per program     |

### Highlights

| Feature                  | Benefit                                                 |
| ------------------------ | ------------------------------------------------------- |
| Fully on-chain scheduler | No backend or off-chain scheduler needed                |
| Resilient & predictable  | All executions logged and tied to exact timestamps      |
| Auditable automation     | Can verify past/future executions in the canister state |
| Scalable                 | Works independently for each benefit program            |

---

### 10. Inter-Canister Communication

BeneChain uses the Internet Computer’s native support for **typed asynchronous inter-canister calls** to coordinate logic between modular services. Each smart contract (canister) exposes a public interface, allowing other canisters to invoke its functions in a secure and verifiable way.

#### Example: Distributing Benefits

The `benefits_manager.mo` canister periodically calls the `wallets.mo` canister to credit the appropriate amount to each worker:

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

#### Security: Role Validation First

Before any inter-canister call is executed, the system enforces strict role checks using the `identity_auth.mo` canister:

```motoko
if (await identityAuth.hasRole(caller, #HR)) {
  // proceed with operation
}
```

This ensures that only authorized entities (e.g., HR managers, merchants) can trigger cross-canister operations.

#### Error Handling

All asynchronous calls are pattern-matched to capture errors gracefully:

```motoko
switch (await wallet.creditBalance(...)) {
  case (#ok _) { /* success */ };
  case (#err e) { Debug.print("Transfer failed: " # e); };
};
```

#### Canister Interaction Summary

| Caller Canister       | Target Canister | Purpose                     |
| --------------------- | --------------- | --------------------------- |
| `benefits_manager`    | `wallets`       | Credit worker balances      |
| `establishment`       | `wallets`       | Debit balances upon payment |
| `benefits_manager`    | `identity_auth` | Validate HR role & company  |
| `establishment`       | `identity_auth` | Validate merchant role      |
| `reporting` (planned) | All others      | Pull data for reporting     |

### Highlights

| Capability                    | Benefit                                                  |
| ----------------------------- | -------------------------------------------------------- |
| Typed actor interfaces        | Compile-time validation of contract signatures           |
| Asynchronous execution        | Non-blocking, reliable system behavior                   |
| Principal-based access checks | Full identity-aware communication                        |
| Modular responsibility        | Clean separation of logic and easier testing             |
| Secure and auditable flows    | All cross-canister interactions can be logged and traced |

Perfeito! Com base nas telas que você enviou, aqui está um rascunho estruturado e bem documentado da seção **11. Frontend Integration**, que você pode incluir diretamente na sua documentação técnica:

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

## 12. Architecture Summary Table

This table summarizes the architectural principles and key technical characteristics of BeneChain. It highlights how each design decision contributes to security, modularity, performance, and full on-chain execution.

| **Aspect**                | **Description**                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| **Modular Design**        | Each core functionality runs in an isolated canister (auth, wallet, HR, etc).                   |
| **Role-based Access**     | `identity_auth.mo` enforces permissions (HR, Worker, Merchant) using principals.                |
| **On-chain Scheduler**    | `Timer.setTimer()` automates recurring distributions without external triggers.                 |
| **Gasless UX**            | Workers and merchants use the system without paying gas, thanks to the Reverse Gas Model.       |
| **Internet Identity**     | WebAuthn-based authentication with no passwords, wallet extensions, or seed phrases.            |
| **Typed Interfaces**      | All inter-canister calls use typed actors, reducing bugs and improving maintainability.         |
| **Scalable Reporting**    | A separate `reporting.rs` canister fetches, aggregates, and exports metrics via HTTPS outcalls. |
| **Canisterized Frontend** | React + TS UI deployed as a static asset canister using `icx-asset`.                            |
| **Auditability**          | All transactions and balances are queryable on-chain and tied to identity principals.           |
| **Multi-tenant Ready**    | Profiles and programs are scoped by companyId, supporting many organizations simultaneously.    |

---

## Technologies Used

| **Layer**            | **Stack / Tools**                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**          | [Motoko](https://internetcomputer.org/docs/current/motoko/), [Rust](https://www.rust-lang.org/) (for reporting), ICP Canisters (service isolation) |
| **Frontend**         | [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [TailwindCSS](https://tailwindcss.com/)                              |
| **Authentication**   | [Internet Identity](https://identity.ic0.app/) (WebAuthn-based decentralized identity)                                                             |
| **Protocol Layer**   | [Internet Computer Protocol (ICP)](https://internetcomputer.org/)                                                                                  |
| **Tooling & DevOps** | `dfx` CLI, `icx-asset`, Vite, Next.js (optional), [PocketIC](https://github.com/dfinity/pocketic) for local testing                                |

> All infrastructure is deployed fully on-chain — including static frontend assets and identity/auth services.

---

## ICP Native Features Utilized

| **Feature**                | **Description**                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Canisters**              | Modular, upgradeable smart contracts used for each core service (auth, wallet, HR, merchant, reports). |
| **Reverse Gas Model**      | Users interact with the app without owning tokens or paying transaction fees.                          |
| **Internet Identity (II)** | Seamless WebAuthn login; generates unique `Principal` for identity isolation.                          |
| **HTTPS Outcalls**         | Enables backend to interact with external systems (ERP validation, public registries, etc).            |
| **On-chain Timers**        | Schedules automatic benefit distributions (e.g. monthly deposits).                                     |
| **Chain Key Cryptography** | Supports seamless future integration with Bitcoin, Ethereum and stablecoins.                           |
| **Asset Canisters**        | Frontend hosted and served 100% on-chain without external hosting dependencies.                        |

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

##  Mainnet Canister IDs

| Module            | Canister ID      |
| ----------------- | ---------------- |
| identity\_auth    | `xxxx-yyyy-zzzz` |
| benefits\_manager | `xxxx-yyyy-zzzz` |
| wallets           | `xxxx-yyyy-zzzz` |
| establishment     | `xxxx-yyyy-zzzz` |
| frontend          | `xxxx-yyyy-zzzz` |

---

##  Demo Video

> Required! 5–10 min walkthrough of the application

* [ ] Link to full demo: [https://youtu.be/](https://youtu.be/)...
* [ ] Narration/subtitles included
* [ ] Explains the app flow (HR → Worker → Establishment → Report)
* [ ] Highlights code and ICP features used

---

## Screenshots

Add images to visualize key flows:

```markdown
![HR Dashboard](./assets/screenshots/hr_dashboard.png)
![Worker Wallet](./assets/screenshots/worker_wallet.png)
![Store Payment](./assets/screenshots/establishment_payment.png)
```

---

## Testing & Developer Tools

* [ ] Unit tests or PocketIC simulation tests
* [ ] `README` includes command-line test flow 
* [ ] Well-commented and typed code
* [ ] Canister interfaces (IDL) included

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
