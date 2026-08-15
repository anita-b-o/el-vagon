# El Vagón

Sitio boutique de El Vagón con consulta de disponibilidad, solicitudes de reserva por WhatsApp y panel privado para la encargada.

## Arquitectura de reservas

- La disponibilidad pública combina los feeds iCal privados de Airbnb y Booking con los bloqueos activos de PostgreSQL.
- Las fechas se modelan como fechas civiles de Argentina e intervalos `[ingreso, salida)`: la salida no ocupa una noche y puede coincidir con el ingreso siguiente.
- Una consulta web se guarda como `PENDING` y no bloquea fechas. El navegador abre `wa.me` sólo después de que el servidor vuelve a validar e inserta la solicitud.
- Al confirmar, una transacción crea un bloqueo `DIRECT` y pasa la solicitud a `CONFIRMED`. Los bloqueos `MANUAL` se administran por separado.
- PostgreSQL usa un advisory lock en las acciones críticas y una exclusión GiST como defensa final contra solapamientos concurrentes.
- `/api/calendar/el-vagon.ics?token=...` exporta únicamente bloques activos y nunca incluye datos personales.

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run dev
```

Controles:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Las pruebas de constraints PostgreSQL se habilitan al definir `TEST_DATABASE_URL` contra una base aislada ya migrada. Nunca deben apuntar a Production.

## Configuración

Todas las variables están documentadas en `.env.example`. Las URLs `AIRBNB_ICAL_URL`, `BOOKING_ICAL_URL`, `DATABASE_URL` y todos los secretos son exclusivamente server-side.

Para Google OAuth, crear una aplicación web y registrar callbacks exactos:

```text
https://<preview-exacto>/api/auth/callback/google
https://el-vagon.vercel.app/api/auth/callback/google
```

`ADMIN_GOOGLE_EMAILS` contiene la lista de cuentas verificadas autorizadas, separadas por comas. No existe contraseña local. Durante la migración también se admite `ADMIN_GOOGLE_EMAIL` para no interrumpir el acceso existente.

La propietaria obtiene los feeds privados en:

- Airbnb: Calendario → anuncio → Disponibilidad → Conectar calendarios → Exportar calendario.
- Booking: Extranet → Tarifas y disponibilidad → Calendario → Sincronizar calendarios / Importar-exportar.

Después de configurar `ICAL_EXPORT_TOKEN`, el feed propio productivo es:

```text
https://el-vagon.vercel.app/api/calendar/el-vagon.ics?token=<ICAL_EXPORT_TOKEN>
```

Puede importarse en Airbnb y Booking. La propagación iCal depende de los intervalos de actualización de cada plataforma y no es instantánea.

## Migraciones y retención

Las migraciones versionadas viven en `drizzle/` y se aplican con `npm run db:migrate`. El script registra cada archivo en `el_vagon_schema_migrations`.

Vercel ejecuta diariamente `/api/cron/anonymize`. A los 12 meses elimina nombre y consulta; las pendientes vencidas pasan primero a `REJECTED`. El endpoint requiere `CRON_SECRET`.
