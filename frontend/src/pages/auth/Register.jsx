import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const Register = () => {
  const [form, setForm] = useState({ username:'', password:'', role:'Cleaner', worker_id:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.role) e.role = 'Role is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      await api.post('/auth/register', { ...form, worker_id: form.worker_id || undefined })
      toast.success('User registered successfully')
      navigate('/workers')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f1117' }}>
      <div style={{ width:'100%', maxWidth:'420px', padding:'0 20px' }}>
        <div className="card">
          <h2 style={{ marginBottom:24, fontSize:20, fontWeight:700 }}>Register New User</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input className={`form-control ${errors.username?'error':''}`} value={form.username}
                onChange={e => setForm({...form, username:e.target.value})} placeholder="Enter username" />
              {errors.username && <div className="error-text">{errors.username}</div>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className={`form-control ${errors.password?'error':''}`} value={form.password}
                onChange={e => setForm({...form, password:e.target.value})} placeholder="Min 6 characters" />
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
            <div className="form-group">
              <label>Worker ID (optional)</label>
              <input className="form-control" value={form.worker_id} type="number"
                onChange={e => setForm({...form, worker_id:e.target.value})} placeholder="Link to worker" />
            </div>
            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
