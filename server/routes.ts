import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { evaluate } from "./services/promptEvaluation";
import { optimizePrompt } from "./services/openai";
import { initializeWhiteboardService, getWhiteboardService } from "./services/whiteboard";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.get('/api/auth/user', async (req, res) => {
    // For demo purposes, return a mock user
    res.json({
      id: "1",
      name: "Alex Morgan",
      email: "alex@example.com",
      role: "Prompt Engineer",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    });
  });

  // Stats API
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json({
        username: "Alex",
        totalPrompts: stats.totalPrompts,
        promptsChangePercent: 12,
        averageScore: stats.averageScore.toFixed(1),
        scoreChange: 0.6,
        totalOptimizations: stats.totalOptimizations,
        optimizationRate: 8,
        teamMembers: 7,
        newTeamMembers: 2
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Performance data for charts
  app.get('/api/performance', async (req, res) => {
    try {
      const performance = await storage.getPerformanceData();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Prompts API
  app.get('/api/prompts', async (req, res) => {
    try {
      const prompts = await storage.getAllPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  app.get('/api/prompts/recent', async (req, res) => {
    try {
      const prompts = await storage.getRecentPrompts(5);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching recent prompts:", error);
      res.status(500).json({ error: "Failed to fetch recent prompts" });
    }
  });

  app.get('/api/prompts/:id', async (req, res) => {
    try {
      const promptId = req.params.id;
      const prompt = await storage.getPromptById(promptId);
      
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ error: "Failed to fetch prompt" });
    }
  });

  const createPromptSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    modelId: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  });

  app.post('/api/prompts', async (req, res) => {
    try {
      const validated = createPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt({
        ...validated,
        userId: "1" // Mock user ID
      });
      res.status(201).json(prompt);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating prompt:", error);
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  app.put('/api/prompts/:id', async (req, res) => {
    try {
      const promptId = req.params.id;
      const validated = createPromptSchema.parse(req.body);
      const prompt = await storage.updatePrompt(promptId, validated);
      
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating prompt:", error);
      res.status(500).json({ error: "Failed to update prompt" });
    }
  });

  app.delete('/api/prompts/:id', async (req, res) => {
    try {
      const promptId = req.params.id;
      await storage.deletePrompt(promptId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  app.post('/api/prompts/:id/duplicate', async (req, res) => {
    try {
      const promptId = req.params.id;
      const duplicatedPrompt = await storage.duplicatePrompt(promptId);
      res.status(201).json(duplicatedPrompt);
    } catch (error) {
      console.error("Error duplicating prompt:", error);
      res.status(500).json({ error: "Failed to duplicate prompt" });
    }
  });

  // Evaluation API
  const evaluationSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    modelId: z.string(),
    evaluateClarity: z.boolean().optional(),
    evaluateSpecificity: z.boolean().optional(),
    evaluateFocus: z.boolean().optional(),
    evaluateAiFriendliness: z.boolean().optional(),
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const validated = evaluationSchema.parse(req.body);
      
      // Save the prompt first
      const prompt = await storage.createPrompt({
        title: validated.title,
        content: validated.content,
        modelId: validated.modelId,
        userId: "1" // Mock user ID
      });
      
      // Perform evaluation
      const evaluation = await evaluate({
        promptId: prompt.id,
        userId: "1", // Mock user ID
        ...validated
      });
      
      // Update prompt with the overall score
      await storage.updatePrompt(prompt.id, {
        overallScore: evaluation.overallScore
      });
      
      res.status(201).json(evaluation);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error evaluating prompt:", error);
      res.status(500).json({ error: "Failed to evaluate prompt" });
    }
  });

  // Optimization API
  const optimizationSchema = z.object({
    originalPrompt: z.string(),
    settings: z.object({
      // Basic settings
      length: z.number().min(1).max(4),
      tone: z.number().min(1).max(4),
      specificity: z.number().min(1).max(4),
      
      // Advanced settings
      creativity: z.number().min(1).max(4).optional(),
      audience: z.string().optional(),
      formality: z.number().min(1).max(4).optional(),
      purpose: z.string().optional(),
      structure: z.string().optional(),
      
      // Enhancement toggles
      enhanceClarity: z.boolean().optional(),
      enhanceSpecificity: z.boolean().optional(),
      enhanceFocus: z.boolean().optional(),
      enhanceAiFriendliness: z.boolean().optional(),
      
      // Style preferences
      style: z.object({
        useMarkdown: z.boolean().optional(),
        useBulletPoints: z.boolean().optional(),
        useHeadings: z.boolean().optional(),
        useExamples: z.boolean().optional(),
        includeContext: z.boolean().optional()
      }).optional()
    }),
    evaluationDetails: z.object({
      clarity: z.object({
        score: z.number(),
        feedback: z.string()
      }),
      specificity: z.object({
        score: z.number(),
        feedback: z.string()
      }),
      focus: z.object({
        score: z.number(),
        feedback: z.string()
      }),
      aiFriendliness: z.object({
        score: z.number(),
        feedback: z.string()
      })
    })
  });

  app.post('/api/optimize', async (req, res) => {
    try {
      const validated = optimizationSchema.parse(req.body);
      
      // Call OpenAI service to optimize the prompt
      const optimizationResult = await optimizePrompt(
        validated.originalPrompt,
        validated.settings,
        validated.evaluationDetails
      );
      
      res.json(optimizationResult);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error optimizing prompt:", error);
      res.status(500).json({ error: "Failed to optimize prompt" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize whiteboard WebSocket service
  initializeWhiteboardService(httpServer);
  
  // API endpoints for whiteboard sessions
  app.get('/api/whiteboard/sessions', (req, res) => {
    const whiteboardService = getWhiteboardService();
    if (whiteboardService) {
      res.json(whiteboardService.getSessions());
    } else {
      res.status(500).json({ error: 'Whiteboard service not initialized' });
    }
  });
  
  app.get('/api/whiteboard/sessions/:id', (req, res) => {
    const whiteboardService = getWhiteboardService();
    if (whiteboardService) {
      const session = whiteboardService.getSession(req.params.id);
      if (session) {
        res.json(session);
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } else {
      res.status(500).json({ error: 'Whiteboard service not initialized' });
    }
  });
  
  app.post('/api/whiteboard/sessions', (req, res) => {
    const whiteboardService = getWhiteboardService();
    if (whiteboardService) {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Session name is required' });
      }
      const session = whiteboardService.createSession(name);
      res.status(201).json(session);
    } else {
      res.status(500).json({ error: 'Whiteboard service not initialized' });
    }
  });
  
  return httpServer;
}
