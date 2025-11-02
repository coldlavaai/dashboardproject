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

async function testDatasetCreation() {
  console.log('Testing dataset creation...\n')

  const userId = '50499a72-4712-40f2-ad57-56734e8b9867' // otatler@gmail.com

  // Get user's client
  const { data: userClient, error: clientError } = await supabase
    .from('user_clients')
    .select('client_id')
    .eq('user_id', userId)
    .single()

  console.log('User client lookup:')
  console.log('  Data:', userClient)
  console.log('  Error:', clientError)

  if (!userClient) {
    console.log('\n❌ No client found for user')
    return
  }

  console.log('\n✅ Client ID:', userClient.client_id)

  // Try to create a dataset
  console.log('\nAttempting to create dataset...')
  const { data: dataset, error: datasetError } = await supabase
    .from('datasets')
    .insert({
      client_id: userClient.client_id,
      name: 'Test Dataset from Script',
      description: 'Testing dataset creation',
      source: 'manual',
      uploaded_by: userId,
    })
    .select()
    .single()

  if (datasetError) {
    console.log('\n❌ Error creating dataset:')
    console.log('  Message:', datasetError.message)
    console.log('  Code:', datasetError.code)
    console.log('  Details:', datasetError.details)
    console.log('  Hint:', datasetError.hint)
  } else {
    console.log('\n✅ Dataset created successfully:')
    console.log('  ID:', dataset.id)
    console.log('  Name:', dataset.name)
  }
}

testDatasetCreation()
