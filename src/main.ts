import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import { IndoorGraph } from "./IndoorGraph.ts";
import { Classroom } from "./Classroom.ts";
import { Building } from "./Building.ts"
import { formatDuration, addSecondsToCurrentTime } from "./timeUtils.ts";

const mapaLeaflet = L.map("map").setView([-25.450223, -49.233239], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapaLeaflet);

const map = new Map(mapaLeaflet);

map.watchUserPosition();

const sala = Classroom.find("ph8");
const restauranteUniversitario = Classroom.find("ru");

if (sala && restauranteUniversitario) {
  console.log(sala);

  // pontos de teste
  const porta = Building.getNearestEntrance(sala.building_id, sala.coordinate);

  if(porta) {
    const escada = await IndoorGraph.findNearestStair(sala.building_id, porta);

    // const petComp: Coordinate_t = {latitude: -25.450572, longitude: -49.231689};
    // const portaDinf: Coordinate_t = {latitude: -25.450763, longitude: -49.231946};

    // Coordenadas Espinha de Peixe
    // const espinhaPeixe: Coordinate_t = {latitude: -25.453075, longitude: -49.233212};

    // Coordenadas Biológicas
    // const predioBiologicas: Coordinate_t = {latitude: -25.447748, longitude: -49.232832};

    // adiciona marcadores

    const salaCorridor = await IndoorGraph.findNearestCorridor(sala.building_id, sala.coordinate);
    console.log(salaCorridor);
    if (salaCorridor) map.addMarker(salaCorridor.coordinate, sala.name);
    map.addMarker(porta, "Porta");
    if (escada) {
      console.log(escada);
      map.addMarker(escada.coordinate, "Escada");
    }
    // map.addMarker(restauranteUniversitario, "RU");
    // mapa.addMarker(esponhaPeixe, "Espinha de peixe");
    // mapa.addMarker(predioBiologicas, "Biologicas");

    // PET para porta da PA
    // await map.drawRoute(porta, portaDinf);

    // PA para RU
    await map.drawRoute(porta, restauranteUniversitario.coordinate);

    if (map.routeDuration && map.routeDistance) {
      console.log("Tempo: " + formatDuration(map.routeDuration));
      console.log("Tempo de chegada: " + addSecondsToCurrentTime(map.routeDuration));
      console.log("Distância: " + map.routeDistance + " m");
    }
  }
}
