import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PromptOptimization from "@/components/prompts/PromptOptimization";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Prompt } from "@shared/schema";

export default function PromptOptimizationPage() {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const { data: prompts = [], isLoading: isLoadingPrompts } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  const { data: promptDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["/api/prompts", selectedPromptId],
    enabled: !!selectedPromptId,
  });

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Prompt Optimization</h2>

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 mb-4">
          <h3 className="text-lg font-medium text-slate-900">Select a prompt to optimize</h3>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <Select 
              value={selectedPromptId || ""} 
              onValueChange={setSelectedPromptId}
              disabled={isLoadingPrompts || prompts.length === 0}
            >
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Select a prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id.toString()}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <i className="ri-add-line mr-1"></i> New
            </Button>
          </div>
        </div>

        {isLoadingDetails && selectedPromptId ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : promptDetails ? (
          <PromptOptimization 
            originalPrompt={promptDetails.content}
            originalScore={promptDetails.overallScore || 7.2}
            evaluationDetails={{
              clarity: promptDetails.evaluations?.clarity || { score: 6.5, feedback: "Lacks specific details about the type of support and company." },
              specificity: promptDetails.evaluations?.specificity || { score: 6.0, feedback: "Too generic, doesn't specify the approach to take." },
              focus: promptDetails.evaluations?.focus || { score: 8.0, feedback: "Good focus on the core task, but could be more directed." },
              aiFriendliness: promptDetails.evaluations?.aiFriendliness || { score: 8.5, feedback: "Simple and direct, but lacks formatting guidance." },
            }}
          />
        ) : selectedPromptId ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Failed to load prompt details</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn't load the details for this prompt. Please try again or select a different prompt.
            </p>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <i className="ri-magic-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Select a prompt to optimize</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Choose from your existing prompts or create a new one to start the optimization process.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
