import * as L from "leaflet";
import { type Coordinate_t } from "./Place.ts";

// ===Tipos e interfaces para o formato de retorno do OSRM===
type Geometry = {
  coordinates: [number, number][]; // [lng, lat]
  type: "LineString";
};

type Leg = {
  duration: number;
  distance: number;
  steps: unknown[];
};

interface Route {
  distance: number;
  duration: number;
  weight: number;
  weight_name: string;
  geometry: Geometry;
  legs: Leg[];
}

interface OSRMResponse {
  routes: Route[];
}
// ===========

const markerOptions: L.TooltipOptions = {
  permanent: true,
  direction: "top",
  offset: [-15, -5],
};

const routeOptions: L.GeoJSONOptions = {
  style: {
    color: "#007EA7",
    weight: 5,
  },
};

// numero maximo de marcadores, com excecao do de localizacao do usuario
const MAX_MARKERS = 3;
const DEFAULT_ZOOM = 19;
const ROUTE_STEP_WEIGHT = 15; // metros "equivalentes" por step no cálculo de rotas"

export class Map {
  private map: L.Map;
  private _userMarker: L.Marker | null = null;
  private _userCoords: Coordinate_t | null = null;
  private _route: L.GeoJSON | null = null;
  private _routeData: Route | null = null;
  private _markers: L.Marker[] = [];
  private _watchId: number | null = null;

  constructor(map: L.Map) {
    this.map = map;
  }

  get userCoords(): Coordinate_t | null {
    if (!this._userCoords) return null;
    return this._userCoords;
  }

  get routeDuration(): number | null {
    if (!this._routeData) return null;
    return this._routeData.duration;
  }

  get routeDistance(): number | null {
    if (!this._routeData) return null;
    return this._routeData.distance;
  }

  /**
   * Inicia o monitoramento da geolocalização do usuário.
   *
   * Se já houver um monitoramento ativo, ele é cancelado antes de iniciar um novo.
   * Atualiza as coordenadas e o marcador do usuário no mapa a cada leitura válida.
   *
   * Uma leitura é considerada válida se a precisão for menor que 15 metros.
   */
  public watchUserPosition(): void {
    if (!navigator.geolocation) {
      console.error("Geolocalização não suportada");
      return;
    }

    if (this._watchId) {
      navigator.geolocation.clearWatch(this._watchId);
    }

    this._watchId = navigator.geolocation.watchPosition(
      (success) => {
        // console.log(success.coords.accuracy);
        // checar precisão fora dos prédios
        if (success.coords.accuracy > 15) return;

        const coord: Coordinate_t = { latitude: success.coords.latitude, longitude: success.coords.longitude };

        this._userCoords = coord;

        if (this._userMarker) this._userMarker.setLatLng([coord.latitude, coord.longitude]);
        else {
          // TODO: Mudar icone do marcador de usuario
          const marker = L.marker([coord.latitude, coord.longitude]).bindTooltip("Você", markerOptions);
          marker.addTo(this.map);
          this.map.setView([coord.latitude, coord.longitude], DEFAULT_ZOOM, { animate: true });
          this._userMarker = marker;
        }
      },
      (error) => console.log("Erro na geolocalização", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 },
    );
  }

  /**
   * Adiciona um marcador ao mapa.
   *
   * O marcador é adicionado na posição (`lat`, `lng`) com uma legenda opcional `label`.
   * O mapa também é centralizado nessa posição. Se o número máximo de
   * marcadores (`MAX_MARKERS`) for ultrapassado, o marcador mais antigo é removido.
   *
   * @param lat - Latitude do marcador
   * @param lng - Longitude do marcador
   * @param label - Texto exibido na legenda do marcador (opcional)
   * @returns O marcador (`L.Marker`) adicionado
   */
  public addMarker(coord: Coordinate_t, label: string = ""): L.Marker {
    const marker = L.marker([coord.latitude, coord.longitude]).bindTooltip(label, markerOptions);
    marker.addTo(this.map);
    // this.map.setView([lat, lng], DEFAULT_ZOOM, { animate: true });

    this._markers.push(marker);

    if (this._markers.length > MAX_MARKERS) {
      this.removeMarker();
    }

    return marker;
  }

  /**
   * Desenha uma rota no mapa entre o ponto de origem e o destino.
   *
   * O método remove qualquer rota existente antes de desenhar a nova.
   * O mapa é ajustado automaticamente
   * para que toda a rota fique visível.
   *
   * @param origin - Coordenadas de origem
   * @param destination - Coordenadas de destino
   * @param waypoint - (Opcional) Coordenadas da porta do predio do destino
   * @returns Promise<void>
   */
  public async drawRoute(
    origin: Coordinate_t,
    destination: Coordinate_t,
    waypoint: Coordinate_t | null = null,
  ): Promise<void> {
    this.removeRoute();

    const routeData = await this.getRoute(origin, destination, waypoint);

    if (routeData) {
      this._routeData = routeData;
      this._route = L.geoJSON(routeData.geometry, routeOptions).addTo(this.map);

      const bounds = this._route.getBounds();
      this.map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }

  private removeMarker(): void {
    if (this._markers.length > 0) {
      this.map.removeLayer(this._markers[0]);
      this._markers.shift();
    }
  }

  private getBestRoute(routes: Route[]): Route {
    // adicionar steps no weight reduz obstáculos como atravessar rua, que não são levados em conta pelo OSRM
    const weight = (route: Route) => route.distance + route.legs[0].steps.length * ROUTE_STEP_WEIGHT;

    let bestRoute = routes[0];
    let minWeight = weight(bestRoute);

    for (let i = 1; i < routes.length; i++) {
      const routeWeight = weight(routes[i]);

      if (routeWeight < minWeight) {
        bestRoute = routes[i];
        minWeight = routeWeight;
      }
    }

    return bestRoute;
  }

  private async getRoute(
    origin: Coordinate_t,
    destination: Coordinate_t,
    waypoint: Coordinate_t | null = null,
  ): Promise<Route | null> {
    // formato para entrada na API OSRM
    const toLngLat = (coord: Coordinate_t) => `${coord.longitude},${coord.latitude}`;

    const coords = [
      toLngLat(origin),
      // ... tira o conteudo do array. Ex: ...["teste"] resulta em "teste"
      ...(waypoint ? [toLngLat(waypoint)] : []),
      toLngLat(destination),
    ].join(";"); // nao adiciona ; no ultimo

    const url =
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` +
      `${coords}` +
      `?overview=full&geometries=geojson&alternatives=true&steps=true`;

    try {
      const response = await fetch(url);
      const data: OSRMResponse = await response.json();

      if (!data.routes || data.routes.length === 0) {
        console.error("No route found");
        return null;
      }
      const bestRoute = this.getBestRoute(data.routes);

      return bestRoute;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  }

  private removeRoute(): void {
    if (this._route) {
      this.map.removeLayer(this._route);
      this._route = null;
      this._routeData = null;
    }
  }
}
