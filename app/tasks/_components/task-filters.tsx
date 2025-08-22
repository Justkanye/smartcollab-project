'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFiltersProps {
  status?: string;
  priority?: string;
}

export function TaskFilters({ status, priority }: TaskFiltersProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleFilterChange = (key: 'status' | 'priority', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    replace(`/tasks?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select
        value={status || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="To Do">To Do</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="In Review">In Review</SelectItem>
          <SelectItem value="Done">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={priority || 'all'}
        onValueChange={(value) => handleFilterChange('priority', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
