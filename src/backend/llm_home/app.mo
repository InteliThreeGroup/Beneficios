import IC "ic:aaaaa-aa";
import Cycles "mo:base/ExperimentalCycles";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor {
  
  // Full context about the BeneChain project
  private let BENECHAIN_CONTEXT = "
YOU ARE THE OFFICIAL AGENT OF BENECHAIN - A decentralized corporate benefits platform built on the Internet Computer Protocol (ICP).

MAIN INFORMATION ABOUT BENECHAIN:

OVERVIEW:
- BeneChain is a 100% on-chain corporate benefits platform
- Eliminates traditional financial intermediaries
- Reduces fees from 3-14% to 0.5-1%
- Offers instant payments and full transparency
- Built entirely on the Internet Computer Protocol (ICP)

PROBLEMS IT SOLVES:
For HR:
- Lack of control over benefit usage
- Difficulty in customization
- Decentralized reporting

For Employees:
- Low flexibility
- Multiple cards when changing jobs
- Hidden fees that reduce purchasing power

For Establishments:
- Abusive fees (3% to 14%)
- Delay in fund transfers
- Dependence on monopolies

TECHNICAL ARCHITECTURE:
4 main canisters:
1. identity_auth.mo - Authentication and authorization
2. benefits_manager.mo - Benefits program management
3. wallets.mo - Workers' digital wallets
4. establishment.mo - Commercial establishment management

ICP RESOURCES USED:
- Internet Identity for authentication
- On-chain timers for automatic distribution
- HTTPS outcalls for external integrations
- Reverse gas model (company pays the fees)
- Asset canisters for decentralized frontend

SUPPORTED BENEFIT TYPES:
- Food (#Food)
- Health (#Health)
- Culture (#Culture)
- Home Office (#HomeOffice)
- Transport (#Transport)

MAIN FLOW:
1. HR creates a benefits program
2. Associates employees with the program
3. System distributes automatically via timers
4. Employees use benefits at establishments
5. Payments are processed instantly

ANSWER ONLY QUESTIONS ABOUT BENECHAIN. If the question is not related to the project, politely reply that you can only help with BeneChain-related issues.
";

  // Function to extract the text from Gemini's JSON response (simplified version)
  private func extractTextFromGeminiResponse(jsonResponse: Text) : Text {
  // Looks for the pattern "text": "..." in the JSON response
  let textMarker = "\"text\": \"";
  let parts = Text.split(jsonResponse, #text textMarker);
  let iter = parts;
  
  switch (iter.next()) {
    case (null) { "Error: Response not found" };
    case (?_) {
    switch (iter.next()) {
      case (null) { "Error: Invalid format" };
      case (?textPart) {
      // Finds the end of the string (next \" that is not \\")
      let endMarker = "\"";
      let endParts = Text.split(textPart, #text endMarker);
      let endIter = endParts;
      
      switch (endIter.next()) {
        case (null) { "Error: Text not found" };
        case (?extractedText) { 
        // Remove escape characters
        let cleaned = Text.replace(extractedText, #text "\\n", "\n");
        Text.replace(cleaned, #text "\\\"", "\"")
        };
      };
      };
    };
    };
  };
  };

  // Main function of the BeneChain agent
  public shared func askBeneChainAgent(userQuestion: Text) : async Text {
  // Creates the prompt with specific BeneChain context
  let contextualPrompt = BENECHAIN_CONTEXT # "\n\nUSER QUESTION: " # userQuestion # "\n\nRESPOND CLEARLY AND OBJECTIVELY:";
  
  // Uses the same implementation as askGemini that works
  await callGeminiAPI(contextualPrompt)
  };

  // General question function (kept for compatibility)
  public shared func askGemini(prompt: Text) : async Text {
  await callGeminiAPI(prompt)
  };

  // Internal function to make the call to Gemini API
  private func callGeminiAPI(prompt: Text) : async Text {
  let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  let apiKey = "AIzaSyBylTRLbVW__OS7wgZhK_aylEGy-LtbM8Y";

  let body = 
    "{ \"contents\": [ { \"parts\": [ { \"text\": \"" # prompt # "\" } ] } ] }";

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

  // Add cycles as needed to pay for the HTTP request
  Cycles.add<system>(25_000_000_000); // 25 billion cycles
  let response = await IC.http_request<system>(request);

  switch (Text.decodeUtf8(response.body)) {
    case (?text) { 
    // Extracts only the text from the JSON response
    extractTextFromGeminiResponse(text)
    };
    case null { "Error decoding response" };
  }
  };

  // Function to quickly get information about BeneChain
  public query func getBeneChainInfo() : async Text {
  "BeneChain is a decentralized corporate benefits platform built on the Internet Computer Protocol (ICP). It eliminates intermediaries, reduces costs, and offers full transparency. For more information, use the askBeneChainAgent() function with your specific question."
  };
}