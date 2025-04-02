import { PageTransition } from '@/components/PageTransition/PageTransition';
import { ReportBuilder } from '@/components/reporting/ReportBuilder';

export default function ReportBuilderPage() {
  return (
    <PageTransition>
      <ReportBuilder />
    </PageTransition>
  );
}