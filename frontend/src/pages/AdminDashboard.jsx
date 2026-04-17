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
                  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-500">
                        Ticket care
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">SLA summary</h2>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <article className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-medium text-slate-500">Average first response</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">
                          {durationLabel(ticketSummary.avgFirstResponse)}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-rose-500">
                          Support pickup speed
                        </p>
                      </article>

                      <article className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-medium text-slate-500">Average resolution</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">
                          {durationLabel(ticketSummary.avgResolution)}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-500">
                          End-to-end closure
                        </p>
                      </article>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      First response is captured when support first picks up a ticket or leaves an admin/support comment.
                      Resolution time ends when a ticket moves to RESOLVED or CLOSED.
                    </div>
                  </section>
                </div>
              </div>
            )}

            {section === 'resources' && (
              <div className="space-y-6">
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {resourceEditId ? 'Edit resource' : 'Add resource'}
                  </h2>

                  <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={saveResource}>
                    <select
                      value={resourceForm.type}
                      onChange={(event) => setResourceForm((current) => ({ ...current, type: event.target.value }))}
                      className="min-h-[50px] rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      {RESOURCE_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {label(item)}
                        </option>
                      ))}
                    </select>

                    <input
                      required
                      placeholder="Name"
                      value={resourceForm.name}
                      onChange={(event) => setResourceForm((current) => ({ ...current, name: event.target.value }))}
                      className="min-h-[50px] rounded-xl border border-slate-300 px-3 py-2"
                    />

                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="Capacity"
                      value={resourceForm.capacity}
                      onChange={(event) => setResourceForm((current) => ({ ...current, capacity: event.target.value }))}
                      className="min-h-[50px] rounded-xl border border-slate-300 px-3 py-2"
                    />

                    <input
                      required
                      placeholder="Location"
                      value={resourceForm.location}
                      onChange={(event) => setResourceForm((current) => ({ ...current, location: event.target.value }))}
                      className="min-h-[50px] rounded-xl border border-slate-300 px-3 py-2"
                    />

                    <input
                      placeholder="Availability window"
                      value={resourceForm.availabilityWindows}
                      onChange={(event) =>
                        setResourceForm((current) => ({ ...current, availabilityWindows: event.target.value }))
                      }
                      className="min-h-[50px] rounded-xl border border-slate-300 px-3 py-2 md:col-span-2"
                    />

                    <select
                      value={resourceForm.status}
                      onChange={(event) => setResourceForm((current) => ({ ...current, status: event.target.value }))}
                      className="min-h-[50px] rounded-xl border border-slate-300 bg-white px-3 py-2"
                    >
                      {RESOURCE_STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {label(item)}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-stretch gap-2 md:self-end">
                      <button
                        type="submit"
                        className="min-h-[50px] rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        {resourceEditId ? 'Update' : 'Create'}
                      </button>

                      {resourceEditId && (
                        <button
                          type="button"
                          onClick={() => {
                            setResourceEditId(null)
                            setResourceForm(emptyResource)
                          }}
                          className="min-h-[50px] rounded-xl border border-slate-300 px-5 py-2 text-sm text-slate-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {resourcesError && <p className="mt-3 text-sm text-rose-600">{resourcesError}</p>}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Resource list</h2>

                  {resourcesLoading ? (
                    <p className="mt-4 text-sm text-slate-500">Loading...</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                            <th className="py-3">Name</th>
                            <th className="py-3">Type</th>
                            <th className="py-3">Location</th>
                            <th className="py-3">Status</th>
                            <th className="py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                              <td className="py-4 font-semibold text-slate-900">{item.name}</td>
                              <td className="text-slate-600">{label(item.type)}</td>
                              <td className="text-slate-600">{item.location}</td>
                              <td className="text-slate-600">{label(item.status)}</td>
                              <td className="space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResourceEditId(item.id)
                                    setResourceForm({
                                      type: item.type,
                                      name: item.name,
                                      capacity: item.capacity,
                                      location: item.location,
                                      availabilityWindows: item.availabilityWindows || '',
                                      status: item.status,
                                    })
                                  }}
                                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteResource(item.id)}
                                  className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}

            {section === 'bookings' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">Booking management</h2>
                  <select
                    value={bookingFilter}
                    onChange={(event) => setBookingFilter(event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    {BOOKING_FILTERS.map((item) => (
                      <option key={item} value={item}>
                        {item === 'ALL' ? 'All' : label(item)}
                      </option>
                    ))}
                  </select>
                </div>
            {bookingsError && <p className="mb-3 text-sm text-rose-600">{bookingsError}</p>}

                {bookingsLoading ? (
                  <p className="text-sm text-slate-500">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                          <th className="py-3">Resource</th>
                          <th className="py-3">User</th>
                          <th className="py-3">Time</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Check-in</th>
                          <th className="py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleBookings.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                            <td className="py-4 font-semibold text-slate-900">{item.resourceId}</td>
                            <td className="text-slate-600">{item.requestedByUserId}</td>
                            <td className="text-slate-600">{dt(item.startDateTime)}</td>
                            <td className="text-slate-600">{label(item.status)}</td>
                            <td>
                              {item.checkedInAt ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                  Verified
                                </span>
                              ) : item.status === 'APPROVED' ? (
                                <Link
                                  to={`/booking-check-in?booking=${item.id}`}
                                  className="text-xs font-semibold text-emerald-700 hover:no-underline"
                                >
                                  QR / verify
                                </Link>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="space-x-2">
                              {item.status === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busyId === item.id}
                                    onClick={() => runBookingAction(item.id, 'approve')}
                                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyId === item.id}
                                    onClick={() => {
                                      const reason = window.prompt('Rejection reason')
                                      if (reason?.trim()) runBookingAction(item.id, 'reject', { reason: reason.trim() })
                                    }}
                                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {(item.status === 'PENDING' || item.status === 'APPROVED') && (
                                <button
                                  type="button"
                                  disabled={busyId === item.id}
                                  onClick={() => runBookingAction(item.id, 'cancel')}
                                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={busyId === item.id}
                                onClick={() => deleteBooking(item.id)}
                                className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {section === 'tickets' && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">Ticket operations</h2>
                  <input
                    value={ticketQuery}
                    onChange={(event) => setTicketQuery(event.target.value)}
                    placeholder="Search ticket..."
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                {ticketsError && <p className="mb-3 text-sm text-rose-600">{String(ticketsError.message || ticketsError)}</p>}

                {ticketsLoading ? (
                  <p className="text-sm text-slate-500">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                          <th className="py-3">Title</th>
                          <th className="py-3">Reporter</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">First response</th>
                          <th className="py-3">Resolution</th>
                          <th className="py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleTickets.map((item) => (
                          <tr key={`${item.ticketSource || 'ticket'}:${item.id}`} className="border-b border-slate-100 last:border-b-0">
                            <td className="py-4">
                              <p className="font-semibold text-slate-900">{item.title}</p>
                              <p className="max-w-[280px] text-xs text-slate-500">{item.description?.slice(0, 70)}</p>
                            </td>
                            <td>
                              <p>{getTicketReporterLabel(item)}</p>
                              <p className="text-[11px] text-slate-400">{item.createdBy || '-'}</p>
                            </td>
                            <td>
                              <select
                                value={normalizeTicketWorkflowStatus(item.status || 'OPEN')}
                                disabled={busyId === item.id}
                                onChange={(event) => updateTicketStatus(item, event.target.value)}
                                className="rounded-xl border border-slate-300 px-2 py-1 text-xs"
                              >
                                {TICKET_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {label(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{durationLabel(minutesBetween(item.createdAt, item.firstResponseAt))}</td>
                            <td>{durationLabel(minutesBetween(item.createdAt, item.resolvedAt))}</td>
                            <td className="space-x-2">
                              <Link
                                to={`/ticket-details/${item.id}`}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:no-underline"
                              >
                                View
                              </Link>
                              <button
                                type="button"
                                disabled={busyId === item.id}
                                onClick={() => deleteTicket(item)}
                                className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs text-white"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
             {section === 'notifications' && (
              <div className="space-y-6">
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Create notification</h2>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
                    >
                      Mark all read
                    </button>
                  </div>

                  <form className="grid gap-3 md:grid-cols-2" onSubmit={createNotification}>
                    <input
                      required
                      placeholder="Title"
                      value={notificationForm.title}
                      onChange={(event) =>
                        setNotificationForm((current) => ({ ...current, title: event.target.value }))
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <select
                      value={notificationForm.type}
                      onChange={(event) =>
                        setNotificationForm((current) => ({ ...current, type: event.target.value }))
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    >
                      {NOTIFICATION_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {label(item)}
                        </option>
                      ))}
                    </select>
                    <textarea
                      required
                      placeholder="Message"
                      value={notificationForm.message}
                      onChange={(event) =>
                        setNotificationForm((current) => ({ ...current, message: event.target.value }))
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2"
                      rows={3}
                    />
                    <input
                      placeholder="Target user ID (optional)"
                      value={notificationForm.targetUserId}
                      onChange={(event) =>
                        setNotificationForm((current) => ({ ...current, targetUserId: event.target.value }))
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <div>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Publish
                      </button>
                    </div>
                  </form>
                   {notificationsError && <p className="mt-3 text-sm text-rose-600">{notificationsError}</p>}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Notification inbox</h2>

                  {notificationsLoading ? (
                    <div className="mt-4 flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
                      <span className="ml-2 text-sm text-slate-500">Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-center">
                      <p className="text-sm text-slate-500">No notifications found</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-500">{notifications.length} notifications</span>
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <table className="min-w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Target</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Created</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">State</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {notifications.map((item) => (
                              <tr key={item.id} className={cls('transition-colors hover:bg-slate-50', !item.read && 'bg-emerald-50/60')}>
                                <td className="px-4 py-3">
                                  <div className="flex items-start">
                                    {!item.read && (
                                      <div className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500"></div>
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                      <p className="mt-1 max-w-xs text-xs text-slate-500">{item.message}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                    {label(item.type)}
                                  </span>
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-600">{item.targetUserId || 'Broadcast'}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{dt(item.createdAt)}</td>

                                <td className="px-4 py-3">
                                  <span
                                    className={cls(
                                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                      item.read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                                    )}
                                  >
                                    {item.read ? 'Read' : 'Unread'}
                                  </span>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      disabled={busyId === item.id}
                                      onClick={() => toggleRead(item)}
                                      className={cls(
                                        'inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                                        item.read
                                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                                        busyId === item.id && 'cursor-not-allowed opacity-50'
                                      )}
                                    >
                                      {item.read ? 'Mark unread' : 'Mark read'}
                                    </button>
                                       <button
                                      type="button"
                                      disabled={busyId === item.id}
                                      onClick={() => deleteNotification(item.id)}
                                      className={cls(
                                        'inline-flex items-center rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-700',
                                        busyId === item.id && 'cursor-not-allowed opacity-50'
                                      )}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  </div>
)
                            



