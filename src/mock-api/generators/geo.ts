import { faker } from '@faker-js/faker'
import type { GeoPoint } from '../schemas/common'

const IRISH_TOWNS: [string, number, number][] = [
  ['Dublin', 53.3498, -6.2603],
  ['Cork', 51.8985, -8.4756],
  ['Limerick', 52.6638, -8.6267],
  ['Galway', 53.2707, -9.0568],
  ['Waterford', 52.2593, -7.1101],
  ['Kilkenny', 52.6541, -7.2448],
  ['Wexford', 52.3369, -6.4633],
  ['Sligo', 54.2766, -8.4761],
  ['Athlone', 53.4239, -7.9407],
  ['Drogheda', 53.7189, -6.3478],
  ['Dundalk', 54.0, -6.4167],
  ['Tralee', 52.2703, -9.7028],
  ['Ennis', 52.8436, -8.9864],
  ['Carlow', 52.8365, -6.9341],
  ['Naas', 53.2158, -6.6672],
  ['Mullingar', 53.5262, -7.3382],
  ['Letterkenny', 54.9503, -7.7346],
  ['Wicklow', 52.9808, -6.0446],
  ['Tullamore', 53.2739, -7.4931],
  ['Portlaoise', 53.0328, -7.301],
]

export function irishTownGeoPoint(): GeoPoint {
  const [label, lat, lng] = faker.helpers.arrayElement(IRISH_TOWNS)
  return { lat, lng, label }
}

/** Broken vehicles are always parked at the company warehouse in Dundalk. */
export function warehouseGeoPoint(): GeoPoint {
  const [label, lat, lng] = IRISH_TOWNS.find(([name]) => name === 'Dundalk')!
  return { lat, lng, label }
}
