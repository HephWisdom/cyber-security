import { Bot, Cloud, Code2, Network, ShieldCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const nodes = [
  {
    label: 'Network',
    icon: Network,
    className: 'left-[22%] top-[43%] sm:left-[24%]',
  },
  {
    label: 'Cloud',
    icon: Cloud,
    className: 'right-[22%] top-[43%] sm:right-[24%]',
  },
  {
    label: 'Apps',
    icon: Code2,
    className: 'bottom-[8%] left-[27%] sm:bottom-[12%]',
  },
  {
    label: 'AI',
    icon: Bot,
    className: 'bottom-[8%] right-[27%] sm:bottom-[12%]',
  },
];

const connectionPaths = [
  'M280 280 C244 272 208 262 157 254',
  'M280 280 C316 272 352 262 403 254',
  'M280 280 C252 336 214 402 171 466',
  'M280 280 C308 336 346 402 389 466',
  'M157 254 C224 198 336 198 403 254',
  'M171 466 C236 508 324 508 389 466',
];

const BLUE = [11, 99, 246] as const;
const SIGNAL_HOT = [255, 92, 53] as const;

export function SecurityVisual() {
  const orbitRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const resetNodes = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    orbitRef.current?.querySelectorAll<HTMLElement>('.orbit-node').forEach((node) => {
      node.style.setProperty('--pull-x', '0px');
      node.style.setProperty('--pull-y', '0px');
      node.style.setProperty('--node-color', '#0b63f6');
      node.removeAttribute('data-active');
    });
  };

  const updateMagneticNodes = () => {
    frameRef.current = null;
    const root = orbitRef.current;
    if (!root) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      resetNodes();
      return;
    }

    const influenceRadius = Math.min(root.getBoundingClientRect().width * 0.32, 175);
    root.querySelectorAll<HTMLElement>('.orbit-node').forEach((node) => {
      const rect = node.getBoundingClientRect();
      const previousX = Number.parseFloat(node.style.getPropertyValue('--pull-x')) || 0;
      const previousY = Number.parseFloat(node.style.getPropertyValue('--pull-y')) || 0;
      const centerX = rect.left + rect.width / 2 - previousX;
      const centerY = rect.top + rect.height / 2 - previousY;
      const deltaX = pointerRef.current.x - centerX;
      const deltaY = pointerRef.current.y - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const proximity = Math.max(0, 1 - distance / influenceRadius);
      const easedProximity = proximity * proximity;
      const pull = 9 * easedProximity;
      const directionX = distance > 0 ? deltaX / distance : 0;
      const directionY = distance > 0 ? deltaY / distance : 0;
      const red = Math.round(BLUE[0] + (SIGNAL_HOT[0] - BLUE[0]) * proximity);
      const green = Math.round(BLUE[1] + (SIGNAL_HOT[1] - BLUE[1]) * proximity);
      const blue = Math.round(BLUE[2] + (SIGNAL_HOT[2] - BLUE[2]) * proximity);

      node.style.setProperty('--pull-x', `${(directionX * pull).toFixed(2)}px`);
      node.style.setProperty('--pull-y', `${(directionY * pull).toFixed(2)}px`);
      node.style.setProperty('--node-color', `rgb(${red} ${green} ${blue})`);
      if (proximity > 0.42) node.setAttribute('data-active', 'true');
      else node.removeAttribute('data-active');
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(updateMagneticNodes);
  };

  return (
    <div
      ref={orbitRef}
      className="security-orbit relative mx-auto aspect-square w-full max-w-[560px] cursor-default"
      aria-label="A unified security platform connecting network, cloud, applications, and AI"
      onPointerLeave={resetNodes}
      onPointerMove={handlePointerMove}
      role="img"
    >
      <div className="orbit orbit-top absolute left-1/2 top-[2%] h-[58%] w-[48%] -translate-x-1/2 rounded-[50%] border border-[#b9dcfa] bg-[#eff8ff]/80" />
      <div className="orbit orbit-left absolute left-[4%] top-[27%] h-[48%] w-[58%] rounded-[50%] border border-[#b9dcfa] bg-[#eff8ff]/70" />
      <div className="orbit orbit-right absolute right-[4%] top-[27%] h-[48%] w-[58%] rounded-[50%] border border-[#b9dcfa] bg-[#eff8ff]/70" />
      <div className="orbit orbit-bottom absolute bottom-[2%] left-1/2 h-[58%] w-[48%] -translate-x-1/2 rounded-[50%] border border-[#b9dcfa] bg-[#eff8ff]/70" />

      <svg
        className="connection-map pointer-events-none absolute inset-0 z-[5] h-full w-full"
        viewBox="0 0 560 560"
        aria-hidden="true"
      >
        {connectionPaths.map((path, index) => (
          <g key={path}>
            <path className="connection-base" d={path} vectorEffect="non-scaling-stroke" />
            <path
              className="connection-flow"
              d={path}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${index * -0.24}s` }}
            />
          </g>
        ))}
      </svg>

      <p className="orbit-label absolute left-1/2 top-[8%] z-10 w-28 -translate-x-1/2 text-center text-xs font-semibold leading-4 text-[#46647f] sm:text-sm">
        End-to-end visibility
      </p>
      <p className="orbit-label absolute left-0 top-[44%] z-10 w-16 -translate-y-1/2 text-left text-[10px] font-semibold leading-4 text-[#46647f] sm:-left-[1%] sm:w-24 sm:text-sm">
        Business context
      </p>
      <p className="orbit-label absolute right-0 top-[44%] z-10 w-16 -translate-y-1/2 text-right text-[10px] font-semibold leading-4 text-[#46647f] sm:-right-[1%] sm:w-24 sm:text-sm">
        Expert judgement
      </p>
      <p className="orbit-label absolute bottom-[6%] left-1/2 z-10 w-28 -translate-x-1/2 text-center text-xs font-semibold leading-4 text-[#46647f] sm:text-sm">
        Practical action
      </p>

      <div className="shield-wrap absolute left-1/2 top-1/2 z-20 h-[39%] w-[34%] -translate-x-1/2 -translate-y-1/2">
        <div className="shield-pulse absolute inset-0">
          <svg
            className="absolute inset-0 h-full w-full drop-shadow-[0_24px_24px_rgba(11,99,246,.24)]"
            viewBox="0 0 190 220"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="shield-gradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset=".47" stopColor="#0b63f6" />
                <stop offset="1" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="shield-edge" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0755d1" />
              </linearGradient>
            </defs>
            <path
              d="M95 5 181 38v70c0 52-34 91-86 108C43 199 9 160 9 108V38L95 5Z"
              fill="url(#shield-edge)"
            />
            <path
              d="M95 17 169 46v61c0 44-28 78-74 95-46-17-74-51-74-95V46l74-29Z"
              fill="url(#shield-gradient)"
              stroke="#93c5fd"
              strokeWidth="3"
            />
            <path
              d="M34 69c38-8 79-1 121-24-8 32-6 66 8 99-15 27-37 46-68 58-46-17-74-51-74-95V78c4-3 8-6 13-9Z"
              fill="#2563eb"
              opacity=".28"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pb-2 text-center text-white">
            <span className="shield-icon grid h-12 w-12 place-items-center rounded-full bg-white/95 text-[#0b63f6] shadow-lg sm:h-14 sm:w-14">
              <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <p className="mt-3 text-[10px] font-bold leading-tight sm:text-sm">
              One clear
              <br />
              security view
            </p>
          </div>
        </div>
      </div>

      {nodes.map(({ label, icon: Icon, className }) => (
        <div key={label} className={`orbit-node absolute z-30 ${className} text-center`}>
          <Icon className="mx-auto h-5 w-5 text-[#0b63f6] sm:h-6 sm:w-6" />
          <span className="mt-1 block text-[10px] font-bold text-[#0755d1] sm:text-sm">
            {label}
          </span>
        </div>
      ))}

      <span className="orbit-dot signal-phase-0 absolute left-[21%] top-[30%] z-20 h-2.5 w-2.5 rounded-full" />
      <span className="orbit-dot signal-phase-1 absolute right-[19%] top-[29%] z-20 h-2.5 w-2.5 rounded-full" />
      <span className="orbit-dot signal-phase-2 absolute bottom-[25%] left-[17%] z-20 h-2.5 w-2.5 rounded-full" />
    </div>
  );
}
