import Card from '../common/Card';
import Page from '../common/Page';

function SettingsPage() {
  return (
    <Page
      title="System Settings"
      subtitle="Maintain core election-system settings."
    >
      <div className="max-w-3xl space-y-4">
        <Card>
          <h2 className="font-bold">
            Results publication
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Publish results only after the election has been
            completed and verified.
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">
            Security controls
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Administrator permissions are assigned through
            election and constituency assignments.
          </p>
        </Card>
      </div>
    </Page>
  );
}

export default SettingsPage;