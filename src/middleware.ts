import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/submit", "/profile"];
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

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
  matcher: ["/submit/:path*", "/profile/:path*", "/admin/:path*", "/resources/:path*/edit"],
};
