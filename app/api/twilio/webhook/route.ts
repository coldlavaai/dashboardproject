import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  try {
    console.log('=== TWILIO WEBHOOK RECEIVED ===')
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)

    // Parse the incoming Twilio webhook data
    const formData = await request.formData()

    const twilioData = {
      MessageSid: formData.get('MessageSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      NumMedia: formData.get('NumMedia') as string,
    }

    console.log('Received Twilio webhook data:', twilioData)

    // Validate Twilio signature (optional but recommended for production)
    // const signature = request.headers.get('x-twilio-signature')
    // const url = new URL(request.url)
    // const valid = twilio.validateRequest(
    //   process.env.TWILIO_AUTH_TOKEN!,
    //   signature!,
    //   url.toString(),
    //   twilioData
    // )
    // if (!valid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    // }

    const supabase = await createClient()

    // Find the lead by phone number
    const { data: leads, error: leadError } = await (supabase
      .from('leads') as any)
      .select('id, client_id, dataset_id, first_name, last_name')
      .eq('phone_number', twilioData.From)

    if (leadError || !leads || leads.length === 0) {
      console.error('Lead not found for phone:', twilioData.From)
      // Still return 200 to Twilio to avoid retries
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      )
    }

    // Use the first matching lead (in case of duplicates across datasets)
    const lead = leads[0]

    // Get or create conversation
    let { data: conversation } = await (supabase
      .from('conversations') as any)
      .select('id, message_count')
      .eq('lead_id', lead.id)
      .single()

    if (!conversation) {
      const { data: newConversation, error: convError } = await (supabase
        .from('conversations') as any)
        .insert({
          lead_id: lead.id,
          client_id: lead.client_id,
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

    // Save incoming message to database
    const { error: saveError } = await (supabase
      .from('messages') as any)
      .insert({
        conversation_id: conversation?.id,
        lead_id: lead.id,
        client_id: lead.client_id,
        content: twilioData.Body,
        direction: 'inbound',
        message_type: 'sms',
        from_number: twilioData.From,
        to_number: twilioData.To,
        status: 'received',
        twilio_sid: twilioData.MessageSid,
        twilio_status: 'received',
        sent_at: new Date().toISOString(),
      })

    if (saveError) {
      console.error('Error saving message:', saveError)
    }

    // Update conversation
    if (conversation) {
      await (supabase
        .from('conversations') as any)
        .update({
          last_message_at: new Date().toISOString(),
          message_count: (conversation.message_count || 0) + 1,
        })
        .eq('id', conversation.id)
    }

    // Update lead with latest reply
    await (supabase
      .from('leads') as any)
      .update({
        latest_lead_reply: twilioData.Body,
        reply_received_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    // Respond to Twilio with TwiML (empty response = no auto-reply)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  } catch (error) {
    console.error('Twilio webhook error:', error)
    // Always return 200 to Twilio to prevent retries
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  }
}
