export function isAllowedAdminProfile(
  profile: { email?: string | null; email_verified?: boolean } | undefined,
  allowedEmail = process.env.ADMIN_GOOGLE_EMAIL,
) {
  const normalizedAllowedEmail = allowedEmail?.trim().toLowerCase();
  return Boolean(
    normalizedAllowedEmail &&
      profile?.email_verified === true &&
      profile.email?.trim().toLowerCase() === normalizedAllowedEmail,
  );
}
