// @ts-nocheck
/* eslint-disable import/no-unresolved */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase-Umgebungsvariablen fehlen');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

type Entitlement = {
  device_id: string;
  is_premium: boolean;
  premium_source: string | null;
  purchase_token: string | null;
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let deviceId: string | undefined;
  let source: string | undefined;
  let purchaseToken: string | undefined;

  try {
    const body = await req.json();
    deviceId = body?.deviceId;
    source = body?.source ?? 'dev';
    purchaseToken = body?.purchaseToken;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!deviceId || typeof deviceId !== 'string') {
    return new Response(JSON.stringify({ error: 'missing_device_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload: Entitlement = {
    device_id: deviceId,
    is_premium: true,
    premium_source: source,
    purchase_token: purchaseToken ?? null,
  };

  const { error } = await supabase
    .from<Entitlement>('entitlements')
    .upsert(payload, { onConflict: 'device_id' });

  if (error) {
    return new Response(JSON.stringify({ error: 'db_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
