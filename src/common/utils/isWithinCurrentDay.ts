export function isWithinCurrentDay(date: Date): boolean {
  // Ensure we have a Date object from the input
  const inputDate = new Date(date);

  // Format both dates to Brasilia timezone, keeping only the date part
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const inputDateStr = formatter.format(inputDate);
  const todayStr = formatter.format(new Date());

  // Compare the formatted dates
  return inputDateStr === todayStr;
}
