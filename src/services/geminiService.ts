

// CRITICAL SECURITY RISK: The GoogleGenAI instance and the getErrorExplanation function
// expose the API key on the client-side. This code MUST be moved to a secure backend
// environment (e.g., a Firebase Cloud Function) before being used in production.
// The API key should never be visible in the browser.

// const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });

export async function getErrorExplanation(): Promise<string> {
  // This function is disabled until it can be moved to a secure backend proxy.
  console.error("Gemini API call is disabled on the client-side for security reasons.");
  return "AI analysis is currently disabled. This feature must be implemented on a secure backend.";

  /*
  // --- THIS CODE MUST BE MOVED TO A BACKEND ---
  if (!import.meta.env.VITE_API_KEY) {
    return "VITE_API_KEY environment variable not set. Please configure it to use AI analysis.";
  }

  const prompt = `
    As an expert in HTML for email development, analyze the following HTML code snippet and the specific error found.
    Explain the error in a clear, concise way, focusing on why it's problematic for email clients.
    Then, provide a corrected version of the line or the relevant block of code.

    Error Details:
    - Message: "${error.message}"
    - Line Number: ${error.lineNumber}
    - Problematic Tag: ${error.errorTag}
    - Full line content: "${error.lineContent.trim()}"

    Full HTML Context:
    \`\`\`html
    ${fullHtml}
    \`\`\`

    Please structure your response in Markdown. Start with a "Root Cause" section explaining the issue, followed by a "Suggested Fix" section with a corrected code block.
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // FIX: The .text property on the GenerateContentResponse is a string, not a function.
    return response.text;
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return "An error occurred while fetching analysis from the AI. Please check the console for details.";
  }
  */
}
