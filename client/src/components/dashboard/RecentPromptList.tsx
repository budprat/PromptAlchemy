import { Link } from "wouter";
import ScoreBadge from "@/components/ui/score-badge";
import { formatRelativeTime } from "@/lib/utils";
import { type Prompt } from "@shared/schema";

type RecentPromptListProps = {
  prompts: Prompt[];
  className?: string;
};

export default function RecentPromptList({ prompts, className }: RecentPromptListProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 shadow-sm ${className || ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900">Recent Prompts</h2>
        <Link href="/vault" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all
        </Link>
      </div>
      
      <div className="space-y-3">
        {prompts.length > 0 ? (
          prompts.map((prompt) => (
            <div 
              key={prompt.id} 
              className="p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors prompt-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 line-clamp-1">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Modified {formatRelativeTime(prompt.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {prompt.overallScore !== undefined && (
                    <ScoreBadge score={prompt.overallScore} />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-slate-500">
            <p>No prompts yet. Create your first prompt in the Evaluation tab.</p>
          </div>
        )}
      </div>
    </div>
  );
}
