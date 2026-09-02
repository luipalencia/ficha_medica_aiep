import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRut,
  isValidBirthDate,
  isValidChileanMobile,
  isValidEmail,
  isValidRut,
  validateMedicalRecord,
} from '../js/validation.js';

test('RUT: acepta un RUT válido y rechaza uno inválido', () => {
  assert.equal(isValidRut('12.345.678-5'), true);
  assert.equal(isValidRut('12.345.678-9'), false);
});

test('RUT: formatea correctamente', () => {
  assert.equal(formatRut('123456785'), '12.345.678-5');
});

test('Teléfono: acepta celular chileno con y sin código país', () => {
  assert.equal(isValidChileanMobile('+56 9 1234 5678'), true);
  assert.equal(isValidChileanMobile('912345678'), true);
  assert.equal(isValidChileanMobile('221234567'), false);
});

test('Email: valida estructura básica', () => {
  assert.equal(isValidEmail('persona@correo.cl'), true);
  assert.equal(isValidEmail('persona@correo'), false);
});

test('Fecha de nacimiento: rechaza fechas futuras', () => {
  const today = new Date('2026-08-31T12:00:00');
  assert.equal(isValidBirthDate('1995-03-10', today), true);
  assert.equal(isValidBirthDate('2027-01-01', today), false);
});

test('Registro completo: sin errores con datos válidos', () => {
  const errors = validateMedicalRecord({
    rut: '12.345.678-5',
    nombres: 'Camila Andrea',
    apellidos: 'Soto Pérez',
    direccion: 'Av. Providencia 1234',
    ciudad: 'Santiago',
    telefono: '+56 9 1234 5678',
    email: 'camila@correo.cl',
    fechaNacimiento: '1995-03-10',
    estadoCivil: 'Soltero/a',
    comentarios: 'Control general.',
  });
  assert.deepEqual(errors, {});
});

test('Registro incompleto: informa errores por todos los campos inválidos', () => {
  const errors = validateMedicalRecord({
    rut: '1-1',
    nombres: '1',
    apellidos: '',
    direccion: 'x',
    ciudad: '2',
    telefono: '123',
    email: 'correo',
    fechaNacimiento: '2099-01-01',
    estadoCivil: '',
    comentarios: '',
  });
  assert.deepEqual(Object.keys(errors).sort(), [
    'apellidos', 'ciudad', 'comentarios', 'direccion', 'email', 'estadoCivil',
    'fechaNacimiento', 'nombres', 'rut', 'telefono',
  ].sort());
});
