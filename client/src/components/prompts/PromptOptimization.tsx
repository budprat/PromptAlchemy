import { useState, useEffect } from "react";
import { useOptimizePrompt } from "@/hooks/use-optimize-prompt";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdvancedOptimizationControls, { 
  AdvancedOptimizationSettings 
} from "./AdvancedOptimizationControls";
import OptimizedPromptDisplay from "./OptimizedPromptDisplay";

type PromptOptimizationProps = {
  originalPrompt: string;
  originalScore: number;
  evaluationDetails: {
    clarity: { score: number; feedback: string };
    specificity: { score: number; feedback: string };
    focus: { score: number; feedback: string };
    aiFriendliness: { score: number; feedback: string };
  };
  onApplyChanges?: (optimizedPrompt: string) => void;
};

// Default settings for the optimization
const defaultSettings: AdvancedOptimizationSettings = {
  length: 2,
  tone: 2,
  specificity: 3,
  creativity: 2,
  audience: "general",
  formality: 2,
  purpose: "information",
  structure: "narrative",
  enhanceClarity: true,
  enhanceSpecificity: true,
  enhanceFocus: true,
  enhanceAiFriendliness: true,
  style: {
    useMarkdown: true,
    useBulletPoints: true,
    useHeadings: true,
    useExamples: false,
    includeContext: true,
  },
};

export default function PromptOptimization({
  originalPrompt,
  originalScore,
  evaluationDetails,
  onApplyChanges
}: PromptOptimizationProps) {
  // State for optimization settings
  const [settings, setSettings] = useState<AdvancedOptimizationSettings>(defaultSettings);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  // Hooks
  const { toast } = useToast();
  const { 
    optimize, 
    optimizedPrompt, 
    optimizedScore, 
    isPending, 
    improvements 
  } = useOptimizePrompt();

  // Auto-adapt settings based on evaluation scores
  useEffect(() => {
    const newSettings = { ...settings };
    
    // If clarity is low, boost related settings
    if (evaluationDetails.clarity.score < 7) {
      newSettings.enhanceClarity = true;
      newSettings.style.useHeadings = true;
    }
    
    // If specificity is low, adjust specificity settings
    if (evaluationDetails.specificity.score < 7) {
      newSettings.specificity = 3;
      newSettings.enhanceSpecificity = true;
      newSettings.style.useExamples = true;
    }
    
    // If focus is low, adjust structure
    if (evaluationDetails.focus.score < 7) {
      newSettings.enhanceFocus = true;
      newSettings.structure = "hierarchical";
    }
    
    // If AI-friendliness is low, adjust formatting
    if (evaluationDetails.aiFriendliness.score < 7) {
      newSettings.enhanceAiFriendliness = true;
      newSettings.style.useMarkdown = true;
      newSettings.style.useBulletPoints = true;
    }
    
    setSettings(newSettings);
  }, [evaluationDetails]);

  // Handler for optimization
  const handleOptimize = async () => {
    try {
      await optimize({
        originalPrompt,
        settings: {
          length: settings.length,
          tone: settings.tone,
          specificity: settings.specificity,
          // Add the additional settings for the backend
          creativity: settings.creativity,
          audience: settings.audience,
          formality: settings.formality,
          purpose: settings.purpose,
          structure: settings.structure,
          enhanceClarity: settings.enhanceClarity,
          enhanceSpecificity: settings.enhanceSpecificity,
          enhanceFocus: settings.enhanceFocus,
          enhanceAiFriendliness: settings.enhanceAiFriendliness,
          style: settings.style
        },
        evaluationDetails,
      });
      
      // Close studio after optimization if it's open
      if (isStudioOpen) {
        setIsStudioOpen(false);
      }
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Handler for applying changes
  const handleApplyChanges = () => {
    if (optimizedPrompt && onApplyChanges) {
      onApplyChanges(optimizedPrompt);
      toast({
        title: "Changes applied",
        description: "The optimized prompt has been applied.",
      });
    }
  };

  // Handler for resetting settings
  const handleResetSettings = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "Optimization settings have been reset to defaults.",
    });
  };

  // Render score bar for evaluation metrics
  const renderScoreBar = (score: number, label: string, feedback: string) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-slate-700">{label}</h4>
        <Badge 
          variant="outline" 
          className={`${
            score >= 8 ? "border-green-200 bg-green-50 text-green-700" :
            score >= 6 ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
            "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {score.toFixed(1)}/10
        </Badge>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
        <div 
          className={`h-2 rounded-full ${
            score >= 8 ? "bg-green-500" : 
            score >= 6 ? "bg-yellow-500" : 
            "bg-red-500"
          }`} 
          style={{ width: `${score * 10}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>
      <p className="text-xs text-slate-500">{feedback}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Prompt Optimization Studio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enhance your prompts for better AI responses with advanced style and tone controls
          </p>
        </div>
        
        <Dialog open={isStudioOpen} onOpenChange={setIsStudioOpen}>
          <DialogTrigger asChild>
            <Button className="h-10">
              <i className="ri-tools-line mr-1.5"></i> Advanced Studio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Advanced Optimization Studio</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AdvancedOptimizationControls
                settings={settings}
                onSettingsChange={setSettings}
                onOptimize={handleOptimize}
                onReset={handleResetSettings}
                isOptimizing={isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Prompt */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Original Prompt</h3>
            <div className="flex items-center bg-slate-100 px-2.5 py-1 rounded text-xs font-medium text-slate-700">
              <span className="mr-1">Quality Score:</span>
              <span className={`${originalScore < 7 ? "text-amber-600" : "text-green-600"}`}>
                {originalScore.toFixed(1)}/10
              </span>
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-md p-3 bg-slate-50 font-mono text-sm mb-4 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
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
            
            <div className="pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleOptimize} 
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-1.5"></i> Optimizing...
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line mr-1.5"></i> Quick Optimize
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Optimized Prompt Display */}
        <div className="relative">
          {/* Comparison Arrow for larger screens */}
          <div className="comparison-arrow hidden lg:block absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"></div>
          
          <OptimizedPromptDisplay
            originalPrompt={originalPrompt}
            optimizedPrompt={optimizedPrompt}
            originalScore={originalScore}
            optimizedScore={optimizedScore}
            improvements={improvements}
            isOptimizing={isPending}
            onApplyChanges={handleApplyChanges}
            onRegenerate={handleOptimize}
          />
        </div>
      </div>
      
      {/* Mini Controls (visible only when studio is not open) */}
      {!isStudioOpen && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Quick Controls</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsStudioOpen(true)}
            >
              <i className="ri-settings-line mr-1.5"></i> Advanced Settings
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Length Control */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-primary-50 rounded-md">
                  <i className="ri-text-spacing text-primary-600"></i>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Length</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">Concise</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSettings({ ...settings, length: value })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            settings.length === value
                              ? "bg-primary-600 text-white"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">Detailed</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tone Control */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <i className="ri-emotion-line text-blue-600"></i>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Tone</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">Casual</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSettings({ ...settings, tone: value })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            settings.tone === value
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">Formal</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Creativity Control */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-50 rounded-md">
                  <i className="ri-palette-line text-purple-600"></i>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Creativity</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">Conservative</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSettings({ ...settings, creativity: value })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            settings.creativity === value
                              ? "bg-purple-600 text-white"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">Creative</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={handleOptimize} disabled={isPending}>
              {isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1.5"></i> Optimizing...
                </>
              ) : (
                <>
                  <i className="ri-magic-line mr-1.5"></i> Optimize Prompt
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
