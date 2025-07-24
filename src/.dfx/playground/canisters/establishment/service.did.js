export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const BenefitType = IDL.Variant({
    'Culture' : IDL.Null,
    'Food' : IDL.Null,
    'Health' : IDL.Null,
    'Transport' : IDL.Null,
    'Education' : IDL.Null,
  });
  const EstablishmentProfile = IDL.Record({
    'id' : IDL.Principal,
    'totalReceived' : IDL.Nat,
    'country' : IDL.Text,
    'lastActivity' : IDL.Int,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'businessCode' : IDL.Text,
    'isActive' : IDL.Bool,
    'acceptedBenefitTypes' : IDL.Vec(BenefitType),
    'walletPrincipal' : IDL.Principal,
    'totalTransactions' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : EstablishmentProfile, 'err' : IDL.Text });
  const PaymentStatus = IDL.Variant({
    'Failed' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const PaymentTransaction = IDL.Record({
    'id' : IDL.Text,
    'status' : PaymentStatus,
    'workerId' : IDL.Principal,
    'createdAt' : IDL.Int,
    'establishmentId' : IDL.Principal,
    'description' : IDL.Text,
    'processedAt' : IDL.Opt(IDL.Int),
    'amount' : IDL.Nat,
    'benefitType' : BenefitType,
  });
  const PaymentRequest = IDL.Record({
    'workerId' : IDL.Principal,
    'description' : IDL.Text,
    'amount' : IDL.Nat,
    'benefitType' : BenefitType,
  });
  const RegisterEstablishmentRequest = IDL.Record({
    'country' : IDL.Text,
    'name' : IDL.Text,
    'businessCode' : IDL.Text,
    'acceptedBenefitTypes' : IDL.Vec(BenefitType),
    'walletPrincipal' : IDL.Principal,
  });
  const PaymentValidation = IDL.Record({
    'establishmentName' : IDL.Text,
    'isValid' : IDL.Bool,
    'amount' : IDL.Nat,
    'benefitType' : BenefitType,
    'reason' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'cancelTransaction' : IDL.Func([IDL.Text], [Result_1], []),
    'getAllActiveEstablishments' : IDL.Func(
        [],
        [IDL.Vec(EstablishmentProfile)],
        ['query'],
      ),
    'getEstablishment' : IDL.Func([], [Result], ['query']),
    'getTransactionHistory' : IDL.Func(
        [IDL.Opt(IDL.Nat)],
        [IDL.Vec(PaymentTransaction)],
        ['query'],
      ),
    'processPayment' : IDL.Func([PaymentRequest], [Result_1], []),
    'registerEstablishment' : IDL.Func(
        [RegisterEstablishmentRequest],
        [Result],
        [],
      ),
    'updateEstablishment' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(BenefitType)),
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Bool),
        ],
        [Result],
        [],
      ),
    'validatePayment' : IDL.Func(
        [IDL.Principal, BenefitType, IDL.Nat],
        [PaymentValidation],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
