import { useState } from 'react';
import { T } from '../../data/constants';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useStore } from '../../store';
import { Spinner } from '../ui/Spinner';

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(r => setTimeout(r, 800));

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    // Create user
    const user = {
      id: `user_${Date.now()}`,
      name: mode === 'register' ? name : email.split('@')[0],
      email,
      role: 'BUYER',
    };

    setUser(user);
    setLoading(false);
    onClose();

    // Reset form
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In' : 'Create Account'}
      width={380}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: T.errorBg,
              color: T.error,
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {mode === 'register' && (
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? (
            <Spinner size={18} color={T.white} />
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        {mode === 'login' ? (
          <p style={{ margin: 0, fontSize: 14, color: T.gray }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
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
              onClick={() => { setMode('login'); setError(''); }}
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
