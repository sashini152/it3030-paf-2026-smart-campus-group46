import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getJson, patchJson } from '../api/client'
import { useAuth } from '../auth/useAuth'

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

  const hasQr = Boolean(booking?.checkInToken)
  const verificationActor = user?.name || user?.email || 'Front desk'

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
    <div className="hub-page hub-page--wide space-y-8 rounded-[40px] bg-[radial-gradient(circle_at_top_left,_rgba(253,164,129,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(88,166,255,0.18),_transparent_24%),linear-gradient(180deg,_#fff8f5_0%,_#fffdfb_48%,_#f6f9ff_100%)] p-4 text-[#181A2F] sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,_rgba(36,46,73,0.94)_0%,_rgba(84,22,43,0.92)_100%)] p-6 text-white shadow-[0_28px_80px_rgba(24,26,47,0.28)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-start">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FFD5C4]">
              Scan and stroll in
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Booking QR check-in</h1>
              <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Show the QR for an approved reservation, or paste the token at the desk to verify attendance in a few seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-white/85">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Cute check-in card</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Fast token verify</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Front-desk friendly</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FFD5C4]">Quick flow</p>
            <div className="mt-4 space-y-3 text-sm text-white/85">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="font-semibold text-white">1. Open the approved booking</p>
                <p className="mt-1 text-white/70">Use the QR card on the left for student entry.</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="font-semibold text-white">2. Scan or paste the token</p>
                <p className="mt-1 text-white/70">The same code can be scanned or typed manually.</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="font-semibold text-white">3. Verify with {verificationActor}</p>
                <p className="mt-1 text-white/70">A successful check-in confirms who verified the booking.</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-[24px] border border-rose-200/40 bg-rose-300/12 px-5 py-4 text-sm text-rose-100 shadow-[0_12px_30px_rgba(0,0,0,0.12)]" role="alert">
            {error}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="relative overflow-hidden rounded-[34px] border border-[#ffd9cb] bg-[linear-gradient(180deg,_#fffdfc_0%,_#fff6f1_100%)] p-6 shadow-[0_26px_70px_rgba(84,22,43,0.14)] sm:p-7">
          <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(253,164,129,0.32)_0%,_rgba(253,164,129,0)_70%)]" />
          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B4182D]">Approved booking</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#181A2F]">QR pass</h2>
              </div>
              <span className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                hasQr ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {hasQr ? 'Ready to scan' : 'Waiting for token'}
              </span>
            </div>

            {loading ? (
              <div className="rounded-[28px] border border-dashed border-[#d8dce8] bg-white/70 px-6 py-12 text-center text-sm font-medium text-[#5B647B]">
                Loading check-in details...
              </div>
            ) : booking ? (
              <div className="space-y-5">
                <div className="grid gap-3 rounded-[28px] border border-[#f1d7cc] bg-white/90 p-5 text-sm text-[#37415C] sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B4182D]">Booking ID</p>
                    <p className="mt-1 break-all font-semibold text-[#181A2F]">{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B4182D]">Status</p>
                    <p className="mt-1 font-semibold text-[#181A2F]">{booking.status}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B4182D]">Resource</p>
                    <p className="mt-1 font-semibold text-[#181A2F]">{booking.resourceId}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B4182D]">Requested by</p>
                    <p className="mt-1 break-all font-semibold text-[#181A2F]">{booking.requestedByUserId}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B4182D]">Start time</p>
                    <p className="mt-1 font-semibold text-[#181A2F]">{formatDateTime(booking.startDateTime)}</p>
                  </div>
                </div>

                {hasQr ? (
                  <>
                    <div className="rounded-[32px] border border-[#f1d7cc] bg-[linear-gradient(180deg,_#ffffff_0%,_#fff9f6_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-8">
                      <div className="mx-auto flex max-w-[330px] justify-center rounded-[28px] bg-white p-5 shadow-[0_18px_36px_rgba(24,26,47,0.08)]">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}`}
                          alt="Booking QR code"
                          className="h-[240px] w-[240px] sm:h-[260px] sm:w-[260px]"
                        />
                      </div>
                      <p className="mt-4 text-center text-sm text-[#5B647B]">
                        Scan this at the desk or use the matching token below if the camera is unavailable.
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-dashed border-[#f1c8b7] bg-white/90 p-5 shadow-[0_16px_40px_rgba(180,24,45,0.08)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B4182D]">Verification token</p>
                      <p className="mt-3 break-all rounded-2xl bg-[#fff5f0] px-4 py-3 font-mono text-sm text-[#54162B]">
                        {booking.checkInToken}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#5B647B]">
                        If the QR image does not load, the token can still be entered manually in the verification panel.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-[#d8dce8] bg-white/70 px-6 py-10 text-center text-sm text-[#5B647B]">
                    This booking is not ready for QR check-in yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d8dce8] bg-white/70 px-6 py-12 text-center">
                <p className="text-lg font-semibold text-[#181A2F]">No booking selected</p>
                <p className="mt-2 text-sm leading-6 text-[#5B647B]">
                  Open this page from an approved booking to display its QR code.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[34px] border border-[#dce5ff] bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] p-6 shadow-[0_26px_70px_rgba(88,166,255,0.16)] sm:p-7">
          <div className="pointer-events-none absolute bottom-[-30px] right-[-10px] h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(88,166,255,0.25)_0%,_rgba(88,166,255,0)_72%)]" />
          <div className="relative space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3C6FD1]">Verification screen</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#181A2F]">Front-desk check</h2>
              <p className="text-sm leading-6 text-[#5B647B]">
                Paste a token, or open this page through a scanned QR link and it will verify automatically.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(88,166,255,0.08)] sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C6FD1]">Verifier</p>
                <p className="mt-1 text-sm font-semibold text-[#181A2F]">{verificationActor}</p>
              </div>
              <div className="rounded-[24px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(88,166,255,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C6FD1]">Source</p>
                <p className="mt-1 text-sm font-semibold text-[#181A2F]">{tokenFromUrl ? 'Scanned link' : 'Manual input'}</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-white/88 p-5 shadow-[0_18px_44px_rgba(24,26,47,0.08)]">
              <label className="hub-field">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C6FD1]">Check-in token</span>
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Paste or scan token"
                  className="mt-3 rounded-2xl border border-[#d3dcf5] bg-[#fbfdff] px-4 py-4 text-base text-[#181A2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                />
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#4A87FF_0%,_#69B2FF_100%)] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(74,135,255,0.26)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_42px_rgba(74,135,255,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => handleVerify()}
                  disabled={verifying}
                >
                  {verifying ? 'Verifying...' : 'Verify booking'}
                </button>
                <Link
                  to="/user-bookings"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-[#d3dcf5] bg-white px-5 text-sm font-semibold text-[#3C6FD1] shadow-[0_14px_28px_rgba(88,166,255,0.08)] transition hover:border-[#a9c2ff] hover:text-[#2559bf]"
                >
                  Back to bookings
                </Link>
              </div>
            </div>

            {result ? (
              <div className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(180deg,_#f1fff7_0%,_#e8fff2_100%)] p-5 text-sm text-emerald-900 shadow-[0_16px_38px_rgba(52,211,153,0.12)]">
                <p className="text-base font-semibold">Check-in verified</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Booking</p>
                    <p className="mt-1 font-semibold text-emerald-950">{result.id}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Resource</p>
                    <p className="mt-1 font-semibold text-emerald-950">{result.resourceId}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">User</p>
                    <p className="mt-1 break-all font-semibold text-emerald-950">{result.requestedByUserId}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Verified by</p>
                    <p className="mt-1 font-semibold text-emerald-950">{result.checkedInBy || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3 sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Checked in at</p>
                    <p className="mt-1 font-semibold text-emerald-950">{formatDateTime(result.checkedInAt)}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  )
}

