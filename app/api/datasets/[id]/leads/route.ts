import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Use regular client for authorization checks
    const supabase = await createClient()
    // Use service role client for data queries (bypasses RLS)
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

    // Verify dataset belongs to user's client
    const { data: dataset } = await (supabase
      .from('datasets') as any)
      .select('id, client_id')
      .eq('id', id)
      .eq('client_id', userClient.client_id)
      .single()

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Build query using service role client (bypasses RLS)
    let query = (supabaseAdmin
      .from('leads') as any)
      .select('*', { count: 'exact' })
      .eq('dataset_id', id)
      .order('created_at', { ascending: false })

    // Apply search filter (use correct column names)
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%,email.ilike.%${search}%,postcode.ilike.%${search}%`)
    }

    // Apply status filter (use correct column name)
    if (status) {
      query = query.eq('contact_status', status.toUpperCase())
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform leads to match frontend interface (return ALL DBR tracking fields)
    const transformedLeads = (leads || []).map((lead: any) => ({
      id: lead.id,
      first_name: lead.first_name,
      last_name: lead.last_name,
      phone_number: lead.phone_number,
      email: lead.email,
      postcode: lead.postcode,
      inquiry_date: lead.inquiry_date,
      notes: lead.notes,
      contact_status: lead.contact_status || 'READY',
      lead_sentiment: lead.lead_sentiment,
      reply_received_at: lead.reply_received_at,
      m1_sent_at: lead.m1_sent_at,
      m2_sent_at: lead.m2_sent_at,
      m3_sent_at: lead.m3_sent_at,
      latest_lead_reply: lead.latest_lead_reply,
      manual_mode: lead.manual_mode || false,
      call_booked: lead.call_booked || false,
      archived: lead.archived || false,
      install_date: lead.install_date,
      created_at: lead.created_at,
    }))

    return NextResponse.json({
      leads: transformedLeads,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
