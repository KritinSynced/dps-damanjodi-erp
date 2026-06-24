import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = "dps_damanjodi_erp_secret_key_2026_xyz"; // Must match backend JWT_SECRET

// Custom HS256 JWT Verify for Next.js Edge Middleware
async function verifyJwt(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const base64UrlToUint8Array = (base64url: string) => {
      let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const raw = atob(base64);
      const val = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        val[i] = raw.charCodeAt(i);
      }
      return val;
    };
    
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToUint8Array(signatureB64);
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signature,
      data
    );
    
    if (!isValid) return null;
    
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith('/portal') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/student') || 
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/clerk') ||
    pathname.startsWith('/principal') ||
    pathname.startsWith('/peon') ||
    pathname.startsWith('/security_guard');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get('dps_token')?.value;

  if (!token) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }

  const payload = await verifyJwt(token, JWT_SECRET);
  if (!payload) {
    const signInUrl = new URL('/sign-in', req.url);
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete('dps_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.[^?]*$).*)',
  ],
};