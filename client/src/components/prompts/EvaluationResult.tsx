import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  
  // Calculate overall assessment and improvement suggestions
  const getOverallAssessment = () => {
    if (overallScore >= 8.5) return "Excellent prompt with clear instructions and structure.";
    if (overallScore >= 7) return "Good prompt with solid structure that achieves its purpose.";
    if (overallScore >= 5.5) return "Satisfactory prompt that needs some refinement to be more effective.";
    return "Basic prompt requiring significant improvement for optimal AI response.";
  };
  
  const getStrengths = () => {
    const strengths = [];
    
    if (clarity && clarity.score >= 7.5) {
      strengths.push("Clear and understandable instructions");
    }
    
    if (specificity && specificity.score >= 7.5) {
      strengths.push("Detailed and specific requirements");
    }
    
    if (focus && focus.score >= 7.5) {
      strengths.push("Well-focused on the task at hand");
    }
    
    if (aiFriendliness && aiFriendliness.score >= 7.5) {
      strengths.push("Formatted effectively for AI processing");
    }
    
    return strengths.length > 0 ? strengths : ["No significant strengths identified"];
  };
  
  const getImprovementAreas = () => {
    const improvements = [];
    
    if (clarity && clarity.score < 7) {
      improvements.push({
        area: "Clarity",
        suggestion: "Make your instructions more explicit and eliminate ambiguity"
      });
    }
    
    if (specificity && specificity.score < 7) {
      improvements.push({
        area: "Specificity",
        suggestion: "Add more details about your requirements and expectations"
      });
    }
    
    if (focus && focus.score < 7) {
      improvements.push({
        area: "Focus",
        suggestion: "Streamline your prompt to focus on one primary task"
      });
    }
    
    if (aiFriendliness && aiFriendliness.score < 7) {
      improvements.push({
        area: "AI-Friendliness",
        suggestion: "Structure your prompt with clear sections and formatting"
      });
    }
    
    return improvements.length > 0 ? improvements : [{ area: "General", suggestion: "Your prompt is already strong in all key areas" }];
  };
  
  const getPromptImprovementExamples = () => {
    let suggestions = [];
    
    // Clarity improvements
    if (clarity && clarity.score < 7.5) {
      suggestions.push({
        type: "Clarity",
        original: "Tell me about this topic.",
        improved: "Provide a comprehensive explanation of artificial intelligence, including its definition, history, current applications, and future potential.",
        reasoning: "Specific subject and details about what aspects to cover"
      });
    }
    
    // Specificity improvements
    if (specificity && specificity.score < 7.5) {
      suggestions.push({
        type: "Specificity",
        original: "Write me a business email.",
        improved: "Write a professional email to a potential client introducing our web development services. Include our experience (8+ years), specialization in e-commerce solutions, and request for a 15-minute discovery call next week.",
        reasoning: "Adds context, purpose, key points to include, and desired outcome"
      });
    }
    
    // Focus improvements
    if (focus && focus.score < 7.5) {
      suggestions.push({
        type: "Focus",
        original: "I need help with marketing, sales, product development, and customer support.",
        improved: "Create a 30-day social media marketing plan for our new fitness app launch with specific content themes, posting schedule, and engagement strategies.",
        reasoning: "Narrows down to one specific area with clear objectives"
      });
    }
    
    // AI-Friendliness improvements
    if (aiFriendliness && aiFriendliness.score < 7.5) {
      suggestions.push({
        type: "AI-Friendliness",
        original: "Can you help me with code? I need to do something with data and display it.",
        improved: "# React Data Visualization Component\nCreate a React component that:\n1. Fetches JSON data from this endpoint: [URL]\n2. Parses the data to extract monthly sales figures\n3. Displays the data as a line chart using Chart.js\n4. Includes filters for date range and product category",
        reasoning: "Uses clear formatting, numbered steps, and specific technical requirements"
      });
    }
    
    return suggestions;
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
      
      <Tabs defaultValue="scores" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="mt-4">
          <div className="space-y-4">
            {clarity && renderScoreBar(clarity.score, "Clarity", clarity.feedback)}
            {specificity && renderScoreBar(specificity.score, "Specificity", specificity.feedback)}
            {focus && renderScoreBar(focus.score, "Focus", focus.feedback)}
            {aiFriendliness && renderScoreBar(aiFriendliness.score, "AI-Friendliness", aiFriendliness.feedback)}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment</CardTitle>
              <CardDescription>Comprehensive evaluation of your prompt's quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-2">Summary</h4>
                  <p className="text-sm text-slate-700">{getOverallAssessment()}</p>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {getStrengths().map((strength, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-2">Areas for Improvement</h4>
                  {getImprovementAreas().map((item, idx) => (
                    <div key={idx} className="mb-2">
                      <h5 className="text-sm font-medium text-slate-800">{item.area}:</h5>
                      <p className="text-sm text-slate-700">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="improvements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Strategy</CardTitle>
              <CardDescription>Concrete steps to enhance your prompt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overallScore < 8 ? (
                  <>
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-slate-900 mb-2">Recommended Actions</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        {clarity && clarity.score < 7.5 && (
                          <li className="text-sm text-slate-700">
                            <span className="font-medium">Improve clarity:</span> Eliminate ambiguous language and be specific about what you want.
                          </li>
                        )}
                        
                        {specificity && specificity.score < 7.5 && (
                          <li className="text-sm text-slate-700">
                            <span className="font-medium">Add more details:</span> Include specific requirements, constraints, and examples.
                          </li>
                        )}
                        
                        {focus && focus.score < 7.5 && (
                          <li className="text-sm text-slate-700">
                            <span className="font-medium">Sharpen focus:</span> Limit your prompt to one primary task or goal rather than multiple objectives.
                          </li>
                        )}
                        
                        {aiFriendliness && aiFriendliness.score < 7.5 && (
                          <li className="text-sm text-slate-700">
                            <span className="font-medium">Improve structure:</span> Use formatting (lists, headers, etc.) to organize information logically.
                          </li>
                        )}
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium text-slate-900 mb-2">Framework for Improvement</h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-slate-700">
                        <p><span className="font-medium">Context:</span> Begin with relevant background information</p>
                        <p><span className="font-medium">Objective:</span> Clearly state what you want to achieve</p>
                        <p><span className="font-medium">Parameters:</span> Define specific requirements and constraints</p>
                        <p><span className="font-medium">Format:</span> Indicate how you want the information presented</p>
                        <p><span className="font-medium">Examples:</span> Provide examples of what you're looking for (when helpful)</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <i className="ri-check-line text-xl text-green-600"></i>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Excellent Prompt!</h3>
                    <p className="text-sm text-slate-600">Your prompt is already well-optimized. Minor refinements might still enhance results.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Example Improvements</CardTitle>
              <CardDescription>Before and after examples for better prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getPromptImprovementExamples().length > 0 ? (
                  getPromptImprovementExamples().map((example, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-md overflow-hidden mb-4">
                      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                        <h4 className="font-medium text-slate-900">{example.type} Example</h4>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Original:</h5>
                          <div className="bg-red-50 border border-red-100 rounded p-2 text-sm text-slate-700">
                            {example.original}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Improved:</h5>
                          <div className="bg-green-50 border border-green-100 rounded p-2 text-sm text-slate-700">
                            {example.improved}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Why it's better:</h5>
                          <p className="text-sm text-slate-600">{example.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-600">No improvement examples needed for your high-quality prompt!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2 mt-6">
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