import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // NextAuth handles the callback automatically via [...nextauth]/route.ts
  // This route is just a fallback redirect
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
