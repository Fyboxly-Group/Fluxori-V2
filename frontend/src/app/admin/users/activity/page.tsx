import { PageTransition } from '@/components/PageTransition/PageTransition';
import { ActivityLog } from '@/components/user-management/ActivityLog';

export default function ActivityLogPage() {
  return (
    <PageTransition>
      <ActivityLog />
    </PageTransition>
  );
}