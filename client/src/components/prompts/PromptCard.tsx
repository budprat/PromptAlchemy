import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Prompt } from "@shared/schema";
import { formatRelativeTime } from "@/lib/utils";
import ScoreBadge from "@/components/ui/score-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PromptCardProps = {
  prompt: Prompt;
};

export default function PromptCard({ prompt }: PromptCardProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const handleDuplicate = async () => {
    try {
      setIsPending(true);
      await apiRequest("POST", `/api/prompts/${prompt.id}/duplicate`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({
        title: "Prompt duplicated",
        description: "A copy of the prompt has been created",
      });
    } catch (error) {
      toast({
        title: "Failed to duplicate",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 prompt-card">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-900">{prompt.title}</h3>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-slate-400 hover:text-slate-500">
                  <i className="ri-edit-line"></i>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-slate-400 hover:text-slate-500">
              <i className="ri-more-2-fill"></i>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                <i className="ri-file-copy-line mr-2"></i> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <i className="ri-share-line mr-2"></i> Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <i className="ri-delete-bin-line mr-2"></i> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{prompt.description || prompt.content.substring(0, 100)}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          {prompt.overallScore !== undefined && (
            <ScoreBadge score={prompt.overallScore} />
          )}
          <span className="ml-2 text-slate-500">Updated {formatRelativeTime(prompt.updatedAt)}</span>
        </div>
        
        {prompt.collaborators && prompt.collaborators.length > 0 && (
          <div className="flex -space-x-2">
            {prompt.collaborators.map((collaborator, index) => (
              <div
                key={index}
                className="h-5 w-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[10px] text-slate-600"
                title={collaborator.name}
              >
                {collaborator.name.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
