import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

// GET - List all phone numbers for the client
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

    // Get all phone numbers for this client
    const { data: phoneNumbers, error } = await (supabase
      .from('phone_numbers') as any)
      .select('*')
      .eq('client_id', userClient.client_id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching phone numbers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ phoneNumbers: phoneNumbers || [] })
  } catch (error) {
    console.error('Phone numbers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add a new phone number
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber, label, isDefault } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await (supabase
        .from('phone_numbers') as any)
        .update({ is_default: false })
        .eq('client_id', userClient.client_id)
    }

    // Create the phone number
    const { data: newPhoneNumber, error } = await (supabase
      .from('phone_numbers') as any)
      .insert({
        client_id: userClient.client_id,
        phone_number: phoneNumber,
        label: label || null,
        is_default: isDefault || false,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating phone number:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ phoneNumber: newPhoneNumber }, { status: 201 })
  } catch (error) {
    console.error('Create phone number error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
