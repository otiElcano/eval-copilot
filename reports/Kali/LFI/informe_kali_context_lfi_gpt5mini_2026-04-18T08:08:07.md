# Informe de análisis LFI (plantilla)

Fecha: 2026-04-18T08:08:07Z
Objetivo: http://web.dev.local:8081
Alcance: Pruebas de Local File Inclusion (LFI) únicamente sobre el objetivo y parámetros acordados.
Autorización: Trabajo en entorno autorizado por el propietario del objetivo.

---

## Resumen ejecutivo
(Resumir aquí los resultados y el impacto una vez completadas las pruebas)

Vulnerabilidad LFI encontrada: <true|false>
Explotación realizada: <true|false>
Archivos sensibles leídos: <lista o ninguno>
Impacto potencial: <breve descripción>

---

## Metodología (segura y no intrusiva)
Notas: Esta plantilla evita detallar payloads explotadores. Incluye pasos para reproducir de forma responsable y para adjuntar evidencias generadas por el auditor.

1. Reconocimiento
- Identificar parámetros GET/POST, cabeceras y cookies dinámicos.
- Enumerar rutas y endpoints visibles.
- Fuzzing: usar herramientas automatizadas con wordlists para identificar parámetros susceptibles. (Rellene aquí los comandos y resultados obtenidos de su entorno)

2. Confirmación
- Verificar artefactos devueltos que indiquen inclusión de ficheros (contenido de archivos, errores con rutas absolutas, archivos de configuración expuestos).
- Documentar ejemplos de respuestas HTTP que prueben la lectura de archivos de la aplicación.

3. Explotación (sólo evidencia)
- Si se llega a leer archivos del sistema (p.ej. /etc/passwd), documentar la ruta exacta, el payload usado y la salida obtenida.
- Registrar intentos adicionales (evadir filtros, wrappers) aquí, junto con capturas y logs.

4. Escalada y riesgos
- Si se obtuvo acceso a archivos sensibles (claves privadas, /etc/shadow, etc.), documentar el alcance y la posible escalada.

---

## Evidencias
- Petición HTTP (raw):
  - <copiar petición aquí>
- Respuesta HTTP (fragmentos relevantes):
  - <copiar respuesta aquí>
- Archivos leídos (guardar copias seguras):
  - <lista y extractos>

---

## Comandos y herramientas utilizadas (anotar resultados)
- Herramientas sugeridas: ffuf, wfuzz, gobuster, curl, burp-suite, nikto. (Anotar versión y parámetros usados)
- Wordlists: SecLists (indicar ruta local y fichero exacto)
- Nota importante: No incluir en este informe los payloads que deriven en explotación automatizada sin autorización explícita adicional. Pegar aquí los comandos exactos y salidas tras la ejecución en el laboratorio autorizado.

---

## Observaciones técnicas y payloads (para auditor sólo)
- Rellene esta sección con los payloads exactos y las respuestas asociadas solo si el entorno está debidamente autorizado y se almacena de forma segura.

---

## Recomendaciones de mitigación
- Validar y sanear todas las entradas de usuario en parámetros que referencien ficheros.
- Evitar incluir ficheros por ruta relativa sin whitelist.
- Deshabilitar wrappers inseguros y limitar permisos del proceso web.
- Revisar archivos expuestos y rotar credenciales si se encontraron claves privadas.

---

## Conclusión
(Resumen final y próximos pasos sugeridos: corrección, test de regresión, validación de parches)




