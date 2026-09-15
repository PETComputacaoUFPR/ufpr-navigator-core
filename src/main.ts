import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import { IndoorGraph } from "./IndoorGraph.ts";
import { Classroom } from "./Classroom.ts";
import { Building } from "./Building.ts";
import { formatDuration, addSecondsToCurrentTime } from "./timeUtils.ts";

const mapLeaflet = L.map("map").setView([-25.450223, -49.233239], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapLeaflet);

const map = new Map(mapLeaflet);

map.watchUserPosition();

const origin = Classroom.find(Classroom.getSuggestions("ct5")[0].name);
const destiny = Classroom.find(Classroom.getSuggestions("ph11")[0].name);

if (origin && destiny) {
  const originEntrance = Building.getNearestEntrance(origin.building_id, origin.coordinate);
  // entra no prédio pela entrada mais perto da origem
  const destinyEntrance = Building.getNearestEntrance(destiny.building_id, origin.coordinate);

  if (originEntrance && destinyEntrance) {
    if (destiny.floor != 0) {
      const stair = await IndoorGraph.findNearestStair(destiny.building_id, destinyEntrance);
      if (stair) {
        console.log(stair);
        map.addMarker(stair.coordinate, "Escada");
      }
    }

    const originCorridor = await IndoorGraph.findNearestCorridor(origin.building_id, origin.coordinate);
    console.log(originCorridor);
    if (originCorridor) map.addMarker(originCorridor.coordinate, origin.name);
    map.addMarker(destiny.coordinate, destiny.name);

    await map.drawRoute(originEntrance, destinyEntrance);

    if (map.routeDuration && map.routeDistance) {
      console.log("Tempo: " + formatDuration(map.routeDuration));
      console.log("Tempo de chegada: " + addSecondsToCurrentTime(map.routeDuration));
      console.log("Distância: " + map.routeDistance + " m");
    }
  }
}
