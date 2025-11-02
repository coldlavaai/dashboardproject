import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await params
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

    // Verify lead belongs to user's client
    const { data: lead } = await (supabase
      .from('leads') as any)
      .select('id, client_id')
      .eq('id', leadId)
      .eq('client_id', userClient.client_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get or create conversation
    let { data: conversation } = await (supabase
      .from('conversations') as any)
      .select('id')
      .eq('lead_id', leadId)
      .single()

    if (!conversation) {
      // Create conversation if it doesn't exist
      const { data: newConversation, error: convError } = await (supabase
        .from('conversations') as any)
        .insert({
          lead_id: leadId,
          client_id: userClient.client_id,
          dataset_id: lead.dataset_id,
        })
        .select()
        .single()

      if (convError) {
        console.error('Error creating conversation:', convError)
      } else {
        conversation = newConversation
      }
    }

    // Fetch messages
    const { data: messages, error } = await (supabase
      .from('messages') as any)
      .select('*')
      .eq('lead_id', leadId)
      .eq('client_id', userClient.client_id)
      .order('sent_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match expected format
    const transformedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      direction: msg.direction,
      body: msg.content,
      timestamp: msg.sent_at,
      status: msg.status,
    }))

    return NextResponse.json({ messages: transformedMessages })
  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
