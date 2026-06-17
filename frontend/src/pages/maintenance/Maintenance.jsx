import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, X } from 'lucide-react'

const Maintenance = () => {
  const { hasRole } = useAuth()
  const [items, setItems] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ dustbin_id:'', worker_id:'', maintenance_date:'', issue_description:'' })
  const [errors, setErrors] = useState({})

  const fetch = async () => {
    try {
      const res = await api.get('/maintenance')
      setItems(res.data); setFiltered(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  useEffect(() => {
    let data = items
    if (search) data = data.filter(i => i.issue_description?.toLowerCase().includes(search.toLowerCase()) || String(i.dustbin_id).includes(search))
    if (filterStatus) data = data.filter(i => i.status_name === filterStatus)
    setFiltered(data)
  }, [search, filterStatus, items])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.dustbin_id) errs.dustbin_id = 'Required'
    if (!form.worker_id)  errs.worker_id  = 'Required'
    if (!form.issue_description.trim()) errs.issue_description = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await api.post('/maintenance', { ...form, dustbin_id: parseInt(form.dustbin_id), worker_id: parseInt(form.worker_id) })
      toast.success('Maintenance request submitted')
      fetch(); setShowModal(false)
      setForm({ dustbin_id:'', worker_id:'', maintenance_date:'', issue_description:'' })
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleStatusUpdate = async (id, statusId, statusName) => {
    try {
      await api.put(`/maintenance/${id}`, { maintenance_status_id: statusId })
      toast.success(`Status updated to ${statusName}`)
      fetch()
    } catch { toast.error('Update failed') }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Maintenance</div>
          <div className="page-subtitle">{items.filter(i => i.status_name !== 'Resolved').length} active requests</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setErrors({}) }}><Plus size={16} /> New Request</button>
      </div>

      <div className="search-bar">
        <div style={{ position:'relative' }}>
          <Search size={16} style={{ position:'absolute', left:10, top:11, color:'#64748b' }} />
          <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search by issue or dustbin ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ maxWidth:160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        {(search || filterStatus) && <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterStatus('') }}><X size={14} /> Clear</button>}
      </div>

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead><tr><th>ID</th><th>Dustbin</th><th>Date</th><th>Issue</th><th>Reported By</th><th>Status</th>{hasRole('Manager','Admin') && <th>Actions</th>}</tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.maintenance_id}>
                <td>{item.maintenance_id}</td>
                <td><span className="badge badge-blue">Bin #{item.dustbin_id}</span></td>
                <td>{item.maintenance_date?.slice(0,10)}</td>
                <td>{item.issue_description}</td>
                <td>{item.reported_by}</td>
                <td><span className={`badge ${item.status_name==='Resolved'?'badge-green':item.status_name==='InProgress'?'badge-yellow':'badge-red'}`}>{item.status_name}</span></td>
                {hasRole('Manager','Admin') && (
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {item.status_name === 'Pending' && <button className="btn btn-secondary" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => handleStatusUpdate(item.maintenance_id, 2, 'InProgress')}>Start</button>}
                      {item.status_name !== 'Resolved' && <button className="btn btn-success" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => handleStatusUpdate(item.maintenance_id, 3, 'Resolved')}>Resolve</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Maintenance Request</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label>Dustbin ID</label>
                  <input type="number" className={`form-control ${errors.dustbin_id?'error':''}`} value={form.dustbin_id} onChange={e => setForm({...form, dustbin_id:e.target.value})} />
                  {errors.dustbin_id && <div className="error-text">{errors.dustbin_id}</div>}
                </div>
                <div className="form-group">
                  <label>Worker ID</label>
                  <input type="number" className={`form-control ${errors.worker_id?'error':''}`} value={form.worker_id} onChange={e => setForm({...form, worker_id:e.target.value})} />
                  {errors.worker_id && <div className="error-text">{errors.worker_id}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={form.maintenance_date} onChange={e => setForm({...form, maintenance_date:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Issue Description</label>
                <textarea className={`form-control ${errors.issue_description?'error':''}`} rows={3} value={form.issue_description} onChange={e => setForm({...form, issue_description:e.target.value})} placeholder="Describe the issue..." style={{ resize:'vertical' }} />
                {errors.issue_description && <div className="error-text">{errors.issue_description}</div>}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Maintenance
