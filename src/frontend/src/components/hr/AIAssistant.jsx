import React, { useState } from 'react';
import { useAuth } from '../../pages/auth/AuthClientContext';
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Wand2, 
  CheckCircle, 
  Loader2, 
  Send,
  Lightbulb,
  Target,
  DollarSign,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AIAssistant = ({ onChallengeGenerated }) => {
  const { actors } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [parsedChallenge, setParsedChallenge] = useState(null);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // States for challenge generation
  const [generateForm, setGenerateForm] = useState({
    sector: '',
    company_size: '',
    focus_area: ''
  });

  // States for multiple challenges
  const [multipleForm, setMultipleForm] = useState({
    sector: '',
    company_size: '',
    quantity: '3'
  });

  // States for customization
  const [customizeForm, setCustomizeForm] = useState({
    base_challenge: '',
    customization_request: ''
  });

  // States for reward suggestion
  const [rewardForm, setRewardForm] = useState({
    challenge_description: '',
    difficulty_level: ''
  });

  // States for free chat
  const [chatForm, setChatForm] = useState({
    question: ''
  });

  // States for validation
  const [validateForm, setValidateForm] = useState({
    challenge_json: ''
  });

  // Function to process AI response and extract structured data
  const processAIResponse = (responseText) => {
    try {
      console.log('Processing AI response:', responseText);
      
      let jsonData;
      
      // Try to extract JSON from ```json``` code block if present
      const jsonCodeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonCodeBlockMatch) {
        const jsonStr = jsonCodeBlockMatch[1].trim();
        console.log('JSON extracted from code block:', jsonStr);
        try {
          jsonData = JSON.parse(jsonStr);
        } catch (e) {
          console.log('Error parsing extracted JSON:', e);
          return null;
        }
      } else {
        // Try direct parse first
        try {
          jsonData = JSON.parse(responseText);
        } catch (e) {
          // If fails, try to find JSON in the middle of the text
          const jsonMatch = responseText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
          if (jsonMatch) {
            try {
              jsonData = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
              console.log('Error parsing found JSON:', parseError);
              return null;
            }
          } else {
            return null;
          }
        }
      }
      
      // If a valid challenge object is found, process it
      if (jsonData && (jsonData.title || jsonData.name)) {
        const challenge = {
          title: jsonData.title || jsonData.name || '',
          description: jsonData.description || jsonData.desc || '',
          reward: jsonData.reward || jsonData.tokens || jsonData.points || '',
          deadline_days: jsonData.deadline_days || jsonData.days || jsonData.duration || ''
        };
        
        console.log('Processed challenge:', challenge);
        setParsedChallenge(challenge);
        return challenge;
      }
      
      return null;
    } catch (error) {
      console.log('Error processing JSON:', error);
      return null;
    }
  };

  const handleAPICall = async (apiFunction, params) => {
    setLoading(true);
    setError('');
    setResult('');
    setParsedChallenge(null);

    try {
      if (!actors?.challenge_ai) {
        throw new Error('AI assistant not available');
      }

      let response;
      switch (apiFunction) {
        case 'generateChallenge':
          response = await actors.challenge_ai.generateChallenge(
            params.sector, 
            params.company_size, 
            params.focus_area
          );
          break;
        case 'generateMultipleChallenges':
          response = await actors.challenge_ai.generateMultipleChallenges(
            params.sector, 
            params.company_size, 
            params.quantity
          );
          break;
        case 'customizeChallenge':
          response = await actors.challenge_ai.customizeChallenge(
            params.base_challenge, 
            params.customization_request
          );
          break;
        case 'suggestReward':
          response = await actors.challenge_ai.suggestReward(
            params.challenge_description, 
            params.difficulty_level
          );
          break;
        case 'chatAboutChallenges':
          response = await actors.challenge_ai.chatAboutChallenges(params.question);
          break;
        case 'validateChallenge':
          response = await actors.challenge_ai.validateChallenge(params.challenge_json);
          break;
        default:
          throw new Error('Function not recognized');
      }

      setResult(response);

      // Process response to extract structured data
      const challengeData = processAIResponse(response);
      console.log('Returned challengeData:', challengeData);
      console.log('ParsedChallenge state:', parsedChallenge);

      // If generating challenge and valid data returned, notify parent component
      if ((apiFunction === 'generateChallenge' || apiFunction === 'customizeChallenge') && challengeData && onChallengeGenerated) {
        console.log('Notifying parent component with challenge data');
        onChallengeGenerated(challengeData);
      }

    } catch (error) {
      console.error('Error in AI call:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'generate', name: 'Generate Challenge', icon: Sparkles },
    { id: 'multiple', name: 'Multiple Challenges', icon: Target },
    { id: 'customize', name: 'Customize', icon: Wand2 },
    { id: 'reward', name: 'Suggest Reward', icon: DollarSign },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'validate', name: 'Validate', icon: CheckCircle }
  ];

  const sectors = [
    'Technology', 'Health', 'Education', 'Finance', 'Retail', 
    'Manufacturing', 'Services', 'Consulting', 'Food', 'Other'
  ];

  const companySizes = [
    'Startup (1-10 employees)', 
    'Small (11-50 employees)', 
    'Medium (51-200 employees)', 
    'Large (201-1000 employees)', 
    'Corporation (1000+ employees)'
  ];

  const focusAreas = [
    'Well-being and Health', 'Productivity', 'Organizational Culture', 
    'Sustainability', 'Personal Development', 'Innovation', 
    'Teamwork', 'Leadership'
  ];

  const difficultyLevels = [
    'Easy', 'Medium', 'Hard', 'Very Hard'
  ];

  return (
    <div className="h-full min-h-[600px] bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI Assistant for Challenges</h2>
              <p className="text-gray-500 text-sm">Use AI to automatically create engaging challenges</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </div>

      {/* Generate Challenge */}
      {activeTab === 'generate' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={generateForm.sector}
                onChange={(e) => setGenerateForm({...generateForm, sector: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select sector</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <select
                value={generateForm.company_size}
                onChange={(e) => setGenerateForm({...generateForm, company_size: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Area</label>
              <select
                value={generateForm.focus_area}
                onChange={(e) => setGenerateForm({...generateForm, focus_area: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select area</option>
                {focusAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => handleAPICall('generateChallenge', generateForm)}
            disabled={loading || !generateForm.sector || !generateForm.company_size || !generateForm.focus_area}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generate Challenge
          </button>
        </div>
      )}

      {/* Multiple Challenges */}
      {activeTab === 'multiple' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={multipleForm.sector}
                onChange={(e) => setMultipleForm({...multipleForm, sector: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select sector</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <select
                value={multipleForm.company_size}
                onChange={(e) => setMultipleForm({...multipleForm, company_size: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <select
                value={multipleForm.quantity}
                onChange={(e) => setMultipleForm({...multipleForm, quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="3">3 challenges</option>
                <option value="5">5 challenges</option>
                <option value="10">10 challenges</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => handleAPICall('generateMultipleChallenges', multipleForm)}
            disabled={loading || !multipleForm.sector || !multipleForm.company_size}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
            Generate Multiple Challenges
          </button>
        </div>
      )}

      {/* Customize Challenge */}
      {activeTab === 'customize' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Challenge (JSON)</label>
            <textarea
              value={customizeForm.base_challenge}
              onChange={(e) => setCustomizeForm({...customizeForm, base_challenge: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder='{"title": "Example challenge", "description": "...", ...}'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customization Request</label>
            <textarea
              value={customizeForm.customization_request}
              onChange={(e) => setCustomizeForm({...customizeForm, customization_request: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="E.g.: Adapt this challenge for a technology company focused on remote work"
            />
          </div>
          <button
            onClick={() => handleAPICall('customizeChallenge', customizeForm)}
            disabled={loading || !customizeForm.base_challenge || !customizeForm.customization_request}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
            Customize Challenge
          </button>
        </div>
      )}

      {/* Suggest Reward */}
      {activeTab === 'reward' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Description</label>
            <textarea
              value={rewardForm.challenge_description}
              onChange={(e) => setRewardForm({...rewardForm, challenge_description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe the challenge for reward analysis..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={rewardForm.difficulty_level}
              onChange={(e) => setRewardForm({...rewardForm, difficulty_level: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select difficulty</option>
              {difficultyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleAPICall('suggestReward', rewardForm)}
            disabled={loading || !rewardForm.challenge_description || !rewardForm.difficulty_level}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
            Suggest Reward
          </button>
        </div>
      )}

      {/* Chat */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ask a question about challenges</label>
            <textarea
              value={chatForm.question}
              onChange={(e) => setChatForm({...chatForm, question: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="E.g.: How to create challenges that encourage collaboration among remote teams?"
            />
          </div>
          <button
            onClick={() => handleAPICall('chatAboutChallenges', chatForm)}
            disabled={loading || !chatForm.question}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Send Question
          </button>
        </div>
      )}

      {/* Validate */}
      {activeTab === 'validate' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Challenge JSON for Validation</label>
            <textarea
              value={validateForm.challenge_json}
              onChange={(e) => setValidateForm({...validateForm, challenge_json: e.target.value})}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder='{"title": "...", "description": "...", "reward": 100, "deadline_days": 7, "category": "Health"}'
            />
          </div>
          <button
            onClick={() => handleAPICall('validateChallenge', validateForm)}
            disabled={loading || !validateForm.challenge_json}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            Validate Challenge
          </button>
        </div>
      )}

      {/* Result - Structured Challenge */}
      {parsedChallenge && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="text-blue-600" size={16} />
              <h4 className="font-semibold text-blue-800">Challenge Generated by AI:</h4>
            </div>
            <button
              onClick={() => {
                console.log('Sending challenge to form:', parsedChallenge);
                if (onChallengeGenerated) {
                  onChallengeGenerated(parsedChallenge);
                }
              }}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              <Send size={14} />
              Use in Form
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-blue-800">Title:</span>
              <p className="text-blue-700 ml-2">{parsedChallenge.title}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Description:</span>
              <p className="text-blue-700 ml-2 whitespace-pre-line">{parsedChallenge.description}</p>
            </div>
            {parsedChallenge.reward && (
              <div>
                <span className="font-medium text-blue-800">Suggested Reward:</span>
                <p className="text-blue-700 ml-2">{parsedChallenge.reward} tokens</p>
              </div>
            )}
            {parsedChallenge.deadline_days && (
              <div>
                <span className="font-medium text-blue-800">Suggested Deadline:</span>
                <p className="text-blue-700 ml-2">{parsedChallenge.deadline_days} days</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result - Raw Response (only if not structured challenge) */}
      {result && !parsedChallenge && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-green-600" size={16} />
            <h4 className="font-semibold text-green-800">AI Response:</h4>
          </div>
          <div className="text-sm text-green-700 whitespace-pre-wrap overflow-x-auto">{result}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="text-red-600" size={16} />
            <h4 className="font-semibold text-red-800">Error:</h4>
          </div>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
        </>
      )}
      </div>
    </div>
  );
};

export default AIAssistant;
