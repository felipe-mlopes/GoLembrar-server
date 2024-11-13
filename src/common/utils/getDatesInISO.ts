export function getDatesInISO(): {
  startOfDay: string;
  endOfDay: string;
} {
  function getFirstHourOfDay(date: Date): string {
    date.setHours(0, 0, 0, 0);
    return new Date(date.getTime()).toISOString();
  }

  function getLastHourOfDay(date: Date): string {
    date.setHours(23, 59, 0, 0); // Define para 23:59 com segundos zerados
    return new Date(date.getTime()).toISOString();
  }

  const today = new Date();

  const startOfDay = getFirstHourOfDay(new Date(today));
  const endOfDay = getLastHourOfDay(new Date(today));

  return {
    startOfDay,
    endOfDay,
  };
}
