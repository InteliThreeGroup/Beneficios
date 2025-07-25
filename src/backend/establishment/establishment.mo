// establishment.mo - VERSÃO CORRIGIDA FINAL
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor Establishment {

    // CANISTER IDs - ATUALIZE ESTES IDs COM OS VALORES DO SEU `dfx deploy` MAIS RECENTE!
    // Para o wallets.mo (Exemplo do log anterior: ucwa4-rx777-77774-qaada-cai)
    private let walletCanisterPrincipal : Principal = Principal.fromText("ucwa4-rx777-77774-qaada-cai"); 
    // Para o reporting.mo (Exemplo do log anterior: ulvla-h7777-77774-qaacq-cai)
    private let reportingCanisterPrincipal : Principal = Principal.fromText("ulvla-h7777-77774-qaacq-cai"); 

    // Definição da interface do Canister Wallets para chamadas cross-canister
    public type WalletPaymentRequest = {
        workerId: Principal; establishmentId: Principal; establishmentName: Text;
        benefitType: BenefitType; amount: Nat; description: Text;
    };
    private type Wallet = actor {
        debitBalance: (paymentRequest: WalletPaymentRequest) -> async Result.Result<Text, Text>;
    };
    private let wallet : Wallet = actor(Principal.toText(walletCanisterPrincipal));


    // Definição da interface do Canister Reporting para chamadas cross-canister
    // Não é estritamente necessário definir a interface aqui se o Reporting não será chamado por Establishment,
    // mas é útil para referência se houver planos futuros.
    // private type Reporting = actor {
    //    getTransactionsForReporting: (Principal, ?Nat) -> async [PaymentTransaction]; // Exemplo
    // };
    // private let reporting : Reporting = actor(Principal.toText(reportingCanisterPrincipal));


    // NOVO TIPO: Dados que o Wallets enviará para o Establishment para registrar o pagamento
    public type ReceivedPaymentRequest = {
        transactionId: Text; // ID da transação no wallets (para rastreamento)
        workerId: Principal;
        establishmentId: Principal;
        benefitType: BenefitType;
        amount: Nat;
        description: Text;
    };

    // Tipos de dados
    public type BenefitType = {
        #Food; #Culture; #Health; #Transport; #Education;
    };

    public type EstablishmentProfile = {
        id: Principal; name: Text; country: Text; businessCode: Text;
        walletPrincipal: Principal; acceptedBenefitTypes: [BenefitType];
        isActive: Bool; createdAt: Int; totalTransactions: Nat;
        totalReceived: Nat; lastActivity: Int;
    };

    public type PaymentTransaction = {
        id: Text; establishmentId: Principal; workerId: Principal;
        benefitType: BenefitType; amount: Nat; status: PaymentStatus;
        createdAt: Int; processedAt: ?Int; description: Text;
    };

    public type PaymentStatus = {
        #Pending; #Completed; #Failed; #Cancelled;
    };

    public type RegisterEstablishmentRequest = {
        name: Text; country: Text; businessCode: Text;
        walletPrincipal: Principal; acceptedBenefitTypes: [BenefitType];
    };

    public type PaymentRequest = { // Usado quando o Establishment PULA o QR Code e processa DIRETAMENTE.
        workerId: Principal; benefitType: BenefitType;
        amount: Nat; description: Text;
    };

    public type PaymentValidation = {
        isValid: Bool; reason: ?Text; establishmentName: Text;
        benefitType: BenefitType; amount: Nat;
    };

    // Estado do canister
    private stable var establishmentsEntries : [(Principal, EstablishmentProfile)] = [];
    private stable var transactionsEntries : [(Text, PaymentTransaction)] = [];
    private stable var nextTransactionId : Nat = 1;

    private var establishments = HashMap.HashMap<Principal, EstablishmentProfile>(0, Principal.equal, Principal.hash);
    private var transactions = HashMap.HashMap<Text, PaymentTransaction>(0, Text.equal, Text.hash);

    // Funções de Upgrade
    system func preupgrade() {
        establishmentsEntries := Iter.toArray(establishments.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
    };

    system func postupgrade() {
        establishments := HashMap.fromIter(establishmentsEntries.vals(), establishmentsEntries.size(), Principal.equal, Principal.hash);
        transactions := HashMap.fromIter(transactionsEntries.vals(), transactionsEntries.size(), Text.equal, Text.hash);
        establishmentsEntries := [];
        transactionsEntries := [];
    };

    // --- FUNÇÕES PÚBLICAS ---

    // NOVO: Função para o Wallets canister registrar um pagamento recebido
    private let authorizedWalletsCanister : Principal = Principal.fromText("ucwa4-rx777-77774-qaada-cai"); // <<< ATUALIZE COM O ID DO SEU WALLETS CANISTER!
    public shared(msg) func registerReceivedPayment(request: ReceivedPaymentRequest) : async Result.Result<Text, Text> {
        // CRÍTICO: Verificar se o chamador é o canister 'wallets' autorizado para segurança
        if (msg.caller != authorizedWalletsCanister) {
            Debug.trap("Unauthorized call: Only wallets canister can register payments.");
            // Em produção, considere retornar um #err em vez de #trap
            // return #err("Unauthorized call: Only wallets canister can register payments."); 
        };

        switch (establishments.get(request.establishmentId)) { // Usa request.establishmentId pois é o ID deste canister
            case (?establishment_profile) {
                // Crie uma nova transação no histórico do estabelecimento
                // Esta transação será marcada como 'Completed' imediatamente
                let txIdText = "tx_est_" # Nat.toText(nextTransactionId);
                nextTransactionId += 1;

                let newTransaction: PaymentTransaction = {
                    id = txIdText;
                    establishmentId = request.establishmentId;
                    workerId = request.workerId;
                    benefitType = request.benefitType;
                    amount = request.amount;
                    status = #Completed; // Marcar como concluída aqui
                    createdAt = Time.now();
                    processedAt = ?Time.now();
                    description = request.description;
                };

                transactions.put(txIdText, newTransaction);

                // CORREÇÃO: Sintaxe limpa para atualização de registro
                establishments.put(request.establishmentId, {
                    establishment_profile with 
                    totalTransactions = establishment_profile.totalTransactions + 1;
                    totalReceived = establishment_profile.totalReceived + request.amount;
                    lastActivity = Time.now();
                });

                return #ok(txIdText);
            };
            case (null) {
                // Isso não deveria acontecer se o request.establishmentId for o Principal deste canister
                Debug.trap("Received payment for unregistered establishment ID: " # Principal.toText(request.establishmentId));
                // return #err("Establishment not registered for payment.");
            };
        }
    };

    // Função para registrar um novo estabelecimento
    public shared(msg) func registerEstablishment(request: RegisterEstablishmentRequest) : async Result.Result<EstablishmentProfile, Text> {
        let caller = msg.caller;
        if (Option.isSome(establishments.get(caller))) {
            return #err("Establishment already registered");
        };
        // NOTE: isValidBusinessCode não está definida neste código. Assumindo que é uma função auxiliar em outro lugar.
        // Se ela não existe, você terá que defini-la ou remover essa checagem.
        // if (not isValidBusinessCode(request.country, request.businessCode)) {
        //     return #err("Invalid business code for country: " # request.country);
        // };
        let profile: EstablishmentProfile = {
            id = caller; name = request.name; country = request.country; businessCode = request.businessCode;
            walletPrincipal = request.walletPrincipal; acceptedBenefitTypes = request.acceptedBenefitTypes;
            isActive = true; createdAt = Time.now(); totalTransactions = 0; totalReceived = 0; lastActivity = Time.now();
        };
        establishments.put(caller, profile);
        #ok(profile)
    };

    // Função para atualizar informações do estabelecimento
    public shared(msg) func updateEstablishment(name: ?Text, acceptedBenefitTypes: ?[BenefitType], walletPrincipal: ?Principal, isActive: ?Bool) : async Result.Result<EstablishmentProfile, Text> {
        let caller = msg.caller;
        switch (establishments.get(caller)) {
            case (?profile) {
                // CORREÇÃO: Sintaxe limpa para atualização de registro
                let updatedProfile: EstablishmentProfile = {
                    profile with
                    name = Option.get(name, profile.name);
                    walletPrincipal = Option.get(walletPrincipal, profile.walletPrincipal);
                    acceptedBenefitTypes = Option.get(acceptedBenefitTypes, profile.acceptedBenefitTypes);
                    isActive = Option.get(isActive, profile.isActive);
                    lastActivity = Time.now();
                };
                establishments.put(caller, updatedProfile);
                return #ok(updatedProfile);
            };
            case (null) {
                return #err("Establishment not registered");
            };
        };
    };

    // Função para obter o perfil do estabelecimento do chamador
    public query(msg) func getEstablishment() : async Result.Result<EstablishmentProfile, Text> {
        switch (establishments.get(msg.caller)) {
            case (?profile) {
                return #ok(profile);
            };
            case (null) {
                return #err("Establishment not found");
            };
        };
    };

    // Função para obter o histórico de transações para relatórios (chamada pelo Reporting Canister)
    public query(msg) func getTransactionsForReporting(establishmentId: Principal, limit: ?Nat) : async [PaymentTransaction] {
        // Em um sistema real, você adicionaria aqui:
        // if (msg.caller != reportingCanisterPrincipal) { Debug.trap("Unauthorized access"); };
        
        let maxResults = Option.get(limit, 50);
        let result = Iter.toArray(Iter.map(Iter.filter(transactions.entries(), func((txId: Text, tx: PaymentTransaction)) : Bool { tx.establishmentId == establishmentId }), func((txId: Text, tx: PaymentTransaction)) : PaymentTransaction { tx }));
        let sorted = Array.sort<PaymentTransaction>(result, func(a: PaymentTransaction, b: PaymentTransaction) : {#less; #equal; #greater} { if (a.createdAt > b.createdAt) #less else #greater });
        Array.take<PaymentTransaction>(sorted, maxResults)
    };

    // Função para validar um pagamento (não usada no fluxo QR Code atual)
    public query func validatePayment(establishmentId: Principal, benefitType: BenefitType, amount: Nat) : async PaymentValidation {
        switch (establishments.get(establishmentId)) {
            case (?profile) {
                if (not profile.isActive) {
                    return { isValid = false; reason = ?"Establishment is not active"; establishmentName = profile.name; benefitType = benefitType; amount = amount; };
                };
                let acceptsBenefitType = Array.find(profile.acceptedBenefitTypes, func(bt: BenefitType) : Bool { bt == benefitType });
                if (Option.isSome(acceptsBenefitType)) {
                    return { isValid = true; reason = null; establishmentName = profile.name; benefitType = benefitType; amount = amount; };
                } else {
                    return { isValid = false; reason = ?"Establishment does not accept this benefit type"; establishmentName = profile.name; benefitType = benefitType; amount = amount; };
                };
            };
            case (null) {
                return { isValid = false; reason = ?"Establishment not found"; establishmentName = "Unknown"; benefitType = benefitType; amount = amount; };
            };
        };
    };

    // Função para processar um pagamento (Chamada pelo Frontend do Estabelecimento, NÃO pelo fluxo QR Code)
    public shared(msg) func processPayment(request: PaymentRequest) : async Result.Result<Text, Text> {
        let caller = msg.caller; // O Principal que chamou essa função (deve ser o Establishment)
        switch (establishments.get(caller)) {
            case (?establishment) {
                if (not establishment.isActive) { return #err("Establishment is not active"); };
                let acceptsBenefitType = Array.find(establishment.acceptedBenefitTypes, func(bt: BenefitType) : Bool { bt == request.benefitType });
                if (acceptsBenefitType == null) { return #err("This establishment does not accept this benefit type"); };
                
                let transactionId = "tx_est_" # Nat.toText(nextTransactionId); nextTransactionId += 1;
                let pendingTransaction: PaymentTransaction = {
                    id = transactionId; establishmentId = caller; workerId = request.workerId;
                    benefitType = request.benefitType; amount = request.amount; status = #Pending;
                    createdAt = Time.now(); processedAt = null; description = request.description;
                };
                transactions.put(transactionId, pendingTransaction);
                
                // O Establishment chama o Wallets para debitar a carteira do worker
                let requestToWallet : WalletPaymentRequest = {
                    workerId = request.workerId; establishmentId = caller; establishmentName = establishment.name;
                    benefitType = request.benefitType; amount = request.amount; description = request.description;
                };
                let debitResult = await wallet.debitBalance(requestToWallet);

                switch (debitResult) {
                    case (#ok(walletTxId)) {
                        // Se o débito na carteira do trabalhador foi OK, complete a transação aqui
                        await completeTransaction(transactionId, caller);
                        return #ok(transactionId);
                    };
                    case (#err(errorMsg)) {
                        // Se o débito na carteira do trabalhador falhou, marque a transação como falha
                        await failTransaction(transactionId, errorMsg);
                        return #err("Payment failed: " # errorMsg);
                    };
                };
            };
            case (null) {
                return #err("Establishment not registered");
            };
        };
    };

    // Função auxiliar para marcar transação como completa e atualizar perfil
    private func completeTransaction(transactionId: Text, establishmentId: Principal) : async () {
        switch (transactions.get(transactionId)) {
            case (?transaction) {
                let completedTransaction: PaymentTransaction = {
                    id = transaction.id; establishmentId = transaction.establishmentId; workerId = transaction.workerId;
                    benefitType = transaction.benefitType; amount = transaction.amount; status = #Completed;
                    createdAt = transaction.createdAt; processedAt = ?Time.now(); description = transaction.description;
                };
                transactions.put(transactionId, completedTransaction);

                switch (establishments.get(establishmentId)) {
                    case (?profile) {
                        establishments.put(establishmentId, { // CORREÇÃO: Sintaxe limpa para atualização de registro
                            profile with
                            totalTransactions = profile.totalTransactions + 1;
                            totalReceived = profile.totalReceived + transaction.amount;
                            lastActivity = Time.now();
                        });
                    };
                    case (null) { /* Profile not found, but transaction was already updated */ };
                };
            };
            case (null) { /* Transaction not found */ };
        };
    };
    
    // Função auxiliar para marcar transação como falha
    private func failTransaction(transactionId: Text, reason: Text) : async () {
        switch (transactions.get(transactionId)) {
            case (?transaction) {
                let failedTransaction: PaymentTransaction = {
                    id = transaction.id; establishmentId = transaction.establishmentId; workerId = transaction.workerId;
                    benefitType = transaction.benefitType; amount = transaction.amount; status = #Failed;
                    createdAt = transaction.createdAt; processedAt = ?Time.now();
                    description = transaction.description # " (Fail reason: " # reason # ")";
                };
                transactions.put(transactionId, failedTransaction);
            };
            case (null) { /* Transaction not found */ };
        };
    };

    // Função para obter o histórico de transações recebidas pelo próprio estabelecimento
    public query(msg) func getTransactionHistory(limit: ?Nat) : async [PaymentTransaction] {
        let caller = msg.caller;
        let maxResults = Option.get(limit, 50);
        let result = Iter.toArray(Iter.map(Iter.filter(transactions.entries(), func((txId: Text, tx: PaymentTransaction)) : Bool { tx.establishmentId == caller }), func((txId: Text, tx: PaymentTransaction)) : PaymentTransaction { tx }));
        let sorted = Array.sort<PaymentTransaction>(result, func(a: PaymentTransaction, b: PaymentTransaction) : {#less; #equal; #greater} { if (a.createdAt > b.createdAt) #less else #greater });
        Array.take<PaymentTransaction>(sorted, maxResults)
    };
    
    // Função para obter todos os estabelecimentos ativos (útil para RH, por exemplo)
    public query func getAllActiveEstablishments() : async [EstablishmentProfile] {
        Iter.toArray(Iter.map(Iter.filter(establishments.entries(), func((id: Principal, profile: EstablishmentProfile)) : Bool { profile.isActive }), func((id: Principal, profile: EstablishmentProfile)) : EstablishmentProfile { profile }))
    };
};