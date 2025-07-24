export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const BenefitType = IDL.Variant({
    'Culture' : IDL.Null,
    'Food' : IDL.Null,
    'Health' : IDL.Null,
    'Transport' : IDL.Null,
    'Education' : IDL.Null,
  });
  const PaymentFrequency = IDL.Variant({
    'Weekly' : IDL.Null,
    'Monthly' : IDL.Null,
    'Biweekly' : IDL.Null,
  });
  const BenefitProgram = IDL.Record({
    'id' : IDL.Text,
    'amountPerWorker' : IDL.Nat,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'isActive' : IDL.Bool,
    'frequency' : PaymentFrequency,
    'paymentDay' : IDL.Nat,
    'benefitType' : BenefitType,
    'companyId' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : BenefitProgram, 'err' : IDL.Text });
  const WorkerBenefit = IDL.Record({
    'workerId' : IDL.Principal,
    'assignedAt' : IDL.Int,
    'assignedBy' : IDL.Principal,
    'isActive' : IDL.Bool,
    'customAmount' : IDL.Opt(IDL.Nat),
    'programId' : IDL.Text,
  });
  return IDL.Service({
    'assignWorkerToBenefit' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Opt(IDL.Nat)],
        [Result],
        [],
      ),
    'createBenefitProgram' : IDL.Func(
        [IDL.Text, BenefitType, IDL.Text, IDL.Nat, PaymentFrequency, IDL.Nat],
        [Result_1],
        [],
      ),
    'executeManualPayment' : IDL.Func([IDL.Text], [Result], []),
    'getBenefitProgram' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'getCompanyBenefitPrograms' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(BenefitProgram)],
        ['query'],
      ),
    'getWorkerBenefits' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(WorkerBenefit)],
        ['query'],
      ),
    'updateWorkerBenefitAmount' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Nat],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
