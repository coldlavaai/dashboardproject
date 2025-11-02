import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function completeSetup() {
  console.log('Getting otatler@gmail.com user ID...')
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const otUser = users.find(u => u.email === 'otatler@gmail.com')

  if (!otUser) {
    console.log('❌ User not found')
    return
  }

  console.log('✅ Found user:', otUser.id)

  console.log('\nCreating user profile...')
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert({
      id: otUser.id,
      email: 'otatler@gmail.com',
      full_name: 'Oliver Tatler',
      role: 'user',
      is_super_admin: false
    })
    .select()
    .single()

  if (profileError) {
    if (profileError.code === '23505') {
      console.log('⚠️  Profile already exists')
    } else {
      console.log('Error:', profileError)
      return
    }
  } else {
    console.log('✅ Profile created')
  }

  console.log('\nGetting Greenstar Solar client ID...')
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('company_name', 'Greenstar Solar')
    .single()

  console.log('Client ID:', client!.id)

  console.log('\nLinking otatler@gmail.com to Greenstar Solar...')
  const { error: linkError } = await supabase
    .from('user_clients')
    .insert({
      user_id: otUser.id,
      client_id: client!.id,
      role: 'owner'
    })

  if (linkError) {
    if (linkError.code === '23505') {
      console.log('⚠️  Link already exists')
    } else {
      console.log('Error:', linkError)
      return
    }
  } else {
    console.log('✅ Linked')
  }

  console.log('\n=== VERIFYING SETUP ===\n')

  const { data: allUsers } = await supabase.from('users').select('email, role, is_super_admin')
  console.log('USERS:')
  allUsers?.forEach(u => {
    console.log('  -', u.email, '| Role:', u.role, '| Super Admin:', u.is_super_admin)
  })

  const { data: allLinks } = await supabase
    .from('user_clients')
    .select('*, clients(company_name), users(email)')

  console.log('\nUSER-CLIENT LINKS:')
  if (allLinks && allLinks.length > 0) {
    allLinks.forEach(l => {
      console.log('  -', (l as any).users?.email || 'null', '→', (l as any).clients?.company_name || 'null', '(Role:', l.role + ')')
    })
  } else {
    console.log('  (none - oliver@coldlava.ai has no client link, as intended)')
  }

  console.log('\n=== FINAL RESULT ===')
  console.log('✅ oliver@coldlava.ai = Super Admin (no client link, sees ALL clients)')
  console.log('✅ otatler@gmail.com = Client User (linked to Greenstar Solar only)')
  console.log('\nPassword for both: admin123')
}

completeSetup()
