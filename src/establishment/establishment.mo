// establishment.mo - VERSÃO CORRIGIDA
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

    private let walletCanisterPrincipal : Principal = Principal.fromText("umunu-kh777-77774-qaaca-cai");

    public type WalletPaymentRequest = {
        workerId: Principal; establishmentId: Principal; establishmentName: Text;
        benefitType: BenefitType; amount: Nat; description: Text;
    };

    private type Wallet = actor {
        debitBalance: (paymentRequest: WalletPaymentRequest) -> async Result.Result<Text, Text>;
    };

    private let wallet : Wallet = actor(Principal.toText(walletCanisterPrincipal));

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

    public type PaymentRequest = {
        workerId: Principal; benefitType: BenefitType;
        amount: Nat; description: Text;
    };

    public type PaymentValidation = {
        isValid: Bool; reason: ?Text; establishmentName: Text;
        benefitType: BenefitType; amount: Nat;
    };

    private stable var establishmentsEntries : [(Principal, EstablishmentProfile)] = [];
    private stable var transactionsEntries : [(Text, PaymentTransaction)] = [];
    private stable var nextTransactionId : Nat = 1;

    private var establishments = HashMap.HashMap<Principal, EstablishmentProfile>(0, Principal.equal, Principal.hash);
    private var transactions = HashMap.HashMap<Text, PaymentTransaction>(0, Text.equal, Text.hash);

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

    public shared(msg) func registerEstablishment(request: RegisterEstablishmentRequest) : async Result.Result<EstablishmentProfile, Text> {
        let caller = msg.caller;
        if (Option.isSome(establishments.get(caller))) {
            return #err("Establishment already registered");
        };
        if (not isValidBusinessCode(request.country, request.businessCode)) {
            return #err("Invalid business code for country: " # request.country);
        };
        let profile: EstablishmentProfile = {
            id = caller; name = request.name; country = request.country; businessCode = request.businessCode;
            walletPrincipal = request.walletPrincipal; acceptedBenefitTypes = request.acceptedBenefitTypes;
            isActive = true; createdAt = Time.now(); totalTransactions = 0; totalReceived = 0; lastActivity = Time.now();
        };
        establishments.put(caller, profile);
        #ok(profile)
    };

    public shared(msg) func updateEstablishment(name: ?Text, acceptedBenefitTypes: ?[BenefitType], walletPrincipal: ?Principal, isActive: ?Bool) : async Result.Result<EstablishmentProfile, Text> {
        let caller = msg.caller;
        switch (establishments.get(caller)) {
            case (?profile) {
                let updatedProfile: EstablishmentProfile = {
                    id = profile.id; name = Option.get(name, profile.name); country = profile.country; businessCode = profile.businessCode;
                    walletPrincipal = Option.get(walletPrincipal, profile.walletPrincipal);
                    acceptedBenefitTypes = Option.get(acceptedBenefitTypes, profile.acceptedBenefitTypes);
                    isActive = Option.get(isActive, profile.isActive); createdAt = profile.createdAt;
                    totalTransactions = profile.totalTransactions; totalReceived = profile.totalReceived;
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

    public shared(msg) func processPayment(request: PaymentRequest) : async Result.Result<Text, Text> {
        let caller = msg.caller;
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
                
                let requestToWallet : WalletPaymentRequest = {
                    workerId = request.workerId; establishmentId = caller; establishmentName = establishment.name;
                    benefitType = request.benefitType; amount = request.amount; description = request.description;
                };
                let debitResult = await wallet.debitBalance(requestToWallet);

                switch (debitResult) {
                    case (#ok(walletTxId)) {
                        await completeTransaction(transactionId, caller);
                        return #ok(transactionId);
                    };
                    case (#err(errorMsg)) {
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
                        let updatedProfile: EstablishmentProfile = {
                            id = profile.id; name = profile.name; country = profile.country; businessCode = profile.businessCode;
                            walletPrincipal = profile.walletPrincipal; acceptedBenefitTypes = profile.acceptedBenefitTypes;
                            isActive = profile.isActive; createdAt = profile.createdAt;
                            totalTransactions = profile.totalTransactions + 1;
                            totalReceived = profile.totalReceived + transaction.amount;
                            lastActivity = Time.now();
                        };
                        establishments.put(establishmentId, updatedProfile);
                    };
                    case (null) {
                        // Profile not found, but transaction was already updated
                    };
                };
            };
            case (null) {
                // Transaction not found
            };
        };
    };
    
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
            case (null) {
                // Transaction not found
            };
        };
    };

    public query(msg) func getTransactionHistory(limit: ?Nat) : async [PaymentTransaction] {
        let caller = msg.caller;
        let maxResults = Option.get(limit, 50);
        let result = Iter.toArray(Iter.map(Iter.filter(transactions.entries(), func((txId: Text, tx: PaymentTransaction)) : Bool { tx.establishmentId == caller }), func((txId: Text, tx: PaymentTransaction)) : PaymentTransaction { tx }));
        let sorted = Array.sort<PaymentTransaction>(result, func(a: PaymentTransaction, b: PaymentTransaction) : {#less; #equal; #greater} { if (a.createdAt > b.createdAt) #less else #greater });
        Array.take<PaymentTransaction>(sorted, maxResults)
    };
    
    public query func getAllActiveEstablishments() : async [EstablishmentProfile] {
        Iter.toArray(Iter.map(Iter.filter(establishments.entries(), func((id: Principal, profile: EstablishmentProfile)) : Bool { profile.isActive }), func((id: Principal, profile: EstablishmentProfile)) : EstablishmentProfile { profile }))
    };
    
    private func isValidBusinessCode(country: Text, businessCode: Text) : Bool {
        switch (country) {
            case ("BR") { Text.size(businessCode) >= 4 };
            case ("US") { Text.size(businessCode) >= 6 };
            case ("EU") { Text.size(businessCode) >= 4 };
            case ("UK") { Text.size(businessCode) >= 5 };
            case (other) { Text.size(businessCode) >= 3 };
        }
    };

    public shared(msg) func cancelTransaction(transactionId: Text) : async Result.Result<Text, Text> {
        switch (transactions.get(transactionId)) {
            case (?transaction) {
                if (transaction.establishmentId != msg.caller) { return #err("Access denied: Not your transaction"); };
                if (transaction.status != #Pending) { return #err("Transaction cannot be cancelled"); };
                let cancelledTransaction: PaymentTransaction = {
                    id = transaction.id; establishmentId = transaction.establishmentId; workerId = transaction.workerId;
                    benefitType = transaction.benefitType; amount = transaction.amount; status = #Cancelled;
                    createdAt = transaction.createdAt; processedAt = ?Time.now(); description = transaction.description;
                };
                transactions.put(transactionId, cancelledTransaction);
                return #ok("Transaction cancelled successfully");
            };
            case (null) {
                return #err("Transaction not found");
            };
        };
    };
}