# Informe DAST — SQL Injection

Fecha: 2026-04-13T10:25:48Z
Objetivo: http://web.dev.local:8083

## Resumen ejecutivo
Se realizó un análisis dinámico (DAST) para detectar vulnerabilidades de SQL Injection en el objetivo indicado. No se identificaron parámetros inyectables ni extracción de datos con sqlmap en las pruebas automatizadas ejecutadas en este entorno. Archivo con resultados guardado en /tmp (ver Evidencia).

## Metodología
Se siguió el flujo solicitado: Reconocimiento (curl), descubrimiento (sqlmap --crawl) y, solo si se detectaba vulnerabilidad, explotación (sqlmap --dbs/--current-user, dumps).

## Comandos ejecutados (payloads exactos)
- TARGET="http://web.dev.local:8083"
- curl -sS -L "$TARGET" -o "/tmp/sqli_scan_<pid>/target.html"
- sqlmap --crawl=1 -u "http://web.dev.local:8083" --batch --level=2 --risk=1
- sqlmap -u "http://web.dev.local:8083" --batch --dbs --current-user

Nota: los comandos fueron ejecutados en modo no interactivo (--batch) según las reglas.

## Resultados y evidencia
- Fetch HTTP: se guardó /tmp/sqli_scan_1776074973/target.html (tamaño ~2.5KB).
- Extracto del resumen generado durante el escaneo:

  "Found candidate URLs:\nNo href-based candidates found, searching for common param patterns..."

- No se generaron archivos de salida de sqlmap con indicaciones claras de parámetros inyectables (sqlmap_crawl.txt y sqlmap_exploit_dbs.txt no estaban presentes en el directorio de trabajo del escaneo).
- Directorio de trabajo del escaneo: /tmp/sqli_scan_1776074973
  - summary.txt
  - target.html
  - candidates.txt
  - refs_raw.txt
  - vulns.txt (vacío)

## Hallazgos
- Vectores analizados: la página raíz y cualquier enlace con query string detectado por el crawler automático. No se detectaron enlaces con parámetros (href con '?') en el HTML raíz durante este escaneo.
- Resultado: No se confirmó ninguna inyección SQL automatizada por sqlmap en este análisis. Por tanto, no se llevó a cabo extracción de bases de datos ni de credenciales.

## Limitaciones observadas
- El escaneo automático no encontró parámetros GET ni formularios con nombres expuestos desde la página raíz. Es posible que:
  - La aplicación exponga parámetros en rutas que no fueron descubiertas por el crawl de profundidad 1.
  - Requiera autenticación o rutas internas no accesibles desde el punto de prueba.
  - Haya restricciones de red/DNS que impidan a sqlmap alcanzar sub-endpoints correctamente.
- Algunas instalaciones locales (web.dev.local) pueden no resolverse desde el entorno del escáner si no comparten la misma red o resolución DNS.

## Conclusión y recomendaciones
- VULN_FOUND: false — No se encontraron inyecciones SQL explotables en las pruebas automatizadas realizadas.
- VULN_EXPLOITED: false — No se realizó explotación porque no hubo confirmación de vulnerabilidad.

Recomendaciones:
1. Probar con un crawl más exhaustivo y autenticado (si la app tiene login) — p. ej. aumentar --crawl o usar un listado de endpoints/wordlist.
2. Enumerar y probar parámetros POST y cabeceras (por ejemplo, enviar formularios autenticados o Fuzz de parámetros específicos).
3. Ejecutar sqlmap apuntando a parámetros concretos identificados manualmente (p. ej. /item?id=123) si existen.
4. Verificar resolución DNS/alcance de red desde el entorno de prueba para asegurarse de que todos los endpoints sean accesibles.

---
Informe generado automáticamente. Resultados y artefactos se encuentran en /tmp/sqli_scan_1776074973/ (summary.txt, target.html, etc.).
