import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Create client with ANON key (RLS applies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testWithRLS() {
  console.log('Testing dataset creation with RLS (as regular user)...\n')

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
  console.log('   User ID:', authData.user.id)

  // Get user's client (this should work with RLS)
  const { data: userClient, error: clientError } = await supabase
    .from('user_clients')
    .select('client_id')
    .eq('user_id', authData.user.id)
    .single()

  console.log('\nUser client lookup:')
  if (clientError) {
    console.log('❌ Error:', clientError.message)
    return
  } else {
    console.log('✅ Client ID:', userClient.client_id)
  }

  // Try to create dataset (this is where it might fail with RLS)
  console.log('\nAttempting to create dataset with RLS...')
  const { data: dataset, error: datasetError } = await supabase
    .from('datasets')
    .insert({
      client_id: userClient.client_id,
      name: 'Test Dataset with RLS',
      description: 'Testing with row level security',
      source: 'manual',
      uploaded_by: authData.user.id,
    })
    .select()
    .single()

  if (datasetError) {
    console.log('\n❌ Error creating dataset:')
    console.log('   Message:', datasetError.message)
    console.log('   Code:', datasetError.code)
    console.log('   Details:', datasetError.details)
    console.log('   Hint:', datasetError.hint)
  } else {
    console.log('\n✅ Dataset created successfully!')
    console.log('   ID:', dataset.id)
    console.log('   Name:', dataset.name)
  }
}

testWithRLS()
