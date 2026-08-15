"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CalendarClock, LogOut, RefreshCw } from "lucide-react";
import { formatLocalDate, formatTimestampInArgentina, nightsBetween, parseLocalDate } from "@/lib/domain/dates";
import {
  cancelRequestAction,
  confirmRequestAction,
  createManualBlockAction,
  refreshCalendarsAction,
  rejectRequestAction,
  releaseManualBlockAction,
  signOutAction,
  type AdminActionResult,
} from "./actions";

type RequestItem = {
  id: string;
  fullName: string | null;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  question: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  anonymizedAt: string | null;
};

type BlockItem = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  source: "DIRECT" | "MANUAL";
  releasedAt: string | null;
};

type FeedItem = {
  source: "AIRBNB" | "BOOKING";
  configured: boolean;
  fetchedAt: string | null;
  failedAt: string | null;
  consecutiveFailures: number;
};

type Props = {
  requests: RequestItem[];
  blocks: BlockItem[];
  feeds: FeedItem[];
  adminEmail: string;
};

const statusLabels = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  REJECTED: "Descartada",
  CANCELLED: "Cancelada",
};

export function AdminDashboard({ requests, blocks, feeds, adminEmail }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<AdminActionResult | null>(null);
  const pendingRequests = requests.filter((request) => request.status === "PENDING");
  const history = requests.filter((request) => request.status !== "PENDING");
  const activeManualBlocks = blocks.filter((block) => block.source === "MANUAL" && !block.releasedAt);

  useEffect(() => {
    const refresh = () => router.refresh();
    const interval = window.setInterval(refresh, 10_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  function run(action: () => Promise<AdminActionResult>, onSuccess?: () => void) {
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      setFeedback(result);
      if (result.ok) onSuccess?.();
      router.refresh();
    });
  }

  function confirmRequest(request: RequestItem) {
    const checkIn = formatLocalDate(parseLocalDate(request.checkIn), { day: "2-digit", month: "2-digit" });
    const checkOut = formatLocalDate(parseLocalDate(request.checkOut), { day: "2-digit", month: "2-digit" });
    if (window.confirm(`¿Confirmar que El Vagón estará ocupado del ${checkIn} al ${checkOut}?`)) {
      run(() => confirmRequestAction(request.id));
    }
  }

  function rejectRequest(request: RequestItem) {
    if (window.confirm(`¿Descartar la solicitud de ${request.fullName ?? "este huésped"}?`)) {
      run(() => rejectRequestAction(request.id));
    }
  }

  function cancelRequest(request: RequestItem) {
    if (window.confirm("¿Cancelar esta reserva confirmada y liberar sus fechas?")) {
      run(() => cancelRequestAction(request.id));
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Gestión privada</p>
          <h1>Reservas</h1>
          <p>{adminEmail}</p>
        </div>
        <form action={signOutAction}>
          <button className="admin-quiet-button" type="submit"><LogOut aria-hidden="true" /> Salir</button>
        </form>
      </header>

      <div className="admin-summary">
        <div><strong>{pendingRequests.length}</strong><span>solicitudes pendientes</span></div>
        <button className="admin-quiet-button" disabled={pending} type="button" onClick={() => run(refreshCalendarsAction)}>
          <RefreshCw className={pending ? "spin" : ""} aria-hidden="true" /> Actualizar calendarios
        </button>
      </div>

      {feedback ? <p className={`admin-feedback ${feedback.ok ? "is-ok" : "is-error"}`} role="status">{feedback.message}</p> : null}

      <section className="admin-section" aria-labelledby="pending-heading">
        <div className="admin-section-heading">
          <h2 id="pending-heading">Pendientes</h2>
          <span>{pendingRequests.length}</span>
        </div>
        {pendingRequests.length ? (
          <div className="request-grid">
            {pendingRequests.map((request) => (
              <article className="request-card" key={request.id}>
                <div className="request-card-top">
                  <div><h3>{request.fullName}</h3><span className="status status-pending">Pendiente</span></div>
                  <time>{formatTimestampInArgentina(new Date(request.createdAt))}</time>
                </div>
                <dl className="request-details">
                  <div><dt>Ingreso</dt><dd>{formatLocalDate(parseLocalDate(request.checkIn))}</dd></div>
                  <div><dt>Salida</dt><dd>{formatLocalDate(parseLocalDate(request.checkOut))}</dd></div>
                  <div><dt>Noches</dt><dd>{nightsBetween(parseLocalDate(request.checkIn), parseLocalDate(request.checkOut))}</dd></div>
                  <div><dt>Huéspedes</dt><dd>{request.guestCount}</dd></div>
                </dl>
                {request.question ? <div className="request-question"><span>Consulta</span><p>{request.question}</p></div> : null}
                <div className="admin-actions">
                  <button className="button button-dark" disabled={pending} type="button" onClick={() => confirmRequest(request)}>Confirmar ocupación</button>
                  <button className="button button-outline" disabled={pending} type="button" onClick={() => rejectRequest(request)}>Descartar</button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="admin-empty">No hay solicitudes pendientes.</p>}
      </section>

      <section className="admin-columns">
        <div className="admin-section">
          <div className="admin-section-heading"><h2>Bloqueos manuales</h2></div>
          <form className="manual-block-form" onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const formElement = event.currentTarget;
            run(() => createManualBlockAction({
              startDate: form.get("startDate"),
              endDate: form.get("endDate"),
              reason: form.get("reason"),
            }), () => formElement.reset());
          }}>
            <label><span>Desde</span><input name="startDate" type="date" required /></label>
            <label><span>Hasta</span><input name="endDate" type="date" required /></label>
            <label className="manual-reason"><span>Motivo opcional</span><input name="reason" maxLength={300} placeholder="Mantenimiento, uso personal…" /></label>
            <button className="button button-dark" disabled={pending} type="submit">Bloquear fechas</button>
          </form>
          <div className="block-list">
            {activeManualBlocks.map((block) => (
              <article key={block.id}>
                <div><strong>{formatLocalDate(parseLocalDate(block.startDate))} → {formatLocalDate(parseLocalDate(block.endDate))}</strong><span>{block.reason || "Sin motivo"}</span></div>
                <button className="admin-quiet-button" disabled={pending} type="button" onClick={() => {
                  if (window.confirm("¿Desbloquear estas fechas?")) run(() => releaseManualBlockAction(block.id));
                }}>Desbloquear</button>
              </article>
            ))}
            {!activeManualBlocks.length ? <p className="admin-empty">No hay bloqueos manuales activos.</p> : null}
          </div>
        </div>

        <aside className="admin-section feed-status">
          <div className="admin-section-heading"><h2>Calendarios externos</h2></div>
          {feeds.map((feed) => (
            <div className="feed-row" key={feed.source}>
              <CalendarClock aria-hidden="true" />
              <div><strong>{feed.source === "AIRBNB" ? "Airbnb" : "Booking"}</strong><span>{!feed.configured ? "No configurado" : feed.consecutiveFailures ? "Última actualización fallida" : feed.fetchedAt ? `Actualizado ${formatTimestampInArgentina(new Date(feed.fetchedAt))}` : "Pendiente de actualización"}</span></div>
              <i className={feed.configured && !feed.consecutiveFailures ? "is-ok" : ""} />
            </div>
          ))}
          <p className="admin-note">La sincronización iCal depende también de los tiempos de Airbnb y Booking y no es instantánea.</p>
        </aside>
      </section>

      <section className="admin-section" aria-labelledby="history-heading">
        <div className="admin-section-heading"><h2 id="history-heading">Historial</h2><span>{history.length}</span></div>
        <div className="history-list">
          {history.map((request) => (
            <article key={request.id}>
              <div><strong>{request.fullName ?? "Datos anonimizados"}</strong><span>{formatLocalDate(parseLocalDate(request.checkIn))} → {formatLocalDate(parseLocalDate(request.checkOut))} · {request.guestCount} huésped{request.guestCount === 1 ? "" : "es"}</span></div>
              <span className={`status status-${request.status.toLowerCase()}`}>{statusLabels[request.status]}</span>
              {request.status === "CONFIRMED" ? <button className="admin-quiet-button is-danger" disabled={pending} type="button" onClick={() => cancelRequest(request)}>Cancelar y liberar</button> : null}
            </article>
          ))}
          {!history.length ? <p className="admin-empty">Todavía no hay historial.</p> : null}
        </div>
      </section>
    </main>
  );
}
