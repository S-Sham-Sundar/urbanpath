/**
 * Map Page — Main Explorer
 * Developer B: Ajith
 *
 * Features:
 *  - Search box (Trie autocomplete via /api/search)
 *  - Route finder (Dijkstra vs A* toggle via /api/route)
 *  - Live Leaflet map with route polyline
 */

import { useState } from 'react'
import MapView from '../components/MapView'
import SearchBox from '../components/SearchBox'
import useStore from '../store/useStore'

const API = 'http://localhost:8000'

export default function MapPage() {
  const {
    routeSrc, routeDst, routeDistance, routeAlgorithm,
    setRouteSrc, setRouteDst, setRoute, setRouteAlgorithm, clearRoute,
  } = useStore()

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [srcInput, setSrcInput] = useState('')
  const [dstInput, setDstInput] = useState('')

  const findRoute = async () => {
    if (!srcInput || !dstInput) {
      setError('Enter both source and destination node IDs')
      return
    }
    setLoading(true)
    setError('')
    clearRoute()

    try {
      const res = await fetch(
        `${API}/api/route?src=${srcInput}&dst=${dstInput}&algorithm=${routeAlgorithm}`
      )
      if (!res.ok) throw new Error('Route not found')
      const data = await res.json()
      setRoute(data.path_coords, data.distance)
      setRouteSrc(srcInput)
      setRouteDst(dstInput)
    } catch (e) {
      setError(e.message || 'Could not connect to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: '320px', minWidth: '320px',
        background: '#0f172a', color: '#e2e8f0',
        padding: '24px 20px', display: 'flex',
        flexDirection: 'column', gap: '20px', overflowY: 'auto',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', color: '#fff', letterSpacing: '-0.5px' }}>
            🗺 UrbanPath
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
            City Graph Intelligence Engine
          </p>
        </div>

        {/* Search */}
        <div>
          <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
            Location Search (Trie)
          </label>
          <div style={{ marginTop: '8px' }}>
            <SearchBox onSelect={(loc) => setSelectedLocation(loc)} />
          </div>
        </div>

        {/* Route Finder */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
            Route Finder
          </label>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="number"
              placeholder="Source node ID (e.g. 0)"
              value={srcInput}
              onChange={e => setSrcInput(e.target.value)}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Destination node ID (e.g. 42)"
              value={dstInput}
              onChange={e => setDstInput(e.target.value)}
              style={inputStyle}
            />

            {/* Algorithm toggle */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {['astar', 'dijkstra'].map(algo => (
                <button
                  key={algo}
                  onClick={() => setRouteAlgorithm(algo)}
                  style={{
                    flex: 1, padding: '8px',
                    background: routeAlgorithm === algo ? '#3b82f6' : '#1e293b',
                    color: '#fff', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}
                >
                  {algo === 'astar' ? 'A*' : 'Dijkstra'}
                </button>
              ))}
            </div>

            <button
              onClick={findRoute}
              disabled={loading}
              style={{
                padding: '10px', background: loading ? '#334155' : '#3b82f6',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: 700, marginTop: '4px',
              }}
            >
              {loading ? 'Finding...' : 'Find Route'}
            </button>
          </div>
        </div>

        {/* Result */}
        {routeDistance !== null && (
          <div style={{
            background: '#0ea5e910', border: '1px solid #0ea5e930',
            borderRadius: '8px', padding: '14px',
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Result</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              {routeDistance.toFixed(2)} km
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Algorithm: {routeAlgorithm === 'astar' ? 'A* (Haversine heuristic)' : "Dijkstra's"}
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: '#f87171', fontSize: '13px', background: '#f871711a', padding: '10px', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {/* DSA info */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: 'auto' }}>
          <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.7 }}>
            <div>🔍 <b style={{ color: '#94a3b8' }}>Search</b> — Trie · O(k)</div>
            <div>🛣 <b style={{ color: '#94a3b8' }}>A*</b> — Haversine heuristic · O(E log V)</div>
            <div>📍 <b style={{ color: '#94a3b8' }}>Dijkstra</b> — Custom MinHeap · O(E log V)</div>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, padding: '16px', background: '#0a0e1a' }}>
        <MapView selectedLocation={selectedLocation} />
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '9px 12px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
