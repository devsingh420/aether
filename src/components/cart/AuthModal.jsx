import { useState } from 'react';
import { T } from '../../data/constants';
import { Icon } from '../../data/icons';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useStore } from '../../store';
import api from '../../services/api';

export function AuthModal({ isOpen, onClose }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (authMode === 'login') {
        data = await api.login(email, password);
      } else {
        data = await api.register({ email, password, name, phone });
      }

      setUser(data.data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    try {
      const data = await api.request('/auth/line');
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      setError('LINE Login not available');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={authMode === 'login' ? 'Welcome Back' : 'Create Account'}
      width={400}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: T.errorBg,
              color: T.error,
              padding: 12,
              borderRadius: T.radius,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {authMode === 'register' && (
          <>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08X-XXX-XXXX"
            />
          </>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={authMode === 'register' ? 'At least 8 characters' : 'Enter password'}
          required
        />

        <Button type="submit" fullWidth disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <span style={{ color: T.gray, fontSize: 13 }}>or continue with</span>
      </div>

      <Button
        variant="outline"
        fullWidth
        onClick={handleLineLogin}
        style={{
          color: '#00B900',
          borderColor: '#00B900',
          gap: 8,
        }}
      >
        <span style={{ color: '#00B900' }}>{Icon.line}</span>
        LINE
      </Button>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        {authMode === 'login' ? (
          <p style={{ margin: 0, fontSize: 14, color: T.gray }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              style={{
                background: 'none',
                border: 'none',
                color: T.green,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: T.gray }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              style={{
                background: 'none',
                border: 'none',
                color: T.green,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
}

export default AuthModal;
