'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const organizations = [
  {
    label: 'My Workspace',
    value: 'personal',
    icon: '👤',
  },
  {
    label: 'Acme Corp',
    value: 'acme',
    icon: '🏢',
  },
  {
    label: 'Tech Startup',
    value: 'startup',
    icon: '🚀',
  },
]

export function OrganizationSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [selectedOrg, setSelectedOrg] = React.useState(organizations[0])
  const router = useRouter()

  const handleCreateWorkspace = () => {
    setOpen(false)
    router.push('/organizations/new')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedOrg.icon}</span>
            <span className="truncate">{selectedOrg.label}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {organizations.map((org) => (
                <CommandItem
                  key={org.value}
                  value={org.value}
                  onSelect={() => {
                    setSelectedOrg(org)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{org.icon}</span>
                    <span>{org.label}</span>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedOrg.value === org.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateWorkspace}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
