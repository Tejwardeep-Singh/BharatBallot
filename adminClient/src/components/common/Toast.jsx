function Toast({ toast, clear }) {
  return (
    toast && (
      <div
        className={`fixed right-5 top-5 z-[100] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}
        onClick={clear}
      >
        {toast.message}
      </div>
    )
  );
}

export default Toast;