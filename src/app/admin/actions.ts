"use server";

import { signOut } from "@/auth";

/** Shared administrative sign-out action. */
export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
