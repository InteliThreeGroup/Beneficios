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
  const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(UserProfile),
    'err' : IDL.Text,
  });
  return IDL.Service({
    'belongsToCompany' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'createProfile' : IDL.Func([CreateProfileRequest], [Result], []),
    'deactivateUser' : IDL.Func([IDL.Principal], [Result_2], []),
    'getProfile' : IDL.Func([], [Result], ['query']),
    'getSystemStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'activeUsers' : IDL.Nat,
            'establishments' : IDL.Nat,
            'workers' : IDL.Nat,
            'totalUsers' : IDL.Nat,
            'hrUsers' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getUsersByCompany' : IDL.Func([IDL.Text], [Result_1], []),
    'hasRole' : IDL.Func([UserRole], [IDL.Bool], ['query']),
    'updateProfile' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
