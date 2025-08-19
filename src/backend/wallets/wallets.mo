// wallets.mo
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import BTC "canister:btc_payments";


actor Wallet {
    // Types
    public type BenefitType = {
        #Food;
        #Culture;
        #Health;
        #Transport;
        #Education;
    };

    public type TransactionType = {
        #Credit;
        #Debit;
    };

    public type Transaction = {
        id: Text;
        workerId: Principal;
        benefitType: BenefitType;
        transactionType: TransactionType;
        amount: Nat;
        establishmentId: ?Principal;
        establishmentName: ?Text;
        programId: ?Text;
        timestamp: Int;
        description: Text;
    };

    public type BenefitBalance = {
        benefitType: BenefitType;
        balance: Nat;
        lastUpdated: Int;
    };

    public type WorkerWallet = {
        workerId: Principal;
        balances: [BenefitBalance];
        totalBalance: Nat;
        createdAt: Int;
        lastActivity: Int;
    };

    public type PaymentRequest = {
        workerId: Principal;
        establishmentId: Principal;
        establishmentName: Text;
        benefitType: BenefitType;
        amount: Nat;
        description: Text;
    };

    public type ReceivedPaymentRequest = {
        transactionId: Text;
        workerId: Principal;
        establishmentId: Principal;
        benefitType: BenefitType;
        amount: Nat;
        description: Text;
    };

    // State
    private stable var walletsEntries : [(Principal, WorkerWallet)] = [];
    private stable var transactionsEntries : [(Text, Transaction)] = [];
    private stable var nextTransactionId : Nat = 1;

    private var wallets = HashMap.HashMap<Principal, WorkerWallet>(0, Principal.equal, Principal.hash);
    private var transactions = HashMap.HashMap<Text, Transaction>(0, Text.equal, Text.hash);

    private let reportingCanisterPrincipal : Principal = Principal.fromText("ulvla-h7777-77774-qaacq-cai");
    private let establishmentCanisterPrincipal : Principal = Principal.fromText("uzt4z-lp777-77774-qaabq-cai");

    private type Establishment = actor {
        registerReceivedPayment: (paymentData: ReceivedPaymentRequest) -> async Result.Result<Text, Text>;
    };

    system func preupgrade() {
        walletsEntries := Iter.toArray(wallets.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
    };

    system func postupgrade() {
        wallets := HashMap.HashMap<Principal, WorkerWallet>(walletsEntries.size(), Principal.equal, Principal.hash);
        for ((key, value) in walletsEntries.vals()) {
            wallets.put(key, value);
        };
        transactions := HashMap.HashMap<Text, Transaction>(transactionsEntries.size(), Text.equal, Text.hash);
        for ((key, value) in transactionsEntries.vals()) {
            transactions.put(key, value);
        };
        walletsEntries := [];
        transactionsEntries := [];
    };

    // --- Public Functions ---

    public shared(msg) func createWallet(workerId: Principal) : async Result.Result<WorkerWallet, Text> {
        switch (wallets.get(workerId)) {
            case (?existingWallet) {
                return #ok(existingWallet);
            };
            case null {
                let newWallet: WorkerWallet = {
                    workerId = workerId;
                    balances = [];
                    totalBalance = 0;
                    createdAt = Time.now();
                    lastActivity = Time.now();
                };
                wallets.put(workerId, newWallet);
                return #ok(newWallet);
            };
        }
    };

    public query func getWallet(workerId: Principal) : async Result.Result<WorkerWallet, Text> {
        switch (wallets.get(workerId)) {
            case (?wallet) { return #ok(wallet); };
            case null { return #err("Wallet not found"); };
        }
    };

    public shared(msg) func creditBalance(
        workerId: Principal,
        benefitType: BenefitType,
        amount: Nat,
        programId: Text,
        description: Text
    ) : async Result.Result<Text, Text> {
        let _ = await createWallet(workerId);
        switch (wallets.get(workerId)) {
            case (?wallet) {
                let updatedBalances = updateBenefitBalance(wallet.balances, benefitType, amount, true);
                let newTotalBalance = calculateTotalBalance(updatedBalances);
                let updatedWallet: WorkerWallet = {
                    workerId = wallet.workerId;
                    balances = updatedBalances;
                    totalBalance = newTotalBalance;
                    createdAt = wallet.createdAt;
                    lastActivity = Time.now();
                };
                wallets.put(workerId, updatedWallet);
                let txIdText = "tx_" # Nat.toText(nextTransactionId);
                nextTransactionId += 1;
                let newTransaction: Transaction = {
                    id = txIdText;
                    workerId = workerId;
                    benefitType = benefitType;
                    transactionType = #Credit;
                    amount = amount;
                    establishmentId = null;
                    establishmentName = null;
                    programId = ?programId;
                    timestamp = Time.now();
                    description = description;
                };
                transactions.put(txIdText, newTransaction);
                return #ok("Balance credited successfully");
            };
            case null {
                return #err("Failed to create or access wallet");
            };
        }
    };

    public shared(msg) func debitBalance(paymentRequest: PaymentRequest) : async Result.Result<Text, Text> {
        switch (wallets.get(paymentRequest.workerId)) {
            case (?wallet) {
                let currentBalance = getBenefitTypeBalance(wallet.balances, paymentRequest.benefitType);
                if (currentBalance < paymentRequest.amount) {
                    return #err("Insufficient balance for " # benefitTypeToText(paymentRequest.benefitType));
                };
                let updatedBalances = updateBenefitBalance(wallet.balances, paymentRequest.benefitType, paymentRequest.amount, false);
                let newTotalBalance = calculateTotalBalance(updatedBalances);
                let updatedWallet: WorkerWallet = {
                    workerId = wallet.workerId;
                    balances = updatedBalances;
                    totalBalance = newTotalBalance;
                    createdAt = wallet.createdAt;
                    lastActivity = Time.now();
                };
                wallets.put(paymentRequest.workerId, updatedWallet);
                let txIdText = "tx_" # Nat.toText(nextTransactionId);
                nextTransactionId += 1;
                let newTransaction: Transaction = {
                    id = txIdText;
                    workerId = paymentRequest.workerId;
                    benefitType = paymentRequest.benefitType;
                    transactionType = #Debit;
                    amount = paymentRequest.amount;
                    establishmentId = ?paymentRequest.establishmentId;
                    establishmentName = ?paymentRequest.establishmentName;
                    programId = null;
                    timestamp = Time.now();
                    description = paymentRequest.description;
                };
                transactions.put(txIdText, newTransaction);
                let receivedRequest : ReceivedPaymentRequest = {
                    transactionId = txIdText;
                    workerId = paymentRequest.workerId;
                    establishmentId = paymentRequest.establishmentId;
                    benefitType = paymentRequest.benefitType;
                    amount = paymentRequest.amount;
                    description = paymentRequest.description;
                };
                let establishment = actor(Principal.toText(establishmentCanisterPrincipal)) : Establishment;
                let notificationResult = await establishment.registerReceivedPayment(receivedRequest);
                switch (notificationResult) {
                    case (#ok(_)) {
                        Debug.print("Payment registered successfully by establishment.");
                        return #ok(txIdText);
                    };
                    case (#err(errMsg)) {
                        Debug.print("Failed to register payment with establishment: " # errMsg);
                        return #err("Payment debited, but failed to register with establishment: " # errMsg);
                    };
                };
            };
            case null {
                return #err("Wallet not found");
            };
        }
    };

    public query func getTransactionHistory(workerId: Principal, limit: ?Nat) : async [Transaction] {
        let maxResults = Option.get(limit, 50);
        let filtered = Iter.filter(transactions.vals(), func(tx : Transaction) : Bool {
            return tx.workerId == workerId;
        });
        var asArray = Iter.toArray(filtered);
        let _ = Array.sort<Transaction>(asArray, func(a, b) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) {
                return #less;
            } else if (a.timestamp < b.timestamp) {
                return #greater;
            } else {
                return #equal;
            };
        });
        var finalResult : [Transaction] = [];
        var i = 0;
        while (i < asArray.size() and i < maxResults) {
            finalResult := Array.append(finalResult, [asArray[i]]);
            i += 1;
        };
        return finalResult;
    };

    public query func getTransactionsForReporting(workerId: Principal, limit: ?Nat) : async [Transaction] {
        let maxResults = Option.get(limit, 50);
        let filtered = Iter.filter(transactions.vals(), func(tx : Transaction) : Bool {
            return tx.workerId == workerId;
        });
        var asArray = Iter.toArray(filtered);
        let _ = Array.sort<Transaction>(asArray, func(a, b) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) { return #less; } else if (a.timestamp < b.timestamp) { return #greater; } else { return #equal; };
        });
        var finalResult : [Transaction] = [];
        var i = 0;
        while (i < asArray.size() and i < maxResults) {
            finalResult := Array.append(finalResult, [asArray[i]]);
            i += 1;
        };
        return finalResult;
    };

    // --- Private Helper Functions ---

    private func updateBenefitBalance(
        balances: [BenefitBalance],
        benefitType: BenefitType,
        amount: Nat,
        isCredit: Bool
    ) : [BenefitBalance] {
        let currentTime = Time.now();
        var found = false;
        var updatedBalances: [BenefitBalance] = [];
        var i = 0;
        while(i < balances.size()) {
            let balance = balances[i];
            if (balance.benefitType == benefitType) {
                found := true;
                let newBalance = if (isCredit) {
                    balance.balance + amount
                } else {
                    balance.balance - amount
                };
                let newEntry : BenefitBalance = {
                    benefitType = balance.benefitType;
                    balance = newBalance;
                    lastUpdated = currentTime;
                };
                updatedBalances := Array.append(updatedBalances, [newEntry]);
            } else {
                updatedBalances := Array.append(updatedBalances, [balance]);
            };
            i += 1;
        };
        if (not found and isCredit) {
            let newEntry : BenefitBalance = {
                benefitType = benefitType;
                balance = amount;
                lastUpdated = currentTime;
            };
            updatedBalances := Array.append(updatedBalances, [newEntry]);
        };
        return updatedBalances;
    };

    private func getBenefitTypeBalance(balances: [BenefitBalance], benefitType: BenefitType) : Nat {
        var i = 0;
        while (i < balances.size()) {
            let balance = balances[i];
            if (balance.benefitType == benefitType) {
                return balance.balance;
            };
            i += 1;
        };
        return 0;
    };

    private func calculateTotalBalance(balances: [BenefitBalance]) : Nat {
        var total : Nat = 0;
        var i = 0;
        while (i < balances.size()) {
            total += balances[i].balance;
            i += 1;
        };
        return total;
    };

    private func benefitTypeToText(benefitType: BenefitType) : Text {
        switch (benefitType) {
            case (#Food) { return "Food"; };
            case (#Culture) { return "Culture"; };
            case (#Health) { return "Health"; };
            case (#Transport) { return "Transport"; };
            case (#Education) { return "Education"; };
        }
    };

    // --- Funções de Integração Bitcoin ---

    public shared ({ caller }) func getMyPubKeyHash160(companyId : Nat, benefitId : Nat) : async Blob {
        await BTC.get_own_pubkey_hash160(companyId, benefitId)
    };
    
    public shared ({ caller }) func sendBitcoin(
        companyId : Nat, benefitId : Nat,
        fromAddress : Text,
        toProgram20b : Blob, amountSats : Nat64, feeRate : Nat64
        ) : async Text {
        // CORRIGIDO: O nome da função foi trocado para 'send_btc'
        await BTC.send_btc(companyId, benefitId, fromAddress, toProgram20b, amountSats, feeRate)
    };
}
