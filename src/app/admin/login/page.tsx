import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signIn } from "@/auth";
import { isAllowedAdminProfile } from "@/lib/domain/admin-auth";
import { adminReturnTo } from "@/lib/domain/admin-return-to";

export const metadata = { title: "Administración | El Vagón" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const returnTo = adminReturnTo(callbackUrl);
  const session = await auth();
  if (isAllowedAdminProfile({
    email: session?.user?.email,
    email_verified: Boolean(session?.user?.email),
  })) {
    redirect(returnTo);
  }

  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <p className="eyebrow">El Vagón</p>
        <h1>Administración</h1>
        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: returnTo });
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
