import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deleteAllDatasets() {
  console.log('Deleting all datasets...\n')

  // First, get all datasets
  const { data: datasets, error: fetchError } = await supabase
    .from('datasets')
    .select('id, name')

  if (fetchError) {
    console.error('Error fetching datasets:', fetchError)
    return
  }

  console.log(`Found ${datasets?.length || 0} datasets:`)
  datasets?.forEach(d => console.log(`  - ${d.name} (${d.id})`))
  console.log()

  // Delete all leads first (foreign key constraint)
  const { error: leadsError } = await supabase
    .from('leads')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (leadsError) {
    console.error('Error deleting leads:', leadsError)
  } else {
    console.log('✅ Deleted all leads')
  }

  // Now delete all datasets
  const { error: datasetsError } = await supabase
    .from('datasets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (datasetsError) {
    console.error('Error deleting datasets:', datasetsError)
  } else {
    console.log('✅ Deleted all datasets')
  }

  console.log('\nDone!')
}

deleteAllDatasets()
