export default function NotificationsPage() {
  return (
    <div className="hub-page hub-page--narrow">
      <h1>Notifications</h1>
      <p className="hub-lead">
        Module D — booking decisions, ticket status changes, and new comments
        surfaced in this panel once the backend notification API is wired.
      </p>
      <div className="hub-placeholder">
        <p>
          Next: poll or subscribe to <code>GET /notifications</code> (or your
          chosen design) and mark-as-read actions.
        </p>
      </div>
    </div>
  )
}
