import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signIn } from "@/auth";
import { isAllowedAdminProfile } from "@/lib/domain/admin-auth";

export const metadata = { title: "Acceso privado | El Vagón" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (isAllowedAdminProfile({
    email: session?.user?.email,
    email_verified: Boolean(session?.user?.email),
  })) {
    redirect("/admin/reservas");
  }

  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <p className="eyebrow">El Vagón</p>
        <h1>Acceso de la encargada</h1>
        <p>Ingresá con la cuenta de Google autorizada para gestionar solicitudes y fechas.</p>
        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/admin/reservas" });
        }}>
          <button className="button button-dark button-large" type="submit">
            Continuar con Google
          </button>
        </form>
        <Link className="text-link" href="/">Volver al sitio</Link>
      </section>
    </main>
  );
}
