import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

type EvaluatePromptParams = {
  title: string;
  content: string;
  modelId: string;
  evaluateClarity: boolean;
  evaluateSpecificity: boolean;
  evaluateFocus: boolean;
  evaluateAiFriendliness: boolean;
};

type EvaluationResult = {
  id: string;
  promptId: string;
  overallScore: number;
  clarity?: { score: number; feedback: string };
  specificity?: { score: number; feedback: string };
  focus?: { score: number; feedback: string };
  aiFriendliness?: { score: number; feedback: string };
};

export function useEvaluatePrompt() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const evaluate = async (params: EvaluatePromptParams) => {
    try {
      setIsPending(true);
      setError(null);

      const response = await apiRequest("POST", "/api/evaluate", params);
      const evaluationResult: EvaluationResult = await response.json();

      setResult(evaluationResult);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prompts/recent"] });
      
      return evaluationResult;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to evaluate prompt"));
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    evaluate,
    result,
    isPending,
    error,
  };
}
