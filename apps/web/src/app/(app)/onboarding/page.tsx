import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { requireSession } from '@/lib/auth/session';
import { needsOnboarding } from '@/server/onboarding/onboarding.service';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const session = await requireSession();

  if (!needsOnboarding(session.role, session.industryPack, session.industrySpecialty)) {
    redirect('/dashboard');
  }

  return (
    <OnboardingWizard
      initialName={session.organizationName}
      initialPack={session.industryPack}
    />
  );
}
