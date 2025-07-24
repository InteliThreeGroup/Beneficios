import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BenefitType = { 'Culture' : null } |
  { 'Food' : null } |
  { 'Health' : null } |
  { 'Transport' : null } |
  { 'Education' : null };
export interface EstablishmentProfile {
  'id' : Principal,
  'totalReceived' : bigint,
  'country' : string,
  'lastActivity' : bigint,
  'name' : string,
  'createdAt' : bigint,
  'businessCode' : string,
  'isActive' : boolean,
  'acceptedBenefitTypes' : Array<BenefitType>,
  'walletPrincipal' : Principal,
  'totalTransactions' : bigint,
}
export interface PaymentRequest {
  'workerId' : Principal,
  'description' : string,
  'amount' : bigint,
  'benefitType' : BenefitType,
}
export type PaymentStatus = { 'Failed' : null } |
  { 'Cancelled' : null } |
  { 'Completed' : null } |
  { 'Pending' : null };
export interface PaymentTransaction {
  'id' : string,
  'status' : PaymentStatus,
  'workerId' : Principal,
  'createdAt' : bigint,
  'establishmentId' : Principal,
  'description' : string,
  'processedAt' : [] | [bigint],
  'amount' : bigint,
  'benefitType' : BenefitType,
}
export interface PaymentValidation {
  'establishmentName' : string,
  'isValid' : boolean,
  'amount' : bigint,
  'benefitType' : BenefitType,
  'reason' : [] | [string],
}
export interface RegisterEstablishmentRequest {
  'country' : string,
  'name' : string,
  'businessCode' : string,
  'acceptedBenefitTypes' : Array<BenefitType>,
  'walletPrincipal' : Principal,
}
export type Result = { 'ok' : EstablishmentProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'cancelTransaction' : ActorMethod<[string], Result_1>,
  'getAllActiveEstablishments' : ActorMethod<[], Array<EstablishmentProfile>>,
  'getEstablishment' : ActorMethod<[], Result>,
  'getTransactionHistory' : ActorMethod<
    [[] | [bigint]],
    Array<PaymentTransaction>
  >,
  'processPayment' : ActorMethod<[PaymentRequest], Result_1>,
  'registerEstablishment' : ActorMethod<[RegisterEstablishmentRequest], Result>,
  'updateEstablishment' : ActorMethod<
    [
      [] | [string],
      [] | [Array<BenefitType>],
      [] | [Principal],
      [] | [boolean],
    ],
    Result
  >,
  'validatePayment' : ActorMethod<
    [Principal, BenefitType, bigint],
    PaymentValidation
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
