export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <div
      className={`rounded-[24px] border border-dashed border-[#d8e0ea] bg-[#f8fbff] px-5 py-6 text-sm text-[#64748b] ${className}`.trim()}
    >
      {title && <p className="text-base font-semibold text-[#0f172a]">{title}</p>}
      {description && <p className={title ? 'mt-2 leading-6' : 'leading-6'}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
