import { useCallback, useEffect, useState } from 'react';
import {
  Edit3,
  FileText,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

import { api } from '../../services/api';

import Button from '../common/Button';
import Card from '../common/Card';
import Confirm from '../common/Confirm';
import Field from '../common/Field';
import Modal from '../common/Modal';
import Page from '../common/Page';
import Select from '../common/Select';
import Status from '../common/Status';

function Directory({ kind, notify }) {
  const role = 'admin';
  const isVoter = kind === 'voter';

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [declaration, setDeclaration] = useState(null);

  const load = useCallback(
    () =>
      api(
        `/api/admin/${isVoter ? 'voter' : 'candidate'}/view`,
        { role }
      )
        .then(setItems)
        .catch(e => notify(e.message, 'error')),
    [isVoter, notify]
  );

  useEffect(() => {
    load();
  }, [load]);

  const save = async ev => {
    ev.preventDefault();

    const fd = new FormData(ev.currentTarget);

    try {
      if (isVoter) {
        if (editor?._id) {
          await api(`/api/admin/voter/edit/${editor._id}`, {
            role,
            method: 'PUT',
            body: Object.fromEntries(fd),
          });
        } else {
          await api('/api/admin/register-admin', {
            role,
            method: 'POST',
            form: fd,
          });
        }
      } else {
        if (editor?._id) {
          await api(
            `/api/admin/candidate/edit/${editor._id}`,
            {
              role,
              method: 'PUT',
              form: fd,
            }
          );
        } else {
          await api('/api/admin/candidate/add', {
            role,
            method: 'POST',
            form: fd,
          });
        }
      }

      notify(
        `${isVoter ? 'Voter' : 'Candidate'} saved successfully.`
      );

      setEditor(null);
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const filtered = items.filter(
    x =>
      `${x.name}
       ${x.epicNumber || x.id}
       ${x.constituencyId?.constituencyName || ''}
       ${x.constituencyId?.constituencyNumber || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <Page
      title={`Manage ${isVoter ? 'Voters' : 'Candidates'}`}
      subtitle={
        isVoter
          ? 'Manage registered voters in your constituency.'
          : 'Manage candidates in your constituency.'
      }
      action={
        !isVoter && (
          <Button onClick={() => setEditor({})}>
            <Plus size={15} />
            Register Candidate
          </Button>
        )
      }
    >
      <div className="relative mb-4 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-3 text-slate-400"
        />

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={
            isVoter
              ? 'Search name or EPIC number'
              : 'Search candidate or constituency'
          }
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
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
                <th className="px-4 py-3">
                  Criminal Declaration
                </th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            )}
          </thead>

          <tbody>
            {filtered.map(x => (
              <tr
                className="border-b"
                key={x._id}
              >
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

                <td className="px-4 py-3 font-bold">
                  {isVoter ? x.epicNumber : x.name}
                </td>

                <td className="px-4 py-3">
                  {isVoter ? x.name : x.id || '—'}
                </td>

                <td className="px-4 py-3">
                  {isVoter ? (
                    <Status>{x.votingStatus}</Status>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                      onClick={() => setDeclaration(x)}
                    >
                      <FileText size={14} />
                      View
                    </button>
                  )}
                </td>

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
                <td
                  colSpan="5"
                  className="p-8 text-center text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {editor && (
        <RecordForm
          isVoter={isVoter}
          editor={editor}
          save={save}
          close={() => setEditor(null)}
        />
      )}

      {confirm && (
        <Confirm
          title={`Delete ${isVoter ? 'voter' : 'candidate'}?`}
          text="This record will be permanently removed."
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            try {
              await api(
                `/api/admin/${
                  isVoter
                    ? 'voter/delete'
                    : 'candidate/delete'
                }/${confirm._id}`,
                {
                  role,
                  method: 'DELETE',
                }
              );

              notify('Record deleted.');
              setConfirm(null);
              load();
            } catch (e) {
              notify(e.message, 'error');
            }
          }}
        />
      )}

      {declaration && (
        <Modal
          title={`Criminal Declaration - ${declaration.name}`}
          onClose={() => setDeclaration(null)}
        >
          <div className="space-y-4">
            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              {declaration.criminalCase ||
                'No criminal declaration submitted.'}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setDeclaration(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  );
}

function RecordForm({
  isVoter,
  editor,
  save,
  close,
  admin,
}) {
  return (
    <Modal
      title={`${editor._id ? 'Edit' : 'Register'} ${
        isVoter ? ' Voter' : ' Candidate'
      }`}
      onClose={close}
    >
      <form
        onSubmit={save}
        className="space-y-5"
      >
        {isVoter ? (
          <>
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  defaultValue={
                    editor.gender || 'Male'
                  }
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

            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Address & Photograph
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      {admin?.state || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      District
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {admin?.district || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      City
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {admin?.city || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Account Status"
                name="status"
                defaultValue={
                  editor.status || 'active'
                }
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

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-800">
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
            {editor._id ? 'Update' : 'Register'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default Directory;