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
    
    // Additional settings
    const creativityLabel = getCreativityLabel(settings.creativity || 2);
    const formalityLabel = getFormalityLabel(settings.formality || 2);
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
  const improvements = [
    "Added <span class='text-green-600 font-medium'>specific context</span> about the company's focus",
    "Defined <span class='text-primary-600 font-medium'>tone and style</span> for responses",
    "Included <span class='text-secondary-600 font-medium'>specific instructions</span> for response format",
    "Added <span class='text-accent-600 font-medium'>fallback strategy</span> for incomplete information"
  ];

  let optimizedPrompt: string;
  
  if (originalPrompt.includes("customer support")) {
    optimizedPrompt = `<span class="text-green-600">You are a customer support agent for a software company that specializes in productivity tools.</span> <span class="text-primary-600">You should be helpful, concise, and friendly.</span> <span class="text-secondary-600">When users ask questions, try to provide step-by-step solutions when possible.</span> <span class="text-accent-600">If you need more information to solve their issue, politely ask clarifying questions.</span>`;
  } else {
    optimizedPrompt = `<span class="text-green-600">You are an expert assistant specialized in ${originalPrompt.split(' ').slice(3, 6).join(' ')}.</span> <span class="text-primary-600">Maintain a ${getToneLabel(settings.tone).toLowerCase()} tone and be ${settings.specificity >= 2 ? 'detailed' : 'concise'} in your responses.</span> <span class="text-secondary-600">Structure your responses with clear headings and bullet points when appropriate.</span> <span class="text-accent-600">If the user's request is ambiguous, ask for clarification before proceeding.</span>`;
  }
  
  // Calculate predicted score based on settings and original scores
  const baseImprovement = 1.5;
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
    improvements,
    score: Number(predictedScore.toFixed(1))
  };
}
