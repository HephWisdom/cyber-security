import { zodResolver } from '@hookform/resolvers/zod';
import { routes, supportTicketSchema, type SupportTicketInput } from '@platform/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Bell,
  Building2,
  ClipboardCheck,
  FileLock2,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Smartphone,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/brand-mark';
import { SelectField, TextAreaField, TextField } from '@/components/forms/fields';
import { FormError, SubmissionSuccess } from '@/components/forms/status';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMeta } from '@/hooks/use-meta';
import { api } from '@/lib/api';
import { cn, createIdempotencyKey, formatDate } from '@/lib/utils';
import { useAuth } from '../auth/auth';

const portalNav = [
  ['Overview', '/portal', LayoutDashboard],
  ['Engagements', '/portal/engagements', ClipboardCheck],
  ['Assessments', '/portal/assessments', ListChecks],
  ['Reports', '/portal/reports', FileLock2],
  ['Support tickets', '/portal/tickets', LifeBuoy],
  ['Notifications', '/portal/notifications', Bell],
  ['Organisation settings', '/portal/settings', Building2],
  ['Sessions & devices', '/portal/sessions', Smartphone],
  ['Audit history', '/portal/audit', History],
] as const;

export function PortalLayout({ admin = false }: { admin?: boolean }) {
  const [mobile, setMobile] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      queryClient.clear();
      navigate(routes.login);
    },
  });
  const nav = admin ? adminNav : portalNav;
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[276px] border-r border-white/10 bg-[#081321] p-5 transition-transform lg:translate-x-0',
          mobile ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <BrandMark compact />
          <Button
            className="px-3 lg:hidden"
            variant="ghost"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>
        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">
          {admin ? 'Administration' : 'Client workspace'}
        </p>
        <nav className="space-y-1" aria-label={admin ? 'Administration' : 'Client portal'}>
          {nav.map(([label, to, Icon]) => (
            <NavLink
              end={to === (admin ? '/admin' : '/portal')}
              onClick={() => setMobile(false)}
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-400 hover:bg-white/[.05] hover:text-white',
                  isActive && 'bg-cyan-300/[.08] text-cyan-300',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 border-t border-white/10 pt-5">
          <p className="truncate px-3 text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate px-3 text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={() => logout.mutate()}
            className="mt-3 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-400 hover:bg-white/[.05] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobile(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <div className="lg:pl-[276px]">
        <header className="bg-ink/90 sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 px-5 backdrop-blur sm:px-8">
          <Button
            className="px-3 lg:hidden"
            variant="ghost"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <span className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
            Secure workspace
          </span>
          <span className="flex items-center gap-2 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Session active
          </span>
        </header>
        <main id="main-content" className="p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type PortalSummary = {
  sampleData: boolean;
  organisation: { name: string };
  counts: { openEngagements: number; openFindings: number; reports: number; tickets: number };
  severity: Array<{ name: string; value: number; color: string }>;
  recent: Array<{ id: string; type: string; title: string; date: string; status: string }>;
};
export function PortalDashboard() {
  useMeta('Client overview', 'Secure client workspace overview.', true);
  const query = useQuery({
    queryKey: ['portal-summary'],
    queryFn: () => api<PortalSummary>('/portal/summary'),
  });
  if (query.isLoading) return <Loading />;
  if (query.isError || !query.data) return <LoadError />;
  const data = query.data;
  return (
    <div className="space-y-8">
      <PageTitle
        title={`Welcome to ${data.organisation.name}`}
        copy="Your current engagements, findings, reports, and support activity."
        badge={data.sampleData ? 'Fictional development data' : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(data.counts).map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-500">
              {humanize(label)}
            </p>
            <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <Card>
          <h2 className="text-lg font-semibold">Open findings by severity</h2>
          <div className="mt-4 h-64" aria-label="Open findings by severity chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.severity}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {data.severity.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0b1728',
                    border: '1px solid #20314a',
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {data.severity.map((entry) => (
              <span className="flex items-center gap-2 text-xs text-slate-400" key={entry.name}>
                <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Activity className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="mt-5 divide-y divide-white/10">
            {data.recent.map((item) => (
              <div className="flex items-center justify-between gap-4 py-4" key={item.id}>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.type} · {formatDate(item.date)}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-300">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

type ListResponse = {
  sampleData: boolean;
  items: Array<Record<string, string | number | boolean | null>>;
};
export function PortalListPage({ type }: { type: string }) {
  useMeta(humanize(type), `Secure ${humanize(type).toLowerCase()} workspace.`, true);
  const query = useQuery({
    queryKey: ['portal', type],
    queryFn: () => api<ListResponse>(`/portal/${type}`),
  });
  return (
    <div className="space-y-8">
      <PageTitle
        title={humanize(type)}
        copy={portalDescriptions[type] ?? 'Authorised organisation information.'}
      />
      {type === 'tickets' && <TicketComposer />}
      {query.isLoading ? (
        <Loading />
      ) : query.isError || !query.data ? (
        <LoadError />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-white/10">
            {query.data.items.length ? (
              query.data.items.map((item, index) => (
                <div
                  className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                  key={String(item.id ?? index)}
                >
                  <div>
                    <h2 className="text-sm font-semibold">
                      {String(item.title ?? item.name ?? item.type ?? 'Record')}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {String(item.summary ?? item.description ?? item.status ?? '')}
                    </p>
                  </div>
                  <span className="inline-flex items-center text-xs text-slate-400">
                    {item.updatedAt ? formatDate(String(item.updatedAt)) : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-400">
                  No {humanize(type).toLowerCase()} are available.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function TicketComposer() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<SupportTicketInput>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      title: '',
      message: '',
      priority: 'normal',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: SupportTicketInput) =>
      api<{ reference: string; status: string }>('/portal/tickets', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'tickets'] }),
  });

  if (!open)
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open a support ticket</Button>
      </div>
    );

  if (mutation.data)
    return (
      <SubmissionSuccess
        title="Support ticket opened"
        reference={mutation.data.reference}
        onReset={() => {
          mutation.reset();
          form.reset({
            title: '',
            message: '',
            priority: 'normal',
            idempotencyKey: createIdempotencyKey(),
          });
          setOpen(false);
        }}
      />
    );

  return (
    <form
      className="surface max-w-3xl space-y-5 p-6"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Open a support ticket</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Do not include passwords, authentication tokens, or unnecessary personal data.
          </p>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      <TextField
        required
        label="Subject"
        registration={form.register('title')}
        error={form.formState.errors.title}
      />
      <SelectField
        required
        label="Priority"
        registration={form.register('priority')}
        error={form.formState.errors.priority}
        options={[
          ['low', 'Low'],
          ['normal', 'Normal'],
          ['high', 'High'],
        ]}
      />
      <TextAreaField
        required
        label="How can the team help?"
        registration={form.register('message')}
        error={form.formState.errors.message}
      />
      {mutation.isError && <FormError message={mutation.error.message} />}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Opening…' : 'Open ticket'}
      </Button>
    </form>
  );
}

export function SessionsPage() {
  useMeta('Sessions & devices', 'Manage active client portal sessions.', true);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: () =>
      api<{
        sessions: Array<{
          id: string;
          current: boolean;
          createdAt: string;
          lastSeenAt: string;
          userAgent: string;
        }>;
      }>('/auth/sessions'),
  });
  const revoke = useMutation({
    mutationFn: (id: string) =>
      api(`/auth/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'X-Confirm-Action': 'revoke-session' },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
  return (
    <div className="space-y-8">
      <PageTitle title="Sessions & devices" copy="Review and revoke authenticated sessions." />
      {query.isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-3">
          {query.data?.sessions.map((session) => (
            <Card
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              key={session.id}
            >
              <div>
                <p className="text-sm font-semibold">
                  {session.current ? 'Current session' : 'Authenticated session'}
                </p>
                <p className="mt-1 max-w-xl truncate text-xs text-slate-500">
                  {session.userAgent} · Last seen {formatDate(session.lastSeenAt)}
                </p>
              </div>
              {!session.current && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Revoke this authenticated session? The device will need to sign in again.',
                      )
                    )
                      revoke.mutate(session.id);
                  }}
                >
                  Revoke
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const adminNav = [
  ['Overview', '/admin', LayoutDashboard],
  ['Leads & requests', '/admin/leads', ShieldAlert],
  ['Clients & organisations', '/admin/organisations', Building2],
  ['Users & roles', '/admin/users', Settings],
  ['Engagements', '/admin/engagements', ClipboardCheck],
  ['Findings & reports', '/admin/findings', FileLock2],
  ['Support tickets', '/admin/tickets', LifeBuoy],
  ['Content', '/admin/content', FileLock2],
  ['Careers', '/admin/careers', ListChecks],
  ['Newsletter', '/admin/newsletter', Bell],
  ['Site settings', '/admin/settings', Settings],
  ['Audit logs', '/admin/audit', History],
] as const;
type AdminSummary = {
  sampleData: boolean;
  counts: Record<string, number>;
  recentAudit: Array<{ id: string; action: string; actor: string; createdAt: string }>;
};
export function AdminDashboard() {
  useMeta('Administration overview', 'Protected platform administration.', true);
  const query = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => api<AdminSummary>('/admin/summary'),
  });
  if (query.isLoading) return <Loading />;
  if (!query.data) return <LoadError />;
  return (
    <div className="space-y-8">
      <PageTitle
        title="Administration overview"
        copy="Operational queues and security-relevant activity."
        badge={query.data.sampleData ? 'Fictional development data' : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(query.data.counts).map(([name, value]) => (
          <Card key={name}>
            <p className="text-xs uppercase tracking-wider text-slate-500">{humanize(name)}</p>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-semibold">Recent administrative audit</h2>
        <div className="mt-5 divide-y divide-white/10">
          {query.data.recentAudit.map((event) => (
            <div className="grid gap-1 py-4 sm:grid-cols-[1fr_auto]" key={event.id}>
              <p className="text-sm text-white">{event.action}</p>
              <p className="text-xs text-slate-500">
                {event.actor} · {formatDate(event.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
export function AdminListPage({ type }: { type: string }) {
  useMeta(`Admin ${humanize(type)}`, 'Protected administration area.', true);
  const query = useQuery({
    queryKey: ['admin', type],
    queryFn: () => api<ListResponse>(`/admin/${type}`),
  });
  return (
    <div className="space-y-8">
      <PageTitle
        title={humanize(type)}
        copy="Role-scoped administration. High-impact actions require explicit confirmation and are audited."
      />
      {query.isLoading ? (
        <Loading />
      ) : query.isError || !query.data ? (
        <LoadError />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Record</th>
                <th className="p-4">Status</th>
                <th className="p-4">Updated</th>
                <th className="p-4 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {query.data.items.map((item, index) => (
                <tr key={String(item.id ?? index)}>
                  <td className="p-4 font-medium text-white">
                    {String(item.title ?? item.name ?? item.email ?? 'Record')}
                  </td>
                  <td className="p-4 text-slate-400">{String(item.status ?? item.role ?? '—')}</td>
                  <td className="p-4 text-slate-500">
                    {item.updatedAt ? formatDate(String(item.updatedAt)) : '—'}
                  </td>
                  <td className="p-4 text-right text-xs text-slate-500">Role-scoped API</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function PageTitle({ title, copy, badge }: { title: string; copy: string; badge?: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {badge && (
          <span className="rounded-full border border-amber-300/25 bg-amber-300/[.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
    </div>
  );
}
function Loading() {
  return (
    <div className="surface p-8 text-sm text-slate-400" role="status">
      Loading authorised data…
    </div>
  );
}
function LoadError() {
  return (
    <div className="surface border-rose-300/20 p-8 text-sm text-rose-200" role="alert">
      The authorised data could not be loaded. No changes were made.
    </div>
  );
}
function humanize(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}
const portalDescriptions: Record<string, string> = {
  engagements: 'Track agreed work, milestones, and service status.',
  assessments: 'Review assessment status and high-level outcomes.',
  reports: 'Access report metadata and authorised secure documents.',
  tickets: 'Open and review support requests.',
  notifications: 'Review service and account notifications.',
  settings: 'Manage approved profile and organisation preferences.',
  audit: 'Review security-relevant activity visible to your organisation.',
};
