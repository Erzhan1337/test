import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }


  const refreshToken = request.cookies.get("refreshToken");
  const isAuthenticated = !!refreshToken;
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));


  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }


  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
