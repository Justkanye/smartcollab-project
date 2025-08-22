'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectFiltersProps {
  status?: string;
  priority?: string;
}

export function ProjectFilters({ status, priority }: ProjectFiltersProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleFilterChange = (key: 'status' | 'priority', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    replace(`/projects?${params.toString()}`);
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
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
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
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
