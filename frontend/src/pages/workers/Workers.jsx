import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

const Workers = () => {
  const { hasRole } = useAuth()
  const [workers, setWorkers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editWorker, setEditWorker] = useState(null)
  const [txnLoading, setTxnLoading] = useState(false)
  const [txnResult, setTxnResult] = useState(null)

  const emptyForm = { campus_id:'1', name:'', CNIC:'', phone:'', hire_date:'', worker_type_id:'3', username:'', password:'' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/workers')
      setWorkers(res.data)
      setFiltered(res.data)
    } catch (err) {
      toast.error('Failed to load workers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkers() }, [])

  useEffect(() => {
    let data = workers
    if (search) data = data.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.CNIC.includes(search))
    if (filterType) data = data.filter(w => w.worker_type === filterType)
    setFiltered(data)
  }, [search, filterType, workers])

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name = 'Name is required'
    if (!form.CNIC.trim())     e.CNIC = 'CNIC is required'
    if (!editWorker) {
      if (!form.username.trim()) e.username = 'Username is required'
      if (!form.password || form.password.length < 6) e.password = 'Min 6 characters'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setTxnLoading(true)
    setTxnResult(null)
    try {
      if (editWorker) {
        await api.put(`/workers/${editWorker.worker_id}`, { name: form.name, phone: form.phone })
        toast.success('Worker updated')
        setTxnResult({ success: true, message: 'Worker updated successfully' })
      } else {
        // TRANSACTION: creates worker + user account atomically
        const res = await api.post('/workers', form)
        toast.success('Worker and user account created (transaction committed)')
        setTxnResult({ success: true, message: `Transaction committed — Worker ID: ${res.data.worker_id} + user account created atomically` })
      }
      fetchWorkers()
      setShowModal(false)
      setForm(emptyForm)
      setEditWorker(null)
    } catch (err) {
      const msg = err.response?.data?.error || 'Operation failed'
      toast.error(msg)
      setTxnResult({ success: false, message: `Transaction rolled back — ${msg}` })
    } finally {
      setTxnLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this worker?')) return
    try {
      await api.delete(`/workers/${id}`)
      toast.success('Worker deleted')
      fetchWorkers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const openEdit = (w) => {
    setEditWorker(w)
    setForm({ ...emptyForm, name: w.name, phone: w.phone || '' })
    setErrors({})
    setTxnResult(null)
    setShowModal(true)
  }

  const openCreate = () => {
    setEditWorker(null)
    setForm(emptyForm)
    setErrors({})
    setTxnResult(null)
    setShowModal(true)
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Workers</div>
          <div className="page-subtitle">{filtered.length} workers found</div>
        </div>
        {hasRole('Manager') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Worker</button>
        )}
      </div>

      {/* Transaction result banner */}
      {txnResult && (
        <div className={`alert ${txnResult.success ? 'alert-success' : 'alert-error'}`}>
          <strong>{txnResult.success ? '✅ Transaction Committed:' : '❌ Transaction Rolled Back:'}</strong> {txnResult.message}
        </div>
      )}

      {/* Search & Filter */}
      <div className="search-bar">
        <div style={{ position:'relative' }}>
          <Search size={16} style={{ position:'absolute', left:10, top:11, color:'#64748b' }} />
          <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search by name or CNIC..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ maxWidth:180 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
          <option value="Cleaner">Cleaner</option>
        </select>
        {(search || filterType) && (
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterType('') }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>CNIC</th><th>Phone</th>
              <th>Type</th><th>Status</th><th>Campus</th>
              {hasRole('Manager','Admin') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'#64748b', padding:32 }}>No workers found</td></tr>
            ) : filtered.map(w => (
              <tr key={w.worker_id}>
                <td>{w.worker_id}</td>
                <td style={{ fontWeight:600 }}>{w.name}</td>
                <td style={{ fontFamily:'monospace', fontSize:13 }}>{w.CNIC}</td>
                <td>{w.phone || '—'}</td>
                <td><span className={`badge ${w.worker_type==='Manager'?'badge-blue':w.worker_type==='Admin'?'badge-green':'badge-gray'}`}>{w.worker_type}</span></td>
                <td><span className={`badge ${w.employment_status==='Active'?'badge-green':w.employment_status==='OnLeave'?'badge-yellow':'badge-red'}`}>{w.employment_status}</span></td>
                <td>{w.campus_name}</td>
                {hasRole('Manager','Admin') && (
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-secondary" style={{ padding:'6px 10px' }} onClick={() => openEdit(w)}><Edit2 size={14} /></button>
                      {hasRole('Manager') && (
                        <button className="btn btn-danger" style={{ padding:'6px 10px' }} onClick={() => handleDelete(w.worker_id)}><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editWorker ? 'Edit Worker' : '➕ Create Worker + User Account'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {!editWorker && (
              <div className="alert alert-success" style={{ marginBottom:16, fontSize:13 }}>
                <strong>⚡ Transaction Operation:</strong> This will atomically create a worker record AND a user login account. If either fails, both are rolled back.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editWorker && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div className="form-group">
                      <label>Campus ID</label>
                     <select className="form-control" value={form.campus_id} onChange={e => setForm({...form, campus_id:e.target.value})}>
  <option value="1">Campus 1 — Arfa Tower Campus</option>
  <option value="2">Campus 2 — Barki Campus</option>
  <option value="3">Campus 3 — ITU Arfa Tower Campus</option>
  <option value="4">Campus 4 — ITU Barki Campus</option>
</select>
                    </div>
                    <div className="form-group">
                      <label>Worker Type</label>
                      <select className="form-control" value={form.worker_type_id} onChange={e => setForm({...form, worker_type_id:e.target.value})}>
                        <option value="1">Manager</option>
                        <option value="2">Admin</option>
                        <option value="3">Cleaner</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>CNIC</label>
                    <input className={`form-control ${errors.CNIC?'error':''}`} value={form.CNIC}
                      onChange={e => { setForm({...form, CNIC:e.target.value}); setErrors({...errors,CNIC:''}) }}
                      placeholder="35201-1234567-1" />
                    {errors.CNIC && <div className="error-text">{errors.CNIC}</div>}
                  </div>
                  <div className="form-group">
                    <label>Hire Date</label>
                    <input type="date" className="form-control" value={form.hire_date}
                      onChange={e => setForm({...form, hire_date:e.target.value})} />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input className={`form-control ${errors.name?'error':''}`} value={form.name}
                  onChange={e => { setForm({...form, name:e.target.value}); setErrors({...errors,name:''}) }}
                  placeholder="Enter full name" />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" value={form.phone}
                  onChange={e => setForm({...form, phone:e.target.value})} placeholder="03001234567" />
              </div>

              {!editWorker && (
                <div style={{ borderTop:'1px solid #2d3748', paddingTop:16, marginTop:8 }}>
                  <div style={{ fontSize:13, color:'#64748b', marginBottom:12, fontWeight:600 }}>USER ACCOUNT (created atomically)</div>
                  <div className="form-group">
                    <label>Username</label>
                    <input className={`form-control ${errors.username?'error':''}`} value={form.username}
                      onChange={e => { setForm({...form, username:e.target.value}); setErrors({...errors,username:''}) }}
                      placeholder="e.g. john.cleaner" />
                    {errors.username && <div className="error-text">{errors.username}</div>}
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" className={`form-control ${errors.password?'error':''}`} value={form.password}
                      onChange={e => { setForm({...form, password:e.target.value}); setErrors({...errors,password:''}) }}
                      placeholder="Min 6 characters" />
                    {errors.password && <div className="error-text">{errors.password}</div>}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:12, marginTop:16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={txnLoading}>
                  {txnLoading ? 'Processing...' : editWorker ? 'Update Worker' : '⚡ Create (Transaction)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workers
