'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '../supabase/server'

/**
 * Create a new client and associate the current user as owner
 */
export async function createClient(formData: FormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const companyName = formData.get('companyName') as string
  const industry = formData.get('industry') as string
  const companyEmail = formData.get('companyEmail') as string | null
  const companyPhone = formData.get('companyPhone') as string | null

  // Create the client
  const { data: client, error: clientError } = await (supabase
    .from('clients') as any)
    .insert({
      company_name: companyName,
      industry: industry || 'other',
      company_email: companyEmail,
      company_phone: companyPhone,
      status: 'active',
      plan: 'trial',
      primary_color: '#02bbd4', // Cold Lava cyan default
      timezone: 'UTC',
      settings: {},
    })
    .select()
    .single()

  if (clientError) {
    console.error('Error creating client:', clientError)
    return { error: clientError.message }
  }

  // Associate user as owner
  const { error: userClientError } = await (supabase
    .from('user_clients') as any)
    .insert({
      user_id: user.id,
      client_id: client.id,
      role: 'owner',
    })

  if (userClientError) {
    console.error('Error associating user with client:', userClientError)
    return { error: 'Failed to associate user with client' }
  }

  revalidatePath('/dashboard')
  return { success: true, client }
}

/**
 * Get all clients for the current user
 */
export async function getUserClients() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { clients: [], error: 'Not authenticated' }
  }

  // Get all client associations for this user
  const { data: userClients, error: userClientsError } = await (supabase
    .from('user_clients') as any)
    .select(`
      client_id,
      role,
      clients (
        id,
        company_name,
        industry,
        logo_url,
        primary_color,
        status,
        plan,
        created_at
      )
    `)
    .eq('user_id', user.id)

  if (userClientsError) {
    console.error('Error fetching user clients:', userClientsError)
    return { clients: [], error: userClientsError.message }
  }

  const clients = userClients.map((uc: any) => ({
    ...uc.clients,
    role: uc.role,
  }))

  return { clients, error: null }
}

/**
 * Get a specific client by ID
 */
export async function getClient(clientId: string) {
  const supabase = await createServerClient()

  const { data: client, error } = await (supabase
    .from('clients') as any)
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return { client: null, error: error.message }
  }

  return { client, error: null }
}

/**
 * Get the user's role for a specific client
 */
export async function getUserClientRole(clientId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: null, error: 'Not authenticated' }
  }

  const { data, error } = await (supabase
    .from('user_clients') as any)
    .select('role')
    .eq('user_id', user.id)
    .eq('client_id', clientId)
    .single()

  if (error) {
    return { role: null, error: error.message }
  }

  return { role: data.role, error: null }
}

/**
 * Add a user to a client (requires admin/owner role)
 */
export async function addUserToClient(
  clientId: string,
  userEmail: string,
  role: 'admin' | 'member' | 'viewer' = 'member'
) {
  const supabase = await createServerClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: 'Not authenticated' }
  }

  // Check if current user has permission (admin or owner)
  const { role: currentUserRole } = await getUserClientRole(clientId)

  if (!currentUserRole || !['owner', 'admin'].includes(currentUserRole)) {
    return { error: 'Insufficient permissions' }
  }

  // Find user by email
  const { data: userData, error: userError } = await (supabase
    .from('users') as any)
    .select('id')
    .eq('email', userEmail)
    .single()

  if (userError) {
    return { error: 'User not found' }
  }

  // Add user to client
  const { error: addError } = await (supabase
    .from('user_clients') as any)
    .insert({
      user_id: userData.id,
      client_id: clientId,
      role,
    })

  if (addError) {
    console.error('Error adding user to client:', addError)
    return { error: addError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Update client settings
 */
export async function updateClient(clientId: string, updates: any) {
  const supabase = await createServerClient()

  const { error } = await (supabase
    .from('clients') as any)
    .update(updates)
    .eq('id', clientId)

  if (error) {
    console.error('Error updating client:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
