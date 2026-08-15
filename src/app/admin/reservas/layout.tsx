import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/server/admin-auth";

export default async function ReservationsAdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}
