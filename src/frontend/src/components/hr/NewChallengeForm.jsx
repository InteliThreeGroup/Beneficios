import React, { useState } from "react";
import { useAuth } from "../../pages/auth/AuthClientContext";

export default function NewChallengeForm({ onChallengeCreated, aiGeneratedData, onDataUsed }) {
  const { actors, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "", 
    reward: "",
    deadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Effect to pre-fill with AI data
  React.useEffect(() => {
    if (aiGeneratedData) {
      // Calculate deadline based on deadline_days if provided
      let deadlineValue = "";
      if (aiGeneratedData.deadline_days) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(aiGeneratedData.deadline_days));
        deadlineValue = futureDate.toISOString().slice(0, 16); // datetime-local format
      }

      setFormData({
        title: aiGeneratedData.title || "",
        description: aiGeneratedData.description || "",
        reward: aiGeneratedData.reward ? String(aiGeneratedData.reward) : "",
        deadline: deadlineValue
      });

      setMessage("✨ AI pre-filled data! Review and adjust as needed.");
      
      // Notify that the data was used
      if (onDataUsed) {
        onDataUsed();
      }
    }
  }, [aiGeneratedData, onDataUsed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Basic validation
      if (!formData.title.trim() || !formData.description.trim() || !formData.reward || !formData.deadline) {
        throw new Error("All fields are required");
      }

      if (!actors?.challenges) {
        throw new Error("System not connected");
      }

      if (!profile?.companyId) {
        throw new Error("Company profile not found");
      }

      // Prepare data with explicit conversion
      const title = String(formData.title || "").trim();
      const description = String(formData.description || "").trim(); 
      
      // Extract companyId correctly
      let rawCompanyId = profile.companyId;
      if (Array.isArray(rawCompanyId)) {
        rawCompanyId = rawCompanyId[0];
      }
      const companyId = String(rawCompanyId || "").trim();
      
      // Additional validations
      if (!title || title.length < 2) {
        throw new Error("Title must be at least 2 characters");
      }
      if (!description || description.length < 5) {
        throw new Error("Description must be at least 5 characters");
      }
      if (!companyId || companyId.length < 1) {
        throw new Error("Invalid company ID");
      }
      
      const rewardNum = parseInt(formData.reward, 10);
      if (isNaN(rewardNum) || rewardNum <= 0) {
        throw new Error("Reward must be a positive number");
      }
      const reward = BigInt(rewardNum);
      
      // Convert date to nanoseconds
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error("Invalid date");
      }
      if (deadlineDate <= new Date()) {
        throw new Error("Deadline must be in the future");
      }
      const deadlineNs = BigInt(Math.floor(deadlineDate.getTime())) * BigInt(1000000);

      console.log("=== CREATING CHALLENGE (FINAL CHECK) ===");
      console.log("title:", JSON.stringify(title), "length:", title.length, "type:", typeof title);
      console.log("description:", JSON.stringify(description), "length:", description.length, "type:", typeof description);
      console.log("companyId:", JSON.stringify(companyId), "length:", companyId.length, "type:", typeof companyId);
      console.log("reward:", reward.toString(), "type:", typeof reward);
      console.log("deadline:", deadlineNs.toString(), "type:", typeof deadlineNs);
      console.log("deadline readable:", deadlineDate.toISOString());

      // Final check before sending
      if (typeof title !== 'string' || typeof description !== 'string' || typeof companyId !== 'string') {
        throw new Error("Type error in text parameters");
      }
      if (typeof reward !== 'bigint' || typeof deadlineNs !== 'bigint') {
        throw new Error("Type error in numeric parameters");
      }

      // Call backend using simplified function
      const result = await actors.challenges.createChallengeSimple(
        title,
        description, 
        companyId,
        reward,
        deadlineNs
      );

      console.log("=== RESULT ===", result);

      // Check if response is in Result format or direct
      if ('ok' in result) {
        // Format Result<Challenge, Text>
        setMessage(`Challenge created successfully! ID: ${result.ok.id}`);
        setFormData({ title: "", description: "", reward: "", deadline: "" });
        
        // Notify parent component that a challenge was created
        if (onChallengeCreated) {
          onChallengeCreated();
        }
      } else if (result && result.id) {
        // Direct format (Challenge)
        setMessage(`Challenge created successfully! ID: ${result.id}`);
        setFormData({ title: "", description: "", reward: "", deadline: "" });
        
        // Notify parent component that a challenge was created
        if (onChallengeCreated) {
          onChallengeCreated();
        }
      } else if ('err' in result) {
        setMessage(`Error: ${result.err}`);
      } else {
        setMessage("Unexpected server response");
      }

    } catch (error) {
      console.error("Full error:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Challenge</h2>
        {aiGeneratedData && (
          <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            <span>✨</span>
            <span>AI Generated</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challenge Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter challenge title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the challenge"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward (tokens)
          </label>
          <input
            type="number"
            name="reward"
            value={formData.reward}
            onChange={handleInputChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Challenge"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md text-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Profile loaded: {profile ? "Yes" : "No"}</p>
          <p>Company ID: {profile?.companyId || "N/A"}</p>
          <p>Actors loaded: {actors?.challenges ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}