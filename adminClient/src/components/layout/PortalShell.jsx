import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';

import ElectionSelector from '../elections/ElectionSelector';

function PortalShell({ role, children }) {
  const location = useLocation(); const navigate = useNavigate(); const [open, setOpen] = useState(false);
  const items = role === 'head' ? [
    ['Overview', '/head/dashboard', LayoutDashboard], ['Election Management', '/head/election', CalendarDays], ['Manage Admins', '/head/viewAdmins', UserCog], ['Results', '/head/results', BarChart3],
  ] : [['Overview', '/admin/dashboard', LayoutDashboard],['Profile', '/admin/profile', UserCog], ['Manage Candidates', '/admin/candidate/view', Users], ['Manage Voters', '/admin/voters', UserPlus],['Results', '/admin/results', BarChart3] ];
  const logout = () => { localStorage.removeItem(`${role}Token`); navigate(role === 'head' ? '/head' : '/admin'); };
  return <div className="min-h-screen bg-[#f8fbff] text-slate-800"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur"><button className="mr-3 md:hidden" onClick={() => setOpen(!open)}><Menu /></button><Link to={role === 'head' ? '/head/dashboard' : '/admin/dashboard'} className="flex items-center gap-2 font-black text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">B</span><span>Bharat<span className="text-blue-600">Ballot</span></span></Link><div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500">{role === 'head' && <ElectionSelector />}<ShieldCheck size={16} className="text-emerald-600" />{role === 'head' ? 'HEAD PORTAL' : 'ADMIN PORTAL'}<button onClick={logout} className="ml-3 rounded-lg p-2 hover:bg-slate-100" title="Sign out"><LogOut size={16} /></button></div></header><div className="flex"><aside className={`${open ? 'block' : 'hidden'} fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 md:static md:block md:min-h-[calc(100vh-4rem)] md:w-64 md:border-b-0 md:border-r`}><nav className="space-y-1">{items.map(([label, path, Icon]) => <Link onClick={() => setOpen(false)} key={path} to={path} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide ${location.pathname === path ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={17} />{label}</Link>)}</nav></aside><main className="min-w-0 flex-1 p-5 md:p-8">{children}</main></div></div>;
}

export default PortalShell;