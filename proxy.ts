import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (pathname === "/login")
    return signedIn
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  if (signedIn) return NextResponse.next();
  // fetch callers need a status, not the login page (D-043).
  if (pathname.startsWith("/api/"))
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|card-back/).*)"],
};
