const variants = {
  default: 'bg-[#1f172f]/10 text-[#1f172f]',
  primary: 'bg-[#f3a76a]/15 text-[#ad5f26]',
  success: 'bg-[#7aa998]/15 text-[#5a8978]',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-600',
  muted: 'bg-[#6f677b]/10 text-[#6f677b]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    draft: { variant: 'muted', label: 'Draft' },
    scheduled: { variant: 'info', label: 'Scheduled' },
    sending: { variant: 'warning', label: 'Sending' },
    sent: { variant: 'success', label: 'Sent' },
    paused: { variant: 'warning', label: 'Paused' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    failed: { variant: 'danger', label: 'Failed' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'muted', label: 'Inactive' },
    unsubscribed: { variant: 'danger', label: 'Unsubscribed' },
    delivered: { variant: 'success', label: 'Delivered' },
    pending: { variant: 'warning', label: 'Pending' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
