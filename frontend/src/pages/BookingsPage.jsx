export default function BookingsPage() {
  return (
    <div className="hub-page hub-page--narrow">
      <h1>Bookings</h1>
      <p className="hub-lead">
        Module B — request a resource with date, time, purpose, and attendees.
        Workflow: PENDING → APPROVED / REJECTED; approved bookings can be
        CANCELLED. Admins review with a reason.
      </p>
      <div className="hub-placeholder">
        <p>
          Next: booking form, history list, admin approval dashboard, and calls
          to <code>POST /bookings</code>, <code>GET /bookings</code>, approve /
          reject / delete endpoints.
        </p>
      </div>
    </div>
  )
}
