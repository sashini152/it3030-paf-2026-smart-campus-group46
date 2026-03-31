export default function EmptyState({ title, description, action, className = '', tone = 'default' }) {
  const toneClass =
    tone === 'ticket'
      ? 'border-[#54162B] bg-[#242E49] text-white'
      : 'border-dashed border-[#d8e0ea] bg-[#f8fbff] text-[#64748b]'

  const titleClass = tone === 'ticket' ? 'text-white' : 'text-[#0f172a]'

  return (
    <div
      className={`rounded-[24px] border px-5 py-6 text-sm ${toneClass} ${className}`.trim()}
    >
      {title && <p className={`text-base font-semibold ${titleClass}`}>{title}</p>}
      {description && <p className={title ? 'mt-2 leading-6' : 'leading-6'}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
