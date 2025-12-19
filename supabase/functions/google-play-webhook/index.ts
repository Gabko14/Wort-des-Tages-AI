// @ts-nocheck
/* eslint-disable import/no-unresolved */
/**
 * Google Play Real-time Developer Notifications (RTDN) webhook handler.
 *
 * This function receives notifications from Google Play via Cloud Pub/Sub
 * when subscription status changes (renewals, cancellations, expirations, etc).
 *
 * Setup:
 * 1. Create a Cloud Pub/Sub topic in Google Cloud Console
 * 2. Add a push subscription pointing to this function's URL
 * 3. Configure the topic in Google Play Console → Monetization Setup
 * 4. Grant publish access to google-play-developer-notifications@system.gserviceaccount.com
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GOOGLE_PACKAGE_NAME = Deno.env.get('GOOGLE_PACKAGE_NAME');
const GOOGLE_SERVICE_ACCOUNT_EMAIL = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase-Umgebungsvariablen fehlen');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Notification types from Google Play RTDN
// https://developer.android.com/google/play/billing/rtdn-reference
enum NotificationType {
  SUBSCRIPTION_RECOVERED = 1,
  SUBSCRIPTION_RENEWED = 2,
  SUBSCRIPTION_CANCELED = 3,
  SUBSCRIPTION_PURCHASED = 4,
  SUBSCRIPTION_ON_HOLD = 5,
  SUBSCRIPTION_IN_GRACE_PERIOD = 6,
  SUBSCRIPTION_RESTARTED = 7,
  SUBSCRIPTION_PRICE_CHANGE_CONFIRMED = 8,
  SUBSCRIPTION_DEFERRED = 9,
  SUBSCRIPTION_PAUSED = 10,
  SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED = 11,
  SUBSCRIPTION_REVOKED = 12,
  SUBSCRIPTION_EXPIRED = 13,
}

interface SubscriptionNotification {
  version: string;
  notificationType: NotificationType;
  purchaseToken: string;
  subscriptionId: string;
}

interface DeveloperNotification {
  version: string;
  packageName: string;
  eventTimeMillis: string;
  subscriptionNotification?: SubscriptionNotification;
  testNotification?: { version: string };
}

interface PubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface SubscriptionPurchase {
  expiryTimeMillis: string;
  startTimeMillis: string;
  autoRenewing: boolean;
  paymentState: number;
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
    throw new Error(`Google OAuth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Get subscription details from Google Play API
async function getSubscriptionDetails(
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
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error('Google Play API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get subscription details:', error);
    return null;
  }
}

serve(async (req) => {
  // Only accept POST from Cloud Pub/Sub
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const pubSubMessage: PubSubMessage = await req.json();

    // Decode base64 message data
    const messageData = JSON.parse(atob(pubSubMessage.message.data)) as DeveloperNotification;

    // Handle test notifications
    if (messageData.testNotification) {
      console.log('Received test notification:', messageData.testNotification.version);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate package name
    if (messageData.packageName !== GOOGLE_PACKAGE_NAME) {
      console.error('Invalid package name:', messageData.packageName);
      return new Response('Invalid package', { status: 400 });
    }

    const notification = messageData.subscriptionNotification;
    if (!notification) {
      console.log('No subscription notification in message');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const { purchaseToken, subscriptionId, notificationType } = notification;

    console.log(
      `Processing notification type ${notificationType} (${NotificationType[notificationType]}) for subscription ${subscriptionId}`
    );

    // Find entitlement by purchase token
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('*')
      .eq('purchase_token', purchaseToken)
      .maybeSingle();

    if (!entitlement) {
      console.log('No entitlement found for purchase token - may be a new purchase');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const now = new Date().toISOString();

    // Get fresh subscription data from Google
    const subscriptionData = await getSubscriptionDetails(subscriptionId, purchaseToken);

    switch (notificationType) {
      case NotificationType.SUBSCRIPTION_PURCHASED:
      case NotificationType.SUBSCRIPTION_RENEWED:
      case NotificationType.SUBSCRIPTION_RECOVERED:
      case NotificationType.SUBSCRIPTION_RESTARTED:
        // Subscription is active - extend/confirm premium
        if (subscriptionData) {
          await supabase
            .from('entitlements')
            .update({
              is_premium: true,
              expires_at: new Date(parseInt(subscriptionData.expiryTimeMillis, 10)).toISOString(),
              auto_renewing: subscriptionData.autoRenewing,
              last_validated_at: now,
              updated_at: now,
            })
            .eq('device_id', entitlement.device_id);

          console.log(`Extended premium for device ${entitlement.device_id}`);
        }
        break;

      case NotificationType.SUBSCRIPTION_CANCELED:
      case NotificationType.SUBSCRIPTION_ON_HOLD:
      case NotificationType.SUBSCRIPTION_PAUSED:
        // Subscription won't renew but may still be valid until expiry
        if (subscriptionData) {
          await supabase
            .from('entitlements')
            .update({
              auto_renewing: false,
              expires_at: new Date(parseInt(subscriptionData.expiryTimeMillis, 10)).toISOString(),
              last_validated_at: now,
              updated_at: now,
            })
            .eq('device_id', entitlement.device_id);

          console.log(`Subscription canceled/paused for device ${entitlement.device_id}`);
        }
        break;

      case NotificationType.SUBSCRIPTION_EXPIRED:
      case NotificationType.SUBSCRIPTION_REVOKED:
        // Subscription is no longer valid - remove premium
        await supabase
          .from('entitlements')
          .update({
            is_premium: false,
            auto_renewing: false,
            last_validated_at: now,
            updated_at: now,
          })
          .eq('device_id', entitlement.device_id);

        console.log(`Removed premium for device ${entitlement.device_id}`);
        break;

      case NotificationType.SUBSCRIPTION_IN_GRACE_PERIOD:
        // Keep premium active during grace period
        if (subscriptionData) {
          await supabase
            .from('entitlements')
            .update({
              is_premium: true,
              expires_at: new Date(parseInt(subscriptionData.expiryTimeMillis, 10)).toISOString(),
              last_validated_at: now,
              updated_at: now,
            })
            .eq('device_id', entitlement.device_id);

          console.log(`Grace period for device ${entitlement.device_id}`);
        }
        break;

      case NotificationType.SUBSCRIPTION_DEFERRED:
      case NotificationType.SUBSCRIPTION_PRICE_CHANGE_CONFIRMED:
      case NotificationType.SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED:
        // Informational - update last validated time
        await supabase
          .from('entitlements')
          .update({
            last_validated_at: now,
            updated_at: now,
          })
          .eq('device_id', entitlement.device_id);
        break;

      default:
        console.log('Unhandled notification type:', notificationType);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent Pub/Sub retries for malformed messages
    // For transient errors, we could return 500 to trigger retry
    return new Response(JSON.stringify({ error: 'processing_error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
