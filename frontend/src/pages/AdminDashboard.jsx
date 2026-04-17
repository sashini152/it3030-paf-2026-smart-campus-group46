function sidebarView() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
          SC
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">Smart Campus</p>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Admin Desk</p>
        </div>
      </div>

      <nav className="space-y-2">
        {SECTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSection(item)}
            className={cls(
              'flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
              section === item
                ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>
