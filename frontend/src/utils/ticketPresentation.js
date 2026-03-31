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
      return 'border-[#d7e6f7] bg-[#eef6ff] text-[#1d4f91]'
    case 'RESOLVED':
      return 'border-[#b9d7d6] bg-[#f7fbfb] text-[#327f7d]'
    case 'CLOSED':
      return 'border-[#d8e0ea] bg-[#eef2f7] text-[#334155]'
    case 'WAITING_FOR_CLIENT':
      return 'border-[#e5dcfb] bg-[#f6f1ff] text-[#6d4ca8]'
    case 'WAITING_FOR_SUPPORT':
      return 'border-[#f5ddcf] bg-[#fff4ee] text-[#a44a1a]'
    default:
      return 'border-[#dbe4ef] bg-white text-[#334155]'
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
      return 'text-[#8a3f32]'
    case 'MEDIUM':
      return 'text-[#1d4f91]'
    default:
      return 'text-[#327f7d]'
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
