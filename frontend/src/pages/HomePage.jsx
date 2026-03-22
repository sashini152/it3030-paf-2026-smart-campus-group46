import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../api/client'

export default function HomePage() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getJson('/api/health')
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="hub-page">
      <section className="hub-hero">
        <h1>Operations hub for your campus</h1>
        <p className="hub-lead">
          Book facilities and equipment, track maintenance tickets, and stay
          updated with notifications — all in one place.
        </p>
        <div className="hub-hero__status" role="status">
          {health && (
            <span className="hub-pill hub-pill--ok">
              API connected · {health.service}
            </span>
          )}
          {error && (
            <span className="hub-pill hub-pill--warn">
              API offline — start the Spring Boot server on port 8080
            </span>
          )}
          {!health && !error && (
            <span className="hub-pill hub-pill--muted">Checking API…</span>
          )}
        </div>
      </section>

      <section className="hub-cards" aria-label="Modules">
        <article className="hub-card">
          <h2>Facilities &amp; assets</h2>
          <p>
            Catalogue rooms, labs, and equipment. Search by type, capacity, and
            location.
          </p>
          <Link to="/resources" className="hub-card__action">
            Open resources
          </Link>
        </article>
        <article className="hub-card">
          <h2>Bookings</h2>
          <p>
            Request slots, avoid conflicts, and let admins approve or reject
            requests.
          </p>
          <Link to="/bookings" className="hub-card__action">
            Open bookings
          </Link>
        </article>
        <article className="hub-card">
          <h2>Maintenance &amp; incidents</h2>
          <p>
            Raise tickets with evidence, track workflow, and collaborate with
            technicians.
          </p>
          <Link to="/tickets" className="hub-card__action">
            Open tickets
          </Link>
        </article>
        <article className="hub-card">
          <h2>Notifications &amp; access</h2>
          <p>
            See booking and ticket updates. Sign in with Google when OAuth is
            configured.
          </p>
          <Link to="/notifications" className="hub-card__action">
            Notifications
          </Link>
        </article>
      </section>
    </div>
  )
}
