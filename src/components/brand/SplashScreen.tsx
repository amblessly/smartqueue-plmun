import { useEffect, useState } from 'react';
import { SPLASH_KEY } from '@/lib/config';
import { BrandMark } from '@/components/brand/Brand';

type Phase = 'intro' | 'exit' | 'done';

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [skippable, setSkippable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setPhase('done');
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const exitDelay = reduced ? 700 : 1850;
    const doneDelay = reduced ? 1250 : 2520;

    const skipTimer = window.setTimeout(() => setSkippable(true), 450);
    const exitTimer = window.setTimeout(() => setPhase('exit'), exitDelay);
    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, '1');
      setPhase('done');
    }, doneDelay);

    return () => {
      window.clearTimeout(skipTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  const skip = () => {
    sessionStorage.setItem(SPLASH_KEY, '1');
    setPhase('done');
  };

  return (
    <div id="plmun-splash" className="splash-overlay bg-bamboo-950" data-phase={phase} role="status" aria-live="polite">
      <div className="splash-circle" aria-hidden="true" />

      <div className="splash-content relative z-10 flex flex-col items-center px-8 text-center">
        <div className="splash-mark relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-green-50 shadow-[0_18px_50px_-16px_rgba(0,0,0,0.65)] ring-1 ring-white/20">
          <img
            src="/plmun-seal.jpg"
            alt=""
            width="52"
            height="54"
            className="h-[3.1rem] w-auto object-contain"
          />
        </div>

        <p className="splash-institution mt-6 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-bamboo-200/85 sm:text-[0.6875rem]">
          Pamantasan ng Lungsod ng Muntinlupa
        </p>

        <div className="splash-title mt-5 flex items-center gap-3">
          <BrandMark size={38} />
          <span className="text-[2.35rem] font-extrabold tracking-[-0.055em] text-cream-50 sm:text-[2.75rem]">
            SmartQueue
          </span>
        </div>

        <p className="splash-tagline mt-4 max-w-xs font-display text-[1.35rem] italic leading-snug text-cream-100/80">
          Skip the line. Keep your time.
        </p>

        <div className="splash-tagline mt-8 h-px w-16 bg-gradient-to-r from-transparent via-cream-100/50 to-transparent" />
        <p className="splash-tagline mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-bamboo-200/50">
          Campus queues, kept simple
        </p>
      </div>

      <button
        type="button"
        onClick={skip}
        className={`absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-medium text-bamboo-200/55 transition-all hover:bg-white/5 hover:text-cream-100 focus-visible:outline-2 focus-visible:outline-cream-100 ${
          skippable ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Skip intro
      </button>

      <span className="sr-only">Loading SmartQueue for Pamantasan ng Lungsod ng Muntinlupa.</span>
    </div>
  );
}
