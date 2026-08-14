function Page({ title, subtitle, children, action }) {
  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        {action}
      </div>

      {children}
    </>
  );
}

export default Page;