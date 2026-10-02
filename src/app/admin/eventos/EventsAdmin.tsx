"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CulturalEventRow } from "@/db/schema";
import { recurringMonths } from "@/data/recurring-events";
import { deleteCulturalEventAction, saveCulturalEventAction, setCulturalEventActiveAction, type EventActionResult } from "./actions";

type Props = { events: CulturalEventRow[]; adminEmail: string };
const blank = { name: "", category: "", description: "", month: "Enero", monthOrder: 1, startDate: "", endDate: "", dateConfirmed: false, imagePath: "", externalUrl: "", isActive: true, sortOrder: 0 };

const MAX_EVENT_IMAGE_BYTES = 5 * 1024 * 1024;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

function EventImageField({ initialImage }: { initialImage: string | null }) {
  const [preview, setPreview] = useState(initialImage);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      setError("Formato no permitido. Elegí una imagen JPEG, PNG o WebP.");
      event.currentTarget.value = "";
      return;
    }
    if (file.size === 0 || file.size > MAX_EVENT_IMAGE_BYTES) {
      setError(file.size === 0 ? "La imagen está vacía." : "La imagen supera el límite de 5 MB.");
      event.currentTarget.value = "";
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const nextObjectUrl = URL.createObjectURL(file);
    setObjectUrl(nextObjectUrl);
    setPreview(nextObjectUrl);
    setRemoveImage(false);
    setError("");
  }

  function remove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPreview(null);
    setRemoveImage(true);
    if (fileInput.current) fileInput.current.value = "";
    setError("");
  }

  return <fieldset className="event-image-field event-admin-wide">
    <legend>Imagen del evento</legend>
    {initialImage && !removeImage ? <p className="event-image-current">Imagen actual</p> : null}
    <label className="event-image-picker"><span>{initialImage ? "Elegir nueva imagen" : "Elegir imagen"}</span><input ref={fileInput} name="eventImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} /></label>
    <p className="event-image-help">JPEG, PNG o WebP · máximo 5 MB</p>
    <input name="removeImage" type="hidden" value={removeImage ? "true" : "false"} />
    {error ? <p className="event-image-error" role="alert">{error}</p> : null}
    {preview ? <div className="event-image-preview"><div className="event-image-preview-image" role="img" aria-label="Vista previa de la imagen del evento" style={{ backgroundImage: `url("${preview}")` }} /><button className="button button-outline" type="button" onClick={remove}>Quitar imagen</button></div> : null}
  </fieldset>;
}

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
        <EventImageField key={formKey} initialImage={value.imagePath ?? null} />
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
    <section className="admin-section"><div className="admin-section-heading"><h2>Eventos cargados</h2><span>{events.length}</span></div><div className="event-admin-list">{events.map((event) => <article key={event.id}><div><strong>{event.name}</strong><span>{event.month} · <b>{event.isActive ? "✓ Activo" : "Inactivo"}</b> · orden {event.sortOrder} · {event.dateConfirmed ? "Fecha confirmada" : "Mes habitual"}</span></div><div className="admin-actions"><button className="admin-quiet-button" type="button" onClick={() => { setEditing(event); setDateConfirmed(event.dateConfirmed); }}>Editar</button><button className={event.isActive ? "admin-quiet-button is-danger" : "admin-quiet-button"} disabled={pending} type="button" onClick={() => window.confirm(event.isActive ? "¿Desactivar este evento?" : "¿Activar este evento?") && run(() => setCulturalEventActiveAction(event.id, !event.isActive))}>{event.isActive ? "Desactivar" : "Activar"}</button>{!event.isActive ? <button className="admin-quiet-button is-danger" disabled={pending} type="button" onClick={() => window.confirm("¿Eliminar definitivamente este evento?") && run(() => deleteCulturalEventAction(event.id))}>Eliminar</button> : null}</div></article>)}</div></section>
  </main>;
}
