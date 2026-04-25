import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import { Classroom } from "./Classroom";

const mapaLeaflet = L.map("map").setView([-25.450223, -49.233239], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapaLeaflet);

const map = new Map(mapaLeaflet);

const sala1 = Classroom.find("pa5");

if (sala1) {
  // pontos de teste
  const origem: [number, number] = [sala1.latitude, sala1.longitude];
  const porta: [number, number] = [sala1.entrance_lat, sala1.entrance_lng];

  // Coordenadas RU
  const destino1: [number, number] = [-25.449574201159372, -49.23486827142011];

  // Coordenadas Espinha de Peixe
  // const destino2: [number, number] = [-25.453075, -49.233212];

  // Coordenadas Biológicas
  // const destino3: [number, number] = [-25.447748, -49.232832];

  // adiciona marcadores
  map.addMarker(origem[0], origem[1], "Origem");
  map.addMarker(porta[0], porta[1], "Porta");
  map.addMarker(destino1[0], destino1[1], "RU");
  // mapa.addMarker(destino2[0], destino2[1], "Espinha de peixe");
  // mapa.addMarker(destino3[0], destino3[1], "Biologicas");

  await map.drawRoute(destino1, porta);

  console.log("Tempo: " + map.routeDuration + " s");
  console.log("Distância: " + map.routeDistance + " m");
}
