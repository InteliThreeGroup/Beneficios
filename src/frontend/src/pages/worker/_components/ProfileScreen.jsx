// src/components/ProfileScreen.jsx

import { useAuth } from "../../auth/AuthClientContext";
import { LogOut, Copy, Building, Receipt } from "lucide-react";
import { toast, Toaster } from 'react-hot-toast';

export function ProfileScreen() {
  const { profile, principal, logout } = useAuth();

  const handleCopyPrincipal = () => {
    if (principal) {
      navigator.clipboard.writeText(principal.toText());
      toast.success('Public Key copied!');
    }
  };

  const truncatedPrincipal = principal ? `${principal.toText().substring(0, 15)}...` : '';

  return (
    <>
      <Toaster position="top-center" reverseOrder={false}/>
      <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold">Profile</h1>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center mb-8">
          <img 
            src={`https://avatars.dicebear.com/api/initials/${profile?.name || 'User'}.svg`} 
            alt="Profile photo" 
            className="w-24 h-24 rounded-full border-4 border-gray-200 bg-gray-100" 
          />
          <h2 className="text-2xl font-bold mt-4">{profile?.name || "User Name"}</h2>
          <p className="text-gray-500">Identification Key</p>
        </section>
        
        <div className="space-y-6">
          {/* Public Key Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-mono text-lg">{truncatedPrincipal}</p>
                    <p className="text-sm text-gray-500 mt-1">Public Key</p>
                </div>
                <button onClick={handleCopyPrincipal} className="p-3 rounded-lg hover:bg-gray-100 text-gray-500">
                    <Copy size={22} />
                </button>
            </div>
          </div>
          
          {/* Company Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex divide-x divide-gray-200">
            <div className="flex-1 pr-4">
                 <p className="text-lg font-semibold flex items-center"><Building size={20} className="mr-2 text-gray-400"/> {profile?.companyId?.[0] || "Not affiliated"}</p>
                 <p className="text-sm text-gray-500 mt-1">Current Company</p>
            </div>
            <div className="flex-1 pl-4">
                <p className="text-lg font-semibold flex items-center"><Receipt size={20} className="mr-2 text-gray-400"/> 12</p>
                <p className="text-sm text-gray-500 mt-1">Receipts</p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={logout} className="w-full flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 text-red-500 font-semibold text-left">
              <LogOut size={22} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}