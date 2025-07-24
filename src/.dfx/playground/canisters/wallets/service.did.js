export const idlFactory = ({ IDL }) => {
  const BenefitType = IDL.Variant({
    'Culture' : IDL.Null,
    'Food' : IDL.Null,
    'Health' : IDL.Null,
    'Transport' : IDL.Null,
    'Education' : IDL.Null,
  });
  const BenefitBalance = IDL.Record({
    'balance' : IDL.Nat,
    'lastUpdated' : IDL.Int,
    'benefitType' : BenefitType,
  });
  const WorkerWallet = IDL.Record({
    'workerId' : IDL.Principal,
    'lastActivity' : IDL.Int,
    'createdAt' : IDL.Int,
    'totalBalance' : IDL.Nat,
    'balances' : IDL.Vec(BenefitBalance),
  });
  const Result_1 = IDL.Variant({ 'ok' : WorkerWallet, 'err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const PaymentRequest = IDL.Record({
    'workerId' : IDL.Principal,
    'establishmentId' : IDL.Principal,
    'description' : IDL.Text,
    'establishmentName' : IDL.Text,
    'amount' : IDL.Nat,
    'benefitType' : BenefitType,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(BenefitBalance),
    'err' : IDL.Text,
  });
  const TransactionType = IDL.Variant({
    'Debit' : IDL.Null,
    'Credit' : IDL.Null,
  });
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'workerId' : IDL.Principal,
    'transactionType' : TransactionType,
    'establishmentId' : IDL.Opt(IDL.Principal),
    'description' : IDL.Text,
    'establishmentName' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
    'programId' : IDL.Opt(IDL.Text),
    'benefitType' : BenefitType,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Record({
      'totalDebits' : IDL.Nat,
      'mostUsedBenefitType' : IDL.Opt(BenefitType),
      'totalCredits' : IDL.Nat,
      'lastTransaction' : IDL.Opt(IDL.Int),
      'totalTransactions' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  return IDL.Service({
    'canMakePayment' : IDL.Func(
        [IDL.Principal, BenefitType, IDL.Nat],
        [IDL.Bool],
        ['query'],
      ),
    'cleanupOldTransactions' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'createWallet' : IDL.Func([IDL.Principal], [Result_1], []),
    'creditBalance' : IDL.Func(
        [IDL.Principal, BenefitType, IDL.Nat, IDL.Text, IDL.Text],
        [Result_3],
        [],
      ),
    'debitBalance' : IDL.Func([PaymentRequest], [Result_3], []),
    'getAllBalances' : IDL.Func([IDL.Principal], [Result_2], ['query']),
    'getBenefitBalance' : IDL.Func(
        [IDL.Principal, BenefitType],
        [IDL.Nat],
        ['query'],
      ),
    'getTransactionHistory' : IDL.Func(
        [IDL.Principal, IDL.Opt(IDL.Nat)],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'getWallet' : IDL.Func([IDL.Principal], [Result_1], ['query']),
    'getWalletStats' : IDL.Func([IDL.Principal], [Result], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
