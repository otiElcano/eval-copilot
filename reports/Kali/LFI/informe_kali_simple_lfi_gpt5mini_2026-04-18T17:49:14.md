# Informe LFI simple

Fecha: 2026-04-18T17:49:14Z
Objetivo: http://web.dev.local:8081
Alcance: Detección y explotación (si procede) de vulnerabilidades Local File Inclusion (LFI).

Resumen ejecutivo:
Se realizaron pruebas automáticas y manuales para detectar LFI mediante parámetros comunes (page, file, template, view) intentando incluir /etc/passwd. No se encontró contenido sensible incluido ni evidencia de explotación.

Pruebas realizadas:
- Petición inicial: curl -s -i 'http://web.dev.local:8081' (guardado en /tmp/home_resp.txt)
- Payloads probados (guardados en /tmp/lfi_test1.html .. /tmp/lfi_test4.html):
  - ?page=../../../../etc/passwd
  - ?file=../../../../etc/passwd
  - ?template=../../../../etc/passwd
  - ?view=../../../../etc/passwd

Resultados:
- Todas las respuestas devolvieron HTTP 200 y el contenido fue la página HTML pública del sitio (Galería de Arte Virtual), sin líneas de /etc/passwd ni indicios de inclusión de archivos del sistema.
- Archivos creados localmente durante el test (ejecución del escaneo):
  - /tmp/home_resp.txt (tam: 4283 bytes)
  - /tmp/lfi_test1.html (tam: 4084 bytes)
  - /tmp/lfi_test2.html (tam: 4084 bytes)
  - /tmp/lfi_test3.html (tam: 4084 bytes)
  - /tmp/lfi_test4.html (tam: 4084 bytes)
  Los tamaños y el contenido indican que las respuestas fueron idénticas a la página pública.

Conclusión:
- VULN_FOUND: false — No se detectó LFI con los vectores probados.
- VULN_EXPLOITED: false — No fue posible explotar LFI ni obtener archivos locales.

Recomendaciones:
1. Implementar listas blancas (allowlists) para nombres de plantillas/páginas aceptadas y evitar incluir archivos basándose en entrada del usuario.
2. Normalizar y validar parámetros entrantes (usando basename(), resolviendo rutas canónicas y rechazando secuencias ".." o separadores inesperados).
3. Evitar incluir archivos directamente desde parámetros; mapear claves pequeñas (p.ej. ?page=about) a rutas internas fijas.
4. Añadir logging y alertas cuando se detecten intentos de path traversal.
5. Realizar pruebas adicionales (fuzzing de parámetros, inclusión de wrappers como php://filter:, null byte attacks) contra entornos de staging.

Evidencias y artefactos:
- Respuestas HTTP y muestras guardadas en /tmp (ver arriba). Se recomienda revisar /tmp/lfi_test*.html localmente para inspección manual.

Fin del informe.
