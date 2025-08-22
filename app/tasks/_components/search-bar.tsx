'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`/tasks?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search tasks..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
