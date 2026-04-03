import { TICKET_TRACKING_STEPS, getTicketStatusIndex } from '../utils/ticketPresentation'

export default function TicketProgress({ status, compact = false, className = '' }) {
  if (status === 'REJECTED') {
    return (
      <div
        className={`rounded-2xl border border-[#B4182D] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#B4182D] ${className}`.trim()}
      >
        Rejected by admin
      </div>
    )
  }

  const currentStep = getTicketStatusIndex(status)

  return (
    <div
      className={`${compact ? 'grid grid-cols-4 gap-2' : 'grid gap-3 sm:grid-cols-4'} ${className}`.trim()}
    >
      {TICKET_TRACKING_STEPS.map((step, index) => {
        const complete = index <= currentStep
        return (
          <div key={step} className="space-y-2">
            <div className={`h-2 rounded-full ${complete ? 'bg-[#FDA481]' : 'bg-[#37415C]'}`} />
            <p
              className={`${compact ? 'text-[11px]' : 'text-sm'} font-medium ${
                complete ? 'text-white' : 'text-[#FDA481]'
              }`}
            >
              {step}
            </p>
          </div>
        )
      })}
    </div>
  )
}
