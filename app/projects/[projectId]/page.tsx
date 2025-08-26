import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  FileText,
  CheckCircle,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { fetchProjectById } from "@/app/actions/project.actions";
import { ProjectTasks } from "./_components/project-tasks";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { getPriorityBadgeVariant, getStatusBadgeVariant } from "@/lib/utils";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const projectId = (await params).projectId;
  const { data: project, error } = await fetchProjectById(projectId);

  if (error || !project) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className='space-y-6 p-4 md:p-8 pt-6'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild>
          <Link href='/projects'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <h1 className='text-3xl font-bold tracking-tight'>Project Details</h1>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-2xl'>{project.name}</CardTitle>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>
                <Button variant='outline' size='sm' asChild>
                  <Link href={`/projects/${project.id}/edit`}>
                    Edit Project
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h3 className='font-medium flex items-center gap-2 mb-1'>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                  Description
                </h3>
                <p className='text-muted-foreground'>
                  {project.description || "No description provided"}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-medium flex items-center gap-2 mb-1'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    Timeline
                  </h3>
                  <div className='text-sm text-muted-foreground'>
                    <p>
                      Start:{" "}
                      {project.start_date
                        ? formatDate(project.start_date)
                        : "Not set"}
                    </p>
                    <p>
                      Due:{" "}
                      {project.due_date
                        ? formatDate(project.due_date)
                        : "No due date"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className='font-medium flex items-center gap-2 mb-1'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    Team
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {project.team_members?.length || 0} members
                  </p>
                </div>
              </div>

              {project.progress !== undefined && (
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <h3 className='font-medium flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-muted-foreground' />
                      Progress
                    </h3>
                    <span className='text-sm font-medium'>
                      {project.progress}%
                    </span>
                  </div>
                  <Progress value={project.progress} className='h-2' />
                </div>
              )}
            </CardContent>
          </Card>

          <ProjectTasks projectId={project.id} />
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Project Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Created
                </h4>
                <p className='text-sm'>{formatDate(project.created_at)}</p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Last Updated
                </h4>
                <p className='text-sm'>{formatDate(project.updated_at)}</p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Created By
                </h4>
                <p className='text-sm'>
                  {project.created_by?.email || "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <CreateTaskDialog projectId={projectId}>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2'
                >
                  <ListChecks className='h-4 w-4' />
                  Create Task
                </Button>
              </CreateTaskDialog>
              <Button
                variant='outline'
                className='w-full justify-start gap-2'
                asChild
              >
                <Link href={`/teams`}>
                  <Users className='h-4 w-4' />
                  Manage Teams
                </Link>
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start gap-2'
                asChild
              >
                <Link href={`/reports`}>
                  <Clock className='h-4 w-4' />
                  Log Time
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
