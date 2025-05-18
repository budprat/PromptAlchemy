import { cn } from "@/lib/utils";

type ScoreBadgeProps = {
  score: number;
  size?: "sm" | "md";
  className?: string;
};

export default function ScoreBadge({ 
  score, 
  size = "sm", 
  className 
}: ScoreBadgeProps) {
  // Determine color based on score
  const getColorClass = () => {
    if (score >= 8.5) return "bg-green-100 text-green-800";
    if (score >= 7) return "bg-green-100 text-green-800";
    if (score >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const sizeClass = size === "sm" 
    ? "px-2 py-1 text-xs" 
    : "px-2.5 py-1.5 text-sm";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeClass,
        getColorClass(),
        className
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
