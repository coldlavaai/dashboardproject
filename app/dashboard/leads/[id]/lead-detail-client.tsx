'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  Save,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  notes: string | null
  status: string
  campaign_status: string
  created_at: string
  updated_at: string
  dataset: {
    id: string
    name: string
  }
}

interface LeadDetailClientProps {
  leadId: string
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'unresponsive', label: 'Unresponsive' },
]

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  unqualified: 'bg-gray-100 text-gray-800',
  unresponsive: 'bg-red-100 text-red-800',
}

export function LeadDetailClient({ leadId }: LeadDetailClientProps) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [editedStatus, setEditedStatus] = useState('')

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`)

      if (!response.ok) {
        throw new Error('Lead not found')
      }

      const data = await response.json()
      setLead(data.lead)
      setEditedNotes(data.lead.notes || '')
      setEditedStatus(data.lead.status)
    } catch (err) {
      console.error('Error fetching lead:', err)
      setError('Failed to load lead')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lead) return

    setSaving(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: editedNotes,
          status: editedStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update lead')
      }

      const data = await response.json()
      setLead(data.lead)
      router.refresh()
    } catch (err) {
      console.error('Error updating lead:', err)
      alert('Failed to update lead')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = lead && (
    editedNotes !== (lead.notes || '') ||
    editedStatus !== lead.status
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || 'The lead you are looking for does not exist.'}
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            From dataset:{' '}
            <Link
              href={`/dashboard/datasets/${lead.dataset.id}`}
              className="text-primary hover:underline"
            >
              {lead.dataset.name}
            </Link>
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column - Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${lead.phone}`}
                    className="font-medium hover:text-primary"
                  >
                    {lead.phone}
                  </a>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={`tel:${lead.phone}`}>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-medium hover:text-primary break-all"
                    >
                      {lead.email}
                    </a>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${lead.email}`}>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}

              {lead.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{lead.company}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Lead Status</Label>
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Campaign Status</Label>
                <Badge variant="outline" className="mt-2">
                  {lead.campaign_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Notes & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Add internal notes about this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                rows={8}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                SMS conversation history with this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No conversation history yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Conversations will appear here once messaging begins
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
