import { PageTransition } from '@/components/PageTransition/PageTransition';
import { UserManagement } from '@/components/user-management/UserManagement';

export default function UserManagementPage() {
  return (
    <PageTransition>
      <UserManagement />
    </PageTransition>
  );
}