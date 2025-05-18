import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEvaluatePrompt } from "@/hooks/use-evaluate-prompt";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EvaluationResult from "./EvaluationResult";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const evaluationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Prompt must be at least 10 characters"),
  modelId: z.string().min(1, "Please select a model"),
  evaluateClarity: z.boolean().default(true),
  evaluateSpecificity: z.boolean().default(true),
  evaluateFocus: z.boolean().default(true),
  evaluateAiFriendliness: z.boolean().default(true),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

export default function PromptEvaluationForm() {
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();
  const { evaluate, isPending, result } = useEvaluatePrompt();
  const [formData, setFormData] = useState<EvaluationFormValues | null>(null);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      title: "",
      content: "",
      modelId: "gpt-4o",
      evaluateClarity: true,
      evaluateSpecificity: true,
      evaluateFocus: true,
      evaluateAiFriendliness: true,
    },
  });

  const onSubmit = async (data: EvaluationFormValues) => {
    try {
      setFormData(data);
      const evaluation = await evaluate(data);
      toast({
        title: "Prompt evaluated successfully",
        description: `Overall score: ${evaluation.overallScore.toFixed(1)}/10`,
      });
    } catch (error) {
      toast({
        title: "Evaluation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    form.setValue("content", e.target.value);
  };
  
  const handleStartNewEvaluation = () => {
    form.reset();
    setFormData(null);
    setCharCount(0);
  };

  return (
    <>
      {result && formData ? (
        <div>
          <EvaluationResult
            title={formData.title}
            content={formData.content}
            modelId={formData.modelId}
            overallScore={result.overallScore}
            clarity={result.clarity}
            specificity={result.specificity}
            focus={result.focus}
            aiFriendliness={result.aiFriendliness}
          />
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleStartNewEvaluation}
              className="inline-flex items-center justify-center"
            >
              <i className="ri-add-line mr-2"></i> 
              Start New Evaluation
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Prompt Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="E.g., Customer Support Assistant"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    Prompt Text
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="Enter your prompt here..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-20"
                        onChange={handleTextareaChange}
                      />
                      <div className="absolute bottom-3 right-3 flex space-x-2 text-xs text-slate-500">
                        <span>{charCount}/2000</span>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      LLM Model
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-4o">OpenAI - GPT-4o</SelectItem>
                        <SelectItem value="gpt-4">OpenAI - GPT-4</SelectItem>
                        <SelectItem value="claude-3-opus">Anthropic - Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Anthropic - Claude 3 Sonnet</SelectItem>
                        <SelectItem value="mistral-large">Mistral - Mistral Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">
                  Evaluation Focus
                </FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="evaluateClarity"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="clarity"
                          />
                        </FormControl>
                        <label
                          htmlFor="clarity"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Clarity
                        </label>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evaluateSpecificity"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="specificity"
                          />
                        </FormControl>
                        <label
                          htmlFor="specificity"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Specificity
                        </label>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evaluateFocus"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="focus"
                          />
                        </FormControl>
                        <label
                          htmlFor="focus"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Focus
                        </label>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evaluateAiFriendliness"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="ai-friendly"
                          />
                        </FormControl>
                        <label
                          htmlFor="ai-friendly"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          AI-Friendly
                        </label>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center justify-center"
              >
                <i className="ri-save-line mr-2"></i> Save Draft
              </Button>
              <Button 
                type="submit" 
                className="inline-flex items-center justify-center"
                disabled={isPending}
              >
                <i className="ri-magic-line mr-2"></i> 
                {isPending ? "Evaluating..." : "Evaluate Prompt"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
