import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, message } = await request.json()

    if (!leadId || !message) {
      return NextResponse.json(
        { error: 'Missing leadId or message' },
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

    // Get lead (must belong to user's client)
    const { data: lead, error: leadError } = await (supabase
      .from('leads') as any)
      .select('id, phone_number, dataset_id, client_id')
      .eq('id', leadId)
      .eq('client_id', userClient.client_id)
      .single()

    if (leadError || !lead) {
      console.error('Error fetching lead:', leadError)
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get dataset to find assigned phone number
    const { data: dataset } = await (supabase
      .from('datasets') as any)
      .select('phone_number_id')
      .eq('id', lead.dataset_id)
      .single()

    // Get client's Twilio credentials
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('twilio_account_sid, twilio_auth_token')
      .eq('id', userClient.client_id)
      .single()

    if (!client?.twilio_account_sid || !client?.twilio_auth_token) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured. Please add them in Settings.' },
        { status: 500 }
      )
    }

    // Get the phone number to use (dataset's assigned number or client's default)
    let twilioPhoneNumber: string | null = null

    if (dataset?.phone_number_id) {
      // Use dataset's assigned phone number
      const { data: phoneNumber } = await (supabase
        .from('phone_numbers') as any)
        .select('phone_number')
        .eq('id', dataset.phone_number_id)
        .eq('is_active', true)
        .single()

      twilioPhoneNumber = phoneNumber?.phone_number
    }

    if (!twilioPhoneNumber) {
      // Fall back to client's default phone number
      const { data: defaultPhone } = await (supabase
        .from('phone_numbers') as any)
        .select('phone_number')
        .eq('client_id', userClient.client_id)
        .eq('is_default', true)
        .eq('is_active', true)
        .single()

      twilioPhoneNumber = defaultPhone?.phone_number
    }

    if (!twilioPhoneNumber) {
      return NextResponse.json(
        { error: 'No phone number configured. Please add a phone number in Settings.' },
        { status: 500 }
      )
    }

    // Get or create conversation
    let { data: conversation } = await (supabase
      .from('conversations') as any)
      .select('id')
      .eq('lead_id', leadId)
      .single()

    if (!conversation) {
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
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        )
      }
      conversation = newConversation
    }

    // Send SMS via Twilio using client's credentials
    const twilioClient = twilio(
      client.twilio_account_sid,
      client.twilio_auth_token
    )

    let twilioMessage
    try {
      twilioMessage = await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: lead.phone_number,
      })
    } catch (twilioError: any) {
      console.error('Twilio error:', twilioError)
      return NextResponse.json(
        { error: `Failed to send SMS: ${twilioError.message}` },
        { status: 500 }
      )
    }

    // Save message to database
    const { data: savedMessage, error: saveError } = await (supabase
      .from('messages') as any)
      .insert({
        conversation_id: conversation.id,
        lead_id: leadId,
        client_id: userClient.client_id,
        content: message,
        direction: 'outbound',
        message_type: 'manual',
        from_number: twilioPhoneNumber,
        to_number: lead.phone_number,
        status: twilioMessage.status,
        twilio_sid: twilioMessage.sid,
        twilio_status: twilioMessage.status,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving message:', saveError)
    }

    // Update conversation last_message_at and message_count
    await (supabase
      .from('conversations') as any)
      .update({
        last_message_at: new Date().toISOString(),
        message_count: (conversation.message_count || 0) + 1,
      })
      .eq('id', conversation.id)

    // Update lead's last_message_at
    await (supabase
      .from('leads') as any)
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq('id', leadId)

    return NextResponse.json({
      success: true,
      messageId: savedMessage?.id || twilioMessage.sid,
      twilioSid: twilioMessage.sid,
    })
  } catch (error) {
    console.error('Send message API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
