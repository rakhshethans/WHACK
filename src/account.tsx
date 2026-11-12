import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import type { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { LoginForm, type LoginMode } from '@/components/ui/login-minimal';
import { supabase } from '@/lib/supabase';
import './account.css';

const accountUrl = new URL(location.pathname, location.origin);
const recoveryUrl = new URL(accountUrl);
recoveryUrl.searchParams.set('mode', 'reset');
const recovering = new URLSearchParams(location.search).get('mode') === 'reset';
const callbackError = [location.search, location.hash.slice(1)].some(value => {
  const params = new URLSearchParams(value);
  return params.has('error') || params.has('error_code');
});

function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [mode, setMode] = useState<LoginMode>('sign-in');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(callbackError ? 'That sign-in or email link could not be used. Please try again.' : '');

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY' || (event === 'INITIAL_SESSION' && recovering)) {
        setMode(nextSession ? 'reset' : 'forgot');
        if (!nextSession) setError('Open the latest reset link in the browser where you requested it.');
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  function switchMode(nextMode: LoginMode) {
    setError('');
    setNotice('');
    setMode(nextMode);
  }

  async function run(action: () => Promise<void>) {
    if (pending) return;
    setPending(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const auth = supabase.auth;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const email = String(fields.get('email') ?? '').trim();
    const password = String(fields.get('password') ?? '');
    void run(async () => {
      if (mode === 'forgot') {
        const { error } = await auth.resetPasswordForEmail(email, { redirectTo: recoveryUrl.href });
        if (error) throw error;
        setNotice('If an account exists for that email, check your inbox for a reset link.');
      } else if (mode === 'reset') {
        const { error } = await auth.updateUser({ password });
        if (error) throw error;
        history.replaceState(null, '', accountUrl.pathname);
        switchMode('sign-in');
        setNotice('Your password was updated.');
      } else if (mode === 'sign-up') {
        const { data, error } = await auth.signUp({ email, password, options: { emailRedirectTo: accountUrl.href } });
        if (error) throw error;
        if (!data.session) setNotice('Check your inbox to confirm your email and finish creating your account.');
      } else {
        const { error } = await auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      form.reset();
    });
  }

  function googleSignIn() {
    if (!supabase) return;
    const auth = supabase.auth;
    void run(async () => {
      const { error } = await auth.signInWithOAuth({ provider: 'google', options: { redirectTo: accountUrl.href } });
      if (error) throw error;
    });
  }

  function signOut() {
    if (!supabase) return;
    const auth = supabase.auth;
    void run(async () => {
      const { error } = await auth.signOut({ scope: 'local' });
      if (error) throw error;
      history.replaceState(null, '', accountUrl.pathname);
      switchMode('sign-in');
      setNotice('Signed out on this device.');
    });
  }

  return (
    <section className="account-card" aria-labelledby="account-title">
      {loading ? (
        <h1 className="account-title" id="account-title" role="status">Checking your session…</h1>
      ) : session && mode !== 'reset' ? (
        <div className="grid gap-4">
          <h1 className="account-title" id="account-title">Your account</h1>
          <p className="break-all text-sm text-muted-foreground">{session.user.email || 'Signed in'}</p>
          <p className="text-sm text-muted-foreground">Your islands and progress are saved in this browser.</p>
          <Button size="lg" variant="outline" type="button" onClick={signOut} disabled={pending}>Sign out</Button>
        </div>
      ) : (
        <LoginForm mode={mode} onModeChange={switchMode} onGoogle={googleSignIn} onSubmit={submit}
          disabled={!supabase || pending} pending={pending} />
      )}
      {!supabase && <p className="account-notice" role="status">Sign-in is unavailable on this preview. You can still use WorldHopper as a guest.</p>}
      {notice && <p className="account-notice" role="status">{notice}</p>}
      {error && <p className="account-notice account-error" role="alert">{error}</p>}
      <a href="./" className="account-back">{session ? 'Back to My world' : 'Continue as guest'}</a>
    </section>
  );
}

const mount = document.querySelector('#account-app');
if (mount) createRoot(mount).render(<AccountPage />);
