export default function Tooltip({ text, children, className = '' }) {
  return (
    <span className={`hub-tooltip ${className}`.trim()} tabIndex={0}>
      {children}
      <span className="hub-tooltip__bubble">{text}</span>
    </span>
  )
}
