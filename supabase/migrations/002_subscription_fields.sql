-- Add subscription lifecycle columns to entitlements table
ALTER TABLE entitlements
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS auto_renewing boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS original_purchase_date timestamptz,
ADD COLUMN IF NOT EXISTS last_validated_at timestamptz;

-- Index for querying expired subscriptions efficiently
CREATE INDEX IF NOT EXISTS idx_entitlements_expires_at
ON entitlements(expires_at)
WHERE premium_source = 'google_play';
