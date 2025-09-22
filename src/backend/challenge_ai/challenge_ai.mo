import IC "ic:aaaaa-aa";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";

actor {
  
  // Specific context for corporate challenge generation
  private stable var CHALLENGE_GENERATOR_CONTEXT = "
YOU ARE THE AI ASSISTANT SPECIALIZED IN CREATING CORPORATE CHALLENGES for the BeneChain platform.

YOUR ROLE:
- Generate creative and engaging corporate challenges
- Adapt challenges for different sectors and corporate cultures
- Suggest appropriate rewards in tokens
- Create challenges that promote well-being, productivity, and engagement

TYPES OF CHALLENGES YOU CAN CREATE:

1. WELL-BEING AND HEALTH:
   - Physical activity challenges
   - Mindfulness and meditation
   - Healthy eating
   - Workplace ergonomics
   - Rest and sleep quality

2. PRODUCTIVITY AND DEVELOPMENT:
   - Learning new skills
   - Innovation and creativity
   - Personal organization
   - Time management
   - Team collaboration

3. SUSTAINABILITY:
   - Eco-friendly practices
   - Waste reduction
   - Sustainable transportation
   - Energy saving
   - Recycling

4. ORGANIZATIONAL CULTURE:
   - Company values
   - Diversity and inclusion
   - Internal networking
   - Colleague recognition
   - Participation in events

5. PERSONAL DEVELOPMENT:
   - Reading and education
   - Hobbies and interests
   - Volunteering
   - Leadership
   - Communication

CHALLENGE STRUCTURE:
Each challenge must have:
- Attractive and clear title
- Detailed but concise description
- Specific evaluation criteria
- Appropriate deadline (suggested in days)
- Reward in tokens (based on difficulty)
- Related benefit category

GUIDELINES:
- Be creative but realistic
- Consider different levels of participation
- Promote inclusion (everyone can participate)
- Focus on measurable results
- Keep the tone motivational and positive

RESPONSE FORMAT:
When requested, respond ONLY with a valid JSON in the following format:
{
  \"title\": \"Challenge Title\",
  \"description\": \"Complete challenge description with clear criteria\",
  \"reward\": number_of_tokens,
  \"deadline_days\": number_of_days,
  \"category\": \"Food|Health|Culture|Transport|Education\"
}

If the question is not about challenge generation, politely reply that you are specialized only in creating corporate challenges for BeneChain.
";

  // Function to extract clean text from Gemini JSON response
  private func extractTextFromGeminiResponse(jsonResponse: Text) : Text {
  // Looks for "text": " and extracts the content using Text.split
  let startPattern = "\"text\": \"";
  
  // Split the string by the start pattern
  let parts1 = Text.split(jsonResponse, #text startPattern);
  let iter1 = parts1;
  
  // Skip the first part (before the pattern)
  switch (iter1.next()) {
    case (null) { return "Error: Invalid response format" };
    case (?_) {
    // Get the second part (after the pattern)
    switch (iter1.next()) {
      case (null) { return "Error: Start of response not found" };
      case (?afterStart) {
      // Now look for the end of the string
      let endPattern = "\"}";
      let parts2 = Text.split(afterStart, #text endPattern);
      let iter2 = parts2;
      
      switch (iter2.next()) {
        case (null) { return "Error: End of response not found" };
        case (?extracted) {
        // Remove basic escapes
        let cleaned1 = Text.replace(extracted, #text "\\n", "\n");
        let cleaned2 = Text.replace(cleaned1, #text "\\\"", "\"");
        let cleaned3 = Text.replace(cleaned2, #text "\\\\", "\\");
        return cleaned3;
        };
      };
      };
    };
    };
  };
  };

  // Main function to generate corporate challenges
  public shared func generateChallenge(sector: Text, company_size: Text, focus_area: Text) : async Text {
  let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
    "COMPANY CONTEXT:\n" #
    "- Sector: " # sector # "\n" #
    "- Size: " # company_size # "\n" #
    "- Focus area: " # focus_area # "\n\n" #
    "Generate ONE creative and engaging corporate challenge in JSON format. " #
    "Make sure the challenge is suitable for the specified sector and company size.";
  
  await callGeminiAPI(prompt)
  };

  // Function to generate multiple challenges
  public shared func generateMultipleChallenges(sector: Text, company_size: Text, quantity: Text) : async Text {
  let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
    "COMPANY CONTEXT:\n" #
    "- Sector: " # sector # "\n" #
    "- Size: " # company_size # "\n\n" #
    "Generate " # quantity # " different and creative corporate challenges. " #
    "Return a list in JSON format with an array of objects. " #
    "Vary the categories and difficulties of the challenges.";
  
  await callGeminiAPI(prompt)
  };

  // Function to customize an existing challenge
  public shared func customizeChallenge(base_challenge: Text, customization_request: Text) : async Text {
  let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
    "BASE CHALLENGE:\n" # base_challenge # "\n\n" #
    "CUSTOMIZATION REQUEST:\n" # customization_request # "\n\n" #
    "Modify the base challenge according to the customization request. " #
    "Return the modified challenge in JSON format.";
  
  await callGeminiAPI(prompt)
  };

  // Function to suggest rewards based on difficulty
  public shared func suggestReward(challenge_description: Text, difficulty_level: Text) : async Text {
  let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
    "CHALLENGE: " # challenge_description # "\n" #
    "DIFFICULTY LEVEL: " # difficulty_level # "\n\n" #
    "Analyze the challenge and suggest an appropriate reward in tokens considering:\n" #
    "- Required effort level\n" #
    "- Estimated completion time\n" #
    "- Impact on company objectives\n" #
    "- Value for the employee\n\n" #
    "Respond only with the recommended number of tokens and a brief justification.";
  
  await callGeminiAPI(prompt)
  };

  // General chat function about challenges
  public shared func chatAboutChallenges(question: Text) : async Text {
  let prompt = CHALLENGE_GENERATOR_CONTEXT # "\n\n" #
    "HR QUESTION: " # question # "\n\n" #
    "Respond in a useful and practical way, focusing on how to create effective corporate challenges.";
  
  await callGeminiAPI(prompt)
  };

  // Internal function to call the Gemini API
  private func callGeminiAPI(prompt: Text) : async Text {
  let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  let apiKey = "AIzaSyAIcKssifV6aoBS0Mde_OQkgifKgQ6NV_4";

  // Escape prompt for JSON
  let escapedPrompt = Text.replace(prompt, #text "\"", "\\\"");
  let body = 
    "{ \"contents\": [ { \"parts\": [ { \"text\": \"" # escapedPrompt # "\" } ] } ] }";

  let headers = [
    { name = "Content-Type"; value = "application/json" },
    { name = "X-goog-api-key"; value = apiKey }
  ];

  let request : IC.http_request_args = {
    url = url;
    method = #post;
    headers = headers;
    body = ?Text.encodeUtf8(body);
    max_response_bytes = null;
    transform = null;
    is_replicated = ?false;
  };

  // Add cycles for HTTP request
  Cycles.add<system>(25_000_000_000);
  let response = await IC.http_request<system>(request);

  switch (Text.decodeUtf8(response.body)) {
    case (?text) { 
    extractTextFromGeminiResponse(text)
    };
    case null { "Error decoding API response" };
  }
  };

  // Assistant info function
  public query func getAssistantInfo() : async Text {
  "AI assistant specialized in creating corporate challenges for BeneChain. " #
  "I can generate personalized challenges, suggest rewards, and help HR create engaging campaigns. " #
  "Use the functions generateChallenge(), generateMultipleChallenges(), customizeChallenge() or chatAboutChallenges()."
  };

  // Function to validate if a challenge is well structured
  public shared func validateChallenge(challenge_json: Text) : async Text {
  let prompt = "Analyze this corporate challenge JSON and check if it is well structured:\n\n" #
    challenge_json # "\n\n" #
    "Check:\n" #
    "1. If all required fields are present\n" #
    "2. If the description is clear and actionable\n" #
    "3. If the reward is appropriate\n" #
    "4. If the deadline is realistic\n\n" #
    "Respond with 'VALID' or list the problems found.";
  
  await callGeminiAPI(prompt)
  };
}
