import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy de Next.js 16: protege todas las rutas excepto /login.
 * También refresca el token de sesión de Supabase en cada petición.
 */
export async function proxy(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca la sesión (importante para tokens que están por expirar).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Redirige a /login si no hay sesión activa
  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirige al dashboard si ya está autenticado y visita /login
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
