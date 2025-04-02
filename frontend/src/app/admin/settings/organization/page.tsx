import { PageTransition } from '@/components/PageTransition/PageTransition';
import { OrganizationSettings } from '@/components/user-management/OrganizationSettings';

export default function OrganizationSettingsPage() {
  return (
    <PageTransition>
      <OrganizationSettings />
    </PageTransition>
  );
}