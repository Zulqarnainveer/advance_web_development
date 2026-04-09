// ============================================================
// src/components/StatCard.jsx
// LAB 3: Reusable functional component with Props
// ============================================================

// Props: icon, label, value, color — passed from parent (Lab 3)
export default function StatCard({ icon, label, value, color = '#7c3aed', sublabel }) {
  return (
    <div className="stat-card">
      {/* Subtle glow effect matching card color */}
      <div
        className="stat-card-icon"
        style={{ background: `${color}22`, color }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-card-val">{value ?? '—'}</div>
      <div className="stat-card-label">{label}</div>
      {sublabel && (
        <div className="mt-2" style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.35)' }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}
