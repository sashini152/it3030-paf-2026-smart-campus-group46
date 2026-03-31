import { useEffect, useMemo, useState } from 'react'
import Reveal from './Reveal'
import Tooltip from './Tooltip'
import * as ticketService from '../services/ticketService'

const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER']
const priorities = ['LOW', 'MEDIUM', 'HIGH']

const categoryCopy = {
  HARDWARE: 'Labs, printers, classroom devices, and physical equipment.',
  SOFTWARE: 'Accounts, apps, portals, and system access issues.',
  NETWORK: 'Wi-Fi, internet, LAN, and connectivity interruptions.',
  OTHER: 'Anything that does not fit the main campus support groups.',
}

const priorityCopy = {
  LOW: 'General issue, not blocking activity.',
  MEDIUM: 'Needs attention soon and affects normal work.',
  HIGH: 'Blocking classes, labs, or key operations.',
}

const priorityTone = {
  LOW: 'border-[#b9d7d6] bg-[#f7fbfb] text-[#327f7d]',
  MEDIUM: 'border-[#d7dee8] bg-[#eef2f7] text-[#334155]',
  HIGH: 'border-[#1e3a5f] bg-[#18314f] text-[#f8fbff]',
}

function cls(...values) {
  return values.filter(Boolean).join(' ')
}

const inputClass =
  'mt-2 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#327f7d] focus:ring-4 focus:ring-[rgba(50,127,125,0.14)]'

function FieldHint({ children }) {
  return <p className="mt-2 text-xs leading-5 text-[#64748b]">{children}</p>
}

function FieldError({ children }) {
  return <p className="mt-2 text-sm text-[#8a3f32]">{children}</p>
}

function sanitizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function hasLettersAndSpacesOnly(value) {
  return /^[A-Za-z ]+$/.test(value)
}

