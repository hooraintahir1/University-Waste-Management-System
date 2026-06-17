import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password)        e.password = 'Password is required'
    if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f1117' }}>
      <div style={{ width:'100%', maxWidth:'420px', padding:'0 20px' }}>
        <div className="card">
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>♻️</div>
            <h1 style={{ fontSize:24, fontWeight:700 }}>University WMS</h1>
            <p style={{ color:'#64748b', marginTop:8, fontSize:14 }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                className={`form-control ${errors.username ? 'error' : ''}`}
                placeholder="Enter username"
                value={form.username}
                onChange={e => { setForm({...form, username: e.target.value}); setErrors({...errors, username:''}) }}
              />
              {errors.username && <div className="error-text">{errors.username}</div>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Enter password"
                value={form.password}
                onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password:''}) }}
              />
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:24, padding:16, background:'#0f1117', borderRadius:8, fontSize:13 }}>
            <div style={{ color:'#64748b', marginBottom:8, fontWeight:600 }}>Demo Credentials:</div>
            <div style={{ color:'#94a3b8' }}>👔 Manager: ali.manager / manager123</div>
            <div style={{ color:'#94a3b8' }}>🔧 Admin: ahmed.admin / admin123</div>
            <div style={{ color:'#94a3b8' }}>🧹 Cleaner: usman.cleaner / cleaner123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
