/**
 * MapView — Leaflet Map Component
 * Developer B: Ajith
 *
 * Renders the city map using react-leaflet.
 * Draws the route path as a polyline when routePath is available.
 */

import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import useStore from '../store/useStore'

// Fix default marker icon (Leaflet + Vite issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Auto-fit map to route
function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(coords, { padding: [40, 40] })
    }
  }, [coords])
  return null
}

export default function MapView({ selectedLocation }) {
  const { routePath } = useStore()

  // Chennai center
  const center = [13.0827, 80.2707]

  // routePath is array of {lat, lon} objects
  const polylineCoords = routePath.map(p => [p.lat, p.lon])

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: '100%', height: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />

      {/* Route polyline */}
      {polylineCoords.length > 1 && (
        <>
          <Polyline
            positions={polylineCoords}
            color="#3b82f6"
            weight={5}
            opacity={0.85}
          />
          <FitBounds coords={polylineCoords} />
          {/* Start marker */}
          <Marker position={polylineCoords[0]}>
            <Popup>Start</Popup>
          </Marker>
          {/* End marker */}
          <Marker position={polylineCoords[polylineCoords.length - 1]}>
            <Popup>Destination</Popup>
          </Marker>
        </>
      )}

      {/* Selected location marker */}
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
          <Popup>{selectedLocation.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
