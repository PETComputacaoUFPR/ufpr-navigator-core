import { NodeType } from "./Graph.ts";
import type { GraphNode_t, AdjacencyList_t, Graph_t } from "./Graph.ts";
import { haversine } from "./Place.ts";
import { Building } from "./Building.ts";

export class IndoorGraph {
  // utilizo uma tabela hash como cache para reduzir tempo em caso de buscas repetidas
  private static _cache: Map<number, Graph_t> = new Map();
  private static _adjacencyCache: Map<number, AdjacencyList_t> = new Map();

  public static async getGraphByBuildingId(buildingId: number): Promise<Graph_t | null> {
    if (IndoorGraph._cache.has(buildingId)) {
      // ver aula sobre nullish coalelscing operator em advance types
      return IndoorGraph._cache.get(buildingId) ?? null;
    }

    const building = Building.getById(buildingId);
    if (!building) return null;

    const code = building.code.toLowerCase();
    const data = (await import(`../data/graphs/${code}.json`, { with: { type: "json" } })) as { default: Graph_t };

    IndoorGraph._cache.set(buildingId, data.default);
    return data.default;
  }

  public static async getAdjacencyList(buildingId: number): Promise<AdjacencyList_t | null> {
    if (IndoorGraph._adjacencyCache.has(buildingId)) {
      // ver aula sobre nullish coalelscing operator em advance types
      return IndoorGraph._adjacencyCache.get(buildingId) ?? null;
    }

    const graph = await IndoorGraph.getGraphByBuildingId(buildingId);
    if (!graph) return null;

    const adjacency: AdjacencyList_t = new Map();
    graph.edges.forEach((edge) => {
      if (!adjacency.has(edge.from)) {
        adjacency.set(edge.from, []);
      }
      adjacency.get(edge.from)?.push({ to: edge.to, weight: edge.weight });
    });

    IndoorGraph._adjacencyCache.set(buildingId, adjacency);
    return adjacency;
  }

  public static async findNearestStair(buildingId: number): Promise<GraphNode_t | null> {
    const graph = await IndoorGraph.getGraphByBuildingId(buildingId);
    if (!graph) return null;

    const building = Building.getById(buildingId);
    if (!building) return null;

    const stairs = graph.nodes.filter((node) => {
      return node.type == NodeType.Stair;
    });
    const rankedStairs = stairs.map((stair) => ({ stair, distance: haversine(stair.coordinate, building.entrance) }));
    rankedStairs.sort((a, b) => a.distance - b.distance);
    return rankedStairs[0]?.stair ?? null;
  }
}
