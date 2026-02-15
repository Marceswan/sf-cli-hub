import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/submit", "/profile"];
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";
  const userStatus = req.auth?.user?.status;

  // Block suspended/banned users from all pages (redirect to login)
  if (isLoggedIn && userStatus && userStatus !== "active") {
    // Allow access to login page and API routes to prevent redirect loops
    if (!pathname.startsWith("/login") && !pathname.startsWith("/api")) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "account_suspended");
      return NextResponse.redirect(url);
    }
  }

  // Protected routes: require login
  const isEditRoute = /^\/resources\/[^/]+\/edit$/.test(pathname);
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    isEditRoute
  ) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Admin routes: require admin role
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|email-logo.png).*)",
  ],
};
