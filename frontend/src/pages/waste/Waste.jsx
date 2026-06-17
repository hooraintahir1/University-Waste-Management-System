import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { Plus, Search, X } from 'lucide-react'

const Waste = () => {
  const [collections, setCollections] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [txnResult, setTxnResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ dustbin_id:'', worker_id:'', collection_date:'', collection_time:'', waste_weight:'', remarks:'' })
  const [errors, setErrors] = useState({})

  const fetch = async () => {
    try {
      const res = await api.get('/waste-collections')
      setCollections(res.data); setFiltered(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  useEffect(() => {
    if (!search) { setFiltered(collections); return }
    setFiltered(collections.filter(c => c.worker_name?.toLowerCase().includes(search.toLowerCase()) || String(c.dustbin_id).includes(search)))
  }, [search, collections])

  const validate = () => {
    const e = {}
    if (!form.dustbin_id)    e.dustbin_id = 'Required'
    if (!form.worker_id)     e.worker_id  = 'Required'
    if (!form.collection_date) e.collection_date = 'Required'
    if (!form.waste_weight)  e.waste_weight = 'Required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setTxnResult(null)
    try {
      const res = await api.post('/waste-collections', { ...form, dustbin_id: parseInt(form.dustbin_id), worker_id: parseInt(form.worker_id), waste_weight: parseFloat(form.waste_weight) })
      toast.success('Collection recorded — dustbin reset to 0%')
      setTxnResult({ success: true, message: `Transaction committed — Collection ID: ${res.data.collection_id}. Dustbin fill level atomically reset to 0%.` })
      fetch()
      setShowModal(false)
      setForm({ dustbin_id:'', worker_id:'', collection_date:'', collection_time:'', waste_weight:'', remarks:'' })
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed'
      toast.error(msg)
      setTxnResult({ success: false, message: `Transaction rolled back — ${msg}` })
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Waste Collections</div>
          <div className="page-subtitle">{collections.length} total records</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setTxnResult(null) }}><Plus size={16} /> Record Collection</button>
      </div>

      {txnResult && (
        <div className={`alert ${txnResult.success ? 'alert-success' : 'alert-error'}`}>
          <strong>{txnResult.success ? '✅ Transaction Committed:' : '❌ Transaction Rolled Back:'}</strong> {txnResult.message}
        </div>
      )}

      <div className="search-bar">
        <div style={{ position:'relative' }}>
          <Search size={16} style={{ position:'absolute', left:10, top:11, color:'#64748b' }} />
          <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search by worker or dustbin ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {search && <button className="btn btn-secondary" onClick={() => setSearch('')}><X size={14} /> Clear</button>}
      </div>

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead><tr><th>ID</th><th>Dustbin</th><th>Worker</th><th>Date</th><th>Time</th><th>Weight (kg)</th><th>Remarks</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.collection_id}>
                <td>{c.collection_id}</td>
                <td><span className="badge badge-blue">Bin #{c.dustbin_id}</span></td>
                <td>{c.worker_name}</td>
                <td>{c.collection_date?.slice(0,10)}</td>
                <td>{c.collection_time || '—'}</td>
                <td style={{ fontWeight:600, color:'#10b981' }}>{c.waste_weight} kg</td>
                <td style={{ color:'#94a3b8' }}>{c.remarks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">⚡ Record Waste Collection</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="alert alert-success" style={{ fontSize:13 }}>
              <strong>Transaction Operation:</strong> Inserts collection record AND resets dustbin fill level to 0 atomically.
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label>Dustbin ID</label>
                  <input type="number" className={`form-control ${errors.dustbin_id?'error':''}`} value={form.dustbin_id} onChange={e => { setForm({...form, dustbin_id:e.target.value}); setErrors({...errors,dustbin_id:''}) }} placeholder="e.g. 1" />
                  {errors.dustbin_id && <div className="error-text">{errors.dustbin_id}</div>}
                </div>
                <div className="form-group">
                  <label>Worker ID</label>
                  <input type="number" className={`form-control ${errors.worker_id?'error':''}`} value={form.worker_id} onChange={e => { setForm({...form, worker_id:e.target.value}); setErrors({...errors,worker_id:''}) }} placeholder="e.g. 3" />
                  {errors.worker_id && <div className="error-text">{errors.worker_id}</div>}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label>Collection Date</label>
                  <input type="date" className={`form-control ${errors.collection_date?'error':''}`} value={form.collection_date} onChange={e => { setForm({...form, collection_date:e.target.value}); setErrors({...errors,collection_date:''}) }} />
                  {errors.collection_date && <div className="error-text">{errors.collection_date}</div>}
                </div>
                <div className="form-group">
                  <label>Collection Time</label>
                  <input type="time" className="form-control" value={form.collection_time} onChange={e => setForm({...form, collection_time:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Waste Weight (kg)</label>
                <input type="number" step="0.1" className={`form-control ${errors.waste_weight?'error':''}`} value={form.waste_weight} onChange={e => { setForm({...form, waste_weight:e.target.value}); setErrors({...errors,waste_weight:''}) }} placeholder="e.g. 45.5" />
                {errors.waste_weight && <div className="error-text">{errors.waste_weight}</div>}
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input className="form-control" value={form.remarks} onChange={e => setForm({...form, remarks:e.target.value})} placeholder="Optional notes" />
              </div>
              <div style={{ display:'flex', gap:12, marginTop:16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Processing...' : '⚡ Record (Transaction)'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Waste
