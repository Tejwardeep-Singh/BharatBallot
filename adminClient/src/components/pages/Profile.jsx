import { useEffect, useState } from 'react';

import { api } from '../../services/api';

import Card from '../common/Card';
import Page from '../common/Page';

function Profile({ notify }) {
  const [me, setMe] = useState(null);

  useEffect(() => {
    api('/api/admin/me', { role: 'admin' })
      .then(setMe)
      .catch(e => notify(e.message, 'error'));
  }, [notify]);

  return (
    <Page
      title="Profile"
      subtitle="Your assigned election and constituency."
    >
      <Card className="max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <p>
            <b>Name</b>
            <br />
            {me?.name || '—'}
          </p>

          <p>
            <b>Email / User ID</b>
            <br />
            {me?.userId || '—'}
          </p>

          <p>
            <b>Assigned election</b>
            <br />
            {me?.election?.title || '—'}
          </p>

          <p>
            <b>Assigned constituency</b>
            <br />
            {me?.constituency?.name ||
              me?.address?.area ||
              '—'}
          </p>
        </div>

        <p className="mt-6 border-t pt-5 text-sm text-slate-500">
          Password and profile-image updates are ready for the
          administrator profile API.
        </p>
      </Card>
    </Page>
  );
}

export default Profile;