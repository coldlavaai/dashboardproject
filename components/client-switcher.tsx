'use client'

import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useClient } from '@/lib/clients/context'
import { useState } from 'react'

export function ClientSwitcher() {
  const { currentClient, clients, setCurrentClient, isLoading } = useClient()
  const [open, setOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
        <div className="w-4 h-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!currentClient) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentClient.company_name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => {
                setCurrentClient(client)
                setOpen(false)
              }}
              className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                currentClient.id === client.id && 'bg-accent'
              )}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  currentClient.id === client.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-medium">{client.company_name}</div>
                <div className="truncate text-xs text-muted-foreground capitalize">
                  {client.industry} • {client.role}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t p-2">
          <button
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            disabled
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add client</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
