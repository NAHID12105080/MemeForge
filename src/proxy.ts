import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/collections",
  "/favorites",
  "/settings",
  "/templates",
  "/explore",
  "/trending",
  "/search",
  "/ai-generator",
  "/gif-generator",
  "/profile",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/collections/:path*",
    "/favorites/:path*",
    "/settings/:path*",
    "/templates/:path*",
    "/explore/:path*",
    "/trending/:path*",
    "/search/:path*",
    "/ai-generator/:path*",
    "/gif-generator/:path*",
    "/profile/:path*",
  ],
};