export default function TicketForm({ onCreated }) {
  const [userName, setUserName] = useState(localStorage.getItem('ticket.userName') || '')
  const [userEmail, setUserEmail] = useState(localStorage.getItem('ticket.userEmail') || '')
  const [resource, setResource] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('HARDWARE')
  const [priority, setPriority] = useState('MEDIUM')
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, size: file.size, url: URL.createObjectURL(file) })),
    [files]
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  const validate = () => {
    const nextErrors = {}
    const normalizedName = sanitizeWhitespace(userName)
    const normalizedResource = sanitizeWhitespace(resource)
    const normalizedTitle = sanitizeWhitespace(title)
    const normalizedDescription = sanitizeWhitespace(description)

    if (!normalizedName) nextErrors.userName = 'Name is required.'
    else if (normalizedName.length < 3) nextErrors.userName = 'Name must be at least 3 characters.'
    else if (normalizedName.length > 60) nextErrors.userName = 'Name must be 60 characters or less.'
    else if (!hasLettersAndSpacesOnly(normalizedName)) nextErrors.userName = 'Name can contain letters and spaces only.'

    if (!userEmail.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) {
      nextErrors.userEmail = 'Valid email is required.'
    }

    if (!normalizedResource) nextErrors.resource = 'Resource or location is required.'
    else if (normalizedResource.length < 3) nextErrors.resource = 'Resource or location must be at least 3 characters.'
    else if (normalizedResource.length > 100) nextErrors.resource = 'Resource or location must be 100 characters or less.'

    if (!normalizedTitle) nextErrors.title = 'Title is required.'
    else if (normalizedTitle.length < 5) nextErrors.title = 'Title must be at least 5 characters.'
    else if (normalizedTitle.length > 80) nextErrors.title = 'Title must be 80 characters or less.'
    else if (!hasLettersAndSpacesOnly(normalizedTitle)) {
      nextErrors.title = 'Title can contain letters and spaces only. Do not use numbers or special characters.'
    }

    if (!normalizedDescription) nextErrors.description = 'Description is required.'
    else if (normalizedDescription.length < 20) nextErrors.description = 'Description must be at least 20 characters.'
    else if (normalizedDescription.length > 300) nextErrors.description = 'Description must not exceed 300 characters.'

    if (!categories.includes(category)) nextErrors.category = 'Invalid category.'
    if (!priorities.includes(priority)) nextErrors.priority = 'Invalid priority.'
    if (files.length > 3) nextErrors.files = 'Maximum 3 images allowed.'

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) nextErrors.files = 'Only image files are allowed.'
      if (file.size > 5 * 1024 * 1024) nextErrors.files = 'Each file must be smaller than 5MB.'
    })

    return nextErrors
  }

  const resetForm = () => {
    setResource('')
    setTitle('')
    setDescription('')
    setCategory('HARDWARE')
    setPriority('MEDIUM')
    setFiles([])
    setErrors({})
  }

  const handleFiles = (event) => {
    const fileList = Array.from(event.target.files || []).slice(0, 3)
    setFiles(fileList)
    setDragActive(false)
    setErrors((current) => ({ ...current, files: undefined }))
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    const fileList = Array.from(event.dataTransfer.files || []).slice(0, 3)
    setFiles(fileList)
    setErrors((current) => ({ ...current, files: undefined }))
  }

  const preventDefault = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    setSuccessMessage('')

    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    try {
      const payload = {
        title: sanitizeWhitespace(title),
        description: sanitizeWhitespace(description),
        category,
        priority,
        resource: sanitizeWhitespace(resource),
        createdBy: sanitizeWhitespace(userName),
        userEmail: userEmail.trim(),
      }

      const created = await ticketService.createTicket({
        ...payload,
      })

      if (files.length) {
        await ticketService.uploadTicketImages(created.id, files)
      }

      resetForm()
      setSuccessMessage('Ticket submitted successfully. The support team can now review it.')
      if (onCreated) onCreated(created)
    } catch (error) {
      setServerError(error.message || 'Unable to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitDisabled =
    submitting ||
    !userName.trim() ||
    !userEmail.trim() ||
    !resource.trim() ||
    !title.trim() ||
    !description.trim() ||
    files.length > 3

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[36px] border border-[#d9e2ec] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fb_100%)] text-[#0f172a] shadow-[0_38px_90px_rgba(15,23,42,0.12)]"
    >
      <div className="border-b border-[#dde5ef] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.12),_transparent_34%),linear-gradient(135deg,#ffffff_0%,#f4f8fc_100%)] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Support Intake</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a]">Submit a campus support ticket</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475569]">
              Report the issue clearly, attach evidence if needed, and give the admin team enough context to respond without chasing missing details.
            </p>
          </div>
          <div className="hub-lift rounded-2xl border border-[#b9d7d6] bg-white px-4 py-3 text-sm text-[#327f7d] shadow-sm">
            <div className="flex items-center gap-2">
              <span>Typical response: same working day</span>
              <Tooltip text="High-priority incidents may move faster depending on queue load.">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#b9d7d6] text-[11px] font-semibold">
                  i
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
        {serverError && (
          <div className="hub-fade-slide rounded-2xl border border-[#d3b7ab] bg-[#f6ece7] px-4 py-3 text-sm text-[#8a3f32]">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="hub-fade-slide rounded-2xl border border-[#b9d7d6] bg-white px-4 py-3 text-sm text-[#327f7d]">
            {successMessage}
          </div>
        )}

        <Reveal delay={40}>
          <section className="hub-lift rounded-[30px] border border-[#dde5ef] bg-white/85 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0f172a]">Reporter details</h3>
            <p className="mt-1 text-sm text-[#64748b]">These details help the team identify who reported the issue and where to reply.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#1e293b]">Full name</span>
              <input
                type="text"
                value={userName}
                onChange={(event) => {
                  setUserName(event.target.value)
                  localStorage.setItem('ticket.userName', event.target.value)
                }}
                className={inputClass}
                placeholder="Your name"
              />
              {errors.userName ? <FieldError>{errors.userName}</FieldError> : <FieldHint>Use the name admins will recognize.</FieldHint>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#1e293b]">Campus email</span>
              <input
                type="email"
                value={userEmail}
                onChange={(event) => {
                  setUserEmail(event.target.value)
                  localStorage.setItem('ticket.userEmail', event.target.value)
                }}
                className={inputClass}
                placeholder="name@campus.edu"
              />
              {errors.userEmail ? <FieldError>{errors.userEmail}</FieldError> : <FieldHint>This is used for follow-up and status updates.</FieldHint>}
            </label>
          </div>
          </section>
        </Reveal>

        <Reveal delay={110}>
          <section className="hub-lift rounded-[30px] border border-[#dde5ef] bg-white/85 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0f172a]">Issue details</h3>
            <p className="mt-1 text-sm text-[#64748b]">Describe where the problem happened and what the support team should inspect first.</p>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[#1e293b]">Resource or location</span>
              <input
                type="text"
                value={resource}
                onChange={(event) => setResource(event.target.value)}
                className={inputClass}
                placeholder="Library level 2, Lab B, Main hall projector"
              />
              {errors.resource ? <FieldError>{errors.resource}</FieldError> : <FieldHint>Include building, floor, room, or specific asset name.</FieldHint>}
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-[#1e293b]">
                <span>Short title</span>
                <Tooltip text="Keep it simple and readable. Numbers and special characters are not allowed in the title.">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d9e2ec] text-[11px] font-semibold text-[#64748b]">
                    ?
                  </span>
                </Tooltip>
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={inputClass}
                placeholder="Projector not turning on"
              />
              {errors.title ? <FieldError>{errors.title}</FieldError> : <FieldHint>Use letters and spaces only. Example: Projector not turning on</FieldHint>}
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-sm font-medium text-[#1e293b]">
                <span>Description</span>
                <span className={description.length > 280 ? 'text-[#8a3f32]' : 'text-[#64748b]'}>{description.length}/300</span>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                maxLength={300}
                className={inputClass}
                placeholder="What happened, when did it start, and how is it affecting the class, room, or service?"
              />
              {errors.description ? <FieldError>{errors.description}</FieldError> : <FieldHint>Good reports mention symptoms, timing, and impact.</FieldHint>}
            </label>
          </div>
          </section>
        </Reveal>

        <Reveal delay={170}>
          <section className="hub-lift rounded-[30px] border border-[#dde5ef] bg-white/85 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0f172a]">Routing and urgency</h3>
            <p className="mt-1 text-sm text-[#64748b]">These selections help the dashboard group your ticket correctly and prioritize the queue.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[#1e293b]">Category</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {categories.map((option) => {
                  const active = category === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={cls(
                        'hub-button-pop rounded-2xl border px-4 py-4 text-left transition',
                        active
                          ? 'border-[#327f7d] bg-[linear-gradient(180deg,#ffffff_0%,#f2fbfa_100%)] shadow-[0_14px_30px_rgba(50,127,125,0.10)]'
                          : 'border-[#e2e8f0] bg-[#ffffff] hover:border-[#b9d7d6] hover:bg-[#f7fbfb]'
                      )}
                    >
                      <p className="text-sm font-semibold text-[#0f172a]">{option}</p>
                      <p className="mt-2 text-xs leading-5 text-[#64748b]">{categoryCopy[option]}</p>
                    </button>
                  )
                })}
              </div>
              {errors.category && <FieldError>{errors.category}</FieldError>}
            </div>

            <div>
              <p className="text-sm font-medium text-[#1e293b]">Priority</p>
              <div className="mt-3 space-y-3">
                {priorities.map((option) => {
                  const active = priority === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPriority(option)}
                      className={cls(
                        'hub-button-pop flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition',
                        active ? priorityTone[option] : 'border-[#e2e8f0] bg-[#ffffff] text-[#1e293b] hover:border-[#b8cce4] hover:bg-[#f7fbff]'
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold">{option}</p>
                        <p className="mt-1 text-xs leading-5 opacity-80">{priorityCopy[option]}</p>
                      </div>
                      <span className={cls('mt-0.5 h-4 w-4 rounded-full border', active ? 'border-current bg-current/15' : 'border-[#b8c4d2]')} />
                    </button>
                  )
                })}
              </div>
              {errors.priority && <FieldError>{errors.priority}</FieldError>}
            </div>
          </div>
          </section>
        </Reveal>

        <Reveal delay={240}>
          <section className="hub-lift rounded-[30px] border border-[#dde5ef] bg-white/85 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0f172a]">Attachments</h3>
            <p className="mt-1 text-sm text-[#64748b]">Upload up to three images if visuals will help the support team identify the problem faster.</p>
          </div>

          <div
            onDragOver={preventDefault}
            onDragEnter={(event) => {
              preventDefault(event)
              setDragActive(true)
            }}
            onDragLeave={(event) => {
              preventDefault(event)
              setDragActive(false)
            }}
            onDrop={handleDrop}
            className={cls(
              'hub-lift rounded-[28px] border border-dashed px-6 py-10 text-center transition',
              dragActive ? 'border-[#327f7d] bg-[#f2fbfa]' : 'border-[#d9e2ec] bg-[#f8fbff]'
            )}
          >
            <p className="text-base font-semibold text-[#0f172a]">Drag and drop images here</p>
            <p className="mt-2 text-sm text-[#64748b]">Or choose files manually. PNG and JPG only, up to 5MB each.</p>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="mx-auto mt-5 block text-sm text-[#475569]" />
          </div>

          {errors.files ? <FieldError>{errors.files}</FieldError> : <FieldHint>Screenshots and device photos often reduce back-and-forth.</FieldHint>}

          {previews.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {previews.map((preview) => (
                <div key={preview.url} className="hub-lift overflow-hidden rounded-[24px] border border-[#dde5ef] bg-[#fbfdff] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  <img src={preview.url} alt={preview.name} className="h-36 w-full object-cover" />
                  <div className="px-4 py-3">
                    <p className="truncate text-sm font-medium text-[#0f172a]">{preview.name}</p>
                    <p className="mt-1 text-xs text-[#64748b]">{Math.round(preview.size / 1024)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </section>
        </Reveal>

        <div className="flex flex-col gap-4 border-t border-[#dde5ef] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-[#475569]">
            Submit only one ticket per issue. If the situation changes later, update it through comments instead of opening duplicates.
          </p>
          <button
            type="submit"
            disabled={submitDisabled}
            className="hub-button-pop inline-flex items-center justify-center rounded-2xl border border-[#327f7d] bg-[linear-gradient(180deg,#274c77_0%,#163455_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(50,127,125,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting ticket...' : 'Submit Ticket'}
          </button>
        </div>
      </div>
    </form>
  )
}
