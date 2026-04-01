export default function Tooltip({ text, children, className = '', tone = 'default' }) {
  return (
    <span className={`hub-tooltip ${tone === 'ticket' ? ' hub-tooltip--ticket' : ''} ${className}`.trim()} tabIndex={0}>
      {children}
      <span className="hub-tooltip__bubble">{text}</span>
    </span>
  )
}
