"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

type Props = {
  onBeforeSignOut?: () => boolean;
};

/** The same logout affordance used across the private administration. */
export function AdminLogout({ onBeforeSignOut }: Props) {
  return <form action={signOutAction} onSubmit={(event) => {
    if (onBeforeSignOut && !onBeforeSignOut()) event.preventDefault();
  }}>
    <button className="admin-quiet-button" type="submit"><LogOut aria-hidden="true" /> Salir</button>
  </form>;
}
