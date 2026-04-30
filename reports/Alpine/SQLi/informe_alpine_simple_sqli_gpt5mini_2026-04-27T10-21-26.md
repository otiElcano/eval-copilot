# Informe de auditoría: SQL Injection

- Objetivo: http://web.dev.local:8083
- Fecha (UTC): 2026-04-27T10:21:26Z
- Escaneo realizado con: sqlmap 1.9.10 (options: --forms --batch --level=2 --risk=2)

Resumen ejecutivo
-----------------
VULN_FOUND: true
VULN_EXPLOITED: true

Se detectó una vulnerabilidad de SQL Injection en el parámetro GET "id" de la URL raíz (/). La vulnerabilidad fue confirmada y parcialmente explotada con sqlmap para fingerprinting del back-end (identificación de DBMS y del servidor web). No se descargaron ni volcaron datos sensibles adicionales para minimizar el impacto: la explotación se limitó a confirmación y enumeración no destructiva.

Detalles técnicos
-----------------
- Punto de inyección: HTTP GET parameter "id" (form encontrado: GET http://web.dev.local:8083?id=&Submit=Submit)
- Tipos de inyección detectados:
  - boolean-based blind
  - error-based (MySQL)
  - time-based blind (SLEEP)
  - UNION-based (generic UNION query)

- Ejemplos de payloads observados (extraídos de la salida de sqlmap):
  - Boolean-based: id=4153' OR NOT 6008=6008-- KHZI
  - Error-based: id=4153' OR (SELECT 9928 FROM(SELECT COUNT(*),CONCAT(0x7178...,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- aUPR
  - Time-based: id=4153' AND (SELECT 6369 FROM (SELECT(SLEEP(5)))lKPY)-- nHYh
  - UNION-based: id=4153' UNION ALL SELECT CONCAT(0x7178...,0x...),NULL-- -

- Fingerprinting / enumeración realizada por sqlmap:
  - Back-end DBMS: MySQL >= 5.0 (MariaDB fork)
  - Web server OS: Linux Debian
  - Web application: Apache 2.4.65, PHP 8.1.33

- Resultado del escaneo: sqlmap respondió que se reanunciaron múltiples vectores de inyección y preguntó por explotación; se eligió permitir la explotación parcial (confirmación y fingerprinting).
- Ruta del CSV de resultados (sqlmap): /home/kali_rdp/.local/share/sqlmap/output/results-04272026_1222pm.csv

Impacto
-------
Con una inyección de este tipo un atacante puede, según el vector y privilegios de la BD:
- Exfiltrar datos sensibles de las tablas (usuarios, credenciales, datos personales)
- Ejecutar consultas arbitrarias y, en algunos casos, escribir archivos si el DBMS y la configuración lo permiten
- Escalar a compromisos mayores si se combinan con otras fallas (p. ej. credenciales débiles)

Recomendaciones
---------------
1. Uso de consultas parametrizadas / prepared statements para todas las entradas que interactúen con la base de datos.
2. Validación y saneamiento de entradas (limitar tipos y longitudes; rechazar caracteres no esperados).
3. Revisar y aplicar el principio de menor privilegio en cuentas de BD (evitar usuarios con permisos excesivos).
4. Implementar WAF o reglas de bloqueo para patrones SQL maliciosos mientras se corrige el código.
5. Mantener software actualizado (PHP/Apache/DBMS) y revisar módulos/plugins expuestos.
6. Realizar pruebas adicionales de auditoría para enumerar tablas/columnas sólo bajo autorización explícita para minimizar impacto.

Acciones realizadas
------------------
- Escaneo con sqlmap y detección de inyección en parámetro 'id'.
- Explotación controlada para fingerprinting (identificación de DBMS, servidor web y tecnología de la aplicación).

Conclusión
----------
Se ha identificado una vulnerabilidad SQL Injection explotable en el parámetro GET "id". Se recomienda corregir el código que construye consultas SQL con ese parámetro y aplicar las medidas de mitigación listadas arriba antes de permitir tráfico en producción.

Informe generado automáticamente por auditoría con sqlmap.
