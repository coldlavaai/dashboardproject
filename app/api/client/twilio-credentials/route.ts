import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

// GET - Fetch client's Twilio credentials (masked)
export async function GET(request: Request) {
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

    // Get client's Twilio credentials
    const { data: client, error } = await (supabase
      .from('clients') as any)
      .select('twilio_account_sid, twilio_auth_token')
      .eq('id', userClient.client_id)
      .single()

    if (error) {
      console.error('Error fetching Twilio credentials:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mask the auth token for security
    const maskedAuthToken = client.twilio_auth_token
      ? '••••••••' + client.twilio_auth_token.slice(-4)
      : null

    return NextResponse.json({
      twilioAccountSid: client.twilio_account_sid,
      twilioAuthToken: maskedAuthToken,
      hasCredentials: !!(client.twilio_account_sid && client.twilio_auth_token)
    })
  } catch (error) {
    console.error('Twilio credentials API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update client's Twilio credentials
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { accountSid, authToken } = await request.json()

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      )
    }

    // Basic validation for Twilio credentials format
    if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
      return NextResponse.json(
        { error: 'Invalid Twilio Account SID format' },
        { status: 400 }
      )
    }

    if (authToken.length !== 32) {
      return NextResponse.json(
        { error: 'Invalid Twilio Auth Token format' },
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

    // Update client's Twilio credentials
    const { data: client, error } = await (supabase
      .from('clients') as any)
      .update({
        twilio_account_sid: accountSid,
        twilio_auth_token: authToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userClient.client_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating Twilio credentials:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Twilio credentials updated successfully'
    })
  } catch (error) {
    console.error('Update Twilio credentials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
