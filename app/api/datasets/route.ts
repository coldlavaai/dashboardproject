import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function GET() {
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

    // Get all datasets for this client
    const { data: datasets, error } = await (supabase
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
        updated_at
      `)
      .eq('client_id', userClient.client_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching datasets:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ datasets })
  } catch (error) {
    console.error('Datasets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, source } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Dataset name is required' },
        { status: 400 }
      )
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

    // Create dataset
    const { data: dataset, error } = await (supabase
      .from('datasets') as any)
      .insert({
        client_id: userClient.client_id,
        name,
        description: description || null,
        source: source || 'manual',
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating dataset:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dataset }, { status: 201 })
  } catch (error) {
    console.error('Datasets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
