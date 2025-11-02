import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/actions'
import { normalizeUKPhone } from '@/lib/phone-utils'
import { parseFlexibleDate } from '@/lib/date-utils'
import Papa from 'papaparse'

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

    // Use regular client for authorization checks
    const supabase = await createClient()
    // Use service role client for bulk inserts (bypasses RLS)
    const supabaseAdmin = createServiceRoleClient()

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

    // Parse CSV properly using PapaParse (handles quoted fields with newlines)
    const text = await file.text()
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`)
    }

    const rows = parseResult.data as any[]
    console.log(`Parsed ${rows.length} rows from CSV`)

    // Process each row
    const leadsToInsert = []
    let successCount = 0
    let errorCount = 0

    for (const row of rows) {
      try {
        // Map columns based on user's mapping
        const first_name = mapping.first_name ? row[mapping.first_name] : ''
        const last_name = mapping.last_name ? row[mapping.last_name] : ''
        const phone = mapping.phone ? row[mapping.phone] : ''
        const email = mapping.email ? row[mapping.email] : ''
        const postcode = mapping.postcode ? row[mapping.postcode] : ''
        const inquiry_date = mapping.inquiry_date ? row[mapping.inquiry_date] : ''
        const notes = mapping.notes ? row[mapping.notes] : ''

        // DBR tracking fields
        const contact_status = mapping.contact_status ? row[mapping.contact_status] : 'READY'
        const lead_sentiment = mapping.lead_sentiment ? row[mapping.lead_sentiment] : null
        const reply_received = mapping.reply_received ? row[mapping.reply_received] : ''
        const m1_sent = mapping.m1_sent ? row[mapping.m1_sent] : ''
        const m2_sent = mapping.m2_sent ? row[mapping.m2_sent] : ''
        const m3_sent = mapping.m3_sent ? row[mapping.m3_sent] : ''
        const latest_lead_reply = mapping.latest_lead_reply ? row[mapping.latest_lead_reply] : ''
        const conversation_history = mapping.conversation_history ? row[mapping.conversation_history] : ''
        const manual_mode = mapping.manual_mode ? row[mapping.manual_mode] : ''
        const call_booked = mapping.call_booked ? row[mapping.call_booked] : ''
        const archived = mapping.archived ? row[mapping.archived] : ''
        const install_date = mapping.install_date ? row[mapping.install_date] : ''

        // Validate required fields
        if (!first_name || !last_name || !phone || !email || !postcode) {
          errorCount++
          continue
        }

        // Normalize phone number to +44 format
        const normalizedPhone = normalizeUKPhone(phone.trim())

        // Parse dates
        const parsedInquiryDate = inquiry_date ? parseFlexibleDate(inquiry_date.trim()) : null
        const parsedReplyReceived = reply_received ? parseFlexibleDate(reply_received.trim()) : null
        const parsedM1Sent = m1_sent ? parseFlexibleDate(m1_sent.trim()) : null
        const parsedM2Sent = m2_sent ? parseFlexibleDate(m2_sent.trim()) : null
        const parsedM3Sent = m3_sent ? parseFlexibleDate(m3_sent.trim()) : null
        const parsedInstallDate = install_date ? parseFlexibleDate(install_date.trim()) : null

        // Parse booleans
        const isManualMode = manual_mode ? (manual_mode.toLowerCase() === 'true' || manual_mode === '1' || manual_mode.toLowerCase() === 'yes') : false
        const isCallBooked = call_booked ? (call_booked.toLowerCase() === 'true' || call_booked === '1' || call_booked.toLowerCase() === 'yes') : false
        const isArchived = archived ? (archived.toLowerCase() === 'true' || archived === '1' || archived.toLowerCase() === 'yes') : false

        // Store conversation history in notes if not already set
        const finalNotes = notes || conversation_history

        leadsToInsert.push({
          client_id: userClient.client_id,
          dataset_id: datasetId,
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone_number: normalizedPhone,
          email: email.trim(),
          postcode: postcode.trim(),
          inquiry_date: parsedInquiryDate,
          notes: finalNotes ? finalNotes.trim() : null,
          contact_status: contact_status ? contact_status.toUpperCase() : 'READY',
          lead_sentiment: lead_sentiment ? lead_sentiment.toUpperCase() : null,
          reply_received_at: parsedReplyReceived,
          m1_sent_at: parsedM1Sent,
          m2_sent_at: parsedM2Sent,
          m3_sent_at: parsedM3Sent,
          latest_lead_reply: latest_lead_reply ? latest_lead_reply.trim() : null,
          manual_mode: isManualMode,
          call_booked: isCallBooked,
          archived: isArchived,
          install_date: parsedInstallDate,
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

    console.log(`Preparing to upsert ${leadsToInsert.length} leads in batches`)

    // Upsert leads in batches of 100 using service role client (bypasses RLS)
    // This will INSERT new leads or UPDATE existing ones with matching (dataset_id, phone_number)
    let actualInserted = 0
    let updatedCount = 0
    const batchSize = 100

    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      const batch = leadsToInsert.slice(i, i + batchSize)
      console.log(`Upserting batch ${Math.floor(i / batchSize) + 1}, size: ${batch.length}`)

      // Check for existing leads in this batch to track updates
      const phoneNumbers = batch.map(l => l.phone_number)
      const { data: existingLeads } = await (supabaseAdmin
        .from('leads') as any)
        .select('phone_number')
        .eq('dataset_id', datasetId)
        .in('phone_number', phoneNumbers)

      const existingPhones = new Set(existingLeads?.map((l: any) => l.phone_number) || [])
      const updateCountInBatch = batch.filter(l => existingPhones.has(l.phone_number)).length
      updatedCount += updateCountInBatch

      // Upsert with conflict resolution on unique constraint
      const { error: upsertError } = await (supabaseAdmin
        .from('leads') as any)
        .upsert(batch, {
          onConflict: 'dataset_id,phone_number',
          ignoreDuplicates: false  // Update on conflict
        })

      if (upsertError) {
        console.error('Error upserting batch:', upsertError)
        console.error('First lead in failed batch:', batch[0])
        throw new Error(`Database error: ${upsertError.message || upsertError.code}`)
      }

      actualInserted += (batch.length - updateCountInBatch)
    }

    console.log(`Inserted ${actualInserted} new leads, updated ${updatedCount} existing leads`)

    // Update dataset stats using service role client
    const { count: totalLeads } = await (supabaseAdmin
      .from('leads') as any)
      .select('*', { count: 'exact', head: true })
      .eq('dataset_id', datasetId)

    await (supabaseAdmin
      .from('datasets') as any)
      .update({
        total_leads: totalLeads || 0,
        column_mapping: mapping,
        updated_at: new Date().toISOString(),
      })
      .eq('id', datasetId)

    return NextResponse.json({
      success: true,
      imported: actualInserted,
      updated: updatedCount,
      errors: errorCount,
      total: leadsToInsert.length,
    })
  } catch (error: any) {
    console.error('CSV import error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    return NextResponse.json(
      {
        error: 'Failed to import leads',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
