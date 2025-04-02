import { PageTransition } from '@/components/PageTransition/PageTransition';
import ReportingDashboard from '@/components/reporting/ReportingDashboard';

export default function ReportsPage() {
  return (
    <PageTransition>
      <ReportingDashboard />
    </PageTransition>
  );
}