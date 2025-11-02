import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('Creating test user account...\n')

    // Create user with otatler@gmail.com
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'otatler@gmail.com',
      password: 'admin123',
      email_confirm: true, // Auto-confirm the email
    })

    if (createError) {
      // Check if user already exists
      if (createError.message.includes('already')) {
        console.log('✓ User otatler@gmail.com already exists')

        // Get the existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === 'otatler@gmail.com')

        if (existingUser) {
          console.log(`  User ID: ${existingUser.id}`)

          // Check if they have a profile
          const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('*')
            .eq('id', existingUser.id)
            .single()

          if (!profile) {
            // Create profile
            const { error: profileError } = await (supabase
              .from('profiles') as any)
              .insert({
                id: existingUser.id,
                full_name: 'Oliver (Greenstar Test)',
                is_super_admin: false,
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
            } else {
              console.log('✓ Created profile for user')
            }
          } else {
            console.log('✓ Profile exists')
          }

          // Link to Greenstar client
          const { data: clients } = await (supabase
            .from('clients') as any)
            .select('id, name')
            .eq('name', 'Greenstar Solar')
            .single()

          if (clients) {
            console.log(`✓ Found client: ${clients.name} (${clients.id})`)

            // Check if already linked
            const { data: existingLink } = await (supabase
              .from('user_clients') as any)
              .select('*')
              .eq('user_id', existingUser.id)
              .eq('client_id', clients.id)
              .single()

            if (!existingLink) {
              const { error: linkError } = await (supabase
                .from('user_clients') as any)
                .insert({
                  user_id: existingUser.id,
                  client_id: clients.id,
                  role: 'owner'
                })

              if (linkError) {
                console.error('Error linking user to client:', linkError)
              } else {
                console.log('✓ Linked user to Greenstar Solar client')
              }
            } else {
              console.log('✓ User already linked to Greenstar Solar')
            }
          }

          return
        }
      } else {
        console.error('Error creating user:', createError)
        return
      }
    }

    console.log('✓ Created user:', user.user.email)
    console.log(`  User ID: ${user.user.id}`)

    // Create profile
    const { error: profileError } = await (supabase
      .from('profiles') as any)
      .insert({
        id: user.user.id,
        full_name: 'Oliver (Greenstar Test)',
        is_super_admin: false,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('✓ Created profile')

    // Get Greenstar Solar client
    const { data: client, error: clientError } = await (supabase
      .from('clients') as any)
      .select('id, name')
      .eq('name', 'Greenstar Solar')
      .single()

    if (clientError || !client) {
      console.error('Greenstar Solar client not found - creating it...')

      const { data: newClient, error: createClientError } = await (supabase
        .from('clients') as any)
        .insert({
          name: 'Greenstar Solar',
          slug: 'greenstar-solar',
          industry: 'Solar',
        })
        .select()
        .single()

      if (createClientError) {
        console.error('Error creating client:', createClientError)
        return
      }

      console.log('✓ Created Greenstar Solar client')

      // Link user to new client
      const { error: linkError } = await (supabase
        .from('user_clients') as any)
        .insert({
          user_id: user.user.id,
          client_id: newClient.id,
          role: 'owner'
        })

      if (linkError) {
        console.error('Error linking user:', linkError)
      } else {
        console.log('✓ Linked user to Greenstar Solar client')
      }
    } else {
      console.log(`✓ Found client: ${client.name}`)

      // Link user to client
      const { error: linkError } = await (supabase
        .from('user_clients') as any)
        .insert({
          user_id: user.user.id,
          client_id: client.id,
          role: 'owner'
        })

      if (linkError) {
        console.error('Error linking user:', linkError)
      } else {
        console.log('✓ Linked user to Greenstar Solar client')
      }
    }

    console.log('\n✅ Test user setup complete!')
    console.log('   Email: otatler@gmail.com')
    console.log('   Password: admin123')

  } catch (error) {
    console.error('Setup error:', error)
  }
}

createTestUser()
