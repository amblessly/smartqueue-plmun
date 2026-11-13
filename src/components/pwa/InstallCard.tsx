import { useEffect, useState } from 'react';
import { Check, Download, Share, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallCard({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setInstalled(isStandalone());
    setAvailable(Boolean(window.__sqInstallPrompt));
    const onAvailable = () => setAvailable(true);
    const onInstalled = () => {
      setInstalled(true);
      setAvailable(false);
      setMessage('SmartQueue was added to your device.');
    };
    window.addEventListener('sq:install-available', onAvailable);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('sq:install-available', onAvailable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    const prompt = window.__sqInstallPrompt;
    if (!prompt) return;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setMessage('SmartQueue was added to your device.');
      }
      window.__sqInstallPrompt = null;
      setAvailable(false);
    } catch {
      setMessage('Your browser could not start the install flow.');
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-950/8 bg-white p-4 shadow-soft',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bamboo-50 text-bamboo-700 ring-1 ring-bamboo-100">
          {installed ? <Check size={17} /> : <Smartphone size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink-900">
            {installed ? 'SmartQueue is installed' : 'Add SmartQueue to your home screen'}
          </p>
          <p className={cn('mt-1 leading-relaxed text-ink-500', compact ? 'text-[0.625rem]' : 'text-[0.6875rem]')}>
            {installed
              ? 'Open it like a normal app. Your queue updates still need a connection.'
              : available
                ? 'Open your queue faster and keep the app shell available offline.'
                : isIos()
                  ? 'In Safari, tap Share, then Add to Home Screen.'
                  : 'Use your browser menu and choose Install app or Add to Home screen.'}
          </p>
        </div>
      </div>

      {available && !installed ? (
        <button
          type="button"
          onClick={install}
          className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-bamboo-900 px-3 text-[0.6875rem] font-bold text-cream-50 transition-colors hover:bg-bamboo-800"
        >
          <Download size={13} aria-hidden="true" />
          Install app
        </button>
      ) : null}

      {!available && !installed && isIos() ? (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-cream-100 px-2.5 py-1.5 text-[0.5625rem] font-semibold text-ink-500">
          <Share size={11} aria-hidden="true" /> Share → Add to Home Screen
        </p>
      ) : null}

      {message ? (
        <p className="mt-2 text-[0.625rem] font-medium text-bamboo-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
