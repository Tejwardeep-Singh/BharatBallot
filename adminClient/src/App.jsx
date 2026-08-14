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


function PortalShell({ role, children }) {
  const location = useLocation(); const navigate = useNavigate(); const [open, setOpen] = useState(false);
  const items = role === 'head' ? [
    ['Overview', '/head/dashboard', LayoutDashboard], ['Election Management', '/head/election', CalendarDays], ['Manage Admins', '/head/viewAdmins', UserCog], ['Results', '/head/results', BarChart3],
  ] : [['Overview', '/admin/dashboard', LayoutDashboard],['Profile', '/admin/profile', UserCog], ['Manage Candidates', '/admin/candidate/view', Users], ['Manage Voters', '/admin/voters', UserPlus],['Results', '/admin/results', BarChart3] ];
  const logout = () => { localStorage.removeItem(`${role}Token`); navigate(role === 'head' ? '/head' : '/admin'); };
  return <div className="min-h-screen bg-[#f8fbff] text-slate-800"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur"><button className="mr-3 md:hidden" onClick={() => setOpen(!open)}><Menu /></button><Link to={role === 'head' ? '/head/dashboard' : '/admin/dashboard'} className="flex items-center gap-2 font-black text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">B</span><span>Bharat<span className="text-blue-600">Ballot</span></span></Link><div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500">{role === 'head' && <ElectionSelector />}<ShieldCheck size={16} className="text-emerald-600" />{role === 'head' ? 'HEAD PORTAL' : 'ADMIN PORTAL'}<button onClick={logout} className="ml-3 rounded-lg p-2 hover:bg-slate-100" title="Sign out"><LogOut size={16} /></button></div></header><div className="flex"><aside className={`${open ? 'block' : 'hidden'} fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 md:static md:block md:min-h-[calc(100vh-4rem)] md:w-64 md:border-b-0 md:border-r`}><nav className="space-y-1">{items.map(([label, path, Icon]) => <Link onClick={() => setOpen(false)} key={path} to={path} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide ${location.pathname === path ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={17} />{label}</Link>)}</nav></aside><main className="min-w-0 flex-1 p-5 md:p-8">{children}</main></div></div>;
}
function Guard({ role, children }) { return localStorage.getItem(`${role}Token`) ? children : <Navigate to={role === 'head' ? '/head' : '/admin'} replace />; }
function useNotify() { const [toast, setToast] = useState(null); const notify = useCallback((message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); }, []); return [toast, notify, () => setToast(null)]; }

function HeadOverview({ notify }) { const [data, setData] = useState({}); const [loading, setLoading] = useState(false); const navigate = useNavigate(); const { selectedElection } = useElection();
  useEffect(() => { if (!selectedElection) { setData({}); return; } setLoading(true); api(`/api/head/elections/${selectedElection._id}/dashboard`, { role: 'head' }).then(setData).catch(e => notify(e.message, 'error')).finally(() => setLoading(false)); }, [selectedElection, notify]);
  if (!selectedElection) return <Page title="System Overview" subtitle="A live view of Bharat Ballot administration."><Card className="text-center text-slate-500">Please select an election.</Card></Page>;
  const stats = data.statistics || {}; const cards = [['Selected Election', selectedElection.title, CalendarDays], ['Election Status', selectedElection.status, CheckCircle2], ['Total Constituencies', stats.constituencies || 0, FileText], ['Total Admins', stats.admins || 0, UserCog], ['Registered Voters', stats.voters || 0, Vote], ['Registered Candidates', stats.candidates || 0, Users]];
  return <Page title="System Overview" subtitle="A live view of Bharat Ballot administration."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, Icon]) => <Card key={label}><Icon size={18} className="mb-4 text-blue-600" /><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{loading ? '—' : value}</p></Card>)}</div><div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => navigate('/head/election')}><Plus size={15} />Create Election</Button><Button className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => navigate('/head/viewAdmins')}>Manage Admins</Button><Button className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => navigate('/head/results')}>View Results</Button></div></Page>; }
function Page({ title, subtitle, children, action }) { return <><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-black text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{action}</div>{children}</>; }


