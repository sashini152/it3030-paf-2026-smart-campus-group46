import { useState } from 'react'
import * as ticketService from '../services/ticketService'

const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER']
const priorities = ['LOW', 'MEDIUM', 'HIGH']

export default function TicketForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('HARDWARE')
  const [priority, setPriority] = useState('LOW')
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title is required.'
    if (!description.trim()) e.description = 'Description is required.'
    if (!categories.includes(category)) e.category = 'Invalid category.'
    if (!priorities.includes(priority)) e.priority = 'Invalid priority.'
    if (files.length > 3) e.files = 'Maximum 3 images allowed.'
    files.forEach((file, i) => {
      if (!file.type.startsWith('image/')) {
        e.files = 'Only image files are allowed.'
      }
      if (file.size > 5 * 1024 * 1024) {
        e.files = 'Each file must be smaller than 5MB.'
      }
    })
    return e
  }

  const handleFiles = (event) => {
    const fileList = Array.from(event.target.files || [])
    setFiles(fileList)
    setErrors((prev) => ({ ...prev, files: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    try {
      const created = await ticketService.createTicket({
        title,
        description,
        category,
        priority,
      })

      if (files.length) {
        await ticketService.uploadTicketImages(created.id, files)
      }

      setTitle('')
      setDescription('')
      setCategory('HARDWARE')
      setPriority('LOW')
      setFiles([])
      setErrors({})
      if (onCreated) onCreated(created)
    } catch (error) {
      setServerError(error.message || 'Unable to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
      <h2 className="text-xl font-semibold">Create Ticket</h2>

      {serverError && <div className="text-red-400">{serverError}</div>}

      <label className="block">
        <span className="text-sm">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2"
        />
        {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
      </label>

      <label className="block">
        <span className="text-sm">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2"
        />
        {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2"
          >
            {categories.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-400 text-sm">{errors.category}</p>}
        </label>

        <label className="block">
          <span className="text-sm">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2"
          >
            {priorities.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.priority && <p className="text-red-400 text-sm">{errors.priority}</p>}
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Images (max 3)</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="mt-1 block w-full text-sm text-slate-200"
        />
        {errors.files && <p className="text-red-400 text-sm">{errors.files}</p>}
        {files.length > 0 && <p className="text-slate-300 text-sm mt-1">{files.length} file(s) selected</p>}
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Create Ticket'}
      </button>
    </form>
  )
}
