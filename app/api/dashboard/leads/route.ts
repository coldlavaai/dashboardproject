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
      .select('*')
      .eq('client_id', userClient.client_id)
      .eq('archived', false) // Don't show archived leads on main dashboard
      .order('reply_received_at', { ascending: false, nullsFirst: false }) // Most recent replies first

    // Filter by dataset if specified
    if (datasetId && datasetId !== 'all') {
      query = query.eq('dataset_id', datasetId)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Error fetching dashboard leads:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      leads: leads || [],
    })
  } catch (error: any) {
    console.error('Dashboard leads API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
