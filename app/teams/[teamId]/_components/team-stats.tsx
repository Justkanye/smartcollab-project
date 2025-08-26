import {
  Users,
  Folder,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamStatsProps {
  memberCount: number;
  projectCount: number;
  completedTasks: number;
  totalTasks: number;
  activeProjects: number;
  onTrackPercentage: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}) => {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            {title}
          </CardTitle>
          <div className='p-2 rounded-lg bg-primary/10'>
            <Icon className={`h-4 w-4 ${trendColors[trend || "neutral"]}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {description && (
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        )}
        {trend && trendLabel && (
          <div
            className={`flex items-center text-xs mt-1 ${trendColors[trend]}`}
          >
            <TrendingUp className='h-3 w-3 mr-1' />
            {trendLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function TeamStats({
  memberCount,
  projectCount,
  completedTasks,
  totalTasks,
  activeProjects,
  onTrackPercentage,
}: TeamStatsProps) {
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        title='Team Members'
        value={memberCount}
        icon={Users}
        trend='up'
        trendLabel='+2 this month'
      />

      <StatCard
        title='Active Projects'
        value={activeProjects}
        icon={Folder}
        description={`${projectCount} total`}
      />

      <StatCard
        title='Task Completion'
        value={`${taskCompletionRate}%`}
        icon={CheckCircle}
        description={`${completedTasks} of ${totalTasks} tasks`}
      />

      <StatCard
        title='On Track'
        value={`${onTrackPercentage}%`}
        icon={
          onTrackPercentage > 70
            ? CheckCircle
            : onTrackPercentage > 40
            ? Clock
            : AlertCircle
        }
        trend={
          onTrackPercentage > 70
            ? "up"
            : onTrackPercentage > 40
            ? "neutral"
            : "down"
        }
        trendLabel={
          onTrackPercentage > 70
            ? "Ahead"
            : onTrackPercentage > 40
            ? "On track"
            : "Needs attention"
        }
      />
    </div>
  );
}
