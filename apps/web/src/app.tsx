import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ConsentBanner } from '@/components/consent-banner';
import { PublicLayout } from '@/components/public-layout';
import {
  AuthProvider,
  ForgotPasswordPage,
  LoginPage,
  ProtectedRoute,
  ResetPasswordPage,
} from '@/features/auth/auth';
import { ErrorPage, NotFoundPage } from '@/pages/system';

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('@/pages/catalog').then((m) => ({ default: m.CatalogPage })));
const CatalogDetailPage = lazy(() =>
  import('@/pages/catalog').then((m) => ({ default: m.CatalogDetailPage })),
);
const AboutPage = lazy(() => import('@/pages/company').then((m) => ({ default: m.AboutPage })));
const TrustPage = lazy(() => import('@/pages/company').then((m) => ({ default: m.TrustPage })));
const InsightsPage = lazy(() =>
  import('@/pages/content').then((m) => ({ default: m.InsightsPage })),
);
const ResourceDetailPage = lazy(() =>
  import('@/pages/content').then((m) => ({ default: m.ResourceDetailPage })),
);
const CaseStudiesPage = lazy(() =>
  import('@/pages/content').then((m) => ({ default: m.CaseStudiesPage })),
);
const CareersPage = lazy(() => import('@/pages/content').then((m) => ({ default: m.CareersPage })));
const LegalPage = lazy(() => import('@/pages/legal').then((m) => ({ default: m.LegalPage })));
const ContactPage = lazy(() =>
  import('@/pages/forms/contact').then((m) => ({ default: m.ContactPage })),
);
const AssessmentPage = lazy(() =>
  import('@/pages/forms/assessment').then((m) => ({ default: m.AssessmentPage })),
);
const IncidentPage = lazy(() =>
  import('@/pages/forms/sensitive').then((m) => ({ default: m.IncidentPage })),
);
const VulnerabilityPage = lazy(() =>
  import('@/pages/forms/sensitive').then((m) => ({ default: m.VulnerabilityPage })),
);
const PortalLayout = lazy(() =>
  import('@/features/portal/portal').then((m) => ({ default: m.PortalLayout })),
);
const PortalDashboard = lazy(() =>
  import('@/features/portal/portal').then((m) => ({ default: m.PortalDashboard })),
);
const PortalListPage = lazy(() =>
  import('@/features/portal/portal').then((m) => ({ default: m.PortalListPage })),
);
const SessionsPage = lazy(() =>
  import('@/features/portal/portal').then((m) => ({ default: m.SessionsPage })),
);
const AdminDashboard = lazy(() =>
  import('@/features/portal/portal').then((m) => ({ default: m.AdminDashboard })),
);
const AdminListPage = lazy(() =>
  import('@/features/portal/portal').then((m) => ({ default: m.AdminListPage })),
);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense
            fallback={
              <div
                className="bg-ink grid min-h-[55vh] place-items-center text-sm text-slate-400"
                role="status"
              >
                Loading view…
              </div>
            }
          >
            <Routes>
              <Route errorElement={<ErrorPage />} element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="services" element={<CatalogPage type="services" />} />
                <Route path="services/:slug" element={<CatalogDetailPage type="services" />} />
                <Route path="solutions" element={<CatalogPage type="solutions" />} />
                <Route path="solutions/:slug" element={<CatalogDetailPage type="solutions" />} />
                <Route path="industries" element={<CatalogPage type="industries" />} />
                <Route path="industries/:slug" element={<CatalogDetailPage type="industries" />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="trust" element={<TrustPage />} />
                <Route path="case-studies" element={<CaseStudiesPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="insights/:slug" element={<ResourceDetailPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="request-assessment" element={<AssessmentPage />} />
                <Route path="incident-response" element={<IncidentPage />} />
                <Route path="report-vulnerability" element={<VulnerabilityPage />} />
                <Route path="legal/privacy" element={<LegalPage type="privacy" />} />
                <Route path="legal/terms" element={<LegalPage type="terms" />} />
                <Route path="legal/cookies" element={<LegalPage type="cookies" />} />
                <Route
                  path="legal/responsible-disclosure"
                  element={<LegalPage type="disclosure" />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="portal/login" element={<LoginPage />} />
              <Route path="portal/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="portal/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="portal"
                element={
                  <ProtectedRoute>
                    <PortalLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PortalDashboard />} />
                {[
                  'engagements',
                  'assessments',
                  'reports',
                  'tickets',
                  'notifications',
                  'settings',
                  'audit',
                ].map((type) => (
                  <Route key={type} path={type} element={<PortalListPage type={type} />} />
                ))}
                <Route path="sessions" element={<SessionsPage />} />
              </Route>
              <Route
                path="admin"
                element={
                  <ProtectedRoute admin>
                    <PortalLayout admin />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                {[
                  'leads',
                  'organisations',
                  'users',
                  'engagements',
                  'findings',
                  'tickets',
                  'content',
                  'careers',
                  'newsletter',
                  'settings',
                  'audit',
                ].map((type) => (
                  <Route key={type} path={type} element={<AdminListPage type={type} />} />
                ))}
              </Route>
              <Route path="/portal/login/" element={<Navigate to="/portal/login" replace />} />
            </Routes>
          </Suspense>
          <ConsentBanner />
          <Toaster theme="dark" richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
