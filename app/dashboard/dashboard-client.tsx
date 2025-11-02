'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, TrendingUp, Phone, Target, MessageSquare, Zap } from 'lucide-react'

interface DashboardStats {
  totalLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  callsBooked: number
  converted: number
  replyRate: number
  messagesS

ent: number
}

interface Dataset {
  id: string
  name: string
  total_leads: number
}

interface Lead {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  email: string | null
  postcode: string
  contact_status: string
  lead_sentiment: string | null
  m1_sent_at: string | null
  m2_sent_at: string | null
  m3_sent_at: string | null
  reply_received_at: string | null
  latest_lead_reply: string | null
  manual_mode: boolean
  call_booked: boolean
  call_booked_time: string | null
  archived: boolean
  created_at: string
}

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    callsBooked: 0,
    converted: 0,
    replyRate: 0,
    messagesSent: 0,
  })
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>('all')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedDataset])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch datasets
      const datasetsRes = await fetch('/api/datasets')
      const datasetsData = await datasetsRes.json()
      setDatasets(datasetsData.datasets || [])

      // Fetch stats
      const statsUrl = selectedDataset === 'all'
        ? '/api/dashboard/stats'
        : `/api/dashboard/stats?datasetId=${selectedDataset}`
      const statsRes = await fetch(statsUrl)
      const statsData = await statsRes.json()
      setStats(statsData)

      // Fetch leads
      const leadsUrl = selectedDataset === 'all'
        ? '/api/dashboard/leads'
        : `/api/dashboard/leads?datasetId=${selectedDataset}`
      const leadsRes = await fetch(leadsUrl)
      const leadsData = await leadsRes.json()
      setLeads(leadsData.leads || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group leads by status
  const leadsByStatus = {
    CONVERTED: leads.filter(l => l.contact_status === 'CONVERTED'),
    CALL_BOOKED: leads.filter(l => l.contact_status === 'CALL_BOOKED'),
    HOT: leads.filter(l => l.contact_status === 'HOT'),
    WARM: leads.filter(l => l.contact_status === 'WARM'),
    COLD: leads.filter(l => l.contact_status === 'COLD'),
    READY: leads.filter(l => l.contact_status === 'READY'),
    CONTACTED: leads.filter(l => ['CONTACTED_1', 'CONTACTED_2', 'CONTACTED_3'].includes(l.contact_status)),
    ALREADY_INSTALLED: leads.filter(l => l.contact_status === 'ALREADY_INSTALLED'),
    REMOVED: leads.filter(l => l.contact_status === 'REMOVED'),
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header with Dataset Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your database reactivation campaigns
          </p>
        </div>
        <Select value={selectedDataset} onValueChange={setSelectedDataset}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select dataset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Datasets</SelectItem>
            {datasets.map((dataset) => (
              <SelectItem key={dataset.id} value={dataset.id}>
                {dataset.name} ({dataset.total_leads} leads)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Across {selectedDataset === 'all' ? datasets.length : 1} dataset{selectedDataset === 'all' && datasets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HOT Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hotLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? ((stats.hotLeads / stats.totalLeads) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WARM Leads</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.warmLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? ((stats.warmLeads / stats.totalLeads) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COLD Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.coldLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? ((stats.coldLeads / stats.totalLeads) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Booked</CardTitle>
            <Phone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.callsBooked}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? ((stats.callsBooked / stats.totalLeads) * 100).toFixed(1) : 0}% booking rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLeads > 0 ? ((stats.converted / stats.totalLeads) * 100).toFixed(1) : 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.messagesSent} messages sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Buckets */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading leads...</div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No leads found in selected dataset{selectedDataset !== 'all' ? '' : 's'}</p>
              <p className="text-sm text-muted-foreground">Upload a CSV to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* CONVERTED Section */}
          {leadsByStatus.CONVERTED.length > 0 && (
            <StatusBucket
              title="Converted"
              count={leadsByStatus.CONVERTED.length}
              leads={leadsByStatus.CONVERTED}
              color="purple"
            />
          )}

          {/* CALL BOOKED Section */}
          {leadsByStatus.CALL_BOOKED.length > 0 && (
            <StatusBucket
              title="Call Booked"
              count={leadsByStatus.CALL_BOOKED.length}
              leads={leadsByStatus.CALL_BOOKED}
              color="green"
            />
          )}

          {/* HOT Section */}
          {leadsByStatus.HOT.length > 0 && (
            <StatusBucket
              title="HOT Leads"
              count={leadsByStatus.HOT.length}
              leads={leadsByStatus.HOT}
              color="red"
            />
          )}

          {/* WARM Section */}
          {leadsByStatus.WARM.length > 0 && (
            <StatusBucket
              title="WARM Leads"
              count={leadsByStatus.WARM.length}
              leads={leadsByStatus.WARM}
              color="orange"
            />
          )}

          {/* COLD Section */}
          {leadsByStatus.COLD.length > 0 && (
            <StatusBucket
              title="COLD Leads"
              count={leadsByStatus.COLD.length}
              leads={leadsByStatus.COLD}
              color="blue"
            />
          )}

          {/* READY Section */}
          {leadsByStatus.READY.length > 0 && (
            <StatusBucket
              title="Ready to Contact"
              count={leadsByStatus.READY.length}
              leads={leadsByStatus.READY}
              color="gray"
            />
          )}

          {/* CONTACTED Section */}
          {leadsByStatus.CONTACTED.length > 0 && (
            <StatusBucket
              title="Contacted (No Reply)"
              count={leadsByStatus.CONTACTED.length}
              leads={leadsByStatus.CONTACTED}
              color="slate"
            />
          )}

          {/* ALREADY INSTALLED Section */}
          {leadsByStatus.ALREADY_INSTALLED.length > 0 && (
            <StatusBucket
              title="Already Installed (Remarket Later)"
              count={leadsByStatus.ALREADY_INSTALLED.length}
              leads={leadsByStatus.ALREADY_INSTALLED}
              color="slate"
            />
          )}

          {/* REMOVED Section */}
          {leadsByStatus.REMOVED.length > 0 && (
            <StatusBucket
              title="Removed / Opted Out"
              count={leadsByStatus.REMOVED.length}
              leads={leadsByStatus.REMOVED}
              color="gray"
            />
          )}
        </div>
      )}
    </div>
  )
}

// StatusBucket Component
interface StatusBucketProps {
  title: string
  count: number
  leads: Lead[]
  color: 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray' | 'slate'
}

function StatusBucket({ title, count, leads, color }: StatusBucketProps) {
  const colorClasses = {
    red: 'border-l-red-500',
    orange: 'border-l-orange-500',
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    gray: 'border-l-gray-400',
    slate: 'border-l-slate-400',
  }

  return (
    <Card className={`border-l-4 ${colorClasses[color]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {count} lead{count !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {lead.first_name} {lead.last_name}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{lead.phone_number}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-2">
                        <span>✉️</span>
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.postcode && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{lead.postcode}</span>
                      </div>
                    )}
                  </div>
                  {lead.latest_lead_reply && (
                    <div className="mt-3 text-sm italic text-muted-foreground border-l-2 pl-3">
                      "{lead.latest_lead_reply.substring(0, 100)}{lead.latest_lead_reply.length > 100 ? '...' : ''}"
                    </div>
                  )}
                </div>
                <div className="ml-4 text-right text-sm text-muted-foreground">
                  {lead.reply_received_at && (
                    <div>
                      Replied {new Date(lead.reply_received_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  )}
                  {lead.call_booked_time && (
                    <div className="text-green-600 font-medium">
                      Call: {new Date(lead.call_booked_time).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
