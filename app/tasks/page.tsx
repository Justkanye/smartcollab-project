import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { fetchTasks } from "../actions/task.actions";
import { SearchBar } from "./_components/search-bar";
import { Button } from "@/components/ui/button";
import { CreateTaskButton } from "./_components/create-task-button";
import { TaskFilters } from "./_components/task-filters";

interface TasksPageProps {
  searchParams: {
    query?: string;
    status?: string;
    priority?: string;
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { data: tasks } = await fetchTasks({
    query: searchParams.query,
    status: searchParams.status,
    priority: searchParams.priority,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "In Progress":
        return "default";
      case "Done":
        return "secondary";
      case "To Do":
        return "outline";
      case "In Review":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
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
      year: "numeric",
    });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return (
      new Date(dueDate) < new Date() &&
      tasks.find(t => t.due_date === dueDate)?.status !== "Done"
    );
  };

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Tasks</h2>
        <CreateTaskButton />
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4'>
        <SearchBar defaultValue={searchParams.query} />
        <TaskFilters 
          status={searchParams.status} 
          priority={searchParams.priority} 
        />
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className='text-center py-12'>
          <div className='mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4'>
            <Plus className='h-12 w-12 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>No tasks found</h3>
          <p className='text-muted-foreground mb-4'>
            {searchParams.query || searchParams.status || searchParams.priority
              ? "Try adjusting your search or filters"
              : "Get started by creating your first task"}
          </p>
          <CreateTaskButton />
        </div>
      ) : (
        <div className='space-y-4'>
          {tasks.map(task => (
            <Card key={task.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1 flex-1'>
                    <CardTitle className='text-lg'>{task.title}</CardTitle>
                    <div className='flex items-center gap-2'>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task.due_date && isOverdue(task.due_date) && (
                        <Badge variant='destructive'>Overdue</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className='line-clamp-2'>
                  {task.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between text-sm text-muted-foreground'>
                  {task.project && (
                    <div className='flex items-center gap-1'>
                      <span>Project: {task.project.name}</span>
                    </div>
                  )}
                  {task.due_date && (
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      <span
                        className={
                          isOverdue(task.due_date) ? "text-red-600" : ""
                        }
                      >
                        Due: {formatDate(task.due_date)}
                      </span>
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-xs text-muted-foreground'>
                    Updated {formatDate(task.updated_at)}
                  </span>
                  <Button variant='outline' size='sm'>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
