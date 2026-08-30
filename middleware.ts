import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_AUTH_COOKIE } from "@/lib/types";
import { isAdminEmail } from "@/lib/utils";

const PROTECTED = ["/dashboard", "/admin"];
const AUTH_PAGES = ["/login", "/signup"];

function decodeDemo(value: string | undefined): { email: string; role: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as {
      email?: string;
      role?: string;
    };
    if (!parsed.email) return null;
    return { email: parsed.email, role: parsed.role ?? "student" };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  const demo = decodeDemo(request.cookies.get(DEMO_AUTH_COOKIE)?.value);
  const hasSession = Boolean(demo);

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = demo?.role === "admin" || isAdminEmail(demo?.email)
      ? "/admin"
      : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && hasSession) {
    const admin = demo?.role === "admin" || isAdminEmail(demo?.email);
    if (!admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
