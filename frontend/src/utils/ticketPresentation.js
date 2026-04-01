export const TICKET_STATUS_OPTIONS = [
  'ALL',
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'WAITING_FOR_CLIENT',
  'WAITING_FOR_SUPPORT',
]

export const TICKET_TRACKING_STEPS = ['Submitted', 'In progress', 'Resolved', 'Closed']

export function formatTicketStatus(status = 'OPEN') {
  return status.replaceAll('_', ' ')
}

export function getTicketStatusTone(status = 'OPEN') {
  switch (status) {
    case 'IN_PROGRESS':
      return 'border-[#242E49] bg-[#242E49] text-white'
    case 'RESOLVED':
      return 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]'
    case 'CLOSED':
      return 'border-[#54162B] bg-[#54162B] text-white'
    case 'WAITING_FOR_CLIENT':
      return 'border-[#B4182D] bg-[#B4182D] text-white'
    case 'WAITING_FOR_SUPPORT':
      return 'border-[#37415C] bg-[#37415C] text-white'
    default:
      return 'border-[#37415C] bg-white text-[#181A2F]'
  }
}

export function getTicketStatusIndex(status) {
  switch (status) {
    case 'IN_PROGRESS':
    case 'WAITING_FOR_CLIENT':
    case 'WAITING_FOR_SUPPORT':
      return 1
    case 'RESOLVED':
      return 2
    case 'CLOSED':
      return 3
    default:
      return 0
  }
}

export function getTicketPriorityTone(priority = 'LOW') {
  switch (priority) {
    case 'HIGH':
      return 'text-[#B4182D]'
    case 'MEDIUM':
      return 'text-[#FDA481]'
    default:
      return 'text-[#37415C]'
  }
}

export function formatTicketDate(value, options) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString(undefined, options || { month: 'short', day: 'numeric' })
}

export function formatTicketDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

export function getTicketSummaryStats(tickets) {
  return tickets.reduce(
    (stats, ticket) => {
      switch (ticket.status) {
        case 'OPEN':
          stats.open += 1
          break
        case 'IN_PROGRESS':
          stats.inProgress += 1
          break
        case 'RESOLVED':
          stats.resolved += 1
          break
        case 'CLOSED':
          stats.closed += 1
          break
        case 'WAITING_FOR_CLIENT':
          stats.waitingForClient += 1
          break
        case 'WAITING_FOR_SUPPORT':
          stats.waitingForSupport += 1
          break
        default:
          break
      }

      return stats
    },
    {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      waitingForClient: 0,
      waitingForSupport: 0,
    }
  )
}
