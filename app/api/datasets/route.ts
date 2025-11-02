import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function GET() {
  try {
    console.log('GET /api/datasets - Starting...')
    const user = await getCurrentUser()
    console.log('GET /api/datasets - User:', user ? { id: user.id, email: user.email, hasProfile: !!user.profile } : null)

    if (!user || !user.profile) {
      console.error('GET /api/datasets - Unauthorized: No user or profile')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get user's client
    const { data: userClient, error: clientError } = await (supabase
      .from('user_clients') as any)
      .select('client_id')
      .eq('user_id', user.id)
      .single()

    console.log('GET /api/datasets - User client:', { userClient, clientError })

    if (!userClient) {
      console.error('GET /api/datasets - No client found')
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
        active_leads,
        hot_leads,
        converted_leads,
        created_at,
        updated_at
      `)
      .eq('client_id', userClient.client_id)
      .order('created_at', { ascending: false })

    console.log('GET /api/datasets - Query result:', { count: datasets?.length, error })

    if (error) {
      console.error('GET /api/datasets - Error fetching datasets:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('GET /api/datasets - Success! Returning', datasets.length, 'datasets')
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
    console.log('POST /api/datasets - User:', user ? { id: user.id, email: user.email } : null)

    if (!user || !user.profile) {
      console.error('POST /api/datasets - No user or profile')
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
    const { data: userClient, error: clientError } = await (supabase
      .from('user_clients') as any)
      .select('client_id')
      .eq('user_id', user.id)
      .single()

    console.log('POST /api/datasets - User client query result:', { userClient, clientError })

    if (!userClient) {
      console.error('POST /api/datasets - No client found for user', user.id)
      return NextResponse.json({ error: 'No client found' }, { status: 404 })
    }

    // Create dataset
    console.log('POST /api/datasets - Attempting to insert dataset with:', {
      client_id: userClient.client_id,
      name,
      description: description || null,
      source: source || 'manual',
      uploaded_by: user.id,
    })

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
      console.error('POST /api/datasets - Error creating dataset:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
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
