'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Phone, Plus, Trash2, Check, X, Edit2, Loader2, Key, Database, Send, Copy, User, Users, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface PhoneNumber {
  id: string
  phone_number: string
  label: string | null
  is_default: boolean
  is_active: boolean
  datasets_count: number
  total_messages_sent: number
  created_at: string
}

interface TwilioCredentials {
  twilioAccountSid: string | null
  twilioAuthToken: string | null
  hasCredentials: boolean
}

interface Dataset {
  id: string
  name: string
  description: string | null
  phone_number_id: string | null
  total_leads: number
}

interface Lead {
  id: string
  name: string
  phone: string
}

export function SettingsClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('twilio')

  // Twilio Credentials
  const [credentials, setCredentials] = useState<TwilioCredentials>({
    twilioAccountSid: null,
    twilioAuthToken: null,
    hasCredentials: false
  })
  const [editingCredentials, setEditingCredentials] = useState(false)
  const [newAccountSid, setNewAccountSid] = useState('')
  const [newAuthToken, setNewAuthToken] = useState('')

  // Phone Numbers
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [addingPhone, setAddingPhone] = useState(false)
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newPhoneLabel, setNewPhoneLabel] = useState('')
  const [newPhoneDefault, setNewPhoneDefault] = useState(false)

  // Datasets
  const [datasets, setDatasets] = useState<Dataset[]>([])

  // Test SMS
  const [testMode, setTestMode] = useState<'manual' | 'dataset'>('manual')
  const [testPhoneNumber, setTestPhoneNumber] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [testDatasetId, setTestDatasetId] = useState('')
  const [testLeadId, setTestLeadId] = useState('')
  const [datasetLeads, setDatasetLeads] = useState<Lead[]>([])
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; from?: string } | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneNumber | null>(null)

  // Webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/twilio/webhook`
    : ''

  useEffect(() => {
    fetchCredentials()
    fetchPhoneNumbers()
    fetchDatasets()
  }, [])

  useEffect(() => {
    if (testDatasetId) {
      fetchDatasetLeads(testDatasetId)
    } else {
      setDatasetLeads([])
      setTestLeadId('')
    }
  }, [testDatasetId])

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/client/twilio-credentials')
      const data = await response.json()
      setCredentials(data)
    } catch (error) {
      console.error('Error fetching credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhoneNumbers = async () => {
    try {
      const response = await fetch('/api/phone-numbers')
      const data = await response.json()
      setPhoneNumbers(data.phoneNumbers || [])
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
    }
  }

  const fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets')
      const data = await response.json()
      setDatasets(data.datasets || [])
    } catch (error) {
      console.error('Error fetching datasets:', error)
    }
  }

  const fetchDatasetLeads = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/leads?datasetId=${datasetId}&limit=100`)
      const data = await response.json()
      setDatasetLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      setDatasetLeads([])
    }
  }

  const handleSaveCredentials = async () => {
    if (!newAccountSid || !newAuthToken) {
      alert('Please enter both Account SID and Auth Token')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/client/twilio-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: newAccountSid,
          authToken: newAuthToken
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save credentials')
      }

      await fetchCredentials()
      setEditingCredentials(false)
      setNewAccountSid('')
      setNewAuthToken('')
      alert('Twilio credentials saved successfully!')
    } catch (error: any) {
      console.error('Error saving credentials:', error)
      alert(error.message || 'Failed to save credentials')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPhone = async () => {
    if (!newPhoneNumber) {
      alert('Please enter a phone number')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: newPhoneNumber,
          label: newPhoneLabel || null,
          isDefault: newPhoneDefault
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add phone number')
      }

      await fetchPhoneNumbers()
      setAddingPhone(false)
      setNewPhoneNumber('')
      setNewPhoneLabel('')
      setNewPhoneDefault(false)
    } catch (error: any) {
      console.error('Error adding phone:', error)
      alert(error.message || 'Failed to add phone number')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleDefault = async (phoneId: string, currentDefault: boolean) => {
    try {
      const response = await fetch(`/api/phone-numbers/${phoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: !currentDefault })
      })

      if (!response.ok) throw new Error('Failed to update phone number')

      await fetchPhoneNumbers()
    } catch (error) {
      console.error('Error updating phone:', error)
      alert('Failed to update phone number')
    }
  }

  const handleAssignDataset = async (phoneId: string, datasetId: string | null) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: phoneId })
      })

      if (!response.ok) throw new Error('Failed to assign dataset')

      await fetchPhoneNumbers()
      await fetchDatasets()
    } catch (error) {
      console.error('Error assigning dataset:', error)
      alert('Failed to assign dataset to phone number')
    }
  }

  const handleDeletePhone = async () => {
    if (!phoneToDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/phone-numbers/${phoneToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete phone number')
      }

      await fetchPhoneNumbers()
      setDeleteDialogOpen(false)
      setPhoneToDelete(null)
    } catch (error: any) {
      console.error('Error deleting phone:', error)
      alert(error.message || 'Failed to delete phone number')
    } finally {
      setSaving(false)
    }
  }

  const handleSendTestSMS = async () => {
    let phoneToTest = ''

    if (testMode === 'manual') {
      if (!testPhoneNumber) {
        alert('Please enter a phone number')
        return
      }
      phoneToTest = testPhoneNumber
    } else {
      if (!testLeadId) {
        alert('Please select a lead')
        return
      }
      const selectedLead = datasetLeads.find(l => l.id === testLeadId)
      if (!selectedLead) {
        alert('Lead not found')
        return
      }
      phoneToTest = selectedLead.phone
    }

    if (!testMessage) {
      alert('Please enter a test message')
      return
    }

    setSendingTest(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/twilio/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneToTest,
          message: testMessage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test SMS')
      }

      setTestResult({
        success: true,
        message: 'Test SMS sent successfully!',
        from: data.from
      })

      // Clear form
      if (testMode === 'manual') {
        setTestPhoneNumber('')
      }
      setTestMessage('')
    } catch (error: any) {
      console.error('Test SMS error:', error)
      setTestResult({
        success: false,
        message: error.message || 'Failed to send test SMS'
      })
    } finally {
      setSendingTest(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, integrations, and preferences
          </p>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    )
  }

  const defaultPhone = phoneNumbers.find(p => p.is_default)

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, integrations, and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="general">
            <User className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="twilio">
            <Phone className="h-4 w-4 mr-2" />
            Twilio
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Account settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Twilio Tab */}
        <TabsContent value="twilio" className="space-y-6">
          {/* Twilio Credentials */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Twilio Credentials
                  </CardTitle>
                  <CardDescription>
                    Configure your Twilio Account SID and Auth Token to enable SMS messaging
                  </CardDescription>
                </div>
                {credentials.hasCredentials && !editingCredentials && (
                  <Button variant="outline" size="sm" onClick={() => setEditingCredentials(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!credentials.hasCredentials || editingCredentials ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-sid">Twilio Account SID</Label>
                    <Input
                      id="account-sid"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={newAccountSid}
                      onChange={(e) => setNewAccountSid(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Starts with &quot;AC&quot; and is 34 characters long
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-token">Twilio Auth Token</Label>
                    <Input
                      id="auth-token"
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••"
                      value={newAuthToken}
                      onChange={(e) => setNewAuthToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      32 characters long, found in your Twilio Console
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCredentials} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Credentials
                        </>
                      )}
                    </Button>
                    {editingCredentials && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingCredentials(false)
                          setNewAccountSid('')
                          setNewAuthToken('')
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Twilio credentials configured</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Account SID: {credentials.twilioAccountSid}</p>
                    <p>Auth Token: {credentials.twilioAuthToken}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phone Numbers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Numbers
                  </CardTitle>
                  <CardDescription>
                    Manage your Twilio phone numbers and assign them to datasets
                  </CardDescription>
                </div>
                <Button onClick={() => setAddingPhone(true)} disabled={!credentials.hasCredentials}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phone Number
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!credentials.hasCredentials ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please configure your Twilio credentials first</p>
                </div>
              ) : phoneNumbers.length === 0 && !addingPhone ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No phone numbers added yet</p>
                  <Button onClick={() => setAddingPhone(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Phone Number
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Add Phone Form */}
                  {addingPhone && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone-number">Phone Number</Label>
                            <Input
                              id="phone-number"
                              placeholder="+447446941322"
                              value={newPhoneNumber}
                              onChange={(e) => setNewPhoneNumber(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone-label">Label (Optional)</Label>
                            <Input
                              id="phone-label"
                              placeholder="e.g., Main Sales Line, Campaign 1"
                              value={newPhoneLabel}
                              onChange={(e) => setNewPhoneLabel(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="default-phone"
                              checked={newPhoneDefault}
                              onCheckedChange={setNewPhoneDefault}
                            />
                            <Label htmlFor="default-phone">Set as default phone number</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddPhone} disabled={saving}>
                              {saving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Add Phone Number
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => {
                              setAddingPhone(false)
                              setNewPhoneNumber('')
                              setNewPhoneLabel('')
                              setNewPhoneDefault(false)
                            }}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Phone Numbers List */}
                  {phoneNumbers.map((phone) => {
                    const assignedDatasets = datasets.filter(d => d.phone_number_id === phone.id)

                    return (
                      <Card key={phone.id} className={phone.is_default ? 'border-primary' : ''}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{phone.phone_number}</p>
                                    {phone.label && (
                                      <p className="text-sm text-muted-foreground">{phone.label}</p>
                                    )}
                                  </div>
                                  {phone.is_default && (
                                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Database className="h-3 w-3" />
                                    {phone.datasets_count} dataset{phone.datasets_count !== 1 ? 's' : ''}
                                  </span>
                                  <span>{phone.total_messages_sent} messages sent</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!phone.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleDefault(phone.id, phone.is_default)}
                                  >
                                    Set as Default
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setPhoneToDelete(phone)
                                    setDeleteDialogOpen(true)
                                  }}
                                  disabled={phone.datasets_count > 0}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {/* Dataset Assignment */}
                            <div className="space-y-2">
                              <Label>Assigned Datasets</Label>
                              {assignedDatasets.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {assignedDatasets.map(dataset => (
                                    <span key={dataset.id} className="px-2 py-1 text-xs bg-secondary rounded">
                                      {dataset.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No datasets assigned to this number</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test SMS
              </CardTitle>
              <CardDescription>
                Send a test message to verify your Twilio configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!credentials.hasCredentials ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please configure your Twilio credentials first
                  </AlertDescription>
                </Alert>
              ) : !defaultPhone ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please add and set a default phone number first
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <Phone className="h-4 w-4" />
                    <AlertDescription>
                      Test SMS will be sent from: <strong>{defaultPhone.phone_number}</strong>
                      {defaultPhone.label && ` (${defaultPhone.label})`}
                    </AlertDescription>
                  </Alert>

                  {/* Test Mode Toggle */}
                  <div className="space-y-2">
                    <Label>Send test to:</Label>
                    <Tabs value={testMode} onValueChange={(v) => setTestMode(v as 'manual' | 'dataset')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Enter Phone Number</TabsTrigger>
                        <TabsTrigger value="dataset">Select from Dataset</TabsTrigger>
                      </TabsList>

                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="test-phone">Phone Number</Label>
                          <Input
                            id="test-phone"
                            placeholder="+447123456789"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Use international format (e.g., +447123456789)
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="dataset" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="test-dataset">Dataset</Label>
                          <Select value={testDatasetId} onValueChange={setTestDatasetId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                            <SelectContent>
                              {datasets.map(dataset => (
                                <SelectItem key={dataset.id} value={dataset.id}>
                                  {dataset.name} ({dataset.total_leads} leads)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {testDatasetId && (
                          <div className="space-y-2">
                            <Label htmlFor="test-lead">Lead</Label>
                            <Select value={testLeadId} onValueChange={setTestLeadId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a lead" />
                              </SelectTrigger>
                              <SelectContent>
                                {datasetLeads.map(lead => (
                                  <SelectItem key={lead.id} value={lead.id}>
                                    {lead.name} - {lead.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Test Message */}
                  <div className="space-y-2">
                    <Label htmlFor="test-message">Message</Label>
                    <Textarea
                      id="test-message"
                      placeholder="Enter your test message here..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendTestSMS}
                    disabled={sendingTest}
                    className="w-full"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test SMS
                      </>
                    )}
                  </Button>

                  {/* Test Result */}
                  {testResult && (
                    <Alert variant={testResult.success ? 'default' : 'destructive'}>
                      {testResult.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {testResult.message}
                        {testResult.from && (
                          <div className="mt-1 text-xs">
                            Sent from: {testResult.from}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure Twilio to send incoming SMS to your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Go to your Twilio Console</li>
                      <li>Navigate to Phone Numbers → Manage → Active Numbers</li>
                      <li>Select your phone number</li>
                      <li>Scroll to &quot;Messaging Configuration&quot;</li>
                      <li>Under &quot;A MESSAGE COMES IN&quot;, paste the webhook URL above</li>
                      <li>Set the method to &quot;HTTP POST&quot;</li>
                      <li>Click Save</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage team members and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{phoneToDelete?.phone_number}&quot;?
              {phoneToDelete?.label && ` (${phoneToDelete.label})`}
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhone}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
