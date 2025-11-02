import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('datasetId')

    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // Get user's client
    const { data: userClient } = await (supabase
      .from('user_clients') as any)
      .select('client_id')
      .eq('user_id', user.id)
      .single()

    if (!userClient) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 })
    }

    // Build query
    let query = (supabaseAdmin
      .from('leads') as any)
      .select('contact_status, reply_received_at, m1_sent_at, m2_sent_at, m3_sent_at', { count: 'exact' })
      .eq('client_id', userClient.client_id)

    // Filter by dataset if specified
    if (datasetId && datasetId !== 'all') {
      query = query.eq('dataset_id', datasetId)
    }

    const { data: leads, count: totalLeads } = await query

    if (!leads) {
      return NextResponse.json({
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        callsBooked: 0,
        converted: 0,
        replyRate: 0,
        messagesSent: 0,
      })
    }

    // Calculate stats
    const hotLeads = leads.filter((l: any) => l.contact_status === 'HOT').length
    const warmLeads = leads.filter((l: any) => l.contact_status === 'WARM').length
    const coldLeads = leads.filter((l: any) => l.contact_status === 'COLD').length
    const callsBooked = leads.filter((l: any) => l.contact_status === 'CALL_BOOKED').length
    const converted = leads.filter((l: any) => l.contact_status === 'CONVERTED').length

    // Calculate messages sent (M1 + M2 + M3)
    const messagesSent = leads.reduce((acc: number, l: any) => {
      let count = 0
      if (l.m1_sent_at) count++
      if (l.m2_sent_at) count++
      if (l.m3_sent_at) count++
      return acc + count
    }, 0)

    // Calculate reply rate
    const repliedLeads = leads.filter((l: any) => l.reply_received_at !== null).length
    const replyRate = messagesSent > 0 ? ((repliedLeads / (totalLeads || 1)) * 100).toFixed(1) : '0.0'

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      hotLeads,
      warmLeads,
      coldLeads,
      callsBooked,
      converted,
      replyRate: parseFloat(replyRate),
      messagesSent,
    })
  } catch (error: any) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
