import { formatTicketStatus, getTicketStatusTone } from '../utils/ticketPresentation'

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex min-w-[124px] items-center justify-center rounded-[999px] border px-4 py-2 text-center text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.18em] shadow-[0_8px_18px_rgba(24,26,47,0.08)] ${getTicketStatusTone(status)} ${className}`.trim()}
    >
      {formatTicketStatus(status)}
    </span>
  )
}
