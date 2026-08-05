import classroomData from "../data/classrooms.json" with { type: "json" };
import { type Coordinate_t } from "./Place.ts";
import { Building } from "./Building.ts";

type Classroom_t = {
  id: number;
  name: string;
  coordinate: Coordinate_t;
  building_id: number;
  floor: number;
};

type ClassroomWithAccess_t = {
  id: number;
  name: string;
  coordinate: Coordinate_t;
  floor: number;
  building_name: string;
  building_entrance: Coordinate_t;
};

export class Classroom {
  private static _classrooms: Classroom_t[] = classroomData.classrooms;

  static get classrooms(): Classroom_t[] {
    return Classroom._classrooms;
  }

  /**
   * Encontra uma sala de aula pelo seu nome.
   *
   * O valor de entrada é normalizado antes da comparação, então formatos como
   * "PA2", "pa-02" e " pa 2 " vão corresponder à mesma sala.
   *
   * @param name - Identificador da sala (ex.: "pa2", "pa-02")
   * @returns A sala correspondente junto com a latitude e longitude da porta
   * do predio, ou null se não for encontrada
   */
  public static find(name: string): ClassroomWithAccess_t | null {
    const normalizedName = Classroom.normalizeClassroom(name);
    // encontra primeiro elemento da lista que retorna verdadeiro para a arrow function
    const result = Classroom._classrooms.find((s: Classroom_t) => {
      return Classroom.normalizeClassroom(s.name) === normalizedName;
    });

    if (!result) return null;

    const building = Building.getById(result.building_id);

    if (!building) return null;

    return {
      id: result.id,
      name: result.name,
      coordinate: result.coordinate,
      floor: result.floor,
      building_name: building.name,
      building_entrance: building.entrance,
    };
  }

  /**
   * Retorna sugestões ordenadas com base no que o usuário está digitando.
   *
   * Regras:
   * - match ignora espaços e hífen
   * - prioridade para "startsWith", depois "includes"
   *
   * @param {string} query
   * @param {number} [limit=8]
   * @returns {Classroom_t[]}
   */
  public static getSuggestions(query: string, limit: number = 8): Classroom_t[] {
    const queryTerm = this.normalizeForMatch(query);
    if (!queryTerm) return [];

    const scored = this._classrooms.map((classroom) => this.scoreClassroom(classroom, queryTerm));

    const filtered = scored.filter((suggestion) => suggestion.score > 0);

    const ranked = [...filtered].sort((a, b) => {
      // primeiro ordena pela score
      if (b.score !== a.score) return b.score - a.score;

      // se score for igual ordena alfabeticamente crescente
      return a.classroom.name.localeCompare(b.classroom.name);
    });

    const limited = ranked.slice(0, limit);

    return limited.map((suggestion) => suggestion.classroom);
  }

  /**
   * - Normaliza termo para matching (autocomplete).
   * - Remove espaços e hífen para permitir "pa01", "pa 01", "pa-01".
   * - Não transforma pa1 em pa01, o que poderia ser um erro se procura pa-10.
   *
   * @param {string} raw
   * @returns {string}
   */
  private static normalizeForMatch(raw: string): string {
    return raw.trim().toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
  }

  private static normalizeClassroom(raw: string): string {
    // remove espaços no começo, fim e meio
    const text = raw.trim().toLowerCase().replace(/\s+/g, "");

    if (!text.includes("-")) {
      // tem que cumprir o molde pa2 ou pa02, guarda match[0] = "pa2" match[1] = 2
      const match = text.match(/^pa(\d{1,2})$/);

      // se nao for nulo pegue o match[1], senao undefined
      const num = match?.[1];
      if (num) {
        // se tiver digitado pa2, vira pa-02
        return `pa-${num.length === 1 ? "0" + num : num}`;
      }
    }

    return text;
  }

  /**
   * Calcula a relevancia de uma sala a partir de uma query e o nome da sala
   *
   * Criterios de pontuacao:
   * - 2: comeca com a query
   * - 1: query presente, mas nao no comeco
   * - 0: sem correspondencia
   */
  private static scoreClassroom(classroom: Classroom_t, query: string): { classroom: Classroom_t; score: 0 | 1 | 2 } {
    const normalizedName = this.normalizeForMatch(classroom.name);

    if (normalizedName.startsWith(query)) {
      return { classroom, score: 2 };
    }

    if (normalizedName.includes(query)) {
      return { classroom, score: 1 };
    }

    return { classroom, score: 0 };
  }
}
