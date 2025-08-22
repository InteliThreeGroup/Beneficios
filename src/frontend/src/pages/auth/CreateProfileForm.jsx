import { useState } from "react";
import { useAuth } from "./AuthClientContext";
import { User, UserCheck, Store, Building, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const roleOptions = [
  { value: "Worker", label: "Worker", icon: <User size={24} />, description: "Receive and use corporate benefits" },
  { value: "HR", label: "Human Resources", icon: <UserCheck size={24} />, description: "Manage programs and workers" },
  { value: "Establishment", label: "Establishment", icon: <Store size={24} />, description: "Receive benefit payments" },
];

export default function CreateProfileForm() {
  const { actors, refreshProfile, principal } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Worker");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!actors || !actors.identity_auth) {
      setMessage({ text: "Error: Canister actors not loaded.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      let selectedRole;
      if (role === "HR") selectedRole = { HR: null };
      else if (role === "Establishment") selectedRole = { Establishment: null };
      else selectedRole = { Worker: null };

      const profileData = {
        name: name,
        role: selectedRole,
        companyId: companyId ? [companyId] : [],
      };

      const result = await actors.identity_auth.createProfile(profileData);

      if (result.ok) {
        if (role === "Establishment") {
          try {
            const establishmentData = {
              name: name,
              country: "Brazil",
              businessCode: "GENERAL",
              walletPrincipal: principal,
              acceptedBenefitTypes: [
                { Food: null },
                { Culture: null },
                { Health: null },
                { Transport: null },
                { Education: null }
              ],
            };
            
            const establishmentResult = await actors.establishment.registerEstablishment(establishmentData);
            if (establishmentResult.ok) {
              console.log("Establishment registered successfully!");
            } else {
              console.warn("Error registering establishment:", establishmentResult.err);
            }
          } catch (establishmentError) {
            console.error("Error registering establishment:", establishmentError);
          }
        }
        
        setMessage({ text: "Profile created successfully! Redirecting...", type: "success" });
        setTimeout(() => {
          refreshProfile();
        }, 1500);
      } else {
        setMessage({ text: `Error creating profile: ${result.err}`, type: "error" });
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage({ text: "An unexpected error occurred.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Create Your Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join BeneChain and start managing corporate benefits with blockchain technology. 
            Choose your profile type to get started.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-6">
                Choose Your Profile Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setRole(option.value)}
                    className={`group cursor-pointer p-6 border-2 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      role === option.value 
                        ? "border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100" 
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                      role === option.value 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      {option.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{option.label}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-gray-800 mb-3">
                {role === "Establishment" ? "Establishment Name" : "Your Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "Establishment" ? "Enter establishment name" : "Enter your full name"}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            {/* Company ID Input (conditional) */}
            {(role === "Worker" || role === "HR") && (
              <div>
                <label htmlFor="companyId" className="block text-lg font-semibold text-gray-800 mb-3">
                  Company Identifier
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="companyId"
                    type="text"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    placeholder="Enter your company name or ID"
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg transition-all duration-300 hover:shadow-md"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This helps us connect you with your organization's benefits program.
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5" />
                  Creating Your Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Create Profile & Get Started
                </>
              )}
            </button>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                  message.type === 'error' 
                    ? 'bg-red-50 border border-red-200 text-red-800' 
                    : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {message.type === 'error' ? 
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" /> : 
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                }
                <span className="font-medium">{message.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-500">
            By creating a profile, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
