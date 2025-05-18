import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import StatCard from "@/components/dashboard/StatCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import RecentPromptList from "@/components/dashboard/RecentPromptList";
import { Prompt } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["/api/performance"],
  });

  const { data: prompts = [], isLoading: isLoadingPrompts } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts/recent"],
  });

  const defaultPerformanceData = {
    clarity: [7.0],
    aiFriendliness: [8.5],
    specificity: [6.0],
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"]
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {stats?.username 
            ? `Welcome back, ${stats.username}! Here's your prompt performance overview.`
            : "Welcome! Here's your prompt performance overview."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Prompts"
          value={isLoadingStats ? "..." : stats?.totalPrompts || 0}
          icon="ri-file-text-line"
          iconBgColor="bg-primary-100"
          iconTextColor="text-primary-600"
          changeValue={isLoadingStats ? undefined : stats?.promptsChangePercent}
          changeDirection={
            !stats?.promptsChangePercent
              ? "neutral"
              : stats.promptsChangePercent > 0
              ? "up"
              : "down"
          }
          changeText="vs last month"
        />

        <StatCard
          title="Avg. Quality Score"
          value={isLoadingStats ? "..." : `${stats?.averageScore || 0}/10`}
          icon="ri-star-line"
          iconBgColor="bg-secondary-100"
          iconTextColor="text-secondary-600"
          changeValue={isLoadingStats ? undefined : stats?.scoreChange}
          changeDirection={
            !stats?.scoreChange
              ? "neutral"
              : stats.scoreChange > 0
              ? "up"
              : "down"
          }
          changeText="points increase"
        />

        <StatCard
          title="Optimizations"
          value={isLoadingStats ? "..." : stats?.totalOptimizations || 0}
          icon="ri-magic-line"
          iconBgColor="bg-accent-100"
          iconTextColor="text-accent-600"
          changeValue={isLoadingStats ? undefined : `${stats?.optimizationRate || 0}%`}
          changeDirection="up"
          changeText="improvement rate"
        />

        <StatCard
          title="Team Members"
          value={isLoadingStats ? "..." : stats?.teamMembers || 1}
          icon="ri-team-line"
          iconBgColor="bg-green-100"
          iconTextColor="text-green-600"
          changeValue={isLoadingStats ? undefined : stats?.newTeamMembers}
          changeDirection="up"
          changeText="this month"
        />
      </div>

      {/* Recent Prompts + Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PerformanceChart 
          data={performanceData || defaultPerformanceData}
          className="lg:col-span-2"
        />
        <RecentPromptList prompts={prompts} />
      </div>
      
      {/* Prompt Evaluation Section - Positioned at the top as requested */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Prompt Evaluation Studio</h2>
          <Link href="/prompt-evaluation" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
            Go to evaluation studio <i className="ri-arrow-right-line ml-1"></i>
          </Link>
        </div>
        <p className="text-slate-600 mb-4">
          Analyze your prompt's quality across multiple dimensions and get AI-powered feedback to improve effectiveness.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-lightbulb-line text-yellow-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Clarity</h3>
            </div>
            <p className="text-slate-600 text-sm">Measures how clear and unambiguous your prompt is</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-focus-3-line text-blue-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Specificity</h3>
            </div>
            <p className="text-slate-600 text-sm">Evaluates the level of detail and context provided</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-target-line text-red-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Focus</h3>
            </div>
            <p className="text-slate-600 text-sm">Checks if your prompt stays on topic without tangents</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-robot-line text-green-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">AI Friendliness</h3>
            </div>
            <p className="text-slate-600 text-sm">Assesses how well the AI can process your prompt</p>
          </div>
        </div>
        <Link href="/prompt-evaluation" className="mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Evaluate a prompt
        </Link>
      </div>
      
      {/* Prompt Optimization Section - Added below evaluation section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Prompt Optimization Studio</h2>
          <Link href="/prompt-optimization" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
            Go to optimization studio <i className="ri-arrow-right-line ml-1"></i>
          </Link>
        </div>
        <p className="text-slate-600 mb-4">
          Transform your prompts with advanced controls for tone, style, and structure to maximize AI response quality.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-palette-line text-purple-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Style Controls</h3>
            </div>
            <p className="text-slate-600 text-sm">Adjust tone, formality and creativity of your prompts</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-layout-row-line text-blue-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Structure Options</h3>
            </div>
            <p className="text-slate-600 text-sm">Format with markdown, headings, and organized layouts</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-user-settings-line text-green-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Audience Tuning</h3>
            </div>
            <p className="text-slate-600 text-sm">Target specific audiences from novice to expert</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-2">
              <i className="ri-magic-line text-amber-500 mr-2 text-lg"></i>
              <h3 className="font-medium text-slate-900">Magic Optimization</h3>
            </div>
            <p className="text-slate-600 text-sm">One-click improvements based on evaluation feedback</p>
          </div>
        </div>
        <Link href="/prompt-optimization" className="mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Optimize a prompt
        </Link>
      </div>
    </div>
  );
}
