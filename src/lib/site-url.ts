function normalizeHttpsUrl(value: string | undefined) {
  const candidate = value?.trim();

  if (!candidate) return "";

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:") return "";

    url.hash = "";
    url.search = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function getSiteUrl() {
  const configuredUrl = normalizeHttpsUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredUrl) return configuredUrl;

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  return normalizeHttpsUrl(
    vercelProductionHost ? `https://${vercelProductionHost}` : undefined,
  );
}
