import { REQUEST_TIMEOUT_MS } from "./config";
import { isDate } from "./dates";

async function load<T>(url: string, read: (response: Response) => Promise<T>, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    if (signal?.aborted) controller.abort();
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} (${response.statusText})`);
    return await read(response);
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) throw new Error("Zeitüberschreitung beim Datenabruf");
    if (error instanceof TypeError) throw new Error("Netzwerk- oder CORS-Fehler beim direkten Abruf");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export function getText(url: string, signal?: AbortSignal): Promise<string> {
  return load(url, (response) => response.text(), signal);
}

export async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  return load(url, (response) => response.json(), signal);
}

export function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label}: ungültiges Antwortformat`);
  return value as Record<string, unknown>;
}

export function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function timestamp(value: unknown): string | null {
  return typeof value === "string" && isDate(value.slice(0, 10)) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value)) ? value : null;
}