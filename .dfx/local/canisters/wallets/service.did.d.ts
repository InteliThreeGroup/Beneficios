import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BenefitBalance {
  'balance' : bigint,
  'lastUpdated' : bigint,
  'benefitType' : BenefitType,
}
export type BenefitType = { 'Culture' : null } |
  { 'Food' : null } |
  { 'Health' : null } |
  { 'Transport' : null } |
  { 'Education' : null };
export interface PaymentRequest {
  'workerId' : Principal,
  'establishmentId' : Principal,
  'description' : string,
  'establishmentName' : string,
  'amount' : bigint,
  'benefitType' : BenefitType,
}
export type Result = { 'ok' : WorkerWallet } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export interface Transaction {
  'id' : string,
  'workerId' : Principal,
  'transactionType' : TransactionType,
  'establishmentId' : [] | [Principal],
  'description' : string,
  'establishmentName' : [] | [string],
  'timestamp' : bigint,
  'amount' : bigint,
  'programId' : [] | [string],
  'benefitType' : BenefitType,
}
export type TransactionType = { 'Debit' : null } |
  { 'Credit' : null };
export interface WorkerWallet {
  'workerId' : Principal,
  'lastActivity' : bigint,
  'createdAt' : bigint,
  'totalBalance' : bigint,
  'balances' : Array<BenefitBalance>,
}
export interface _SERVICE {
  'createWallet' : ActorMethod<[Principal], Result>,
  'creditBalance' : ActorMethod<
    [Principal, BenefitType, bigint, string, string],
    Result_1
  >,
  'debitBalance' : ActorMethod<[PaymentRequest], Result_1>,
  'getTransactionHistory' : ActorMethod<
    [Principal, [] | [bigint]],
    Array<Transaction>
  >,
  'getWallet' : ActorMethod<[Principal], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
