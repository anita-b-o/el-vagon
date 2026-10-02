"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CulturalEventRow } from "@/db/schema";
import { recurringMonths } from "@/data/recurring-events";
import { AdminNav } from "@/components/AdminNav";
import { AdminLogout } from "@/components/AdminLogout";
import { reorderMonthEvents } from "@/lib/domain/event-order";
import { deleteCulturalEventAction, saveCulturalEventAction, saveCulturalEventOrderAction, setCulturalEventActiveAction, type EventActionResult } from "./actions";

type Props = { events: CulturalEventRow[]; adminEmail: string };
const blank = { name: "", category: "", description: "", month: "Enero", monthOrder: 1, startDate: "", endDate: "", dateConfirmed: false, imagePath: "", externalUrl: "", isActive: true, sortOrder: 0 };

const MAX_EVENT_IMAGE_BYTES = 5 * 1024 * 1024;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const orderFeedbackStorageKey = "el-vagon:order-feedback";
const orderFeedbackDuration = 2_500;

type StoredOrderFeedback = EventActionResult & { expiresAt: number };

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
  const [savingOrder, startSavingOrder] = useTransition();
  const [editing, setEditing] = useState<CulturalEventRow | null>(null);
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<EventActionResult | null>(null);
  const [orderedEvents, setOrderedEvents] = useState(events);
  const [originalEvents, setOriginalEvents] = useState(events);
  const [dirtyMonths, setDirtyMonths] = useState<Set<number>>(() => new Set());
  const value = editing ?? blank;
  const formKey = editing?.id ?? "new";
  const formSection = useRef<HTMLElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const hasUnsavedOrderChanges = dirtyMonths.size > 0;
  const previousEvents = useRef(events);

  function showOrderFeedback(result: EventActionResult) {
    setFeedback(result);
    if (!result.ok) return;

    const expiresAt = Date.now() + orderFeedbackDuration;
    window.sessionStorage.setItem(orderFeedbackStorageKey, JSON.stringify({ ...result, expiresAt }));
    window.setTimeout(() => {
      window.sessionStorage.removeItem(orderFeedbackStorageKey);
      setFeedback((current) => current?.ok && current.message === result.message ? null : current);
    }, orderFeedbackDuration);
  }

  useEffect(() => {
    const stored = window.sessionStorage.getItem(orderFeedbackStorageKey);
    if (!stored) return;

    try {
      const storedFeedback = JSON.parse(stored) as StoredOrderFeedback;
      const remaining = storedFeedback.expiresAt - Date.now();
      if (!storedFeedback.ok || !storedFeedback.message || remaining <= 0) {
        window.sessionStorage.removeItem(orderFeedbackStorageKey);
        return;
      }
      // Defer the client-only flash until after hydration rather than changing
      // state synchronously while this effect is being installed.
      const revealTimeout = window.setTimeout(() => {
        setFeedback({ ok: true, message: storedFeedback.message });
      }, 0);
      const expireTimeout = window.setTimeout(() => {
        window.sessionStorage.removeItem(orderFeedbackStorageKey);
        setFeedback(null);
      }, remaining);
      return () => {
        window.clearTimeout(revealTimeout);
        window.clearTimeout(expireTimeout);
      };
    } catch {
      window.sessionStorage.removeItem(orderFeedbackStorageKey);
    }
  }, []);

  useEffect(() => {
    if (previousEvents.current !== events && !hasUnsavedOrderChanges) {
      previousEvents.current = events;
      setOrderedEvents(events);
      setOriginalEvents(events);
    }
  }, [events, hasUnsavedOrderChanges]);

  useEffect(() => {
    if (!hasUnsavedOrderChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedOrderChanges]);

  useEffect(() => {
    if (!editing) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    formSection.current?.scrollIntoView?.({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    const focus = () => nameInput.current?.focus();
    const frame = window.requestAnimationFrame(focus);
    return () => window.cancelAnimationFrame(frame);
  }, [editing]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const input = { ...raw, monthOrder: Number(raw.monthOrder), dateConfirmed: form.get("dateConfirmed") === "on", isActive: form.get("isActive") === "on" };
    startTransition(async () => { const result = await saveCulturalEventAction(input, editing?.id); setFeedback(result); if (result.ok) { setEditing(null); setDateConfirmed(false); router.refresh(); } });
  }

  function run(action: () => Promise<EventActionResult>) {
    startTransition(async () => { const result = await action(); setFeedback(result); if (result.ok) router.refresh(); });
  }

  function confirmDiscardingOrder() {
    return !hasUnsavedOrderChanges || window.confirm("Tenés cambios de orden sin guardar. ¿Querés salir igual?");
  }

  function moveEvent(id: string, direction: "up" | "down") {
    setOrderedEvents((current) => {
      const target = current.find((event) => event.id === id);
      if (!target) return current;
      const next = reorderMonthEvents(current, id, direction);
      if (next === current) return current;
      setDirtyMonths((months) => new Set(months).add(target.monthOrder));
      setFeedback(null);
      return next;
    });
  }

  function discardOrderChanges() {
    setOrderedEvents(originalEvents);
    setDirtyMonths(new Set());
    setFeedback(null);
  }

  function saveOrderChanges() {
    const groups = [...dirtyMonths].sort((a, b) => a - b).map((month) => ({
      month,
      ids: orderedEvents
        .filter((event) => event.monthOrder === month)
        .toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map((event) => event.id),
    }));
    startSavingOrder(async () => {
      const result = await saveCulturalEventOrderAction(groups);
      showOrderFeedback(result);
      if (!result.ok) return;
      setOriginalEvents(orderedEvents);
      setDirtyMonths(new Set());
      router.refresh();
    });
  }

  const displayedEvents = [...orderedEvents].toSorted((a, b) =>
    a.monthOrder - b.monthOrder || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );

  return <main className="admin-shell">
    <header className="admin-header"><div><p className="eyebrow">Gestión privada</p><h1>Eventos culturales</h1><p>{adminEmail}</p><AdminNav active="eventos" onBeforeNavigate={confirmDiscardingOrder} /></div><AdminLogout onBeforeSignOut={confirmDiscardingOrder} /></header>
    {feedback ? <p className={`admin-feedback ${feedback.ok ? "is-ok" : "is-error"}`} role="status">{feedback.message}</p> : null}
    <section ref={formSection} className="admin-section" aria-labelledby="event-form-heading"><div className="admin-section-heading"><div>{editing ? <><p className="event-editing-label">Editando evento</p><h2 id="event-form-heading">{editing.name}</h2></> : <h2 id="event-form-heading">Nuevo evento</h2>}</div></div>
      <form key={formKey} className="event-admin-form" onSubmit={submit}>
        <label className="event-admin-wide"><span>Nombre</span><input ref={nameInput} name="name" required defaultValue={value.name} maxLength={160} /></label>
        <label><span>Categoría</span><input name="category" required defaultValue={value.category} maxLength={120} /></label>
        <label><span>Mes</span><select name="month" defaultValue={value.month} onChange={(e) => { const index = recurringMonths.findIndex((month) => month.name === e.target.value); e.currentTarget.form?.querySelector<HTMLInputElement>("[name=monthOrder]")?.setAttribute("value", String(index + 1)); }}>{recurringMonths.map((month) => <option key={month.name}>{month.name}</option>)}</select></label>
        <label className="event-admin-wide"><span>Descripción</span><textarea name="description" required defaultValue={value.description} maxLength={1200} /></label>
        <EventImageField key={formKey} initialImage={value.imagePath ?? null} />
        <label><span>Link externo</span><input name="externalUrl" type="url" defaultValue={value.externalUrl ?? ""} placeholder="https://" maxLength={500} /></label>
        <fieldset className="event-admin-fieldset event-admin-wide"><legend>Fecha</legend><label className="event-admin-check"><input name="dateConfirmed" type="checkbox" defaultChecked={value.dateConfirmed} onChange={(event) => setDateConfirmed(event.currentTarget.checked)} /> Fecha confirmada</label>
          {dateConfirmed ? <div className="event-admin-dates"><label><span>Desde</span><input name="startDate" type="date" defaultValue={value.startDate ?? ""} required /></label><label><span>Hasta</span><input name="endDate" type="date" defaultValue={value.endDate ?? ""} required /></label></div> : null}
        </fieldset>
        <label className="event-admin-check"><input name="isActive" type="checkbox" defaultChecked={value.isActive} /> Activo</label>
        <input name="monthOrder" type="hidden" defaultValue={value.monthOrder} />
        <div className="admin-actions"><button className="button button-dark" disabled={pending} type="submit">{editing ? "Guardar cambios" : "Crear evento"}</button>{editing ? <button className="button button-outline" type="button" onClick={() => { setEditing(null); setDateConfirmed(false); }}>Cancelar</button> : null}</div>
      </form>
    </section>
    <section className="admin-section"><div className="admin-section-heading"><h2>Eventos cargados</h2><span>{displayedEvents.length}</span></div><div className="event-admin-list">{displayedEvents.map((event) => {
      const monthEvents = displayedEvents.filter((candidate) => candidate.monthOrder === event.monthOrder);
      const monthIndex = monthEvents.findIndex((candidate) => candidate.id === event.id);
      return <article key={event.id}><div><strong>{event.name}</strong><span>{event.month} · <b>{event.isActive ? "✓ Activo" : "Inactivo"}</b> · {event.dateConfirmed ? "Fecha confirmada" : "Mes habitual"}</span></div><div className="admin-actions"><div className="event-order-controls" aria-label={`Reordenar ${event.name} dentro de ${event.month}`}><button className="event-order-button" aria-label={`Subir ${event.name}`} title="Subir" disabled={pending || savingOrder || monthIndex === 0} type="button" onClick={() => moveEvent(event.id, "up")}><ChevronUp aria-hidden="true" /></button><button className="event-order-button" aria-label={`Bajar ${event.name}`} title="Bajar" disabled={pending || savingOrder || monthIndex === monthEvents.length - 1} type="button" onClick={() => moveEvent(event.id, "down")}><ChevronDown aria-hidden="true" /></button></div><button className="admin-quiet-button" type="button" onClick={() => { setEditing(event); setDateConfirmed(event.dateConfirmed); }}>Editar</button><button className={event.isActive ? "admin-quiet-button is-danger" : "admin-quiet-button"} disabled={pending || savingOrder} type="button" onClick={() => window.confirm(event.isActive ? "¿Desactivar este evento?" : "¿Activar este evento?") && run(() => setCulturalEventActiveAction(event.id, !event.isActive))}>{event.isActive ? "Desactivar" : "Activar"}</button>{!event.isActive ? <button className="admin-quiet-button is-danger" disabled={pending || savingOrder} type="button" onClick={() => window.confirm("¿Eliminar definitivamente este evento?") && run(() => deleteCulturalEventAction(event.id))}>Eliminar</button> : null}</div></article>;
    })}</div></section>
    {hasUnsavedOrderChanges ? <div className="event-order-save" role="region" aria-label="Cambios de orden pendientes"><button className="admin-quiet-button event-order-discard" disabled={savingOrder} type="button" onClick={discardOrderChanges}>Descartar cambios</button><button className="button button-dark event-order-save-button" disabled={savingOrder} type="button" onClick={saveOrderChanges}>{savingOrder ? "Guardando..." : "Guardar orden"}</button></div> : null}
  </main>;
}
