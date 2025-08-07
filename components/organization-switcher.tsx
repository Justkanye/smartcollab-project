"use client"

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useOrganization } from '@/contexts/organization-context'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false)
  const { organizations, currentOrganization, switchOrganization } = useOrganization()

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
            {!!currentOrganization && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={currentOrganization?.logo_url || ''} />
                <AvatarFallback>
                  {currentOrganization?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="truncate">
              {currentOrganization?.name || 'Select organization'}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organizations found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => {
                    switchOrganization(org)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src={org.logo_url || ''} />
                    <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {org.member_count} members • {org.user_role}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentOrganization?.id === org.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem asChild disabled={false}>
                <Link href="/organizations/new" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Link>
              </CommandItem>
              {currentOrganization && (
                <CommandItem asChild>
                  <Link href="/organizations/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Organization Settings
                  </Link>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
