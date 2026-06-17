import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Edit2, X, AlertTriangle } from 'lucide-react'

const Dustbins = () => {
  const { hasRole } = useAuth()
  const [dustbins, setDustbins] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ building_id:'1', bin_type_id:'1', capacity:'100', current_fill_level:'0', dustbin_status_id:'1' })
  const [errors, setErrors] = useState({})

  const fetchDustbins = async () => {
    try {
      const res = await api.get('/dustbins')
      setDustbins(res.data)
      setFiltered(res.data)
    } catch { toast.error('Failed to load dustbins') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDustbins() }, [])

  useEffect(() => {
    let data = dustbins
    if (search) data = data.filter(d => d.building_name.toLowerCase().includes(search.toLowerCase()) || d.campus_name.toLowerCase().includes(search.toLowerCase()))
    if (filterStatus) data = data.filter(d => d.status === filterStatus)
    setFiltered(data)
  }, [search, filterStatus, dustbins])

  const getFillColor = (level) => {
    if (level >= 80) return '#ef4444'
    if (level >= 50) return '#f59e0b'
    return '#10b981'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.capacity) errs.capacity = 'Capacity is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      if (editItem) {
        await api.put(`/dustbins/${editItem.dustbin_id}`, { current_fill_level: parseInt(form.current_fill_level), dustbin_status_id: parseInt(form.dustbin_status_id) })
        toast.success('Dustbin updated')
      } else {
        await api.post('/dustbins', { building_id: parseInt(form.building_id), bin_type_id: parseInt(form.bin_type_id), capacity: parseInt(form.capacity), current_fill_level: parseInt(form.current_fill_level), dustbin_status_id: parseInt(form.dustbin_status_id) })
        toast.success('Dustbin created')
      }
      fetchDustbins()
      setShowModal(false)
      setEditItem(null)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const fullCount = dustbins.filter(d => d.current_fill_level >= 80).length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dustbins</div>
          <div className="page-subtitle">{filtered.length} dustbins • {fullCount} need attention</div>
        </div>
        {hasRole('Manager','Admin') && (
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ building_id:'1', bin_type_id:'1', capacity:'100', current_fill_level:'0', dustbin_status_id:'1' }); setShowModal(true) }}>
            <Plus size={16} /> Add Dustbin
          </button>
        )}
      </div>

      {fullCount > 0 && (
        <div className="alert alert-error">
          <AlertTriangle size={16} style={{ display:'inline', marginRight:8 }} />
          <strong>{fullCount} dustbin(s)</strong> are at or above 80% capacity and need immediate collection!
        </div>
      )}

      <div className="search-bar">
        <div style={{ position:'relative' }}>
          <Search size={16} style={{ position:'absolute', left:10, top:11, color:'#64748b' }} />
          <input className="form-control" style={{ paddingLeft:34 }} placeholder="Search by building or campus..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ maxWidth:160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Empty">Empty</option>
          <option value="InUse">In Use</option>
          <option value="Full">Full</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        {(search || filterStatus) && <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterStatus('') }}><X size={14} /> Clear</button>}
      </div>

      <div className="card" style={{ padding:0 }}>
        <table>
          <thead>
            <tr><th>ID</th><th>Building</th><th>Campus</th><th>Type</th><th>Fill Level</th><th>Capacity</th><th>Status</th><th>Last Emptied</th>{hasRole('Manager','Admin') && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.dustbin_id}>
                <td>{d.dustbin_id}</td>
                <td style={{ fontWeight:600 }}>{d.building_name}</td>
                <td>{d.campus_name}</td>
                <td><span className="badge badge-blue">{d.bin_type}</span></td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ flex:1, height:8, background:'#2d3748', borderRadius:4, maxWidth:100 }}>
                      <div style={{ width:`${d.current_fill_level}%`, height:'100%', background: getFillColor(d.current_fill_level), borderRadius:4, transition:'width 0.3s' }} />
                    </div>
                    <span style={{ color: getFillColor(d.current_fill_level), fontWeight:600, fontSize:13 }}>{d.current_fill_level}%</span>
                  </div>
                </td>
                <td>{d.capacity}L</td>
                <td><span className={`badge ${d.status==='Empty'?'badge-green':d.status==='Full'?'badge-red':d.status==='Maintenance'?'badge-yellow':'badge-blue'}`}>{d.status}</span></td>
                <td>{d.last_emptied_date ? d.last_emptied_date.slice(0,10) : '—'}</td>
                {hasRole('Manager','Admin') && (
                  <td>
                    <button className="btn btn-secondary" style={{ padding:'6px 10px' }} onClick={() => { setEditItem(d); setForm({ ...form, current_fill_level: String(d.current_fill_level), dustbin_status_id: '1' }); setShowModal(true) }}>
                      <Edit2 size={14} />
                    </button>
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
              <div className="modal-title">{editItem ? 'Update Dustbin' : 'Add New Dustbin'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {!editItem && (
                <>
                  <div className="form-group">
                    <label>Building ID</label>
                    <input type="number" className="form-control" value={form.building_id} onChange={e => setForm({...form, building_id:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Bin Type</label>
                    <select className="form-control" value={form.bin_type_id} onChange={e => setForm({...form, bin_type_id:e.target.value})}>
                      <option value="1">General</option>
                      <option value="2">Recyclable</option>
                      <option value="3">Chemical</option>
                      <option value="4">Organic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Capacity (L)</label>
                    <input type="number" className={`form-control ${errors.capacity?'error':''}`} value={form.capacity} onChange={e => setForm({...form, capacity:e.target.value})} />
                    {errors.capacity && <div className="error-text">{errors.capacity}</div>}
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Current Fill Level (%)</label>
                <input type="number" min="0" max="100" className="form-control" value={form.current_fill_level} onChange={e => setForm({...form, current_fill_level:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={form.dustbin_status_id} onChange={e => setForm({...form, dustbin_status_id:e.target.value})}>
                  <option value="1">Empty</option>
                  <option value="2">Full</option>
                  <option value="3">InUse</option>
                  <option value="4">Maintenance</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dustbins
