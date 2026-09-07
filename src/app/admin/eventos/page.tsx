import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getAdminCulturalEvents } from "@/lib/server/cultural-events";
import { EventsAdmin } from "./EventsAdmin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Eventos | El Vagón", robots: { index: false, follow: false } };

export default async function EventsAdminPage() {
  const [session, events] = await Promise.all([requireAdmin(), getAdminCulturalEvents()]);
  return <EventsAdmin events={events} adminEmail={session.user?.email ?? ""} />;
}
