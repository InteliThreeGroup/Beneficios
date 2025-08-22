// src/pages/worker/WorkerChallengeList.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { Loader2, AlertTriangle, Trophy, Clock, Coins } from "lucide-react";

// Helper to calculate remaining time
const formatTimeLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(Number(deadline / 1000000n)); // Convert nanoseconds to milliseconds
    const diff = deadlineDate.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
};

export function WorkerChallengeList() {
    const { actors, profile } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchChallenges = useCallback(async () => {
        console.log("=== DEBUG FETCH CHALLENGES ===");
        console.log("actors?.challenges:", !!actors?.challenges);
        console.log("profile:", profile);
        console.log("profile?.companyId:", profile?.companyId);
        console.log("typeof profile?.companyId:", typeof profile?.companyId);
        
        if (!actors?.challenges) {
            console.log("No challenges actor available");
            return;
        }
        
        if (!profile?.companyId) {
            setError("You are not associated with any company.");
            return;
        }
        
        try {
            setLoading(true);
            setError("");
            
            // Normalize companyId - can be string or array
            let companyId;
            if (Array.isArray(profile.companyId)) {
                companyId = profile.companyId[0];
            } else {
                companyId = profile.companyId;
            }
            
            console.log("Fetching challenges for company:", companyId);
            const result = await actors.challenges.getActiveChallenges(companyId);
            console.log("Result received:", result);
            setChallenges(result);
        } catch (err) {
            console.error("Error fetching challenges:", err);
            setError("Could not load challenges.");
        } finally {
            setLoading(false);
        }
    }, [actors, profile]);

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    return (
        <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
            <header className="mb-6">
                <h1 className="text-4xl font-bold">Challenges</h1>
                <p className="text-lg text-gray-500">Participate to earn exclusive rewards.</p>
            </header>
            
            {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}
            {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-3"><AlertTriangle /> {error}</div>}

            {!loading && !error && (
                challenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map((challenge) => (
                            <Link to={`/challenges/${challenge.id}`} key={challenge.id} className="bg-white rounded-xl shadow-md p-6 block hover:shadow-lg hover:-translate-y-1 transition-all">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                                        <Trophy size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{challenge.description}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                                        <Coins size={16} />
                                        <span>{Number(challenge.reward)} Tokens</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock size={16} />
                                        <span>{formatTimeLeft(challenge.deadline)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        <Trophy size={48} className="mx-auto text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold">No Active Challenges</h3>
                        <p className="mt-1 text-gray-500">Check back later for new opportunities!</p>
                    </div>
                )
            )}
        </div>
    );
}