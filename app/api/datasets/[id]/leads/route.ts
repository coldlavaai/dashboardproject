import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()

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

    // Build query
    let query = (supabase
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

    // Transform leads to match frontend interface
    const transformedLeads = (leads || []).map((lead: any) => ({
      id: lead.id,
      name: `${lead.first_name} ${lead.last_name}`,
      phone: lead.phone_number,
      email: lead.email,
      company: lead.postcode || null, // Show postcode in company field for now
      status: (lead.contact_status || 'READY').toLowerCase(),
      campaign_status: lead.contact_status || 'READY',
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
