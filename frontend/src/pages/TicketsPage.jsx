export default function TicketsPage() {
  return (
    <div className="hub-page hub-page--narrow">
      <h1>Tickets</h1>
      <p className="hub-lead">
        Module C — incident reports with category, priority, description, and up
        to three images. Workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED (and
        REJECTED where applicable). Comments and technician assignment.
      </p>
      <div className="hub-placeholder">
        <p>
          Next: creation form with file upload, tracking view, comment thread,
          and ticket API integration.
        </p>
      </div>
    </div>
  )
}
