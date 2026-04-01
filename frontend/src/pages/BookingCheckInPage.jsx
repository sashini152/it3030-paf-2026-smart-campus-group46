import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getJson, patchJson } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

export default function BookingCheckInPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const bookingId = searchParams.get('booking') || ''
  const tokenFromUrl = searchParams.get('token') || ''
  const [token, setToken] = useState(tokenFromUrl)

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    setError(null)
    getJson(`/api/bookings/${bookingId}/check-in`)
      .then(setBooking)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [bookingId])

  useEffect(() => {
    if (!tokenFromUrl) return
    handleVerify(tokenFromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl])

  const qrValue = useMemo(() => {
    if (!booking?.checkInToken) return ''
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/booking-check-in?token=${encodeURIComponent(booking.checkInToken)}`
  }, [booking?.checkInToken])

  async function handleVerify(submittedToken = token) {
    if (!submittedToken.trim()) {
      setError('Enter a booking verification token first.')
      return
    }
    setVerifying(true)
    setError(null)
    try {
      const verified = await patchJson('/api/bookings/check-in/verify', {
        token: submittedToken.trim(),
        verifiedBy: user?.email || user?.name || 'front-desk',
      })
      setResult(verified)
    } catch (requestError) {
      setError(requestError.message)
      setResult(null)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="hub-page hub-page--wide space-y-6">
      <section className="hub-panel">
        <h1 className="hub-panel__title">Booking QR check-in</h1>
        <p className="hub-lead">
          Show the QR code for an approved booking or verify a token from the front-desk screen.
        </p>
        {error && (
          <div className="hub-alert hub-alert--error" role="alert">
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="hub-panel">
          <h2 className="hub-panel__title">Approved booking QR</h2>
          {loading ? (
            <div className="hub-loading">Loading check-in details...</div>
          ) : booking ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Resource:</strong> {booking.resourceId}</p>
                <p><strong>Requested by:</strong> {booking.requestedByUserId}</p>
                <p><strong>Start:</strong> {formatDateTime(booking.startDateTime)}</p>
                <p><strong>Status:</strong> {booking.status}</p>
              </div>
              {booking.checkInToken && (
                <>
                  <div className="flex justify-center rounded-3xl border border-slate-200 bg-white p-6">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}`}
                      alt="Booking QR code"
                      className="h-[260px] w-[260px]"
                    />
                  </div>
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Verification token</p>
                    <p className="mt-2 break-all font-mono">{booking.checkInToken}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      If the QR image does not load, the token can still be entered manually in the verification panel.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hub-empty">
              <p>No booking selected.</p>
              <p className="hub-muted">Open this page from an approved booking to display its QR code.</p>
            </div>
          )}
        </article>

        <article className="hub-panel">
          <h2 className="hub-panel__title">Verification screen</h2>
          <div className="space-y-4">
            <label className="hub-field">
              <span>Check-in token</span>
              <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste or scan token" />
            </label>
            <button
              type="button"
              className="hub-btn hub-btn--primary"
              onClick={() => handleVerify()}
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Verify booking'}
            </button>

            {result && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                <p className="text-base font-semibold">Check-in verified</p>
                <p className="mt-2"><strong>Booking:</strong> {result.id}</p>
                <p><strong>Resource:</strong> {result.resourceId}</p>
                <p><strong>User:</strong> {result.requestedByUserId}</p>
                <p><strong>Checked in at:</strong> {formatDateTime(result.checkedInAt)}</p>
                <p><strong>Verified by:</strong> {result.checkedInBy || '-'}</p>
              </div>
            )}

            <Link to="/user-bookings" className="inline-flex text-sm font-semibold text-[#B4182D]">
              Back to bookings
            </Link>
          </div>
        </article>
      </section>
    </div>
  )
}
