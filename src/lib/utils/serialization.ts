export function serializeDocument<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
