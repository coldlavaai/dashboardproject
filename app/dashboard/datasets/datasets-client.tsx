'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateDatasetModal } from '@/components/create-dataset-modal'
import { Plus, Database, Users, MessageSquare, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Dataset {
  id: string
  name: string
  description: string | null
  source: string
  total_leads: number
  leads_contacted: number
  leads_converted: number
  created_at: string
  updated_at: string
}

export function DatasetsClient() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets')
      const data = await response.json()
      setDatasets(data.datasets || [])
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
            <p className="text-muted-foreground">
              Manage your lead databases and campaigns
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground">
            Manage your lead databases and campaigns
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Dataset
        </Button>
      </div>

      {datasets.length === 0 ? (
        /* Empty State */
        <Card>
          <CardHeader>
            <CardTitle>No datasets yet</CardTitle>
            <CardDescription>
              Create your first dataset to start reactivating your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Database className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Get started with your first dataset</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Upload a CSV file with your leads or connect to an external source to begin your database reactivation campaign.
              </p>
              <Button size="lg" onClick={() => setModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Datasets Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <Link href={`/dashboard/datasets/${dataset.id}`} key={dataset.id}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Database className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{dataset.name}</CardTitle>
                  {dataset.description && (
                    <CardDescription className="line-clamp-2">
                      {dataset.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{dataset.total_leads || 0}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{dataset.leads_contacted || 0}</div>
                      <div className="text-xs text-muted-foreground">Contacted</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{dataset.leads_converted || 0}</div>
                      <div className="text-xs text-muted-foreground">Converted</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateDatasetModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
