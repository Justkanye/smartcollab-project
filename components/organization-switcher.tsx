"use client";

import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { setCurrentOrganization } from "@/app/actions/organization.actions";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [organizations, currentOrganization] = useStore(
    useShallow(state => [
      state.organizations,
      state.organizations.find(org => org.id === state.currentOrganizationId),
    ])
  );

  const { toast } = useToast();

  const handleSelect = async (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);
    if (org) {
      await setCurrentOrganization(org.id);
      window.location.reload();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Organization not found",
      });
      setOpen(false);
    }
  };

  // Default to "My Organization" if no current organization
  const displayName = currentOrganization?.name || "My Organization";
  const displayDescription =
    currentOrganization?.description || currentOrganization
      ? "Organization"
      : "Personal organization";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-label='Select organization'
          className={cn("w-full justify-between", className)}
        >
          <div className='flex items-center gap-2 min-w-0'>
            <div className='flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground text-xs font-semibold'>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className='flex flex-col items-start min-w-0'>
              <span className='text-sm font-medium truncate'>
                {displayName}
              </span>
              <span className='text-xs text-muted-foreground truncate'>
                {displayDescription}
              </span>
            </div>
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search organizations...' />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading='Organizations'>
              {organizations.map(organization => (
                <CommandItem
                  key={organization.id}
                  onSelect={() => handleSelect(organization.id)}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <div className='flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground text-xs font-semibold'>
                    {organization.name.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                      {organization.name}
                    </span>
                    {organization.description && (
                      <span className='text-xs text-muted-foreground'>
                        {organization.description}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentOrganization?.id === organization.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator className='my-2' />
            <CommandGroup>
              <CreateOrganizationDialog>
                <Button className='w-full' variant='secondary'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Organization
                </Button>
              </CreateOrganizationDialog>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
