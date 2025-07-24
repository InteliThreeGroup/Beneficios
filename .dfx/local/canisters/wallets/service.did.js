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
  const Result = IDL.Variant({ 'ok' : WorkerWallet, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const PaymentRequest = IDL.Record({
    'workerId' : IDL.Principal,
    'establishmentId' : IDL.Principal,
    'description' : IDL.Text,
    'establishmentName' : IDL.Text,
    'amount' : IDL.Nat,
    'benefitType' : BenefitType,
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
  return IDL.Service({
    'createWallet' : IDL.Func([IDL.Principal], [Result], []),
    'creditBalance' : IDL.Func(
        [IDL.Principal, BenefitType, IDL.Nat, IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
    'debitBalance' : IDL.Func([PaymentRequest], [Result_1], []),
    'getTransactionHistory' : IDL.Func(
        [IDL.Principal, IDL.Opt(IDL.Nat)],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'getWallet' : IDL.Func([IDL.Principal], [Result], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
