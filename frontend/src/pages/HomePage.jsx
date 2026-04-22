import { useEffect, useState } from 'react'
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
    badge: 'Explore',
    hint: 'Search spaces, labs, and equipment before starting a request.',
  },
  {
    title: 'Bookings',
    description: 'Request campus spaces and follow approval status from one place.',
    action: 'Open bookings',
    to: '/bookings',
    tone: 'hub-home-card--steel',
    badge: 'Reserve',
    hint: 'Create requests, watch approvals, and keep the flow in one place.',
  },
  {
    title: 'Tickets',
    description: 'Submit support issues and track updates from the service team.',
    action: 'Open tickets',
    to: '/tickets',
    tone: 'hub-home-card--peach',
    badge: 'Support',
    hint: 'Send issues fast and follow progress without leaving the workspace.',
  },
  {
    title: 'Notifications',
    description: 'Read booking alerts, service notices, and general campus updates.',
    action: 'Open notifications',
    to: '/notifications',
    tone: 'hub-home-card--berry',
    badge: 'Updates',
    hint: 'Stay on top of approvals, notices, and support replies.',
  },
]

const metrics = [
  {
    value: '4',
    label: 'core student services',
    tooltip: 'Resources, bookings, tickets, and notifications stay connected from one entry point.',
  },
  {
    value: '1',
    label: 'main landing page',
    tooltip: 'The home page acts as the single start point for the student-side flow.',
  },
]

const steps = [
  {
    title: '1. Choose a service',
    description: 'Start from resources, bookings, tickets, or notifications depending on what you need.',
    accent: 'Pick',
    icon: 'o',
    tone: 'hub-home-step--blush',
  },
  {
    title: '2. Complete the request',
    description: 'Submit the required details once and keep the flow clear and predictable.',
    accent: 'Fill',
    icon: '+',
    tone: 'hub-home-step--butter',
  },
  {
    title: '3. Track the result',
    description: 'Check approval status, updates, and support responses without switching pages.',
    accent: 'Follow',
    icon: '*',
    tone: 'hub-home-step--mint',
  },
]

export default function HomePage() {
  const [activeFocus, setActiveFocus] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFocus((current) => (current + 1) % modules.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [])

  const activeModule = modules[activeFocus]

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
              {metrics.map((metric) => (
                <div key={metric.label} className="hub-home-hero__metric">
                  <div className="hub-home-hero__metric-top">
                    <span className="hub-home-hero__metric-value">{metric.value}</span>
                  </div>
                  <span className="hub-home-hero__metric-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </ParallaxPanel>
        </Reveal>

        <Reveal delay={140}>
          <ParallaxPanel className="hub-home-panel" aria-label="Quick access" strength={6}>
            <div className="hub-home-panel__row">
              <span className="hub-home-panel__label">Quick access</span>
              <span className="hub-home-panel__value">Live flow</span>
            </div>
            <div className="hub-home-panel__focus hub-fade-slide">
              <p className="hub-home-panel__focus-kicker">{activeModule.badge}</p>
              <h2 className="hub-home-panel__focus-title">{activeModule.title}</h2>
              <p className="hub-home-panel__focus-text">{activeModule.hint}</p>
              <Link to={activeModule.to} className="hub-home-panel__focus-link">
                {activeModule.action}
              </Link>
            </div>
            <div className="hub-home-panel__shortcuts">
              {modules.map((module, index) => (
                <button
                  key={module.title}
                  type="button"
                  className={`hub-home-panel__chip ${index === activeFocus ? 'hub-home-panel__chip--active' : ''}`}
                  onClick={() => setActiveFocus(index)}
                >
                  {module.title}
                </button>
              ))}
            </div>
            <div className="hub-home-panel__controls">
              <div className="hub-home-panel__dots">
                {modules.map((module, index) => (
                  <button
                    key={module.title}
                    type="button"
                    className={`hub-home-panel__dot ${index === activeFocus ? 'hub-home-panel__dot--active' : ''}`}
                    onClick={() => setActiveFocus(index)}
                    aria-label={`Show ${module.title}`}
                  />
                ))}
              </div>
              <div className="hub-home-panel__actions">
                <button type="button" className="hub-home-panel__button" onClick={() => setActiveFocus((current) => (current === 0 ? modules.length - 1 : current - 1))}>
                  Prev
                </button>
                <button type="button" className="hub-home-panel__button" onClick={() => setActiveFocus((current) => (current + 1) % modules.length)}>
                  Next
                </button>
              </div>
            </div>
          </ParallaxPanel>
        </Reveal>
      </section>

      <section id="home-modules" className="hub-home-cards hub-home-section" aria-label="Student modules">
        {modules.map((module, index) => (
          <Reveal key={module.title} delay={index * 70}>
            <ParallaxPanel className={`hub-home-card ${module.tone}`} strength={6}>
              <p className="hub-home-card__badge">{module.badge}</p>
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
          className="hub-home-steps hub-home-section"
          aria-label="How it works"
        >
          {steps.map((step) => (
            <article
              key={step.title}
              className={`hub-home-step ${step.tone}`}
            >
              <div className="hub-home-step__spark" aria-hidden="true">
                {step.icon}
              </div>
              <p className="hub-home-step__eyebrow">How it works</p>
              <div className="hub-home-step__badge">{step.accent}</div>
              <h2 className="hub-home-step__title">{step.title}</h2>
              <p className="hub-home-step__text">{step.description}</p>
            </article>
          ))}
        </section>
      </Reveal>
    </div>
  )
}

