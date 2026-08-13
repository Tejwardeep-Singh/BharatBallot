export default function Status({ children }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
        children === 'Active' ||
        children === 'active' ||
        children === 'voted'
          ? 'bg-emerald-50 text-emerald-700'
          : children === 'Draft' ||
            children === 'not_voted'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {String(children || 'Active').replace('_', ' ')}
    </span>
  );
}