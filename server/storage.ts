import { 
  users, type User, type UpsertUser,
  prompts, type Prompt, type InsertPrompt,
  evaluations, type Evaluation, type InsertEvaluation,
  optimizations, type Optimization, type InsertOptimization
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPromptById(id: string): Promise<Prompt | undefined>;
  getAllPrompts(): Promise<Prompt[]>;
  getRecentPrompts(limit: number): Promise<Prompt[]>;
  updatePrompt(id: string, data: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<void>;
  duplicatePrompt(id: string): Promise<Prompt>;
  
  // Evaluation operations
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getEvaluationsByPromptId(promptId: string): Promise<Evaluation[]>;
  
  // Optimization operations
  createOptimization(optimization: InsertOptimization): Promise<Optimization>;
  getOptimizationsByPromptId(promptId: string): Promise<Optimization[]>;
  
  // Statistics operations
  getStats(): Promise<{ 
    totalPrompts: number; 
    averageScore: number;
    totalOptimizations: number;
  }>;
  
  // Performance data
  getPerformanceData(): Promise<{
    clarity: number[];
    aiFriendliness: number[];
    specificity: number[];
    labels: string[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prompts: Map<string, Prompt>;
  private evaluations: Map<string, Evaluation>;
  private optimizations: Map<string, Optimization>;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.evaluations = new Map();
    this.optimizations = new Map();
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a sample user
    const userId = "1";
    const user: User = {
      id: userId,
      email: "alex@example.com",
      firstName: "Alex",
      lastName: "Morgan",
      profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(userId, user);
    
    // Create sample prompts
    const promptsData = [
      {
        title: "Customer Support Assistant",
        content: "You are a customer support agent for a software company that specializes in productivity tools. You should be helpful, concise, and friendly. When users ask questions, try to provide step-by-step solutions when possible.",
        overallScore: 9.2,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        title: "Product Description Generator",
        content: "Generate compelling product descriptions from the specifications provided. Descriptions should highlight key features, benefits, and unique selling points.",
        overallScore: 7.5,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        title: "Content Summarizer",
        content: "Summarize the provided content maintaining key points and insights while reducing length by 70%. Preserve the tone and context of the original.",
        overallScore: 8.8,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        title: "Social Media Caption Creator",
        content: "Create engaging social media captions for the attached image or product. Make them attention-grabbing and include relevant hashtags.",
        overallScore: 5.4,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
      },
      {
        title: "Email Response Template",
        content: "Generate professional email responses to customer inquiries. Maintain a helpful tone, address all questions, and include proper greeting and closing.",
        overallScore: 8.9,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) // 2 weeks ago
      }
    ];
    
    promptsData.forEach((promptData, index) => {
      const promptId = uuidv4();
      const prompt: Prompt = {
        id: promptId,
        userId,
        title: promptData.title,
        content: promptData.content,
        modelId: "gpt-4o",
        overallScore: promptData.overallScore,
        tags: ["sample"],
        isPublic: false,
        createdAt: promptData.updatedAt,
        updatedAt: promptData.updatedAt,
        collaborators: index % 2 === 0 ? [
          { id: "2", name: "Jamie Doe", role: "viewer" },
          { id: "3", name: "Taylor Smith", role: "editor" }
        ] : undefined,
        evaluations: {
          clarity: { score: 8.5, feedback: "Clear and direct instructions." },
          specificity: { score: 7.5, feedback: "Could provide more specific examples." },
          focus: { score: 8.0, feedback: "Good focus on the task." },
          aiFriendliness: { score: 9.2, feedback: "Well-structured for AI processing." }
        }
      };
      this.prompts.set(promptId, prompt);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    
    const user: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    
    if (!existingUser) {
      user.createdAt = new Date();
    }
    
    this.users.set(userData.id, user);
    return user;
  }
  
  // Prompt operations
  async createPrompt(promptData: InsertPrompt): Promise<Prompt> {
    const id = promptData.id || uuidv4();
    
    const prompt: Prompt = {
      id,
      ...promptData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.prompts.set(id, prompt);
    return prompt;
  }
  
  async getPromptById(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }
  
  async getAllPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async getRecentPrompts(limit: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
  
  async updatePrompt(id: string, data: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = await this.getPromptById(id);
    
    if (!prompt) {
      return undefined;
    }
    
    const updatedPrompt: Prompt = {
      ...prompt,
      ...data,
      updatedAt: new Date()
    };
    
    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }
  
  async deletePrompt(id: string): Promise<void> {
    this.prompts.delete(id);
  }
  
  async duplicatePrompt(id: string): Promise<Prompt> {
    const prompt = await this.getPromptById(id);
    
    if (!prompt) {
      throw new Error("Prompt not found");
    }
    
    const newId = uuidv4();
    const duplicatedPrompt: Prompt = {
      ...prompt,
      id: newId,
      title: `${prompt.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.prompts.set(newId, duplicatedPrompt);
    return duplicatedPrompt;
  }
  
  // Evaluation operations
  async createEvaluation(evaluationData: InsertEvaluation): Promise<Evaluation> {
    const id = evaluationData.id || uuidv4();
    
    const evaluation: Evaluation = {
      id,
      ...evaluationData,
      createdAt: new Date()
    };
    
    this.evaluations.set(id, evaluation);
    return evaluation;
  }
  
  async getEvaluationsByPromptId(promptId: string): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values())
      .filter(evaluation => evaluation.promptId === promptId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Optimization operations
  async createOptimization(optimizationData: InsertOptimization): Promise<Optimization> {
    const id = optimizationData.id || uuidv4();
    
    const optimization: Optimization = {
      id,
      ...optimizationData,
      createdAt: new Date()
    };
    
    this.optimizations.set(id, optimization);
    return optimization;
  }
  
  async getOptimizationsByPromptId(promptId: string): Promise<Optimization[]> {
    return Array.from(this.optimizations.values())
      .filter(optimization => optimization.promptId === promptId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Statistics operations
  async getStats(): Promise<{ 
    totalPrompts: number; 
    averageScore: number;
    totalOptimizations: number;
  }> {
    const prompts = await this.getAllPrompts();
    const optimizations = Array.from(this.optimizations.values());
    
    const totalPrompts = prompts.length;
    
    const promptsWithScores = prompts.filter(prompt => prompt.overallScore !== undefined);
    const averageScore = promptsWithScores.length > 0
      ? promptsWithScores.reduce((sum, prompt) => sum + (prompt.overallScore || 0), 0) / promptsWithScores.length
      : 0;
    
    return {
      totalPrompts,
      averageScore,
      totalOptimizations: optimizations.length
    };
  }
  
  // Performance data
  async getPerformanceData(): Promise<{
    clarity: number[];
    aiFriendliness: number[];
    specificity: number[];
    labels: string[];
  }> {
    // Return sample performance data for the chart
    return {
      clarity: [7.0, 7.2, 7.5, 7.8],
      aiFriendliness: [8.5, 8.6, 8.7, 8.9],
      specificity: [6.0, 6.5, 6.8, 7.2],
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"]
    };
  }
}

export const storage = new MemStorage();
