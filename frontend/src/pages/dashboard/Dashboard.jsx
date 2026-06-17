import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, Trash2, Recycle, Wrench } from 'lucide-react'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6']

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ workers:0, dustbins:0, collections:0, maintenance:0 })
  const [dustbins, setDustbins] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [w, d, c, m] = await Promise.all([
          api.get('/workers').catch(() => ({ data: [] })),
          api.get('/dustbins'),
          api.get('/waste-collections'),
          api.get('/maintenance'),
        ])
        setStats({
          workers: w.data.length,
          dustbins: d.data.length,
          collections: c.data.length,
          maintenance: m.data.length,
        })
        setDustbins(d.data)
        setCollections(c.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const binTypeData = dustbins.reduce((acc, d) => {
    const existing = acc.find(a => a.name === d.bin_type)
    if (existing) { existing.count++; existing.avgFill = Math.round((existing.avgFill + d.current_fill_level) / 2) }
    else acc.push({ name: d.bin_type, count: 1, avgFill: d.current_fill_level })
    return acc
  }, [])

  const statusData = dustbins.reduce((acc, d) => {
    const existing = acc.find(a => a.name === d.status)
    if (existing) existing.value++
    else acc.push({ name: d.status, value: 1 })
    return acc
  }, [])

  const collectionChart = collections.slice(0, 7).map(c => ({
    date: c.collection_date?.slice(5, 10),
    weight: parseFloat(c.waste_weight)
  })).reverse()

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Welcome back, {user?.username} 👋</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label:'Total Workers',     value: stats.workers,     icon:'👷', color:'#1e3a5f' },
          { label:'Total Dustbins',    value: stats.dustbins,    icon:'🗑️', color:'#064e3b' },
          { label:'Waste Collections', value: stats.collections, icon:'♻️', color:'#78350f' },
          { label:'Maintenance Req.',  value: stats.maintenance, icon:'🔧', color:'#4c1d95' },
        ].map((s,i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Bar chart */}
        <div className="card">
          <h3 style={{ marginBottom:20, fontSize:16, fontWeight:600 }}>Waste Collected (kg) — Recent</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={collectionChart}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3748', borderRadius:8 }} />
              <Bar dataKey="weight" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 style={{ marginBottom:20, fontSize:16, fontWeight:600 }}>Dustbin Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3748', borderRadius:8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bin type bar chart */}
      <div className="card">
        <h3 style={{ marginBottom:20, fontSize:16, fontWeight:600 }}>Average Fill Level by Bin Type (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={binTypeData}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0,100]} />
            <Tooltip contentStyle={{ background:'#1a1d2e', border:'1px solid #2d3748', borderRadius:8 }} />
            <Bar dataKey="avgFill" fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Dashboard
