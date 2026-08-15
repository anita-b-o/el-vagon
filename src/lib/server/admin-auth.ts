import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAllowedAdminProfile } from "@/lib/domain/admin-auth";

export async function requireAdmin() {
  const session = await auth();
  if (!isAllowedAdminProfile({
    email: session?.user?.email,
    email_verified: Boolean(session?.user?.email),
  })) {
    redirect("/admin/login");
  }
  return session!;
}
