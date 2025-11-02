import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function debugRLSPolicy() {
  console.log('Debugging RLS policy for datasets...\n')

  // Login
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: 'otatler@gmail.com',
    password: 'admin123'
  })

  const userId = authData!.user.id
  console.log('User ID:', userId)

  // Get client_id
  const { data: userClient } = await supabase
    .from('user_clients')
    .select('client_id')
    .eq('user_id', userId)
    .single()

  const clientId = userClient!.client_id
  console.log('Client ID:', clientId)

  // Now let's test the exact same subquery the RLS policy uses
  console.log('\nTest: Checking if client_id is in the subquery result...')
  const { data: matchingClients } = await supabase
    .from('user_clients')
    .select('client_id')
    .eq('user_id', userId)

  console.log('Subquery result (client_ids for this user):', matchingClients)
  console.log('Does', clientId, 'match?', matchingClients?.some(c => c.client_id === clientId))

  // Try the insert again with explicit logging
  console.log('\nAttempting insert with:')
  const insertData = {
    client_id: clientId,
    name: 'Debug Test Dataset',
    description: 'Testing RLS',
    source: 'manual',
    uploaded_by: userId,
  }
  console.log(JSON.stringify(insertData, null, 2))

  const { data, error } = await supabase
    .from('datasets')
    .insert(insertData)
    .select()

  if (error) {
    console.log('\n❌ INSERT FAILED')
    console.log('Error:', error)

    // Try with service role to confirm data is valid
    console.log('\n Testing same insert with service role key...')
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: serviceData, error: serviceError } = await serviceSupabase
      .from('datasets')
      .insert({
        ...insertData,
        name: 'Debug Test Dataset (Service Role)'
      })
      .select()

    if (serviceError) {
      console.log('   ❌ Even service role failed:', serviceError.message)
    } else {
      console.log('   ✅ Service role succeeded! This confirms RLS is the issue.')
    }
  } else {
    console.log('\n✅ SUCCESS')
    console.log('Dataset:', data)
  }
}

debugRLSPolicy()
