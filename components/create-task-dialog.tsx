"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { createTask } from "@/app/actions/task.actions";

interface CreateTaskDialogProps {
  children?: React.ReactNode;
  projectId?: string;
}

export function CreateTaskDialog({
  children,
  projectId,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    due_date: "",
    project_id: projectId || "",
    assigned_to: "",
  });
  const { toast } = useToast();

  const projects = useStore(state => state.projects);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.project_id) {
      toast({
        title: "Error",
        description: "Project is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status as
          | "To Do"
          | "In Progress"
          | "In Review"
          | "Done",
        priority: formData.priority as "Low" | "Medium" | "High",
        due_date: formData.due_date || null,
        project_id: formData.project_id,
        assigned_to: formData.assigned_to || null,
        created_by: "", // Will be set by the hook
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        setFormData({
          title: "",
          description: "",
          status: "To Do",
          priority: "Medium",
          due_date: "",
          project_id: projectId || "",
          assigned_to: "",
        });
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a new task to track work and assign to team members.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Task Title</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={e => handleInputChange("title", e.target.value)}
                placeholder='Enter task title'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => handleInputChange("description", e.target.value)}
                placeholder='Describe the task'
                rows={3}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='To Do'>To Do</SelectItem>
                    <SelectItem value='In Progress'>In Progress</SelectItem>
                    <SelectItem value='In Review'>In Review</SelectItem>
                    <SelectItem value='Done'>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='priority'>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={value => handleInputChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='project_id'>Project</Label>
              <Select
                value={formData.project_id}
                onValueChange={value => handleInputChange("project_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select project' />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='due_date'>Due Date (Optional)</Label>
              <Input
                id='due_date'
                type='date'
                value={formData.due_date}
                onChange={e => handleInputChange("due_date", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading || formData.project_id === "none"}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
