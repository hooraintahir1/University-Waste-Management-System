import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => (
  <div style={{ display:'flex' }}>
    <Sidebar />
    <main style={{ marginLeft:'240px', flex:1, padding:'32px', minHeight:'100vh' }}>
      <Outlet />
    </main>
  </div>
)

export default Layout
