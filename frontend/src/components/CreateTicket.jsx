import { useMemo, useState } from 'react'
import SurfaceCard from './SurfaceCard'
import { createStandardTicket } from '../services/ticketService'

const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER']
const priorities = ['LOW', 'MEDIUM', 'HIGH']

function sanitizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function lettersAndSpacesOnly(value) {
  return /^[A-Za-z ]+$/.test(value)
}

const inputClass =
  'mt-2 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#327f7d] focus:ring-4 focus:ring-[rgba(50,127,125,0.14)]'

function FieldError({ children }) {
  return <p className="mt-2 text-sm text-[#8a3f32]">{children}</p>
}

export default function CreateTicket({ onCreated }) {
  const [createdBy, setCreatedBy] = useState(localStorage.getItem('ticket.userName') || '')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('HARDWARE')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [attachments, setAttachments] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState('')

  const attachmentNames = useMemo(() => attachments.map((file) => file.name), [attachments])

  function validate() {
    const nextErrors = {}
    const normalizedName = sanitizeWhitespace(createdBy)
    const normalizedTitle = sanitizeWhitespace(title)
    const normalizedDescription = sanitizeWhitespace(description)

    if (!normalizedName) nextErrors.createdBy = 'Reporter name is required.'
    else if (normalizedName.length < 3) nextErrors.createdBy = 'Reporter name must be at least 3 characters.'
    else if (normalizedName.length > 60) nextErrors.createdBy = 'Reporter name must be 60 characters or less.'
    else if (!lettersAndSpacesOnly(normalizedName)) nextErrors.createdBy = 'Reporter name can contain letters and spaces only.'

    if (!normalizedTitle) nextErrors.title = 'Title is required.'
    else if (normalizedTitle.length < 5) nextErrors.title = 'Title must be at least 5 characters.'
    else if (normalizedTitle.length > 80) nextErrors.title = 'Title must be 80 characters or less.'
    else if (!lettersAndSpacesOnly(normalizedTitle)) nextErrors.title = 'Title can contain letters and spaces only.'

    if (!categories.includes(category)) nextErrors.category = 'Select a valid category.'
    if (!priorities.includes(priority)) nextErrors.priority = 'Select a valid priority.'

    if (!normalizedDescription) nextErrors.description = 'Description is required.'
    else if (normalizedDescription.length < 20) nextErrors.description = 'Description must be at least 20 characters.'
    else if (normalizedDescription.length > 300) nextErrors.description = 'Description must be 300 characters or less.'

    if (attachments.length > 3) nextErrors.attachments = 'Maximum 3 attachments allowed.'
    attachments.forEach((file) => {
      if (!file.type.startsWith('image/')) nextErrors.attachments = 'Only image files are allowed.'
      if (file.size > 5 * 1024 * 1024) nextErrors.attachments = 'Each image must be smaller than 5MB.'
    })

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerMessage('')

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const normalizedName = sanitizeWhitespace(createdBy)
      localStorage.setItem('ticket.userName', normalizedName)

      const created = await createStandardTicket({
        createdBy: normalizedName,
        title: sanitizeWhitespace(title),
        category,
        description: sanitizeWhitespace(description),
        priority,
        imageUrls: [],
      })

      setTitle('')
      setDescription('')
      setCategory('HARDWARE')
      setPriority('MEDIUM')
      setAttachments([])
      setErrors({})
      setServerMessage(`Ticket created successfully with ID ${created.id}.`)
      if (onCreated) onCreated(created)
    } catch (error) {
      setServerMessage(error.message || 'Unable to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleAttachments(event) {
    setAttachments(Array.from(event.target.files || []).slice(0, 3))
    setErrors((current) => ({ ...current, attachments: undefined }))
  }

  return (
    <SurfaceCard as="form" onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Create Ticket</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">Quick support submission</h2>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          This version uses the `/api/tickets` endpoint and sends the fields your backend requires.
        </p>
      </div>

      {serverMessage && (
        <div className="rounded-2xl border border-[#d8e0ea] bg-white px-4 py-3 text-sm text-[#334155]">
          {serverMessage}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium text-[#1e293b]">Reporter name</span>
        <input
          type="text"
          value={createdBy}
          onChange={(event) => setCreatedBy(event.target.value)}
          placeholder="Your name"
          className={inputClass}
        />
        {errors.createdBy && <FieldError>{errors.createdBy}</FieldError>}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#1e293b]">Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Projector not turning on"
          className={inputClass}
        />
        {errors.title && <FieldError>{errors.title}</FieldError>}
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[#1e293b]">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.category && <FieldError>{errors.category}</FieldError>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#1e293b]">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className={inputClass}
          >
            {priorities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.priority && <FieldError>{errors.priority}</FieldError>}
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-[#1e293b]">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          maxLength={300}
          placeholder="Describe the issue, when it started, and how it affects the student or staff member."
          className={inputClass}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-[#64748b]">
          <span>Minimum 20 characters.</span>
          <span>{description.length}/300</span>
        </div>
        {errors.description && <FieldError>{errors.description}</FieldError>}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#1e293b]">Attachments</span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleAttachments}
          className={`${inputClass} text-[#475569]`}
        />
        <p className="mt-2 text-xs leading-5 text-[#64748b]">
          Image selection is validated here, but the backend upload endpoint is not exposed yet, so files are not sent with the ticket create request.
        </p>
        {attachmentNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachmentNames.map((name) => (
              <span key={name} className="rounded-full border border-[#d8e0ea] bg-white px-3 py-1 text-xs text-[#475569]">
                {name}
              </span>
            ))}
          </div>
        )}
        {errors.attachments && <FieldError>{errors.attachments}</FieldError>}
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-2xl border border-[#327f7d] bg-[linear-gradient(180deg,#274c77_0%,#163455_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(50,127,125,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Creating ticket...' : 'Create Ticket'}
      </button>
    </SurfaceCard>
  )
}
