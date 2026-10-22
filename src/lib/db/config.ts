/**
 * Normalizes Supabase URL according to specification:
 * Trim spaces and quotes, and strip trailing "/rest/v1", "/rest/v1/", or "/"
 * URL must be exactly https://<project>.supabase.co
 */
export function normalizeSupabaseUrl(url?: string | null): string {
  if (!url) return '';
  let cleaned = url.trim();

  // Strip enclosing quotes if present
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Strip trailing slashes and /rest/v1 variants
  while (cleaned.endsWith('/') || cleaned.endsWith('/rest/v1')) {
    if (cleaned.endsWith('/rest/v1')) {
      cleaned = cleaned.slice(0, -'/rest/v1'.length).trim();
    } else if (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1).trim();
    }
  }

  return cleaned;
}

export function getSupabaseCredentials(): { url: string; serviceKey: string } | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !rawKey) return null;

  const url = normalizeSupabaseUrl(rawUrl);
  let serviceKey = rawKey.trim();

  if (
    (serviceKey.startsWith('"') && serviceKey.endsWith('"')) ||
    (serviceKey.startsWith("'") && serviceKey.endsWith("'"))
  ) {
    serviceKey = serviceKey.slice(1, -1).trim();
  }

  if (!url || !serviceKey) return null;

  return { url, serviceKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}
