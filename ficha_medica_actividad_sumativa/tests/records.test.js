import test from 'node:test';
import assert from 'node:assert/strict';
import { searchRecordsByLastName, upsertRecord } from '../js/records.js';

const original = [{
  rut: '123456785',
  nombres: 'Camila',
  apellidos: 'Soto Pérez',
  ciudad: 'Santiago',
}];

test('Registro: detecta duplicado sin sobrescribir', () => {
  const result = upsertRecord(original, { ...original[0], ciudad: 'Temuco' }, false);
  assert.equal(result.status, 'duplicate');
  assert.equal(result.records[0].ciudad, 'Santiago');
});

test('Registro: sobrescribe cuando se autoriza', () => {
  const result = upsertRecord(original, { ...original[0], ciudad: 'Temuco' }, true);
  assert.equal(result.status, 'overwritten');
  assert.equal(result.records[0].ciudad, 'Temuco');
});

test('Registro: agrega un RUT nuevo', () => {
  const result = upsertRecord(original, { rut: '111111111', nombres: 'Ana', apellidos: 'Rojas' }, false);
  assert.equal(result.status, 'created');
  assert.equal(result.records.length, 2);
});

test('Búsqueda: encuentra por coincidencia parcial de apellido sin distinguir mayúsculas', () => {
  const records = [
    ...original,
    { rut: '111111111', nombres: 'Ana', apellidos: 'Rojas Díaz' },
  ];
  assert.equal(searchRecordsByLastName(records, 'sOtO').length, 1);
  assert.equal(searchRecordsByLastName(records, 'DÍAZ').length, 1);
  assert.equal(searchRecordsByLastName(records, 'zz').length, 0);
});
