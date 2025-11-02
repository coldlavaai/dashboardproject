'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Phone, Mail, MapPin } from 'lucide-react'

interface Lead {
  id: string
  first_name: string
  last_name: string
  phone_number: string
  email: string | null
  postcode: string
  contact_status: string
  latest_lead_reply: string | null
}

interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  body: string
  timestamp: string
  status?: string
}

interface SmsChatModalProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
}

export function SmsChatModal({ lead, open, onOpenChange, onRefresh }: SmsChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && lead) {
      fetchMessages()
    }
  }, [open, lead])

  const fetchMessages = async () => {
    if (!lead) return

    setLoading(true)
    try {
      const response = await fetch(`/api/messages/${lead.id}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !lead || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          message: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Add message to UI immediately
      setMessages(prev => [...prev, {
        id: data.messageId || Date.now().toString(),
        direction: 'outbound',
        body: newMessage.trim(),
        timestamp: new Date().toISOString(),
        status: 'sent'
      }])

      setNewMessage('')

      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Conversation with {lead.first_name} {lead.last_name}
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{lead.phone_number}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.postcode && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{lead.postcode}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pr-4 max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.direction === 'outbound'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    <p className={`text-xs mt-1 ${
                      message.direction === 'outbound'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}>
                      {new Date(message.timestamp).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="self-end"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {newMessage.length} / 160 characters
        </p>
      </DialogContent>
    </Dialog>
  )
}
