import buildingData from "../data/buildings.json" with { type: "json" };
import { type Coordinate_t, type Polygon_t, Place } from "./Place";

export type Building_t = {
  id: number;
  name: string;
  code: string;
  entrance: Coordinate_t;
  polygon: Polygon_t;
  campus_id: number;
};

export class Building extends Place {
  private static _buildings: Building_t[] = buildingData.buildings;

  static get buildings(): Building_t[] {
    return Building._buildings;
  }

  public static getById(buildingId: number): Building_t | null {
    return Building._buildings.find((b) => b.id == buildingId) ?? null;
  }
}
