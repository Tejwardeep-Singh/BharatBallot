import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Plus,
  UserCog,
  Users,
  Vote,
} from 'lucide-react';

import { useElection } from '../../context/ElectionContext';
import { api } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import Page from '../common/Page';

function HeadOverview({ notify }) { const [data, setData] = useState({}); const [loading, setLoading] = useState(false); const navigate = useNavigate(); const { selectedElection } = useElection();
  useEffect(() => { if (!selectedElection) { setData({}); return; } setLoading(true); api(`/api/head/elections/${selectedElection._id}/dashboard`, { role: 'head' }).then(setData).catch(e => notify(e.message, 'error')).finally(() => setLoading(false)); }, [selectedElection, notify]);
  if (!selectedElection) return <Page title="System Overview" subtitle="A live view of Bharat Ballot administration."><Card className="text-center text-slate-500">Please select an election.</Card></Page>;
  const stats = data.statistics || {}; const cards = [['Selected Election', selectedElection.title, CalendarDays], ['Election Status', selectedElection.status, CheckCircle2], ['Total Constituencies', stats.constituencies || 0, FileText], ['Total Admins', stats.admins || 0, UserCog], ['Registered Voters', stats.voters || 0, Vote], ['Registered Candidates', stats.candidates || 0, Users]];
  
  
  return <Page title="System Overview" subtitle="A live view of Bharat Ballot administration.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon]) => <Card key={label}>
        <Icon size={18} className="mb-4 text-blue-600" /><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-xl font-black text-slate-900">{loading ? '—' : value}</p></Card>)}</div>
        <div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => navigate('/head/election')}><Plus size={15} />Create Election</Button>
        <Button className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => navigate('/head/viewAdmins')}>Manage Admins</Button><Button className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => navigate('/head/results')}>View Results</Button>
  </div></Page>; }


export default HeadOverview;