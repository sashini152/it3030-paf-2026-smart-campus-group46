import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import SurfaceCard from '../components/SurfaceCard'

const notificationGroups = [
  {
    title: 'Ticket updates',
    description: 'Status changes, support replies, and closure updates for student tickets.',
  },
  {
    title: 'Booking decisions',
    description: 'Approval, rejection, and cancellation updates for requested spaces or assets.',
  },
  {
    title: 'Campus notices',
    description: 'Important service interruptions and operational messages that affect students.',
  },
]

export default function NotificationsPage() {
  return (
    <div className="hub-page space-y-8">
      <PageIntro
        eyebrow="Notifications"
        title="Keep up with campus updates"
        description="This area will gather status changes and service notices into one consistent inbox instead of scattering updates across separate modules."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {notificationGroups.map((group) => (
          <SurfaceCard key={group.title} tone="subtle" className="space-y-3">
            <h2 className="text-lg font-semibold text-[#0f172a]">{group.title}</h2>
            <p className="text-sm leading-6 text-[#64748b]">{group.description}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard>
        <EmptyState
          title="Notification feed not connected yet"
          description="Next step: poll or subscribe to the notification API and add mark-as-read actions so students can track updates without opening every module."
        />
      </SurfaceCard>
    </div>
  )
}
