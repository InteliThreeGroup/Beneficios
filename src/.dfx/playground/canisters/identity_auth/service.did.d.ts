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
export type Result_1 = { 'ok' : Array<UserProfile> } |
  { 'err' : string };
export type Result_2 = { 'ok' : string } |
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
  'belongsToCompany' : ActorMethod<[string], boolean>,
  'createProfile' : ActorMethod<[CreateProfileRequest], Result>,
  'deactivateUser' : ActorMethod<[Principal], Result_2>,
  'getProfile' : ActorMethod<[], Result>,
  'getSystemStats' : ActorMethod<
    [],
    {
      'activeUsers' : bigint,
      'establishments' : bigint,
      'workers' : bigint,
      'totalUsers' : bigint,
      'hrUsers' : bigint,
    }
  >,
  'getUsersByCompany' : ActorMethod<[string], Result_1>,
  'hasRole' : ActorMethod<[UserRole], boolean>,
  'updateProfile' : ActorMethod<[string, [] | [string]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
