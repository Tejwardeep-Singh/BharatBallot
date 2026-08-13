export default function Button({
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
        className ||
        'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}