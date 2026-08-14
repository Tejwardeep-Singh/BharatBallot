import { useCallback, useEffect, useState } from 'react';
import {
  Edit3,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';

import { useElection } from '../../context/ElectionContext';
import { api } from '../../services/api';

import Button from '../common/Button';
import Card from '../common/Card';
import Confirm from '../common/Confirm';
import Field from '../common/Field';
import Modal from '../common/Modal';
import Page from '../common/Page';
import Select from '../common/Select';
import Status from '../common/Status';

function Admins({ notify }) {
  const [admins, setAdmins] = useState([]);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { selectedElection } = useElection();

  const load = useCallback(() => {
    if (!selectedElection) {
      setAdmins([]);
      return Promise.resolve();
    }

    return api(
      `/api/head/view?electionId=${selectedElection._id}`,
      { role: 'head' }
    )
      .then(setAdmins)
      .catch(e => notify(e.message, 'error'));
  }, [selectedElection, notify]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (ev) => {
    ev.preventDefault();

    const f = Object.fromEntries(
      new FormData(ev.currentTarget)
    );

    try {
      await api(
        editor?._id
          ? `/api/head/edit/${editor._id}`
          : '/api/head/add',
        {
          role: 'head',
          method: editor?._id ? 'PUT' : 'POST',
          body: f,
        }
      );

      notify('Administrator saved successfully.');
      setEditor(null);
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const filtered = admins.filter(a =>
    `${a.name}
     ${a.userId}
     ${a.electionId?.title || ''}
     ${a.constituencyId?.constituencyName || ''}
     ${a.constituencyId?.constituencyNumber || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  if (!selectedElection) {
    return (
      <Page
        title="Manage Admins"
        subtitle="Assign administrators to an election and constituency."
      >
        <Card className="text-center text-slate-500">
          Please select an election.
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Manage Admins"
      subtitle="Assign administrators to an election and constituency."
      action={
        <Button onClick={() => setEditor({})}>
          <UserPlus size={15} />
          Add admin
        </Button>
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
          placeholder="Search administrators"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {[
                'Name',
                'Email / User ID',
                'Election',
                'Constituency',
                'Status',
                'Actions',
              ].map(x => (
                <th
                  key={x}
                  className="px-4 py-3"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map(a => (
              <tr
                className="border-b"
                key={a._id}
              >
                <td className="px-4 py-4 font-bold">
                  {a.name}
                </td>

                <td className="px-4 py-4">
                  {a.userId}
                </td>

                <td className="px-4 py-4">
                  {a.electionId?.title || '—'}
                </td>

                <td className="px-4 py-4">
                  {a.constituencyId ? (
                    <>
                      <div className="font-semibold text-slate-900">
                        {a.constituencyId.constituencyName}
                      </div>

                      <div className="text-xs text-slate-500">
                        Constituency #
                        {a.constituencyId.constituencyNumber}
                      </div>
                    </>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="px-4 py-4">
                  <Status>active</Status>
                </td>

                <td className="px-4 py-4">
                  <button
                    className="mr-3 text-blue-600"
                    onClick={() => setEditor(a)}
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    className="text-red-600"
                    onClick={() => setConfirm(a)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editor && (
        <AdminForm
          editor={editor}
          election={selectedElection}
          save={save}
          close={() => setEditor(null)}
        />
      )}

      {confirm && (
        <Confirm
          title="Delete administrator?"
          text="Their portal access will be removed."
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            try {
              await api(
                `/api/head/delete/${confirm._id}`,
                {
                  role: 'head',
                  method: 'DELETE',
                }
              );

              notify('Administrator deleted.');
              setConfirm(null);
              load();
            } catch (e) {
              notify(e.message, 'error');
            }
          }}
        />
      )}
    </Page>
  );
}

function AdminForm({
  editor,
  election,
  save,
  close,
}) {
  const initialConstituency =
    editor.constituencyId?._id ||
    editor.constituencyId ||
    '';

  const [constituencies, setConstituencies] =
    useState([]);

  const [constituency, setConstituency] =
    useState(initialConstituency);

  useEffect(() => {
    let active = true;

    setConstituency(initialConstituency);

    api(
      `/api/constituencies/election/${election._id}`,
      { role: 'head' }
    )
      .then(data => {
        if (active) {
          setConstituencies(data);
        }
      })
      .catch(() => {
        if (active) {
          setConstituencies([]);
        }
      });

    return () => {
      active = false;
    };
  }, [election, initialConstituency]);

  return (
    <Modal
      title={
        editor._id
          ? 'Edit Administrator'
          : 'Add Administrator'
      }
      onClose={close}
    >
      <form
        onSubmit={save}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Name"
            name="name"
            required
            defaultValue={editor.name}
          />

          <Field
            label="Email / User ID"
            name="userId"
            required
            defaultValue={editor.userId}
          />
        </div>

        <Field
          label="Password (leave blank to keep current)"
          name="password"
          type="password"
          required={!editor._id}
        />

        <input
          type="hidden"
          name="electionId"
          value={election._id}
        />

        <p className="text-sm text-slate-500">
          Election: <b>{election.title}</b>
        </p>

        <Select
          label="Constituency"
          name="constituencyId"
          required
          value={constituency}
          onChange={e =>
            setConstituency(e.target.value)
          }
          disabled={!constituencies.length}
        >
          <option value="">
            {!constituencies.length
              ? 'No constituencies available'
              : 'Select constituency'}
          </option>

          {constituencies.map(c => (
            <option
              value={c._id}
              key={c._id}
            >
              {`${c.constituencyNumber} - ${c.constituencyName}`}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            className="bg-slate-100 text-slate-700"
            onClick={close}
          >
            Cancel
          </Button>

          <Button type="submit">
            Save admin
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default Admins;