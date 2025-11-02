'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateDatasetModal } from '@/components/create-dataset-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Database, Users, MessageSquare, TrendingUp, Trash2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteClick = (dataset: Dataset, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDatasetToDelete(dataset)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!datasetToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/datasets/${datasetToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete dataset')
      }

      // Immediately remove from state for instant UI update
      setDatasets(datasets.filter(d => d.id !== datasetToDelete.id))
      setDeleteDialogOpen(false)
      setDatasetToDelete(null)

      console.log('Dataset deleted successfully')
    } catch (error) {
      console.error('Error deleting dataset:', error)
      alert('Failed to delete dataset. Please try again.')
    } finally {
      setDeleting(false)
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
            <div key={dataset.id} className="relative group">
              <Link href={`/datasets/${dataset.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Database className="h-5 w-5 text-primary" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDeleteClick(dataset, e)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
            </div>
          ))}
        </div>
      )}

      <CreateDatasetModal open={modalOpen} onOpenChange={setModalOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{datasetToDelete?.name}"? This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>{datasetToDelete?.total_leads || 0} leads</strong></li>
                <li>All conversations and messages</li>
                <li>All campaign history</li>
              </ul>
              <p className="mt-2 font-semibold text-destructive">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Dataset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
