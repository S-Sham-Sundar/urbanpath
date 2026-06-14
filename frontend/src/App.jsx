/**
 * App — Router
 * Developer B: Ajith
 */

import { useState } from 'react'
import MapPage from './pages/MapPage'
import DeliveryPage from './pages/DeliveryPage'

export default function App() {
  const [page, setPage] = useState('map')

  const navStyle = (active) => ({
    padding: '8px 18px',
    background: page === active ? '#3b82f6' : 'transparent',
    color: page === active ? '#fff' : '#94a3b8',
    border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
  })

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Top nav */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#0a0e1a', borderBottom: '1px solid #1e293b',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: '15px', marginRight: '12px' }}>
          UrbanPath
        </span>
        <button style={navStyle('map')} onClick={() => setPage('map')}>🗺 Map Explorer</button>
        <button style={navStyle('delivery')} onClick={() => setPage('delivery')}>📦 Delivery Planner</button>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: '52px', height: '100vh', boxSizing: 'border-box' }}>
        {page === 'map' && <MapPage />}
        {page === 'delivery' && <DeliveryPage />}
      </div>
    </div>
  )
}
