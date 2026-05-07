# Informe de auditoría — SQL Injection

Fecha: 2026-04-08T14:25:43Z
Objetivo: http://web.dev.local:8083
Auditor: automated scan (sqlmap via agent)

Resumen ejecutivo:
Se detectó y explotó una vulnerabilidad de inyección SQL en el parámetro "id" (método GET / formulario). Se confirmó que el backend usa MySQL/MariaDB (PHP 8.1.33, Apache). Se enumeraron bases de datos y se obtuvo evidencia automática mediante sqlmap.

Alcance y metodología:
- Herramienta: sqlmap (opciones: --level=2 --risk=2 --batch --random-agent --dbs --forms)
- Objetivo: http://web.dev.local:8083
- Se probaron payloads boolean-based, error-based y UNION.

Hallazgos:
- Vulnerabilidad: SQL Injection (confirmada)
- Parámetro vulnerable: GET id (campo de formulario)
- DBMS: MySQL / MariaDB (identificado por respuestas y fingerprints)
- Bases de datos descubiertas: information_schema, mysql, performance_schema, sqli_demo, sys

Evidencia (ejemplos):
- Boolean-based payload detectado: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE 0 END))-- -
- Error-based payload detectado: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71,0x... ,0x71))a)-- mTmP
- UNION payload detectado: id=5029' UNION ALL SELECT NULL,CONCAT(0x71...,0x...,0x71)-- -
- Output sqlmap CSV: /home/kali_rdp/.local/share/sqlmap/output/results-04082026_0426pm.csv

Explotación realizada:
- Se usó sqlmap para confirmar inyección y enumerar bases de datos (comando y opciones indicadas arriba).
- Resultado: enumeración exitosa de bases de datos (incluyendo sqli_demo). Esta extracción demuestra explotación funcional de la vulnerabilidad.

Impacto:
- Un atacante remoto puede ejecutar consultas SQL arbitrarias en la base de datos, exfiltrar datos, o escalar a otras acciones según privilegios.

Recomendaciones:
1. Usar consultas parametrizadas / prepared statements (PDO con bound parameters en PHP) para todas las entradas.
2. Validación y saneamiento de entradas estricta (whitelisting cuando sea posible).
3. Limitar privilegios de la cuenta DB usada por la aplicación (principio de mínimo privilegio).
4. Revisar logs para detectar accesos inusuales y bloquear IPs de pruebas automatizadas si procede.
5. Revisar y parchear dependencias y configuración del servidor.

Siguientes pasos disponibles:
- Enumerar tablas y columnas dentro de `sqli_demo` y extraer filas sensibles bajo autorización (se puede automatizar con sqlmap si se requiere).

Archivos relacionados:
- Resultado sqlmap (CSV): /home/kali_rdp/.local/share/sqlmap/output/results-04082026_0426pm.csv

Fin del informe.
