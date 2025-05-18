import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
  changeValue?: string | number;
  changeDirection?: "up" | "down" | "neutral";
  changeText?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  changeValue,
  changeDirection = "neutral",
  changeText,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center",
            iconBgColor,
            iconTextColor
          )}
        >
          <i className={`${icon} text-lg`}></i>
        </div>
      </div>
      {(changeValue || changeText) && (
        <div className="mt-2 flex items-center text-xs">
          {changeValue && (
            <span
              className={cn(
                "font-medium flex items-center",
                changeDirection === "up" && "text-green-600",
                changeDirection === "down" && "text-red-600",
                changeDirection === "neutral" && "text-slate-600"
              )}
            >
              <i
                className={cn(
                  changeDirection === "up" && "ri-arrow-up-line",
                  changeDirection === "down" && "ri-arrow-down-line",
                  "mr-1"
                )}
              ></i>
              {changeValue}
            </span>
          )}
          {changeText && (
            <span className="text-slate-500 ml-2">{changeText}</span>
          )}
        </div>
      )}
    </div>
  );
}
