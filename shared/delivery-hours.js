const DIRECT_START_MINUTES = 11 * 60;
const DIRECT_END_MINUTES = 15 * 60;

export function saoPauloMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return Number(value.hour) * 60 + Number(value.minute);
}

export function isDirectOrderAvailable(date = new Date()) {
  const minutes = saoPauloMinutes(date);
  return minutes >= DIRECT_START_MINUTES && minutes < DIRECT_END_MINUTES;
}

export function getDirectOrderMessage(date = new Date()) {
  return isDirectOrderAvailable(date)
    ? null
    : 'No almoço você pede direto no nosso site com mais praticidade. Agora, peça pelos apps.';
}
