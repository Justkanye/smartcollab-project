import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Users } from "lucide-react";
import { fetchProjects } from "../actions/project.actions";
import { SearchBar } from "./_components/search-bar";
import { ProjectFilters } from "./_components/project-filters";
import { CreateProjectButton } from "./_components/create-project-button";
import { Suspense } from "react";
import { ProjectsSkeleton } from "./_components/projects-skeleton";
import Link from "next/link";
import { getStatusBadgeVariant, getPriorityBadgeVariant } from "@/lib/utils";

interface ProjectsPageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    priority?: string;
  }>;
}

export default async function ProjectsPage(props: ProjectsPageProps) {
  const searchParams = await props.searchParams;
  const { data: projects } = await fetchProjects({
    query: searchParams.query,
    status: searchParams.status,
    priority: searchParams.priority,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Projects</h2>
        <CreateProjectButton />
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4'>
        <SearchBar defaultValue={searchParams.query} />
        <ProjectFilters
          status={searchParams.status}
          priority={searchParams.priority}
        />
      </div>

      {/* Projects Grid */}
      <Suspense fallback={<ProjectsSkeleton />}>
        {projects.length === 0 ? (
          <div className='text-center py-12'>
            <div className='mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4'>
              <Plus className='h-12 w-12 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No projects found</h3>
            <p className='text-muted-foreground mb-4'>
              {searchParams.query ||
              searchParams.status ||
              searchParams.priority
                ? "Try adjusting your search or filters"
                : "Get started by creating your first project"}
            </p>
            <CreateProjectButton />
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {projects.map(project => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className='block'
              >
                <Card className='hover:shadow-md transition-shadow hover:border-primary/50 h-full'>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='space-y-1 flex-1'>
                        <CardTitle className='text-lg'>
                          {project.name}
                        </CardTitle>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={getStatusBadgeVariant(project.status)}
                          >
                            {project.status}
                          </Badge>
                          <Badge
                            variant={getPriorityBadgeVariant(project.priority)}
                          >
                            {project.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className='line-clamp-2'>
                      {project.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {project.progress !== undefined && (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Progress
                          </span>
                          <span className='font-medium'>
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className='h-2' />
                      </div>
                    )}

                    <div className='flex items-center justify-between text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {project.start_date
                            ? formatDate(project.start_date)
                            : "No start date"}
                        </span>
                      </div>
                      {project.due_date && (
                        <div className='flex items-center gap-1'>
                          <span>Due: {formatDate(project.due_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='text-xs text-muted-foreground'>
                        Updated {formatDate(project.updated_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
