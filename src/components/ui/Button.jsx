import { T } from '../../data/constants';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: T.font,
    fontWeight: 600,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s',
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: 13, borderRadius: 8 },
    md: { padding: '12px 24px', fontSize: 15, borderRadius: T.radius },
    lg: { padding: '16px 32px', fontSize: 17, borderRadius: T.radius },
  };

  const variantStyles = {
    primary: {
      background: T.green,
      color: T.white,
    },
    secondary: {
      background: T.subtle,
      color: T.text,
    },
    outline: {
      background: 'transparent',
      color: T.green,
      border: `1.5px solid ${T.green}`,
    },
    ghost: {
      background: 'transparent',
      color: T.text,
    },
    danger: {
      background: T.error,
      color: T.white,
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
