import { NextResponse } from 'next/server'
import { getUserClients } from '@/lib/clients/actions'

export async function GET() {
  const { clients, error } = await getUserClients()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ clients })
}
