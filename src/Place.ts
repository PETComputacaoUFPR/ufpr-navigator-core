export type Coordinate_t = {
  latitude: number;
  longitude: number;
};

export type Polygon_t = {
  coordinates: Coordinate_t[];
};

/**
 * Calcula a distância entre dois pontos na superfície da Terra a partir da fórmula de Haversine
 *
 * @param a Coordenadas de um ponto a
 * @param b Coordenadas de um ponto b
 * @returns Menor distância entre dois pontos na superfície da Terra
 */
export function haversine(a: Coordinate_t, b: Coordinate_t): number {
  const R = 6371000; // raio medio da terra em metros

  // latitude é um ângulo medido a partir da linha do equador, logo convertemos em radianos
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  // delta latitude e longitude também são convertidos em radianos
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;

  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export abstract class Place {
  // TODO: Implementar algoritmo para verificar se um ponto pertence ou não à figura
  // public static isInside(polygon: Polygon_t, point: Coordinate_t): boolean {
  //     return true;
  // }
}
