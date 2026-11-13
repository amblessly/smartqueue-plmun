import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { BrandMark } from '@/components/brand/Brand';
import { useSession } from '@/hooks/useSession';

export function SessionGate({
  allowGuest = true,
  allowIncompleteOnboarding = false,
}: {
  allowGuest?: boolean;
  allowIncompleteOnboarding?: boolean;
}) {
  const { session, loading } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const content = document.getElementById('app-content');

    if (!session) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (!allowGuest && session.isGuest) {
      window.location.replace('/services');
      return;
    }

    if (!allowIncompleteOnboarding && !session.isGuest && !session.onboardingComplete) {
      window.location.replace('/onboarding');
      return;
    }

    content?.classList.remove('invisible');
    content?.setAttribute('aria-busy', 'false');
    setReady(true);
  }, [loading, session, allowGuest, allowIncompleteOnboarding]);

  if (ready) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-cream-50">
      <BrandMark size={44} />
      <div className="flex items-center gap-2 text-sm font-medium text-ink-500" role="status">
        <LoaderCircle size={16} className="animate-[spin_0.8s_linear_infinite]" />
        Checking your session
      </div>
    </div>
  );
}
