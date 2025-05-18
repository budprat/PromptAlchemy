import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "mock-key-for-development" });

type EvaluationParams = {
  promptId: string;
  userId: string;
  title: string;
  content: string;
  modelId: string;
  evaluateClarity?: boolean;
  evaluateSpecificity?: boolean;
  evaluateFocus?: boolean;
  evaluateAiFriendliness?: boolean;
};

export async function evaluate(params: EvaluationParams) {
  // In development without API keys, return mock data
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock-key-for-development") {
    return mockEvaluate(params);
  }

  try {
    const dimensions = [];
    if (params.evaluateClarity !== false) dimensions.push("clarity");
    if (params.evaluateSpecificity !== false) dimensions.push("specificity");
    if (params.evaluateFocus !== false) dimensions.push("focus");
    if (params.evaluateAiFriendliness !== false) dimensions.push("aiFriendliness");

    const prompt = `
      You are PromptAlchemy, a specialized AI prompt evaluation assistant. I'll provide you with a prompt that will be used with AI models like GPT-4, and I need you to evaluate its quality.

      Prompt to evaluate:
      """
      ${params.content}
      """

      Please evaluate this prompt on the following dimensions (score from 1-10 with 10 being best):
      ${dimensions.includes("clarity") ? "- Clarity: How clear and unambiguous is the prompt?" : ""}
      ${dimensions.includes("specificity") ? "- Specificity: How specific and detailed are the instructions?" : ""}
      ${dimensions.includes("focus") ? "- Focus: How well does the prompt maintain focus on a single task or goal?" : ""}
      ${dimensions.includes("aiFriendliness") ? "- AI-Friendliness: How well is the prompt formatted for AI comprehension?" : ""}

      For each dimension, provide:
      1. A numerical score (1-10)
      2. Brief constructive feedback (1-2 sentences)
      3. An overall score that averages all dimensions

      Format your response as a JSON object:
      {
        ${dimensions.includes("clarity") ? `"clarity": { "score": number, "feedback": "string" },` : ""}
        ${dimensions.includes("specificity") ? `"specificity": { "score": number, "feedback": "string" },` : ""}
        ${dimensions.includes("focus") ? `"focus": { "score": number, "feedback": "string" },` : ""}
        ${dimensions.includes("aiFriendliness") ? `"aiFriendliness": { "score": number, "feedback": "string" },` : ""}
        "overallScore": number
      }
    `;

    const response = await openai.chat.completions.create({
      model: params.modelId || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const evaluationResult = JSON.parse(response.choices[0].message.content);

    // Store the evaluation in the database
    const evaluation = await storage.createEvaluation({
      promptId: params.promptId,
      userId: params.userId,
      modelId: params.modelId,
      overallScore: evaluationResult.overallScore,
      clarityScore: evaluationResult.clarity?.score,
      clarityFeedback: evaluationResult.clarity?.feedback,
      specificityScore: evaluationResult.specificity?.score,
      specificityFeedback: evaluationResult.specificity?.feedback,
      focusScore: evaluationResult.focus?.score,
      focusFeedback: evaluationResult.focus?.feedback,
      aiFriendlinessScore: evaluationResult.aiFriendliness?.score,
      aiFriendlinessFeedback: evaluationResult.aiFriendliness?.feedback,
    });

    return evaluationResult;
  } catch (error) {
    console.error("Error evaluating prompt with OpenAI:", error);
    throw new Error("Failed to evaluate prompt");
  }
}

// Mock function for development without API keys
function mockEvaluate(params: EvaluationParams) {
  const isCustomerSupportPrompt = params.content.toLowerCase().includes("customer support");
  
  const clarity = {
    score: isCustomerSupportPrompt ? 8.5 : 6.5,
    feedback: isCustomerSupportPrompt 
      ? "The prompt clearly defines the role and provides good context."
      : "Lacks specific details about the nature of the task and expected output."
  };
  
  const specificity = {
    score: isCustomerSupportPrompt ? 7.5 : 6.0,
    feedback: isCustomerSupportPrompt 
      ? "Could provide more specific examples of the types of questions to expect."
      : "Too generic, doesn't specify the approach to take."
  };
  
  const focus = {
    score: isCustomerSupportPrompt ? 8.0 : 8.0,
    feedback: isCustomerSupportPrompt 
      ? "Good focus on the customer support task."
      : "Good focus on the core task, but could be more directed."
  };
  
  const aiFriendliness = {
    score: isCustomerSupportPrompt ? 9.2 : 8.5,
    feedback: isCustomerSupportPrompt 
      ? "Well-structured for AI processing with clear role definition."
      : "Simple and direct, but lacks formatting guidance."
  };
  
  const result: any = { overallScore: 0 };
  let dimensionCount = 0;
  
  if (params.evaluateClarity !== false) {
    result.clarity = clarity;
    result.overallScore += clarity.score;
    dimensionCount++;
  }
  
  if (params.evaluateSpecificity !== false) {
    result.specificity = specificity;
    result.overallScore += specificity.score;
    dimensionCount++;
  }
  
  if (params.evaluateFocus !== false) {
    result.focus = focus;
    result.overallScore += focus.score;
    dimensionCount++;
  }
  
  if (params.evaluateAiFriendliness !== false) {
    result.aiFriendliness = aiFriendliness;
    result.overallScore += aiFriendliness.score;
    dimensionCount++;
  }
  
  result.overallScore = dimensionCount > 0 
    ? parseFloat((result.overallScore / dimensionCount).toFixed(1)) 
    : 7.0;
  
  // Store the mock evaluation in the database
  storage.createEvaluation({
    promptId: params.promptId,
    userId: params.userId,
    modelId: params.modelId,
    overallScore: result.overallScore,
    clarityScore: result.clarity?.score,
    clarityFeedback: result.clarity?.feedback,
    specificityScore: result.specificity?.score,
    specificityFeedback: result.specificity?.feedback,
    focusScore: result.focus?.score,
    focusFeedback: result.focus?.feedback,
    aiFriendlinessScore: result.aiFriendliness?.score,
    aiFriendlinessFeedback: result.aiFriendliness?.feedback,
  });
  
  return result;
}
