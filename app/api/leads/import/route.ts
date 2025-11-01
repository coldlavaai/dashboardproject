import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const mapping = JSON.parse(formData.get('mapping') as string)
    const datasetId = formData.get('datasetId') as string

    if (!file || !mapping || !datasetId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user's client
    const { data: userClient } = await (supabase
      .from('user_clients') as any)
      .select('client_id')
      .eq('user_id', user.id)
      .single()

    if (!userClient) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 })
    }

    // Verify dataset belongs to user's client
    const { data: dataset } = await (supabase
      .from('datasets') as any)
      .select('id, client_id, column_mapping')
      .eq('id', datasetId)
      .eq('client_id', userClient.client_id)
      .single()

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Parse CSV
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

    // Process each row
    const leadsToInsert = []
    let successCount = 0
    let errorCount = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: Record<string, string> = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })

        // Map columns based on user's mapping
        const name = mapping.name ? row[mapping.name] : ''
        const phone = mapping.phone ? row[mapping.phone] : ''
        const email = mapping.email ? row[mapping.email] : ''
        const company = mapping.company ? row[mapping.company] : ''
        const notes = mapping.notes ? row[mapping.notes] : ''

        // Validate required fields
        if (!name || !phone) {
          errorCount++
          continue
        }

        leadsToInsert.push({
          client_id: userClient.client_id,
          dataset_id: datasetId,
          name,
          phone,
          email: email || null,
          company: company || null,
          notes: notes || null,
          status: 'new',
          campaign_status: 'pending',
          uploaded_by: user.id,
        })

        successCount++
      } catch (err) {
        console.error('Error processing row:', err)
        errorCount++
      }
    }

    if (leadsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads found in CSV' },
        { status: 400 }
      )
    }

    // Insert leads in batches of 100
    const batchSize = 100
    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      const batch = leadsToInsert.slice(i, i + batchSize)
      const { error: insertError } = await (supabase
        .from('leads') as any)
        .insert(batch)

      if (insertError) {
        console.error('Error inserting batch:', insertError)
        throw insertError
      }
    }

    // Update dataset stats
    const { data: totalLeads } = await (supabase
      .from('leads') as any)
      .select('*', { count: 'exact', head: true })
      .eq('dataset_id', datasetId)

    await (supabase
      .from('datasets') as any)
      .update({
        total_leads: totalLeads || 0,
        column_mapping: mapping,
        updated_at: new Date().toISOString(),
      })
      .eq('id', datasetId)

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      total: leadsToInsert.length,
    })
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to import leads' },
      { status: 500 }
    )
  }
}
