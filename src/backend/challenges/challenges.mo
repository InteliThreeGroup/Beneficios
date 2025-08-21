// src/backend/challenges/challenges.mo
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
// Adicione esta linha ->
// Versão corrigida para garantir a recompilação
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

actor Challenges {

    // --- DEFINIÇÕES DE CHAMADAS ENTRE CANISTERS ---
    // Nota: Os IDs dos canisters são substituídos em tempo de compilação pelos aliases em dfx.json.
    private let identityCanisterPrincipal : Principal = Principal.fromText("ulvla-h7777-77774-qaacq-cai");
    private let walletCanisterPrincipal : Principal = Principal.fromText("vpyes-67777-77774-qaaeq-cai");

    // Define a interface para o canister de identidade.
    private type IdentityAuth = actor {
        getProfileFor: (user: Principal) -> async Result.Result<UserProfile, Text>;
        hasRole: (user: Principal, role: UserRole) -> async Bool;
    };

    // Define a interface para o canister de carteiras.
    private type Wallet = actor {
        creditBalance: (workerId: Principal, benefitType: BenefitType, amount: Nat, programId: Text, description: Text) -> async Result.Result<Text, Text>;
    };

    private let identityAuth : IdentityAuth = actor(Principal.toText(identityCanisterPrincipal));
    private let wallet : Wallet = actor(Principal.toText(walletCanisterPrincipal));

    // --- TIPOS DE DADOS PÚBLICOS E PRIVADOS ---
    public type UserRole = { #HR; #Worker; #Establishment };
    public type BenefitType = { #Food; #Culture; #Health; #Transport; #Education; #ChallengeToken };

    // Este tipo UserProfile DEVE ser estruturalmente idêntico ao retornado pelo canister identity_auth.
    public type UserProfile = {
        principal: Principal;
        name: Text;
        role: UserRole;
        companyId: Text;
    };

    public type Challenge = {
        id: Text;
        title: Text;
        description: Text;
        companyId: Text;
        reward: Nat;
        deadline: Time.Time;
        isActive: Bool;
        createdAt: Time.Time;
        createdBy: Principal;
    };

    public type SubmissionStatus = { #Pending; #Approved; #Rejected };

    public type Submission = {
        id: Text;
        challengeId: Text;
        workerId: Principal;
        workerName: Text;
        submissionContent: Text; // Pode ser uma URL para a evidência, texto, etc.
        submittedAt: Time.Time;
        status: SubmissionStatus;
    };

    // --- ESTADO DO CANISTER ---
    private stable var challengesEntries : [(Text, Challenge)] = [];
    private var challenges = HashMap.HashMap<Text, Challenge>(0, Text.equal, Text.hash);

    private stable var submissionsEntries : [(Text, Submission)] = [];
    private var submissions = HashMap.HashMap<Text, Submission>(0, Text.equal, Text.hash);

    private stable var nextChallengeId : Nat = 1;
    private stable var nextSubmissionId : Nat = 1;

    // --- HOOKS DE UPGRADE (para persistência de dados) ---
    system func preupgrade() {
        challengesEntries := Iter.toArray(challenges.entries());
        submissionsEntries := Iter.toArray(submissions.entries());
    };

    system func postupgrade() {
        challenges := HashMap.fromIter(Iter.fromArray(challengesEntries), 0, Text.equal, Text.hash);
        submissions := HashMap.fromIter(Iter.fromArray(submissionsEntries), 0, Text.equal, Text.hash);
    };

    // --- FUNÇÕES DE ATUALIZAÇÃO PÚBLICAS ---

    public shared(msg) func createChallenge(title: Text, description: Text, companyId: Text, reward: Nat, deadline: Time.Time) : async Result.Result<Challenge, Text> {
        if (Principal.isAnonymous(msg.caller)) { return #err("Principais anônimos não podem criar desafios."); };

        let isHR = await identityAuth.hasRole(msg.caller, #HR);
        if (not isHR) { return #err("Apenas pessoal de RH pode criar desafios."); };

        let profileResult = await identityAuth.getProfileFor(msg.caller);
        switch (profileResult) {
            case (#ok(profile)) {
                if (profile.companyId != companyId) {
                    return #err("Pessoal de RH só pode criar desafios para sua própria empresa.");
                };
            };
            case (#err(e)) {
                return #err("Não foi possível verificar o perfil do usuário: " # e);
            };
        };

        let challengeId = Nat.toText(nextChallengeId);
        let newChallenge : Challenge = {
            id = challengeId;
            title = title;
            description = description;
            companyId = companyId;
            reward = reward;
            deadline = deadline;
            isActive = true;
            createdAt = Time.now();
            createdBy = msg.caller;
        };

        challenges.put(challengeId, newChallenge);
        nextChallengeId += 1;
        return #ok(newChallenge);
    };

    public shared(msg) func submitToChallenge(challengeId: Text, submissionContent: Text) : async Result.Result<Submission, Text> {
        if (Principal.isAnonymous(msg.caller)) { return #err("Principais anônimos não podem submeter a desafios."); };

        switch (challenges.get(challengeId)) {
            case (null) { return #err("Desafio não encontrado."); };
            case (?challenge) {
                if (not challenge.isActive or Time.now() > challenge.deadline) {
                    return #err("Este desafio não está ativo ou já expirou.");
                };

                let profileResult = await identityAuth.getProfileFor(msg.caller);
                switch (profileResult) {
                    case (#err(e)) { return #err("Não foi possível verificar o perfil do usuário: " # e); };
                    case (#ok(profile)) {
                        if (profile.role != #Worker) { return #err("Apenas trabalhadores podem submeter a desafios."); };
                        if (profile.companyId != challenge.companyId) {
                            return #err("Você só pode submeter a desafios da sua própria empresa.");
                        };

                        let submissionId = Nat.toText(nextSubmissionId);
                        let newSubmission : Submission = {
                            id = submissionId;
                            challengeId = challengeId;
                            workerId = msg.caller;
                            workerName = profile.name;
                            submissionContent = submissionContent;
                            submittedAt = Time.now();
                            status = #Pending;
                        };

                        submissions.put(submissionId, newSubmission);
                        nextSubmissionId += 1;
                        return #ok(newSubmission);
                    };
                };
            };
        };
    };

    public shared(msg) func approveOrRejectSubmission(submissionId: Text, approve: Bool) : async Result.Result<Text, Text> {
        if (Principal.isAnonymous(msg.caller)) { return #err("Principais anônimos não podem processar submissões."); };

        let submission = switch(submissions.get(submissionId)) {
            case (?s) { s };
            case (null) { return #err("Submissão não encontrada."); };
        };

        if (submission.status != #Pending) {
            return #err("A submissão já foi processada.");
        };

        let challenge = switch(challenges.get(submission.challengeId)) {
            case (?c) { c };
            case (null) { return #err("Erro interno: Desafio não encontrado para esta submissão."); };
        };

        let isHR = await identityAuth.hasRole(msg.caller, #HR);
        if (not isHR) { return #err("Apenas pessoal de RH pode processar submissões."); };

        let hrProfileResult = await identityAuth.getProfileFor(msg.caller);
        switch (hrProfileResult) {
            case (#err(e)) { return #err("Não foi possível verificar o perfil do RH: " # e); };
            case (#ok(hrProfile)) {
                if (hrProfile.companyId != challenge.companyId) {
                    return #err("Você só pode processar submissões para os desafios da sua própria empresa.");
                };
            };
        };

        if (approve) {
            let description = "Recompensa por completar o desafio: " # challenge.title;
            let creditResult = await wallet.creditBalance(
                submission.workerId,
                #ChallengeToken,
                challenge.reward,
                challenge.id,
                description
            );

            switch (creditResult) {
                case (#ok(txId)) {
                    let updatedSubmission : Submission = { submission with status = #Approved };
                    submissions.put(submissionId, updatedSubmission);
                    return #ok("Submissão aprovada e recompensa creditada. ID da Transação: " # txId);
                };
                case (#err(error)) {
                    return #err("Falha ao creditar a recompensa: " # error);
                };
            };
        } else {
            let updatedSubmission : Submission = { submission with status = #Rejected };
            submissions.put(submissionId, updatedSubmission);
            return #ok("Submissão rejeitada.");
        };
    };

    // Função para aprovar/rejeitar submissões com integração de carteira
    public shared(msg) func approveOrRejectSubmissionSimple(submissionId: Text, approve: Bool) : async Result.Result<Text, Text> {
        if (Principal.isAnonymous(msg.caller)) { return #err("Principais anônimos não podem processar submissões."); };

        let submission = switch(submissions.get(submissionId)) {
            case (?s) { s };
            case (null) { return #err("Submissão não encontrada."); };
        };

        if (submission.status != #Pending) {
            return #err("A submissão já foi processada.");
        };

        if (approve) {
            // Buscar o desafio para obter a recompensa
            let challenge = switch(challenges.get(submission.challengeId)) {
                case (?c) { c };
                case (null) { return #err("Desafio não encontrado."); };
            };
            
            // Creditar tokens na carteira do trabalhador
            try {
                let creditResult = await wallet.creditBalance(
                    submission.workerId,
                    #ChallengeToken,
                    challenge.reward,
                    submission.challengeId,
                    "Recompensa por desafio: " # challenge.title
                );
                
                switch (creditResult) {
                    case (#ok(_)) {
                        let updatedSubmission : Submission = { submission with status = #Approved };
                        submissions.put(submissionId, updatedSubmission);
                        return #ok("Submissão aprovada e " # Nat.toText(challenge.reward) # " tokens creditados.");
                    };
                    case (#err(e)) {
                        return #err("Submissão aprovada, mas falha ao creditar tokens: " # e);
                    };
                };
            } catch (e) {
                return #err("Erro ao creditar tokens: " # "Falha na comunicação com carteira");
            };
        } else {
            let updatedSubmission : Submission = { submission with status = #Rejected };
            submissions.put(submissionId, updatedSubmission);
            return #ok("Submissão rejeitada.");
        };
    };

    // --- FUNÇÕES DE CONSULTA PÚBLICAS ---

    public query func getActiveChallenges(companyId: Text) : async [Challenge] {
        let allChallenges = Iter.toArray(challenges.vals());
        var active : [Challenge] = [];
        for (challenge in Iter.fromArray(allChallenges)) {
            if (challenge.companyId == companyId and challenge.isActive and Time.now() <= challenge.deadline) {
                active := Array.append(active, [challenge]);
            };
        };
        return active;
    };

    public query func getSubmissionsForChallenge(challengeId: Text) : async [Submission] {
        let allSubmissions = Iter.toArray(submissions.vals());
        var filtered : [Submission] = [];
        for (submission in Iter.fromArray(allSubmissions)) {
            if (submission.challengeId == challengeId) {
                filtered := Array.append(filtered, [submission]);
            };
        };
        return filtered;
    };

    // Nova função para buscar submissões por trabalhador
    public query func getSubmissionsForWorker(workerId: Principal) : async [Submission] {
        let allSubmissions = Iter.toArray(submissions.vals());
        var filtered : [Submission] = [];
        for (submission in Iter.fromArray(allSubmissions)) {
            if (submission.workerId == workerId) {
                filtered := Array.append(filtered, [submission]);
            };
        };
        return filtered;
    };

    // Função de teste para debug IDL
    public func testTextArgs(arg1: Text, arg2: Text, arg3: Text) : async Text {
        return "Received: " # arg1 # ", " # arg2 # ", " # arg3;
    };

    // Função de teste simplificada sem chamadas externas
    public shared(msg) func createChallengeSimple(title: Text, description: Text, companyId: Text, reward: Nat, deadline: Time.Time) : async Result.Result<Challenge, Text> {
        if (Principal.isAnonymous(msg.caller)) { return #err("Principais anônimos não podem criar desafios."); };

        let challengeId = Nat.toText(nextChallengeId);
        let newChallenge : Challenge = {
            id = challengeId;
            title = title;
            description = description;
            companyId = companyId;
            reward = reward;
            deadline = deadline;
            isActive = true;
            createdAt = Time.now();
            createdBy = msg.caller;
        };

        challenges.put(challengeId, newChallenge);
        nextChallengeId += 1;
        return #ok(newChallenge);
    };

    // Função de teste simplificada para submissão sem verificações externas
    public shared(msg) func submitToChallengeSimple(challengeId: Text, submissionContent: Text) : async Result.Result<Submission, Text> {
        if (Principal.isAnonymous(msg.caller)) { return #err("Principais anônimos não podem submeter a desafios."); };

        switch (challenges.get(challengeId)) {
            case (null) { return #err("Desafio não encontrado."); };
            case (?challenge) {
                if (not challenge.isActive or Time.now() > challenge.deadline) {
                    return #err("Este desafio não está ativo ou já expirou.");
                };

                let submissionId = Nat.toText(nextSubmissionId);
                let newSubmission : Submission = {
                    id = submissionId;
                    challengeId = challengeId;
                    workerId = msg.caller;
                    workerName = "Test Worker"; // Hardcoded para debug
                    submissionContent = submissionContent;
                    submittedAt = Time.now();
                    status = #Pending;
                };

                submissions.put(submissionId, newSubmission);
                nextSubmissionId += 1;
                return #ok(newSubmission);
            };
        };
    };

    // <<< NOVA FUNÇÃO ADICIONADA AQUI >>>
    public query func getChallengeById(challengeId: Text) : async ?Challenge {
        return challenges.get(challengeId);
    };
}