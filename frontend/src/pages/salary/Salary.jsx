import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { Plus, X } from 'lucide-react'

const Salary = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [txnResult, setTxnResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ worker_id:'', month:'', year: new Date().getFullYear(), payment_date:'' })
  const [components, setComponents] = useState([{ component_type:'Basic', amount:'' }, { component_type:'Bonus', amount:'' }, { component_type:'Deduction', amount:'' }])
  const [errors, setErrors] = useState({})

  const fetch = async () => {
    try {
      const res = await api.get('/salary')
      setPayments(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const validate = () => {
    const e = {}
    if (!form.worker_id) e.worker_id = 'Required'
    if (!form.month)     e.month     = 'Required'
    if (!form.year)      e.year      = 'Required'
    const validComps = components.filter(c => c.amount && parseFloat(c.amount) > 0)
    if (validComps.length === 0) e.components = 'At least one component with amount is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setTxnResult(null)
    const validComps = components.filter(c => c.amount && parseFloat(c.amount) > 0).map(c => ({ component_type: c.component_type, amount: parseFloat(c.amount) }))
    try {
      const res = await api.post('/salary', { worker_id: parseInt(form.worker_id), month: parseInt(form.month), year: parseInt(form.year), payment_date: form.payment_date || undefined, components: validComps })
      toast.success('Salary payment processed successfully')
      setTxnResult({ success: true, message: `Transaction committed — Payment ID: ${res.data.payment_id}. ${validComps.length} salary components inserted atomically.` })
      fetch()
      setShowModal(false)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed'
      toast.error(msg)
      setTxnResult({ success: false, message: `Transaction rolled back — ${msg}` })
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Salary Management</div>
          <div className="page-subtitle">{payments.length} payment records</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setTxnResult(null); setErrors({}) }}><Plus size={16} /> Process Salary</button>
      </div>

      {txnResult && (
        <div className={`alert ${txnResult.success ? 'alert-success' : 'alert-error'}`}>
          <strong>{txnResult.success ? '✅ Transaction Committed:' : '❌ Transaction Rolled Back:'}</strong> {txnResult.message}
        </div>
      )}

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead><tr><th>ID</th><th>Worker</th><th>Month</th><th>Year</th><th>Payment Date</th><th>Status</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id}>
                <td>{p.payment_id}</td>
                <td style={{ fontWeight:600 }}>{p.worker_name}</td>
                <td>{months[p.month - 1]}</td>
                <td>{p.year}</td>
                <td>{p.payment_date?.slice(0,10)}</td>
                <td><span className={`badge ${p.payment_status==='Paid'?'badge-green':'badge-yellow'}`}>{p.payment_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">⚡ Process Salary Payment</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="alert alert-success" style={{ fontSize:13 }}>
              <strong>Transaction Operation:</strong> Payment header + all components are inserted atomically. Rolls back if duplicate or invalid.
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label>Worker ID</label>
                  <input type="number" className={`form-control ${errors.worker_id?'error':''}`} value={form.worker_id} onChange={e => setForm({...form,worker_id:e.target.value})} placeholder="e.g. 3" />
                  {errors.worker_id && <div className="error-text">{errors.worker_id}</div>}
                </div>
                <div className="form-group">
                  <label>Month</label>
                  <select className={`form-control ${errors.month?'error':''}`} value={form.month} onChange={e => setForm({...form,month:e.target.value})}>
                    <option value="">Select</option>
                    {months.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                  {errors.month && <div className="error-text">{errors.month}</div>}
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" className="form-control" value={form.year} onChange={e => setForm({...form,year:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" className="form-control" value={form.payment_date} onChange={e => setForm({...form,payment_date:e.target.value})} />
              </div>

              <div style={{ borderTop:'1px solid #2d3748', paddingTop:16, marginTop:8 }}>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:12, fontWeight:600 }}>SALARY COMPONENTS</div>
                {errors.components && <div className="error-text" style={{ marginBottom:8 }}>{errors.components}</div>}
                {components.map((comp, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div className="form-group" style={{ margin:0 }}>
                      <label>Type</label>
                      <select className="form-control" value={comp.component_type} onChange={e => { const c=[...components]; c[i].component_type=e.target.value; setComponents(c) }}>
                        <option>Basic</option><option>Bonus</option><option>Deduction</option><option>Allowance</option><option>Tax</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin:0 }}>
                      <label>Amount (PKR)</label>
                      <input type="number" className="form-control" value={comp.amount} onChange={e => { const c=[...components]; c[i].amount=e.target.value; setComponents(c) }} placeholder="0" />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Processing...' : '⚡ Process (Transaction)'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Salary
