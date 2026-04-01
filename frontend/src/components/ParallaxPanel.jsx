function setMotion(event, strength) {
  const node = event.currentTarget
  const rect = node.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  node.style.setProperty('--hub-rotate-x', `${-y * strength * 0.45}deg`)
  node.style.setProperty('--hub-rotate-y', `${x * strength * 0.55}deg`)
  node.style.setProperty('--hub-shift-x', `${x * strength * 0.8}px`)
  node.style.setProperty('--hub-shift-y', `${y * strength * 0.8}px`)
}

function resetMotion(event) {
  const node = event.currentTarget
  node.style.setProperty('--hub-rotate-x', '0deg')
  node.style.setProperty('--hub-rotate-y', '0deg')
  node.style.setProperty('--hub-shift-x', '0px')
  node.style.setProperty('--hub-shift-y', '0px')
}

export default function ParallaxPanel({
  as: Tag = 'div',
  className = '',
  strength = 12,
  children,
  ...props
}) {
  return (
    <Tag
      className={`hub-parallax-panel ${className}`.trim()}
      onMouseMove={(event) => setMotion(event, strength)}
      onMouseLeave={resetMotion}
      {...props}
    >
      {children}
    </Tag>
  )
}
