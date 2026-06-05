import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API = 'http://127.0.0.1:8001'

function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [editing, setEditing] = useState(false)
  const [update, setUpdate] = useState({})

  useEffect(() => {
    fetch(`${API}/tickets/${id}`)
      .then(r => r.json())
      .then(data => { setTicket(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleUpdate = async () => {
    const res = await fetch(`${API}/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    })
    if (res.ok) {
      setMessage({ type: 'success', text: '✅ Ticket mis à jour' })
      setEditing(false)
      fetch(`${API}/tickets/${id}`)
        .then(r => r.json())
        .then(data => setTicket(data))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce ticket ?')) return
    const res = await fetch(`${API}/tickets/${id}`, { method: 'DELETE' })
    if (res.ok) navigate('/tickets')
  }

  if (loading) return <div className="loading">Chargement...</div>
  if (!ticket) return <div className="alert alert-error">Ticket introuvable</div>

  const scoreColor = ticket.score_confiance > 0.7 ? '#1E8449' : ticket.score_confiance > 0.4 ? '#E67E22' : '#C0392B'

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
        <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>
          ← Retour
        </button>
        <h1 className="page-title" style={{margin:0}}>Ticket #{ticket.id}</h1>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div style={{display:'flex', gap:'20px', flexWrap:'wrap'}}>

        {/* Infos principales */}
        <div className="card" style={{flex:'2', minWidth:'300px'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
            <h3 style={{color:'#1B4F72'}}>Informations</h3>
            <div style={{display:'flex', gap:'8px'}}>
              <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
                {editing ? '✕ Annuler' : '✏️ Modifier'}
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑️ Supprimer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Titre</label>
            <div style={{padding:'10px', background:'#F8F9FA', borderRadius:'6px', fontSize:'14px'}}>
              {ticket.titre}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <div style={{padding:'10px', background:'#F8F9FA', borderRadius:'6px', fontSize:'14px', lineHeight:'1.5'}}>
              {ticket.description}
            </div>
          </div>

          {editing ? (
            <>
              <div className="form-group">
                <label>Statut</label>
                <select
                  defaultValue={ticket.statut}
                  onChange={e => setUpdate({...update, statut: e.target.value})}
                >
                  <option value="ouvert">Ouvert</option>
                  <option value="en cours">En cours</option>
                  <option value="résolu">Résolu</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priorité</label>
                <select
                  defaultValue={ticket.priorite}
                  onChange={e => setUpdate({...update, priorite: e.target.value})}
                >
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleUpdate}>
                💾 Sauvegarder
              </button>
            </>
          ) : (
            <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
              <div>
                <label style={{fontSize:'12px', color:'#5D6D7E'}}>Statut</label>
                <div style={{marginTop:'4px'}}>
                  <span className={`badge badge-${ticket.statut === 'ouvert' ? 'ouvert' : ticket.statut === 'en cours' ? 'en-cours' : 'resolu'}`}>
                    {ticket.statut}
                  </span>
                </div>
              </div>
              <div>
                <label style={{fontSize:'12px', color:'#5D6D7E'}}>Priorité</label>
                <div style={{marginTop:'4px'}}>
                  <span className={`badge badge-${ticket.priorite}`}>{ticket.priorite}</span>
                </div>
              </div>
              <div>
                <label style={{fontSize:'12px', color:'#5D6D7E'}}>Créé le</label>
                <div style={{marginTop:'4px', fontSize:'14px'}}>{ticket.created_at?.slice(0,10)}</div>
              </div>
            </div>
          )}
        </div>

        {/* IA Panel */}
        <div style={{flex:'1', minWidth:'250px'}}>
          <div className="card" style={{borderLeft:'4px solid #6C3483'}}>
            <h3 style={{color:'#6C3483', marginBottom:'16px'}}>🤖 Analyse IA</h3>

            <div style={{marginBottom:'16px'}}>
              <div style={{fontSize:'12px', color:'#5D6D7E', marginBottom:'4px'}}>Catégorie prédite</div>
              <div style={{fontSize:'16px', fontWeight:'bold', color:'#1B4F72'}}>
                {ticket.categorie_predite || 'Non classifié'}
              </div>
            </div>

            <div style={{marginBottom:'16px'}}>
              <div style={{fontSize:'12px', color:'#5D6D7E', marginBottom:'4px'}}>Score de confiance</div>
              <div style={{fontSize:'24px', fontWeight:'bold', color:scoreColor}}>
                {ticket.score_confiance ? `${(ticket.score_confiance * 100).toFixed(0)}%` : '—'}
              </div>
              <div style={{marginTop:'8px', background:'#F2F3F4', borderRadius:'4px', height:'8px'}}>
                <div style={{
                  width:`${(ticket.score_confiance || 0) * 100}%`,
                  background:scoreColor,
                  height:'8px',
                  borderRadius:'4px'
                }} />
              </div>
            </div>

            <div style={{
              padding:'12px',
              background: ticket.score_confiance > 0.7 ? '#EAFAF1' : ticket.score_confiance > 0.4 ? '#FEF9E7' : '#FDEDEC',
              borderRadius:'6px',
              fontSize:'13px',
              color: ticket.score_confiance > 0.7 ? '#1E8449' : ticket.score_confiance > 0.4 ? '#E67E22' : '#C0392B'
            }}>
              {ticket.score_confiance > 0.7
                ? '✅ Haute confiance — Classification fiable'
                : ticket.score_confiance > 0.4
                ? '⚠️ Confiance moyenne — Vérification recommandée'
                : '🔴 Faible confiance — Révision manuelle nécessaire'
              }
            </div>
          </div>

          <div className="card">
            <h3 style={{color:'#1B4F72', marginBottom:'12px'}}>📋 Actions rapides</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <button className="btn btn-primary" onClick={() => {
                setEditing(true)
                setUpdate({statut: 'en cours'})
              }}>
                ▶️ Passer en cours
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setEditing(true)
                setUpdate({statut: 'résolu'})
              }}>
                ✅ Marquer résolu
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setEditing(true)
                setUpdate({priorite: 'haute'})
              }}>
                🔴 Passer en haute priorité
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail