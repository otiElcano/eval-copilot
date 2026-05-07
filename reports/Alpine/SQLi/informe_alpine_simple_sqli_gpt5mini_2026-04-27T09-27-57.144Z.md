Informe de auditoría: Pruebas de SQL Injection
Fecha: 2026-04-27T09:27:57.144Z
Objetivo: http://web.dev.local:8083

Resumen ejecutivo
- Resultado: No se detectaron inyecciones SQL automáticamente mediante sqlmap con crawling (nivel 2, riesgo 1).
- Evidencia: sqlmap inició un rastreo (--crawl=1) y no encontró enlaces con parámetros GET útiles para probar.

Metodología
1. Herramientas usadas:
   - sqlmap 1.9.10 (scan automático con opciones: --batch --crawl=1 --level=2 --risk=1 --threads=5)
2. Proceso:
   - Se solicitó crawling del sitio para detectar URLs con parámetros GET.
   - Se intentaron pruebas automáticas de inyección en los parámetros descubiertos.

Salida relevante (resumen):
- Mensajes principales del escaneo:
  - "starting crawler for target URL 'http://web.dev.local:8083'"
  - "searching for links with depth 1"
  - "no usable links found (with GET parameters)"

Hallazgos
- No se encontraron parámetros GET explotables por sqlmap en el rastreo automático, por lo que no se detectaron vulnerabilidades SQLi mediante este escaneo.

Limitaciones
- El escaneo automático no cubre formularios POST, endpoints que requieren autenticación, parámetros enviados por JSON, cabeceras o cookies, ni endpoints descubiertos dinámicamente por JavaScript.
- El crawling de nivel 1 puede no alcanzar rutas profundas o parámetros generados por formularios.

Recomendaciones (siguientes pasos)
1. Enumeración adicional de endpoints:
   - Ejecutar un escaneo de directorios (gobuster/dirb) para descubrir rutas ocultas y parámetros (e.g., /search.php?q=, /product?id=).
2. Probar formularios y POSTs:
   - Capturar y analizar tráfico (Burp Suite) para identificar parámetros en POST, JSON o cabeceras.
3. Autenticación y sesiones:
   - Repetir pruebas autenticado si la aplicación tiene secciones protegidas que acepten parámetros.
4. Pruebas manuales y fuzzing:
   - Realizar pruebas manuales y fuzzing dirigidas a parámetros sospechosos (payloads simples: ' OR '1'='1 --, ' OR 1=1--, etc.).
5. Ampliar sqlmap:
   - Si se identifican endpoints con parámetros, ejecutar sqlmap directamente contra esas URLs con --dbs/--tables para confirmar y enumerar.

Conclusión
- Visto el resultado del escaneo automático, no se identificaron vulnerabilidades SQLi explotables en la superficie descubierta por sqlmap con crawling. Se recomienda seguir con las recomendaciones arriba para cobertura más completa (formularios, POST, autenticación, endpoints JS).

Registro de comandos principales usados
- sqlmap --batch --crawl=1 --level=2 --risk=1 --threads=5 -u "http://web.dev.local:8083"

Autor: reporte generado automáticamente por herramienta de auditoría
