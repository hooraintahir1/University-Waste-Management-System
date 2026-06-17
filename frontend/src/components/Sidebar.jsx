import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, Trash2, Recycle, Wrench, DollarSign, Calendar, LogOut } from 'lucide-react'

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { to: '/dashboard',   icon: <LayoutDashboard size={18} />, label: 'Dashboard',        roles: ['Manager','Admin','Cleaner'] },
    { to: '/workers',     icon: <Users size={18} />,           label: 'Workers',           roles: ['Manager','Admin'] },
    { to: '/dustbins',    icon: <Trash2 size={18} />,          label: 'Dustbins',          roles: ['Manager','Admin','Cleaner'] },
    { to: '/waste',       icon: <Recycle size={18} />,         label: 'Waste Collections', roles: ['Manager','Admin','Cleaner'] },
    { to: '/maintenance', icon: <Wrench size={18} />,          label: 'Maintenance',       roles: ['Manager','Admin','Cleaner'] },
    { to: '/salary',      icon: <DollarSign size={18} />,      label: 'Salary',            roles: ['Manager'] },
    { to: '/leave',       icon: <Calendar size={18} />,        label: 'Leave',             roles: ['Manager','Admin','Cleaner'] },
  ]

  return (
    <aside style={{ width:'240px', minHeight:'100vh', background:'#1a1d2e', borderRight:'1px solid #2d3748', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, zIndex:100 }}>
      <div style={{ padding:'24px 20px', borderBottom:'1px solid #2d3748' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:36, height:36, background:'#3b82f6', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>♻️</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>WasteMS</div>
            <div style={{ color:'#64748b', fontSize:11 }}>University System</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px 20px', borderBottom:'1px solid #2d3748' }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{user?.username}</div>
        <div style={{ marginTop:4 }}>
          <span className={`badge ${user?.role==='Manager'?'badge-blue':user?.role==='Admin'?'badge-green':'badge-gray'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      <nav style={{ flex:1, padding:'12px' }}>
        {navItems.map(item =>
          hasRole(...item.roles) && (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:8, marginBottom:4,
                textDecoration:'none', fontSize:14, fontWeight:500,
                color: isActive ? '#3b82f6' : '#94a3b8',
                background: isActive ? '#1e3a5f' : 'transparent',
                transition:'all 0.2s'
              })}>
              {item.icon}{item.label}
            </NavLink>
          )
        )}
      </nav>

      <div style={{ padding:'16px 12px', borderTop:'1px solid #2d3748' }}>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ width:'100%', justifyContent:'center' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
