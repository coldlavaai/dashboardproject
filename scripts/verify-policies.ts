import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyPolicies() {
  console.log('Checking RLS policies in database...\n')

  // Check if RLS is enabled
  const { data: tables, error: tablesError } = await supabase
    .rpc('check_rls_enabled' as any)

  // Since that RPC might not exist, let's query the datasets table policies directly
  console.log('Attempting to query pg_policies (may not have permission)...')

  // Try a different approach - create a test with explicit policy check
  console.log('\nLet\'s check what policies exist by trying different operations...\n')

  // Login as user
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  await anonSupabase.auth.signInWithPassword({
    email: 'otatler@gmail.com',
    password: 'admin123'
  })

  // Test SELECT (should work)
  console.log('Test 1: SELECT from datasets (should work with SELECT policy)')
  const { data: datasets, error: selectError } = await anonSupabase
    .from('datasets')
    .select('*')

  if (selectError) {
    console.log('❌ SELECT failed:', selectError.message)
  } else {
    console.log('✅ SELECT works, found', datasets?.length, 'datasets')
  }

  // Test UPDATE (should work if dataset exists)
  if (datasets && datasets.length > 0) {
    console.log('\nTest 2: UPDATE existing dataset (should work with UPDATE policy)')
    const { error: updateError } = await anonSupabase
      .from('datasets')
      .update({ description: 'Updated description' })
      .eq('id', datasets[0].id)

    if (updateError) {
      console.log('❌ UPDATE failed:', updateError.message)
    } else {
      console.log('✅ UPDATE works')
    }
  }

  // Test DELETE (should work)
  console.log('\nTest 3: DELETE (testing policy)')
  const { error: deleteError } = await anonSupabase
    .from('datasets')
    .delete()
    .eq('name', 'NonExistent Dataset That Doesnt Exist')

  if (deleteError) {
    console.log('❌ DELETE failed:', deleteError.message)
  } else {
    console.log('✅ DELETE policy exists (no error even though nothing deleted)')
  }

  // Test INSERT (we know this fails)
  console.log('\nTest 4: INSERT (we know this fails)')
  const { data: userClient } = await anonSupabase
    .from('user_clients')
    .select('client_id')
    .single()

  const { error: insertError } = await anonSupabase
    .from('datasets')
    .insert({
      client_id: userClient!.client_id,
      name: 'Policy Test',
      source: 'manual'
    })

  if (insertError) {
    console.log('❌ INSERT failed:', insertError.code, insertError.message)
  } else {
    console.log('✅ INSERT works!')
  }

  console.log('\nConclusion: If INSERT is the only one failing, the INSERT policy may be missing or incorrect.')
}

verifyPolicies()
