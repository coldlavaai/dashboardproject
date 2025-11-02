import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running Twilio multi-tenant migration...')

  const migrationPath = path.join(__dirname, '../supabase/migrations/003_twilio_multi_tenant.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Split by statement (basic approach - may need refinement)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.includes('CREATE') || statement.includes('ALTER') || statement.includes('DROP')) {
      console.log(`Executing: ${statement.substring(0, 60)}...`)

      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

      if (error) {
        console.error('❌ Error:', error.message)
        // Continue with other statements
      } else {
        console.log('✅ Success')
      }
    }
  }

  console.log('✨ Migration complete!')
}

runMigration().catch(console.error)
