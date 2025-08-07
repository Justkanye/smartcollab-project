"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CheckCircle, Clock, Plus, Target, Users, Activity, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useProjects } from '@/hooks/use-projects'
import { useTasks } from '@/hooks/use-tasks'
import { useAuth } from '@/contexts/auth-context'

export default function Dashboard() {
  const { user } = useAuth()
  const { projects, loading: projectsLoading } = useProjects()
  const { tasks, loading: tasksLoading } = useTasks()

  const stats = [
    {
      title: "Active Projects",
      value: projects.filter(p => p.status !== 'Completed').length.toString(),
      change: "+2 from last month",
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: "Completed Tasks",
      value: tasks.filter(t => t.completed).length.toString(),
      change: "+18% from last week",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "My Tasks",
      value: tasks.filter(t => t.assigned_to === user?.id).length.toString(),
      change: "Assigned to you",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Total Tasks",
      value: tasks.length.toString(),
      change: "All tasks",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  const recentProjects = projects.slice(0, 3).map(project => ({
    name: project.name,
    progress: project.progress,
    dueDate: project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No due date',
    status: project.status,
    team: project.project_members?.map(member => 
      member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'
    ) || [],
  }))

  const recentTasks = tasks.slice(0, 3).map(task => ({
    title: task.title,
    project: task.projects?.name || 'No Project',
    assignee: task.assigned_to_profile?.full_name || 'Unassigned',
    priority: task.priority,
    dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date',
  }))

  if (projectsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Show welcome message if no projects exist yet
  if (projects.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome to SmartCollab! Get started by creating your first project.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Welcome to SmartCollab!</CardTitle>
              <CardDescription>
                Start by creating your first project to organize your work and collaborate with your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, John! Here's what's happening with your projects.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recent Projects
              </CardTitle>
              <CardDescription>Track progress on your active projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{project.name}</p>
                      <p className="text-xs text-muted-foreground">Due {project.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === "On Track" ? "default" : "secondary"}>{project.status}</Badge>
                      <div className="flex -space-x-1">
                        {project.team.map((member, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">{member}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
              <CardDescription>Your latest task assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTasks.map((task, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.project}</span>
                      <span>•</span>
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.priority === "High"
                            ? "destructive"
                            : task.priority === "Medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Sarah Miller</span> completed task "Design homepage mockup" in{" "}
                    <span className="font-medium">Website Redesign</span>
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Alex Brown</span> added a comment to{" "}
                    <span className="font-medium">Marketing Campaign</span>
                  </p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Mike Johnson</span> created new project{" "}
                    <span className="font-medium">API Integration</span>
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
