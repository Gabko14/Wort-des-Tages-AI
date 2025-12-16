import { AppError, asAppError } from '../appError';

describe('AppError', () => {
  it('should preserve code and message when thrown directly', () => {
    const error = new AppError('settings_save_failed', 'Failed to save');

    expect(error.code).toBe('settings_save_failed');
    expect(error.message).toBe('Failed to save');
    expect(error.name).toBe('AppError');
  });

  it('should wrap unknown errors with fallback code and message', () => {
    const fallback = new AppError('db_clear_failed', 'Clear failed');
    const wrapped = asAppError(new Error('boom'), fallback);

    expect(wrapped.code).toBe('db_clear_failed');
    expect(wrapped.message).toBe('Clear failed');
    expect(wrapped.cause).toBeInstanceOf(Error);
  });

  it('should return the existing AppError instance', () => {
    const existing = new AppError('supabase_not_configured', 'Missing config');

    const result = asAppError(existing, new AppError('db_clear_failed', 'unused'));

    expect(result).toBe(existing);
  });
});
