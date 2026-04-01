export default function PageIntro({ eyebrow, title, description, actions, className = '' }) {
  return (
    <section className={`space-y-4 ${className}`.trim()}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#327f7d]">
          {eyebrow}
        </p>
      )}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-3xl text-base leading-7 text-[#64748b]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </section>
  )
}
