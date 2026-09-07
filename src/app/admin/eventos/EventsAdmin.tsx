"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CulturalEventRow } from "@/db/schema";
import { recurringMonths } from "@/data/recurring-events";
import { deactivateCulturalEventAction, deleteCulturalEventAction, saveCulturalEventAction, type EventActionResult } from "./actions";

type Props = { events: CulturalEventRow[]; adminEmail: string };
const blank = { name: "", category: "", description: "", month: "Enero", monthOrder: 1, startDate: "", endDate: "", dateConfirmed: false, imagePath: "", externalUrl: "", isActive: true, sortOrder: 0 };

export function EventsAdmin({ events, adminEmail }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CulturalEventRow | null>(null);
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<EventActionResult | null>(null);
  const value = editing ?? blank;
  const formKey = editing?.id ?? "new";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const input = { ...raw, monthOrder: Number(raw.monthOrder), sortOrder: Number(raw.sortOrder), dateConfirmed: form.get("dateConfirmed") === "on", isActive: form.get("isActive") === "on" };
    startTransition(async () => { const result = await saveCulturalEventAction(input, editing?.id); setFeedback(result); if (result.ok) { setEditing(null); setDateConfirmed(false); router.refresh(); } });
  }

  function run(action: () => Promise<EventActionResult>) {
    startTransition(async () => { const result = await action(); setFeedback(result); if (result.ok) router.refresh(); });
  }

  return <main className="admin-shell">
    <header className="admin-header"><div><p className="eyebrow">Gestión privada</p><h1>Eventos culturales</h1><p>{adminEmail}</p></div><a className="admin-quiet-button" href="/admin/reservas">Volver a reservas</a></header>
    {feedback ? <p className={`admin-feedback ${feedback.ok ? "is-ok" : "is-error"}`} role="status">{feedback.message}</p> : null}
    <section className="admin-section"><div className="admin-section-heading"><h2>{editing ? "Editar evento" : "Nuevo evento"}</h2></div>
      <form key={formKey} className="event-admin-form" onSubmit={submit}>
        <label className="event-admin-wide"><span>Nombre</span><input name="name" required defaultValue={value.name} maxLength={160} /></label>
        <label><span>Categoría</span><input name="category" required defaultValue={value.category} maxLength={120} /></label>
        <label><span>Mes</span><select name="month" defaultValue={value.month} onChange={(e) => { const index = recurringMonths.findIndex((month) => month.name === e.target.value); e.currentTarget.form?.querySelector<HTMLInputElement>("[name=monthOrder]")?.setAttribute("value", String(index + 1)); }}>{recurringMonths.map((month) => <option key={month.name}>{month.name}</option>)}</select></label>
        <label className="event-admin-wide"><span>Descripción</span><textarea name="description" required defaultValue={value.description} maxLength={1200} /></label>
        <label><span>Imagen</span><input name="imagePath" defaultValue={value.imagePath ?? ""} placeholder="Ruta de la imagen" maxLength={500} /></label>
        <label><span>Link externo</span><input name="externalUrl" type="url" defaultValue={value.externalUrl ?? ""} placeholder="https://" maxLength={500} /></label>
        <fieldset className="event-admin-fieldset event-admin-wide"><legend>Fecha</legend><label className="event-admin-check"><input name="dateConfirmed" type="checkbox" defaultChecked={value.dateConfirmed} onChange={(event) => setDateConfirmed(event.currentTarget.checked)} /> Fecha confirmada</label>
          {dateConfirmed ? <div className="event-admin-dates"><label><span>Desde</span><input name="startDate" type="date" defaultValue={value.startDate ?? ""} required /></label><label><span>Hasta</span><input name="endDate" type="date" defaultValue={value.endDate ?? ""} required /></label></div> : null}
        </fieldset>
        <label className="event-admin-check"><input name="isActive" type="checkbox" defaultChecked={value.isActive} /> Activo</label>
        <label><span>Orden</span><input name="sortOrder" type="number" min="0" max="10000" defaultValue={value.sortOrder} /></label>
        <input name="monthOrder" type="hidden" defaultValue={value.monthOrder} />
        <div className="admin-actions"><button className="button button-dark" disabled={pending} type="submit">{editing ? "Guardar cambios" : "Crear evento"}</button>{editing ? <button className="button button-outline" type="button" onClick={() => { setEditing(null); setDateConfirmed(false); }}>Cancelar</button> : null}</div>
      </form>
    </section>
    <section className="admin-section"><div className="admin-section-heading"><h2>Eventos cargados</h2><span>{events.length}</span></div><div className="event-admin-list">{events.map((event) => <article key={event.id}><div><strong>{event.name}</strong><span>{event.month} · {event.isActive ? "Activo" : "Inactivo"} · orden {event.sortOrder} · {event.dateConfirmed ? "Fecha confirmada" : "Mes habitual"}</span></div><div className="admin-actions"><button className="admin-quiet-button" type="button" onClick={() => { setEditing(event); setDateConfirmed(event.dateConfirmed); }}>Editar</button>{event.isActive ? <button className="admin-quiet-button is-danger" disabled={pending} type="button" onClick={() => window.confirm("¿Desactivar este evento?") && run(() => deactivateCulturalEventAction(event.id))}>Desactivar</button> : <button className="admin-quiet-button is-danger" disabled={pending} type="button" onClick={() => window.confirm("¿Eliminar definitivamente este evento?") && run(() => deleteCulturalEventAction(event.id))}>Eliminar</button>}</div></article>)}</div></section>
  </main>;
}
