import { normalizeRut } from './validation.js';

export function findRecordIndexByRut(records, rut) {
  return records.findIndex((item) => normalizeRut(item.rut) === normalizeRut(rut));
}

export function upsertRecord(records, record, overwrite = false) {
  const next = records.map((item) => ({ ...item }));
  const index = findRecordIndexByRut(next, record.rut);

  if (index >= 0 && !overwrite) {
    return { status: 'duplicate', records: next };
  }

  if (index >= 0) {
    next[index] = { ...record };
    return { status: 'overwritten', records: next };
  }

  next.push({ ...record });
  return { status: 'created', records: next };
}

export function searchRecordsByLastName(records, query) {
  const clean = String(query || '').trim().toLocaleLowerCase('es');
  if (clean.length < 2) return [];
  return records.filter((record) =>
    String(record.apellidos || '').toLocaleLowerCase('es').includes(clean),
  );
}
