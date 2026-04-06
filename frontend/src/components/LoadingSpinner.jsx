export default function LoadingSpinner({ label = 'Loading...', className = '', tone = 'default' }) {
  const panelClass =
    tone === 'ticket'
      ? 'border-[#54162B] bg-[#242E49] text-white shadow-none'
      : 'border-[#d8e0ea] bg-white text-[#64748b] shadow-sm'

  const dotClass = tone === 'ticket' ? 'bg-[#FDA481]' : 'bg-[#327f7d]'

  return (
    <div className={`flex min-h-[120px] items-center justify-center ${className}`.trim()}>
      <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${panelClass}`}>
        <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${dotClass}`} />
        <span>{label}</span>
      </div>
    </div>
  )
}
