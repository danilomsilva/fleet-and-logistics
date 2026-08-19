import { useEffect, useRef } from 'react'
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Vehicle, VehicleStatus } from '@/mock-api/schemas/vehicle'
import type { Delivery } from '@/mock-api/schemas/delivery'
import { VEHICLE_STATUS_CONFIG } from '@/features/vehicles/vehicle-status-config'

// Copied alongside its sibling maplibre-gl-shared.mjs by vite-plugin-static-copy
// (see vite.config.ts) — without both files present together, tile parsing
// silently fails and only the workerless background layer paints.
setWorkerUrl(`${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`)

const VEHICLE_STATUS_COLOR: Record<VehicleStatus, string> = {
  available: '#059669',
  in_use: '#2563eb',
  maintenance: '#d97706',
  broken: '#6b7280',
}

const DELIVERY_MARKER_COLOR = '#7c3aed'

function markerElement(color: string, shape: 'circle' | 'square'): HTMLDivElement {
  const el = document.createElement('div')
  el.style.width = '14px'
  el.style.height = '14px'
  el.style.backgroundColor = color
  el.style.border = '2px solid white'
  el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4)'
  el.style.borderRadius = shape === 'circle' ? '50%' : '3px'
  return el
}

export interface DispatchMapProps {
  vehicles: Vehicle[]
  unassignedDeliveries: Delivery[]
  onDeliveryMarkerClick?: (deliveryId: string) => void
}

export function DispatchMap({
  vehicles,
  unassignedDeliveries,
  onDeliveryMarkerClick,
}: DispatchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const onDeliveryMarkerClickRef = useRef(onDeliveryMarkerClick)
  useEffect(() => {
    onDeliveryMarkerClickRef.current = onDeliveryMarkerClick
  }, [onDeliveryMarkerClick])

  useEffect(() => {
    if (!containerRef.current) return

    const map = new MapLibreMap({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      // Centered on Ireland (all vehicle/delivery locations are generated
      // there); fitBounds() below re-frames to the actual markers once data
      // loads, so this just avoids a visible jump from a global default.
      center: [-8, 53.4],
      zoom: 6,
    })
    map.addControl(new NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      try {
        map.remove()
      } catch {
        // If WebGL2 init failed (GPUInitializationError), the map's internal
        // painter is never set up and remove() throws trying to tear it down.
      }
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const markers: Marker[] = []
    const bounds = new LngLatBounds()

    for (const vehicle of vehicles) {
      const el = markerElement(VEHICLE_STATUS_COLOR[vehicle.status], 'circle')
      const config = VEHICLE_STATUS_CONFIG[vehicle.status]
      const popup = new Popup({ offset: 12 }).setHTML(
        `<strong>${vehicle.name}</strong><br/>${config.label}<br/>${vehicle.location.label}`,
      )
      const marker = new Marker({ element: el })
        .setLngLat([vehicle.location.lng, vehicle.location.lat])
        .setPopup(popup)
        .addTo(map)
      markers.push(marker)
      bounds.extend([vehicle.location.lng, vehicle.location.lat])
    }

    for (const delivery of unassignedDeliveries) {
      const el = markerElement(DELIVERY_MARKER_COLOR, 'square')
      el.style.cursor = 'pointer'
      el.addEventListener('click', () => onDeliveryMarkerClickRef.current?.(delivery.id))
      const popup = new Popup({ offset: 12 }).setHTML(
        `<strong>${delivery.id}</strong><br/>Pickup: ${delivery.pickup.label}<br/>Unassigned`,
      )
      const marker = new Marker({ element: el })
        .setLngLat([delivery.pickup.lng, delivery.pickup.lat])
        .setPopup(popup)
        .addTo(map)
      markers.push(marker)
      bounds.extend([delivery.pickup.lng, delivery.pickup.lat])
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 0 })
    }

    return () => {
      markers.forEach((marker) => marker.remove())
    }
  }, [vehicles, unassignedDeliveries])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Map of fleet vehicles and unassigned delivery pickups. Use the unassigned deliveries panel for an accessible list of the same data."
      className="h-full min-h-80 w-full overflow-hidden rounded-lg border"
    />
  )
}
