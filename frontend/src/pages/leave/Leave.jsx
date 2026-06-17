import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { Plus, X } from 'lucide-react'

const Leave = () => {
  const { hasRole, user } = useAuth()
  const [requests, setRequests] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ worker_id:'', leave_start_date:'', leave_end_date:'', leave_type_id:'1', reason:'' })
  const [errors, setErrors] = useState({})

  const fetch = async () => {
    try {
      const res = await api.get('/leave')
      setRequests(res.data); setFiltered(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  useEffect(() => {
    setFiltered(filterStatus ? requests.filter(r => r.leave_status === filterStatus) : requests)
  }, [filterStatus, requests])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.worker_id)         errs.worker_id = 'Required'
    if (!form.leave_start_date)  errs.leave_start_date = 'Required'
    if (!form.leave_end_date)    errs.leave_end_date = 'Required'
    if (form.leave_end_date < form.leave_start_date) errs.leave_end_date = 'End date must be after start date'
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await api.post('/leave', { ...form, worker_id: parseInt(form.worker_id), leave_type_id: parseInt(form.leave_type_id) })
      toast.success('Leave request submitted')
      fetch(); setShowModal(false)
      setForm({ worker_id:'', leave_start_date:'', leave_end_date:'', leave_type_id:'1', reason:'' })
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleApprove = async (id, statusId, label) => {
    try {
      await api.put(`/leave/${id}/approve`, { leave_status_id: statusId })
      toast.success(`Leave ${label}`)
      fetch()
    } catch { toast.error('Action failed') }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Leave Management</div>
          <div className="page-subtitle">{requests.filter(r => r.leave_status === 'Pending').length} pending requests</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setErrors({}) }}><Plus size={16} /> Request Leave</button>
      </div>

      <div className="search-bar">
        <select className="form-control" style={{ maxWidth:180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        {filterStatus && <button className="btn btn-secondary" onClick={() => setFilterStatus('')}><X size={14} /> Clear</button>}
      </div>

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead><tr><th>ID</th><th>Worker</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th>{hasRole('Manager') && <th>Actions</th>}</tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.leave_id}>
                <td>{r.leave_id}</td>
                <td style={{ fontWeight:600 }}>{r.worker_name}</td>
                <td><span className="badge badge-blue">{r.leave_type}</span></td>
                <td>{r.leave_start_date?.slice(0,10)}</td>
                <td>{r.leave_end_date?.slice(0,10)}</td>
                <td style={{ color:'#94a3b8' }}>{r.reason || '—'}</td>
                <td><span className={`badge ${r.leave_status==='Approved'?'badge-green':r.leave_status==='Rejected'?'badge-red':'badge-yellow'}`}>{r.leave_status}</span></td>
                {hasRole('Manager') && r.leave_status === 'Pending' && (
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-success" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => handleApprove(r.leave_id, 1, 'Approved')}>Approve</button>
                      <button className="btn btn-danger"  style={{ padding:'5px 10px', fontSize:12 }} onClick={() => handleApprove(r.leave_id, 3, 'Rejected')}>Reject</button>
                    </div>
                  </td>
                )}
                {hasRole('Manager') && r.leave_status !== 'Pending' && <td>—</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Submit Leave Request</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Worker ID</label>
                <input type="number" className={`form-control ${errors.worker_id?'error':''}`} value={form.worker_id} onChange={e => setForm({...form,worker_id:e.target.value})} placeholder="e.g. 3" />
                {errors.worker_id && <div className="error-text">{errors.worker_id}</div>}
              </div>
              <div className="form-group">
                <label>Leave Type</label>
                <select className="form-control" value={form.leave_type_id} onChange={e => setForm({...form,leave_type_id:e.target.value})}>
                  <option value="1">Casual</option>
                  <option value="2">Sick</option>
                  <option value="3">Annual</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className={`form-control ${errors.leave_start_date?'error':''}`} value={form.leave_start_date} onChange={e => setForm({...form,leave_start_date:e.target.value})} />
                  {errors.leave_start_date && <div className="error-text">{errors.leave_start_date}</div>}
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className={`form-control ${errors.leave_end_date?'error':''}`} value={form.leave_end_date} onChange={e => setForm({...form,leave_end_date:e.target.value})} />
                  {errors.leave_end_date && <div className="error-text">{errors.leave_end_date}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea className="form-control" rows={3} value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} placeholder="Optional reason..." style={{ resize:'vertical' }} />
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

export default Leave
