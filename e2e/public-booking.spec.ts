import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  if (process.env.VERCEL_SHARE_URL) {
    await page.goto(process.env.VERCEL_SHARE_URL);
  }
  await page.route("**/api/availability?**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ unavailable: [] }),
  }));
});

test("shows the boutique availability experience", async ({ page }, testInfo) => {
  await page.goto("/#reservas");
  await expect(page.getByRole("heading", { name: "Elegí tus fechas" })).toBeVisible();
  await expect(page.getByText("Estadía mínima: 2 noches")).toBeVisible();
  await expect(page.getByText(/Esta consulta no constituye una reserva/)).toBeVisible();
  const visibleMonths = page.locator(".rdp-month:visible");
  await expect(visibleMonths).toHaveCount(testInfo.project.name === "mobile" ? 1 : 2);
});

test("creates a pending request before handing off to WhatsApp", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;
  await page.route("**/api/reservation-requests", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        requestId: "0db4505f-e864-4bec-8183-b1372bf221d5",
        status: "PENDING",
        whatsappUrl: "https://wa.me/5492241572170?text=consulta-e2e",
      }),
    });
  });
  await page.route("https://wa.me/**", (route) => route.abort("blockedbyclient"));

  await page.goto("/#reservas");
  await page.getByRole("button", { name: /15 de agosto de 2026/i }).click();
  await page.getByRole("button", { name: /17 de agosto de 2026/i }).click();
  await page.getByLabel("Nombre completo").fill("Ana Pérez");
  await page.getByLabel("Cantidad de personas").selectOption("2");
  await page.getByRole("textbox", { name: "Consulta Opcional" }).fill("Llegamos después de las 18 hs");
  await page.getByRole("button", { name: /Consultar disponibilidad por WhatsApp/i }).click();

  await expect.poll(() => submitted).not.toBeNull();
  expect(submitted).toMatchObject({
    fullName: "Ana Pérez",
    guestCount: "2",
    checkIn: "2026-08-15",
    checkOut: "2026-08-17",
    question: "Llegamos después de las 18 hs",
  });
});

test("keeps the admin panel private and the calendar export token-protected", async ({ page }) => {
  const response = await page.goto("/admin/reservas");
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
  await expect(page.getByText(/Ingresá con la cuenta de Google autorizada/)).toHaveCount(0);

  const ics = await page.request.get("/api/calendar/el-vagon.ics?token=incorrecto");
  expect(ics.status()).toBe(404);
});

test("opens the private admin route from the footer", async ({ page }) => {
  await page.goto("/");

  const adminLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Administración", exact: true });

  await expect(adminLink).toBeVisible();
  await expect(adminLink).toHaveAttribute("href", "/admin/reservas");
  await adminLink.focus();
  await expect(adminLink).toBeFocused();
  await adminLink.click();

  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
});

test("shows the configured contact links", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", {
    name: /elvagongbelgrano\.2024@gmail\.com/i,
  })).toHaveAttribute("href", "mailto:elvagongbelgrano.2024@gmail.com");
  await expect(footer.getByRole("link", { name: /2241 572170/i })).toHaveAttribute(
    "href",
    "https://wa.me/5492241572170",
  );
  await expect(footer.getByRole("link", { name: /Instagram/i })).toBeVisible();
});
