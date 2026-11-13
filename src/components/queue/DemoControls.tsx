import { useState } from 'react';
import { ChevronDown, FlaskConical, RotateCcw, SkipForward, Zap, ZapOff } from 'lucide-react';
import { IS_DEMO } from '@/lib/config';
import { queueService } from '@/lib/queue/queue-service';
import { cn } from '@/lib/utils';

export function DemoControls({
  serviceId,
  className,
  onReset,
}: {
  serviceId?: string;
  className?: string;
  onReset?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [auto, setAuto] = useState(() =>
    typeof window === 'undefined' ? true : queueService.isAutoAdvanceEnabled(),
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!IS_DEMO) return null;

  const advance = () => {
    if (!serviceId) return;
    queueService.advanceDemoQueue(serviceId);
    setMessage('Queue moved forward one step.');
  };

  const toggleAuto = () => {
    const next = !auto;
    queueService.setAutoAdvanceEnabled(next);
    setAuto(next);
    setMessage(next ? 'Auto-advance is on.' : 'Auto-advance is paused.');
  };

  const reset = () => {
    if (!window.confirm('Reset the simulated queues and notifications? Your session stays signed in.')) {
      return;
    }
    queueService.resetDemoQueue();
    setMessage('Demo queues were reset.');
    onReset?.();
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left"
      >
        <FlaskConical size={14} className="shrink-0 text-amber-700" aria-hidden="true" />
        <span className="min-w-0 flex-1 text-[0.6875rem] font-bold text-amber-900">
          Prototype controls
        </span>
        <span className="hidden text-[0.5625rem] font-medium text-amber-700 sm:block">
          Queue data is simulated
        </span>
        <ChevronDown
          size={15}
          className={cn('shrink-0 text-amber-700 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="border-t border-amber-200/70 px-3.5 py-3">
          <p className="text-[0.625rem] leading-relaxed text-amber-900/80">
            These controls stand in for staff actions. They only affect the simulated queues on
            this device.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceId ? (
              <button
                type="button"
                onClick={advance}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100"
              >
                <SkipForward size={12} /> Move queue
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleAuto}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100"
            >
              {auto ? <ZapOff size={12} /> : <Zap size={12} />}
              {auto ? 'Pause auto' : 'Resume auto'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100"
            >
              <RotateCcw size={12} /> Reset demo
            </button>
          </div>
          {message ? (
            <p className="mt-2 text-[0.625rem] font-semibold text-amber-800" role="status">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
