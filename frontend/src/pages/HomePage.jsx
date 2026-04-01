import { Link } from 'react-router-dom'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'

const modules = [
  {
    title: 'Resources',
    description: 'Browse available rooms, labs, and equipment before making a request.',
    action: 'Open resources',
    to: '/resources',
    tone: 'hub-home-card--navy',
  },
  {
    title: 'Bookings',
    description: 'Request campus spaces and follow approval status from one place.',
    action: 'Open bookings',
    to: '/bookings',
    tone: 'hub-home-card--steel',
  },
  {
    title: 'Tickets',
    description: 'Submit support issues and track updates from the service team.',
    action: 'Open tickets',
    to: '/tickets',
    tone: 'hub-home-card--peach',
  },
  {
    title: 'Notifications',
    description: 'Read booking alerts, service notices, and general campus updates.',
    action: 'Open notifications',
    to: '/notifications',
    tone: 'hub-home-card--berry',
  },
]

const steps = [
  {
    title: '1. Choose a service',
    description: 'Start from resources, bookings, tickets, or notifications depending on what you need.',
  },
  {
    title: '2. Complete the request',
    description: 'Submit the required details once and keep the flow clear and predictable.',
  },
  {
    title: '3. Track the result',
    description: 'Check approval status, updates, and support responses without switching pages.',
  },
]

export default function HomePage() {
  return (
    <div className="hub-page hub-page--home">
      <section className="hub-home-hero">
        <Reveal delay={30}>
          <ParallaxPanel className="hub-home-hero__content hub-home-hero__content--interactive" strength={8}>
            <div className="hub-home-orb hub-home-orb--top" />
            <div className="hub-home-orb hub-home-orb--bottom" />
            <p className="hub-home-kicker">Smart Campus Hub</p>
            <h1>Student services in one standard workspace</h1>
            <p className="hub-lead">
              Use one home page to access resources, bookings, support tickets, and
              notifications without jumping across separate dashboards.
            </p>
            <div className="hub-home-hero__actions">
              <Link to="/resources" className="hub-home-cta hub-home-cta--primary hub-button-pop">
                Get started
              </Link>
              <a href="#home-modules" className="hub-home-cta hub-home-cta--secondary hub-button-pop">
                View modules
              </a>
            </div>
            <div className="hub-home-hero__metrics" aria-label="Home page overview">
              <div className="hub-home-hero__metric">
                <span className="hub-home-hero__metric-value">4</span>
                <span className="hub-home-hero__metric-label">core student services</span>
              </div>
              <div className="hub-home-hero__metric">
                <span className="hub-home-hero__metric-value">1</span>
                <span className="hub-home-hero__metric-label">main landing page</span>
              </div>
            </div>
          </ParallaxPanel>
        </Reveal>

        <Reveal delay={140}>
          <ParallaxPanel className="hub-home-panel" aria-label="Quick access" strength={6}>
            <div className="hub-home-panel__row">
              <span className="hub-home-panel__label">Quick access</span>
              <span className="hub-home-panel__value">Student home</span>
            </div>
            <div className="hub-home-panel__stack">
              <div className="hub-home-panel__chip">Resources</div>
              <div className="hub-home-panel__chip">Bookings</div>
              <div className="hub-home-panel__chip">Tickets</div>
              <div className="hub-home-panel__chip">Notifications</div>
            </div>
            <p className="hub-home-panel__text">
              The home page now focuses on the standard student flow instead of showing extra dashboard sections.
            </p>
            <a href="#home-how-it-works" className="hub-home-panel__link">
              See how it works
            </a>
          </ParallaxPanel>
        </Reveal>
      </section>

      <section id="home-modules" className="hub-home-cards" aria-label="Student modules">
        {modules.map((module, index) => (
          <Reveal key={module.title} delay={index * 70}>
            <ParallaxPanel className={`hub-home-card ${module.tone}`} strength={6}>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <Link to={module.to} className="hub-home-card__action">
                <span>{module.action}</span>
                <span className="hub-home-card__arrow" aria-hidden="true">
                  {'->'}
                </span>
              </Link>
            </ParallaxPanel>
          </Reveal>
        ))}
      </section>

      <Reveal delay={120}>
        <section
          id="home-how-it-works"
          className="mx-auto grid max-w-6xl gap-4 px-1 pb-16 md:grid-cols-3"
          aria-label="How it works"
        >
          {steps.map((step) => (
            <article
              key={step.title}
              className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">How it works</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
            </article>
          ))}
        </section>
      </Reveal>
    </div>
  )
}
