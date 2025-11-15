import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DashboardProps {
  token: string;
}

interface Config {
  id: string;
  githubOrg: string;
  githubRepos: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

export default function Dashboard({ token }: DashboardProps) {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configsRes, userRes] = await Promise.all([
        axios.get('/api/configs', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setConfigs(configsRes.data.configs);
      setUser(userRes.data.user);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sprint Sync Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Plan: {user?.plan || 'FREE'}</span>
          <Link to="/pricing" className="btn btn-secondary" style={{ marginRight: '10px' }}>
            Upgrade
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Your Configurations</h2>
          <Link to="/config/new" className="btn btn-primary">
            + New Configuration
          </Link>
        </div>

        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ marginBottom: '20px' }}>No configurations yet.</p>
            <Link to="/config/new" className="btn btn-primary">
              Create Your First Configuration
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>GitHub Org</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Repositories</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Last Run</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{config.githubOrg}</td>
                  <td style={{ padding: '12px' }}>{config.githubRepos}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: config.isActive ? '#28a745' : '#6c757d',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      {config.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {config.lastRunAt
                      ? new Date(config.lastRunAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link
                      to={`/config/${config.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

