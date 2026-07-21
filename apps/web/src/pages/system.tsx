import { routes } from '@platform/shared';
import { AlertTriangle, ArrowLeft, SearchX } from 'lucide-react';
import { Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMeta } from '@/hooks/use-meta';

export function NotFoundPage() {
  useMeta('Page not found', 'The requested page could not be found.', true);
  return (
    <section className="grid min-h-[62vh] place-items-center px-5 py-20 text-center">
      <div>
        <SearchX className="mx-auto h-10 w-10 text-cyan-300" />
        <p className="kicker mt-6">404 · Page not found</p>
        <h1 className="text-4xl font-semibold sm:text-5xl">This path leads nowhere.</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          The page may have moved, or the address may be incomplete.
        </p>
        <Button className="mt-8" asChild>
          <Link to={routes.home}>
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  useMeta('Something went wrong', 'An unexpected application error occurred.', true);
  return (
    <section className="bg-ink grid min-h-screen place-items-center px-5 text-center">
      <div>
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-300" />
        <p className="kicker mt-6">500 · Unexpected error</p>
        <h1 className="text-4xl font-semibold">We could not load this view.</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          No action was completed. Try again, or return to the homepage.
        </p>
        <Button className="mt-8" onClick={() => window.location.assign('/')}>
          Return home
        </Button>
      </div>
    </section>
  );
}
