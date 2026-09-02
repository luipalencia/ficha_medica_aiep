export function normalizeRut(value = '') {
  return String(value).replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(value = '') {
  const clean = normalizeRut(value);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

export function isValidRut(value = '') {
  const clean = normalizeRut(value);
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return dv === expected;
}

export function isValidPersonName(value = '') {
  const clean = String(value).trim();
  return clean.length >= 2 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(clean);
}

export function isValidAddress(value = '') {
  const clean = String(value).trim();
  return clean.length >= 5 && clean.length <= 120;
}

export function isValidCity(value = '') {
  const clean = String(value).trim();
  return clean.length >= 2 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(clean);
}

export function normalizePhone(value = '') {
  return String(value).replace(/\D/g, '');
}

export function isValidChileanMobile(value = '') {
  const digits = normalizePhone(value);
  return /^569\d{8}$/.test(digits) || /^9\d{8}$/.test(digits);
}

export function isValidEmail(value = '') {
  const clean = String(value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}

export function isValidBirthDate(value = '', today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const minDate = new Date(`${today.getFullYear() - 120}-01-01T12:00:00`);
  const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  return date >= minDate && date <= endToday;
}

export function isValidComments(value = '') {
  const clean = String(value).trim();
  return clean.length >= 3 && clean.length <= 500;
}

export function validateMedicalRecord(record) {
  const errors = {};

  if (!isValidRut(record.rut)) errors.rut = 'Ingrese un RUT chileno válido.';
  if (!isValidPersonName(record.nombres)) errors.nombres = 'Ingrese nombres válidos (mínimo 2 caracteres).';
  if (!isValidPersonName(record.apellidos)) errors.apellidos = 'Ingrese apellidos válidos (mínimo 2 caracteres).';
  if (!isValidAddress(record.direccion)) errors.direccion = 'Ingrese una dirección de al menos 5 caracteres.';
  if (!isValidCity(record.ciudad)) errors.ciudad = 'Ingrese una ciudad válida.';
  if (!isValidChileanMobile(record.telefono)) errors.telefono = 'Use un celular chileno válido, por ejemplo +56 9 1234 5678.';
  if (!isValidEmail(record.email)) errors.email = 'Ingrese un correo electrónico válido.';
  if (!isValidBirthDate(record.fechaNacimiento)) errors.fechaNacimiento = 'Ingrese una fecha válida, no futura y dentro de los últimos 120 años.';
  if (!String(record.estadoCivil || '').trim()) errors.estadoCivil = 'Seleccione un estado civil.';
  if (!isValidComments(record.comentarios)) errors.comentarios = 'Ingrese un comentario de 3 a 500 caracteres.';

  return errors;
}
