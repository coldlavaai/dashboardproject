'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  company_name: string
  industry: string
  logo_url: string | null
  primary_color: string
  status: string
  plan: string
  role: string
  created_at: string
}

type ClientContextType = {
  currentClient: Client | null
  clients: Client[]
  setCurrentClient: (client: Client) => void
  isLoading: boolean
  refreshClients: () => Promise<void>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()

      if (data.clients) {
        setClients(data.clients)

        // If no current client is set, set the first one
        if (!currentClient && data.clients.length > 0) {
          const savedClientId = localStorage.getItem('currentClientId')
          const clientToSet =
            data.clients.find((c: Client) => c.id === savedClientId) ||
            data.clients[0]
          setCurrentClient(clientToSet)
          localStorage.setItem('currentClientId', clientToSet.id)
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshClients()
  }, [])

  const handleSetCurrentClient = (client: Client) => {
    setCurrentClient(client)
    localStorage.setItem('currentClientId', client.id)
    router.refresh()
  }

  return (
    <ClientContext.Provider
      value={{
        currentClient,
        clients,
        setCurrentClient: handleSetCurrentClient,
        isLoading,
        refreshClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return context
}
