interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ value, label, icon, trend }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        {icon && (
          <div style={{ fontSize: '2rem', opacity: 0.5 }}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div style={{ 
          fontSize: '0.875rem', 
          color: trend.isPositive ? 'var(--success)' : 'var(--error)',
          marginTop: '0.5rem'
        }}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

