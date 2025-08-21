"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { useOrganizations } from "@/hooks/use-organizations";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { organizations, currentOrganization, switchOrganization, loading } =
    useOrganizations();

  const handleSelect = (organizationId: string) => {
    if (organizationId === "personal") {
      switchOrganization(null);
    } else {
      const org = organizations.find(o => o.id === organizationId);
      if (org) {
        switchOrganization(org);
      }
    }
    setOpen(false);
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
            {organizations.length ? (
              <CommandGroup heading='Organizations'>
                {organizations.map(organization => (
                  <CommandItem
                    key={organization.id}
                    onSelect={() => handleSelect(organization.id)}
                    className='flex items-center gap-2'
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
            ) : (
              <CommandGroup heading='Personal'>
                <CommandItem
                  onSelect={() => handleSelect("personal")}
                  className='flex items-center gap-2'
                >
                  <div className='flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground text-xs font-semibold'>
                    M
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>My Organization</span>
                    <span className='text-xs text-muted-foreground'>
                      Personal organization
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      !currentOrganization ||
                        currentOrganization.id === "personal"
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandGroup>
              <CreateOrganizationDialog>
                <CommandItem
                  onSelect={() => setOpen(false)}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <div className='flex h-6 w-6 items-center justify-center rounded-sm border border-dashed'>
                    <Plus className='h-4 w-4' />
                  </div>
                  <span className='text-sm font-medium'>
                    Create Organization
                  </span>
                </CommandItem>
              </CreateOrganizationDialog>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
