import { NextResponse } from 'next/server'

export async function GET() {
  // Respond to GET/HEAD requests for Twilio validation
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}

export async function POST(request: Request) {
  console.log('WEBHOOK CALLED!')

  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
