"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MoreHorizontal, Plus, Search, Users, MapPin, Calendar, Activity } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Team() {
  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@company.com",
      role: "Frontend Developer",
      department: "Engineering",
      avatar: "JD",
      status: "online",
      location: "New York, NY",
      joinDate: "Jan 2023",
      projects: ["Website Redesign", "Mobile App"],
      skills: ["React", "TypeScript", "CSS"],
      workload: 85,
    },
    {
      id: 2,
      name: "Sarah Miller",
      email: "sarah@company.com",
      role: "UI/UX Designer",
      department: "Design",
      avatar: "SM",
      status: "online",
      location: "San Francisco, CA",
      joinDate: "Mar 2023",
      projects: ["Website Redesign", "Marketing Campaign"],
      skills: ["Figma", "Adobe XD", "Prototyping"],
      workload: 70,
    },
    {
      id: 3,
      name: "Alex Brown",
      email: "alex@company.com",
      role: "Marketing Manager",
      department: "Marketing",
      avatar: "AB",
      status: "away",
      location: "Austin, TX",
      joinDate: "Feb 2023",
      projects: ["Marketing Campaign"],
      skills: ["Content Strategy", "SEO", "Analytics"],
      workload: 60,
    },
    {
      id: 4,
      name: "Mike Johnson",
      email: "mike@company.com",
      role: "Backend Developer",
      department: "Engineering",
      avatar: "MJ",
      status: "online",
      location: "Seattle, WA",
      joinDate: "Dec 2022",
      projects: ["Mobile App", "API Integration"],
      skills: ["Node.js", "Python", "PostgreSQL"],
      workload: 90,
    },
    {
      id: 5,
      name: "Kate Lee",
      email: "kate@company.com",
      role: "Product Manager",
      department: "Product",
      avatar: "KL",
      status: "offline",
      location: "Boston, MA",
      joinDate: "Apr 2023",
      projects: ["Mobile App", "Website Redesign"],
      skills: ["Product Strategy", "Analytics", "Agile"],
      workload: 75,
    },
    {
      id: 6,
      name: "David Chen",
      email: "david@company.com",
      role: "DevOps Engineer",
      department: "Engineering",
      avatar: "DC",
      status: "online",
      location: "Los Angeles, CA",
      joinDate: "May 2023",
      projects: ["API Integration", "Security Audit"],
      skills: ["AWS", "Docker", "Kubernetes"],
      workload: 80,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return "text-red-600"
    if (workload >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const departments = [...new Set(teamMembers.map((member) => member.department))]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        {/* <SidebarTrigger className="-ml-1" /> */}
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Team</h1>
            <p className="text-sm text-muted-foreground">Manage your team members and their roles</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Invite a new team member to join your workspace.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" placeholder="Full name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="email@company.com" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Input id="role" placeholder="Job title" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Team Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.filter((m) => m.status === "online").length}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(teamMembers.reduce((acc, m) => acc + m.workload, 0) / teamMembers.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Team capacity</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search team members..." className="pl-8 w-[300px]" />
            </div>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/placeholder-user.jpg`} alt={member.name} />
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuItem>Edit Member</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-3 w-3" />
                    {member.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-3 w-3" />
                    {member.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-3 w-3" />
                    Joined {member.joinDate}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Department</span>
                    <Badge variant="outline">{member.department}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workload</span>
                    <span className={`text-sm font-medium ${getWorkloadColor(member.workload)}`}>
                      {member.workload}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Current Projects</span>
                  <div className="flex flex-wrap gap-1">
                    {member.projects.map((project, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
