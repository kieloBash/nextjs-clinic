import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
    publicRoutes,
    authRoutes,
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    //ALWAYS ALLOWED
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

    const isPublicRoute = publicRoutes.some((route) => {
        return route === "/"
            ? nextUrl.pathname === route
            : nextUrl.pathname.startsWith(route);
    });

    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) return;

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return;
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(
            new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    return;
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"], //for targeting all urls
};
