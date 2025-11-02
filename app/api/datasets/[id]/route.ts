import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params
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

    // Get dataset (verify it belongs to user's client)
    const { data: dataset, error } = await (supabase
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
        updated_at,
        column_mapping
      `)
      .eq('id', id)
      .eq('client_id', userClient.client_id)
      .single()

    if (error || !dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    return NextResponse.json({ dataset })
  } catch (error) {
    console.error('Dataset fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params
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

    // Delete dataset (cascade will delete leads, conversations, messages)
    const { error } = await (supabase
      .from('datasets') as any)
      .delete()
      .eq('id', id)
      .eq('client_id', userClient.client_id)

    if (error) {
      console.error('Dataset delete error:', error)
      return NextResponse.json({ error: 'Failed to delete dataset' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dataset delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
