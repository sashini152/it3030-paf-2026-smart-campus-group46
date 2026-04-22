function toneClass(tone) {
  switch (tone) {
    case 'soft':
      return 'bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fc_100%)]'
    case 'subtle':
      return 'bg-[#f8fbff]'
    default:
      return 'bg-white'
  }
}

export default function SurfaceCard({
  as: Tag = 'section',
  className = '',
  tone = 'soft',
  children,
  ...props
}) {
  return (
    <Tag
      {...props}
      className={`rounded-[30px] border border-[#d8e0ea] ${toneClass(tone)} p-6 text-[#0f172a] shadow-[0_20px_48px_rgba(15,23,42,0.08)] ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}
