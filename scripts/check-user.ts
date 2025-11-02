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

async function checkUser() {
  console.log('Checking user setup for otatler@gmail.com...\n')

  // Get user by email
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const otUser = users.find(u => u.email === 'otatler@gmail.com')

  if (!otUser) {
    console.log('❌ User otatler@gmail.com not found in auth')
    return
  }

  console.log('✅ Auth user found')
  console.log('   ID:', otUser.id)
  console.log('   Email:', otUser.email)

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', otUser.id)
    .single()

  if (profileError || !profile) {
    console.log('\n❌ No profile found in users table')
    console.log('   Error:', profileError?.message)
  } else {
    console.log('\n✅ Profile found in users table')
    console.log('   Email:', profile.email)
    console.log('   Full name:', profile.full_name)
    console.log('   Role:', profile.role)
  }

  // Check client link
  const { data: userClient, error: linkError } = await supabase
    .from('user_clients')
    .select('*, clients(company_name)')
    .eq('user_id', otUser.id)
    .single()

  if (linkError || !userClient) {
    console.log('\n❌ No client link found in user_clients table')
    console.log('   Error:', linkError?.message)
    console.log('\n   This is likely why dataset creation is failing!')
  } else {
    console.log('\n✅ Client link found')
    console.log('   Client:', (userClient as any).clients.company_name)
    console.log('   Role:', userClient.role)
  }
}

checkUser()
