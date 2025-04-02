import { PageTransition } from '@/components/PageTransition/PageTransition';
import { RoleManagement } from '@/components/user-management/RoleManagement';

export default function RoleManagementPage() {
  return (
    <PageTransition>
      <RoleManagement />
    </PageTransition>
  );
}