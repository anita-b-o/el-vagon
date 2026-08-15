export function isAllowedAdminProfile(
  profile: { email?: string | null; email_verified?: boolean } | undefined,
  allowedEmails = [
    process.env.ADMIN_GOOGLE_EMAILS,
    process.env.ADMIN_GOOGLE_EMAIL,
  ].filter(Boolean).join(","),
) {
  const normalizedAllowedEmails = new Set(
    allowedEmails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  return Boolean(
    profile?.email_verified === true &&
      profile.email &&
      normalizedAllowedEmails.has(profile.email.trim().toLowerCase()),
  );
}
