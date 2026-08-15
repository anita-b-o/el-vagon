import { AdminDashboard } from "./AdminDashboard";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getAdminDashboardData } from "@/lib/server/admin-reservations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reservas | El Vagón" };

export default async function ReservationsAdminPage() {
  const [session, data] = await Promise.all([requireAdmin(), getAdminDashboardData()]);
  return <AdminDashboard {...data} adminEmail={session.user?.email ?? ""} />;
}
