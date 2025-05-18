import { useState } from "react";
import { useOptimizePrompt } from "@/hooks/use-optimize-prompt";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ScoreBadge from "@/components/ui/score-badge";

type OptimizationSettings = {
  length: number;
  tone: number;
  specificity: number;
};

type PromptOptimizationProps = {
  originalPrompt: string;
  originalScore: number;
  evaluationDetails: {
    clarity: { score: number; feedback: string };
    specificity: { score: number; feedback: string };
    focus: { score: number; feedback: string };
    aiFriendliness: { score: number; feedback: string };
  };
};

export default function PromptOptimization({
  originalPrompt,
  originalScore,
  evaluationDetails,
}: PromptOptimizationProps) {
  const [settings, setSettings] = useState<OptimizationSettings>({
    length: 2, // Medium
    tone: 2, // Professional
    specificity: 3, // High
  });
  
  const { toast } = useToast();
  const { optimize, optimizedPrompt, optimizedScore, isPending, improvements } = useOptimizePrompt();

  const handleOptimize = async () => {
    try {
      await optimize({
        originalPrompt,
        settings,
        evaluationDetails,
      });
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getLengthLabel = (value: number) => {
    switch (value) {
      case 1: return "Concise";
      case 2: return "Medium";
      case 3: return "Detailed";
      default: return "Medium";
    }
  };

  const getToneLabel = (value: number) => {
    switch (value) {
      case 1: return "Casual";
      case 2: return "Professional";
      case 3: return "Formal";
      default: return "Professional";
    }
  };

  const getSpecificityLabel = (value: number) => {
    switch (value) {
      case 1: return "Low";
      case 2: return "Medium";
      case 3: return "High";
      default: return "Medium";
    }
  };

  const renderScoreBar = (score: number, label: string, feedback: string) => (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-1">{label}</h4>
      <div className="flex items-center">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              score < 7 ? "bg-amber-500" : "bg-green-500"
            }`} 
            style={{ width: `${score * 10}%` }}
          ></div>
        </div>
        <span className="ml-2 text-xs font-medium text-slate-700">{score.toFixed(1)}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{feedback}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Original Prompt */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Original Prompt</h3>
          <div className="flex items-center bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-700">
            <span>Quality Score:</span>
            <span className={`ml-1 ${originalScore < 7 ? "text-amber-600" : "text-green-600"}`}>
              {originalScore.toFixed(1)}/10
            </span>
          </div>
        </div>
        
        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 font-mono text-sm mb-4">
          {originalPrompt}
        </div>
        
        <div className="space-y-4">
          {renderScoreBar(
            evaluationDetails.clarity.score,
            "Clarity",
            evaluationDetails.clarity.feedback
          )}
          
          {renderScoreBar(
            evaluationDetails.specificity.score,
            "Specificity",
            evaluationDetails.specificity.feedback
          )}
          
          {renderScoreBar(
            evaluationDetails.focus.score,
            "Focus",
            evaluationDetails.focus.feedback
          )}
          
          {renderScoreBar(
            evaluationDetails.aiFriendliness.score,
            "AI-Friendliness",
            evaluationDetails.aiFriendliness.feedback
          )}
        </div>
      </div>
      
      {/* Optimized Prompt */}
      <div className="relative bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        {/* Comparison Arrow for larger screens */}
        <div className="comparison-arrow hidden lg:block absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"></div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Optimized Prompt</h3>
          {optimizedScore > 0 && (
            <div className="flex items-center bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-700">
              <span>Predicted Score:</span>
              <span className="ml-1">{optimizedScore.toFixed(1)}/10</span>
            </div>
          )}
        </div>
        
        <div className="border border-slate-200 rounded-md p-3 bg-slate-50 font-mono text-sm text-slate-900 mb-4 min-h-[120px]">
          {isPending ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : optimizedPrompt ? (
            <div dangerouslySetInnerHTML={{ __html: optimizedPrompt }} />
          ) : (
            <div className="text-center text-slate-500 py-8">
              Configure optimization settings and click "Generate Optimized Prompt"
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {improvements && improvements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Improvements</h4>
              <ul className="text-xs text-slate-700 space-y-2">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <i className="ri-check-line text-green-500 mt-0.5 mr-2"></i>
                    <span dangerouslySetInnerHTML={{ __html: improvement }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-700">Optimization Controls</h4>
              <button className="text-xs text-primary-600 font-medium">Customize</button>
            </div>
            
            <div className="mt-2 space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-700">Length</label>
                  <span className="text-xs text-slate-500">{getLengthLabel(settings.length)}</span>
                </div>
                <Slider
                  value={[settings.length]}
                  min={1}
                  max={3}
                  step={1}
                  onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-700">Tone</label>
                  <span className="text-xs text-slate-500">{getToneLabel(settings.tone)}</span>
                </div>
                <Slider
                  value={[settings.tone]}
                  min={1}
                  max={3}
                  step={1}
                  onValueChange={(value) => setSettings({ ...settings, tone: value[0] })}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-700">Specificity</label>
                  <span className="text-xs text-slate-500">{getSpecificityLabel(settings.specificity)}</span>
                </div>
                <Slider
                  value={[settings.specificity]}
                  min={1}
                  max={3}
                  step={1}
                  onValueChange={(value) => setSettings({ ...settings, specificity: value[0] })}
                />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleOptimize}
              disabled={isPending}
            >
              <i className="ri-refresh-line mr-1"></i> {optimizedPrompt ? "Regenerate" : "Generate"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!optimizedPrompt || isPending}
            >
              <i className="ri-check-line mr-1"></i> Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
