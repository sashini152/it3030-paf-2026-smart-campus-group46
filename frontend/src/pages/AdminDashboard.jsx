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
       <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        Review analytics, booking verification, support metrics, and notification delivery from one workspace.
      </div>

      <button
        type="button"
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
        className="mt-auto rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        Logout
      </button>
    </div>
  )
}

return (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8 xl:block">
        {sidebarView()}
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 xl:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="h-full w-72 bg-white px-6 py-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarView()}
          </aside>
        </div>
      )}

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-6 lg:p-8">
            <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm xl:hidden"
                >
                  Menu
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                    Smart Campus Admin
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    Operations dashboard
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Manage resources, bookings, tickets, notifications, and analytics from one unified admin workspace.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'Campus Admin'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'admin@smartcampus.local'}</p>
                </div>
              </div>
            </header>

            {section === 'overview' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-[24px] bg-slate-900 p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)]">
                    <p className="text-sm font-medium text-slate-300">Total tickets</p>
                    <p className="mt-3 text-4xl font-semibold">{tickets.length}</p>
                    <p className="mt-2 text-sm text-slate-300">{ticketSummary.active} active queue</p>
                  </article>
                     <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Resources</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-900">{resources.length}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {resources.filter((item) => item.status === 'ACTIVE').length} active
                    </p>
                  </article>

                  <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Pending bookings</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-900">{pendingBookings.length}</p>
                    <p className="mt-2 text-sm text-slate-500">Awaiting review</p>
                  </article>

                  <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Unread notifications</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-900">
                      {notifications.filter((item) => !item.read).length}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">Admin inbox</p>
                  </article>
                </div>

                <div className="grid gap-6 xl:grid-cols-12">
                  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-6">
                    <h2 className="text-xl font-semibold text-slate-900">Tickets raised over time</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Line chart for the last 7 days of ticket submissions.
                    </p>

                    {ticketsLoading ? (
                      <p className="mt-4 text-sm text-slate-500">Loading tickets...</p>
                    ) : (
                      <div className="mt-5 space-y-5">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                          <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Total raised this week</p>
                              <p className="mt-1 text-3xl font-semibold text-slate-900">
                                {ticketRaisedTrend.points.reduce((sum, point) => sum + point.count, 0)}
                              </p>
                            </div>
                            <p className="text-sm text-slate-500">
                              Peak day: {Math.max(...ticketRaisedTrend.points.map((point) => point.count), 0)}
                            </p>
                          </div>

                          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-44 w-full overflow-visible">
                            <line x1="0" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="1.2" />
                            <line x1="0" y1="0" x2="0" y2="100" stroke="#cbd5e1" strokeWidth="1.2" />
                            <path
                              d={ticketRaisedTrend.path}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {ticketRaisedTrend.points.map((point, index) => {
                              const x =
                                ticketRaisedTrend.points.length === 1
                                  ? 50
                                  : (index / (ticketRaisedTrend.points.length - 1)) * 100
                              const y = 100 - (point.count / ticketRaisedTrend.max) * 100
                              return (
                                <circle
                                  key={point.key}
                                  cx={x}
                                  cy={y}
                                  r="2.8"
                                  fill="#10b981"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                />
                              )
                            })}
                          </svg>
                        </div>
<div className="grid gap-3 sm:grid-cols-7">
                          {ticketRaisedTrend.points.map((point) => (
                            <div
                              key={point.key}
                              className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm"
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                {formatChartDay(point.date)}
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-slate-900">{point.count}</p>
                              <p className="mt-1 text-xs text-slate-500">{formatShortDate(point.date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-6">
                    <h2 className="text-xl font-semibold text-slate-900">Ticket status stack</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Stacked status view for the current raised-ticket queue.
                    </p>

                    {ticketsLoading ? (
                      <p className="mt-4 text-sm text-slate-500">Loading tickets...</p>
                    ) : (
                      <div className="mt-5 space-y-5">
                        {ticketStatusChart.counts.length === 0 ? (
                          <p className="text-sm text-slate-500">No tickets yet.</p>
                        ) : (
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-slate-500">Total tracked tickets</p>
                              <p className="text-2xl font-semibold text-slate-900">{ticketStatusChart.total}</p>
                            </div>

                            <div className="overflow-hidden rounded-full bg-white">
                              <div className="flex h-5 w-full">
                                {ticketStatusChart.counts.map((item) => (
                                  <div
                                    key={item.status}
                                    className={cls(
                                      TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400',
                                      item.count === 0 ? 'hidden' : ''
                                    )}
                                    style={{
                                      width: ticketStatusChart.total
                                        ? `${(item.count / ticketStatusChart.total) * 100}%`
                                        : '0%',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                          {ticketStatusChart.counts.map((item) => (
                            <div key={item.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cls(
                                      'h-3 w-3 rounded-full',
                                      TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400'
                                    )}
                                  />
                                  <span className="text-sm font-medium text-slate-700">{label(item.status)}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                              </div>
                              <p className="mt-2 text-xs text-slate-500">
                                {ticketStatusChart.total
                                  ? `${Math.round((item.count / ticketStatusChart.total) * 100)}% of current queue`
                                  : 'No tickets yet'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-600">
                          Usage analytics
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Resource rhythm</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Top resources and peak approved-booking hours.
                        </p>
                      </div>
                    </div>

                    {analyticsError && <p className="mt-3 text-sm text-rose-600">{analyticsError}</p>}

                    {analyticsLoading ? (
                      <p className="mt-4 text-sm text-slate-500">Loading analytics...</p>
                    ) : (
                      <div className="mt-5 space-y-6">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                            Top resources
                          </h3>

                          <div className="mt-4 space-y-4">
                            {analytics.topResources.length === 0 ? (
                              <p className="text-sm text-slate-500">No approved bookings yet.</p>
                            ) : (
                              analytics.topResources.map((item) => (
                                <div key={item.resourceId} className="rounded-[20px] bg-white p-4 shadow-sm">
                                  <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-700">{item.resourceName}</span>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                      {item.bookingCount}
                                    </span>
                                  </div>
                                  <div className="h-2.5 rounded-full bg-slate-100">
                                    <div
                                      className="h-2.5 rounded-full bg-emerald-500"
                                      style={{ width: `${(item.bookingCount / maxResourceCount) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                            Peak booking hours
                          </h3>

                          <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            {analytics.peakBookingHours.length === 0 ? (
                              <p className="text-sm text-slate-500">No approved bookings yet.</p>
                            ) : (
                              <div className="flex min-h-[220px] items-end gap-4">
                                {analytics.peakBookingHours.map((item) => (
                                  <div key={item.hour} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-sky-600 shadow-sm">
                                      {item.bookingCount}
                                    </span>
                                    <div className="flex h-36 w-full items-end rounded-[20px] border border-slate-200 bg-white px-2 py-2">
                                      <div
                                        className="w-full rounded-[16px] bg-sky-500"
                                        style={{
                                          height: `${Math.max((item.bookingCount / maxHourCount) * 100, 12)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-center text-[11px] font-medium leading-4 text-slate-600">
                                      {item.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>


