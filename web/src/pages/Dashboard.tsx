import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatsCard from '../components/StatsCard';
import ToastContainer, { showToast } from '../components/ToastContainer';

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
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="main-content">
        <LoadingSkeleton />
      </div>
    );
  }

  const activeConfigs = configs.filter(c => c.isActive).length;
  const totalRepos = configs.reduce((sum, c) => sum + c.githubRepos.split(',').length, 0);

  return (
    <>
      <ToastContainer />
      <div className="main-content fade-in">
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <div>
            <h1>Sprint Sync Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Welcome back, {user?.name || user?.email}!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="badge badge-info" style={{ textTransform: 'none' }}>
              {user?.plan || 'FREE'} Plan
            </span>
            {user?.plan === 'FREE' && (
              <Link to="/pricing" className="btn btn-primary">
                Upgrade
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-ghost">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            value={configs.length}
            label="Total Configurations"
            icon="⚙️"
          />
          <StatsCard
            value={activeConfigs}
            label="Active Configurations"
            icon="✅"
          />
          <StatsCard
            value={totalRepos}
            label="Monitored Repositories"
            icon="📦"
          />
          <StatsCard
            value={configs.filter(c => c.lastRunAt).length}
            label="Synced Configs"
            icon="🔄"
          />
        </div>

        {/* Configurations Card */}
        <div className="card fade-in">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <h2>Your Configurations</h2>
            <Link to="/config/new" className="btn btn-primary">
              + New Configuration
            </Link>
          </div>

          {configs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No configurations yet</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Create your first configuration to start syncing sprint data
              </p>
              <Link to="/config/new" className="btn btn-primary">
                Create Your First Configuration
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>GitHub Org</th>
                    <th>Repositories</th>
                    <th>Status</th>
                    <th>Last Run</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.id}>
                      <td>
                        <strong>{config.githubOrg}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {config.githubRepos.split(',').length} repo{config.githubRepos.split(',').length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${config.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {config.lastRunAt
                          ? new Date(config.lastRunAt).toLocaleString()
                          : 'Never'}
                      </td>
                      <td>
                        <Link
                          to={`/config/${config.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
