import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import { type Coordinate_t } from "./Place.ts";
import { Classroom } from "./Classroom.ts";
import { formatDuration, addSecondsToCurrentTime } from "./timeUtils.ts";

const mapaLeaflet = L.map("map").setView([-25.450223, -49.233239], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapaLeaflet);

const map = new Map(mapaLeaflet);

const sala1 = Classroom.find("pa5");

if (sala1) {
  console.log(sala1);
  // pontos de teste
  const sala: Coordinate_t = sala1.coordinate;
  const porta: Coordinate_t = sala1.building_entrance;

  // const petComp: Coordinate_t = {latitude: -25.450572, longitude: -49.231689};
  // const portaDinf: Coordinate_t = {latitude: -25.450763, longitude: -49.231946};

  // Coordenadas RU
  const restauranteUniversitario: Coordinate_t = { latitude: -25.449574201159372, longitude: -49.23486827142011 };

  // Coordenadas Espinha de Peixe
  // const espinhaPeixe: Coordinate_t = {latitude: -25.453075, longitude: -49.233212};

  // Coordenadas Biológicas
  // const predioBiologicas: Coordinate_t = {latitude: -25.447748, longitude: -49.232832};

  // adiciona marcadores
  map.addMarker(sala, "Origem");
  map.addMarker(porta, "Porta");
  map.addMarker(restauranteUniversitario, "RU");
  // mapa.addMarker(esponhaPeixe, "Espinha de peixe");
  // mapa.addMarker(predioBiologicas, "Biologicas");

  // PET para porta da PA
  // await map.drawRoute(porta, portaDinf);

  // PA para RU
  await map.drawRoute(porta, restauranteUniversitario);

  if (map.routeDuration && map.routeDistance) {
    console.log("Tempo: " + formatDuration(map.routeDuration));
    console.log("Tempo de chegada: " + addSecondsToCurrentTime(map.routeDuration));
    console.log("Distância: " + map.routeDistance + " m");
  }
}
