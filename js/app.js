import {
  formatRut,
  normalizeRut,
  validateMedicalRecord,
} from './validation.js';
import { searchRecordsByLastName } from './records.js';

const STORAGE_KEY = 'aiep_fichas_medicas_v1';

const form = document.querySelector('#medicalForm');
const appRoot = document.querySelector('#appRoot');
const closedPanel = document.querySelector('#closedPanel');
const globalMessage = document.querySelector('#globalMessage');
const searchInput = document.querySelector('#searchLastName');
const searchError = document.querySelector('#searchError');
const results = document.querySelector('#results');
const searchSummary = document.querySelector('#searchSummary');
const recordCount = document.querySelector('#recordCount');
const commentCounter = document.querySelector('#commentCounter');
const birthDateInput = document.querySelector('#fechaNacimiento');

const fields = [
  'rut', 'nombres', 'apellidos', 'direccion', 'ciudad', 'telefono',
  'email', 'fechaNacimiento', 'estadoCivil', 'comentarios',
];

function getRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function setRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  updateRecordCount();
}

function updateRecordCount() {
  const total = getRecords().length;
  recordCount.textContent = `${total} ${total === 1 ? 'registro' : 'registros'}`;
}

function setMessage(text, type = 'info') {
  globalMessage.textContent = text;
  globalMessage.className = `global-message ${type}`;
  if (text) globalMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearMessage() {
  globalMessage.textContent = '';
  globalMessage.className = 'global-message';
}

function getFormRecord() {
  return Object.fromEntries(fields.map((name) => [name, form.elements[name].value.trim()]));
}

function clearFieldError(name) {
  const input = form.elements[name];
  const error = document.querySelector(`#${name}Error`);
  input.classList.remove('invalid');
  input.removeAttribute('aria-invalid');
  if (error) error.textContent = '';
}

function setFieldError(name, message) {
  const input = form.elements[name];
  const error = document.querySelector(`#${name}Error`);
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  if (error) error.textContent = message;
}

function clearAllErrors() {
  fields.forEach(clearFieldError);
  searchError.textContent = '';
  searchInput.classList.remove('invalid');
  searchInput.removeAttribute('aria-invalid');
}

function renderValidationErrors(errors) {
  clearAllErrors();
  Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));

  const firstError = Object.keys(errors)[0];
  if (firstError) form.elements[firstError].focus();
}

function resetForm({ showMessage = true } = {}) {
  form.reset();
  clearAllErrors();
  commentCounter.textContent = '0/500';
  clearSearch();
  if (showMessage) setMessage('Formulario limpiado correctamente.', 'info');
  document.querySelector('#rut').focus();
}

function clearSearch() {
  searchInput.value = '';
  searchError.textContent = '';
  searchInput.classList.remove('invalid');
  searchSummary.textContent = '';
  results.innerHTML = '';
}

