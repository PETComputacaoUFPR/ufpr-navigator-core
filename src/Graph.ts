// Arquivo Graph.ts contem os tipo utilizados por um grafo genérico
import { type Coordinate_t } from "./Place.ts"

// O tipo de NodeType equivale a um enum, mas o eslint reclama que enum não é sintaxe que some na compilação
export const NodeType = {
    Corridor: "corridor",
    Stair: "stair",
    Elevator: "elevator",
    Entrance: "entrance",
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

// Tipo para os nós do grafo
export type GraphNode_t = {
    id: string;
    type: NodeType;
    coordinate: Coordinate_t;
};

// Tipo para os vértices do grafo
export type GraphEdge_t = {
    from: string,
    to: string;
    weight: number;
};

// Equivalente aos JSONs da pasta data/graphs
export type Graph_t = {
    building_id: number;
    nodes: GraphNode_t[];
    edges: GraphEdge_t[];
};

// Representa um vizinho de um nó no grafo — para onde vai e qual o custo
export type AdjacencyEntry_t = {
    to: string;
    weight: number;
};

// Lista de adjacência do grafo, dado o id de um nó, retorna todos os seus vizinhos
// O map é como se fosse uma tabela Hash
// Exemplo: "node_1" → [{ to: "node_2", weight: 3.5 }, { to: "node_3", weight: 2.1 }]
export type AdjacencyList_t = Map<string, AdjacencyEntry_t[]>;
