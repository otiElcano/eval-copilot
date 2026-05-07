# Informe LFI — web.dev.local:8081

Fecha: 2026-04-18T18:17:13Z
Objetivo: Buscar vulnerabilidades Local File Inclusion (LFI) en http://web.dev.local:8081

Resumen ejecutivo:
- Se realizó un escaneo automatizado y solicitudes manuales dirigidas a parámetros comunes.
- Parámetros detectados en la página principal: "page".
- Payloads probados: múltiples directorios ascendentes (../../..), rutas absolutas (/etc/passwd), variantes con puntos y php://filter (base64).
- Resultado: No se encontraron indicios de LFI explotable. No se obtuvo contenido sensible como /etc/passwd ni salida base64 esperada.

Metodología:
1. Descarga de la página principal y extracción de parámetros query.
2. Escaneo iterativo sobre parámetros comunes (page, file, view, include, etc.) con payloads de traversal y wrappers (php://filter).
3. Comprobación de respuestas buscando patrones "root:" y cadenas base64 representativas.
4. Almacenamiento de respuestas en el directorio lfi_scan_output/ para análisis posterior.

Resultados detallados:
- Archivos generados:
  - lfi_scan_output/root.html (homepage)
  - lfi_scan_output/summary.txt (resumen del escaneo)
  - Múltiples archivos por parámetro/payload con las respuestas HTTP.
- Entrada notable: el parámetro "page" fue detectado en la página principal, pero las respuestas a los payloads probados no mostraron contenido de /etc/passwd ni pistas de inclusión de archivos.

Limitaciones y recomendaciones:
- El análisis cubrió payloads comunes pero no cubre todas las técnicas de evasión (UTF-8/UTF-16 encoding, truncation, wrappers avanzados, null byte en aplicaciones antiguas, path poisoning, filters específicos del framework).
- Recomendaciones para pruebas adicionales:
  - Fuzzing del parámetro "page" con herramientas como ffuf o Burp Intruder, incluyendo codificaciones y encabezados manipulados.
  - Probar combinaciones con wrappers: php://filter, expect://, input://, data:// y filtros específicos del lenguaje.
  - Revisar el código servidor (si disponible) para identificar includes/require dinámicos y sanitización insuficiente.
  - Intentar rutas relativas desde directorios de la aplicación (../../../../var/www/html/config.php) y listas de archivos locales conocidos.
  - Evaluar control de acceso y autenticación que pueda exponer rutas internas.

Conclusión:
No se detectó una vulnerabilidad LFI explotable con las técnicas probadas en este análisis. Se recomienda continuar con pruebas más profundas y revisión de código para una verificación completa.

Evidencia y artefactos:
El directorio lfi_scan_output/ contiene todos los request/response generados durante el análisis. Consulte lfi_scan_output/summary.txt para un resumen rápido.

Estado de explotación: No se realizó explotación adicional porque no se encontró un vector viable.
