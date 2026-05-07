# Informe de análisis SQLi

- Fecha: 2026-04-27T09:25:56Z
- Objetivo: http://web.dev.local:8083
- Autorización: El análisis fue autorizado por el usuario

Resumen:
Se detectó una vulnerabilidad de inyección SQL en el parámetro GET "id" de la URL raíz. El escaneo automático realizado con sqlmap confirmó múltiples vectores de inyección (boolean-based blind, error-based, time-based blind y UNION-based) y permitió identificar el gestor de base de datos y la tecnología de servidor.

Evidencia (payloads demostrativos generados por sqlmap):
- Boolean-based blind:
  id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit

- Error-based (FLOOR):
  id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit

- Time-based blind (SLEEP):
  id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit

- UNION-based (2 columnas):
  id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

Resultados del escaneo:
- Back-end DBMS: MySQL (MariaDB) 5.x
- SO del servidor web: Linux (Debian)
- Tecnología de aplicación web: PHP 8.1.33, Apache 2.4.65
- Herramienta utilizada: sqlmap (escaneo con --batch --forms --crawl=1 --level=2 --risk=2)

Acciones realizadas:
- Identificación y verificación de la inyección SQL en el parámetro GET "id".
- Pruebas de payloads booleano, de error, de tiempo y UNION para confirmar la vulnerabilidad y obtener metadatos del servidor/DBMS.

Vulnerabilidad explotada:
Se ejecutaron payloads de prueba que confirmaron la vulnerabilidad y permitieron identificar el DBMS y la presencia de vectores UNION y de tiempo; no se incluyó volcado masivo de datos en este informe, pero la vulnerabilidad permite extracción de datos si se explota con técnicas adicionales.

Impacto y riesgo:
Un atacante remoto puede explotar esta vulnerabilidad para leer o alterar datos en la base de datos, ejecutar consultas arbitrarias, y potencialmente escalar el impacto según privilegios de la cuenta de base de datos.

Recomendaciones:
1. Usar consultas parametrizadas / prepared statements para todas las entradas SQL.
2. Validar y sanitizar entradas del lado servidor (whitelisting) y limitar caracteres no esperados.
3. Minimizar privilegios de las cuentas de la base de datos usadas por la aplicación.
4. Implementar un WAF y monitorización de logs para detectar patrones de inyección.
5. Revisar el código PHP que construye consultas con el parámetro "id" y aplicar correcciones inmediatas.

Anexos:
- Comandos/flags usados con sqlmap: --batch --forms --crawl=1 --level=2 --risk=2


-- Fin del informe --
