import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  routes,
  type LoginInput,
} from '@platform/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, LockKeyhole } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { z } from 'zod';
import { BrandMark } from '@/components/brand-mark';
import { TextField } from '@/components/forms/fields';
import { FormError } from '@/components/forms/status';
import { Button } from '@/components/ui/button';
import { useMeta } from '@/hooks/use-meta';
import { api } from '@/lib/api';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  organisationId?: string;
};
type SessionData = { user: SessionUser | null };
const AuthContext = createContext<{
  user: SessionUser | null;
  isLoading: boolean;
  refresh: () => Promise<unknown>;
}>({ user: null, isLoading: true, refresh: async () => undefined });

export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const current = await api<SessionData>('/auth/session');
      if (current.user) return current;
      try {
        await api('/auth/refresh', { method: 'POST' });
        return await api<SessionData>('/auth/session');
      } catch {
        return current;
      }
    },
    retry: false,
    staleTime: 30_000,
  });
  return (
    <AuthContext.Provider
      value={{ user: query.data?.user ?? null, isLoading: query.isLoading, refresh: query.refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <div
        className="bg-ink grid min-h-screen place-items-center text-sm text-slate-400"
        role="status"
      >
        Checking secure session…
      </div>
    );
  if (!user) return <Navigate to={routes.login} replace state={{ from: location.pathname }} />;
  if (
    admin &&
    !user.roles.some((role) =>
      [
        'super_admin',
        'administrator',
        'security_analyst',
        'content_editor',
        'sales_support',
      ].includes(role),
    )
  )
    return <Navigate to={routes.portal} replace />;
  return children;
}

export function LoginPage() {
  useMeta('Client portal sign in', 'Sign in to the secure client portal.', true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: LoginInput) =>
      api<{ user: SessionUser }>('/auth/login', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: async (data) => {
      queryClient.setQueryData(['session'], { user: data.user });
      const state = location.state as { from?: string } | null;
      navigate(
        state?.from ?? (data.user.roles.includes('client_user') ? routes.portal : routes.admin),
        { replace: true },
      );
    },
  });
  return (
    <AuthShell>
      <div className="mb-8">
        <LockKeyhole className="h-7 w-7 text-cyan-300" />
        <h1 className="mt-5 text-3xl font-semibold">Sign in to the portal</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Accounts are created by an authorised administrator. Self-registration is disabled.
        </p>
      </div>
      <form
        className="space-y-5"
        noValidate
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <TextField
          required
          label="Email"
          type="email"
          autoComplete="email"
          registration={form.register('email')}
          error={form.formState.errors.email}
        />
        <TextField
          required
          label="Password"
          type="password"
          autoComplete="current-password"
          registration={form.register('password')}
          error={form.formState.errors.password}
        />
        {mutation.isError && <FormError message={mutation.error.message} />}
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
        <div className="text-center">
          <Link
            className="inline-flex min-h-11 items-center text-sm text-cyan-300 hover:underline"
            to="/portal/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

type ForgotInput = z.infer<typeof forgotPasswordSchema>;
export function ForgotPasswordPage() {
  useMeta('Forgot password', 'Request a secure portal password reset.', true);
  const form = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ForgotInput) =>
      api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
  });
  return (
    <AuthShell>
      {mutation.data ? (
        <div role="status">
          <KeyRound className="h-8 w-8 text-cyan-300" />
          <h1 className="mt-5 text-3xl font-semibold">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{mutation.data.message}</p>
          <Button className="mt-7" asChild variant="secondary">
            <Link to={routes.login}>
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            If an eligible account exists, we will send a time-limited reset link. This response
            does not reveal account status.
          </p>
          <form
            className="mt-8 space-y-5"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <TextField
              required
              label="Email"
              type="email"
              autoComplete="email"
              registration={form.register('email')}
              error={form.formState.errors.email}
            />
            {mutation.isError && <FormError message={mutation.error.message} />}
            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Requesting…' : 'Request reset link'}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}

type ResetInput = z.infer<typeof resetPasswordSchema>;
export function ResetPasswordPage() {
  useMeta('Reset password', 'Set a new secure portal password.', true);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const form = useForm<ResetInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ResetInput) =>
      api<{ reset: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
  });
  return (
    <AuthShell>
      {mutation.data ? (
        <div role="status">
          <KeyRound className="h-8 w-8 text-emerald-300" />
          <h1 className="mt-5 text-3xl font-semibold">Password updated</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            All existing sessions were revoked. Sign in again with your new password.
          </p>
          <Button className="mt-7" asChild>
            <Link to={routes.login}>Continue to sign in</Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Choose a new password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Use at least 14 characters. A password manager-generated passphrase is recommended.
          </p>
          <form
            className="mt-8 space-y-5"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <input type="hidden" {...form.register('token')} />
            <TextField
              required
              label="New password"
              type="password"
              autoComplete="new-password"
              registration={form.register('password')}
              error={form.formState.errors.password}
            />
            {form.formState.errors.token && (
              <FormError message="The reset token is missing or invalid." />
            )}
            {mutation.isError && <FormError message={mutation.error.message} />}
            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className="bg-ink relative grid min-h-screen place-items-center overflow-hidden px-5 py-12"
    >
      <div className="hero-grid bg-grid absolute inset-0 opacity-50" />
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/[.08] blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <BrandMark />
        </div>
        <div className="surface p-7 sm:p-9">{children}</div>
        <Link
          to={routes.home}
          className="mx-auto mt-6 flex min-h-11 w-fit items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to public site
        </Link>
      </div>
    </main>
  );
}
