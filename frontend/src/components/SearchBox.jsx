/**
 * SearchBox — Trie-powered Autocomplete
 * Developer B: Ajith
 *
 * Calls GET /api/search?q=... on every keystroke.
 * The backend handles it with the Trie in O(k) time.
 */

import { useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore'

const API = 'http://localhost:8000'

export default function SearchBox({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }

    // Debounce — wait 200ms after typing stops before calling API
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setOpen(true)
        }
      } catch {
        // Backend not running — show nothing
        setResults([])
      }
    }, 200)
  }, [query])

  const handleSelect = (loc) => {
    setQuery(loc.name)
    setOpen(false)
    setResults([])
    onSelect?.(loc)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search locations... (Trie autocomplete)"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '15px',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          listStyle: 'none',
          margin: '4px 0 0',
          padding: 0,
          zIndex: 9999,
        }}>
          {results.map((r, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(r)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontWeight: 500 }}>{r.name}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
                {r.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
