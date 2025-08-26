import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderPlus, FolderOpen, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  due_date: string | null;
  task_count: number;
  completed_tasks: number;
}

const ProjectCard = ({ project }: { project: Project }) => {
  const statusIcons = {
    planning: <Clock className="h-4 w-4 text-blue-500" />,
    in_progress: <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />,
    on_hold: <AlertCircle className="h-4 w-4 text-amber-500" />,
    completed: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    cancelled: <div className="h-2 w-2 rounded-full bg-destructive" />
  };

  const statusLabels = {
    planning: 'Planning',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{project.name}</h3>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 text-xs"
          >
            {statusIcons[project.status]}
            {statusLabels[project.status]}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>{project.completed_tasks} of {project.task_count} tasks</span>
            {project.due_date && (
              <span>Due {new Date(project.due_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export function TeamProjects({ teamId }: { teamId: string }) {
  // TODO: Replace with actual data fetching
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      status: 'in_progress',
      progress: 65,
      due_date: '2025-10-15',
      task_count: 24,
      completed_tasks: 16
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'New mobile application for iOS and Android',
      status: 'planning',
      progress: 15,
      due_date: '2025-12-01',
      task_count: 42,
      completed_tasks: 6
    },
    {
      id: '3',
      name: 'Q4 Marketing Campaign',
      description: 'Marketing materials and campaigns for Q4',
      status: 'on_hold',
      progress: 30,
      due_date: '2025-11-10',
      task_count: 18,
      completed_tasks: 5
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Team Projects</CardTitle>
          <Button variant="ghost" size="sm" className="h-8" asChild>
            <Link href={`/teams/${teamId}/projects/new`}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating a new project for your team
            </p>
            <Button asChild>
              <Link href={`/teams/${teamId}/projects/new`}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Project
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
