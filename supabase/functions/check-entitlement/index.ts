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
  expires_at: string | null;
  auto_renewing: boolean;
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let deviceId: string | undefined;
  try {
    const body = await req.json();
    deviceId = body?.deviceId;
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

  const { data, error } = await supabase
    .from<Entitlement>('entitlements')
    .select('device_id,is_premium,premium_source,expires_at,auto_renewing')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: 'db_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let isPremium = data?.is_premium ?? false;
  const source = data?.premium_source ?? null;
  const expiresAt = data?.expires_at ?? null;
  const autoRenewing = data?.auto_renewing ?? false;

  // Check if subscription-based premium has expired
  if (isPremium && source === 'google_play' && expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (expiryDate < new Date()) {
      isPremium = false;

      // Update the database to reflect expired status
      await supabase
        .from('entitlements')
        .update({
          is_premium: false,
          updated_at: new Date().toISOString(),
        })
        .eq('device_id', deviceId);
    }
  }

  return new Response(
    JSON.stringify({
      isPremium,
      source: source ?? undefined,
      expiresAt: expiresAt ?? undefined,
      autoRenewing,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
