'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateProjectDialog } from '@/components/create-project-dialog';

export function CreateProjectButton() {
  return (
    <CreateProjectDialog>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>
    </CreateProjectDialog>
  );
}
