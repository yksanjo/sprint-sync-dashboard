import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Pricing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/subscription/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!token) {
      navigate('/register');
      return;
    }

    try {
      const response = await axios.post(
        '/api/subscription/checkout',
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to start checkout');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Pricing Plans</h1>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
          Choose the plan that fits your team
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="card"
            style={{
              border: plan.id === 'PRO' ? '2px solid #007bff' : '1px solid #ddd',
              position: 'relative',
            }}
          >
            {plan.id === 'PRO' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#007bff',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                POPULAR
              </div>
            )}

            <h2 style={{ marginBottom: '10px' }}>{plan.name}</h2>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold' }}>${plan.price}</span>
              {plan.price > 0 && <span style={{ color: '#666' }}>/month</span>}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
              {plan.features.map((feature: string, idx: number) => (
                <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  ✓ {feature}
                </li>
              ))}
            </ul>

            {plan.price === 0 ? (
              <div style={{ textAlign: 'center', color: '#666' }}>
                Current Plan
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleUpgrade(plan.id)}
              >
                {token ? 'Upgrade' : 'Get Started'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        {!token && (
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

