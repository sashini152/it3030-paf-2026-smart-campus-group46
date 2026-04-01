import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'

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

const stats = [
  { label: 'Core services', value: '04', tone: 'hub-home-stat--navy' },
  { label: 'Student-first flows', value: '24/7', tone: 'hub-home-stat--steel' },
  { label: 'Support route', value: 'Fast', tone: 'hub-home-stat--peach' },
]

const journeys = [
  {
    eyebrow: 'Find and choose',
    title: 'Start with the right campus space',
    description:
      'Search labs, halls, and shared rooms quickly, then move straight into booking or support without losing context.',
    accent: '#FDA481',
  },
  {
    eyebrow: 'Request and confirm',
    title: 'Book spaces without switching systems',
    description:
      'Submit requests, follow approval states, and keep everything visible from one student-facing hub.',
    accent: '#B4182D',
  },
  {
    eyebrow: 'Report and track',
    title: 'Raise issues and follow updates clearly',
    description:
      'Ticket submission, replies, and status progress stay connected so students can track what happens next.',
    accent: '#54162B',
  },
]

const socialLinks = [
  { label: 'Website', href: 'https://www.sliit.lk/' },
  { label: 'Facebook', href: 'https://www.facebook.com/SLIIT' },
  { label: 'Instagram', href: 'https://www.instagram.com/sliit' },
  { label: 'YouTube', href: 'https://www.youtube.com/@SLIITtube' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/school/sliit/' },
]

export default function HomePage() {
  const [activeJourney, setActiveJourney] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveJourney((current) => (current + 1) % journeys.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [])

  const activeSlide = journeys[activeJourney]

  return (
    <div className="hub-page hub-page--home">
      <section className="hub-home-hero">
        <Reveal delay={30}>
          <ParallaxPanel className="hub-home-hero__content hub-home-hero__content--interactive" strength={12}>
            <div className="hub-home-orb hub-home-orb--top" />
            <div className="hub-home-orb hub-home-orb--bottom" />
            <p className="hub-home-kicker">Smart Campus Hub</p>
            <h1>Student operations, bookings, and support in one place</h1>
            <p className="hub-lead">
              Manage resources, request spaces, submit campus support tickets, and
              stay updated without jumping between separate systems.
            </p>
            <div className="hub-home-hero__actions">
              <Link to="/tickets" className="hub-home-cta hub-home-cta--primary hub-button-pop">
                Submit a ticket
              </Link>
              <a href="#home-modules" className="hub-home-cta hub-home-cta--secondary hub-button-pop">
                Explore modules
              </a>
            </div>
            <div className="hub-home-hero__metrics" aria-label="Campus highlights">
              <div className="hub-home-hero__metric">
                <span className="hub-home-hero__metric-value">4</span>
                <span className="hub-home-hero__metric-label">student service paths</span>
              </div>
              <div className="hub-home-hero__metric">
                <span className="hub-home-hero__metric-value">1</span>
                <span className="hub-home-hero__metric-label">shared campus workspace</span>
              </div>
            </div>
          </ParallaxPanel>
        </Reveal>

        <Reveal delay={140}>
          <ParallaxPanel className="hub-home-panel" aria-label="Student highlights" strength={10}>
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
            <a href="#home-journeys" className="hub-home-panel__link">
              See how the flow works
            </a>
          </ParallaxPanel>
        </Reveal>
      </section>

      <Reveal delay={90}>
        <section className="hub-home-stats" aria-label="Student quick stats">
          {stats.map((stat) => (
            <article key={stat.label} className={`hub-home-stat ${stat.tone}`}>
              <p className="hub-home-stat__value">{stat.value}</p>
              <p className="hub-home-stat__label">{stat.label}</p>
            </article>
          ))}
        </section>
      </Reveal>

      <section id="home-modules" className="hub-home-cards" aria-label="Student modules">
        {modules.map((module, index) => (
          <Reveal key={module.title} delay={index * 90}>
            <ParallaxPanel className={`hub-home-card ${module.tone}`} strength={8 + index}>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <Link to={module.to} className="hub-home-card__action">
                <span>{module.action}</span>
                <span className="hub-home-card__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </ParallaxPanel>
          </Reveal>
        ))}
      </section>

      <Reveal delay={110}>
        <section id="home-journeys" className="hub-home-journeys" aria-label="Student journeys">
          <div className="hub-home-journeys__header">
            <p className="hub-home-kicker">Student Journey</p>
            <h2>Move through campus tasks without friction</h2>
          </div>

          <div className="hub-home-journeys__grid">
            <div className="hub-home-journeys__nav" role="tablist" aria-label="Journey steps">
              {journeys.map((journey, index) => {
                const active = index === activeJourney
                return (
                  <button
                    key={journey.title}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveJourney(index)}
                    className={`hub-home-journey-tab${active ? ' hub-home-journey-tab--active' : ''}`}
                  >
                    <span className="hub-home-journey-tab__index">0{index + 1}</span>
                    <span className="hub-home-journey-tab__copy">
                      <span>{journey.eyebrow}</span>
                      <strong>{journey.title}</strong>
                    </span>
                  </button>
                )
              })}
            </div>

            <ParallaxPanel className="hub-home-journey-stage" strength={10}>
              <div className="hub-home-journey-stage__accent" style={{ background: activeSlide.accent }} />
              <div className="hub-home-journey-stage__content">
                <p className="hub-home-kicker">{activeSlide.eyebrow}</p>
                <h3>{activeSlide.title}</h3>
                <p>{activeSlide.description}</p>
                <div className="hub-home-journey-stage__footer">
                  <span className="hub-home-journey-stage__pulse" />
                  <span>Live student-facing flow</span>
                </div>
              </div>
            </ParallaxPanel>
          </div>
        </section>
      </Reveal>

      <Reveal delay={160}>
        <footer className="hub-home-footer" aria-label="SLIIT campus footer">
          <div className="hub-home-footer__inner">
            <div className="hub-home-footer__brand">
              <p className="hub-home-footer__title">SLIIT Campus</p>
              <p className="hub-home-footer__powered">
                Powered by{' '}
                <a href="https://www.sliit.lk/" target="_blank" rel="noreferrer">
                  SLIIT
                </a>
              </p>
              <p className="hub-home-footer__text">
                Smart Campus Hub for student services, bookings, resources, and
                support access.
              </p>
              <div className="hub-home-footer__contact">
                <a href="tel:+94117544801">+94 11 754 4801</a>
                <a href="mailto:info@sliit.lk">info@sliit.lk</a>
              </div>
            </div>
            <div className="hub-home-footer__links">
              <p className="hub-home-footer__links-title">Follow SLIIT</p>
              <div className="hub-home-footer__socials">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hub-home-footer__social"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="hub-home-footer__meta">
              <span>Student services</span>
              <span>Campus operations</span>
              <span>Digital support</span>
            </div>
          </div>
          <div className="hub-home-footer__bottom">
            <p>&copy; 2026 Smart Campus Operations Hub. All Rights Reserved.</p>
          </div>
        </footer>
      </Reveal>
    </div>
  )
}
