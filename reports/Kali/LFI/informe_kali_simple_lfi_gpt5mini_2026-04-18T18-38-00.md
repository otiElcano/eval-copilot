# Informe de análisis LFI

Fecha (UTC): 2026-04-18T18:38:00
Objetivo: http://web.dev.local:8081
Alcance: búsqueda de Local File Inclusion (LFI) y, si procede, explotación.

Resumen ejecutivo:
- Pruebas automatizadas de LFI realizadas contra parámetros comunes: page, file, template, include, lang, view.
- Se probaron rutas de directory traversal con profundidades 1..8 y sufijos nulos (%00), intentando leer /etc/passwd, /etc/hosts y /proc/self/environ.
- Resultados: no se detectó contenido sensible (por ejemplo, entradas "root:") en las respuestas obtenidas.

Metodología:
- Se ejecutó un script de curl que hizo peticiones a combinaciones de parámetros, archivos objetivo y profundidades de traversal.
- Salida completa guardada en: /app/reports/lfi_scan_output.txt

Hallazgos:
- No se encontraron evidencias de LFI (no se halló /etc/passwd ni variables de entorno expuestas).
- No fue posible explotar LFI en el objetivo con los vectores probados.

Conclusión:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Recomendaciones:
- Validar en el servidor que todas las entradas que seleccionan ficheros se limpian y se restringen a rutas permitidas (whitelist).
- Adoptar rutas o identificadores en lugar de nombres de fichero directos y usar funciones seguras para resolver plantillas.
- Revisar logs de servidor para detectar accesos anómalos a ficheros sensibles.

Archivos generados:
- /app/reports/lfi_scan_output.txt (salida completa de las peticiones)

Fin del informe.
