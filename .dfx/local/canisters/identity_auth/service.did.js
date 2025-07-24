export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'HR' : IDL.Null,
    'Establishment' : IDL.Null,
    'Worker' : IDL.Null,
  });
  const CreateProfileRequest = IDL.Record({
    'name' : IDL.Text,
    'role' : UserRole,
    'companyId' : IDL.Opt(IDL.Text),
  });
  const UserProfile = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'role' : UserRole,
    'isActive' : IDL.Bool,
    'companyId' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  return IDL.Service({
    'belongsToCompany' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Bool],
        ['query'],
      ),
    'createProfile' : IDL.Func([CreateProfileRequest], [Result], []),
    'getProfile' : IDL.Func([], [Result], ['query']),
    'hasRole' : IDL.Func([IDL.Principal, UserRole], [IDL.Bool], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
