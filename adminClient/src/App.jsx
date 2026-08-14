import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Archive, BarChart3, CalendarDays, CheckCircle2, Clock3, Edit3, FileText, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, ShieldCheck, Trash2, UserCog, UserPlus, Users, Vote } from 'lucide-react';
import Nav from './components/Nav';
import Home from './components/pages/Home';
import HeadLogin from './components/pages/HeadLogin';
import AdminLogin from './components/pages/AdminLogin';
import electionConfig from './config/electionConfig';
import HeadResults from "./components/pages/HeadResults";
import ElectionSelector from './components/elections/ElectionSelector';
import { ElectionProvider, useElection } from './context/ElectionContext';
import AdminResults from "./components/pages/AdminResults";
import { api } from './services/api';
import Copyright from "./components/Copywright";
import Button from './components/common/Button';
import Card from './components/common/Card';
import Field from './components/common/Field';
import Select from './components/common/Select';
import Status from './components/common/Status';
import Modal from './components/common/Modal';
import Confirm from './components/common/Confirm';
import Toast from './components/common/Toast';
import PortalShell from './components/layout/PortalShell';
import Page from './components/common/Page';
import HeadOverview from './components/pages/HeadOverview';
import Elections from './components/pages/Elections';
import Admins from './components/pages/Admins';
import AdminOverview from './components/pages/AdminOverview';
import Directory from './components/pages/Directory';
import SettingsPage from './components/pages/SettingsPage';
import Profile from './components/pages/Profile';



function Guard({ role, children }) { return localStorage.getItem(`${role}Token`) ? children : <Navigate to={role === 'head' ? '/head' : '/admin'} replace />; }
function useNotify() { const [toast, setToast] = useState(null); const notify = useCallback((message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); }, []); return [toast, notify, () => setToast(null)]; }

















const formatDate = v =>
  v ? new Date(v).toLocaleDateString() : '—';

const toInputDate = v =>
  v ? new Date(v).toISOString().slice(0, 16) : '';

export default function App(){const [toast,notify,clear]=useNotify();const shell=(role,el)=><Guard role={role}><PortalShell role={role}>{el}</PortalShell></Guard>;return <ElectionProvider><Routes><Route path="/" element={<><Nav/><Home/></>}/><Route path="/head" element={<><Nav/><HeadLogin/></>}/><Route path="/admin" element={<><Nav/><AdminLogin/></>}/><Route path="/head/dashboard" element={shell('head',<HeadOverview notify={notify}/>)}/><Route path="/head/election" element={shell('head',<Elections notify={notify}/>)}/><Route path="/head/viewAdmins" element={shell('head',<Admins notify={notify}/>)}/><Route path="/head/results" element={shell('head', <HeadResults />)}/><Route path="/head/settings" element={shell('head',<SettingsPage/>)}/><Route path="/admin/dashboard" element={shell('admin',<AdminOverview notify={notify}/>)}/><Route path="/admin/voters" element={shell('admin',<Directory kind="voter" notify={notify}/>)}/><Route path="/admin/candidate/view" element={shell('admin',<Directory kind="candidate" notify={notify}/>)}/><Route path="/admin/profile" element={shell('admin',<Profile notify={notify}/>)}/><Route
  path="/admin/results"
  element={shell('admin', <AdminResults />)}
/><Route path="*" element={<Navigate to="/" replace/>}/></Routes><Copyright /><Toast toast={toast} clear={clear}/></ElectionProvider>}  
