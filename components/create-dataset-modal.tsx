'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

interface CreateDatasetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CreateStep = 'details' | 'upload' | 'mapping' | 'processing' | 'complete'

interface CSVColumn {
  name: string
  sampleData: string[]
}

export function CreateDatasetModal({ open, onOpenChange }: CreateDatasetModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<CreateStep>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dataset details
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [datasetId, setDatasetId] = useState<string | null>(null)

  // CSV upload
  const [file, setFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)

  // Required fields for lead import
  const requiredFields = [
    // Core fields (required)
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'phone', label: 'Phone Number', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'postcode', label: 'Postcode', required: true },
    // Additional fields (preferred)
    { key: 'inquiry_date', label: 'Inquiry Date', required: false, preferred: true },
    { key: 'notes', label: 'Notes', required: false, preferred: true },
    // DBR tracking fields (optional)
    { key: 'contact_status', label: 'Contact Status', required: false },
    { key: 'lead_sentiment', label: 'Lead Sentiment', required: false },
    { key: 'reply_received', label: 'Reply Received Date', required: false },
    { key: 'm1_sent', label: 'Message 1 Sent Date', required: false },
    { key: 'm2_sent', label: 'Message 2 Sent Date', required: false },
    { key: 'm3_sent', label: 'Message 3 Sent Date', required: false },
    { key: 'latest_lead_reply', label: 'Latest Lead Reply', required: false },
    { key: 'conversation_history', label: 'Conversation History', required: false },
    { key: 'manual_mode', label: 'Manual Mode', required: false },
    { key: 'call_booked', label: 'Call Booked', required: false },
    { key: 'archived', label: 'Archived', required: false },
    { key: 'install_date', label: 'Install Date', required: false },
  ]

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleDetailsSubmit - Starting')
    setLoading(true)
    setError(null)

    try {
      console.log('Creating dataset with:', { name, description })
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to create dataset')
      }

      const { dataset } = await response.json()
      console.log('Dataset created:', dataset.id)
      console.log('Advancing to upload step')
      setDatasetId(dataset.id)
      setStep('upload')
      console.log('Step should now be: upload')
    } catch (err: any) {
      console.error('Error creating dataset:', err)
      setError(err.message || 'Failed to create dataset. Please try again.')
    } finally {
      setLoading(false)
      console.log('handleDetailsSubmit - Complete')
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setLoading(true)

    try {
      // Parse CSV properly using PapaParse (handles quoted fields with newlines)
      const text = await selectedFile.text()

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || []
          const data = results.data as any[]

          // Count total data rows
          setTotalRows(data.length)

          // Get sample data (first 3 rows)
          const sampleRows = data.slice(0, 3)

          const columns: CSVColumn[] = headers.map((header) => ({
            name: header,
            sampleData: sampleRows.map(row => {
              const value = row[header] || ''
              // Truncate long values for display (like conversation history)
              return value.length > 100 ? value.substring(0, 100) + '...' : value
            }),
          }))

          setCsvColumns(columns)

          // Auto-map columns (moved to end of parse callback)
          autoMapColumns(columns)

          setStep('mapping')
          setLoading(false)
        },
        error: (error: any) => {
          throw new Error(`CSV parsing error: ${error.message}`)
        }
      })

      return // Exit early - Papa.parse is async
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV')
      setLoading(false)
      return
    }
  }

  // Auto-map columns function
  const autoMapColumns = (columns: CSVColumn[]) => {
    const autoMapping: Record<string, string> = {}

    columns.forEach(col => {
      const lower = col.name.toLowerCase().replace(/[_\s-]/g, '')

      // First name
      if (lower.includes('first') && lower.includes('name')) {
        autoMapping['first_name'] = col.name
      }
      // Last name / second name / surname
      else if (
        (lower.includes('last') && lower.includes('name')) ||
        (lower.includes('second') && lower.includes('name')) ||
        lower.includes('surname') ||
        lower.includes('familyname')
      ) {
        autoMapping['last_name'] = col.name
      }
      // Phone
      else if (
        lower.includes('phone') ||
        lower.includes('mobile') ||
        lower.includes('tel') ||
        lower.includes('cell')
      ) {
        autoMapping['phone'] = col.name
      }
      // Email
      else if (lower.includes('email') || lower.includes('mail')) {
        autoMapping['email'] = col.name
      }
      // Postcode
      else if (
        lower.includes('postcode') ||
        lower.includes('postal') ||
        lower.includes('zip')
      ) {
        autoMapping['postcode'] = col.name
      }
      // Inquiry/Enquiry date
      else if (
        (lower.includes('inquiry') || lower.includes('enquiry')) &&
        lower.includes('date')
      ) {
        if (!autoMapping['inquiry_date']) {
          autoMapping['inquiry_date'] = col.name
        }
      }
      // Notes
      else if (
        lower.includes('note') &&
        !lower.includes('conversation') &&
        !lower.includes('history')
      ) {
        if (!autoMapping['notes']) {
          autoMapping['notes'] = col.name
        }
      }
      // DBR tracking fields
      // Contact Status
      else if (lower.includes('contact') && lower.includes('status')) {
        autoMapping['contact_status'] = col.name
      }
      // Lead Sentiment
      else if (lower.includes('lead') && lower.includes('sentiment')) {
        autoMapping['lead_sentiment'] = col.name
      }
      // Reply Received
      else if (lower.includes('reply') && lower.includes('received')) {
        autoMapping['reply_received'] = col.name
      }
      // M1 Sent (Message 1)
      else if (
        (lower.includes('m1') && lower.includes('sent')) ||
        (lower.includes('m') && lower.includes('1') && lower.includes('sent'))
      ) {
        autoMapping['m1_sent'] = col.name
      }
      // M2 Sent (Message 2)
      else if (
        (lower.includes('m2') && lower.includes('sent')) ||
        (lower.includes('m') && lower.includes('2') && lower.includes('sent'))
      ) {
        autoMapping['m2_sent'] = col.name
      }
      // M3 Sent (Message 3)
      else if (
        (lower.includes('m3') && lower.includes('sent')) ||
        (lower.includes('m') && lower.includes('3') && lower.includes('sent'))
      ) {
        autoMapping['m3_sent'] = col.name
      }
      // Latest Lead Reply
      else if (
        (lower.includes('latest') && lower.includes('reply')) ||
        (lower.includes('last') && lower.includes('reply'))
      ) {
        autoMapping['latest_lead_reply'] = col.name
      }
      // Conversation History
      else if (lower.includes('conversation') && lower.includes('history')) {
        autoMapping['conversation_history'] = col.name
      }
      // Manual Mode
      else if (lower.includes('manual') && lower.includes('mode')) {
        autoMapping['manual_mode'] = col.name
      }
      // Call Booked
      else if (lower.includes('call') && lower.includes('booked')) {
        autoMapping['call_booked'] = col.name
      }
      // Archived
      else if (lower === 'archived' || lower.includes('archived')) {
        autoMapping['archived'] = col.name
      }
      // Install Date
      else if (lower.includes('install') && lower.includes('date')) {
        autoMapping['install_date'] = col.name
      }
    })

    setColumnMapping(autoMapping)
  }

  const handleMappingChange = (field: string, csvColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: csvColumn,
    }))
  }

  const handleImport = async () => {
    // Validate required fields
    const missingRequired = requiredFields
      .filter(f => f.required && !columnMapping[f.key])
      .map(f => f.label)

    if (missingRequired.length > 0) {
      setError(`Please map all required fields: ${missingRequired.join(', ')}`)
      return
    }

    setLoading(true)
    setStep('processing')
    setError(null)

    try {
      // Create FormData with file and mapping
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('mapping', JSON.stringify(columnMapping))
      formData.append('datasetId', datasetId!)

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import leads')
      }

      // Success!
      const result = await response.json()
      console.log('Import successful:', result)

      setStep('complete')
      setTimeout(() => {
        onOpenChange(false)
        resetModal()
        // Refresh to show updated lead counts
        router.refresh()
        // Navigate to the new dataset
        router.push(`/dashboard/datasets/${datasetId}`)
      }, 2000)
    } catch (err: any) {
      console.error('Error importing leads:', err)
      setError(err.message || 'Failed to import leads')

      // Clean up: delete the dataset since import failed
      if (datasetId) {
        try {
          console.log('Cleaning up failed dataset:', datasetId)
          await fetch(`/api/datasets/${datasetId}`, {
            method: 'DELETE',
          })
          console.log('Dataset cleaned up successfully')
          setDatasetId(null)
        } catch (deleteErr) {
          console.error('Failed to clean up dataset:', deleteErr)
        }
      }

      setStep('mapping')
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep('details')
    setName('')
    setDescription('')
    setDatasetId(null)
    setFile(null)
    setCsvColumns([])
    setTotalRows(0)
    setColumnMapping({})
    setError(null)
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      resetModal()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle>Create New Dataset</DialogTitle>
              <DialogDescription>
                Give your dataset a name and description. You'll upload your CSV file in the next step.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleDetailsSubmit}>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="name">Dataset Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Q4 2024 Leads"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !name.trim()}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Next: Upload CSV
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle>Upload CSV File</DialogTitle>
              <DialogDescription>
                Upload a CSV file with your lead data. We'll help you map the columns in the next step.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div
                className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />

                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-semibold mb-2">
                      Drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-muted p-4">
                <h4 className="text-sm font-semibold mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>First row must contain column headers</li>
                  <li>Required columns: Name, Phone Number</li>
                  <li>Optional columns: Email, Notes</li>
                  <li>Use comma (,) as delimiter</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('details')} disabled={loading}>
                Back
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'mapping' && (
          <>
            <DialogHeader>
              <DialogTitle>Map Your Columns</DialogTitle>
              <DialogDescription>
                Connect your CSV columns to our lead fields. We've auto-detected most mappings.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[65vh] overflow-y-auto">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                {requiredFields.map(field => {
                  const mappedColumn = columnMapping[field.key]
                  const columnData = csvColumns.find(col => col.name === mappedColumn)
                  const isMapped = !!mappedColumn

                  return (
                    <div
                      key={field.key}
                      className={`relative rounded-lg border-2 p-4 transition-all ${
                        isMapped
                          ? 'border-primary bg-primary/5'
                          : field.required
                            ? 'border-destructive/30 bg-background'
                            : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor={field.key} className="text-base font-semibold">
                              {field.label}
                            </Label>
                            {field.required && (
                              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                            {!field.required && (field as any).preferred && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                Preferred
                              </span>
                            )}
                            {isMapped && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                Mapped
                              </span>
                            )}
                          </div>

                          <select
                            id={field.key}
                            value={columnMapping[field.key] || ''}
                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">-- Select CSV column --</option>
                            {csvColumns.map(col => (
                              <option key={col.name} value={col.name}>
                                {col.name}
                              </option>
                            ))}
                          </select>

                          {isMapped && columnData && columnData.sampleData.length > 0 && (
                            <div className="mt-3 rounded-md bg-muted p-3">
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Sample data from "{mappedColumn}":
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {columnData.sampleData.slice(0, 3).map((sample, idx) => (
                                  sample && (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-md bg-background px-2.5 py-1 text-sm"
                                    >
                                      {sample}
                                    </span>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-lg bg-muted p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm mb-1">Ready to import</div>
                    <div className="text-sm text-muted-foreground">
                      {requiredFields.filter(f => f.required && columnMapping[f.key]).length} of {requiredFields.filter(f => f.required).length} required fields mapped
                      {requiredFields.filter(f => !f.required && columnMapping[f.key]).length > 0 &&
                        ` • ${requiredFields.filter(f => !f.required && columnMapping[f.key]).length} optional fields`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {totalRows > 0 && `${totalRows} leads`}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing your leads...</h3>
            <p className="text-sm text-muted-foreground">
              This may take a moment. Please don't close this window.
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dataset created successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Redirecting you to your new dataset...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
