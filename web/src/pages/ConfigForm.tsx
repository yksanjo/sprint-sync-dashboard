import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface ConfigFormProps {
  token: string;
}

export default function ConfigForm({ token }: ConfigFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    githubToken: '',
    githubOrg: '',
    githubRepos: '',
    jiraUrl: '',
    jiraEmail: '',
    jiraApiToken: '',
    jiraProjectKey: '',
    linearApiKey: '',
    linearTeamId: '',
    slackBotToken: '',
    slackSigningSecret: '',
    slackChannelId: '',
    timezone: 'America/New_York',
    sprintLengthDays: 10,
    alertThresholdDays: 3,
  });

  useEffect(() => {
    if (id) {
      fetchConfig();
    }
  }, [id]);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`/api/configs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(response.data.config);
    } catch (error) {
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (id) {
        await axios.put(
          `/api/configs/${id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Configuration updated!');
      } else {
        await axios.post(
          '/api/configs',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>

      <div className="card">
        <h2>{id ? 'Edit' : 'New'} Configuration</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>GitHub</h3>
          <div className="form-group">
            <label>GitHub Token *</label>
            <input
              type="password"
              value={formData.githubToken}
              onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>GitHub Organization *</label>
            <input
              type="text"
              value={formData.githubOrg}
              onChange={(e) => setFormData({ ...formData, githubOrg: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Repositories (comma-separated) *</label>
            <input
              type="text"
              value={formData.githubRepos}
              onChange={(e) => setFormData({ ...formData, githubRepos: e.target.value })}
              placeholder="repo1,repo2,repo3"
              required
            />
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Jira (Optional)</h3>
          <div className="form-group">
            <label>Jira URL</label>
            <input
              type="url"
              value={formData.jiraUrl}
              onChange={(e) => setFormData({ ...formData, jiraUrl: e.target.value })}
              placeholder="https://your-domain.atlassian.net"
            />
          </div>
          <div className="form-group">
            <label>Jira Email</label>
            <input
              type="email"
              value={formData.jiraEmail}
              onChange={(e) => setFormData({ ...formData, jiraEmail: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Jira API Token</label>
            <input
              type="password"
              value={formData.jiraApiToken}
              onChange={(e) => setFormData({ ...formData, jiraApiToken: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Jira Project Key</label>
            <input
              type="text"
              value={formData.jiraProjectKey}
              onChange={(e) => setFormData({ ...formData, jiraProjectKey: e.target.value })}
            />
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Linear (Optional - Alternative to Jira)</h3>
          <div className="form-group">
            <label>Linear API Key</label>
            <input
              type="password"
              value={formData.linearApiKey}
              onChange={(e) => setFormData({ ...formData, linearApiKey: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Linear Team ID</label>
            <input
              type="text"
              value={formData.linearTeamId}
              onChange={(e) => setFormData({ ...formData, linearTeamId: e.target.value })}
            />
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Slack</h3>
          <div className="form-group">
            <label>Slack Bot Token *</label>
            <input
              type="password"
              value={formData.slackBotToken}
              onChange={(e) => setFormData({ ...formData, slackBotToken: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Slack Signing Secret *</label>
            <input
              type="password"
              value={formData.slackSigningSecret}
              onChange={(e) => setFormData({ ...formData, slackSigningSecret: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Slack Channel ID *</label>
            <input
              type="text"
              value={formData.slackChannelId}
              onChange={(e) => setFormData({ ...formData, slackChannelId: e.target.value })}
              required
            />
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Settings</h3>
          <div className="form-group">
            <label>Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            >
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sprint Length (days)</label>
            <input
              type="number"
              value={formData.sprintLengthDays}
              onChange={(e) => setFormData({ ...formData, sprintLengthDays: parseInt(e.target.value) })}
              min="1"
              max="30"
            />
          </div>
          <div className="form-group">
            <label>Alert Threshold (days)</label>
            <input
              type="number"
              value={formData.alertThresholdDays}
              onChange={(e) => setFormData({ ...formData, alertThresholdDays: parseInt(e.target.value) })}
              min="1"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={saving}
          >
            {saving ? 'Saving...' : id ? 'Update Configuration' : 'Create Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}

