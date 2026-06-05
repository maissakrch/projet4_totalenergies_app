import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const location = useLocation()

  const links = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/tickets', label: '🎫 Tickets' },
    { path: '/monitoring', label: '🔍 Monitoring' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-logo">⚡</span>
        <div>
          <div className="brand-name">TotalEnergies</div>
          <div className="brand-sub">IT Support — IA</div>
        </div>
      </div>

      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-badge">
        <span className="ia-badge">🤖 IA Active</span>
      </div>
    </nav>
  )
}

export default Navbar