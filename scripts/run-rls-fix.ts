import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runRLSFix() {
  try {
    const sql = readFileSync(join(__dirname, 'fix-rls-policies.sql'), 'utf-8')

    console.log('Running RLS policy fixes...')

    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`\nExecuting: ${statement.substring(0, 60)}...`)
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

      if (error) {
        console.error('Error:', error)
      } else {
        console.log('✓ Success')
      }
    }

    console.log('\n✅ RLS policies updated!')
  } catch (error) {
    console.error('Error running RLS fix:', error)
  }
}

runRLSFix()
