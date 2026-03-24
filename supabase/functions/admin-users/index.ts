// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { action, ...payload } = await req.json()

  try {
    if (action === 'create') {
      const { email, password, nombre, username, rol, permisos } = payload

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (authError) throw authError

      const { error: profileError } = await supabaseAdmin
        .from('perfiles')
        .insert({
          user_id: authData.user.id,
          username,
          nombre,
          email,
          rol,
          activo: true,
          permisos,
          debe_cambiar_pass: true,
          pass_temporal: password,
        })

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      return new Response(JSON.stringify({ user: authData.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { userId } = payload
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Acción inválida')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})