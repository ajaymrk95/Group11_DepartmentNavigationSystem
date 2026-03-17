import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-modal w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-cream-dark">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-cream rounded-lg transition-colors">
            <X size={18} className="text-steel" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, danger = true }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-5">
        <AlertTriangle size={20} className={danger ? 'text-red-500 mt-0.5 shrink-0' : 'text-amber mt-0.5 shrink-0'} />
        <p className="text-sm text-steel">{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose() }} className={danger ? 'btn-danger' : 'btn-amber'}>
          Confirm
        </button>
      </div>
    </Modal>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  const icons = { success: CheckCircle, error: AlertTriangle, info: Info }
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-navy/5 border-navy/20 text-navy'
  }
  const Icon = icons[type]
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card ${colors[type]}`}>
      <Icon size={16} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="p-4 bg-cream rounded-2xl mb-4"><Icon size={28} className="text-steel" /></div>}
      <h3 className="font-display text-lg font-semibold text-navy mb-1">{title}</h3>
      <p className="text-sm text-steel mb-5 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'navy' }) {
  const colors = {
    navy: 'from-navy to-navy-light text-cream',
    steel: 'from-steel to-steel-light text-cream',
    amber: 'from-amber/80 to-amber text-navy',
  }
  return (
    <div className={`rounded-xl p-5 bg-gradient-to-br ${colors[color]} shadow-card`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium opacity-70 uppercase tracking-wider">{title}</p>
        {Icon && <Icon size={18} className="opacity-60" />}
      </div>
      <p className="font-display text-3xl font-bold mb-0.5">{value}</p>
      {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
    </div>
  )
}

export function JsonEditor({ value, onChange, label, height = '200px' }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea
        className="w-full font-mono text-xs bg-navy/5 border border-cream-dark rounded-lg p-3 focus:outline-none focus:border-steel resize-none"
        style={{ height }}
        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-steel mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Badge({ children, variant = 'steel' }) {
  const variants = {
    steel: 'badge-steel',
    blue: 'badge-blue',
    amber: 'badge-amber',
    green: 'badge-green',
    red: 'badge-red',
  }
  return <span className={variants[variant]}>{children}</span>
}

export function categoryBadge(cat) {
  const map = {
    classroom: { label: 'Classroom', variant: 'blue' },
    lab: { label: 'Lab', variant: 'amber' },
    hall: { label: 'Hall', variant: 'green' },
    toilet: { label: 'Toilet', variant: 'steel' },
    office: { label: 'Office', variant: 'steel' },
    corridor: { label: 'Corridor', variant: 'steel' },
    staircase: { label: 'Staircase', variant: 'steel' },
    other: { label: 'Other', variant: 'steel' },
  }
  const { label, variant } = map[cat] || { label: cat, variant: 'steel' }
  return <Badge variant={variant}>{label}</Badge>
}
