import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

export function SubmissionSuccess({
  reference,
  title = 'Request received',
  onReset,
}: {
  reference: string;
  title?: string;
  onReset?: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.05] p-7"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="h-8 w-8 text-emerald-300" />
      <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        The server accepted your submission. Keep this reference if you need to follow up.
      </p>
      <p className="mt-5 inline-flex rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-cyan-300">
        {reference}
      </p>
      {onReset && (
        <div>
          <Button className="mt-6" variant="secondary" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Send another
          </Button>
        </div>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border border-rose-300/20 bg-rose-300/[.06] p-4 text-sm text-rose-100"
      role="alert"
    >
      {message} No success has been recorded; your information remains in the form so you can retry.
    </div>
  );
}
