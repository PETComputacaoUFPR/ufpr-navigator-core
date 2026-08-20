import type { Coordinate_t } from "./Place.ts";
import type { AdjacencyList_t } from "./Graph.ts";

export type RouteResult_t = {
  path: Coordinate_t[];
  distance: number;
};

// TODO: Implementar algoritmo de Dijkstra, se quiser testar, na chamada da função
// adjacency é obtida pelo método IndoorGraph.getAdjacencyList(buildingId),
// originNodeId é obtido por IndoorGraph.findNearestStair(buildingId).id ou IndoorGraph.findNearestCorridor(buildingId, coord).id
// destinationNodeId é obtido por IndoorGraph.findNearestCorridor(buildingId, coord).id
// export function dijkstra(adjacency: AdjacencyList_t, originNodeId: string, destinationNodeId: string): RouteResult_t | null{
// ...
// }
