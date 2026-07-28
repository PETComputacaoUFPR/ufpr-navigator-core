import campusData from "../data/campuses.json" with { type: "json" };
import { type Coordinate_t, type Polygon_t, Place } from "./Place";

export type Campus_t = {
  id: number;
  name: string;
  entrance: Coordinate_t;
  polygon: Polygon_t;
};

export class Campus extends Place {
  private static _campuses: Campus_t[] = campusData.campuses;

  static get campuses(): Campus_t[] {
    return Campus._campuses;
  }

  public static getById(campusId: number): Campus_t | null {
    return Campus._campuses.find((campus) => campus.id === campusId) ?? null;
  }
}
