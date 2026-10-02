import Link from "next/link";

type Props = {
  active: "reservas" | "eventos";
  onBeforeNavigate?: () => boolean;
};

export function AdminNav({ active, onBeforeNavigate }: Props) {
  function confirmNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    if (onBeforeNavigate && !onBeforeNavigate()) event.preventDefault();
  }

  return <nav className="admin-nav" aria-label="Gestión privada">
    <Link href="/admin/reservas" onClick={confirmNavigation} aria-current={active === "reservas" ? "page" : undefined}>Reservas</Link>
    <Link href="/admin/eventos" onClick={confirmNavigation} aria-current={active === "eventos" ? "page" : undefined}>Eventos</Link>
    <Link href="/" onClick={confirmNavigation} target="_blank" rel="noopener noreferrer">El Vagón</Link>
  </nav>;
}
