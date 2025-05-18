import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export type AdvancedOptimizationSettings = {
  // Core settings
  length: number;
  tone: number;
  specificity: number;
  
  // Advanced settings
  creativity: number;
  audience: string;
  formality: number;
  purpose: string;
  structure: string;
  
  // Enhancement toggles
  enhanceClarity: boolean;
  enhanceSpecificity: boolean;
  enhanceFocus: boolean;
  enhanceAiFriendliness: boolean;
  
  // Style preferences
  style: {
    useMarkdown: boolean;
    useBulletPoints: boolean;
    useHeadings: boolean;
    useExamples: boolean;
    includeContext: boolean;
  };
};

type AdvancedOptimizationControlsProps = {
  settings: AdvancedOptimizationSettings;
  onSettingsChange: (settings: AdvancedOptimizationSettings) => void;
  onOptimize: () => void;
  onReset: () => void;
  isOptimizing: boolean;
};

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

export default function AdvancedOptimizationControls({
  settings,
  onSettingsChange,
  onOptimize,
  onReset,
  isOptimizing,
}: AdvancedOptimizationControlsProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Helper functions for labels
  const getLengthLabel = (value: number) => {
    switch (value) {
      case 1: return "Concise";
      case 2: return "Moderate";
      case 3: return "Detailed";
      case 4: return "Comprehensive";
      default: return "Moderate";
    }
  };

  const getToneLabel = (value: number) => {
    switch (value) {
      case 1: return "Casual";
      case 2: return "Neutral";
      case 3: return "Professional";
      case 4: return "Formal";
      default: return "Neutral";
    }
  };

  const getSpecificityLabel = (value: number) => {
    switch (value) {
      case 1: return "General";
      case 2: return "Somewhat Specific";
      case 3: return "Detailed";
      case 4: return "Highly Detailed";
      default: return "Detailed";
    }
  };

  const getCreativityLabel = (value: number) => {
    switch (value) {
      case 1: return "Conservative";
      case 2: return "Balanced";
      case 3: return "Creative";
      case 4: return "Highly Creative";
      default: return "Balanced";
    }
  };

  const getFormalityLabel = (value: number) => {
    switch (value) {
      case 1: return "Informal";
      case 2: return "Conversational";
      case 3: return "Business";
      case 4: return "Academic";
      default: return "Conversational";
    }
  };

  // Update settings handlers
  const updateBasicSetting = (key: keyof AdvancedOptimizationSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateStyleSetting = (key: keyof AdvancedOptimizationSettings["style"], value: boolean) => {
    onSettingsChange({
      ...settings,
      style: {
        ...settings.style,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">Optimization Studio</h3>
        <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
          Advanced Controls
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="basic" className="text-xs">
            <i className="ri-equalizer-line mr-1.5"></i> Core Settings
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            <i className="ri-tools-line mr-1.5"></i> Advanced
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            <i className="ri-paint-brush-line mr-1.5"></i> Style
          </TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm text-slate-700">Length</Label>
                <span className="text-xs text-slate-500 font-medium">{getLengthLabel(settings.length)}</span>
              </div>
              <Slider
                value={[settings.length]}
                min={1}
                max={4}
                step={1}
                onValueChange={(value) => updateBasicSetting("length", value[0])}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                <span>Shorter</span>
                <span>Longer</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm text-slate-700">Tone</Label>
                <span className="text-xs text-slate-500 font-medium">{getToneLabel(settings.tone)}</span>
              </div>
              <Slider
                value={[settings.tone]}
                min={1}
                max={4}
                step={1}
                onValueChange={(value) => updateBasicSetting("tone", value[0])}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                <span>Casual</span>
                <span>Formal</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm text-slate-700">Specificity</Label>
                <span className="text-xs text-slate-500 font-medium">{getSpecificityLabel(settings.specificity)}</span>
              </div>
              <Slider
                value={[settings.specificity]}
                min={1}
                max={4}
                step={1}
                onValueChange={(value) => updateBasicSetting("specificity", value[0])}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                <span>General</span>
                <span>Specific</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm text-slate-700">Creativity</Label>
                <span className="text-xs text-slate-500 font-medium">{getCreativityLabel(settings.creativity)}</span>
              </div>
              <Slider
                value={[settings.creativity]}
                min={1}
                max={4}
                step={1}
                onValueChange={(value) => updateBasicSetting("creativity", value[0])}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <Label className="text-sm text-slate-700 mb-1 block">Audience</Label>
                <Select
                  value={settings.audience}
                  onValueChange={(value) => updateBasicSetting("audience", value)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="novice">Beginner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-slate-700 mb-1 block">Purpose</Label>
                <Select
                  value={settings.purpose}
                  onValueChange={(value) => updateBasicSetting("purpose", value)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="information">Informational</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="instructional">Instructional</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm text-slate-700">Formality</Label>
              <span className="text-xs text-slate-500 font-medium">{getFormalityLabel(settings.formality)}</span>
            </div>
            <Slider
              value={[settings.formality]}
              min={1}
              max={4}
              step={1}
              onValueChange={(value) => updateBasicSetting("formality", value[0])}
              className="py-1"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 mb-1 block">Structure</Label>
            <Select
              value={settings.structure}
              onValueChange={(value) => updateBasicSetting("structure", value)}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="sequential">Sequential</SelectItem>
                <SelectItem value="comparative">Comparative</SelectItem>
                <SelectItem value="problem-solution">Problem-Solution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="enhancements">
              <AccordionTrigger className="py-2 text-sm">
                Enhancement Focus
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enhance-clarity"
                        checked={settings.enhanceClarity}
                        onCheckedChange={(checked) => updateBasicSetting("enhanceClarity", checked)}
                      />
                      <Label htmlFor="enhance-clarity" className="text-sm">
                        Clarity
                      </Label>
                    </div>
                    <i className="ri-lightbulb-line text-yellow-500"></i>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enhance-specificity"
                        checked={settings.enhanceSpecificity}
                        onCheckedChange={(checked) => updateBasicSetting("enhanceSpecificity", checked)}
                      />
                      <Label htmlFor="enhance-specificity" className="text-sm">
                        Specificity
                      </Label>
                    </div>
                    <i className="ri-focus-3-line text-blue-500"></i>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enhance-focus"
                        checked={settings.enhanceFocus}
                        onCheckedChange={(checked) => updateBasicSetting("enhanceFocus", checked)}
                      />
                      <Label htmlFor="enhance-focus" className="text-sm">
                        Focus
                      </Label>
                    </div>
                    <i className="ri-target-line text-red-500"></i>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enhance-ai-friendliness"
                        checked={settings.enhanceAiFriendliness}
                        onCheckedChange={(checked) => updateBasicSetting("enhanceAiFriendliness", checked)}
                      />
                      <Label htmlFor="enhance-ai-friendliness" className="text-sm">
                        AI-Friendliness
                      </Label>
                    </div>
                    <i className="ri-robot-line text-green-500"></i>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Style Settings Tab */}
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-3 border border-slate-100 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-markdown"
                  checked={settings.style.useMarkdown}
                  onCheckedChange={(checked) => updateStyleSetting("useMarkdown", checked)}
                />
                <Label htmlFor="use-markdown" className="text-sm">
                  Use Markdown Formatting
                </Label>
              </div>
              <i className="ri-markdown-line text-slate-500"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-bullet-points"
                  checked={settings.style.useBulletPoints}
                  onCheckedChange={(checked) => updateStyleSetting("useBulletPoints", checked)}
                />
                <Label htmlFor="use-bullet-points" className="text-sm">
                  Use Bullet Points
                </Label>
              </div>
              <i className="ri-list-check text-slate-500"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-headings"
                  checked={settings.style.useHeadings}
                  onCheckedChange={(checked) => updateStyleSetting("useHeadings", checked)}
                />
                <Label htmlFor="use-headings" className="text-sm">
                  Use Section Headings
                </Label>
              </div>
              <i className="ri-heading text-slate-500"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-examples"
                  checked={settings.style.useExamples}
                  onCheckedChange={(checked) => updateStyleSetting("useExamples", checked)}
                />
                <Label htmlFor="use-examples" className="text-sm">
                  Include Examples
                </Label>
              </div>
              <i className="ri-file-list-3-line text-slate-500"></i>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-context"
                  checked={settings.style.includeContext}
                  onCheckedChange={(checked) => updateStyleSetting("includeContext", checked)}
                />
                <Label htmlFor="include-context" className="text-sm">
                  Include Context Section
                </Label>
              </div>
              <i className="ri-information-line text-slate-500"></i>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex-1"
          disabled={isOptimizing}
        >
          <i className="ri-restart-line mr-1.5"></i> Reset
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onOptimize}
          className="flex-1"
          disabled={isOptimizing}
        >
          {isOptimizing ? (
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
  );
}