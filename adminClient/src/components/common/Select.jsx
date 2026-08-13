export default function Select({ label, children, ...props }) {
  return (
    <label className="block text-xs font-bold text-slate-600">
      {label}
      <select
        {...props}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
      >
        {children}
      </select>
    </label>
  );
}