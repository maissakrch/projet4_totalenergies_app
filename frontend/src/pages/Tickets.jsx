import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://127.0.0.1:8001'

function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtrePriorite, setFiltrePriorite] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newTicket, setNewTicket] = useState({ titre: '', description: '', priorite: 'normale' })
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const fetchTickets = () => {
    let url = `${API}/tickets/?`
    if (filtreStatut) url += `statut=${filtreStatut}&`
    if (filtrePriorite) url += `priorite=${filtrePriorite}&`
    if (filtreCategorie) url += `categorie=${filtreCategorie}&`

    fetch(url)
      .then(r => r.json())
      .then(data => { setTickets(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [filtreStatut, filtrePriorite, filtreCategorie])

  const handleCreate = async () => {
    if (!newTicket.titre || !newTicket.description) {
      setMessage({ type: 'error', text: 'Titre et description obligatoires' })
      return
    }
    const res = await fetch(`${API}/tickets/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket)
    })
    if (res.ok) {
      setMessage({ type: 'success', text: '✅ Ticket créé et classifié par IA !' })
      setNewTicket({ titre: '', description: '', priorite: 'normale' })
      setShowForm(false)
      fetchTickets()
    }
  }

  const getBadgeStatut = (statut) => {
    const map = { 'ouvert': 'badge-ouvert', 'en cours': 'badge-en-cours', 'résolu': 'badge-resolu' }
    return map[statut] || 'badge-normale'
  }

  const getBadgePriorite = (priorite) => {
    const map = { 'haute': 'badge-haute', 'normale': 'badge-normale', 'basse': 'badge-basse' }
    return map[priorite] || 'badge-normale'
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div>
      <h1 className="page-title">🎫 Gestion des Tickets IT</h1>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {/* Filtres */}
      <div className="filters">
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="ouvert">Ouvert</option>
          <option value="en cours">En cours</option>
          <option value="résolu">Résolu</option>
        </select>
        <select value={filtrePriorite} onChange={e => setFiltrePriorite(e.target.value)}>
          <option value="">Toutes priorités</option>
          <option value="haute">Haute</option>
          <option value="normale">Normale</option>
          <option value="basse">Basse</option>
        </select>
        <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)}>
          <option value="">Toutes catégories</option>
          <option value="Accès & Authentification">Accès & Auth</option>
          <option value="Matériel">Matériel</option>
          <option value="Logiciel">Logiciel</option>
          <option value="Installation Logiciel">Installation</option>
          <option value="Messagerie">Messagerie</option>
          <option value="Réseau">Réseau</option>
          <option value="Performance">Performance</option>
          <option value="Sécurité">Sécurité</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Nouveau ticket'}
        </button>
        <span style={{color:'#5D6D7E', fontSize:'14px'}}>{tickets.length} ticket(s)</span>
      </div>

      {/* Formulaire nouveau ticket */}
      {showForm && (
        <div className="card" style={{borderLeft:'4px solid #1ABC9C'}}>
          <h3 style={{marginBottom:'16px', color:'#1B4F72'}}>Nouveau ticket IT</h3>
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              placeholder="Ex: Impossible de se connecter au VPN"
              value={newTicket.titre}
              onChange={e => setNewTicket({...newTicket, titre: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Décrivez le problème en détail..."
              value={newTicket.description}
              onChange={e => setNewTicket({...newTicket, description: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Priorité</label>
            <select value={newTicket.priorite} onChange={e => setNewTicket({...newTicket, priorite: e.target.value})}>
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
            </select>
          </div>
          <div style={{display:'flex', gap:'8px'}}>
            <button className="btn btn-primary" onClick={handleCreate}>
              🤖 Créer et classifier par IA
            </button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tableau tickets */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Titre</th>
                <th>Catégorie IA</th>
                <th>Score IA</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <td>#{ticket.id}</td>
                  <td style={{maxWidth:'250px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {ticket.titre}
                  </td>
                  <td>
                    {ticket.categorie_predite
                      ? <span className="badge badge-normale">{ticket.categorie_predite}</span>
                      : <span style={{color:'#5D6D7E'}}>—</span>
                    }
                  </td>
                  <td>
                    {ticket.score_confiance
                      ? <span style={{color: ticket.score_confiance > 0.7 ? '#1E8449' : ticket.score_confiance > 0.4 ? '#E67E22' : '#C0392B'}}>
                          {(ticket.score_confiance * 100).toFixed(0)}%
                        </span>
                      : '—'
                    }
                  </td>
                  <td><span className={`badge ${getBadgeStatut(ticket.statut)}`}>{ticket.statut}</span></td>
                  <td><span className={`badge ${getBadgePriorite(ticket.priorite)}`}>{ticket.priorite}</span></td>
                  <td style={{fontSize:'12px', color:'#5D6D7E'}}>{ticket.created_at?.slice(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && (
            <div style={{textAlign:'center', padding:'40px', color:'#5D6D7E'}}>
              Aucun ticket trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tickets