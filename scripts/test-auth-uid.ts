import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Create client with ANON key (RLS applies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testAuthUid() {
  console.log('Testing auth.uid() in database context...\n')

  // Login as the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'otatler@gmail.com',
    password: 'admin123'
  })

  if (authError) {
    console.log('❌ Auth error:', authError.message)
    return
  }

  console.log('✅ Logged in as:', authData.user.email)
  console.log('   Client-side user ID:', authData.user.id)

  // Test 1: Check if we can query our own user record (should work with SELECT policy)
  console.log('\nTest 1: Query own user record...')
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.log('❌ Error:', profileError.message)
  } else {
    console.log('✅ Can read own profile:', userProfile.email)
  }

  // Test 2: Check user_clients (should work with SELECT policy)
  console.log('\nTest 2: Query user_clients...')
  const { data: userClients, error: ucError } = await supabase
    .from('user_clients')
    .select('client_id')

  if (ucError) {
    console.log('❌ Error:', ucError.message)
  } else {
    console.log('✅ Found user_clients:', userClients)
  }

  // Test 3: Use a SQL function to get auth.uid()
  console.log('\nTest 3: Test auth.uid() via SQL...')
  const { data: authUidTest, error: authUidError } = await supabase
    .rpc('auth_uid_test')

  if (authUidError) {
    console.log('❌ Error (expected - function may not exist):', authUidError.message)
  } else {
    console.log('✅ auth.uid() returns:', authUidTest)
  }
}

testAuthUid()
