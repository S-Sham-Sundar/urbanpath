/**
 * Delivery Planner Page
 * Developer B: Ajith
 *
 * User adds delivery stops (lat, lon).
 * Calls POST /api/delivery → Held-Karp TSP or K-means++ + TSP.
 * Shows the optimal route order and total distance.
 */

import { useState } from 'react'

const API = 'http://localhost:8000'

const DEFAULT_STOPS = [
  { id: 0, lat: 13.0827, lon: 80.2707, name: 'Central Station (Depot)' },
  { id: 1, lat: 13.0500, lon: 80.2824, name: 'Marina Beach' },
  { id: 2, lat: 13.0368, lon: 80.2676, name: 'Mylapore' },
  { id: 3, lat: 13.0012, lon: 80.2565, name: 'Adyar' },
  { id: 4, lat: 13.0418, lon: 80.2341, name: 'T Nagar' },
]

export default function DeliveryPage() {
  const [stops, setStops] = useState(DEFAULT_STOPS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const optimise = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/api/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops }),
      })
      if (!res.ok) throw new Error('Optimisation failed')
      setResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const removeStop = (id) => setStops(stops.filter(s => s.id !== id))

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
        📦 Delivery Planner
      </h1>
      <p style={{ color: '#64748b', margin: '0 0 32px', fontSize: '14px' }}>
        Held-Karp TSP (exact, ≤20 stops) · K-means++ clustering (100+ stops)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>

        {/* Stops list */}
        <div>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: '0 0 12px' }}>
            Delivery Stops ({stops.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stops.map((s, i) => (
              <div key={s.id} style={{
                background: '#161c2e', border: '1px solid #1e293b',
                borderRadius: '8px', padding: '12px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
                  </div>
                </div>
                {i > 0 && (
                  <button onClick={() => removeStop(s.id)} style={{
                    background: 'none', border: 'none', color: '#ef4444',
                    cursor: 'pointer', fontSize: '16px',
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>

          <button onClick={optimise} disabled={loading || stops.length < 2} style={{
            marginTop: '16px', width: '100%', padding: '12px',
            background: loading ? '#334155' : '#3b82f6',
            color: '#fff', border: 'none', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: 700,
          }}>
            {loading ? 'Optimising...' : '⚡ Optimise Route'}
          </button>

          {error && <div style={{ color: '#f87171', marginTop: '12px', fontSize: '13px' }}>{error}</div>}
        </div>

        {/* Result */}
        <div>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: '0 0 12px' }}>
            Optimal Route
          </h3>

          {result ? (
            <div style={{ background: '#161c2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#38bdf8' }}>
                    {result.estimated_distance.toFixed(4)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Distance</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#34d399' }}>
                    {result.strategy === 'exact' ? 'Exact' : 'Clustered'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Strategy</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Visit Order
              </div>
              {result.optimal_route.map((stopIdx, i) => {
                const stop = stops[stopIdx]
                return stop ? (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 0', borderBottom: '1px solid #1e293b',
                  }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#3b82f6', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ fontSize: '13px' }}>{stop.name}</div>
                  </div>
                ) : null
              })}

              <div style={{ marginTop: '14px', fontSize: '12px', color: '#475569' }}>
                Algorithm: {result.strategy === 'exact' ? 'Held-Karp TSP — O(2ⁿ·n²)' : 'K-means++ → Held-Karp per cluster'}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#161c2e', border: '1px dashed #1e293b',
              borderRadius: '10px', padding: '40px 20px',
              textAlign: 'center', color: '#334155',
            }}>
              Click "Optimise Route" to find the shortest delivery loop
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
