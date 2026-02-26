import { T, GRADES } from '../../data/constants';

export function Badge({ children, variant = 'default', style = {} }) {
  const variants = {
    default: { background: T.subtle, color: T.text },
    success: { background: T.greenLight, color: T.green },
    warning: { background: T.warningBg, color: T.warning },
    error: { background: T.errorBg, color: T.error },
    info: { background: '#dbeafe', color: '#1d4ed8' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 600,
        borderRadius: T.radiusFull,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function GradeBadge({ grade }) {
  const gradeInfo = GRADES[grade] || GRADES.B;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 6,
        background: gradeInfo.bg,
        color: gradeInfo.color,
      }}
      title={gradeInfo.desc}
    >
      {gradeInfo.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusMap = {
    PENDING: { label: 'Pending', variant: 'default' },
    PAID: { label: 'Paid', variant: 'info' },
    CONFIRMED: { label: 'Confirmed', variant: 'info' },
    PREPARING: { label: 'Preparing', variant: 'warning' },
    SHIPPED: { label: 'Shipped', variant: 'info' },
    DELIVERED: { label: 'Delivered', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'error' },
    REFUNDED: { label: 'Refunded', variant: 'error' },
    NEGOTIATING: { label: 'Negotiating', variant: 'warning' },
    ACCEPTED: { label: 'Accepted', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'error' },
    CONVERTED: { label: 'Converted', variant: 'success' },
    EXPIRED: { label: 'Expired', variant: 'default' },
  };

  const info = statusMap[status] || { label: status, variant: 'default' };

  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export default Badge;
