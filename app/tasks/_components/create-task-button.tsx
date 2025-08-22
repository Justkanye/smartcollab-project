'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from '@/components/create-task-dialog';

export function CreateTaskButton() {
  return (
    <CreateTaskDialog>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New Task
      </Button>
    </CreateTaskDialog>
  );
}
