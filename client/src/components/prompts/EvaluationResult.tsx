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
    <div className="border border-slate-200 rounded-lg bg-white p-5 shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-start">
          <div className="bg-primary-50 p-2 rounded-lg mr-3">
            <i className="ri-magic-line text-xl text-primary-600"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Evaluated with {modelId}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-3 text-right">
            <span className="text-xs text-slate-500 block">Quality Score</span>
            <span className="text-xl font-bold block">{overallScore.toFixed(1)}</span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold ${
            overallScore >= 8 ? "bg-gradient-to-br from-green-400 to-green-600" :
            overallScore >= 6 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
            "bg-gradient-to-br from-red-400 to-red-600"
          }`}>
            {Math.round((overallScore / 10) * 100)}%
          </div>
        </div>
      </div>

      <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm relative overflow-hidden group">
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 flex items-center justify-center"
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast({
                title: "Copied",
                description: "Prompt copied to clipboard"
              });
            }}
          >
            <i className="ri-file-copy-line text-slate-500 hover:text-slate-700"></i>
          </Button>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {content}
        </div>
      </div>
      
      <Tabs defaultValue="scores" className="mt-6">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="scores" className="flex items-center gap-1.5">
            <i className="ri-bar-chart-2-line"></i> <span>Scores</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-1.5">
            <i className="ri-microscope-line"></i> <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="improvements" className="flex items-center gap-1.5">
            <i className="ri-tools-line"></i> <span>Improvements</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-1.5">
            <i className="ri-file-list-3-line"></i> <span>Examples</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="mt-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clarity && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-yellow-50 p-2 rounded-md mr-3">
                      <i className="ri-lightbulb-line text-yellow-600"></i>
                    </div>
                    <h4 className="font-medium text-slate-900">Clarity</h4>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                    clarity.score >= 8 ? "bg-green-100 text-green-800" :
                    clarity.score >= 6 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {clarity.score.toFixed(1)}/10
                  </div>
                </div>
                <div className="mb-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        clarity.score >= 8 ? "bg-green-500" : 
                        clarity.score >= 6 ? "bg-yellow-500" : 
                        "bg-red-500"
                      }`} 
                      style={{ width: `${clarity.score * 10}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">{clarity.feedback}</p>
              </div>
            )}

            {specificity && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-md mr-3">
                      <i className="ri-focus-3-line text-blue-600"></i>
                    </div>
                    <h4 className="font-medium text-slate-900">Specificity</h4>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                    specificity.score >= 8 ? "bg-green-100 text-green-800" :
                    specificity.score >= 6 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {specificity.score.toFixed(1)}/10
                  </div>
                </div>
                <div className="mb-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        specificity.score >= 8 ? "bg-green-500" : 
                        specificity.score >= 6 ? "bg-yellow-500" : 
                        "bg-red-500"
                      }`} 
                      style={{ width: `${specificity.score * 10}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">{specificity.feedback}</p>
              </div>
            )}

            {focus && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-red-50 p-2 rounded-md mr-3">
                      <i className="ri-target-line text-red-600"></i>
                    </div>
                    <h4 className="font-medium text-slate-900">Focus</h4>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                    focus.score >= 8 ? "bg-green-100 text-green-800" :
                    focus.score >= 6 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {focus.score.toFixed(1)}/10
                  </div>
                </div>
                <div className="mb-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        focus.score >= 8 ? "bg-green-500" : 
                        focus.score >= 6 ? "bg-yellow-500" : 
                        "bg-red-500"
                      }`} 
                      style={{ width: `${focus.score * 10}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">{focus.feedback}</p>
              </div>
            )}

            {aiFriendliness && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-2 rounded-md mr-3">
                      <i className="ri-robot-line text-green-600"></i>
                    </div>
                    <h4 className="font-medium text-slate-900">AI-Friendliness</h4>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                    aiFriendliness.score >= 8 ? "bg-green-100 text-green-800" :
                    aiFriendliness.score >= 6 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {aiFriendliness.score.toFixed(1)}/10
                  </div>
                </div>
                <div className="mb-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        aiFriendliness.score >= 8 ? "bg-green-500" : 
                        aiFriendliness.score >= 6 ? "bg-yellow-500" : 
                        "bg-red-500"
                      }`} 
                      style={{ width: `${aiFriendliness.score * 10}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">{aiFriendliness.feedback}</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-primary-50 p-2 rounded-lg">
                <i className="ri-bubble-chart-line text-xl text-primary-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Overall Assessment</h3>
                <p className="text-sm text-slate-500">Comprehensive evaluation of your prompt quality</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary with score visualization */}
              <div className="md:col-span-1 bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="text-center mb-6">
                  <div className="inline-block mb-4">
                    <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                      overallScore >= 8 ? "bg-green-50" : 
                      overallScore >= 6 ? "bg-yellow-50" : 
                      "bg-red-50"
                    }`}>
                      <svg className="w-32 h-32 absolute top-0 left-0">
                        <circle 
                          cx="64" cy="64" r="56" 
                          fill="none" 
                          stroke="#e2e8f0" 
                          strokeWidth="8" 
                        />
                        <circle 
                          cx="64" cy="64" r="56" 
                          fill="none" 
                          stroke={
                            overallScore >= 8 ? "#22c55e" : 
                            overallScore >= 6 ? "#eab308" : 
                            "#ef4444"
                          }
                          strokeWidth="8"
                          strokeDasharray="351.86"
                          strokeDashoffset={351.86 - (351.86 * (overallScore / 10))}
                          strokeLinecap="round"
                          transform="rotate(-90 64 64)"
                          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                      </svg>
                      <div className="text-center">
                        <span className="block text-3xl font-bold">
                          {overallScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">out of 10</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-800">
                    {overallScore >= 8.5 ? "Excellent" : 
                    overallScore >= 7 ? "Good" : 
                    overallScore >= 5.5 ? "Satisfactory" : 
                    "Needs Work"}
                  </h4>
                </div>
                <p className="text-sm text-slate-700">{getOverallAssessment()}</p>
              </div>
              
              {/* Strengths and improvements */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-white p-1.5 rounded">
                      <i className="ri-check-double-line text-green-600"></i>
                    </div>
                    <h4 className="font-semibold text-green-800">Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {getStrengths().map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-line text-green-600 mt-0.5"></i>
                        <span className="text-sm text-slate-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`${
                  getImprovementAreas()[0].area === "General" ? 
                  "bg-slate-50 border-slate-200" : 
                  "bg-amber-50 border-amber-100"
                } rounded-xl p-5 border`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-white p-1.5 rounded">
                      <i className={`${
                        getImprovementAreas()[0].area === "General" ? 
                        "ri-lightbulb-line text-slate-600" : 
                        "ri-error-warning-line text-amber-600"
                      }`}></i>
                    </div>
                    <h4 className={`font-semibold ${
                      getImprovementAreas()[0].area === "General" ? 
                      "text-slate-800" : 
                      "text-amber-800"
                    }`}>
                      {getImprovementAreas()[0].area === "General" ? 
                        "Already Optimized" : 
                        "Areas for Improvement"}
                    </h4>
                  </div>
                  
                  {getImprovementAreas()[0].area === "General" ? (
                    <p className="text-sm text-slate-700">{getImprovementAreas()[0].suggestion}</p>
                  ) : (
                    <ul className="space-y-3">
                      {getImprovementAreas().map((item, idx) => (
                        <li key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                          <h5 className="text-sm font-medium text-slate-800 mb-1 flex items-center">
                            <i className="ri-focus-2-line mr-1.5 text-amber-600"></i>
                            {item.area}
                          </h5>
                          <p className="text-sm text-slate-700">{item.suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="improvements" className="mt-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-primary-50 p-2 rounded-lg">
                <i className="ri-tools-line text-xl text-primary-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Improvement Strategy</h3>
                <p className="text-sm text-slate-500">Data-driven steps to enhance your prompt effectiveness</p>
              </div>
            </div>
            
            {overallScore < 8 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                      <span className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 text-sm">1</span>
                      Recommended Actions
                    </h4>
                    <div className="space-y-4">
                      {clarity && clarity.score < 7.5 && (
                        <div className="flex gap-3">
                          <div className="bg-yellow-50 rounded-lg p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-lightbulb-line text-xl text-yellow-600"></i>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Improve clarity</h5>
                            <p className="text-sm text-slate-700">Eliminate ambiguous language and be specific about what you want the AI to deliver.</p>
                          </div>
                        </div>
                      )}
                      
                      {specificity && specificity.score < 7.5 && (
                        <div className="flex gap-3">
                          <div className="bg-blue-50 rounded-lg p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-focus-3-line text-xl text-blue-600"></i>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Add more details</h5>
                            <p className="text-sm text-slate-700">Include specific requirements, constraints, and examples to guide the AI's response.</p>
                          </div>
                        </div>
                      )}
                      
                      {focus && focus.score < 7.5 && (
                        <div className="flex gap-3">
                          <div className="bg-red-50 rounded-lg p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-target-line text-xl text-red-600"></i>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Sharpen focus</h5>
                            <p className="text-sm text-slate-700">Limit your prompt to one primary task or goal rather than multiple competing objectives.</p>
                          </div>
                        </div>
                      )}
                      
                      {aiFriendliness && aiFriendliness.score < 7.5 && (
                        <div className="flex gap-3">
                          <div className="bg-green-50 rounded-lg p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-robot-line text-xl text-green-600"></i>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">Improve structure</h5>
                            <p className="text-sm text-slate-700">Use formatting (lists, headers, etc.) to organize information in a way that's easier for AI to process.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                      <span className="bg-purple-50 w-8 h-8 rounded-full flex items-center justify-center text-purple-600 text-sm">2</span>
                      Suggested Prompt Template
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 space-y-1">
                      <p># <span className="text-purple-600">[Task Type]</span></p>
                      <p>I need <span className="text-purple-600">[specific output]</span>.</p>
                      <p></p>
                      <p>## Context</p>
                      <p><span className="text-purple-600">[Relevant background information]</span></p>
                      <p></p>
                      <p>## Requirements</p>
                      <p>- <span className="text-purple-600">[Key requirement 1]</span></p>
                      <p>- <span className="text-purple-600">[Key requirement 2]</span></p>
                      <p>- <span className="text-purple-600">[Key requirement 3]</span></p>
                      <p></p>
                      <p>## Format</p>
                      <p>Please structure your response as <span className="text-purple-600">[format details]</span>.</p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-5">
                  <div className="sticky top-6">
                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-5">
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <i className="ri-magic-line text-primary-600"></i>
                        COPSTA Framework
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="bg-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary-100 text-primary-700 font-medium">C</div>
                          <div>
                            <h5 className="font-medium text-slate-900">Context</h5>
                            <p className="text-sm text-slate-700">Begin with relevant background information to establish knowledge base</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary-100 text-primary-700 font-medium">O</div>
                          <div>
                            <h5 className="font-medium text-slate-900">Objective</h5>
                            <p className="text-sm text-slate-700">Clearly state what you want to achieve with this prompt</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary-100 text-primary-700 font-medium">P</div>
                          <div>
                            <h5 className="font-medium text-slate-900">Parameters</h5>
                            <p className="text-sm text-slate-700">Define specific requirements and constraints for the response</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary-100 text-primary-700 font-medium">S</div>
                          <div>
                            <h5 className="font-medium text-slate-900">Structure</h5>
                            <p className="text-sm text-slate-700">Indicate how you want the information presented</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary-100 text-primary-700 font-medium">T</div>
                          <div>
                            <h5 className="font-medium text-slate-900">Tone</h5>
                            <p className="text-sm text-slate-700">Specify the voice and style for the response</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-white rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary-100 text-primary-700 font-medium">A</div>
                          <div>
                            <h5 className="font-medium text-slate-900">Audience</h5>
                            <p className="text-sm text-slate-700">Define who the response should be tailored for</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-8">
                <div className="max-w-lg mx-auto text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm">
                    <i className="ri-check-line text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Excellent Prompt!</h3>
                  <p className="text-slate-700 mb-6">Your prompt is already well-optimized across all key dimensions. Only minor refinements might enhance results.</p>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100 text-left">
                    <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-1.5">
                      <i className="ri-lightbulb-line text-amber-500"></i>
                      Fine-tuning suggestions
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-line text-green-600 mt-0.5"></i>
                        <span>Consider adding example outputs if you want very specific formatting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-line text-green-600 mt-0.5"></i>
                        <span>Specify audience level (technical, beginner, etc.) for more tailored responses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-line text-green-600 mt-0.5"></i>
                        <span>Add a closing instruction to remind the AI about key priorities</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-primary-50 p-2 rounded-lg">
                <i className="ri-file-list-3-line text-xl text-primary-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Example Improvements</h3>
                <p className="text-sm text-slate-500">Real-world examples of prompt enhancement</p>
              </div>
            </div>

            {getPromptImprovementExamples().length > 0 ? (
              <div className="space-y-8">
                {getPromptImprovementExamples().map((example, idx) => (
                  <div key={idx} className="group">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          example.type === "Clarity" ? "bg-yellow-100 text-yellow-700" :
                          example.type === "Specificity" ? "bg-blue-100 text-blue-700" :
                          example.type === "Focus" ? "bg-red-100 text-red-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          <i className={`${
                            example.type === "Clarity" ? "ri-lightbulb-line" :
                            example.type === "Specificity" ? "ri-focus-3-line" :
                            example.type === "Focus" ? "ri-target-line" :
                            "ri-robot-line"
                          } text-lg`}></i>
                        </div>
                        <h4 className="font-semibold text-slate-900">{example.type} Improvement Example</h4>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-white border border-slate-200 font-medium text-slate-600">
                        Before → After
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="relative bg-white border border-red-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group-hover:border-red-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-300 to-red-500"></div>
                        <div className="p-4 pt-5">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-slate-900 flex items-center gap-1.5">
                              <i className="ri-close-circle-line text-red-500"></i>
                              Original Prompt
                            </h5>
                            <div className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">
                              Ineffective
                            </div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-3 font-mono text-sm text-slate-700 mb-3 min-h-24">
                            {example.original}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-red-700 font-medium">
                            <i className="ri-error-warning-line"></i>
                            <span>Key problems</span>
                          </div>
                          <ul className="mt-2 space-y-1 text-xs text-slate-600">
                            {example.type === "Clarity" && (
                              <>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>Vague, ambiguous wording</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>No clear objective</span>
                                </li>
                              </>
                            )}
                            {example.type === "Specificity" && (
                              <>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>Lacks detailed requirements</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>Too general instruction</span>
                                </li>
                              </>
                            )}
                            {example.type === "Focus" && (
                              <>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>Multiple competing objectives</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>No clear priority</span>
                                </li>
                              </>
                            )}
                            {example.type === "AI-Friendliness" && (
                              <>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>Poor formatting</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <i className="ri-checkbox-blank-circle-fill text-red-400 text-[8px] mt-1"></i>
                                  <span>Lack of structure</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="relative bg-white border border-green-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group-hover:border-green-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-300 to-green-500"></div>
                        <div className="p-4 pt-5">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-slate-900 flex items-center gap-1.5">
                              <i className="ri-check-line text-green-500"></i>
                              Improved Prompt
                            </h5>
                            <div className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded">
                              Optimized
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 font-mono text-sm text-slate-700 mb-3 min-h-24">
                            {example.improved}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                            <i className="ri-lightbulb-flash-line"></i>
                            <span>Improvements</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-600">{example.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm">
                  <i className="ri-star-line text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Outstanding Prompt Quality</h3>
                <p className="text-slate-700 max-w-md mx-auto">
                  Your prompt is so well-crafted that no specific improvement examples are needed. 
                  You're already implementing best practices across all evaluation dimensions.
                </p>
              </div>
            )}
            
            <div className="mt-8 bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <i className="ri-book-mark-line text-primary-600"></i>
                Key Lessons
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                      <i className="ri-lightbulb-line"></i>
                    </div>
                    <h5 className="font-medium text-slate-800">Be Explicit</h5>
                  </div>
                  <p className="text-xs text-slate-600">Avoid ambiguity by clearly specifying what you need, not what you think.</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <i className="ri-focus-3-line"></i>
                    </div>
                    <h5 className="font-medium text-slate-800">Add Context</h5>
                  </div>
                  <p className="text-xs text-slate-600">Include details about your audience, purpose, and specific requirements.</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                      <i className="ri-target-line"></i>
                    </div>
                    <h5 className="font-medium text-slate-800">Single Focus</h5>
                  </div>
                  <p className="text-xs text-slate-600">Limit each prompt to one primary task rather than multiple objectives.</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                      <i className="ri-layout-grid-line"></i>
                    </div>
                    <h5 className="font-medium text-slate-800">Format Well</h5>
                  </div>
                  <p className="text-xs text-slate-600">Use headings, bullet points, and sections to organize your prompt.</p>
                </div>
              </div>
            </div>
          </div>
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