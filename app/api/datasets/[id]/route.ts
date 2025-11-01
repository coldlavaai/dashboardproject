import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Get dataset (must belong to user's client)
    const { data: dataset, error } = await (supabase
      .from('datasets') as any)
      .select(`
        id,
        name,
        description,
        source,
        total_leads,
        leads_contacted,
        leads_converted,
        created_at,
        updated_at,
        column_mapping
      `)
      .eq('id', params.id)
      .eq('client_id', userClient.client_id)
      .single()

    if (error) {
      console.error('Error fetching dataset:', error)
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    return NextResponse.json({ dataset })
  } catch (error) {
    console.error('Dataset API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
