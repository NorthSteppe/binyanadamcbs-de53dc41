import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Server config error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // --- Authentication: require a valid JWT ---
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const token = authHeader.replace('Bearer ', '')
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const callerId = claimsData.claims.sub as string

  // --- Parse & validate body ---
  let body: { user_id: string; title: string; message: string; link?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!body.user_id || !body.title || !body.message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // --- Authorization: only admins/team_members can send to other users ---
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

  if (body.user_id !== callerId) {
    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .in('role', ['admin', 'team_member'])
      .limit(1)

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient privileges' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // --- Get user email from auth ---
  const { data: { user }, error: userError } = await serviceClient.auth.admin.getUserById(body.user_id)
  if (userError || !user?.email) {
    console.error('Could not find user email', { user_id: body.user_id, error: userError })
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // --- Send via Lovable's managed email API ---
  const idempotencyKey = `notification-${body.user_id}-${Date.now()}`

  try {
    const result = await sendTemplateEmail('notification', user.email, {
      idempotencyKey,
      templateData: {
        title: body.title,
        message: body.message,
        link: body.link,
      },
    })

    const { error: logError } = await serviceClient.from('email_send_log').insert({
      template_name: 'notification',
      recipient_email: user.email,
      status: result.sent ? 'sent' : 'suppressed',
    })
    if (logError) console.error('Failed to write email_send_log', { error: logError })

    if (!result.sent) {
      return new Response(JSON.stringify({ success: false, reason: result.reason }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Failed to send notification email', { error: message })
    const { error: logError } = await serviceClient.from('email_send_log').insert({
      template_name: 'notification',
      recipient_email: user.email,
      status: 'failed',
      error_message: message.slice(0, 1000),
    })
    if (logError) console.error('Failed to write email_send_log', { error: logError })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Notification email sent', { user_id: body.user_id, title: body.title })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
