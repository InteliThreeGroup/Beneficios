import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BenefitProgram {
  'id' : string,
  'amountPerWorker' : bigint,
  'name' : string,
  'createdAt' : bigint,
  'createdBy' : Principal,
  'isActive' : boolean,
  'frequency' : PaymentFrequency,
  'paymentDay' : bigint,
  'benefitType' : BenefitType,
  'companyId' : string,
}
export type BenefitType = { 'Culture' : null } |
  { 'Food' : null } |
  { 'Health' : null } |
  { 'Transport' : null } |
  { 'Education' : null };
export type PaymentFrequency = { 'Weekly' : null } |
  { 'Monthly' : null } |
  { 'Biweekly' : null };
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : BenefitProgram } |
  { 'err' : string };
export interface WorkerBenefit {
  'workerId' : Principal,
  'assignedAt' : bigint,
  'assignedBy' : Principal,
  'isActive' : boolean,
  'customAmount' : [] | [bigint],
  'programId' : string,
}
export interface _SERVICE {
  'assignWorkerToBenefit' : ActorMethod<
    [Principal, string, [] | [bigint]],
    Result
  >,
  'createBenefitProgram' : ActorMethod<
    [string, BenefitType, string, bigint, PaymentFrequency, bigint],
    Result_1
  >,
  'executeManualPayment' : ActorMethod<[string], Result>,
  'getBenefitProgram' : ActorMethod<[string], Result_1>,
  'getCompanyBenefitPrograms' : ActorMethod<[string], Array<BenefitProgram>>,
  'getWorkerBenefits' : ActorMethod<[Principal], Array<WorkerBenefit>>,
  'updateWorkerBenefitAmount' : ActorMethod<
    [Principal, string, bigint],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
