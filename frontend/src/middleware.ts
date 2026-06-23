import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
 
const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Protect admin routes
  if (path.match(/^\/(en|ar)\/admin/) || path.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      const locale = path.split('/')[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return intlMiddleware(req);
}
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|en)/:path*']
};
