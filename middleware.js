import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req) {
  const token = req.cookies.get('token');
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;


  if (!token && pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (token && pathname === '/login') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (token) {
    const decoded = jwtDecode(token.value);
    const role = decoded.role;

    const staffRestrictedRoutes = ['/dashboard/history', '/dashboard/pos', '/dashboard/users', '/dashboard/items', '/dashboard/laporan'];
    const kasirRestrictedRoutes = ['/dashboard/users', '/dashboard/items', '/dashboard/penerimaan', '/dashboard/laporan'];
    const adminRestrictedRoutes = ['/dashboard/pos'];

    if (role === 'STAFF' && staffRestrictedRoutes.some((route) => pathname.startsWith(route))) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (role === 'KASIR' && kasirRestrictedRoutes.some((route) => pathname.startsWith(route))) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    if (role == 'ADMIN' && adminRestrictedRoutes.some((route) => pathname.startsWith(route))) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
