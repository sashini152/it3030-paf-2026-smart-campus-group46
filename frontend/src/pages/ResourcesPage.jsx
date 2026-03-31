import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import SurfaceCard from '../components/SurfaceCard'

const previewBlocks = [
  {
    title: 'Find rooms faster',
    description: 'Browse lecture halls, labs, and shared spaces by location, capacity, and type.',
  },
  {
    title: 'See equipment details',
    description: 'Show whether a room includes projectors, computers, whiteboards, or specialist devices.',
  },
  {
    title: 'Prepare booking-ready data',
    description: 'Resources listed here will feed directly into the booking flow once the API is connected.',
  },
]

export default function ResourcesPage() {
  return (
    <div className="hub-page space-y-8">
      <PageIntro
        eyebrow="Campus Resources"
        title="Find spaces, labs, and equipment"
        description="This module is being prepared for student browsing and booking support. The page structure is now aligned with the live ticket experience so the remaining API work can plug in cleanly."
        actions={
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#327f7d] bg-white px-4 py-2 text-sm font-semibold text-[#327f7d] shadow-sm hover:no-underline"
          >
            Back to home
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {previewBlocks.map((block) => (
          <SurfaceCard key={block.title} tone="subtle" className="space-y-3">
            <h2 className="text-lg font-semibold text-[#0f172a]">{block.title}</h2>
            <p className="text-sm leading-6 text-[#64748b]">{block.description}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard>
        <EmptyState
          title="Resource API not connected yet"
          description="Next step: connect catalogue listing, search, filters, and create or edit forms to the resource service so students can browse real campus inventory."
        />
      </SurfaceCard>
    </div>
  )
}
