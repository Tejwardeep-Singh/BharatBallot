import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  UserPlus,
  Users,
} from 'lucide-react';

import { api } from '../../services/api';

import Button from '../common/Button';
import Card from '../common/Card';
import Page from '../common/Page';

function AdminOverview({ notify }) {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api('/api/admin/me', { role: 'admin' }),
      api('/api/admin/voter/view', { role: 'admin' }),
      api('/api/admin/candidate/view', { role: 'admin' }),
    ])
      .then(([me, voters, candidates]) =>
        setData({
          me,
          voters,
          candidates,
        })
      )
      .catch(e => notify(e.message, 'error'));
  }, [notify]);

  const cards = [
    [
      'Assigned Election',
      data.me?.election?.title || 'Assigned election',
      CalendarDays,
    ],
    [
      'Assigned Constituency',
      data.me?.constituency?.name || '—',
      FileText,
    ],
    [
      'Registered Voters',
      data.voters?.length || 0,
      UserPlus,
    ],
    [
      'Registered Candidates',
      data.candidates?.length || 0,
      Users,
    ],
    [
      'Election Status',
      data.me?.election?.status || '—',
      CheckCircle2,
    ],
  ];

  return (
    <Page
      title="Admin Overview"
      subtitle="Your assigned election and constituency."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <Card key={label}>
            <Icon
              className="mb-4 text-blue-600"
              size={18}
            />

            <p className="text-xs font-bold uppercase text-slate-400">
              {label}
            </p>

            <p className="mt-1 text-xl font-black">
              {value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <Button
          onClick={() => navigate('/admin/voters')}
        >
          Register Voter
        </Button>

        <Button
          className="border border-slate-200 bg-white text-slate-700"
          onClick={() =>
            navigate('/admin/candidate/view')
          }
        >
          Register Candidate
        </Button>
      </div>
    </Page>
  );
}

export default AdminOverview;