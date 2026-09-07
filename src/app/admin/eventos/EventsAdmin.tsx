"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CulturalEventRow } from "@/db/schema";
import { recurringMonths } from "@/data/recurring-events";
import { deactivateCulturalEventAction, deleteCulturalEventAction, saveCulturalEventAction, type EventActionResult } from "./actions";

type Props = { events: CulturalEventRow[]; adminEmail: string };
const blank = { slug: "", name: "", category: "", description: "", fact: "", month: "Enero", monthOrder: 1, timing: "Enero", startDate: "", endDate: "", dateConfirmed: false, imagePath: "", imageAlt: "", externalUrl: "", sourceUrl: "", isActive: true, sortOrder: 0 };

export function EventsAdmin({ events, adminEmail }: Props) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CulturalEventRow | null>(null); const [feedback, setFeedback] = useState<EventActionResult | null>(null);
  const value = editing ?? blank;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const raw = Object.fromEntries(form.entries());
    const input = { ...raw, monthOrder: Number(raw.monthOrder), sortOrder: Number(raw.sortOrder), dateConfirmed: form.get("dateConfirmed") === "on", isActive: form.get("isActive") === "on" };
    startTransition(async () => { const result = await saveCulturalEventAction(input, editing?.id); setFeedback(result); if (result.ok) { setEditing(null); router.refresh(); } });
  }
  function run(action: () => Promise<EventActionResult>) { startTransition(async () => { const result = await action(); setFeedback(result); if (result.ok) router.refresh(); }); }
  return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">Gestión privada</p><h1>Eventos culturales</h1><p>{adminEmail}</p></div><a className="admin-quiet-button" href="/admin/reservas">Volver a reservas</a></header>
    {feedback ? <p className={`admin-feedback ${feedback.ok ? "is-ok" : "is-error"}`} role="status">{feedback.message}</p> : null}
    <section className="admin-section"><div className="admin-section-heading"><h2>{editing ? "Editar evento" : "Nuevo evento"}</h2></div><form className="event-admin-form" onSubmit={submit}>
      {[["slug","Slug",value.slug],["name","Nombre",value.name],["category","Categoría",value.category],["timing","Momento del año",value.timing],["imagePath","Imagen (ruta o URL)",value.imagePath ?? ""],["imageAlt","Texto alternativo",value.imageAlt ?? ""],["externalUrl","Link externo",value.externalUrl ?? ""],["sourceUrl","Fuente",value.sourceUrl ?? ""]].map(([name,label,current]) => <label key={name as string}><span>{label}</span><input name={name as string} defaultValue={current as string} maxLength={500} /></label>)}
      <label><span>Mes</span><select name="month" defaultValue={value.month} onChange={(e) => { const selected = recurringMonths.find((month) => month.name === e.target.value); if (selected) e.currentTarget.form?.querySelector<HTMLInputElement>("[name=monthOrder]")?.setAttribute("value", String(["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].indexOf(selected.name) + 1)); }}>{recurringMonths.map((month) => <option key={month.name}>{month.name}</option>)}</select></label>
      <label><span>Orden</span><input name="sortOrder" type="number" min="0" max="10000" defaultValue={value.sortOrder} /></label><input name="monthOrder" type="hidden" defaultValue={value.monthOrder} />
      <label className="event-admin-wide"><span>Descripción</span><textarea name="description" required defaultValue={value.description} maxLength={1200} /></label><label><span>Dato opcional</span><input name="fact" defaultValue={value.fact ?? ""} maxLength={300} /></label>
      <label><span>Desde (sólo confirmada)</span><input name="startDate" type="date" defaultValue={value.startDate ?? ""} /></label><label><span>Hasta (sólo confirmada)</span><input name="endDate" type="date" defaultValue={value.endDate ?? ""} /></label>
      <label className="event-admin-check"><input name="dateConfirmed" type="checkbox" defaultChecked={value.dateConfirmed} /> Fecha confirmada</label><label className="event-admin-check"><input name="isActive" type="checkbox" defaultChecked={value.isActive} /> Visible en agenda</label>
      <div className="admin-actions"><button className="button button-dark" disabled={pending} type="submit">{editing ? "Guardar cambios" : "Crear evento"}</button>{editing ? <button className="button button-outline" type="button" onClick={() => setEditing(null)}>Cancelar</button> : null}</div>
    </form></section>
    <section className="admin-section"><div className="admin-section-heading"><h2>Eventos cargados</h2><span>{events.length}</span></div><div className="event-admin-list">{events.map((event) => <article key={event.id}><div><strong>{event.name}</strong><span>{event.month} · {event.isActive ? "Activo" : "Inactivo"} · orden {event.sortOrder} · {event.dateConfirmed ? "Fecha confirmada" : "Mes habitual"}</span></div><div className="admin-actions"><button className="admin-quiet-button" type="button" onClick={() => setEditing(event)}>Editar</button>{event.isActive ? <button className="admin-quiet-button is-danger" disabled={pending} type="button" onClick={() => window.confirm("¿Desactivar este evento?") && run(() => deactivateCulturalEventAction(event.id))}>Desactivar</button> : <button className="admin-quiet-button is-danger" disabled={pending} type="button" onClick={() => window.confirm("¿Eliminar definitivamente este evento?") && run(() => deleteCulturalEventAction(event.id))}>Eliminar</button>}</div></article>)}</div></section>
  </main>;
}
