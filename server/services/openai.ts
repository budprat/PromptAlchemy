import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "mock-key-for-development" });

type OptimizationSettings = {
  // Basic settings
  length: number;
  tone: number;
  specificity: number;
  
  // Advanced settings
  creativity?: number;
  audience?: string;
  formality?: number;
  purpose?: string;
  structure?: string;
  
  // Enhancement toggles
  enhanceClarity?: boolean;
  enhanceSpecificity?: boolean;
  enhanceFocus?: boolean;
  enhanceAiFriendliness?: boolean;
  
  // Style preferences
  style?: {
    useMarkdown?: boolean;
    useBulletPoints?: boolean;
    useHeadings?: boolean;
    useExamples?: boolean;
    includeContext?: boolean;
  };
};

type EvaluationDetails = {
  clarity: { score: number; feedback: string };
  specificity: { score: number; feedback: string };
  focus: { score: number; feedback: string };
  aiFriendliness: { score: number; feedback: string };
};

export async function optimizePrompt(
  originalPrompt: string,
  settings: OptimizationSettings,
  evaluationDetails: EvaluationDetails
) {
  // In development without API keys, return mock data
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock-key-for-development") {
    return mockOptimizePrompt(originalPrompt, settings, evaluationDetails);
  }

  try {
    // Get labels for various settings
    const lengthLabel = getLengthLabel(settings.length);
    const toneLabel = getToneLabel(settings.tone);
    const specificityLabel = getSpecificityLabel(settings.specificity);
    
    // Additional settings with defaults
    let creativityVal = settings.creativity !== undefined ? settings.creativity : 2;
    let formalityVal = settings.formality !== undefined ? settings.formality : 2;
    const creativityLabel = getCreativityLabel(creativityVal);
    const formalityLabel = getFormalityLabel(formalityVal);
    const audience = settings.audience || "general";
    const purpose = settings.purpose || "information";
    const structure = settings.structure || "narrative";
    
    // Enhancement targets
    const enhancementTargets = [];
    if (settings.enhanceClarity) enhancementTargets.push("clarity");
    if (settings.enhanceSpecificity) enhancementTargets.push("specificity");
    if (settings.enhanceFocus) enhancementTargets.push("focus");
    if (settings.enhanceAiFriendliness) enhancementTargets.push("AI-friendliness");
    
    // Style preferences
    const style = settings.style || {
      useMarkdown: true,
      useBulletPoints: true,
      useHeadings: true,
      useExamples: false,
      includeContext: true
    };

    const prompt = `
      You are PromptAlchemy, a specialized AI prompt optimization assistant. I'll provide you with an original prompt along with its evaluation scores, optimization settings, and your task is to create an improved version.

      Original Prompt:
      """
      ${originalPrompt}
      """

      Evaluation Details:
      - Clarity: ${evaluationDetails.clarity.score}/10 - ${evaluationDetails.clarity.feedback}
      - Specificity: ${evaluationDetails.specificity.score}/10 - ${evaluationDetails.specificity.feedback}
      - Focus: ${evaluationDetails.focus.score}/10 - ${evaluationDetails.focus.feedback}
      - AI-Friendliness: ${evaluationDetails.aiFriendliness.score}/10 - ${evaluationDetails.aiFriendliness.feedback}

      Basic Optimization Settings:
      - Length: ${lengthLabel}
      - Tone: ${toneLabel}
      - Specificity: ${specificityLabel}
      
      Advanced Optimization Settings:
      - Creativity: ${creativityLabel}
      - Formality: ${formalityLabel}
      - Target Audience: ${audience}
      - Purpose: ${purpose}
      - Structure: ${structure}
      
      Style Preferences:
      - Use Markdown: ${style.useMarkdown ? "Yes" : "No"}
      - Use Bullet Points: ${style.useBulletPoints ? "Yes" : "No"}
      - Use Headings: ${style.useHeadings ? "Yes" : "No"}
      - Include Examples: ${style.useExamples ? "Yes" : "No"}
      - Include Context: ${style.includeContext ? "Yes" : "No"}
      
      Enhancement Focus: ${enhancementTargets.length > 0 ? enhancementTargets.join(", ") : "All areas"}

      I need you to:
      1. Create an optimized version of the prompt that addresses the evaluation feedback and follows all the settings above
      2. Format the response with HTML color spans to highlight different improvements:
         - Use <span class="text-green-600">text</span> for context improvements
         - Use <span class="text-primary-600">text</span> for tone and style improvements
         - Use <span class="text-secondary-600">text</span> for format instructions
         - Use <span class="text-accent-600">text</span> for added capabilities
      3. List 3-5 specific improvements you made in bullet points (use HTML formatting)
      4. Predict an improved overall score out of 10

      Return your response in the following JSON format:
      {
        "optimizedPrompt": "HTML formatted improved prompt with colored spans",
        "improvements": ["HTML formatted improvement 1", "HTML formatted improvement 2", ...],
        "score": predicted_score_number
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      optimizedPrompt: result.optimizedPrompt,
      improvements: result.improvements,
      score: result.score
    };
  } catch (error) {
    console.error("Error optimizing prompt with OpenAI:", error);
    throw new Error("Failed to optimize prompt");
  }
}

// Helper functions to convert numeric settings to labels
function getLengthLabel(value: number): string {
  switch (value) {
    case 1: return "Concise";
    case 2: return "Medium";
    case 3: return "Detailed";
    case 4: return "Comprehensive";
    default: return "Medium";
  }
}

function getToneLabel(value: number): string {
  switch (value) {
    case 1: return "Casual";
    case 2: return "Neutral";
    case 3: return "Professional";
    case 4: return "Formal";
    default: return "Neutral";
  }
}

function getSpecificityLabel(value: number): string {
  switch (value) {
    case 1: return "General";
    case 2: return "Somewhat Specific";
    case 3: return "Detailed";
    case 4: return "Highly Detailed";
    default: return "Detailed";
  }
}

function getCreativityLabel(value: number): string {
  switch (value) {
    case 1: return "Conservative";
    case 2: return "Balanced";
    case 3: return "Creative";
    case 4: return "Highly Creative";
    default: return "Balanced";
  }
}

function getFormalityLabel(value: number): string {
  switch (value) {
    case 1: return "Informal";
    case 2: return "Conversational";
    case 3: return "Business";
    case 4: return "Academic";
    default: return "Conversational";
  }
}

// Mock function for development without API keys
function mockOptimizePrompt(
  originalPrompt: string,
  settings: OptimizationSettings,
  evaluationDetails: EvaluationDetails
) {
  // Generate improvements based on settings
  const improvements = [];
  
  // Add basic improvements
  improvements.push("Added <span class='text-green-600 font-medium'>specific context</span> about the topic/domain");
  
  if (settings.tone >= 3) {
    improvements.push("Enhanced with <span class='text-primary-600 font-medium'>professional tone</span> for formal communication");
  } else {
    improvements.push("Adjusted to a <span class='text-primary-600 font-medium'>conversational tone</span> for better engagement");
  }
  
  if (settings.specificity >= 3) {
    improvements.push("Increased <span class='text-blue-600 font-medium'>specificity</span> with detailed parameters");
  }
  
  if (settings.style?.useHeadings) {
    improvements.push("Added <span class='text-secondary-600 font-medium'>clear section headings</span> for better organization");
  }
  
  if (settings.style?.useBulletPoints) {
    improvements.push("Included <span class='text-secondary-600 font-medium'>bullet points</span> for clearer instructions");
  }
  
  if (settings.style?.useExamples) {
    improvements.push("Added <span class='text-accent-600 font-medium'>concrete examples</span> to clarify expectations");
  }
  
  // Cut down to max 5 improvements
  const finalImprovements = improvements.slice(0, 5);

  // Generate different optimized prompts based on settings
  let optimizedPrompt: string;
  
  // Create structure based on settings
  const headings = settings.style?.useHeadings ? "# " : "";
  const bullets = settings.style?.useBulletPoints ? "- " : "";
  const markdown = settings.style?.useMarkdown;
  
  // Get tone based on settings
  const tone = getToneLabel(settings.tone).toLowerCase();
  const length = getLengthLabel(settings.length).toLowerCase();
  const creativeLevel = settings.creativity && settings.creativity >= 3 ? "creative" : "straightforward";
  
  if (originalPrompt.toLowerCase().includes("customer support")) {
    optimizedPrompt = `${headings}<span class="text-green-600">You are a customer support agent for a software company that specializes in productivity tools.</span> <span class="text-primary-600">You should be ${tone}, ${length}, and helpful in your responses.</span>\n\n${headings}<span class="text-secondary-600">When responding to customers:</span>\n${bullets}<span class="text-secondary-600">Provide step-by-step solutions whenever possible</span>\n${bullets}<span class="text-secondary-600">Use ${creativeLevel} analogies to explain technical concepts</span>\n${bullets}<span class="text-secondary-600">Format key information in an easy-to-read manner</span>\n\n<span class="text-accent-600">If you need more information to solve their issue, politely ask clarifying questions.</span>`;
  } else if (originalPrompt.toLowerCase().includes("data") || originalPrompt.toLowerCase().includes("analysis")) {
    optimizedPrompt = `${headings}<span class="text-green-600">You are a data analysis expert specializing in interpreting complex datasets and creating insightful visualizations.</span> <span class="text-primary-600">Maintain a ${tone} tone and provide ${length} explanations.</span>\n\n${headings}<span class="text-secondary-600">When analyzing data:</span>\n${bullets}<span class="text-secondary-600">Always identify key patterns and outliers</span>\n${bullets}<span class="text-secondary-600">Provide statistical context for findings</span>\n${bullets}<span class="text-secondary-600">Suggest appropriate visualization types</span>\n\n<span class="text-accent-600">If data seems incomplete or potentially misleading, highlight limitations before proceeding with analysis.</span>`;
  } else {
    optimizedPrompt = `${headings}<span class="text-green-600">You are an expert assistant specialized in ${originalPrompt.split(' ').slice(0, 3).join(' ')}.</span> <span class="text-primary-600">Maintain a ${tone} tone and provide ${length} responses that are ${creativeLevel} in nature.</span>\n\n${headings}<span class="text-secondary-600">When responding:</span>\n${bullets}<span class="text-secondary-600">Structure information logically with clear progression</span>\n${bullets}<span class="text-secondary-600">Prioritize accuracy and reliability of information</span>\n${bullets}<span class="text-secondary-600">Use appropriate terminology for ${settings.audience || 'general'} audience</span>\n\n<span class="text-accent-600">If a request is ambiguous, ask clarifying questions before providing a complete response.</span>`;
  }
  
  // Add examples if requested
  if (settings.style?.useExamples) {
    optimizedPrompt += `\n\n${headings}<span class="text-blue-600">Example format:</span>\n\`\`\`\nQuestion: [User question]\nThinking: [Your analysis process - not shown to user]\nResponse: [Your structured response following the guidelines above]\n\`\`\``;
  }
  
  // Calculate predicted score based on settings and original scores
  let baseImprovement = 1.5;
  
  // More advanced settings give better improvements
  if (settings.style?.useMarkdown) baseImprovement += 0.2;
  if (settings.style?.useHeadings) baseImprovement += 0.3;
  if (settings.style?.useBulletPoints) baseImprovement += 0.2;
  if (settings.style?.useExamples) baseImprovement += 0.4;
  if (settings.enhanceClarity) baseImprovement += 0.3;
  if (settings.enhanceSpecificity) baseImprovement += 0.3;
  if (settings.enhanceFocus) baseImprovement += 0.2;
  if (settings.enhanceAiFriendliness) baseImprovement += 0.3;
  
  // Basic settings multiplier
  const settingsMultiplier = (settings.specificity + settings.length) / 4; // 0.5 to 1.5
  const scoreImprovement = baseImprovement * settingsMultiplier;
  
  const lowestOriginalScore = Math.min(
    evaluationDetails.clarity.score,
    evaluationDetails.specificity.score,
    evaluationDetails.focus.score,
    evaluationDetails.aiFriendliness.score
  );
  
  const averageOriginalScore = (
    evaluationDetails.clarity.score +
    evaluationDetails.specificity.score +
    evaluationDetails.focus.score +
    evaluationDetails.aiFriendliness.score
  ) / 4;
  
  // Improvement is more significant for lower scores
  const predictedScoreRaw = averageOriginalScore + (scoreImprovement * (10 - lowestOriginalScore) / 5);
  const predictedScore = Math.min(9.8, predictedScoreRaw); // Cap at 9.8
  
  return {
    optimizedPrompt,
    improvements: finalImprovements,
    score: Number(predictedScore.toFixed(1))
  };
}
