// src/pages/worker/WorkerSubmissionsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthClientContext";
import { Loader2, AlertTriangle, Trophy, Clock, CheckCircle, XCircle, Coins } from "lucide-react";

// Helper to format status
const getStatusInfo = (status) => {
    switch (status.constructor.name) {
        case 'Pending':
            return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' };
        case 'Approved':
            return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Approved' };
        case 'Rejected':
            return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Rejected' };
        default:
            return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
};

// Helper to format date
const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp / 1000000n)); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export function WorkerSubmissionsPage() {
    const { actors, principal } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [challengesMap, setChallengesMap] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSubmissions = useCallback(async () => {
        console.log("=== DEBUG FETCH WORKER SUBMISSIONS ===");
        console.log("actors?.challenges:", !!actors?.challenges);
        console.log("principal:", principal);
        
        if (!actors?.challenges || !principal) {
            console.log("No challenges actor or principal available");
            return;
        }
        
        try {
            setLoading(true);
            setError("");
            
            // Fetch worker submissions
            console.log("Fetching submissions for principal:", principal.toString());
            const submissionsResult = await actors.challenges.getSubmissionsForWorker(principal);
            console.log("Received submissions:", submissionsResult);
            
            // Fetch challenge details
            const challengeIds = [...new Set(submissionsResult.map(s => s.challengeId))];
            const challengesMap = new Map();
            
            for (const challengeId of challengeIds) {
                try {
                    const challengeResult = await actors.challenges.getChallengeById(challengeId);
                    if (challengeResult && challengeResult.length > 0) {
                        challengesMap.set(challengeId, challengeResult[0]);
                    }
                } catch (err) {
                    console.error(`Error fetching challenge ${challengeId}:`, err);
                }
            }
            
            setSubmissions(submissionsResult);
            setChallengesMap(challengesMap);
            
        } catch (err) {
            console.error("Error fetching submissions:", err);
            setError("Could not load your submissions.");
        } finally {
            setLoading(false);
        }
    }, [actors, principal]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    return (
        <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
            <header className="mb-6">
                <h1 className="text-4xl font-bold">My Submissions</h1>
                <p className="text-lg text-gray-500">Track the status of your submitted challenges.</p>
            </header>
            
            {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}
            {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-3"><AlertTriangle /> {error}</div>}

            {!loading && !error && (
                submissions.length > 0 ? (
                    <div className="space-y-4">
                        {submissions.map((submission) => {
                            const challenge = challengesMap.get(submission.challengeId);
                            const statusInfo = getStatusInfo(submission.status);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                                <div key={submission.id} className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Trophy className="text-yellow-500" size={24} />
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {challenge ? challenge.title : 'Unknown Challenge'}
                                                </h3>
                                            </div>
                                            
                                            {challenge && (
                                                <p className="text-gray-600 mb-3">{challenge.description}</p>
                                            )}
                                            
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-1">Your Answer:</h4>
                                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                    {submission.submissionContent}
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span>Submitted on: {formatDate(submission.submittedAt)}</span>
                                                {challenge && (
                                                    <span className="flex items-center gap-1">
                                                        <Coins size={16} />
                                                        Reward: {Number(challenge.reward)} tokens
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="ml-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                                <StatusIcon size={16} />
                                                <span>{statusInfo.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        <Trophy size={48} className="mx-auto text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold">No Submissions</h3>
                        <p className="mt-1 text-gray-500">You have not submitted any challenges yet.</p>
                    </div>
                )
            )}
        </div>
    );
}