/*
    FEITO POR LORENZO PRIEBE PARA O PROJETO UFPR NAVIGATOR, somente os nomes das variaveis
    foram traduzidos para ingles
*/

/**
 * Converte uma quantia de segundos em minutos, aproximada para 2 casas decimais
 *
 * @returns O tempo convertido em minutos
 */
export function secToMin(seconds: number): number {
  seconds = seconds / 60;
  return Math.round(seconds * 100) / 100;
}

/**
 * Recebe uma quantia em segundos e converte em uma string no formato Xmin
 *
 * @returns Uma string no formato Xmin
 */
export function formatDuration(seconds: number): string {
  seconds = seconds / 60;
  return Math.round(seconds) + "min";
}

/**
 * Recebe segundos e devolve a hora atual mais esses segundos
 *
 * @returns Uma string no formato H:MM
 */
export function addSecondsToCurrentTime(seconds: number): string {
  const now: Date = new Date();

  now.setSeconds(now.getSeconds() + seconds);

  const hour: number = now.getHours();
  const minute: number = now.getMinutes();

  if (minute < 10) return hour + ":" + "0" + minute;
  return hour + ":" + minute;
}
