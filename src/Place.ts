export type Coordinate_t = {
  latitude: number;
  longitude: number;
};

export type Polygon_t = {
  coordinates: Coordinate_t[];
};

export abstract class Place {
  // TODO: Implementar algoritmo para verificar se um ponto pertence ou não à figura
  // static isInside(polygon: Polygon_t, point: Coordinate_t): boolean {
  //     return true;
  // }
}
