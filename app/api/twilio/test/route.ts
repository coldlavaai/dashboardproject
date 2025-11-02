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

    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
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

    // Get client's Twilio credentials
    const { data: client } = await (supabase
      .from('clients') as any)
      .select('twilio_account_sid, twilio_auth_token')
      .eq('id', userClient.client_id)
      .single()

    if (!client?.twilio_account_sid || !client?.twilio_auth_token) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      )
    }

    // Get default phone number
    const { data: defaultPhone } = await (supabase
      .from('phone_numbers') as any)
      .select('phone_number')
      .eq('client_id', userClient.client_id)
      .eq('is_default', true)
      .eq('is_active', true)
      .single()

    if (!defaultPhone?.phone_number) {
      return NextResponse.json(
        { error: 'No default phone number configured' },
        { status: 500 }
      )
    }

    // Send test SMS via Twilio
    const twilioClient = twilio(
      client.twilio_account_sid,
      client.twilio_auth_token
    )

    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: defaultPhone.phone_number,
      to: to,
    })

    // Save the outbound test message to database (NOT associated with any lead)
    await (supabase
      .from('messages') as any)
      .insert({
        lead_id: null, // Test messages are standalone, not linked to leads
        client_id: userClient.client_id,
        content: message,
        direction: 'outbound',
        message_type: 'sms',
        from_number: defaultPhone.phone_number,
        to_number: to,
        status: 'sent',
        twilio_sid: twilioMessage.sid,
        twilio_status: twilioMessage.status,
        sent_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      from: defaultPhone.phone_number,
      to: to
    })
  } catch (error: any) {
    console.error('Test SMS error:', error)

    // Provide more detailed error messages
    let errorMessage = 'Failed to send test SMS'

    if (error.code === 21211) {
      errorMessage = 'Invalid phone number format. Please use international format (e.g., +447123456789)'
    } else if (error.code === 21408) {
      errorMessage = 'Permission denied. Your Twilio trial account may need to verify this phone number first.'
    } else if (error.code === 21606) {
      errorMessage = 'The "From" phone number is not a valid Twilio number for your account'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage, code: error.code },
      { status: 500 }
    )
  }
}
