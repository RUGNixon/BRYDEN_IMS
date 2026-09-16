import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected app routes requiring active authentication
const PROTECTED_ROUTES = [
    "/dashboard",
    "/products",
    "/sales",
    "/purchase",
    "/expenses",
    "/orders",
    "/taxes",
    "/analytics",
    "/notes",
    "/calendar",
    "/settings",
];

// Public authentication pages
const AUTH_PAGES = ["/login", "/signup", "/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("bryden_auth_session")?.value;
    const hasSession = !!sessionCookie && sessionCookie.length >= 32;

    // 1. If user is logged in and trying to view /login or /signup, redirect to /dashboard
    const isAuthPage = AUTH_PAGES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
    if (isAuthPage && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is accessing protected routes without session, redirect to /login
    const isProtectedRoute = PROTECTED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtectedRoute && !hasSession) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Protect sensitive API routes (except /api/auth and public endpoints)
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/") && !pathname.startsWith("/api/settings")) {
        // If an API request comes without session cookie, block with 401
        if (!hasSession) {
            return NextResponse.json(
                { error: "Authentication required to access this resource." },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