function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderResults(records, label = '') {
  results.innerHTML = '';
  const total = records.length;
  searchSummary.textContent = label || `${total} ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`;

  if (!total) {
    results.innerHTML = '<div class="empty-state">No se encontraron registros para la búsqueda indicada.</div>';
    return;
  }

  records
    .sort((a, b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es'))
    .forEach((record) => {
      const card = document.createElement('article');
      card.className = 'result-card';
      card.innerHTML = `
        <div>
          <h3>${sanitizeText(record.nombres)} ${sanitizeText(record.apellidos)}</h3>
          <p class="result-meta">RUT: ${sanitizeText(formatRut(record.rut))} · ${sanitizeText(record.ciudad)} · ${sanitizeText(record.telefono)}</p>
        </div>
        <div class="result-actions">
          <button class="btn btn--ghost" type="button" data-rut="${sanitizeText(normalizeRut(record.rut))}">Cargar ficha</button>
        </div>
      `;
      results.appendChild(card);
    });
}

function searchByLastName() {
  const query = searchInput.value.trim();
  searchError.textContent = '';
  searchInput.classList.remove('invalid');
  searchInput.removeAttribute('aria-invalid');

  if (query.length < 2) {
    searchInput.classList.add('invalid');
    searchInput.setAttribute('aria-invalid', 'true');
    searchError.textContent = 'Ingrese al menos 2 caracteres para buscar.';
    searchInput.focus();
    return;
  }

  const matches = searchRecordsByLastName(getRecords(), query);

  renderResults(matches, `${matches.length} ${matches.length === 1 ? 'registro coincide' : 'registros coinciden'} con “${query}”.`);
}

function showAll() {
  const records = getRecords();
  searchError.textContent = '';
  searchInput.classList.remove('invalid');
  renderResults(records, `${records.length} ${records.length === 1 ? 'registro guardado' : 'registros guardados'} en este navegador.`);
}

function loadRecord(rut) {
  const record = getRecords().find((item) => normalizeRut(item.rut) === normalizeRut(rut));
  if (!record) {
    setMessage('No fue posible cargar el registro seleccionado.', 'error');
    return;
  }

  fields.forEach((name) => {
    form.elements[name].value = name === 'rut' ? formatRut(record[name]) : record[name];
    clearFieldError(name);
  });
  commentCounter.textContent = `${form.elements.comentarios.value.length}/500`;
  setMessage('Registro cargado. Al guardar, la aplicación solicitará confirmación antes de sobrescribirlo.', 'info');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessage();

  const record = getFormRecord();
  const errors = validateMedicalRecord(record);
  if (Object.keys(errors).length) {
    renderValidationErrors(errors);
    setMessage('Revise los campos marcados antes de guardar.', 'error');
    return;
  }

  clearAllErrors();
  record.rut = normalizeRut(record.rut);
  const records = getRecords();
  const existingIndex = records.findIndex((item) => normalizeRut(item.rut) === record.rut);

  if (existingIndex >= 0) {
    const shouldOverwrite = window.confirm('El RUT ingresado ya existe. ¿Desea sobrescribir el registro guardado?');
    if (!shouldOverwrite) {
      setMessage('Operación cancelada. El registro existente no fue modificado.', 'info');
      return;
    }
    records[existingIndex] = { ...record, updatedAt: new Date().toISOString() };
    setRecords(records);
    setMessage('Registro sobrescrito correctamente.', 'success');
  } else {
    records.push({ ...record, createdAt: new Date().toISOString() });
    setRecords(records);
    setMessage('Nuevo registro guardado correctamente.', 'success');
  }

  form.elements.rut.value = formatRut(record.rut);
});

document.querySelector('#clearBtn').addEventListener('click', () => {
  resetForm();
});

document.querySelector('#closeBtn').addEventListener('click', () => {
  const shouldClose = window.confirm('¿Desea cerrar la aplicación? El formulario se limpiará, pero los registros guardados permanecerán en este navegador.');
  if (!shouldClose) {
    setMessage('Cierre cancelado. Puede continuar trabajando.', 'info');
    return;
  }

  resetForm({ showMessage: false });
  appRoot.hidden = true;
  closedPanel.hidden = false;
  closedPanel.querySelector('button').focus();
});

document.querySelector('#reopenBtn').addEventListener('click', () => {
  closedPanel.hidden = true;
  appRoot.hidden = false;
  clearMessage();
  document.querySelector('#rut').focus();
});

document.querySelector('#searchBtn').addEventListener('click', searchByLastName);
document.querySelector('#showAllBtn').addEventListener('click', showAll);

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchByLastName();
  }
});

results.addEventListener('click', (event) => {
  const button = event.target.closest('[data-rut]');
  if (button) loadRecord(button.dataset.rut);
});

form.addEventListener('input', (event) => {
  const { name } = event.target;
  if (fields.includes(name)) clearFieldError(name);
  if (name === 'comentarios') commentCounter.textContent = `${event.target.value.length}/500`;
});

document.querySelector('#rut').addEventListener('blur', (event) => {
  if (event.target.value.trim()) event.target.value = formatRut(event.target.value);
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
birthDateInput.max = `${yyyy}-${mm}-${dd}`;
birthDateInput.min = `${yyyy - 120}-01-01`;

updateRecordCount();
