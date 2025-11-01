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
import { Search, ChevronLeft, ChevronRight, Phone, Mail, Building2 } from 'lucide-react'

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  status: string
  campaign_status: string
  created_at: string
}

interface LeadsTableProps {
  datasetId: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  unqualified: 'bg-gray-100 text-gray-800',
  unresponsive: 'bg-red-100 text-red-800',
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
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
            <SelectItem value="unresponsive">Unresponsive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {leads.length} of {total} leads
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.company ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{lead.company}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[lead.status] || 'bg-gray-100 text-gray-800'}
                  >
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {lead.campaign_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(lead.created_at).toLocaleDateString()}
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
