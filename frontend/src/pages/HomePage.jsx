import { Link } from 'react-router-dom'

const modules = [
  {
    title: 'Facilities & assets',
    description: 'Browse rooms, labs, and equipment by type, capacity, and location.',
    action: 'Open resources',
    to: '/resources',
    tone: 'hub-home-card--navy',
  },
  {
    title: 'Bookings',
    description: 'Request spaces and track approvals for classes, events, and student use.',
    action: 'Open bookings',
    to: '/bookings',
    tone: 'hub-home-card--steel',
  },
  {
    title: 'Tickets',
    description: 'Report campus issues clearly and follow replies, updates, and status changes.',
    action: 'Open tickets',
    to: '/tickets',
    tone: 'hub-home-card--peach',
  },
  {
    title: 'Notifications',
    description: 'See booking updates, service notices, and important campus reminders in one place.',
    action: 'Open notifications',
    to: '/notifications',
    tone: 'hub-home-card--berry',
  },
]

export default function HomePage() {
  return (
    <div className="hub-page hub-page--home">
      <section className="hub-home-hero">
        <div className="hub-home-hero__content">
          <p className="hub-home-kicker">Smart Campus Hub</p>
          <h1>Student operations, bookings, and support in one place</h1>
          <p className="hub-lead">
            Manage resources, request spaces, submit campus support tickets, and
            stay updated without jumping between separate systems.
          </p>
          <div className="hub-home-hero__actions">
            <Link to="/tickets" className="hub-home-cta hub-home-cta--primary">
              Submit a ticket
            </Link>
            <Link to="/resources" className="hub-home-cta hub-home-cta--secondary">
              Explore resources
            </Link>
          </div>
        </div>

        <div className="hub-home-panel" aria-label="Student highlights">
          <div className="hub-home-panel__row">
            <span className="hub-home-panel__label">For students</span>
            <span className="hub-home-panel__value">Fast access</span>
          </div>
          <div className="hub-home-panel__stack">
            <div className="hub-home-panel__chip">Rooms and labs</div>
            <div className="hub-home-panel__chip">Bookings</div>
            <div className="hub-home-panel__chip">Ticket tracking</div>
            <div className="hub-home-panel__chip">Notices</div>
          </div>
          <p className="hub-home-panel__text">
            Built for day-to-day student use with quick navigation and clear
            service access.
          </p>
        </div>
      </section>

      <section className="hub-home-cards" aria-label="Student modules">
        {modules.map((module) => (
          <article key={module.title} className={`hub-home-card ${module.tone}`}>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
            <Link to={module.to} className="hub-home-card__action">
              {module.action}
            </Link>
          </article>
        ))}
      </section>

      <footer className="hub-home-footer" aria-label="SLIIT campus footer">
        <div className="hub-home-footer__inner">
          <div>
            <p className="hub-home-footer__title">SLIIT Campus</p>
            <p className="hub-home-footer__text">
              Smart Campus Hub for student services, bookings, resources, and
              support access.
            </p>
          </div>
          <div className="hub-home-footer__meta">
            <span>Student services</span>
            <span>Campus operations</span>
            <span>Digital support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
