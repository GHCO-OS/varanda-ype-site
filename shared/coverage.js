export function normalizeCep(value) {
  const cep = String(value ?? '').replace(/\D/g, '');
  return /^\d{8}$/.test(cep) ? cep : null;
}

export function distanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const rad = value => value * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
