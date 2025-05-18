import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type OptimizedPromptDisplayProps = {
  originalPrompt: string;
  optimizedPrompt: string | null;
  originalScore: number;
  optimizedScore: number | null;
  improvements: string[] | null;
  isOptimizing: boolean;
  onApplyChanges: () => void;
  onRegenerate: () => void;
};

const formatPromptWithHighlights = (prompt: string): string => {
  // Add syntax highlighting to markdown headings, lists, and code blocks
  return prompt
    .replace(/^(#{1,6}\s.*$)/gm, '<span class="text-primary-600 font-semibold">$1</span>') // Headings
    .replace(/^(\s*[-*+]\s.*$)/gm, '<span class="text-green-600">$1</span>') // Lists
    .replace(/^(\s*\d+\.\s.*$)/gm, '<span class="text-blue-600">$1</span>') // Numbered lists
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-pink-600">$1</code>') // Inline code
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-blue-500 underline">$1</a>'); // URLs
};

export default function OptimizedPromptDisplay({
  originalPrompt,
  optimizedPrompt,
  originalScore,
  optimizedScore,
  improvements,
  isOptimizing,
  onApplyChanges,
  onRegenerate,
}: OptimizedPromptDisplayProps) {
  const [activeView, setActiveView] = useState<"output" | "diff" | "side-by-side">("output");
  const { toast } = useToast();
  
  const handleCopyToClipboard = () => {
    if (optimizedPrompt) {
      navigator.clipboard.writeText(optimizedPrompt);
      toast({
        title: "Copied to clipboard",
        description: "The optimized prompt has been copied to your clipboard.",
      });
    }
  };

  const renderScoreChange = () => {
    if (!optimizedScore || !originalScore) return null;
    
    const scoreDiff = optimizedScore - originalScore;
    const percentImprovement = ((scoreDiff / originalScore) * 100).toFixed(1);
    
    return (
      <div className="flex items-center">
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
          scoreDiff > 0 
            ? "bg-green-50 text-green-700" 
            : scoreDiff < 0 
              ? "bg-red-50 text-red-700" 
              : "bg-slate-50 text-slate-700"
        }`}>
          {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)} ({scoreDiff > 0 ? "+" : ""}{percentImprovement}%)
        </div>
      </div>
    );
  };
  
  const renderLoadingState = () => (
    <div className="animate-pulse space-y-4 py-6">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
      </div>
    </div>
  );

  const renderDiffView = () => {
    if (!optimizedPrompt) return null;
    
    // Very simple diff highlighting - this would be better with a real diff library in production
    const originalLines = originalPrompt.split("\n");
    const optimizedLines = optimizedPrompt.split("\n");
    
    // Find additions (lines in optimized not in original)
    const addedLines = optimizedLines.filter(line => !originalLines.includes(line));
    
    // Find removals (lines in original not in optimized)
    const removedLines = originalLines.filter(line => !optimizedLines.includes(line));
    
    // Highlight the changes in the optimized prompt
    const diffHighlightedContent = optimizedLines.map(line => {
      if (addedLines.includes(line)) {
        return `<div class="bg-green-100 px-2 py-0.5 border-l-2 border-green-500">${line}</div>`;
      }
      return line;
    }).join("\n");
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Changes Summary</h4>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 inline-flex items-center justify-center bg-green-100 text-green-700 rounded-full">+</span>
              <span>Added {addedLines.length} lines</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 inline-flex items-center justify-center bg-red-100 text-red-700 rounded-full">-</span>
              <span>Removed {removedLines.length} lines</span>
            </div>
          </div>
        </div>
        
        <div 
          className="font-mono text-sm text-slate-800 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: diffHighlightedContent }}
        />
      </div>
    );
  };

  const renderSideBySideView = () => {
    if (!optimizedPrompt) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">Original</div>
          <div className="border border-slate-200 rounded p-3 bg-slate-50 font-mono text-sm whitespace-pre-wrap h-[300px] overflow-y-auto">
            {originalPrompt}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">Optimized</div>
          <div className="border border-green-100 rounded p-3 bg-green-50 font-mono text-sm whitespace-pre-wrap h-[300px] overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: formatPromptWithHighlights(optimizedPrompt) }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">Optimized Prompt</h3>
        <div className="flex items-center gap-2">
          {optimizedScore && (
            <div className="flex items-center bg-green-100 px-2.5 py-1 rounded text-xs font-medium text-green-700">
              <span className="mr-1">Score:</span>
              <span>{optimizedScore.toFixed(1)}/10</span>
            </div>
          )}
          {optimizedScore && originalScore && renderScoreChange()}
        </div>
      </div>
      
      {optimizedPrompt && (
        <div className="mb-4">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="output" className="text-xs">
                <i className="ri-edit-line mr-1.5"></i> Output
              </TabsTrigger>
              <TabsTrigger value="diff" className="text-xs">
                <i className="ri-git-merge-line mr-1.5"></i> Changes
              </TabsTrigger>
              <TabsTrigger value="side-by-side" className="text-xs">
                <i className="ri-layout-column-line mr-1.5"></i> Compare
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="output" className="min-h-[200px] max-h-[400px] overflow-y-auto">
              <div 
                className="border border-slate-200 rounded-md p-3 bg-slate-50 font-mono text-sm whitespace-pre-wrap" 
                dangerouslySetInnerHTML={{ __html: formatPromptWithHighlights(optimizedPrompt) }}
              />
            </TabsContent>
            
            <TabsContent value="diff" className="min-h-[200px] max-h-[400px] overflow-y-auto">
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
                {renderDiffView()}
              </div>
            </TabsContent>
            
            <TabsContent value="side-by-side" className="min-h-[200px]">
              {renderSideBySideView()}
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {!optimizedPrompt && !isOptimizing && (
        <div className="border border-slate-200 rounded-md p-6 bg-slate-50 text-center text-slate-500 min-h-[200px] flex flex-col items-center justify-center">
          <i className="ri-magic-line text-3xl mb-2 text-slate-400"></i>
          <p>Configure optimization settings and click "Optimize Prompt" to generate an enhanced version</p>
        </div>
      )}
      
      {isOptimizing && (
        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 min-h-[200px]">
          {renderLoadingState()}
        </div>
      )}
      
      {improvements && improvements.length > 0 && (
        <div className="my-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Key Improvements</h4>
          <ul className="space-y-1">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-green-500 mr-2">
                  <i className="ri-check-line mt-0.5"></i>
                </span>
                <span dangerouslySetInnerHTML={{ __html: improvement }} />
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyToClipboard} 
                disabled={!optimizedPrompt || isOptimizing}
              >
                <i className="ri-clipboard-line mr-1.5"></i> Copy
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy optimized prompt to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRegenerate} 
          disabled={!optimizedPrompt || isOptimizing}
          className="flex-1"
        >
          <i className="ri-refresh-line mr-1.5"></i> Regenerate
        </Button>
        
        <Button 
          size="sm"
          onClick={onApplyChanges} 
          disabled={!optimizedPrompt || isOptimizing}
          className="flex-1"
        >
          <i className="ri-check-line mr-1.5"></i> Apply Changes
        </Button>
      </div>
    </div>
  );
}