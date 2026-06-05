import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:8001'

function Monitoring() {
  const [metrics, setMetrics] = useState(null)
  const [logs, setLogs] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [newIncident, setNewIncident] = useState({ titre: '', description: '', cause: '', solution: '' })
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = () => {
    Promise.all([
      fetch(`${API}/monitoring/metrics`).then(r => r.json()),
      fetch(`${API}/monitoring/logs?limit=20`).then(r => r.json()),
      fetch(`${API}/monitoring/incidents`).then(r => r.json()),
    ]).then(([m, l, i]) => {
      setMetrics(m)
      setLogs(l)
      setIncidents(i)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateIncident = async () => {
    if (!newIncident.titre || !newIncident.description) {
      setMessage({ type: 'error', text: 'Titre et description obligatoires' })
      return
    }
    const res = await fetch(`${API}/monitoring/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIncident)
    })
    if (res.ok) {
      setMessage({ type: 'success', text: '✅ Incident créé et documenté' })
      setNewIncident({ titre: '', description: '', cause: '', solution: '' })
      setShowIncidentForm(false)
      fetchData()
    }
  }

  const handleResolveIncident = async (id) => {
    await fetch(`${API}/monitoring/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'résolu' })
    })
    fetchData()
  }

  if (loading) return <div className="loading">Chargement...</div>

  const getNiveauColor = (niveau) => {
    const map = { 'ERROR': '#C0392B', 'WARNING': '#E67E22', 'INFO': '#1B4F72' }
    return map[niveau] || '#5D6D7E'
  }

  return (
    <div>
      <h1 className="page-title">🔍 Monitoring Applicatif</h1>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {/* KPIs */}
      {metrics && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-value">{metrics.total_tickets}</div>
            <div className="kpi-label">Total tickets</div>
          </div>
          <div className="kpi-card" style={{borderLeftColor:'#C0392B'}}>
            <div className="kpi-value" style={{color:'#C0392B'}}>{metrics.tickets_urgents}</div>
            <div className="kpi-label">Tickets urgents</div>
          </div>
          <div className="kpi-card" style={{borderLeftColor:'#E67E22'}}>
            <div className="kpi-value" style={{color:'#E67E22'}}>{metrics.tickets_24h}</div>
            <div className="kpi-label">Dernières 24h</div>
          </div>
          <div className="kpi-card" style={{borderLeftColor:'#C0392B'}}>
            <div className="kpi-value" style={{color:'#C0392B'}}>{metrics.total_errors}</div>
            <div className="kpi-label">Erreurs API</div>
          </div>
          <div className="kpi-card" style={{borderLeftColor:'#E67E22'}}>
            <div className="kpi-value" style={{color:'#E67E22'}}>{metrics.incidents_ouverts}</div>
            <div className="kpi-label">Incidents ouverts</div>
          </div>
        </div>
      )}

      {/* Top catégories */}
      {metrics && metrics.top_categories.length > 0 && (
        <div className="card">
          <h3 style={{color:'#1B4F72', marginBottom:'16px'}}>Top catégories IA</h3>
          {metrics.top_categories.map(c => (
            <div key={c.categorie} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F2F3F4'}}>
              <span>{c.categorie}</span>
              <span className="badge badge-normale">{c.nb}</span>
            </div>
          ))}
        </div>
      )}

      {/* Incidents */}
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
          <h3 style={{color:'#C0392B'}}>🚨 Incidents Techniques (C21)</h3>
          <button className="btn btn-primary" onClick={() => setShowIncidentForm(!showIncidentForm)}>
            {showIncidentForm ? '✕ Annuler' : '+ Déclarer incident'}
          </button>
        </div>

        {showIncidentForm && (
          <div style={{background:'#F8F9FA', padding:'16px', borderRadius:'8px', marginBottom:'16px'}}>
            <h4 style={{marginBottom:'12px', color:'#1B4F72'}}>Déclarer un incident technique</h4>
            <div className="form-group">
              <label>Titre *</label>
              <input type="text" placeholder="Ex: API classifier indisponible"
                value={newIncident.titre}
                onChange={e => setNewIncident({...newIncident, titre: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea placeholder="Décrivez l'incident..."
                value={newIncident.description}
                onChange={e => setNewIncident({...newIncident, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Cause identifiée</label>
              <input type="text" placeholder="Ex: Timeout connexion API"
                value={newIncident.cause}
                onChange={e => setNewIncident({...newIncident, cause: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Solution implémentée</label>
              <textarea placeholder="Décrivez la solution..."
                value={newIncident.solution}
                onChange={e => setNewIncident({...newIncident, solution: e.target.value})} />
            </div>
            <button className="btn btn-primary" onClick={handleCreateIncident}>
              🚨 Déclarer l'incident
            </button>
          </div>
        )}

        {incidents.length === 0 ? (
          <div style={{textAlign:'center', padding:'20px', color:'#5D6D7E'}}>
            Aucun incident déclaré
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id} style={{
              padding:'12px', marginBottom:'8px', borderRadius:'6px',
              background: incident.statut === 'résolu' ? '#EAFAF1' : '#FDEDEC',
              borderLeft: `4px solid ${incident.statut === 'résolu' ? '#1E8449' : '#C0392B'}`
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div>
                  <div style={{fontWeight:'bold', fontSize:'14px'}}>{incident.titre}</div>
                  <div style={{fontSize:'12px', color:'#5D6D7E', marginTop:'4px'}}>{incident.description}</div>
                  {incident.cause && <div style={{fontSize:'12px', marginTop:'4px'}}><b>Cause :</b> {incident.cause}</div>}
                  {incident.solution && <div style={{fontSize:'12px', marginTop:'4px'}}><b>Solution :</b> {incident.solution}</div>}
                </div>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <span className={`badge ${incident.statut === 'résolu' ? 'badge-resolu' : 'badge-haute'}`}>
                    {incident.statut}
                  </span>
                  {incident.statut !== 'résolu' && (
                    <button className="btn btn-secondary" style={{fontSize:'12px', padding:'4px 8px'}}
                      onClick={() => handleResolveIncident(incident.id)}>
                      ✅ Résoudre
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Logs */}
      <div className="card">
        <h3 style={{color:'#1B4F72', marginBottom:'16px'}}>📋 Logs applicatifs</h3>
        {logs.length === 0 ? (
          <div style={{textAlign:'center', padding:'20px', color:'#5D6D7E'}}>Aucun log disponible</div>
        ) : (
          <div style={{fontFamily:'monospace', fontSize:'12px'}}>
            {logs.map(log => (
              <div key={log.id} style={{
                padding:'6px 10px', marginBottom:'2px', borderRadius:'4px',
                background:'#F8F9FA',
                borderLeft:`3px solid ${getNiveauColor(log.niveau)}`
              }}>
                <span style={{color:'#5D6D7E'}}>{log.created_at?.slice(0,16)}</span>
                {' '}
                <span style={{color:getNiveauColor(log.niveau), fontWeight:'bold'}}>[{log.niveau}]</span>
                {' '}
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Monitoring