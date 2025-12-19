// @ts-nocheck
/* eslint-disable import/no-unresolved */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const adminSecret = Deno.env.get('ADMIN_SECRET');

// Google Play API credentials
const GOOGLE_PACKAGE_NAME = Deno.env.get('GOOGLE_PACKAGE_NAME');
const GOOGLE_SERVICE_ACCOUNT_EMAIL = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase-Umgebungsvariablen fehlen');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Entitlements are keyed by device_id (not user account).
// This means: same Google account = premium on all devices.
// Purchase tokens are validated with Google API, not stored for uniqueness checks.
type Entitlement = {
  device_id: string;
  is_premium: boolean;
  premium_source: string | null;
  purchase_token: string | null;
  subscription_id: string | null;
  expires_at: string | null;
  auto_renewing: boolean;
  original_purchase_date: string | null;
  last_validated_at: string | null;
  updated_at: string;
};

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface SubscriptionPurchase {
  kind: string;
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: string;
  countryCode: string;
  developerPayload: string;
  paymentState: number;
  cancelReason?: number;
  userCancellationTimeMillis?: string;
  orderId: string;
  purchaseType?: number;
  acknowledgementState: number;
}

// Convert PEM to binary for crypto operations
function pemToBinary(pem: string): ArrayBuffer {
  const lines = pem.split('\n');
  const base64 = lines.filter((line) => !line.startsWith('-----')).join('');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Base64URL encode for JWT
function base64UrlEncode(data: string | ArrayBuffer): string {
  let base64: string;
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else {
    base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Get Google OAuth2 access token using service account
async function getGoogleAccessToken(): Promise<string> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Google service account not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64UrlEncode(
    JSON.stringify({
      iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: exp,
    })
  );

  // Sign JWT with private key
  const privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    pemToBinary(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    encoder.encode(`${header}.${claim}`)
  );

  const jwt = `${header}.${claim}.${base64UrlEncode(signature)}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth failed: ${response.status} - ${errorText}`);
  }

  const data: GoogleTokenResponse = await response.json();
  return data.access_token;
}

// Validate purchase with Google Play Developer API
async function validateGooglePlaySubscription(
  subscriptionId: string,
  purchaseToken: string
): Promise<SubscriptionPurchase | null> {
  if (!GOOGLE_PACKAGE_NAME) {
    throw new Error('Google package name not configured');
  }

  try {
    const accessToken = await getGoogleAccessToken();

    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Google Play API error:', response.status, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Google Play validation failed:', error);
    return null;
  }
}

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
  let subscriptionId: string | undefined;

  try {
    const body = await req.json();
    deviceId = body?.deviceId;
    source = body?.source ?? 'dev';
    purchaseToken = body?.purchaseToken;
    subscriptionId = body?.subscriptionId;
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

  const now = new Date().toISOString();

  // Handle dev source - require admin secret
  if (source === 'dev') {
    const providedSecret = req.headers.get('X-Admin-Secret');
    if (!adminSecret || providedSecret !== adminSecret) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: Partial<Entitlement> = {
      device_id: deviceId,
      is_premium: true,
      premium_source: 'dev',
      purchase_token: null,
      subscription_id: null,
      expires_at: null,
      auto_renewing: false,
      updated_at: now,
    };

    const { error } = await supabase
      .from<Entitlement>('entitlements')
      .upsert(payload, { onConflict: 'device_id' });

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'db_error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle Google Play source - validate purchase
  if (source === 'google_play') {
    if (!purchaseToken || !subscriptionId) {
      return new Response(JSON.stringify({ error: 'missing_purchase_data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate with Google Play
    let subscriptionData: SubscriptionPurchase | null;
    try {
      subscriptionData = await validateGooglePlaySubscription(subscriptionId, purchaseToken);
    } catch (error) {
      console.error('Google Play validation error:', error);
      return new Response(JSON.stringify({ error: 'google_play_not_configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!subscriptionData) {
      return new Response(JSON.stringify({ error: 'invalid_purchase' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if subscription is valid (not expired)
    const expiryTime = parseInt(subscriptionData.expiryTimeMillis, 10);
    const isActive = expiryTime > Date.now();

    if (!isActive) {
      return new Response(JSON.stringify({ error: 'subscription_expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: Partial<Entitlement> = {
      device_id: deviceId,
      is_premium: true,
      premium_source: 'google_play',
      purchase_token: purchaseToken,
      subscription_id: subscriptionId,
      expires_at: new Date(expiryTime).toISOString(),
      auto_renewing: subscriptionData.autoRenewing,
      original_purchase_date: new Date(
        parseInt(subscriptionData.startTimeMillis, 10)
      ).toISOString(),
      last_validated_at: now,
      updated_at: now,
    };

    const { error } = await supabase
      .from<Entitlement>('entitlements')
      .upsert(payload, { onConflict: 'device_id' });

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'db_error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiresAt: new Date(expiryTime).toISOString(),
        autoRenewing: subscriptionData.autoRenewing,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ error: 'invalid_source' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
});
