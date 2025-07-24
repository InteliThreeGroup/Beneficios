// identity_auth.mo - VERSÃO COM VERIFICAÇÃO DE USUÁRIO CORRIGIDA
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Option "mo:base/Option";

actor IdentityAuth {
    
    public type UserRole = { #HR; #Worker; #Establishment };
    public type UserProfile = { principal: Principal; name: Text; role: UserRole; companyId: ?Text; createdAt: Int; isActive: Bool };
    public type CreateProfileRequest = { name: Text; role: UserRole; companyId: ?Text };

    private stable var userProfilesEntries : [(Principal, UserProfile)] = [];
    private var userProfiles = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);

    system func preupgrade() { userProfilesEntries := Iter.toArray(userProfiles.entries()); };
    system func postupgrade() {
        userProfiles := HashMap.fromIter(userProfilesEntries.vals(), userProfilesEntries.size(), Principal.equal, Principal.hash);
        userProfilesEntries := [];
    };

    public shared(msg) func createProfile(request: CreateProfileRequest) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;
        if (Option.isSome(userProfiles.get(caller))) { return #err("User profile already exists"); };
        let profile: UserProfile = { principal = caller; name = request.name; role = request.role; companyId = request.companyId; createdAt = Time.now(); isActive = true; };
        userProfiles.put(caller, profile);
        return #ok(profile);
    };

    public query(msg) func getProfile() : async Result.Result<UserProfile, Text> {
        switch (userProfiles.get(msg.caller)) {
            case (?profile) { #ok(profile) };
            case null { #err("User profile not found") };
        }
    };

    // CORREÇÃO: A função agora recebe o 'user' como argumento.
    public query func hasRole(user: Principal, role: UserRole) : async Bool {
        switch (userProfiles.get(user)) {
            case (?profile) { profile.role == role and profile.isActive };
            case null { false };
        }
    };

    // CORREÇÃO: A função agora recebe o 'user' como argumento.
    public query func belongsToCompany(user: Principal, companyId: Text) : async Bool {
        switch (userProfiles.get(user)) {
            case (?profile) {
                switch (profile.companyId) {
                    case (?id) { id == companyId and profile.isActive };
                    case null { false };
                }
            };
            case null { false };
        }
    };
}