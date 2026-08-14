import { useCallback, useEffect, useState } from 'react';
import {
  Edit3,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import electionConfig from '../../config/electionConfig';
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

function Elections({ notify }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selectedType, setSelectedType] = useState('Assembly');

  const { refreshElections } = useElection();

  const load = useCallback(() => {
    api('/api/head/elections', { role: 'head' })
      .then(setItems)
      .catch((e) => notify(e.message, 'error'));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();

    const form = Object.fromEntries(
      new FormData(e.currentTarget)
    );

    try {
      await api(
        `/api/head/elections${
          editor?._id ? `/${editor._id}` : ''
        }`,
        {
          role: 'head',
          method: editor?._id ? 'PUT' : 'POST',
          body: form,
        }
      );

      setEditor(null);

      notify('Election saved successfully.');

      load();

      refreshElections().catch(() => {});
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const run = async () => {
    try {
      if (confirm.path === '/reset') {
        await api(
          `/api/head/elections/${confirm.id}/reset`,
          {
            role: 'head',
            method: 'DELETE',
          }
        );
      } else {
        await api(
          `/api/head/elections/${confirm.id}${confirm.path}`,
          {
            role: 'head',
            method: confirm.method,
          }
        );
      }

      notify(confirm.success);

      setConfirm(null);

      load();

      refreshElections().catch(() => {});
    } catch (e) {
      notify(e.message, 'error');
      setConfirm(null);
    }
  };

  const filtered = items.filter(
    (x) =>
      (status === 'All' || x.status === status) &&
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
            setSelectedType('Assembly');
            setEditor({});
          }}
        >
          <Plus size={15} />
          Create Election
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
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
          {['All', 'Draft', 'Active', 'Completed', 'Archived'].map(
            (x) => (
              <option key={x}>{x}</option>
            )
          )}
        </select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {[
                'Title',
                'Type',
                'Status',
                'State',
                'Start Date',
                'End Date',
                'Actions',
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
                  {x.state || '—'}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {formatDate(x.startDate)}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {formatDate(x.endDate)}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {x.status === 'Draft' && (
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
                            path: '/activate',
                            method: 'POST',
                            success: 'Election activated.',
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
                            path: '',
                            method: 'DELETE',
                            success: 'Draft election deleted.',
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}

                  {x.status === 'Active' && (
                    <span className="text-xs font-semibold text-emerald-600">
                      Election Running
                    </span>
                  )}

                  {x.status === 'Completed' && (
                    <>
                      {!x.resultVisible ? (
                        <button
                          className="mr-2 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                          onClick={() =>
                            setConfirm({
                              id: x._id,
                              path: '/publish-results',
                              method: 'POST',
                              success:
                                'Results published successfully.',
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
                                path: '/reset',
                                method: 'DELETE',
                                success:
                                  'Election reset successfully.',
                              })
                            }
                          >
                            Reset Election
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {x.status === 'Archived' && (
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

      {editor && (
        <Modal
          title={
            editor._id
              ? 'Edit Election'
              : 'Create Election'
          }
          onClose={() => setEditor(null)}
        >
          <form
            onSubmit={save}
            className="space-y-4"
          >
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
              onChange={(e) =>
                setSelectedType(e.target.value)
              }
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
                defaultValue={toInputDate(
                  editor.startDate
                )}
              />

              <Field
                label="End Date & Time"
                name="endDate"
                type="datetime-local"
                required
                defaultValue={toInputDate(
                  editor.endDate
                )}
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
                {editor._id
                  ? 'Update Election'
                  : 'Create Election'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {confirm && (
        <Confirm
          title={
            confirm.path === '/reset'
              ? 'Reset Election?'
              : 'Confirm Action'
          }
          text={
            confirm.path === '/reset'
              ? `This will permanently delete:

• Election
• Candidates
• Admins
• Constituencies
• Participation Records

Voters, Face Profiles and Master Constituencies will NOT be deleted.

This action cannot be undone.`
              : 'This action cannot be undone.'
          }
          onClose={() => setConfirm(null)}
          onConfirm={run}
        />
      )}
    </Page>
  );
}

const formatDate = (v) =>
  v ? new Date(v).toLocaleDateString() : '—';

const toInputDate = (v) =>
  v ? new Date(v).toISOString().slice(0, 16) : '';

export default Elections;