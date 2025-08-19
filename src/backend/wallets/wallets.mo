// src/backend/wallets/wallets.mo
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

actor Wallet {

    // --- CROSS-CANISTER DEFINITIONS ---
    // ATENÇÃO: Verifique se este ID corresponde ao seu canister 'challenges' em dfx.json
    private let challengesCanisterPrincipal : Principal = Principal.fromText("uzt4z-lp777-77774-qaabq-cai");

    // --- TYPES ---
    public type BenefitType = {
        #Food;
        #Culture;
        #Health;
        #Transport;
        #Education;
        #ChallengeToken;
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

    // --- STATE ---
    private stable var workerWalletsEntries : [(Principal, WorkerWallet)] = [];
    private var workerWallets = HashMap.HashMap<Principal, WorkerWallet>(0, Principal.equal, Principal.hash);

    private stable var transactionsEntries : [(Text, Transaction)] = [];
    private var transactions = HashMap.HashMap<Text, Transaction>(0, Text.equal, Text.hash);

    private stable var transactionCounter : Nat = 0;

    // --- UPGRADE HOOKS ---
    system func preupgrade() {
        workerWalletsEntries := Iter.toArray(workerWallets.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
    };
    system func postupgrade() {
        workerWallets := HashMap.fromIter(Iter.fromArray(workerWalletsEntries), workerWalletsEntries.size(), Principal.equal, Principal.hash);
        workerWalletsEntries := [];
        transactions := HashMap.fromIter(Iter.fromArray(transactionsEntries), transactionsEntries.size(), Text.equal, Text.hash);
        transactionsEntries := [];
    };

    // --- PUBLIC UPDATE FUNCTIONS ---

    public shared(msg) func creditBalance(workerId: Principal, benefitType: BenefitType, amount: Nat, programId: Text, description: Text) : async Result.Result<Text, Text> {
        let walletResult = getOrCreateWallet(workerId);
        switch (walletResult) {
            case (#ok(wallet)) {
                let updatedBalances = updateBalances(wallet.balances, benefitType, amount, #Credit);
                let updatedWallet : WorkerWallet = {
                    workerId = wallet.workerId;
                    balances = updatedBalances;
                    totalBalance = calculateTotalBalance(updatedBalances);
                    createdAt = wallet.createdAt;
                    lastActivity = Time.now();
                };
                workerWallets.put(workerId, updatedWallet);

                transactionCounter += 1;
                let txId = "tx-" # Nat.toText(transactionCounter);
                let newTransaction : Transaction = {
                    id = txId;
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
                transactions.put(txId, newTransaction);

                return #ok(txId);
            };
            case (#err(e)) { return #err(e); };
        };
    };

    public shared(msg) func debitBalance(paymentRequest: PaymentRequest) : async Result.Result<Text, Text> {
        let workerId = paymentRequest.workerId;
        switch (workerWallets.get(workerId)) {
            case (?wallet) {
                let currentBalance = getBenefitTypeBalance(wallet.balances, paymentRequest.benefitType);
                if (currentBalance < paymentRequest.amount) {
                    return #err("Insufficient funds");
                };
                let updatedBalances = updateBalances(wallet.balances, paymentRequest.benefitType, paymentRequest.amount, #Debit);
                let updatedWallet : WorkerWallet = {
                    workerId = wallet.workerId;
                    balances = updatedBalances;
                    totalBalance = calculateTotalBalance(updatedBalances);
                    createdAt = wallet.createdAt;
                    lastActivity = Time.now();
                };
                workerWallets.put(workerId, updatedWallet);
                transactionCounter += 1;
                let txId = "tx-" # Nat.toText(transactionCounter);
                let newTransaction : Transaction = {
                    id = txId;
                    workerId = workerId;
                    benefitType = paymentRequest.benefitType;
                    transactionType = #Debit;
                    amount = paymentRequest.amount;
                    establishmentId = ?paymentRequest.establishmentId;
                    establishmentName = ?paymentRequest.establishmentName;
                    programId = null;
                    timestamp = Time.now();
                    description = paymentRequest.description;
                };
                transactions.put(txId, newTransaction);
                return #ok(txId);
            };
            case (null) { return #err("Wallet not found") }
        };
    };

    public shared(msg) func creditReward(workerId: Principal, amount: Nat) : async Result.Result<Text, Text> {
        if (msg.caller != challengesCanisterPrincipal) {
            return #err("Unauthorized: Only the challenges canister can call this function.");
        };

        let walletResult = getOrCreateWallet(workerId);
        switch (walletResult) {
            case (#ok(wallet)) {
                let updatedBalances = updateBalances(wallet.balances, #ChallengeToken, amount, #Credit);
                let updatedWallet : WorkerWallet = {
                    workerId = wallet.workerId;
                    balances = updatedBalances;
                    totalBalance = calculateTotalBalance(updatedBalances);
                    createdAt = wallet.createdAt;
                    lastActivity = Time.now();
                };
                workerWallets.put(workerId, updatedWallet);

                transactionCounter += 1;
                let txId = "tx-" # Nat.toText(transactionCounter);
                let newTransaction : Transaction = {
                    id = txId;
                    workerId = workerId;
                    benefitType = #ChallengeToken;
                    transactionType = #Credit;
                    amount = amount;
                    establishmentId = null;
                    establishmentName = null;
                    programId = ?"ChallengeReward";
                    timestamp = Time.now();
                    description = "Reward from challenges canister";
                };
                transactions.put(txId, newTransaction);

                return #ok(txId);
            };
            case (#err(e)) { return #err(e); };
        };
    };

    public shared(msg) func convertTokensToCkBTC(amount: Nat) : async Result.Result<Text, Text> {
        let workerId = msg.caller;

        switch (workerWallets.get(workerId)) {
            case (?wallet) {
                let tokenBalance = getBenefitTypeBalance(wallet.balances, #ChallengeToken);
                if (tokenBalance < amount) {
                    return #err("Insufficient #ChallengeToken balance for conversion.");
                };

                let updatedBalances = updateBalances(wallet.balances, #ChallengeToken, amount, #Debit);
                let updatedWallet : WorkerWallet = {
                    workerId = wallet.workerId;
                    balances = updatedBalances;
                    totalBalance = calculateTotalBalance(updatedBalances);
                    createdAt = wallet.createdAt;
                    lastActivity = Time.now();
                };
                workerWallets.put(workerId, updatedWallet);

                Debug.print("LOG: " # Principal.toText(workerId) # " debited " # Nat.toText(amount) # " challenge tokens for ckBTC conversion.");

                return #ok("Tokens debited. ckBTC conversion logic pending implementation.");
            };
            case (null) { return #err("Worker wallet not found."); };
        };
    };

    // --- PUBLIC QUERY FUNCTIONS ---

    public query(msg) func getWallet() : async Result.Result<WorkerWallet, Text> {
        switch (workerWallets.get(msg.caller)) {
            case (?wallet) { #ok(wallet) };
            case (null) { #err("Wallet not found") }
        }
    };

    public shared(msg) func getOrCreateWalletForUser() : async Result.Result<WorkerWallet, Text> {
        getOrCreateWallet(msg.caller)
    };

    public query(msg) func getTransactions(limit: ?Nat) : async [Transaction] {
        let caller = msg.caller;
        let maxResults = Option.get(limit, 100);
        let result = Iter.toArray(Iter.map(
            Iter.filter(transactions.entries(), func((txId : Text, tx : Transaction)) : Bool { tx.workerId == caller }),
            func((txId : Text, tx : Transaction)) : Transaction { tx }
        ));
        let sorted = Array.sort<Transaction>(result, func(a : Transaction, b : Transaction) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) #less else #greater
        });
        return Array.take<Transaction>(sorted, maxResults);
    };

    public query func getTransactionsForReporting(workerId: Principal, limit: ?Nat) : async Result.Result<[Transaction], Text> {
        let maxResults = Option.get(limit, 1000);
        let result = Iter.toArray(Iter.map(
            Iter.filter(transactions.entries(), func((txId : Text, tx : Transaction)) : Bool { tx.workerId == workerId }),
            func((txId : Text, tx : Transaction)) : Transaction { tx }
        ));
        let sorted = Array.sort<Transaction>(result, func(a : Transaction, b : Transaction) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) #less else #greater
        });
        return #ok(Array.take<Transaction>(sorted, maxResults));
    };

    // --- PRIVATE HELPERS ---

    private func getOrCreateWallet(workerId: Principal) : Result.Result<WorkerWallet, Text> {
        switch (workerWallets.get(workerId)) {
            case (?wallet) { return #ok(wallet); };
            case (null) {
                let newWallet : WorkerWallet = {
                    workerId = workerId;
                    balances = [];
                    totalBalance = 0;
                    createdAt = Time.now();
                    lastActivity = Time.now();
                };
                workerWallets.put(workerId, newWallet);
                return #ok(newWallet);
            };
        };
    };

    private func updateBalances(balances: [BenefitBalance], benefitType: BenefitType, amount: Nat, txType: TransactionType) : [BenefitBalance] {
        var updatedBalances : [BenefitBalance] = [];
        var found = false;
        let currentTime = Time.now();
        let isCredit = (txType == #Credit);

        var i = 0;
        while (i < balances.size()) {
            let balance = balances[i];
            if (balance.benefitType == benefitType) {
                found := true;
                let newBalance = if (isCredit) balance.balance + amount else balance.balance - amount;
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
            let balance = balances[i];
            total += balance.balance;
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
            case (#ChallengeToken) { return "ChallengeToken"; };
        }
    };
}