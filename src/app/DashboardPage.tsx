import WorkspaceSection from '../components/workspace/WorkspaceSection';
import { paths } from '../routes';

export default function DashboardPage() {
  return (
    <div className="app-dashboard">
      <WorkspaceSection newProjectHref={paths.appQuestionnaire} />
    </div>
  );
}
