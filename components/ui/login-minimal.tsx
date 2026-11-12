'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export type LoginMode = 'sign-in' | 'sign-up' | 'forgot' | 'reset';

const copy = {
  'sign-in': ['Welcome back', 'Sign in to your WorldHopper account.', 'Sign in'],
  'sign-up': ['Create an account', 'Set up your WorldHopper account.', 'Create account'],
  forgot: ['Forgot your password?', 'Enter your email to receive a password reset link.', 'Send reset link'],
  reset: ['Choose a new password', 'Enter a new password for your account.', 'Update password'],
} as const;

interface LoginFormProps extends React.ComponentPropsWithoutRef<'form'> {
  mode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
  onGoogle: () => void;
  disabled?: boolean;
  pending?: boolean;
}

export function LoginForm({
  className, mode, onModeChange, onGoogle, disabled, pending, ...props
}: LoginFormProps) {
  const reducedMotion = useReducedMotion();
  const [title, description, submit] = copy[mode];
  const showGoogle = mode === 'sign-in' || mode === 'sign-up';
  const newPassword = mode === 'sign-up' || mode === 'reset';
  return (
    <form className={cn('flex flex-col gap-6', className)} aria-busy={pending} {...props}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeOut' }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <h1 id="account-title" className="account-title">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {showGoogle && <>
          <Button variant="outline" type="button" size="lg" className="w-full" onClick={onGoogle} disabled={disabled}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 size-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>
          <div className="account-divider text-xs text-muted-foreground">or</div>
        </>}

        <div className="grid gap-3">
          {mode !== 'reset' && (
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="m@example.com" required disabled={disabled} />
            </div>
          )}
          {mode !== 'forgot' && (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                {mode === 'sign-in' && (
                  <button type="button" className="account-text-button" onClick={() => onModeChange('forgot')} disabled={pending}>
                    Forgot password?
                  </button>
                )}
              </div>
              <Input key={mode} id="password" name="password" type="password" minLength={newPassword ? 8 : undefined}
                autoComplete={newPassword ? 'new-password' : 'current-password'}
                placeholder={newPassword ? 'At least 8 characters' : 'Enter your password'} required disabled={disabled} />
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="account-primary w-full font-semibold" disabled={disabled}>
          {pending ? 'Please wait…' : submit}
        </Button>

        {mode !== 'reset' && (
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'sign-in' && "Don't have an account? "}
            <button type="button" className="account-text-button" disabled={pending}
              onClick={() => onModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
              {mode === 'sign-in' ? 'Sign up' : 'Back to sign in'}
            </button>
          </p>
        )}
      </motion.div>
    </form>
  );
}

export default LoginForm;
