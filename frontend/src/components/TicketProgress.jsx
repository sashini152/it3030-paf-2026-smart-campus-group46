import { TICKET_TRACKING_STEPS, getTicketStatusIndex } from '../utils/ticketPresentation'

export default function TicketProgress({ status, compact = false, className = '' }) {
  const currentStep = getTicketStatusIndex(status)

  return (
    <div
      className={`${compact ? 'grid grid-cols-4 gap-2' : 'grid gap-3 sm:grid-cols-4'} ${className}`.trim()}
    >
      {TICKET_TRACKING_STEPS.map((step, index) => {
        const complete = index <= currentStep
        return (
          <div key={step} className="space-y-2">
            <div className={`h-2 rounded-full ${complete ? 'bg-[#327f7d]' : 'bg-[#d9e2ec]'}`} />
            <p
              className={`${compact ? 'text-[11px]' : 'text-sm'} font-medium ${
                complete ? 'text-[#0f172a]' : 'text-[#94a3b8]'
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
