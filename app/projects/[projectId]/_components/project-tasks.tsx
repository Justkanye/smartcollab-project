import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Task } from "@/types";
import { getStatusBadgeVariant, getPriorityBadgeVariant } from "@/lib/utils";
import { getProjectTasks } from "@/app/actions/task.actions";
import { CreateTaskDialog } from "@/components/create-task-dialog";

export async function ProjectTasks({ projectId }: { projectId: string }) {
  let tasks: Task[] = [];
  let error: string | null = null;

  try {
    const res = await getProjectTasks(projectId);
    tasks = res.data;
    error = res.error;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    error = "Failed to load tasks";
  }

  // If you want to show a loading state, you can use React Suspense with loading.tsx
  // or handle it in the parent component

  if (error) {
    return (
      <div className='text-center py-6'>
        <p className='text-destructive'>{error}</p>
        <Button variant='outline' className='mt-2' asChild>
          <Link href={`/projects/${projectId}`}>Try again</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-lg font-medium'>Tasks</CardTitle>
        <CreateTaskDialog projectId={projectId}>
          <Button size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            New Task
          </Button>
        </CreateTaskDialog>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className='text-center py-6'>
            <p className='text-muted-foreground'>No tasks yet</p>
            <CreateTaskDialog projectId={projectId}>
              <Button variant='outline' size='sm' className='mt-2'>
                Create your first task
              </Button>
            </CreateTaskDialog>
          </div>
        ) : (
          <div className='space-y-2'>
            {tasks.map(task => (
              <div
                key={task.id}
                className='border rounded-lg p-4 hover:bg-accent/50 transition-colors'
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <h4 className='font-medium'>{task.title}</h4>
                    <p className='text-sm text-muted-foreground line-clamp-1'>
                      {task.description || "No description"}
                    </p>
                    <div className='flex gap-2 mt-2'>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' asChild>
                    <Link href={`/tasks/${task.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
