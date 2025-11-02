import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] GET request to log-webhook`)
  console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())))
  console.log('URL:', request.url)

  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}

export async function POST(request: Request) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ============ WEBHOOK POST REQUEST ============`)
  console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())))
  console.log('URL:', request.url)

  try {
    const formData = await request.formData()
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })
    console.log('Form Data:', JSON.stringify(data, null, 2))
  } catch (e) {
    console.log('Error parsing form data:', e)
  }

  console.log('============================================')

  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  )
}
