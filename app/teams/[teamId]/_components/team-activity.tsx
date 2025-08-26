import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Clock,
  Plus,
  UserPlus,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  type:
    | "project_created"
    | "member_joined"
    | "task_completed"
    | "file_uploaded";
  user: {
    name: string;
    avatar?: string;
    email: string;
  };
  description: string;
  timestamp: string;
  meta?: Record<string, any>;
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    type: "project_created",
    user: {
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/avatars/alex.jpg",
    },
    description: "created a new project",
    meta: { projectName: "Q3 Marketing Campaign" },
    timestamp: "2025-08-26T10:30:00Z",
  },
  {
    id: "2",
    type: "member_joined",
    user: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      avatar: "/avatars/sarah.jpg",
    },
    description: "joined the team",
    timestamp: "2025-08-25T15:45:00Z",
  },
  {
    id: "3",
    type: "task_completed",
    user: {
      name: "Michael Chen",
      email: "michael@example.com",
      avatar: "/avatars/michael.jpg",
    },
    description: "completed a task",
    meta: { taskName: "Update homepage hero section" },
    timestamp: "2025-08-25T09:15:00Z",
  },
  {
    id: "4",
    type: "file_uploaded",
    user: {
      name: "Emma Davis",
      email: "emma@example.com",
      avatar: "/avatars/emma.jpg",
    },
    description: "uploaded a new file",
    meta: { fileName: "brand-guidelines.pdf" },
    timestamp: "2025-08-24T14:20:00Z",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "project_created":
      return <Plus className='h-4 w-4 text-blue-500' />;
    case "member_joined":
      return <UserPlus className='h-4 w-4 text-green-500' />;
    case "task_completed":
      return <CheckCircle className='h-4 w-4 text-emerald-500' />;
    case "file_uploaded":
      return <FileText className='h-4 w-4 text-amber-500' />;
    default:
      return <Activity className='h-4 w-4 text-gray-500' />;
  }
};

const formatActivityDescription = (activity: ActivityItem) => {
  switch (activity.type) {
    case "project_created":
      return (
        <span>
          created a new project{" "}
          <span className='font-medium'>{activity.meta?.projectName}</span>
        </span>
      );
    case "member_joined":
      return "joined the team";
    case "task_completed":
      return (
        <span>
          completed{" "}
          <span className='font-medium'>{activity.meta?.taskName}</span>
        </span>
      );
    case "file_uploaded":
      return (
        <span>
          uploaded{" "}
          <span className='font-medium'>{activity.meta?.fileName}</span>
        </span>
      );
    default:
      return activity.description;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function TeamActivity() {
  return (
    <Card className='h-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-medium'>Recent Activity</CardTitle>
          <Button variant='ghost' size='sm' className='h-8'>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {activityData.map(activity => (
          <div key={activity.id} className='flex gap-3'>
            <div className='flex flex-col items-center'>
              <div className='p-2 rounded-full bg-muted'>
                {getActivityIcon(activity.type)}
              </div>
              <div className='w-px h-full bg-border my-1' />
            </div>

            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage
                    src={activity.user.avatar}
                    alt={activity.user.name}
                  />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className='font-medium'>{activity.user.name}</span>
                <span className='text-muted-foreground'>
                  {formatActivityDescription(activity)}
                </span>
              </div>
              <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span>{formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
