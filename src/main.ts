import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import { IndoorGraph } from "./IndoorGraph.ts";
import { Classroom } from "./Classroom.ts";
import { formatDuration, addSecondsToCurrentTime } from "./timeUtils.ts";

const mapaLeaflet = L.map("map").setView([-25.450223, -49.233239], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapaLeaflet);

const map = new Map(mapaLeaflet);

map.watchUserPosition();

const sala = Classroom.find(Classroom.getSuggestions("lab.12dinf")[0].name);
const destino = Classroom.find(Classroom.getSuggestions("ct15")[0].name);

if (sala && destino) {
  if (destino.floor != 0) {
    const escada = await IndoorGraph.findNearestStair(destino.building_id, destino.building_entrance);
    if (escada) {
      console.log(escada);
      map.addMarker(escada.coordinate, "Escada");
    }
  }

  const salaCorridor = await IndoorGraph.findNearestCorridor(sala.building_id, sala.coordinate);
  console.log(salaCorridor);
  if (salaCorridor) map.addMarker(salaCorridor.coordinate, sala.name);
  map.addMarker(destino.coordinate, destino.name);

  await map.drawRoute(sala.building_entrance, destino.building_entrance);

  if (map.routeDuration && map.routeDistance) {
    console.log("Tempo: " + formatDuration(map.routeDuration));
    console.log("Tempo de chegada: " + addSecondsToCurrentTime(map.routeDuration));
    console.log("Distância: " + map.routeDistance + " m");
  }
}
