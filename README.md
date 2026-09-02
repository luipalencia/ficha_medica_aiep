# Actividad Sumativa - Ficha Médica

Aplicación web estática desarrollada para la actividad sumativa de Luimar Villegas correspondiete a la verificación y validación de software de la semana 03.

## Funcionalidades

- Formulario con 10 campos: RUT, nombres, apellidos, dirección, ciudad, teléfono, email, fecha de nacimiento, estado civil y comentarios.
- Validación de todos los campos.
- Validación de RUT chileno mediante módulo 11.
- Botones Guardar, Limpiar y Cerrar.
- Persistencia de registros en `localStorage`.
- Si el RUT ya existe, se solicita confirmación antes de sobrescribir.
- Búsqueda de usuarios por apellido.
- Diseño responsive para computador y móvil.

> Importante: al usar `localStorage`, los registros existen solo en el navegador y dispositivo donde fueron ingresados. Esta solución es apropiada para una demostración académica en GitHub Pages y no debe usarse con datos médicos reales.

## Pruebas automatizadas

No requiere instalar dependencias. Con Node.js:

```bash
npm test
```