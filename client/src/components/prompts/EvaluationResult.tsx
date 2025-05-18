import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type EvaluationResultProps = {
  title: string;
  content: string;
  modelId: string;
  overallScore: number;
  clarity?: { score: number; feedback: string };
  specificity?: { score: number; feedback: string };
  focus?: { score: number; feedback: string };
  aiFriendliness?: { score: number; feedback: string };
};

export default function EvaluationResult({
  title,
  content,
  modelId,
  overallScore,
  clarity,
  specificity,
  focus,
  aiFriendliness
}: EvaluationResultProps) {
  const { toast } = useToast();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Function to render score bars
  const renderScoreBar = (score: number | undefined, label: string, feedback: string | undefined) => {
    if (score === undefined) return null;
    
    const scorePercent = score * 10;
    const scoreColorClass = 
      score >= 8 ? "bg-green-500" : 
      score >= 6 ? "bg-yellow-500" : 
      "bg-red-500";
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm font-medium text-slate-700">{score.toFixed(1)}/10</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${scoreColorClass}`} 
            style={{ width: `${scorePercent}%` }}
          ></div>
        </div>
        {feedback && (
          <p className="text-sm text-slate-600 mt-1">{feedback}</p>
        )}
      </div>
    );
  };

  // Create exportable JSON
  const getExportData = () => {
    return {
      title,
      content,
      modelId,
      evaluation: {
        overallScore,
        clarity,
        specificity,
        focus,
        aiFriendliness
      },
      exportedAt: new Date().toISOString()
    };
  };

  // Export as JSON file
  const handleExportJSON = () => {
    const exportData = getExportData();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-evaluation.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Evaluation results have been exported as JSON."
    });
  };

  // Copy to clipboard as markdown
  const handleCopyAsMarkdown = () => {
    const exportData = getExportData();
    const markdown = `
# Prompt Evaluation: ${title}

## Prompt Content
\`\`\`
${content}
\`\`\`

## Evaluation Results
- **Overall Score**: ${overallScore.toFixed(1)}/10
- **Model**: ${modelId}
${clarity ? `- **Clarity**: ${clarity.score.toFixed(1)}/10 - ${clarity.feedback}` : ''}
${specificity ? `- **Specificity**: ${specificity.score.toFixed(1)}/10 - ${specificity.feedback}` : ''}
${focus ? `- **Focus**: ${focus.score.toFixed(1)}/10 - ${focus.feedback}` : ''}
${aiFriendliness ? `- **AI-Friendliness**: ${aiFriendliness.score.toFixed(1)}/10 - ${aiFriendliness.feedback}` : ''}

*Evaluated on ${new Date().toLocaleDateString()} using PromptAlchemy*
    `;

    navigator.clipboard.writeText(markdown);
    
    toast({
      title: "Copied to clipboard",
      description: "Evaluation results have been copied as markdown format."
    });
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            overallScore >= 8 ? "bg-green-100 text-green-800" :
            overallScore >= 6 ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            Score: {overallScore.toFixed(1)}/10
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm">
        {content}
      </div>

      <div className="space-y-4 mb-4">
        {clarity && renderScoreBar(clarity.score, "Clarity", clarity.feedback)}
        {specificity && renderScoreBar(specificity.score, "Specificity", specificity.feedback)}
        {focus && renderScoreBar(focus.score, "Focus", focus.feedback)}
        {aiFriendliness && renderScoreBar(aiFriendliness.score, "AI-Friendliness", aiFriendliness.feedback)}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          className="flex items-center"
        >
          <i className="ri-download-line mr-1.5"></i>
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAsMarkdown}
          className="flex items-center"
        >
          <i className="ri-clipboard-line mr-1.5"></i>
          Copy as Markdown
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsShareDialogOpen(true)}
          className="flex items-center"
        >
          <i className="ri-share-line mr-1.5"></i>
          Share
        </Button>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Evaluation Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Share your evaluation results with your team members:
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => {
                  const url = `${window.location.origin}/prompt-evaluation/share?id=${encodeURIComponent(title)}`;
                  navigator.clipboard.writeText(url);
                  toast({
                    title: "Link copied",
                    description: "Shareable link has been copied to clipboard."
                  });
                }}
                className="flex items-center justify-center"
              >
                <i className="ri-link mr-1.5"></i>
                Copy Shareable Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const emailSubject = `Prompt Evaluation: ${title}`;
                  const emailBody = `Check out my prompt evaluation:\n\nTitle: ${title}\nOverall Score: ${overallScore.toFixed(1)}/10\n\nView the full results here: ${window.location.origin}/prompt-evaluation`;
                  window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                }}
                className="flex items-center justify-center"
              >
                <i className="ri-mail-line mr-1.5"></i>
                Share via Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}