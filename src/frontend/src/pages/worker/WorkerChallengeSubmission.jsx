// src/pages/worker/WorkerChallengeSubmission.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthClientContext";
import { Loader2, AlertTriangle, Trophy, Coins, ArrowLeft, Send, CheckCircle } from "lucide-react";

export function WorkerChallengeSubmission() {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    const { actors, principal } = useAuth();

    const [challenge, setChallenge] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);
    const [evidenceText, setEvidenceText] = useState("");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchChallengeAndSubmission = async () => {
            if (!actors?.challenges || !principal) return;
            try {
                // Fetch challenge details
                const challengeResult = await actors.challenges.getChallengeById(challengeId);
                if (challengeResult.length > 0) {
                    setChallenge(challengeResult[0]);
                } else {
                    setMessage({ type: "error", text: "Challenge not found." });
                    return;
                }

                // Check if user already submitted this challenge
                const submissionsResult = await actors.challenges.getSubmissionsForWorker(principal);
                const existingSub = submissionsResult.find(sub => sub.challengeId === challengeId);
                if (existingSub) {
                    setExistingSubmission(existingSub);
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setMessage({ type: "error", text: "Error loading challenge." });
            } finally {
                setLoading(false);
            }
        };
        fetchChallengeAndSubmission();
    }, [actors, challengeId, principal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!evidenceText.trim()) {
            setMessage({ type: "error", text: "Description of how you completed the challenge is required." });
            return;
        }
        setSubmitting(true);
        setMessage({ type: "", text: "" });
        try {
            // Combine text and URL into a single string
            let submissionContent = evidenceText.trim();
            if (evidenceUrl.trim()) {
                submissionContent += `\n\nProof link: ${evidenceUrl.trim()}`;
            }

            // Debug
            console.log("=== DEBUG SUBMISSION ===");
            console.log("challengeId:", JSON.stringify(challengeId), "type:", typeof challengeId);
            console.log("submissionContent:", JSON.stringify(submissionContent), "type:", typeof submissionContent);
            console.log("submissionContent length:", submissionContent.length);

            // Check if challengeId and submissionContent are valid strings
            if (typeof challengeId !== 'string' || typeof submissionContent !== 'string') {
                throw new Error("Invalid parameters: challengeId or submissionContent are not strings");
            }

            const result = await actors.challenges.submitToChallengeSimple(challengeId, submissionContent);
            if ('ok' in result) {
                setMessage({ type: "success", text: "Challenge completed successfully! Your submission will be reviewed soon." });
                setTimeout(() => navigate("/challenges"), 2000);
            } else {
                throw new Error(result.err);
            }
        } catch (err) {
            setMessage({ type: "error", text: `Failed to submit: ${err.message}` });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="container mx-auto p-4 md:p-8 pb-28 md:pb-8">
            <Link to="/challenges" className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:underline">
                <ArrowLeft size={18} /> Back to all challenges
            </Link>

            {!challenge && message.text && <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-3"><AlertTriangle /> {message.text}</div>}

            {challenge && (
                <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
                    <div className="text-center">
                        <Trophy size={48} className="mx-auto text-yellow-500" />
                        <h1 className="text-3xl font-bold mt-4">{challenge.title}</h1>
                        <p className="text-gray-500 mt-2">{challenge.description}</p>
                        <div className="inline-flex items-center gap-2 text-green-600 font-bold bg-green-100 px-4 py-2 rounded-full mt-4">
                            <Coins size={20} />
                            <span>Reward: {Number(challenge.reward)} Tokens</span>
                        </div>
                    </div>

                    {existingSubmission ? (
                        // Show existing submission status
                        <div className="mt-8 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">You have already submitted this challenge</h3>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Status: </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            existingSubmission.status.constructor.name === 'Approved' 
                                                ? 'bg-green-100 text-green-800'
                                                : existingSubmission.status.constructor.name === 'Rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {existingSubmission.status.constructor.name === 'Approved' ? '✅ Approved' :
                                             existingSubmission.status.constructor.name === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Your answer: </span>
                                        <p className="mt-1 text-sm text-gray-600 bg-white p-3 rounded border">
                                            {existingSubmission.submissionContent}
                                        </p>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Submitted on: {new Date(Number(existingSubmission.submittedAt / 1000000n)).toLocaleDateString('en-US', {
                                            day: '2-digit',
                                            month: '2-digit', 
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>

                                    {existingSubmission.status.constructor.name === 'Approved' && (
                                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                                            <Coins size={16} />
                                            <span>{Number(challenge.reward)} tokens credited to your wallet!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Submission form
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="evidenceText" className="block text-sm font-medium text-gray-700">Describe how you completed the challenge</label>
                            <textarea
                                id="evidenceText"
                                value={evidenceText}
                                onChange={(e) => setEvidenceText(e.target.value)}
                                rows={4}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="E.g.: I meditated for 10 minutes every morning..."
                            />
                        </div>
                        <div>
                            <label htmlFor="evidenceUrl" className="block text-sm font-medium text-gray-700">Proof link (Optional)</label>
                            <input
                                type="url"
                                id="evidenceUrl"
                                value={evidenceUrl}
                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="https://example.com/proof.jpg"
                            />
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2">
                            {submitting ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                            {submitting ? "Submitting..." : "Complete Challenge"}
                        </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}