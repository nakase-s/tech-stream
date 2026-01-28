import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/:path*'],
};

export function middleware(req: NextRequest) {
    // Skip Basic Auth in development mode
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.next();
    }

    // Skip Basic Auth for public assets (images, favicon, etc.)
    // and API routes if they need to be public (though usually they should be protected too)
    const publicPaths = ['/_next', '/api/og', '/favicon.ico', '/icon.png', '/manifest.webmanifest'];
    if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        const validUser = process.env.BASIC_AUTH_USER;
        const validPass = process.env.BASIC_AUTH_PASSWORD;

        if (user === validUser && pwd === validPass) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Authentication required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}
