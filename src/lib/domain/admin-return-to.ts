const defaultAdminReturnTo = "/admin/reservas";

/** Converts Auth.js' callback URL into a safe, local administrative path. */
export function adminReturnTo(callbackUrl: string | string[] | undefined) {
  if (typeof callbackUrl !== "string") return defaultAdminReturnTo;

  try {
    const url = new URL(callbackUrl, "http://localhost");
    return url.pathname.startsWith("/admin/")
      ? `${url.pathname}${url.search}${url.hash}`
      : defaultAdminReturnTo;
  } catch {
    return defaultAdminReturnTo;
  }
}
