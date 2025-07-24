import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateProfileRequest {
  'name' : string,
  'role' : UserRole,
  'companyId' : [] | [string],
}
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export interface UserProfile {
  'principal' : Principal,
  'name' : string,
  'createdAt' : bigint,
  'role' : UserRole,
  'isActive' : boolean,
  'companyId' : [] | [string],
}
export type UserRole = { 'HR' : null } |
  { 'Establishment' : null } |
  { 'Worker' : null };
export interface _SERVICE {
  'belongsToCompany' : ActorMethod<[Principal, string], boolean>,
  'createProfile' : ActorMethod<[CreateProfileRequest], Result>,
  'getProfile' : ActorMethod<[], Result>,
  'hasRole' : ActorMethod<[Principal, UserRole], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
