'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, ChevronLeft, ChevronRight, Calendar, MessageSquare, Phone as PhoneIcon, Archive, Edit2, Trash2, Plus, Loader2 } from 'lucide-react'

interface Lead {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  email: string | null
  postcode: string
  inquiry_date: string | null
  notes: string | null
  contact_status: string
  lead_sentiment: string | null
  reply_received_at: string | null
  m1_sent_at: string | null
  m2_sent_at: string | null
  m3_sent_at: string | null
  latest_lead_reply: string | null
  manual_mode: boolean
  call_booked: boolean
  archived: boolean
  install_date: string | null
  created_at: string
  custom_fields?: Record<string, any>
}

interface LeadsTableProps {
  datasetId: string
}

const statusColors: Record<string, string> = {
  READY: 'bg-blue-100 text-blue-800',
  HOT: 'bg-red-100 text-red-800',
  WARM: 'bg-orange-100 text-orange-800',
  COLD: 'bg-slate-100 text-slate-800',
  CONVERTED: 'bg-green-100 text-green-800',
  UNRESPONSIVE: 'bg-gray-100 text-gray-800',
}

const sentimentColors: Record<string, string> = {
  POSITIVE: 'bg-green-100 text-green-800',
  NEUTRAL: 'bg-gray-100 text-gray-800',
  NEGATIVE: 'bg-red-100 text-red-800',
}

// Format date to short format
const formatDate = (dateString: string | null) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
}

// Format date to time ago
const formatTimeAgo = (dateString: string | null) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return formatDate(dateString)
}

export function LeadsTable({ datasetId }: LeadsTableProps) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Edit/Add/Delete states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state for edit/add
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    postcode: '',
    inquiry_date: '',
    notes: '',
    contact_status: 'READY',
  })

  useEffect(() => {
    fetchLeads()
  }, [page, search, statusFilter])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (search) {
        params.append('search', search)
      }

      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/datasets/${datasetId}/leads?${params}`)
      const data = await response.json()

      if (data.leads) {
        setLeads(data.leads)
        setTotalPages(data.pagination.pages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value)
    setPage(1)
  }

  const handleEditClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedLead(lead)
    setFormData({
      first_name: lead.first_name,
      last_name: lead.last_name,
      phone_number: lead.phone_number,
      email: lead.email || '',
      postcode: lead.postcode,
      inquiry_date: lead.inquiry_date ? lead.inquiry_date.split('T')[0] : '',
      notes: lead.notes || '',
      contact_status: lead.contact_status,
    })
    setEditDialogOpen(true)
  }

  const handleAddClick = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      postcode: '',
      inquiry_date: '',
      notes: '',
      contact_status: 'READY',
    })
    setAddDialogOpen(true)
  }

  const handleDeleteClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedLead(lead)
    setDeleteDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedLead) return

    setSaving(true)
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update lead')
      }

      await fetchLeads()
      setEditDialogOpen(false)
      setSelectedLead(null)
    } catch (error: any) {
      console.error('Error updating lead:', error)
      alert(error.message || 'Failed to update lead')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLead = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      alert('Please fill in required fields: First Name, Last Name, and Phone Number')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId,
          leads: [formData],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add lead')
      }

      await fetchLeads()
      setAddDialogOpen(false)
    } catch (error: any) {
      console.error('Error adding lead:', error)
      alert(error.message || 'Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!selectedLead) return

    setSaving(true)
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete lead')
      }

      await fetchLeads()
      setDeleteDialogOpen(false)
      setSelectedLead(null)
    } catch (error: any) {
      console.error('Error deleting lead:', error)
      alert(error.message || 'Failed to delete lead')
    } finally {
      setSaving(false)
    }
  }

  if (loading && leads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading leads...
      </div>
    )
  }

  if (!loading && leads.length === 0 && !search && !statusFilter) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No leads found in this dataset.</p>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Lead
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Add Button */}
      <div className="flex gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, or company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="HOT">Hot</SelectItem>
            <SelectItem value="WARM">Warm</SelectItem>
            <SelectItem value="COLD">Cold</SelectItem>
            <SelectItem value="CONVERTED">Converted</SelectItem>
            <SelectItem value="UNRESPONSIVE">Unresponsive</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {leads.length} of {total} leads
      </div>

      {!loading && leads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No leads match your filters.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch('')
              setSearchInput('')
              setStatusFilter('')
              setPage(1)
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Table - Simplified View with Actions */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">First Name</TableHead>
                  <TableHead className="min-w-[120px]">Last Name</TableHead>
                  <TableHead className="min-w-[140px]">Phone</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Postcode</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Inquiry</TableHead>
                  <TableHead className="min-w-[150px]">Notes</TableHead>
                  <TableHead className="min-w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                  >
                    <TableCell className="font-medium">{lead.first_name}</TableCell>
                    <TableCell className="font-medium">{lead.last_name}</TableCell>
                    <TableCell className="text-sm font-mono">{lead.phone_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.email || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{lead.postcode}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[lead.contact_status] || 'bg-gray-100 text-gray-800'}
                      >
                        {lead.contact_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(lead.inquiry_date)}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={lead.notes || ''}>
                      {lead.notes ? (
                        <span className="text-muted-foreground italic">
                          {lead.notes.length > 30
                            ? lead.notes.substring(0, 30) + '...'
                            : lead.notes}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditClick(lead, e)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(lead, e)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Lead Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the lead information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name *</Label>
                <Input
                  id="edit-first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name *</Label>
                <Input
                  id="edit-last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+447123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-postcode">Postcode</Label>
                <Input
                  id="edit-postcode"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.contact_status}
                  onValueChange={(value) => setFormData({ ...formData, contact_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="HOT">Hot</SelectItem>
                    <SelectItem value="WARM">Warm</SelectItem>
                    <SelectItem value="COLD">Cold</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="UNRESPONSIVE">Unresponsive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-inquiry-date">Inquiry Date</Label>
              <Input
                id="edit-inquiry-date"
                type="date"
                value={formData.inquiry_date}
                onChange={(e) => setFormData({ ...formData, inquiry_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the lead information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-first-name">First Name *</Label>
                <Input
                  id="add-first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-last-name">Last Name *</Label>
                <Input
                  id="add-last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone Number *</Label>
                <Input
                  id="add-phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+447123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-postcode">Postcode</Label>
                <Input
                  id="add-postcode"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status">Status</Label>
                <Select
                  value={formData.contact_status}
                  onValueChange={(value) => setFormData({ ...formData, contact_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="HOT">Hot</SelectItem>
                    <SelectItem value="WARM">Warm</SelectItem>
                    <SelectItem value="COLD">Cold</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="UNRESPONSIVE">Unresponsive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-inquiry-date">Inquiry Date</Label>
              <Input
                id="add-inquiry-date"
                type="date"
                value={formData.inquiry_date}
                onChange={(e) => setFormData({ ...formData, inquiry_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Textarea
                id="add-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddLead} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedLead?.first_name} {selectedLead?.last_name}?
              <br /><br />
              This action cannot be undone. All conversation history and data for this lead will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Deleting...' : 'Delete Lead'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
