"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Timeline() {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      startDate: "2024-11-01",
      endDate: "2024-12-15",
      progress: 75,
      color: "bg-blue-500",
      team: ["JD", "SM", "AB"],
      tasks: [
        { name: "UI Design", start: "2024-11-01", end: "2024-11-15", progress: 100 },
        { name: "Frontend Development", start: "2024-11-10", end: "2024-12-05", progress: 80 },
        { name: "Backend Integration", start: "2024-11-20", end: "2024-12-10", progress: 60 },
        { name: "Testing & QA", start: "2024-12-01", end: "2024-12-15", progress: 30 },
      ],
    },
    {
      id: 2,
      name: "Mobile App Development",
      startDate: "2024-12-01",
      endDate: "2025-01-30",
      progress: 45,
      color: "bg-green-500",
      team: ["MJ", "KL", "RP"],
      tasks: [
        { name: "App Architecture", start: "2024-12-01", end: "2024-12-10", progress: 100 },
        { name: "iOS Development", start: "2024-12-05", end: "2025-01-15", progress: 40 },
        { name: "Android Development", start: "2024-12-05", end: "2025-01-15", progress: 35 },
        { name: "App Store Submission", start: "2025-01-20", end: "2025-01-30", progress: 0 },
      ],
    },
    {
      id: 3,
      name: "Marketing Campaign",
      startDate: "2024-11-15",
      endDate: "2024-12-10",
      progress: 90,
      color: "bg-purple-500",
      team: ["TW", "GH"],
      tasks: [
        { name: "Content Creation", start: "2024-11-15", end: "2024-11-25", progress: 100 },
        { name: "Social Media Setup", start: "2024-11-20", end: "2024-11-30", progress: 100 },
        { name: "Campaign Launch", start: "2024-12-01", end: "2024-12-10", progress: 80 },
      ],
    },
  ]

  const months = ["November 2024", "December 2024", "January 2025", "February 2025"]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getProjectPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const baseDate = new Date(2024, 10, 1) // November 1, 2024

    const startOffset = Math.floor((start.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return {
      left: `${(startOffset / 120) * 100}%`, // 120 days total view
      width: `${(duration / 120) * 100}%`,
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Timeline</h1>
            <p className="text-sm text-muted-foreground">Project timelines and Gantt charts</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="quarter">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Timeline Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline
            </CardTitle>
            <CardDescription>Visual overview of all project schedules and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Timeline Grid */}
            <div className="space-y-6">
              {/* Month Headers */}
              <div className="flex border-b pb-2">
                <div className="w-64 flex-shrink-0"></div>
                <div className="flex-1 grid grid-cols-4 gap-0">
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="text-center text-sm font-medium text-muted-foreground border-l first:border-l-0 px-2"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Headers */}
              <div className="flex">
                <div className="w-64 flex-shrink-0"></div>
                <div className="flex-1 relative">
                  <div className="grid grid-cols-30 gap-0 text-xs text-muted-foreground">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div key={i} className="text-center py-1 border-l first:border-l-0">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Rows */}
              {projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-64 flex-shrink-0 pr-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{project.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {project.progress}%
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${project.color}`} />
                          <div className="flex -space-x-1">
                            {project.team.map((member, i) => (
                              <Avatar key={i} className="h-5 w-5 border border-background">
                                <AvatarFallback className="text-xs">{member}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-8">
                      <div className="absolute inset-0 grid grid-cols-30 gap-0">
                        {Array.from({ length: 30 }, (_, i) => (
                          <div key={i} className="border-l first:border-l-0 border-muted"></div>
                        ))}
                      </div>
                      <div
                        className={`absolute top-1 bottom-1 ${project.color} rounded opacity-80 flex items-center px-2`}
                        style={getProjectPosition(project.startDate, project.endDate)}
                      >
                        <div className="text-xs text-white font-medium truncate">{project.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Task Breakdown */}
                  <div className="ml-8 space-y-1">
                    {project.tasks.map((task, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-56 flex-shrink-0 pr-4">
                          <div className="text-sm text-muted-foreground">{task.name}</div>
                        </div>
                        <div className="flex-1 relative h-4">
                          <div className="absolute inset-0 grid grid-cols-30 gap-0">
                            {Array.from({ length: 30 }, (_, j) => (
                              <div key={j} className="border-l first:border-l-0 border-muted/50"></div>
                            ))}
                          </div>
                          <div
                            className={`absolute top-0.5 bottom-0.5 ${project.color} rounded-sm opacity-60`}
                            style={getProjectPosition(task.start, task.end)}
                          >
                            <div className="h-full bg-white/20 rounded-sm" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Projects</span>
                <span className="font-medium">{projects.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>On Schedule</span>
                <span className="font-medium text-green-600">2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Behind Schedule</span>
                <span className="font-medium text-red-600">1</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Marketing Campaign Launch</span>
                  <Badge variant="outline">Dec 10</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Website Redesign Complete</span>
                  <Badge variant="outline">Dec 15</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Mobile App Beta</span>
                  <Badge variant="outline">Jan 15</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Developers</span>
                  <span className="font-medium">8/10</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Designers</span>
                  <span className="font-medium">3/4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Project Managers</span>
                  <span className="font-medium">2/2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
