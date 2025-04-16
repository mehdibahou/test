import { NextResponse } from 'next/server';

export async function middleware(req) {
  const accessToken = req.cookies.get('accessToken')?.value;
  console.log(accessToken, "accessTokenffpqpqpqpqpqpqpqppqpqpqqpqpqpqpqppqpqpqpqpqp");
  if(!accessToken && req.nextUrl.pathname === '/login'){
    return NextResponse.next();
  }
  if(!accessToken && req.nextUrl.pathname === '/signup'){
    return NextResponse.next();
  }
  if(!accessToken && req.nextUrl.pathname === '/'){
    return NextResponse.next();
  }


  if (!accessToken) {
    // If no access token is found, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  

  // Validate the token by calling your API

  const isValid = await fetch(
    `${req.nextUrl.origin}/api/auth/validate?accessToken=${accessToken}`
  ).then(res => res.ok);

  console.log(isValid, "isValid");

  if (!isValid) {
    // If the token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
  console.log(req.nextUrl.pathname, "req.url.pathname");
  if(isValid && req.nextUrl.pathname === '/login'){
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if(isValid && req.nextUrl.pathname === '/signup'){
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if(isValid && req.nextUrl.pathname === '/'){
    return NextResponse.redirect(new URL('/dashboard', req.url));

  }

  // If the token is valid, allow access to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/generate/:path*','/caisse/:path*','/test/:path*','/login','/signup'], // Apply middleware to all dashboard routes
};
