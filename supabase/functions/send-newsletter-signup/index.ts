import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Recipient is fixed server-side — never accepted from the browser.
const OWNER_EMAIL = 'adamdayan@bacbs.com'

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    return json({ error: 'Too many requests' }, 429)
  }

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const email = (body.email ?? '').trim().slice(0, 200)
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'Please provide a valid email address.' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const result = await sendTemplateEmail('notification', OWNER_EMAIL, {
      idempotencyKey: `newsletter-signup-${email.toLowerCase()}`,
      templateData: {
        title: 'New Newsletter Signup',
        message: `${email} has subscribed to the Blueprint CBS newsletter.`,
      },
    })

    const { error: logError } = await serviceClient.from('email_send_log').insert({
      template_name: 'notification',
      recipient_email: OWNER_EMAIL,
      status: result.sent ? 'sent' : 'suppressed',
    })
    if (logError) console.error('Failed to write email_send_log', { error: logError })

    return json({ success: result.sent })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to send newsletter signup notice', { error: msg })
    const { error: logError } = await serviceClient.from('email_send_log').insert({
      template_name: 'notification',
      recipient_email: OWNER_EMAIL,
      status: 'failed',
      error_message: msg.slice(0, 1000),
    })
    if (logError) console.error('Failed to write email_send_log', { error: logError })
    return json({ error: 'Failed to subscribe' }, 500)
  }
})
