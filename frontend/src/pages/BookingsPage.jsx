import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import SurfaceCard from '../components/SurfaceCard'

const bookingHighlights = [
  'Students request a room or asset with date, time, and purpose.',
  'Admins approve, reject, or cancel requests with clear status feedback.',
  'Booking history and conflict checks will sit in the same visual system as tickets.',
]

export default function BookingsPage() {
  return (
    <div className="hub-page space-y-8">
      <PageIntro
        eyebrow="Bookings"
        title="Request spaces and track approvals"
        description="The booking experience has been refactored into the same shared layout style used across the app, so the live workflow can be added without redesigning the page again."
      />

      <SurfaceCard>
        <div className="grid gap-4 md:grid-cols-3">
          {bookingHighlights.map((item) => (
            <div key={item} className="rounded-[24px] border border-[#dde5ef] bg-[#f8fbff] p-5">
              <p className="text-sm leading-6 text-[#475569]">{item}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <EmptyState
          title="Booking workflow is ready for backend wiring"
          description="Next step: connect booking creation, approval states, history, and admin actions to the booking service endpoints."
        />
      </SurfaceCard>
    </div>
  )
}
