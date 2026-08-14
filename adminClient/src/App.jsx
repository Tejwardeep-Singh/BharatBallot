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



function Guard({ role, children }) { return localStorage.getItem(`${role}Token`) ? children : <Navigate to={role === 'head' ? '/head' : '/admin'} replace />; }
function useNotify() { const [toast, setToast] = useState(null); const notify = useCallback((message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 4000); }, []); return [toast, notify, () => setToast(null)]; }








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
