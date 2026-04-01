import { formatTicketStatus, getTicketStatusTone } from '../utils/ticketPresentation'

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getTicketStatusTone(status)} ${className}`.trim()}
    >
      {formatTicketStatus(status)}
    </span>
  )
}
