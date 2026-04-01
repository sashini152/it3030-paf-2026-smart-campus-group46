import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const bookingPageRoute = user?.role === 'ADMIN' ? '/admin-bookings' : '/bookings'
  const bookingPageLabel = user?.role === 'ADMIN' ? 'Booking approvals' : 'My bookings'

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      title: `Welcome, ${user?.name || 'User'}!`,
      body: 'Your dashboard groups campus actions into one place. Use the left menu to move between resources, bookings, and support without leaving the page context.',
      meta: [
        { label: 'Email', value: user?.email || 'Not available' },
        { label: 'Role', value: user?.role || 'USER' },
      ],
      highlights: [
        { title: 'Resources', text: 'Browse active rooms and equipment.' },
        { title: 'Bookings', text: 'Create or review reservation requests.' },
        { title: 'Support', text: 'Track campus issues and responses.' },
      ],
      actionLabel: 'Open resources',
      action: () => navigate('/resources'),
    },
    {
      id: 'resources',
      label: 'Resources',
      title: 'Browse campus resources',
      body: 'Open the resource catalogue to check active spaces, equipment, locations, and capacity before making a booking request.',
      meta: [
        { label: 'What you can do', value: 'Search rooms and equipment' },
        { label: 'Best next step', value: 'Filter by location or capacity' },
      ],
      highlights: [
        { title: 'Lecture halls', text: 'Check capacity and room availability.' },
        { title: 'Labs', text: 'Find practical spaces by location.' },
        { title: 'Equipment', text: 'See bookable assets before reserving.' },
      ],
      actionLabel: 'View resources',
      action: () => navigate('/resources'),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      title: bookingPageLabel,
      body:
        user?.role === 'ADMIN'
          ? 'Review pending booking requests and manage approval decisions from the admin booking view.'
          : 'Create new booking requests, track request status, and review your latest reservations in one place.',
      meta: [
        { label: 'Access', value: user?.role === 'ADMIN' ? 'Admin booking queue' : 'Student booking requests' },
        { label: 'Route', value: bookingPageRoute },
      ],
      highlights: [
        { title: 'Create', text: 'Request a slot with date, time, and purpose.' },
        { title: 'Track', text: 'Follow pending, approved, or cancelled states.' },
        { title: 'Manage', text: user?.role === 'ADMIN' ? 'Approve or reject pending requests.' : 'Review your latest requests quickly.' },
      ],
      actionLabel: user?.role === 'ADMIN' ? 'Open approvals' : 'Open bookings',
      action: () => navigate(bookingPageRoute),
    },
    {
      id: 'tickets',
      label: 'Support',
      title: 'Campus support tickets',
      body: 'Raise a support request, attach evidence, and track updates from the support team through the ticket workflow.',
      meta: [
        { label: 'Use case', value: 'Hardware, software, and campus issues' },
        { label: 'Tracking', value: 'Follow ticket status and comments' },
      ],
      highlights: [
        { title: 'Submit', text: 'Report an issue with title and description.' },
        { title: 'Track', text: 'See ticket status updates and comments.' },
        { title: 'Resolve', text: 'Follow support progress from one place.' },
      ],
      actionLabel: 'Open tickets',
      action: () => navigate('/tickets'),
    },
  ]

  const currentSection =
    sections.find((section) => section.id === activeSection) ?? sections[0]

  return (
    <div className="hub-page hub-page--dashboard">
      <h1>Dashboard</h1>
      <div className="hub-dashboard-shell">
        <aside className="hub-dashboard-sidebar">
          <p className="hub-dashboard-sidebar__kicker">Navigation</p>
          <div className="hub-dashboard-sidebar__menu" role="tablist" aria-label="Dashboard sections">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={currentSection.id === section.id}
                className={`hub-dashboard-sidebar__item${
                  currentSection.id === section.id ? ' hub-dashboard-sidebar__item--active' : ''
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hub-btn hub-btn--danger hub-dashboard-sidebar__logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        <section className="hub-dashboard-panel" role="tabpanel">
          <div className="hub-dashboard-panel__header">
            <div>
              <h2>{currentSection.title}</h2>
              <p className="hub-dashboard-panel__lead">{currentSection.body}</p>
            </div>
            <button
              type="button"
              className="hub-btn hub-btn--primary"
              onClick={currentSection.action}
            >
              {currentSection.actionLabel}
            </button>
          </div>

          <div className="hub-dashboard-panel__body">
            <div className="hub-dashboard-panel__meta">
              {currentSection.meta.map((item) => (
                <div key={item.label} className="hub-dashboard-panel__meta-card">
                  <span className="hub-dashboard-panel__meta-label">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="hub-dashboard-panel__highlights">
              {currentSection.highlights.map((item) => (
                <article key={item.title} className="hub-dashboard-panel__highlight-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
