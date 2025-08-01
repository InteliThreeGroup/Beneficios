// benefits_manager.mo - VERSÃO FINAL CORRIGIDA
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
// import Timer "mo:base/Timer"; // Removido pois não há mais timers
import Debug "mo:base/Debug";

actor BenefitsManager {
    
    // --- Definições para Chamadas Cross-Canister ---
    private let identityCanisterPrincipal : Principal = Principal.fromText("umunu-kh777-77774-qaaca-cai"); // Verifique ID
    private let walletCanisterPrincipal : Principal = Principal.fromText("ucwa4-rx777-77774-qaada-cai"); // Verifique ID

    private type IdentityAuth = actor {
        belongsToCompany : (user: Principal, companyId: Text) -> async Bool;
        hasRole: (user: Principal, role: UserRole) -> async Bool;
    };
    
    private type Wallet = actor {
        creditBalance: (workerId: Principal, benefitType: BenefitType, amount: Nat, programId: Text, description: Text) -> async Result.Result<Text, Text>;
    };

    private let identityAuth : IdentityAuth = actor(Principal.toText(identityCanisterPrincipal));
    private let wallet : Wallet = actor(Principal.toText(walletCanisterPrincipal));
    
    // --- Tipos Públicos ---
    public type UserRole = { #HR; #Worker; #Establishment };
    public type BenefitType = { #Food; #Culture; #Health; #Transport; #Education };
    public type PaymentFrequency = { #Monthly; #Weekly; #Biweekly };
    public type BenefitProgram = { id: Text; name: Text; benefitType: BenefitType; companyId: Text; amountPerWorker: Nat; frequency: PaymentFrequency; paymentDay: Nat; isActive: Bool; createdAt: Int; createdBy: Principal; };
    public type WorkerBenefit = { workerId: Principal; programId: Text; customAmount: ?Nat; isActive: Bool; assignedAt: Int; assignedBy: Principal; };
    
    // --- Estado Estável e Variáveis ---
    private stable var benefitProgramsEntries : [(Text, BenefitProgram)] = [];
    private stable var workerBenefitsEntries : [(Text, WorkerBenefit)] = [];
    private stable var nextProgramId : Nat = 1;
    // NOVO: Fundos disponíveis no canister para distribuição
    private stable var availableFunds : Nat = 0; 

    private var benefitPrograms = HashMap.HashMap<Text, BenefitProgram>(0, Text.equal, Text.hash);
    private var workerBenefits = HashMap.HashMap<Text, WorkerBenefit>(0, Text.equal, Text.hash);

    // --- Funções de Upgrade ---
    system func preupgrade() {
        benefitProgramsEntries := Iter.toArray(benefitPrograms.entries());
        workerBenefitsEntries := Iter.toArray(workerBenefits.entries());
        // NOVO: Salva availableFunds durante o preupgrade
        // No Motoko, `availableFunds` é uma variável Nat diretamente.
        // Não é necessário adicioná-la a uma lista `entries` se já é stable.
    };

    system func postupgrade() {
        benefitPrograms := HashMap.HashMap<Text, BenefitProgram>(benefitProgramsEntries.size(), Text.equal, Text.hash);
        var i = 0;
        while (i < benefitProgramsEntries.size()) {
            let (key, value) = benefitProgramsEntries[i];
            benefitPrograms.put(key, value);
            i += 1;
        };

        workerBenefits := HashMap.HashMap<Text, WorkerBenefit>(workerBenefitsEntries.size(), Text.equal, Text.hash);
        var j = 0;
        while (j < workerBenefitsEntries.size()) {
            let (key, value) = workerBenefitsEntries[j];
            workerBenefits.put(key, value);
            j += 1;
        };
        
        benefitProgramsEntries := [];
        workerBenefitsEntries := [];
        // NOVO: availableFunds é restaurado automaticamente se for stable.
        // Se a variável stable não for inicializada, ela retoma seu valor pré-upgrade.
    };
    
    // --- Funções Privadas ---
    private func assertIsCompanyHr(caller: Principal, companyId: Text) : async () {
        if (Principal.isAnonymous(caller)) { Debug.trap("Anonymous principal not allowed"); };
        let hasCorrectRole = await identityAuth.hasRole(caller, #HR);
        if (not hasCorrectRole) { Debug.trap("Caller does not have HR role"); };
        let belongsToCorrectCompany = await identityAuth.belongsToCompany(caller, companyId);
        if (not belongsToCorrectCompany) { Debug.trap("Caller does not belong to the specified company"); };
    };
    
    private func executePayment(programId: Text) : async () {
        switch(benefitPrograms.get(programId)) {
            case (?program) {
                if (not program.isActive) { return; };
                let eligibleWorkers = getEligibleWorkers(programId);
                
                // NOVO: Verifica se há fundos suficientes antes de distribuir
                var totalAmountNeeded : Nat = 0;
                var k = 0;
                while (k < eligibleWorkers.size()) {
                    let workerBenefit = eligibleWorkers[k];
                    totalAmountNeeded += Option.get(workerBenefit.customAmount, program.amountPerWorker);
                    k += 1;
                };

                if (availableFunds < totalAmountNeeded) {
                    Debug.trap("Insufficient funds in manager canister to execute payment. Needed: " # Nat.toText(totalAmountNeeded) # ", Available: " # Nat.toText(availableFunds));
                };

                // Deduz os fundos ANTES de distribuir para evitar problemas
                availableFunds := availableFunds - totalAmountNeeded;
                Debug.print("Funds reduced. Remaining: " # Nat.toText(availableFunds));

                var i = 0;
                while (i < eligibleWorkers.size()) {
                    let workerBenefit = eligibleWorkers[i];
                    let amountToCredit = Option.get(workerBenefit.customAmount, program.amountPerWorker);
                    let description = "Credito de beneficio: " # program.name;
                    let _ = await wallet.creditBalance(workerBenefit.workerId, program.benefitType, amountToCredit, program.id, description);
                    i += 1;
                };
            };
            case null {};
        };
    };

    private func getEligibleWorkers(programId: Text) : [WorkerBenefit] {
        var result : [WorkerBenefit] = [];
        let entries = Iter.toArray(workerBenefits.entries());
        var i = 0;
        while (i < entries.size()) {
            let (_, workerBenefit) = entries[i];
            if (workerBenefit.programId == programId and workerBenefit.isActive) {
                result := Array.append(result, [workerBenefit]);
            };
            i += 1;
        };
        return result;
    };

    // --- Funções Públicas (Existentes) ---
    // ... (createBenefitProgram, assignWorkerToBenefit, updateWorkerBenefitAmount) ...

    public shared(msg) func createBenefitProgram(name: Text, benefitType: BenefitType, companyId: Text, amountPerWorker: Nat, frequency: PaymentFrequency, paymentDay: Nat) : async Result.Result<BenefitProgram, Text> {
        await assertIsCompanyHr(msg.caller, companyId);
        if (paymentDay < 1 or paymentDay > 31) { return #err("Payment day must be between 1 and 31"); };
        let programId = "program_" # Nat.toText(nextProgramId);
        nextProgramId += 1;
        let program: BenefitProgram = {
            id = programId; name = name; benefitType = benefitType;
            companyId = companyId; amountPerWorker = amountPerWorker;
            frequency = frequency; paymentDay = paymentDay; isActive = true;
            createdAt = Time.now(); createdBy = msg.caller;
        };
        benefitPrograms.put(programId, program);
        return #ok(program);
    };
    
    public shared(msg) func assignWorkerToBenefit(workerId: Principal, programId: Text, customAmount: ?Nat) : async Result.Result<Text, Text> {
        switch(benefitPrograms.get(programId)) {
            case (?program) {
                await assertIsCompanyHr(msg.caller, program.companyId);
                let key = Principal.toText(workerId) # "#" # programId;
                let workerBenefit: WorkerBenefit = {
                    workerId = workerId; programId = programId;
                    customAmount = customAmount; isActive = true;
                    assignedAt = Time.now(); assignedBy = msg.caller;
                };
                workerBenefits.put(key, workerBenefit);
                return #ok("Worker assigned successfully");
            };
            case null {
                return #err("Benefit program not found");
            };
        };
    };
    
    public shared(msg) func updateWorkerBenefitAmount(workerId: Principal, programId: Text, newAmount: Nat) : async Result.Result<Text, Text> {
        let key = Principal.toText(workerId) # "#" # programId;
        switch(workerBenefits.get(key)) {
            case (?workerBenefit) {
                switch(benefitPrograms.get(programId)) {
                    case (?program) {
                        await assertIsCompanyHr(msg.caller, program.companyId);
                        let updatedBenefit: WorkerBenefit = {
                            workerId = workerBenefit.workerId;
                            programId = workerBenefit.programId;
                            customAmount = ?newAmount;
                            isActive = workerBenefit.isActive;
                            assignedAt = workerBenefit.assignedAt;
                            assignedBy = workerBenefit.assignedBy;
                        };
                        workerBenefits.put(key, updatedBenefit);
                        return #ok("Worker benefit amount updated");
                    };
                    case null {
                         return #err("Benefit program not found");
                    };
                };
            } ;
            case null {
                return #err("Worker benefit assignment not found");
            };
        };
    };
    
    public shared(msg) func executeManualPayment(programId: Text) : async Result.Result<Text, Text> {
        switch(benefitPrograms.get(programId)) {
            case (?program) {
                await assertIsCompanyHr(msg.caller, program.companyId);
                await executePayment(programId); // A função privada 'executePayment' agora verifica e deduz os fundos
                return #ok("Manual payment executed successfully");
            };
            case null {
                return #err("Benefit program not found");
            };
        };
    };
    
    public query func getBenefitProgram(programId: Text) : async Result.Result<BenefitProgram, Text> {
        switch(benefitPrograms.get(programId)) {
            case (?program) {
                return #ok(program);
            };
            case null {
                return #err("Program not found");
            };
        };
    };

    public query func getCompanyBenefitPrograms(companyId: Text) : async [BenefitProgram] {
        var result : [BenefitProgram] = [];
        let entries = Iter.toArray(benefitPrograms.entries());
        var i = 0;
        while (i < entries.size()) {
            let (_, program) = entries[i];
            if (program.companyId == companyId) {
                result := Array.append(result, [program]);
            };
            i += 1;
        };
        return result;
    };

    public query func getWorkerBenefits(workerId: Principal) : async [BenefitProgram] {
        var result : [BenefitProgram] = [];
        let entries = Iter.toArray(workerBenefits.entries());
        var i = 0;
        while (i < entries.size()) {
            let (_, workerBenefit) = entries[i];
            if (workerBenefit.workerId == workerId and workerBenefit.isActive) {
                switch(benefitPrograms.get(workerBenefit.programId)) {
                    case (?program) {
                        result := Array.append(result, [program]);
                    };
                    case null {};
                };
            };
            i += 1;
        };
        return result;
    };

    // --- NOVAS FUNÇÕES PARA GESTÃO DE FUNDOS ---
    public shared(msg) func depositFunds(amount: Nat) : async Result.Result<Nat, Text> {
        // Apenas o RH que possui a empresa pode depositar
        // Nota: Esta é uma simulação de depósito. Em um sistema real, o RH enviaria ICP ou tokens.
        // Aqui, apenas aumentamos o saldo interno `availableFunds`.
        if (Principal.isAnonymous(msg.caller)) { return #err("Anonymous principal cannot deposit funds"); };
        // Em um sistema real, você verificaria se o msg.caller é um HR válido para alguma empresa.
        // Por simplicidade do MVP, qualquer caller não anônimo pode "depositar".
        // Você pode adicionar: await assertIsCompanyHr(msg.caller, <some_company_id_here>);
        // Mas isso exigiria passar o companyId no deposit, complicando.
        
        availableFunds := availableFunds + amount;
        return #ok(availableFunds);
    };

    public query func getAvailableFunds() : async Nat {
        return availableFunds;
    };
}
