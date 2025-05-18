import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type OptimizePromptParams = {
  originalPrompt: string;
  settings: {
    length: number;
    tone: number;
    specificity: number;
  };
  evaluationDetails: {
    clarity: { score: number; feedback: string };
    specificity: { score: number; feedback: string };
    focus: { score: number; feedback: string };
    aiFriendliness: { score: number; feedback: string };
  };
};

type OptimizationResult = {
  optimizedPrompt: string;
  score: number;
  improvements: string[];
};

export function useOptimizePrompt() {
  const [isPending, setIsPending] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);
  const [optimizedScore, setOptimizedScore] = useState(0);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const optimize = async (params: OptimizePromptParams) => {
    try {
      setIsPending(true);
      setError(null);

      const response = await apiRequest("POST", "/api/optimize", params);
      const result: OptimizationResult = await response.json();

      setOptimizedPrompt(result.optimizedPrompt);
      setOptimizedScore(result.score);
      setImprovements(result.improvements);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to optimize prompt"));
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    optimize,
    optimizedPrompt,
    optimizedScore,
    improvements,
    isPending,
    error,
  };
}
