import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

// Supabase connection using transaction mode pooler
// Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
// Note: For Supabase, we use port 6543 for transaction pooler

const  projectRef = 'ngkjfehvoeymjoqppthy'
const region = 'us-east-1'

// You need to get the database password from Supabase dashboard
// Go to: Project Settings > Database > Connection string > Use connection pooling
console.log('================================================================================')
console.log('To get your database password:')
console.log('1. Go to: https://supabase.com/dashboard/project/ngkjfehvoeymjoqppthy/settings/database')
console.log('2. Scroll to "Connection string"')
console.log('3. Select "Use connection pooling" > Transaction mode')
console.log('4. Copy the password (shown as [YOUR-PASSWORD])')
console.log('================================================================================')
console.log('')

// For now, let's use curl with Supabase REST API instead
console.log('Alternatively, run this SQL in Supabase SQL Editor:')
console.log('https://supabase.com/dashboard/project/ngkjfehvoeymjoqppthy/sql/new')
console.log('')

const sql = readFileSync(join(__dirname, 'fix-rls-policies.sql'), 'utf-8')
console.log(sql)
