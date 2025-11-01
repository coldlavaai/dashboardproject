'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, Users, MessageSquare, TrendingUp, Target, Database } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { UploadLeadsModal } from '@/components/upload-leads-modal'

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
  column_mapping: any
}

interface DatasetDetailClientProps {
  datasetId: string
}

export function DatasetDetailClient({ datasetId }: DatasetDetailClientProps) {
  const router = useRouter()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    fetchDataset()
  }, [datasetId])

  const fetchDataset = async () => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`)

      if (!response.ok) {
        throw new Error('Dataset not found')
      }

      const data = await response.json()
      setDataset(data.dataset)
    } catch (err) {
      console.error('Error fetching dataset:', err)
      setError('Failed to load dataset')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !dataset) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/datasets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dataset Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || 'The dataset you are looking for does not exist.'}
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/dashboard/datasets">
                <Button>Back to Datasets</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const conversionRate = dataset.total_leads > 0
    ? ((dataset.leads_converted / dataset.total_leads) * 100).toFixed(1)
    : '0.0'

  const contactRate = dataset.total_leads > 0
    ? ((dataset.leads_contacted / dataset.total_leads) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/datasets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{dataset.name}</h1>
              {dataset.description && (
                <p className="text-muted-foreground mt-1">{dataset.description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Created {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })} • Source: {dataset.source}
          </p>
        </div>
        <Button size="lg" onClick={() => setUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Leads
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataset.total_leads}</div>
            <p className="text-xs text-muted-foreground">
              in this dataset
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataset.leads_contacted}</div>
            <p className="text-xs text-muted-foreground">
              {contactRate}% contact rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataset.leads_converted}</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataset.total_leads - dataset.leads_contacted}
            </div>
            <p className="text-xs text-muted-foreground">
              leads to contact
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Section */}
      {dataset.total_leads === 0 ? (
        /* Empty State */
        <Card>
          <CardHeader>
            <CardTitle>No leads yet</CardTitle>
            <CardDescription>
              Upload a CSV file to add leads to this dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload your first leads</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Import a CSV file with your lead data. You'll be able to map columns and configure your campaign settings.
              </p>
              <Button size="lg" onClick={() => setUploadModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV File
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Leads Table - Coming in Day 5+ */
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>
              View and manage all leads in this dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Leads table coming soon...
            </div>
          </CardContent>
        </Card>
      )}

      <UploadLeadsModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        datasetId={datasetId}
      />
    </div>
  )
}
