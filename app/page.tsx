import {
  CheckSquare,
  Clock,
  FolderOpen,
  Plus,
  TrendingUp,
  Calendar,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchTasks } from "./actions/task.actions";
import { Progress } from "@/components/ui/progress";
import { fetchProjects } from "./actions/project.actions";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { CreateProjectDialog } from "@/components/create-project-dialog";

export default async function DashboardPage() {
  const { data: projects, error: projectsError } = await fetchProjects();
  const { data: tasks } = await fetchTasks();

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === "Done") return false;
    return new Date(t.due_date) < new Date();
  }).length;

  // Get recent projects (last 3)
  const recentProjects = projects.slice(0, 3);

  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "In Progress":
        return "default";
      case "completed":
      case "Done":
        return "secondary";
      case "planning":
      case "To Do":
        return "outline";
      case "on-hold":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
      case "High":
        return "destructive";
      case "medium":
      case "Medium":
        return "default";
      case "low":
      case "Low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // if (projectsLoading || tasksLoading) {
  //   return (
  //     <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
  //       <div className='flex items-center justify-between space-y-2'>
  //         <Skeleton className='h-8 w-48' />
  //         <Skeleton className='h-10 w-32' />
  //       </div>
  //       <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
  //         {Array.from({ length: 4 }).map((_, i) => (
  //           <Card key={i}>
  //             <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
  //               <Skeleton className='h-4 w-24' />
  //               <Skeleton className='h-4 w-4' />
  //             </CardHeader>
  //             <CardContent>
  //               <Skeleton className='h-8 w-16 mb-2' />
  //               <Skeleton className='h-3 w-32' />
  //             </CardContent>
  //           </Card>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
        <div className='flex items-center space-x-2'>
          <CreateTaskDialog>
            <Button variant='outline' disabled={!projects?.length}>
              <Plus className='mr-2 h-4 w-4' />
              New Task
            </Button>
          </CreateTaskDialog>
          <CreateProjectDialog>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Projects
            </CardTitle>
            <FolderOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeProjects}</div>
            <p className='text-xs text-muted-foreground'>
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Tasks</CardTitle>
            <CheckSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalTasks}</div>
            <p className='text-xs text-muted-foreground'>
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Completion Rate
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completionRate}%</div>
            <p className='text-xs text-muted-foreground'>
              Task completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Overdue Tasks</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {overdueTasks}
            </div>
            <p className='text-xs text-muted-foreground'>Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Recent Projects */}
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recently updated projects
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {recentProjects.length === 0 ? (
              <div className='text-center py-6 text-muted-foreground'>
                <FolderOpen className='mx-auto h-12 w-12 mb-4 opacity-50' />
                <p>No projects yet</p>
                <CreateProjectDialog>
                  <Button variant='outline' className='mt-2'>
                    Create your first project
                  </Button>
                </CreateProjectDialog>
              </div>
            ) : (
              recentProjects.map(project => (
                <div key={project.id} className='flex items-center space-x-4'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium leading-none'>
                        {project.name}
                      </p>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge
                        variant={getPriorityBadgeVariant(project.priority)}
                      >
                        {project.priority}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {project.description || "No description"}
                    </p>
                    {project.progress !== undefined && (
                      <div className='flex items-center gap-2'>
                        <Progress value={project.progress} className='flex-1' />
                        <span className='text-xs text-muted-foreground'>
                          {project.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {formatDate(project.updated_at)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest task updates</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {recentTasks.length === 0 ? (
              <div className='text-center py-6 text-muted-foreground'>
                <CheckSquare className='mx-auto h-12 w-12 mb-4 opacity-50' />
                <p>No tasks yet</p>
                <CreateTaskDialog>
                  <Button
                    variant='outline'
                    className='mt-2'
                    disabled={!projects?.length}
                  >
                    Create your first task
                  </Button>
                </CreateTaskDialog>
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className='flex items-center space-x-4'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium leading-none'>
                        {task.title}
                      </p>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Badge
                        variant={getPriorityBadgeVariant(task.priority)}
                        className='text-xs'
                      >
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
