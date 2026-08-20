import { useEffect, useRef } from 'react'
import { LngLatBounds, Map as MapLibreMap, Marker, Popup, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeoPoint } from '@/mock-api/schemas/common'

setWorkerUrl(`${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`)

const PICKUP_COLOR = '#059669'
const DESTINATION_COLOR = '#7c3aed'

function markerElement(color: string): HTMLDivElement {
  const el = document.createElement('div')
  el.style.width = '14px'
  el.style.height = '14px'
  el.style.backgroundColor = color
  el.style.border = '2px solid white'
  el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4)'
  el.style.borderRadius = '50%'
  return el
}

export interface DeliveryRouteMapProps {
  pickup: GeoPoint
  destination: GeoPoint
}

/**
 * A straight-line route preview between pickup and destination — this app's
 * MapLibre setup (demotiles style, no key) has no turn-by-turn routing
 * service behind it, so a direct line is the honest approximation.
 */
export function DeliveryRouteMap({ pickup, destination }: DeliveryRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new MapLibreMap({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [(pickup.lng + destination.lng) / 2, (pickup.lat + destination.lat) / 2],
      zoom: 6,
      // No NavigationControl: role="img" below means this preview must have
      // no focusable descendants (interactive panning/zoom belongs on the
      // main Dispatch map, not a small illustrative route preview).
      interactive: false,
    })

    const markers: Marker[] = []

    // If WebGL2 init failed (GPUInitializationError — e.g. an old browser, or
    // a headless test environment with no GPU), the map's internal painter
    // and transform are never fully set up, and marker/layer calls below
    // throw. Guarded so the rest of the page still renders.
    try {
      map.on('load', () => {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [pickup.lng, pickup.lat],
                [destination.lng, destination.lat],
              ],
            },
          },
        })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': DESTINATION_COLOR,
            'line-width': 3,
            'line-dasharray': [2, 2],
          },
        })
      })

      markers.push(
        new Marker({ element: markerElement(PICKUP_COLOR) })
          .setLngLat([pickup.lng, pickup.lat])
          .setPopup(
            new Popup({ offset: 12 }).setHTML(`<strong>Pickup</strong><br/>${pickup.label}`),
          )
          .addTo(map),
      )
      markers.push(
        new Marker({ element: markerElement(DESTINATION_COLOR) })
          .setLngLat([destination.lng, destination.lat])
          .setPopup(
            new Popup({ offset: 12 }).setHTML(
              `<strong>Destination</strong><br/>${destination.label}`,
            ),
          )
          .addTo(map),
      )

      const bounds = new LngLatBounds()
      bounds.extend([pickup.lng, pickup.lat])
      bounds.extend([destination.lng, destination.lat])
      map.fitBounds(bounds, { padding: 64, maxZoom: 11, duration: 0 })
    } catch {
      // Handled above.
    }

    return () => {
      markers.forEach((marker) => marker.remove())
      try {
        map.remove()
      } catch {
        // Same WebGL2-unavailable case as above.
      }
    }
  }, [pickup, destination])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Map showing the route from ${pickup.label} to ${destination.label}`}
      className="min-h-64 w-full flex-1 overflow-hidden rounded-lg border"
    />
  )
}
