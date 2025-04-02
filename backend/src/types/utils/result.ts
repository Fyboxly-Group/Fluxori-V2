/**
 * Result pattern for type-safe error handling
 */

/**
 * Success result type
 */
export interface Success<T> {
  success: true;
  data: T;
}

/**
 * Failure result type
 */
export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Result type (either Success or Failure)
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Create a success result
 */
export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
export function failure<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}

/**
 * Type guard for Success
 */
export function isSuccess<T, E = Error>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard for Failure
 */
export function isFailure<T, E = Error>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}
