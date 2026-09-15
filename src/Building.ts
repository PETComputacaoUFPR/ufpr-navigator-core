import buildingData from "../data/buildings.json" with { type: "json" };
import { type Coordinate_t, type Polygon_t, Place, haversine } from "./Place";

export type Building_t = {
  id: number;
  name: string;
  code: string;
  entrances: Coordinate_t[];
  polygon: Polygon_t;
  campus_id: number;
};

export class Building extends Place {
  private static _buildings: Building_t[] = buildingData.buildings;

  static get buildings(): Building_t[] {
    return Building._buildings;
  }

  public static getByCampusId(campusId: number): Building_t[] {
    return Building._buildings.filter((building) => {
      return building.campus_id == campusId;
    });
  }

  public static getById(buildingId: number): Building_t | null {
    return Building._buildings.find((b) => b.id == buildingId) ?? null;
  }

  public static getNearestEntrance(buildingId: number, coord: Coordinate_t): Coordinate_t | null {
    const building = Building.getById(buildingId);
    if (!building) return null;

    const rankedEntrances = building.entrances.map((entrance) => ({
      entrance,
      distance: haversine(entrance, coord),
    }));
    rankedEntrances.sort((a, b) => a.distance - b.distance);

    return rankedEntrances[0]?.entrance ?? null;
  }
}