function Elections({ notify }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selectedType, setSelectedType] = useState("Assembly");

  const { refreshElections } = useElection();

  const load = useCallback(() => {
    api("/api/head/elections", { role: "head" })
      .then(setItems)
      .catch((e) => notify(e.message, "error"));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();

    const form = Object.fromEntries(new FormData(e.currentTarget));

    try {
      await api(
        `/api/head/elections${editor?._id ? `/${editor._id}` : ""}`,
        {
          role: "head",
          method: editor?._id ? "PUT" : "POST",
          body: form,
        }
      );

      setEditor(null);

      notify("Election saved successfully.");

      load();

      refreshElections().catch(() => {});
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const run = async () => {
    try {
      if (confirm.path === "/reset") {

    await api(
        `/api/head/elections/${confirm.id}/reset`,
        {
            role: "head",
            method: "DELETE",
        }
    );

} else {

    await api(
        `/api/head/elections/${confirm.id}${confirm.path}`,
        {
            role: "head",
            method: confirm.method,
        }
    );

}

      notify(confirm.success);

      setConfirm(null);

      load();

      refreshElections().catch(() => {});
    } catch (e) {
      notify(e.message, "error");
      setConfirm(null);
    }
  };

  const filtered = items.filter(
    (x) =>
      (status === "All" || x.status === status) &&
      `${x.title} ${x.type} ${x.state}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  const locationFields =
    electionConfig[selectedType] || {
      state: true,
      district: true,
      city: true,
    };

  return (
    <Page
      title="Election Management"
      subtitle="Create and control election lifecycles."
      action={
        <Button
          onClick={() => {
            setSelectedType("Assembly");
            setEditor({});
          }}
        >
          <Plus size={15} />
          Create Election
        </Button>
      }
    >
      {/* Search */}

      <div className="mb-4 flex flex-wrap gap-3">

        <div className="relative flex-1 min-w-56">

          <Search
            size={16}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
            placeholder="Search elections"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

        </div>

        <select
          className="rounded-xl border border-slate-200 bg-white px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["All", "Draft", "Active", "Completed", "Archived"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>

      </div>

      {/* Table */}

      <Card className="overflow-x-auto p-0">

        <table className="w-full text-left text-sm">

          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

            <tr>

              {[
                "Title",
                "Type",
                "Status",
                "State",
                "Start Date",
                "End Date",
                "Actions",
              ].map((x) => (
                <th
                  key={x}
                  className="whitespace-nowrap px-4 py-3"
                >
                  {x}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {filtered.map((x) => (

              <tr
                key={x._id}
                className="border-b last:border-0"
              >

                <td className="px-4 py-4 font-bold">
                  {x.title}
                </td>

                <td className="px-4 py-4">
                  {x.type}
                </td>

                <td className="px-4 py-4">
                  <Status>{x.status}</Status>
                </td>

                <td className="px-4 py-4">
                  {x.state || "—"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {formatDate(x.startDate)}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {formatDate(x.endDate)}
                </td>

                {/* ACTIONS */}

                <td className="px-4 py-4 whitespace-nowrap">

                  {/* Draft */}

                  {x.status === "Draft" && (
                    <>

                      <button
                        className="mr-2 text-blue-600"
                        onClick={() => {
                          setSelectedType(x.type);
                          setEditor(x);
                        }}
                        title="Edit Election"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        className="mr-2 text-emerald-600"
                        onClick={() =>
                          setConfirm({
                            id: x._id,
                            path: "/activate",
                            method: "POST",
                            success: "Election activated.",
                          })
                        }
                      >
                        Activate
                      </button>

                      <button
                        className="text-red-600"
                        onClick={() =>
                          setConfirm({
                            id: x._id,
                            path: "",
                            method: "DELETE",
                            success: "Draft election deleted.",
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </>
                  )}

                  {/* Active */}

                  {x.status === "Active" && (
                    <span className="text-xs font-semibold text-emerald-600">
                      Election Running
                    </span>
                  )}

                  {/* Completed */}

                  {x.status === "Completed" && (
                    <>
                      {!x.resultVisible ? (
                        <button
                          className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                          onClick={() =>
                            setConfirm({
                              id: x._id,
                              path: "/publish-results",
                              method: "POST",
                              success:
                                "Results published successfully.",
                            })
                          }
                        >
                          Publish Results
                        </button>
                      ) : (
                        <>
                          <span className="mr-2 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            ✓ Published
                          </span>

                          <button
    className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
    onClick={() =>
        setConfirm({
            id: x._id,
            path: "/reset",
            method: "DELETE",
            success: "Election reset successfully.",
        })
    }
>
    Reset Election
</button>
                        </>
                      )}
                    </>
                  )}

                  {/* Archived */}

                  {x.status === "Archived" && (
                    <span className="text-xs text-slate-400">
                      No Actions
                    </span>
                  )}

                </td>

              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan="7"
                  className="p-8 text-center text-slate-500"
                >
                  No elections match the selected filters.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </Card>

      {/* Modal */}

      {editor && (
        <Modal
          title={editor._id ? "Edit Election" : "Create Election"}
          onClose={() => setEditor(null)}
        >
          <form onSubmit={save} className="space-y-4">

  <Field
    label="Election Title"
    name="title"
    required
    defaultValue={editor.title}
  />

  <Select
    label="Election Type"
    name="type"
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value)}
  >
    {Object.keys(electionConfig).map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </Select>

  {locationFields.state && (
    <Field
      label="State"
      name="state"
      required
      defaultValue={editor.state}
    />
  )}

  {locationFields.district && (
    <Field
      label="District"
      name="district"
      required
      defaultValue={editor.district}
    />
  )}

  {locationFields.city && (
    <Field
      label="City"
      name="city"
      required
      defaultValue={editor.city}
    />
  )}

  <div className="grid grid-cols-2 gap-3">

    <Field
      label="Start Date & Time"
      name="startDate"
      type="datetime-local"
      required
      defaultValue={toInputDate(editor.startDate)}
    />

    <Field
      label="End Date & Time"
      name="endDate"
      type="datetime-local"
      required
      defaultValue={toInputDate(editor.endDate)}
    />

  </div>

  <div className="flex justify-end gap-2">

    <Button
      type="button"
      className="bg-slate-100 text-slate-700"
      onClick={() => setEditor(null)}
    >
      Cancel
    </Button>

    <Button type="submit">
      {editor._id ? "Update Election" : "Create Election"}
    </Button>

  </div>

</form>
        </Modal>
      )}

      {/* Confirmation */}

      {confirm && (
        <Confirm
    title={
        confirm.path === "/reset"
            ? "Reset Election?"
            : "Confirm Action"
    }
    text={
        confirm.path === "/reset"
            ? `This will permanently delete:

• Election
• Candidates
• Admins
• Constituencies
• Participation Records

Voters, Face Profiles and Master Constituencies will NOT be deleted.

This action cannot be undone.`
            : "This action cannot be undone."
    }
    onClose={() => setConfirm(null)}
    onConfirm={run}
/>
      )}
    </Page>
  );
}
function Admins({ notify }) { const [admins, setAdmins] = useState([]),
   [query, setQuery] = useState(''), [editor, setEditor] = useState(null), 
   [confirm, setConfirm] = useState(null); const { selectedElection } = useElection();   
   const load = useCallback(() => { if (!selectedElection) { setAdmins([]); return Promise.resolve(); } return api(`/api/head/view?electionId=${selectedElection._id}`,{role:'head'}).then(setAdmins).catch(e=>notify(e.message,'error')); },[selectedElection,notify]); useEffect(()=>{load()},[load]);
   const save = async ev => { ev.preventDefault(); const f=Object.fromEntries(new FormData(ev.currentTarget)); try { await api(editor?._id?`/api/head/edit/${editor._id}`:'/api/head/add',{role:'head',method:editor?._id?'PUT':'POST',body:f}); notify('Administrator saved successfully.');setEditor(null);load(); }catch(e){notify(e.message,'error')} }; const filtered = admins.filter(a =>
  `${a.name}
   ${a.userId}
   ${a.electionId?.title || ""}
   ${a.constituencyId?.constituencyName || ""}
   ${a.constituencyId?.constituencyNumber || ""}`
    .toLowerCase()
    .includes(query.toLowerCase())
); if (!selectedElection) return <Page title="Manage Admins" subtitle="Assign administrators to an election and constituency."><Card className="text-center text-slate-500">Please select an election.</Card></Page>; return <Page title="Manage Admins" subtitle="Assign administrators to an election and constituency." action={<Button onClick={()=>setEditor({})}><UserPlus size={15}/>Add admin</Button>}><div className="relative mb-4 max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search administrators" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"/></div><Card className="overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Name','Email / User ID','Election','Constituency','Status','Actions'].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{filtered.map(a=><tr className="border-b" key={a._id}><td className="px-4 py-4 font-bold">{a.name}</td><td className="px-4 py-4">{a.userId}</td><td className="px-4 py-4">{a.electionId?.title || "—"}</td><td className="px-4 py-4">{a.constituencyId ? (
    <>
      <div className="font-semibold text-slate-900">
        {a.constituencyId.constituencyName}
      </div>
      <div className="text-xs text-slate-500">
        Constituency #{a.constituencyId.constituencyNumber}
      </div>
    </>
  ) : (
    "—"
  )}</td><td className="px-4 py-4"><Status>active</Status></td><td className="px-4 py-4"><button className="mr-3 text-blue-600" onClick={()=>setEditor(a)}><Edit3 size={16}/></button><button className="text-red-600" onClick={()=>setConfirm(a)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></Card>{editor&&<AdminForm editor={editor} election={selectedElection} save={save} close={()=>setEditor(null)}/>} {confirm&&<Confirm title="Delete administrator?" text="Their portal access will be removed." onClose={()=>setConfirm(null)} onConfirm={async()=>{try{await api(`/api/head/delete/${confirm._id}`,{role:'head',method:'DELETE'});notify('Administrator deleted.');setConfirm(null);load()}catch(e){notify(e.message,'error')}}}/>}</Page>; }







   function AdminForm({editor,election,save,close}) { const initialConstituency = editor.constituencyId?._id || editor.constituencyId || ''; const [constituencies,setConstituencies]=useState([]),[constituency,setConstituency]=useState(initialConstituency); useEffect(()=>{let active=true; setConstituency(initialConstituency); api(`/api/constituencies/election/${election._id}`,{role:'head'}).then(data=>{if(active)setConstituencies(data)}).catch(()=>{if(active)setConstituencies([])}); return()=>{active=false};},[election, initialConstituency]); return <Modal title={editor._id?'Edit Administrator':'Add Administrator'} onClose={close}><form onSubmit={save} className="space-y-4"><div className="grid grid-cols-2 gap-3"><Field label="Name" name="name" required defaultValue={editor.name}/><Field label="Email / User ID" name="userId" required defaultValue={editor.userId}/></div><Field label="Password (leave blank to keep current)" name="password" type="password" required={!editor._id}/><input type="hidden" name="electionId" value={election._id}/><p className="text-sm text-slate-500">Election: <b>{election.title}</b></p>
   <Select label="Constituency" name="constituencyId" required value={constituency} onChange={e=>setConstituency(e.target.value)} disabled={!constituencies.length}><option value="">{!constituencies.length?'No constituencies available':'Select constituency'}</option>{constituencies.map(c=><option value={c._id} key={c._id}>{`${c.constituencyNumber} - ${c.constituencyName}`}</option>)}</Select><div className="flex justify-end gap-2"><Button type="button" className="bg-slate-100 text-slate-700" onClick={close}>Cancel</Button><Button type="submit">Save admin</Button></div></form></Modal>; }

function AdminOverview({notify}) { const [data,setData]=useState({}); const navigate=useNavigate(); useEffect(()=>{Promise.all([api('/api/admin/me',{role:'admin'}),api('/api/admin/voter/view',{role:'admin'}),api('/api/admin/candidate/view',{role:'admin'})]).then(([me,voters,candidates])=>setData({me,voters,candidates})).catch(e=>notify(e.message,'error'))},[notify]); const cards=[['Assigned Election',data.me?.election?.title||'Assigned election',CalendarDays],['Assigned Constituency',data.me?.constituency?.name || "—"|'—',FileText],['Registered Voters',data.voters?.length||0,UserPlus],['Registered Candidates',data.candidates?.length||0,Users],['Election Status',data.me?.election?.status||'—',CheckCircle2]];return <Page title="Admin Overview" subtitle="Your assigned election and constituency."><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([l,v,I])=><Card key={l}><I className="mb-4 text-blue-600" size={18}/><p className="text-xs font-bold uppercase text-slate-400">{l}</p><p className="mt-1 text-xl font-black">{v}</p></Card>)}</div><div className="mt-5 flex gap-3"><Button onClick={()=>navigate('/admin/voters')}>Register Voter</Button><Button className="border border-slate-200 bg-white text-slate-700" onClick={()=>navigate('/admin/candidate/view')}>Register Candidate</Button></div></Page> }


function Directory({kind,notify}) { const role='admin', isVoter=kind==='voter'; const [items,setItems]=useState([]),[query,setQuery]=useState(''),[editor,setEditor]=useState(null),[confirm,setConfirm]=useState(null),[declaration,setDeclaration]=useState(null);; const load=useCallback(()=>api(`/api/admin/${isVoter?'voter':'candidate'}/view`,{role}).then(setItems).catch(e=>notify(e.message,'error')),[isVoter,notify]);useEffect(()=>{load()},[load]);
const save = async (ev) => {
  ev.preventDefault();

  const fd = new FormData(ev.currentTarget);

  try {
    if (isVoter) {
      if (editor?._id) {
        await api(`/api/admin/voter/edit/${editor._id}`, {
          role,
          method: "PUT",
          body: Object.fromEntries(fd),
        });
      } else {
        await api("/api/admin/register-admin", {
          role,
          method: "POST",
          form: fd,
        });
      }
    } else {
      if (editor?._id) {
        await api(`/api/admin/candidate/edit/${editor._id}`, {
          role,
          method: "PUT",
          form: fd,
        });
      } else {
        await api("/api/admin/candidate/add", {
          role,
          method: "POST",
          form: fd,
        });
      }
    }

    notify(`${isVoter ? "Voter" : "Candidate"} saved successfully.`);
    setEditor(null);
    load();
  } catch (e) {
    notify(e.message, "error");
  }
};
 
 const filtered = items.filter(
    x =>
`${x.name}
${x.epicNumber || x.id}
${x.constituencyId?.constituencyName || ""}
${x.constituencyId?.constituencyNumber || ""}`.toLowerCase().includes(query.toLowerCase()));return <Page title={`Manage ${isVoter?'Voters':'Candidates'}`} subtitle={isVoter?'Manage registered voters in your constituency.':'Manage candidates in your constituency.'}action={
    !isVoter && (
        <Button onClick={() => setEditor({})}>
            <Plus size={15} />
            Register Candidate
        </Button>
    )
}><div className="relative mb-4 max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${isVoter?'name or EPIC number':'candidate or constituency'}`} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"/></div><Card className="overflow-x-auto p-0"><table className="w-full text-left text-sm">
  <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
  {isVoter ? (
    <tr>
      <th className="px-4 py-3">Photo</th>
      <th className="px-4 py-3">EPIC Number</th>
      <th className="px-4 py-3">Name</th>
      <th className="px-4 py-3">Voting Status</th>
      <th className="px-4 py-3">Actions</th>
    </tr>
  ) : (
    <tr>
      <th className="px-4 py-3">Photo</th>
      <th className="px-4 py-3">Candidate Name</th>
      <th className="px-4 py-3">ID</th>
      <th className="px-4 py-3">Criminal Declaration</th>
      <th className="px-4 py-3">Actions</th>
    </tr>
  )}
</thead>
  <tbody>
  {filtered.map((x) => (
    <tr className="border-b" key={x._id}>
      {/* Photo */}
      <td className="px-4 py-3">
        {isVoter ? (
          x.photo?.original ? (
            <img
              className="h-9 w-9 rounded-full object-cover"
              src={`http://localhost:3000/${x.photo.original}`}
              alt={x.name}
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100">
              <Users size={14} />
            </span>
          )
        ) : x.candidateImage ? (
          <img
            className="h-9 w-9 rounded-full object-cover"
            src={x.candidateImage}
            alt={x.name}
          />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100">
            <Users size={14} />
          </span>
        )}
      </td>

      {/* EPIC Number / Candidate Name */}
      <td className="px-4 py-3 font-bold">
        {isVoter ? x.epicNumber : x.name}
      </td>

      {/* Name / Candidate ID */}
      <td className="px-4 py-3">
        {isVoter ? x.name : (x.id || "—")}
      </td>

      {/* Voting Status / Crimminal Cases */}
      <td className="px-4 py-3">
        {isVoter ? (
          <Status>{x.votingStatus}</Status>
        ) :<button
  className="inline-flex items-center gap-1 rounded-lg  bg-white px-3 py-1.5 text-xs font-semibold text-slate-700  transition hover:border-blue-300 hover:text-blue-700"
  onClick={() => setDeclaration(x)}
>
  <FileText size={14} />
  View
</button>}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <button
          className="mr-3 text-blue-600"
          onClick={() => setEditor(x)}
        >
          <Edit3 size={16} />
        </button>

        <button
          className="text-red-600"
          onClick={() => setConfirm(x)}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  ))}

  {!filtered.length && (
    <tr>
      <td colSpan="5" className="p-8 text-center text-slate-500">
        No records found.
      </td>
    </tr>
  )}
</tbody>
</table></Card>{editor&&<RecordForm isVoter={isVoter} editor={editor} save={save} close={()=>setEditor(null)}/>} {confirm&&<Confirm title={`Delete ${isVoter?'voter':'candidate'}?`} text="This record will be permanently removed." onClose={()=>setConfirm(null)} onConfirm={async()=>{try{await api(`/api/admin/${isVoter?'voter/delete':'candidate/delete'}/${confirm._id}`,{role,method:'DELETE'});notify('Record deleted.');setConfirm(null);load()}catch(e){notify(e.message,'error')}}}/>}
  {declaration && (
  <Modal
    title={`Criminal Declaration - ${declaration.name}`}
    onClose={() => setDeclaration(null)}
  >
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 whitespace-pre-wrap text-sm">
        {declaration.criminalCase || "No criminal declaration submitted."}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setDeclaration(null)}>
          Close
        </Button>
      </div>
    </div>
  </Modal>
)}
</Page> }


function RecordForm({ isVoter, editor, save, close, admin }) {

  return (

    <Modal
      title={`${editor._id ? "Edit" : "Register"} ${isVoter ? " Voter" : " Candidate"}`}
      onClose={close}
    >

      <form
        onSubmit={save}
        className="space-y-5"
      >

        {isVoter ? (

          <>

            {/* Personal Information */}

            <div>

              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Field
                  label="Full Name"
                  name="name"
                  required
                  defaultValue={editor.name}
                />

                <Field
                  label="EPIC Number"
                  name="epicNumber"
                  required
                  defaultValue={editor.epicNumber}
                />

                <Field
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  required
                />

                <Select
                  label="Gender"
                  name="gender"
                  defaultValue={editor.gender || "Male"}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>

                <Field
                  label="Guardian Name"
                  name="guardianName"
                  required
                />

                <Field
                  label="Mobile Number"
                  name="mobile"
                  required
                />

              </div>

            </div>

            {/* Address & Photo */}

            <div>

              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Address & Photograph
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Field
                  label="House Number"
                  name="houseNo"
                />

                <Field
                  label="Street"
                  name="street"
                />

                <Field
                  label="Pincode"
                  name="pincode"
                />

                <Field
                  label="Photograph"
                  name="photo"
                  type="file"
                  accept="image/*"
                  required={!editor._id}
                />

              </div>

            </div>

            {/* Assigned Area */}

            <div>

              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Assigned Area
              </h3>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="grid grid-cols-3 gap-4 text-center">

                  <div>

                    <p className="text-xs uppercase text-slate-500">
                      State
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {admin?.state || "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase text-slate-500">
                      District
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {admin?.district || "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase text-slate-500">
                      City
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {admin?.city || "-"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Status & Account */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Select
                label="Account Status"
                name="status"
                defaultValue={editor.status || "active"}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="suspended">
                  Suspended
                </option>

              </Select>

              {!editor._id && (

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                  <h4 className="font-semibold text-blue-900">
                    Automatic Registration
                  </h4>

                  <ul className="mt-2 list-disc pl-5 text-sm text-blue-800 space-y-1">

                    <li>User ID = EPIC Number</li>

                    <li>Password generated automatically</li>

                    <li>Photo processed automatically</li>

                    <li>Face biometric enrolled automatically</li>

                  </ul>

                </div>

              )}

            </div>

          </>

        ) : (

          <>

            <div className="grid grid-cols-2 gap-3">

              <Field
                label="Name"
                name="name"
                required
                defaultValue={editor.name}
              />

              <Field
                label="Candidate ID"
                name="id"
                required={!editor._id}
                defaultValue={editor.id}
              />

            </div>

            <Field
              label="Criminal Case / Declaration"
              name="criminalCase"
              defaultValue={editor.criminalCase}
            />

            {!editor._id && (

              <div className="grid grid-cols-2 gap-3">

                <Field
                  label="Candidate Photo"
                  name="candidateImage"
                  type="file"
                  accept="image/*"
                  required
                />

                <Field
                  label="Party Symbol"
                  name="partyImage"
                  type="file"
                  accept="image/*"
                  required
                />

              </div>

            )}

          </>

        )}

        <div className="flex justify-end gap-3 pt-2">

          <Button
            type="button"
            className="bg-slate-100 text-slate-700"
            onClick={close}
          >
            Cancel
          </Button>

          <Button type="submit">

            {editor._id ? "Update" : "Register"}

          </Button>

        </div>

      </form>

    </Modal>

  );

}
function SettingsPage(){return <Page title="System Settings" subtitle="Maintain core election-system settings."><div className="max-w-3xl space-y-4"><Card><h2 className="font-bold">Results publication</h2><p className="mt-1 text-sm text-slate-500">Publish results only after the election has been completed and verified.</p></Card><Card><h2 className="font-bold">Security controls</h2><p className="mt-1 text-sm text-slate-500">Administrator permissions are assigned through election and constituency assignments.</p></Card></div></Page>}
function Profile({notify}){const [me,setMe]=useState(null);useEffect(()=>{api('/api/admin/me',{role:'admin'}).then(setMe).catch(e=>notify(e.message,'error'))},[notify]);return <Page title="Profile" subtitle="Your assigned election and constituency."><Card className="max-w-2xl"><div className="grid gap-4 sm:grid-cols-2"><p><b>Name</b><br/>{me?.name||'—'}</p><p><b>Email / User ID</b><br/>{me?.userId||'—'}</p><p><b>Assigned election</b><br/>{me?.election?.title||'—'}</p><p><b>Assigned constituency</b><br/>{me?.constituency?.name||me?.address?.area||'—'}</p></div><p className="mt-6 border-t pt-5 text-sm text-slate-500">Password and profile-image updates are ready for the administrator profile API.</p></Card></Page>}
const formatDate = v =>
  v ? new Date(v).toLocaleDateString() : '—';

const toInputDate = v =>
  v ? new Date(v).toISOString().slice(0, 16) : '';

export default function App(){const [toast,notify,clear]=useNotify();const shell=(role,el)=><Guard role={role}><PortalShell role={role}>{el}</PortalShell></Guard>;return <ElectionProvider><Routes><Route path="/" element={<><Nav/><Home/></>}/><Route path="/head" element={<><Nav/><HeadLogin/></>}/><Route path="/admin" element={<><Nav/><AdminLogin/></>}/><Route path="/head/dashboard" element={shell('head',<HeadOverview notify={notify}/>)}/><Route path="/head/election" element={shell('head',<Elections notify={notify}/>)}/><Route path="/head/viewAdmins" element={shell('head',<Admins notify={notify}/>)}/><Route path="/head/results" element={shell('head', <HeadResults />)}/><Route path="/head/settings" element={shell('head',<SettingsPage/>)}/><Route path="/admin/dashboard" element={shell('admin',<AdminOverview notify={notify}/>)}/><Route path="/admin/voters" element={shell('admin',<Directory kind="voter" notify={notify}/>)}/><Route path="/admin/candidate/view" element={shell('admin',<Directory kind="candidate" notify={notify}/>)}/><Route path="/admin/profile" element={shell('admin',<Profile notify={notify}/>)}/><Route
  path="/admin/results"
  element={shell('admin', <AdminResults />)}
/><Route path="*" element={<Navigate to="/" replace/>}/></Routes><Copyright /><Toast toast={toast} clear={clear}/></ElectionProvider>}  
