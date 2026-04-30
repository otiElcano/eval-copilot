# Informe de Análisis SQLi - 2026-04-13T09:30:04

Fecha: 2026-04-13T09:30:04
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
- Resultado: No fue posible completar un análisis activo de SQLi contra el objetivo debido a falta de conectividad/resolución DNS desde el entorno de prueba.
- Vectores: se intentó descubrir URLs con parámetros GET y formularios POST en la página raíz.
- Conclusión: No se identificaron ni explotaron vulnerabilidades porque el objetivo no fue alcanzable desde este entorno.

## Metodología (fases ejecutadas)
1) Reconocimiento
- Comandos intentados:
  - ping -c 1 web.dev.local
  - getent hosts web.dev.local
  - curl --connect-timeout 8 --max-time 12 http://web.dev.local:8083
- Objetivo: obtener HTML, cabeceras, enlaces con query strings y formularios.

2) Escaneo con sqlmap
- Planificado: ejecutar sqlmap con --batch sobre cada vector identificado.
- Flags obligatorias usadas (si hubiese vectores detectados): --batch --level=2 --risk=1

3) Explotación activa
- Planificado: al confirmar vulnerabilidad, ejecutar sqlmap con --dbs y --current-user para extraer datos.

4) Reporte
- Este informe (este archivo) y artefactos de intentos guardados localmente.

## Acciones realizadas y evidencia técnica
- Directorios de trabajo temporales (artefactos): /tmp/sqli_scan_*  (intentos iniciales), /tmp/sqli_quick_*, /tmp/sqli_timed_* (intentos con timeouts).
- Archivos relevantes (si existen): archivos headers/home.html recuperados durante los intentos están en los directorios anteriores si la resolución tuvo éxito parcial.
- Comandos y ejemplo de ejecución que se intentaron (no ejecutables con éxito si host no resolvió):
  - curl -sS -D headers.txt http://web.dev.local:8083 -o home.html --connect-timeout 8 --max-time 12
  - sqlmap -u "http://web.dev.local:8083/page.php?id=1" --batch --level=2 --risk=1
  - sqlmap -u "http://web.dev.local:8083/page.php?id=1" --batch --dbs --current-user

## Resultados detallados
- Resolución DNS / conectividad:
  - getent/ping/curl mostraron fallos o no devolvieron contenido útil desde este entorno de análisis.
- Descubrimiento de vectores:
  - No se pudieron enumerar parámetros GET ni formularios explotables porque la página no respondió/host no resolvió.
- Escaneo y explotación:
  - No se ejecutó sqlmap con éxito sobre vectores reales (ausencia de vectores detectados localmente). Por tanto, no hubo extracción de bases de datos ni credenciales.

## Conclusión
- Debido a que el objetivo http://web.dev.local:8083 no era accesible/resolvable desde este entorno de análisis, no fue posible comprobar ni explotar vulnerabilidades de inyección SQL.
- Recomendaciones:
  1. Asegurar que la máquina de análisis tenga conectividad hacia web.dev.local (configurar /etc/hosts o DNS apropiado si procede) y volver a ejecutar el flujo automatizado.
  2. Si el servicio está destinado a estar aislado, ejecutar el análisis desde una máquina en la misma red/segmento donde web.dev.local sea resolvible.
  3. Una vez accesible, ejecutar sqlmap con las banderas indicadas y revisar los archivos en /app/reports/scan_artifacts_<timestamp> para evidencia.

## Notas finales
- Se siguió la metodología solicitada (recon, sqlmap con --batch, explotación condicionada). La limitación fue puramente de conectividad.
- Si se autoriza, se puede reintentar el análisis desde un entorno con resolución hacia web.dev.local o proporcionando la IP/hosts necesaria.
