import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://127.0.0.1:8001'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/tickets/stats/summary`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Chargement...</div>
  if (!stats) return <div className="alert alert-error">Erreur de connexion à l'API</div>

  return (
    <div>
      <h1 className="page-title">📊 Dashboard — Support IT TotalEnergies</h1>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{stats.total_tickets}</div>
          <div className="kpi-label">Total tickets</div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:'#C0392B'}}>
          <div className="kpi-value" style={{color:'#C0392B'}}>{stats.ouverts}</div>
          <div className="kpi-label">Ouverts</div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:'#E67E22'}}>
          <div className="kpi-value" style={{color:'#E67E22'}}>{stats.en_cours}</div>
          <div className="kpi-label">En cours</div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:'#1E8449'}}>
          <div className="kpi-value" style={{color:'#1E8449'}}>{stats.resolus}</div>
          <div className="kpi-label">Résolus</div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:'#C0392B'}}>
          <div className="kpi-value" style={{color:'#C0392B'}}>{stats.haute_priorite}</div>
          <div className="kpi-label">Haute priorité</div>
        </div>
        <div className="kpi-card" style={{borderLeftColor:'#6C3483'}}>
          <div className="kpi-value" style={{color:'#6C3483'}}>{(stats.score_moyen * 100).toFixed(0)}%</div>
          <div className="kpi-label">Score IA moyen</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:'16px', color:'#1B4F72'}}>Catégories IA</h3>
        {Object.entries(stats.par_categorie).map(([cat, nb]) => (
          <div key={cat} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F2F3F4'}}>
            <span>{cat}</span>
            <span className="badge badge-normale">{nb} tickets</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{marginBottom:'16px', color:'#1B4F72'}}>Accès rapide</h3>
        <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={() => navigate('/tickets')}>🎫 Voir tous les tickets</button>
          <button className="btn btn-secondary" onClick={() => navigate('/monitoring')}>🔍 Monitoring</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard