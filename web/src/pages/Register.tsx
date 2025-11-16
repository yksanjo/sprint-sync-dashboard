import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface RegisterProps {
  setToken: (token: string) => void;
}

export default function Register({ setToken }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();

  // Check database status on mount
  useEffect(() => {
    axios.get('/api/auth/debug')
      .then(res => setDebugInfo(res.data))
      .catch(() => setDebugInfo({ status: 'error', message: 'Could not check database status' }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name: name || undefined,
      });

      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error;
      
      // Show more helpful error messages
      if (errorMsg) {
        if (typeof errorMsg === 'string') {
          setError(errorMsg);
        } else if (Array.isArray(errorMsg)) {
          setError(errorMsg.map((e: any) => e.message || e).join(', '));
        } else {
          setError('Registration failed. Check the error details below.');
        }
      } else {
        setError(err.message || 'Registration failed. Please check your connection and try again.');
      }
      
      // Log full error for debugging
      console.error('Registration error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
          Sprint Sync Dashboard
        </h1>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Register</h2>

        {/* Database Status Check */}
        {debugInfo && debugInfo.status === 'error' && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '16px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>⚠️ Database Issue Detected:</strong>
            <p style={{ margin: '8px 0 0 0' }}>{debugInfo.suggestion || debugInfo.error || 'Database not connected'}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
              Quick fix: Go to Railway → + New → Database → Add PostgreSQL
            </p>
          </div>
        )}

        {error && (
          <div className="error" style={{ 
            padding: '12px', 
            marginBottom: '16px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            <strong>❌ Error:</strong> {error}
            {error.includes('Database') && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <p>💡 Quick Fix:</p>
                <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  <li>Go to Railway Dashboard</li>
                  <li>Click "+ New" → "Database" → "Add PostgreSQL"</li>
                  <li>Wait for database to be created</li>
                  <li>Redeploy your service</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password (min 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}



