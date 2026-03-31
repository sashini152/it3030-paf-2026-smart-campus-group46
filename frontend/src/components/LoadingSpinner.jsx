export default function LoadingSpinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex min-h-[120px] items-center justify-center ${className}`.trim()}>
      <div className="inline-flex items-center gap-3 rounded-full border border-[#d8e0ea] bg-white px-4 py-2 text-sm text-[#64748b] shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-[#327f7d] animate-pulse" />
        <span>{label}</span>
      </div>
    </div>
  )
}
