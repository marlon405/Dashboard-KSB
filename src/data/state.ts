import type { SourceState } from "./types";

export function success<T>(
  data: T, at: string, stale = false, previous?: SourceState<T>,
): SourceState<T> {
  return { data, loading: false, error: null, lastSuccess: at,
    lastFailure: previous?.lastFailure ?? null, stale };
}

export function failure<T>(previous: SourceState<T>, message: string, at: string): SourceState<T> {
  return {
    ...previous, loading: false, error: message, lastFailure: at,
    stale: previous.data !== null,
  };
}