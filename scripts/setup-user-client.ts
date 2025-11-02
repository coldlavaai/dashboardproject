import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupUserClient() {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    console.log('Found users:', users.users.map(u => ({ id: u.id, email: u.email })))

    // Get or create client
    const { data: existingClients, error: clientsError } = await supabase
      .from('clients')
      .select('*')

    console.log('Existing clients:', existingClients)

    let clientId: string

    if (!existingClients || existingClients.length === 0) {
      // Create a client for Oliver
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          name: 'Cold Lava',
          slug: 'cold-lava',
          industry: 'Solar & AI Services',
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating client:', createError)
        return
      }

      console.log('Created client:', newClient)
      clientId = newClient.id
    } else {
      clientId = existingClients[0].id
      console.log('Using existing client:', clientId)
    }

    // Link all users to this client
    for (const user of users.users) {
      // Check if already linked
      const { data: existing } = await supabase
        .from('user_clients')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!existing) {
        const { error: linkError } = await supabase
          .from('user_clients')
          .insert({
            user_id: user.id,
            client_id: clientId,
            role: 'owner'
          })

        if (linkError) {
          console.error(`Error linking user ${user.email}:`, linkError)
        } else {
          console.log(`✓ Linked user ${user.email} to client`)
        }
      } else {
        console.log(`✓ User ${user.email} already linked`)
      }
    }

    console.log('\n✅ Setup complete! User can now create datasets.')

  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupUserClient()
