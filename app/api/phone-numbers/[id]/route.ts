import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

// PATCH - Update a phone number
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

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

    // If setting as default, unset other defaults
    if (updates.is_default) {
      await (supabase
        .from('phone_numbers') as any)
        .update({ is_default: false })
        .eq('client_id', userClient.client_id)
    }

    // Update the phone number
    const { data: phoneNumber, error } = await (supabase
      .from('phone_numbers') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('client_id', userClient.client_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating phone number:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 404 })
    }

    return NextResponse.json({ phoneNumber })
  } catch (error) {
    console.error('Update phone number error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a phone number
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    // Check if any datasets are using this phone number
    const { data: datasets } = await (supabase
      .from('datasets') as any)
      .select('id, name')
      .eq('phone_number_id', id)
      .eq('client_id', userClient.client_id)

    if (datasets && datasets.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete phone number',
          message: `This phone number is being used by ${datasets.length} dataset(s). Please reassign them first.`,
          datasets: datasets
        },
        { status: 400 }
      )
    }

    // Delete the phone number
    const { error } = await (supabase
      .from('phone_numbers') as any)
      .delete()
      .eq('id', id)
      .eq('client_id', userClient.client_id)

    if (error) {
      console.error('Error deleting phone number:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete phone number error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
