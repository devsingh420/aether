import { T } from '../../data/constants';

export function Input({
  label,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  style = {},
  ...props
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 500,
            color: T.text,
          }}
        >
          {label}
          {required && <span style={{ color: T.error }}> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 15,
          fontFamily: T.font,
          border: `1.5px solid ${error ? T.error : T.border}`,
          borderRadius: T.radius,
          outline: 'none',
          background: disabled ? T.subtle : T.white,
          color: T.text,
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = T.green;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? T.error : T.border;
        }}
        {...props}
      />
      {error && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: T.error,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ label, error, value, onChange, options, placeholder, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 500,
            color: T.text,
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 15,
          fontFamily: T.font,
          border: `1.5px solid ${error ? T.error : T.border}`,
          borderRadius: T.radius,
          outline: 'none',
          background: T.white,
          color: T.text,
          cursor: 'pointer',
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: T.error }}>{error}</p>
      )}
    </div>
  );
}

export function Textarea({ label, error, value, onChange, rows = 4, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 500,
            color: T.text,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 15,
          fontFamily: T.font,
          border: `1.5px solid ${error ? T.error : T.border}`,
          borderRadius: T.radius,
          outline: 'none',
          background: T.white,
          color: T.text,
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
        {...props}
      />
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: T.error }}>{error}</p>
      )}
    </div>
  );
}

export default Input;
