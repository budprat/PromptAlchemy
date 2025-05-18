import { useQuery } from "@tanstack/react-query";
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
    </div>
  );
}
