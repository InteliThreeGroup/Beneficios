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
    private let identityCanisterPrincipal : Principal = Principal.fromText("uzt4z-lp777-77774-qaabq-cai");
    private let walletCanisterPrincipal : Principal = Principal.fromText("umunu-kh777-77774-qaaca-cai");

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
    private var benefitPrograms = HashMap.HashMap<Text, BenefitProgram>(0, Text.equal, Text.hash);
    private var workerBenefits = HashMap.HashMap<Text, WorkerBenefit>(0, Text.equal, Text.hash);
    // private var paymentTimers = HashMap.HashMap<Text, Timer.TimerId>(0, Text.equal, Text.hash); // Removido

    // --- Funções de Upgrade ---
    system func preupgrade() {
        benefitProgramsEntries := Iter.toArray(benefitPrograms.entries());
        workerBenefitsEntries := Iter.toArray(workerBenefits.entries());
    };

    system func postupgrade() {
        // Reconstrução manual do HashMap para compatibilidade
        benefitPrograms := HashMap.HashMap<Text, BenefitProgram>(benefitProgramsEntries.size(), Text.equal, Text.hash);
        for ((key, value) in benefitProgramsEntries.vals()) {
            benefitPrograms.put(key, value);
        };

        workerBenefits := HashMap.HashMap<Text, WorkerBenefit>(workerBenefitsEntries.size(), Text.equal, Text.hash);
        for ((key, value) in workerBenefitsEntries.vals()) {
            workerBenefits.put(key, value);
        };
        
        benefitProgramsEntries := [];
        workerBenefitsEntries := [];
        // recreatePaymentTimers(); // Removido
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
                for (workerBenefit in eligibleWorkers.vals()) {
                    let amountToCredit = Option.get(workerBenefit.customAmount, program.amountPerWorker);
                    let description = "Credito de beneficio: " # program.name;
                    let _ = await wallet.creditBalance(workerBenefit.workerId, program.benefitType, amountToCredit, program.id, description);
                };
            };
            case null {};
        };
    };

    private func getEligibleWorkers(programId: Text) : [WorkerBenefit] {
        var workers : [WorkerBenefit] = [];
        for ((_, workerBenefit) in workerBenefits.entries()) {
            if (workerBenefit.programId == programId and workerBenefit.isActive) {
                workers := Array.append(workers, [workerBenefit]);
            };
        };
        return workers;
    };
    
    // --- Funções de Timer Removidas ---
    // A função schedulePayment foi removida
    // A função recreatePaymentTimers foi removida

    // --- Funções Públicas ---
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
        // let _ = schedulePayment(programId, program); // Removido
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
                await executePayment(programId);
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
        var programs : [BenefitProgram] = [];
        for ((_, program) in benefitPrograms.entries()) {
            if (program.companyId == companyId) {
                programs := Array.append(programs, [program]);
            };
        };
        return programs;
    };

    public query func getWorkerBenefits(workerId: Principal) : async [BenefitProgram] {
        var programs : [BenefitProgram] = [];
        for ((_, workerBenefit) in workerBenefits.entries()) {
            if (workerBenefit.workerId == workerId and workerBenefit.isActive) {
                switch(benefitPrograms.get(workerBenefit.programId)) {
                    case (?program) {
                        programs := Array.append(programs, [program]);
                    };
                    case null {};
                };
            };
        };
        return programs;
    };
}
