import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error') || searchParams.get('error_description');

  // Determine base URL, taking into account reverse proxy headers (Vercel)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseUrl = (!isLocalEnv && forwardedHost)
    ? `${forwardedProto}://${forwardedHost}`
    : origin;

  const targetPath = next.startsWith('/') ? next : `/${next}`;

  if (errorParam) {
    console.warn('OAuth provider returned error:', errorParam);
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(errorParam)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${baseUrl}${targetPath}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
                response.cookies.set(name, value, options);
              });
            } catch (err) {
              console.warn('Failed setting callback cookies:', err);
            }
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return response;
      }
      console.error('exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(error.message)}`);
    }
  }

  // Fallback to home
  return NextResponse.redirect(`${baseUrl}${targetPath}`);
}
