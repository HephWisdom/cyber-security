import { company } from '@platform/shared';
import { Link } from 'react-router-dom';

export function BrandMark({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      to="/"
      className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-md"
      aria-label={`${company.name} home`}
    >
      <svg className="h-10 w-10" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="shield-stack-gradient" x1="7" x2="41" y1="5" y2="43">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset=".52" stopColor="#0b63f6" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
        </defs>
        <path
          d="M24 2.5 43 9v12.2c0 11.8-7.7 20-19 24.3C12.7 41.2 5 33 5 21.2V9l19-6.5Z"
          fill="url(#shield-stack-gradient)"
        />
        <path
          d="m13.5 17.5 10.5-5.7 10.5 5.7L24 23.2l-10.5-5.7Z"
          fill="white"
        />
        <path
          d="m13.5 23.2 10.5 5.7 10.5-5.7v4.5L24 33.4l-10.5-5.7v-4.5Z"
          fill="white"
          opacity=".86"
        />
        <path
          d="m13.5 29.4 10.5 5.7 10.5-5.7v4.5L24 39.6l-10.5-5.7v-4.5Z"
          fill="white"
          opacity=".62"
        />
      </svg>
      {!compact && (
        <span
          className={`font-display text-sm font-extrabold uppercase tracking-[0.15em] sm:text-base ${inverse ? 'text-white' : 'text-[#0b1f38]'}`}
        >
          {company.name}
        </span>
      )}
    </Link>
  );
}
