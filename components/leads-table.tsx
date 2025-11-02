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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, ChevronLeft, ChevronRight, Calendar, MessageSquare, Phone as PhoneIcon, Archive } from 'lucide-react'

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

  if (loading && leads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading leads...
      </div>
    )
  }

  if (!loading && leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {search || statusFilter ? 'No leads match your filters.' : 'No leads found in this dataset.'}
        </p>
        {(search || statusFilter) && (
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
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {leads.length} of {total} leads
      </div>

      {/* Table - DBR Tracking with horizontal scroll */}
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
              <TableHead className="min-w-[100px]">Sentiment</TableHead>
              <TableHead className="min-w-[100px]">Inquiry</TableHead>
              <TableHead className="min-w-[100px]">M1 Sent</TableHead>
              <TableHead className="min-w-[100px]">M2 Sent</TableHead>
              <TableHead className="min-w-[100px]">M3 Sent</TableHead>
              <TableHead className="min-w-[100px]">Reply</TableHead>
              <TableHead className="min-w-[200px]">Latest Reply</TableHead>
              <TableHead className="min-w-[80px] text-center">Manual</TableHead>
              <TableHead className="min-w-[80px] text-center">Call</TableHead>
              <TableHead className="min-w-[80px] text-center">Archive</TableHead>
              <TableHead className="min-w-[100px]">Install</TableHead>
              <TableHead className="min-w-[100px]">Added</TableHead>
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
                <TableCell>
                  {lead.lead_sentiment ? (
                    <Badge
                      variant="secondary"
                      className={sentimentColors[lead.lead_sentiment] || 'bg-gray-100 text-gray-800'}
                    >
                      {lead.lead_sentiment}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(lead.inquiry_date)}
                </TableCell>
                <TableCell className="text-sm">
                  {lead.m1_sent_at ? (
                    <div className="flex items-center gap-1 text-green-700">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-xs">{formatTimeAgo(lead.m1_sent_at)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {lead.m2_sent_at ? (
                    <div className="flex items-center gap-1 text-green-700">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-xs">{formatTimeAgo(lead.m2_sent_at)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {lead.m3_sent_at ? (
                    <div className="flex items-center gap-1 text-green-700">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-xs">{formatTimeAgo(lead.m3_sent_at)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(lead.reply_received_at)}
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate" title={lead.latest_lead_reply || ''}>
                  {lead.latest_lead_reply ? (
                    <span className="text-muted-foreground italic">
                      "{lead.latest_lead_reply.length > 50
                        ? lead.latest_lead_reply.substring(0, 50) + '...'
                        : lead.latest_lead_reply}"
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox checked={lead.manual_mode} disabled />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {lead.call_booked ? (
                    <div className="flex items-center justify-center gap-1 text-green-700">
                      <PhoneIcon className="h-4 w-4" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {lead.archived ? (
                    <div className="flex items-center justify-center gap-1 text-amber-700">
                      <Archive className="h-4 w-4" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(lead.install_date)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(lead.created_at)}
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
    </div>
  )
}
