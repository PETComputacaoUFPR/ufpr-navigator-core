import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map } from "./Map";
import { Classroom } from "./Classroom";
import { formatDuration, addSecondsToCurrentTime } from "./timeUtils.ts";

const mapaLeaflet = L.map("map").setView([-25.450223, -49.233239], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapaLeaflet);

const map = new Map(mapaLeaflet);

const sala1 = Classroom.find("pa5");

if (sala1) {
  // pontos de teste
  const sala: [number, number] = [sala1.latitude, sala1.longitude];
  const porta: [number, number] = [sala1.entrance_lat, sala1.entrance_lng];

  // const petComp: [number, number] = [-25.450572, -49.231689];
  // const portaDinf: [number, number] = [-25.450763, -49.231946];
  // Coordenadas RU
  const ponto1: [number, number] = [-25.449574201159372, -49.23486827142011];

  // Coordenadas Espinha de Peixe
  // const ponto2: [number, number] = [-25.453075, -49.233212];

  // Coordenadas Biológicas
  // const ponto3: [number, number] = [-25.447748, -49.232832];

  // adiciona marcadores
  map.addMarker(sala[0], sala[1], "Origem");
  map.addMarker(porta[0], porta[1], "Porta");
  map.addMarker(ponto1[0], ponto1[1], "RU");
  // mapa.addMarker(destino2[0], destino2[1], "Espinha de peixe");
  // mapa.addMarker(destino3[0], destino3[1], "Biologicas");

  // PET para porta da PA
  // await map.drawRoute(petComp, porta);
  // adicionando porta do pet como intermediario
  await map.drawRoute(ponto1, porta);

  if (map.routeDuration && map.routeDistance) {
    console.log("Tempo: " + formatDuration(map.routeDuration));
    console.log(
      "Tempo de chegada: " + addSecondsToCurrentTime(map.routeDuration),
    );
    console.log("Distância: " + map.routeDistance + " m");
  }
}
