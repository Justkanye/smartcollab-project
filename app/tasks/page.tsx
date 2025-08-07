"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, MoreHorizontal, Plus, Search, CheckCircle, Clock, AlertCircle, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const tasks = [
    {
      id: 1,
      title: "Update user authentication flow",
      description: "Implement OAuth 2.0 and improve security measures",
      project: "Website Redesign",
      assignee: { name: "John Doe", avatar: "JD" },
      priority: "High",
      status: "In Progress",
      dueDate: "Today",
      completed: false,
      tags: ["Frontend", "Security"],
    },
    {
      id: 2,
      title: "Design mobile wireframes",
      description: "Create wireframes for iOS and Android app screens",
      project: "Mobile App Development",
      assignee: { name: "Sarah Miller", avatar: "SM" },
      priority: "Medium",
      status: "To Do",
      dueDate: "Tomorrow",
      completed: false,
      tags: ["Design", "Mobile"],
    },
    {
      id: 3,
      title: "Review marketing copy",
      description: "Review and approve final marketing campaign copy",
      project: "Marketing Campaign",
      assignee: { name: "Alex Brown", avatar: "AB" },
      priority: "Low",
      status: "In Review",
      dueDate: "Dec 12",
      completed: false,
      tags: ["Marketing", "Content"],
    },
    {
      id: 4,
      title: "Set up CI/CD pipeline",
      description: "Configure automated testing and deployment",
      project: "Website Redesign",
      assignee: { name: "Mike Johnson", avatar: "MJ" },
      priority: "High",
      status: "Done",
      dueDate: "Dec 5",
      completed: true,
      tags: ["DevOps", "Backend"],
    },
    {
      id: 5,
      title: "Create user personas",
      description: "Research and define target user personas",
      project: "Mobile App Development",
      assignee: { name: "Kate Lee", avatar: "KL" },
      priority: "Medium",
      status: "In Progress",
      dueDate: "Dec 15",
      completed: false,
      tags: ["Research", "UX"],
    },
    {
      id: 6,
      title: "Database optimization",
      description: "Optimize database queries for better performance",
      project: "API Integration",
      assignee: { name: "David Chen", avatar: "DC" },
      priority: "High",
      status: "To Do",
      dueDate: "Dec 20",
      completed: false,
      tags: ["Backend", "Performance"],
    },
  ]

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.completed) ||
      (filterStatus === "pending" && !task.completed) ||
      filterStatus === task.status.toLowerCase().replace(" ", "-")

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "default"
      case "In Progress":
        return "secondary"
      case "In Review":
        return "outline"
      case "To Do":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="h-3 w-3" />
      case "Medium":
        return <Clock className="h-3 w-3" />
      case "Low":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">Manage and track all your tasks</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to organize your work.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input id="title" placeholder="Task title" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="description" placeholder="Task description" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project" className="text-right">
                    Project
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website Redesign</SelectItem>
                      <SelectItem value="mobile">Mobile App Development</SelectItem>
                      <SelectItem value="marketing">Marketing Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right">
                    Assignee
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="sarah">Sarah Miller</SelectItem>
                      <SelectItem value="alex">Alex Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Input id="dueDate" type="date" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Tasks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("to-do")}>To Do</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter((t) => t.completed).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "In Progress").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Manage and track your task progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${task.completed ? "opacity-60" : ""}`}
                >
                  <Checkbox checked={task.completed} className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{task.project}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignee.name}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Move to Project</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                        <Badge variant={getPriorityColor(task.priority)} className="flex items-center gap-1">
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </Badge>
                        {task.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{task.assignee.avatar}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
