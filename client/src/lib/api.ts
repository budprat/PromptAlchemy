import { apiRequest } from "./queryClient";

// Prompts
export const fetchPrompts = async () => {
  const res = await apiRequest("GET", "/api/prompts", undefined);
  return await res.json();
};

export const fetchPromptById = async (id: string) => {
  const res = await apiRequest("GET", `/api/prompts/${id}`, undefined);
  return await res.json();
};

export const createPrompt = async (data: any) => {
  const res = await apiRequest("POST", "/api/prompts", data);
  return await res.json();
};

export const updatePrompt = async ({ id, data }: { id: string; data: any }) => {
  const res = await apiRequest("PUT", `/api/prompts/${id}`, data);
  return await res.json();
};

export const deletePrompt = async (id: string) => {
  const res = await apiRequest("DELETE", `/api/prompts/${id}`, undefined);
  return await res.json();
};

export const duplicatePrompt = async (id: string) => {
  const res = await apiRequest("POST", `/api/prompts/${id}/duplicate`, {});
  return await res.json();
};

// Evaluations
export const evaluatePrompt = async (data: any) => {
  const res = await apiRequest("POST", "/api/evaluate", data);
  return await res.json();
};

export const fetchEvaluations = async (promptId: string) => {
  const res = await apiRequest("GET", `/api/prompts/${promptId}/evaluations`, undefined);
  return await res.json();
};

// Optimizations
export const optimizePrompt = async (data: any) => {
  const res = await apiRequest("POST", "/api/optimize", data);
  return await res.json();
};

// Dashboard
export const fetchStats = async () => {
  const res = await apiRequest("GET", "/api/stats", undefined);
  return await res.json();
};

export const fetchPerformanceData = async () => {
  const res = await apiRequest("GET", "/api/performance", undefined);
  return await res.json();
};

export const fetchRecentPrompts = async () => {
  const res = await apiRequest("GET", "/api/prompts/recent", undefined);
  return await res.json();
};
