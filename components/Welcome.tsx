'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import Logo from './Logo';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

const CoolCatIllustration = () => (
  <svg width="150" height="150" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="cool-cat-svg">
    {/* 4-point sparkle next to coffee cup */}
    <path d="M128 62L130 52L132 62L142 64L132 66L130 76L128 66L118 64Z" fill="currentColor" opacity="0.9" />

    {/* Left Ear */}
    <path d="M46 48L34 22L58 36" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M42 38L38 27L50 35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

    {/* Right Ear */}
    <path d="M94 36L118 22L106 48" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M102 35L114 27L110 38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

    {/* Head Outline */}
    <path d="M46 48C52 42 98 42 106 48C118 56 120 74 116 88C111 102 96 108 76 108C56 108 41 102 36 88C32 74 34 56 46 48Z" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Dark Sunglasses */}
    <path d="M40 64H112" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M44 64L47 80C48 84 54 87 60 86L70 82C72 81 74 78 74 75V64H44Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    <path d="M78 64V75C78 78 80 81 82 82L92 86C98 87 104 84 105 80L108 64H78Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />

    {/* Nose & Smile */}
    <path d="M74 91L76 93L78 91" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 96C73 99 76 99 76 96C76 99 79 99 82 96" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

    {/* Whiskers */}
    <path d="M22 78L36 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 87L35 86" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M116 80L130 78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M117 86L132 87" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

    {/* Body / Torso */}
    <path d="M52 108C48 118 47 132 47 152" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M100 108C104 118 105 132 105 152" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />

    {/* Tail curving on the left */}
    <path d="M47 142C38 140 32 134 30 124C28 114 34 106 40 108C42 109 43 112 41 114C37 118 36 124 47 128" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Left Arm relaxing */}
    <path d="M48 118C54 130 62 138 72 144" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />

    {/* Right Arm holding coffee cup */}
    <path d="M102 116C98 126 92 132 86 134" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M96 118L104 108C106 105 110 105 112 108L116 114" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

    {/* Takeaway Coffee Cup with lid */}
    <path d="M98 106H120L116 134H102L98 106Z" fill="#FAF5EE" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M96 106H122" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M104 100H114V106H104V100Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100 116H118" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M101 124H117" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

    {/* Relaxed Lounging Legs / Knees */}
    <path d="M72 144C82 148 94 150 112 150" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
  </svg>
);

export default function Welcome() {
  const { me, signIn } = useStore();
  const [view, setView] = useState<'splash' | 'auth'>('splash');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(me.name === 'You' ? '' : me.name);
  const [user, setUser] = useState(me.user === 'you' ? '' : me.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'err' | 'info' } | null>(null);

  const supabase = createClient();

  async function handleGoogleAuth() {
    if (!supabase) {
      setMessage({
        text: 'Add your Supabase URL & Anon Key to .env.local to enable Google OAuth.',
        type: 'err',
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Google authentication failed',
        type: 'err',
      });
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage({ text: 'Please fill in both email and password.', type: 'err' });
      return;
    }

    if (!supabase) {
      // Local fallback if user hasn't added Supabase credentials yet
      const u = user.toLowerCase().replace(/[^a-z0-9._]/g, '') || 'you';
      signIn({ ...me, name: name.trim() || 'You', user: u, email });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const u = user.toLowerCase().replace(/[^a-z0-9._]/g, '') || email.split('@')[0];
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim() || 'You',
              username: u,
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          signIn({
            id: data.user?.id,
            name: name.trim() || 'You',
            user: u,
            bio: '',
            email: data.user?.email,
          });
        } else {
          setMessage({
            text: 'Account created! Please check your email to confirm your account.',
            type: 'info',
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        signIn({
          id: data.user.id,
          name: profile?.display_name || data.user.user_metadata?.full_name || 'You',
          user: profile?.username || data.user.email?.split('@')[0] || 'you',
          bio: profile?.bio || '',
          avatar: profile?.avatar_url || null,
          email: data.user.email,
        });
      }
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Authentication failed',
        type: 'err',
      });
    } finally {
      setLoading(false);
    }
  }

  function continueAsGuest() {
    const u = user.toLowerCase().replace(/[^a-z0-9._]/g, '') || 'you';
    signIn({ ...me, name: name.trim() || 'You', user: u });
  }

  return (
    <section className="welcome" aria-label="Welcome">
      {view === 'splash' ? (
        <div className="welcome-splash">
          {/* Poster Top Bar */}
          <div className="poster-top-bar">
            <Logo height={34} color="#052BA8" />
            <span className="poster-kicker">Quotes Connect People.</span>
          </div>

          {/* Main Title & Tagline matching the brand poster */}
          <div className="splash-head">
            <h1 className="splash-title">
              SMALL<br />
              WORDS.<br />
              BIG VIBES.
            </h1>
            <p className="splash-subhead">
              Discover, create and share quotes that feel like you.
            </p>
          </div>

          {/* Center Cool Cat Illustration */}
          <div className="splash-illustration">
            <CoolCatIllustration />
          </div>

          {/* Actions */}
          <div className="splash-actions">
            <button
              type="button"
              className="splash-pill solid"
              onClick={() => { setView('auth'); setMode('signup'); }}
            >
              Get Started →
            </button>
            <button
              type="button"
              className="splash-pill outline"
              onClick={() => { setView('auth'); setMode('signin'); }}
            >
              Sign In
            </button>
          </div>

          {/* Guest link */}
          <button
            type="button"
            className="splash-guest"
            onClick={continueAsGuest}
          >
            Explore as Guest →
          </button>
        </div>
      ) : (
        <div className="welcome-card">
          <div className="auth-top-bar">
            <button
              type="button"
              className="back-btn"
              onClick={() => setView('splash')}
              aria-label="Back to splash"
            >
              ← Back
            </button>
            <span className="poster-kicker">Aesthetic Quotes Community</span>
          </div>

          <div className="auth-brand">
            <h2 className="auth-title">GOOD PEOPLE SHARE GOOD QUOTES.</h2>
            <p className="auth-sub">
              {mode === 'signin' ? 'Welcome back! Sign in to continue.' : 'Join the community on Sans.'}
            </p>
          </div>

          {message && (
            <div className={`auth-msg ${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            className="oauth-btn"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>or with email</span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="auth-form">
            {mode === 'signup' && (
              <>
                <label>
                  <span>Your name</span>
                  <input
                    value={name}
                    maxLength={30}
                    placeholder="Sunny Days"
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  <span>Username</span>
                  <input
                    value={user}
                    maxLength={20}
                    placeholder="sunny.days"
                    required
                    onChange={(e) => setUser(e.target.value)}
                  />
                </label>
              </>
            )}

            <label>
              <span>Email address</span>
              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                minLength={6}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="splash-pill solid w-full"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in →' : 'Start Now →'}
            </button>
          </form>

          <div className="auth-toggle">
            {mode === 'signin' ? (
              <>
                <span>New to Sans?</span>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setMessage(null); }}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setMessage(null); }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="splash-guest"
            onClick={continueAsGuest}
            style={{ marginTop: 4 }}
          >
            Skip for now →
          </button>
        </div>
      )}
    </section>
  );
}
