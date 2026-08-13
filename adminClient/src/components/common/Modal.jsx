export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">

      <section className="flex w-full max-w-5xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-lg font-black text-slate-900">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-900"
          >
            ×
          </button>

        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-6">

          {children}

        </div>

      </section>

    </div>
  );
}