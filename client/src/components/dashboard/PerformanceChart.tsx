import { useState } from "react";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";

type PerformanceData = {
  clarity: number[];
  aiFriendliness: number[];
  specificity: number[];
  labels: string[];
};

type PerformanceChartProps = {
  data: PerformanceData;
  className?: string;
};

export default function PerformanceChart({ 
  data,
  className 
}: PerformanceChartProps) {
  const [period, setPeriod] = useState<Period>("month");

  const { clarity, aiFriendliness, specificity, labels } = data;

  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900">Prompt Performance</h2>
        <div className="flex space-x-2">
          <button 
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md", 
              period === "week" 
                ? "bg-primary-50 text-primary-700" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
            onClick={() => setPeriod("week")}
          >
            Week
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md", 
              period === "month" 
                ? "bg-primary-50 text-primary-700" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
            onClick={() => setPeriod("month")}
          >
            Month
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md", 
              period === "year" 
                ? "bg-primary-50 text-primary-700" 
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
            onClick={() => setPeriod("year")}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="h-64 relative">
        <div className="absolute inset-0">
          <div className="h-full flex flex-col">
            {/* Y-axis labels */}
            <div className="flex h-full">
              <div className="w-12 flex flex-col justify-between py-4 text-xs text-slate-500">
                <span>10.0</span>
                <span>8.0</span>
                <span>6.0</span>
                <span>4.0</span>
                <span>2.0</span>
                <span>0.0</span>
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Grid lines */}
                <div className="flex-1 border-b border-slate-200"></div>
                <div className="flex-1 border-b border-slate-200"></div>
                <div className="flex-1 border-b border-slate-200"></div>
                <div className="flex-1 border-b border-slate-200"></div>
                <div className="flex-1 border-b border-slate-200"></div>
                
                {/* Chart data */}
                <div className="absolute left-12 right-4 top-4 bottom-4">
                  {/* Clarity Score Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 border-t-2 border-primary-500 bg-primary-500/10 h-full" 
                      style={{ transform: `scaleY(${clarity[0] / 10})`, transformOrigin: 'bottom' }}
                    ></div>
                  </div>
                  
                  {/* AI-Friendliness Score Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 border-t-2 border-secondary-500 bg-secondary-500/10 h-full" 
                      style={{ transform: `scaleY(${aiFriendliness[0] / 10})`, transformOrigin: 'bottom' }}
                    ></div>
                  </div>
                  
                  {/* Specificity Score Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 border-t-2 border-accent-500 bg-accent-500/10 h-full" 
                      style={{ transform: `scaleY(${specificity[0] / 10})`, transformOrigin: 'bottom' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between px-12 pr-4 py-2 text-xs text-slate-500">
              {labels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
          <span className="text-xs text-slate-700">Clarity</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-secondary-500 mr-2"></div>
          <span className="text-xs text-slate-700">AI-Friendliness</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-accent-500 mr-2"></div>
          <span className="text-xs text-slate-700">Specificity</span>
        </div>
      </div>
    </div>
  );
}
