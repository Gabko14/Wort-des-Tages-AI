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
};

type Wort = {
  id: number;
  lemma: string;
  wortklasse?: string;
};

async function isPremium(deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from<Entitlement>('entitlements')
    .select('is_premium')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.is_premium ?? false;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let deviceId: string | undefined;
  let words: Wort[] | undefined;

  try {
    const body = await req.json();
    deviceId = body?.deviceId;
    words = body?.words;
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

  if (!Array.isArray(words)) {
    return new Response(JSON.stringify({ error: 'missing_words' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const premium = await isPremium(deviceId);
  if (!premium) {
    return new Response(
      JSON.stringify({ error: 'not_premium', message: 'Premium erforderlich' }),
      {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ enrichedWords: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
