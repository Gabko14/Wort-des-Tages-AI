export type AppErrorCode =
  | 'db_clear_failed'
  | 'storage_clear_failed'
  | 'supabase_not_configured'
  | 'supabase_invoke_failed'
  | 'ai_enrich_failed'
  | 'ai_enrich_empty'
  | 'premium_check_failed'
  | 'premium_grant_failed'
  | 'notifications_unavailable'
  | 'notifications_permission_failed'
  | 'notifications_schedule_failed'
  | 'notifications_test_failed'
  | 'settings_save_failed'
  | 'iap_init_failed'
  | 'subscription_fetch_failed'
  | 'purchase_failed'
  | 'purchase_cancelled'
  | 'validation_failed'
  | 'restore_failed'
  | 'platform_not_supported';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export function asAppError(error: unknown, fallback: AppError): AppError {
  if (error instanceof AppError) return error;
  return new AppError(fallback.code, fallback.message, error);
}
